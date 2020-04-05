import { IHooks, IOwnProps as IStockTableProps } from '../controllers/StockTable';
import StockClientWS, { TCallback } from 'services/Api/StockClientWS';
import { rtrim } from '../util';
import StockTableInstance from 'classes/StockTableInstance';
import Api from 'services/Api/Api';

class StockLib {
  private readonly _baseUrl: string;
  private wsClient: StockClientWS;
  private _api: Api;

  constructor(url: string) {
    let useSsl = false;
    if (url.indexOf('http') === 0) {
      if (url.indexOf('https') === 0) {
        useSsl = true;
      }

      url = url.replace(/^https?\:/, '');
    }
    this._baseUrl = rtrim(`http${useSsl ? 's' : ''}://${url}`);
    this.wsClient = new StockClientWS(`ws${useSsl ? 's' : ''}://${url}`);

    this._api = new Api(this._baseUrl);
  }

  public async connect() {
    try {
      await this.wsClient.connect();
    } catch(error) {
      console.error('Websocket connection error: ', error);
      throw error;
    }
  }

  public tableInstance(
    root: HTMLElement,
    columns: IStockTableProps['columns'],
    portfolioId: number,
    hooks: IHooks,
  ) {
    return new StockTableInstance(this, root, columns, portfolioId, hooks);
  }

  public async listPortfolios(portfolioId?: number) {
    const response = await this._api.stock.listPortfolios();
    return response;
  }

  public async listPortfolioSecurities(portfolioId: number) {
    const response = await this._api.stock.listPortfolioSecurities(portfolioId);
    return response;
  }

  public subscribeMarkets(markets: string[], callback: TCallback): number {
    return this.wsClient.subscribeMarkets(markets, callback);
  }

  public unsubscribe(invocationId: number) {
    this.wsClient.unsubscribe(invocationId);
  }

  public get baseUrl() {
    return this._baseUrl;
  }

  public get api() {
    return this._api;
  }
}

export default StockLib;
