class Config {
  public static get instance(): Config {
    this._instance = this._instance || new Config();
    return this._instance;
  }
  private static _instance: Config;

  public get isTradeEnabled(): boolean {
    return ['api.brox.club', 'test.brox.club', 'localhost'].indexOf(document.domain) >= 0;
  }

}

const instance = Config.instance;
export default instance;
