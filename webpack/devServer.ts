import * as WebpackDevServer from 'webpack-dev-server';
import * as path from 'path';
import Certificates from './Certificates';
import {
  customConfig,
  hot,
} from './common';

const ROUTES_PREFIX = '';
const webpackDevHttpPort = (p => (isNaN(p) ? 8000 : p))(Number(customConfig.devServerPort));
const webpackDevHttpHost = '0.0.0.0';
const isHttps = !customConfig.noSSL;

const devServer: WebpackDevServer.Configuration = {
  hot,
  contentBase: path.resolve('..', 'build'),
  host: webpackDevHttpHost,
  port: webpackDevHttpPort,
  inline: true,
  overlay: true, // Show overlay errors
  https:
    isHttps
      ? Certificates.createHttpsEnv(['localhost'])
      : isHttps,
  lazy: false,
  historyApiFallback: true,
  disableHostCheck: true,
  clientLogLevel: 'info',

  stats: {
    colors: true,
    warningsFilter: /export .* was not found in/,
  },
};

const publicPath = `${ROUTES_PREFIX}/`;

export { devServer, publicPath };
