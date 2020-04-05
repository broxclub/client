export interface IListSecuritiesRequest {
  fields?: string[];
  filter?: string;
  format?: 'json';
}

export interface ISellSecurityRequest {
  portfolioid: number;
  secid: string;
  board: string;
  quantity: number;
  price: number;
}

export interface IBuySecurityRequest {
  portfolioid: number;
  secid: string
  board: string;
  quantity: number;
}
