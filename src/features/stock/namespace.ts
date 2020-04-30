import { IAction, ICommunication, IPlainAction } from 'shared/types/redux';
import { IPlainFailAction } from 'shared/types/redux';
import { ISellSecurityRequest } from 'shared/types/requests';
import { IPortfolioSecurity } from 'shared/types/responses';
import { TMarketsSubscription } from 'services/Api/StockClientWS';
import { TColumnsDefinition, TRow } from 'classes/Securities/helpers';
import { TableColumns } from 'shared/types/app';

export interface IReduxState {
  communication: {
    loadSecurities: ICommunication;
    buySecurity: ICommunication;
    sellSecurity: ICommunication;
    loadPortfolio: ICommunication;
    listPortfolioSecurities: ICommunication;
    loadPortfolioWithSecurities: ICommunication;
  };
  data: {
    securities: ISecuritiy[];
    securitiesVersion: number;
    currentPortfolio: IPortfolio | null;
    buySecurityForm: IBuySecurityRequestPayload | null;
    sellSecurityForm: ISellSecurityRequestPayload | null;
    portfolioSecurities: IPortfolioSecurity[] | null;
    rows: IStockTableColumnData[];
    totals: TRow | null;
    plates: ISecurityPlate[] | null;
  };
}

export interface IPortfolio {
  id: number;
  name: string;
  createAt: string;
  updateAt: string;
  balance: number;
  startBalance: number;
}

export interface ISecuritiy {
  SECID: string;
  BOARDID: string;
  ISIN: string;
  LCURRENTPRICE: number;
  WAPRICE: number;
  SECNAME: string;
}

export interface IBuySecurityRow extends ISecuritiy {
  quantity: number;
}

interface ILoadSecuritiesPayload {
  filter?: string;
  fields?: string[];
}

export interface IBuyForm {
  secid: string;
  quantity: number;
}

export interface IFilterSecuritiesForm {
  secid: string;
  isin: string;
  secname: string;
}

export type ICheckedRows = { [key: string]: boolean };

export interface IBuySecurityPayload {
  securities: IBuySecurityRow[];
  portfolioId: number;
}

export interface IBuySecurityRequestPayload {
  portfolioId: number;
}

export interface ISellSecurityRequestPayload {
  portfolioId: number;
  secid: string;
  secname: string;
  boardid: string;
  available: number;
  price: number;
}

export interface ISecurityPlate {
  secid: string;
  secname: string;
  date: string;
  quantity: number;
  boardid: string;
  currentprice: number;
  dealprice: string;
  pl: string;
  plPercent: string;
  totalprice: string;
}

export type TTotals = { [key: string]: string };

export interface ISellSecurityForm {
  amount: number;
}

export interface IListPortfolioSecuritiesPayload {
  portfolioId: number;
}

export interface ILoadPortfolioWithSecuritiesPayload {
  portfolioId: number;
  columns: TColumnsDefinition;
}

export interface IPortfolioWithSecurities {
  portfolio: IPortfolio;
  securities: IPortfolioSecurity[];
}

export interface ISubscribeMarketsPayload {
  markets: TMarketsSubscription;
}

export interface IUpdateSecuritiesResponse {
  totals: TRow;
  plates: ISecurityPlate[];
  rows: IStockTableColumnData[];
}

export interface IStockTableColumnData {
  SECID: string;
  SECNAME: string;
  DATE: string;
  QUANTITY: string;
  DEALPRICE_SHOW: string;
  LCURRENTPRICE: string;
  PL: string;
  PLPERCENT_SHOW: string;
  BPRICE: string;
  BOARDID: string;
  DEALPRICE: string;
  TYPE: string;
  PLPERCENT: string;
}

export interface ITableColumnData extends Pick<IStockTableColumnData,
    'SECID' |
    'SECNAME' |
    'DATE' |
    'QUANTITY' |
    'DEALPRICE_SHOW' |
    'LCURRENTPRICE' |
    'PL' |
    'PLPERCENT_SHOW' |
    'BPRICE'> {
  ICO: string;
}

export type TPortfolioTableColumns = TableColumns<ITableColumnData, IStockTableColumnData>;

export type ILoadSecurities = IAction<'STOCK:LOAD_SECURITIES', ILoadSecuritiesPayload>;
export type ILoadSecuritiesSuccess = IAction<'STOCK:LOAD_SECURITIES_SUCCESS', ISecuritiy[]>;
export type ILoadSecuritiesFailed = IPlainFailAction<'STOCK:LOAD_SECURITIES_FAILED'>;

export type IBuySecurity = IAction<'STOCK:BUY_SECURITY', IBuySecurityPayload>;
export type IBuySecuritySuccess = IPlainAction<'STOCK:BUY_SECURITY_SUCCESS'>;
export type IBuySecurityFailed = IPlainFailAction<'STOCK:BUY_SECURITY_FAILED'>;

export type ISellSecurity = IAction<'STOCK:SELL_SECURITY', ISellSecurityRequest>;
export type ISellSecuritySuccess = IPlainAction<'STOCK:SELL_SECURITY_SUCCESS'>;
export type ISellSecurityFailed = IPlainFailAction<'STOCK:SELL_SECURITY_FAILED'>;

export type ILoadPortfolio = IAction<'STOCK:LOAD_PORTFOLIO', number>;
export type ILoadPortfolioSuccess = IAction<'STOCK:LOAD_PORTFOLIO_SUCCESS', IPortfolio>;
export type ILoadPortfolioFailed = IPlainFailAction<'STOCK:LOAD_PORTFOLIO_FAILED'>;

export type ILoadPortfolioWithSecurities = IAction<
  'STOCK:LOAD_PORTFOLIO_WITH_SECURITIES',
  ILoadPortfolioWithSecuritiesPayload
>;
export type ILoadPortfolioWithSecuritiesSuccess = IAction<
  'STOCK:LOAD_PORTFOLIO_WITH_SECURITIES_SUCCESS',
  IPortfolioWithSecurities
>;
export type ILoadPortfolioWithSecuritiesFailed = IPlainFailAction<'STOCK:LOAD_PORTFOLIO_WITH_SECURITIES_FAILED'>;

export type IListPortfolioSecurities = IAction<'STOCK:LIST_PORTFOLIO_SECURITIES', IListPortfolioSecuritiesPayload>;
export type IListPortfolioSecuritiesSuccess = IAction<'STOCK:LIST_PORTFOLIO_SECURITIES', IPortfolioSecurity[]>;
export type IListPortfolioSecuritiesFailed = IPlainFailAction<'STOCK:LIST_PORTFOLIO_SECURITIES'>;

export type IBuySecurityCallRequest = IAction<'STOCK:BUY_SECURITY_REQUEST', IBuySecurityRequestPayload>;
export type IResetBuySecurityCallRequest = IPlainAction<'STOCK:RESET_BUY_SECURITY_REQUEST'>;
export type ISellSecurityCallRequest = IAction<'STOCK:SELL_SECURITY_REQUEST', ISellSecurityRequestPayload>;
export type IResetSellSecurityCallRequest = IPlainAction<'STOCK:RESET_SELL_SECURITY_REQUEST'>;

export type ISubscribeToMarkets = IAction<'STOCK:SUBSCRIBE_TO_MARKETS', ISubscribeMarketsPayload>;
export type IUnsubscribeFromMarkets = IPlainAction<'STOCK:SUBSCRIBE_TO_MARKETS'>;

export type IUpdateSecurities = IAction<'STOCK:UPDATE_SUBSCRIBED_SECURITIES', IUpdateSecuritiesResponse>;

export type IReset = IPlainAction<'STOCK:RESET'>;

export type Action =
  | ILoadSecurities
  | ILoadSecuritiesSuccess
  | ILoadSecuritiesFailed
  | IBuySecurity
  | IBuySecuritySuccess
  | IBuySecurityFailed
  | ISellSecurity
  | ISellSecuritySuccess
  | ISellSecurityFailed
  | ILoadPortfolio
  | ILoadPortfolioSuccess
  | ILoadPortfolioFailed
  | IBuySecurityCallRequest
  | IResetBuySecurityCallRequest
  | ISellSecurityCallRequest
  | IResetSellSecurityCallRequest
  | IListPortfolioSecurities
  | IListPortfolioSecuritiesSuccess
  | IListPortfolioSecuritiesFailed
  | ILoadPortfolioWithSecurities
  | ILoadPortfolioWithSecuritiesSuccess
  | ILoadPortfolioWithSecuritiesFailed
  | ISubscribeToMarkets
  | IUnsubscribeFromMarkets
  | IUpdateSecurities
  | IReset;
