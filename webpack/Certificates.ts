import * as https from 'https';

const fs = require('fs');
const path = require('path');
const del = require('del');
const crypto = require('crypto');
// Warn: link to createCertificate (webpack certificate generator arm) can be changed or moved
const createCertificate = require('webpack-dev-server/lib/utils/createCertificate');

class Certificates {
  public static getInstance(): Certificates {
    if (!this._instance) {
      this._instance = new Certificates();
    }
    return this._instance;
  }
  private static _instance: Certificates | null = null;

  public createHttpsEnv(domains: string[]): https.ServerOptions {
    const fakeCert = this.get(domains);
    return {
      key: fakeCert,
      cert: fakeCert,
    };
  }

  private get(domains: string[]) {
    // Use a self-signed certificate if no certificate was configured.
    // Cycle certs every 24 hours
    const fileName = crypto.createHash('md5').update(domains.join('')).digest('hex');
    const certPath = path.join(__dirname, `./ssl/${fileName}.pem`);

    let certExists = fs.existsSync(certPath);

    if (certExists) {
      const certTtl = 1000 * 60 * 60 * 24;
      const certStat = fs.statSync(certPath);

      const now = new Date().getTime();

      // cert is more than 30 days old, kill it with fire
      if ((now - certStat.ctime) / certTtl > 30) {
        console.log(`SSL Certificate for domains ${domains.join(', ')} is more than 30 days old. Removing.`);

        del.sync([certPath], { force: true });

        certExists = false;
      }
    }

    if (!certExists) {
      this.generate(domains.join(', '), certPath);
    }

    return fs.readFileSync(certPath);
  }

  private generate(domainName: string, certPath: string) {
    const attrs = [{ name: 'commonName', value: domainName }];

    const pems = createCertificate(attrs);

    fs.writeFileSync(certPath, pems.private + pems.cert, {
      encoding: 'utf8',
    });
  }
}

const instance = Certificates.getInstance();

export default instance;
