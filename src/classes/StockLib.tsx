import { IOwnProps as IStockTableProps } from '../controllers/StockTable';
import StockClientWS, { TCallback, TMarketsSubscription } from 'services/Api/StockClientWS';
import { rtrim } from '../util';
import StockTableInstance from 'classes/StockTableInstance';
import Api from 'services/Api/Api';
import PortfolioInstance from 'classes/PortfolioInstance';
// import SecuritiesBuffer from 'classes/Securities/SecuritiesBuffer';
import { TColumnsDefinition/*, TRow*/ } from 'classes/Securities/helpers';

/**
 * High order hooks (component external communication)
 */
export interface IHooks {
  /**
   * Reload request high order hook
   */
  onReloadRequested?(): void;
}

class StockLib {
  private readonly _baseUrl: string;
  private _wsClient: StockClientWS;
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
    this._wsClient = new StockClientWS(`ws${useSsl ? 's' : ''}://${url}`);

    this._api = new Api(this._baseUrl);
  }

  public async connect() {
    try {
      await this._wsClient.connect();
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

  public portfolioInstance(
    root: HTMLElement,
    columns: TColumnsDefinition,
    portfolioId: number,
    hooks: IHooks,
  ) {
    return new PortfolioInstance(this, root, columns, portfolioId, hooks);
  }

  public async listPortfolios(portfolioId?: number) {
    const response = await this._api.stock.listPortfolios();
    return response;
  }

  public async listPortfolioSecurities(portfolioId: number) {
    const response = await this._api.stock.listPortfolioSecurities(portfolioId);
    return response;
  }

  public subscribeMarkets(markets: TMarketsSubscription, callback: TCallback): number {
    return this._wsClient.subscribeMarkets(markets, callback);
  }

  public unsubscribe(invocationId: number) {
    this._wsClient.unsubscribe(invocationId);
  }

  public get baseUrl() {
    return this._baseUrl;
  }

  public get api() {
    return this._api;
  }

  public get socket() {
    return this._wsClient;
  }

  /*public securitiesBuffer(columns: TColumnsDefinition, securities: TRow[], portfolioId: number) {
    return new SecuritiesBuffer(columns, securities, portfolioId);
  }*/
}

export default StockLib;
