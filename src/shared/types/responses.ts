export type IFieldsResponse = string[];

export interface IPortfolioResponse {
  id: number;
  name: string;
  create_at: string;
  update_at: string;
  balance: number;
  start_balance: number;
}

export interface IPortfolioSecurity {
  id: number;
  board: string;
  secid: string;
  secname: string;
  create_at: string;
  type: string;
  low: number;
  high: number;
  last: number;
  value: number;
  closeprice: number;
  marketprice: number
  voltoday: number;
  lcurrentprice: number
  issuecapitalization: number;
  yield: number;
  yieldtoprevyield: number;
  yieldtooffer: number;
  yieldlastcoupon: number
  quantity: number;
  pnl: number;
  buyprice: number;
}
