import { checkRequired, rtrim } from '../util';
import StockClientWS from './StockClientWS';

interface ISellSecurity {
  portfolioid: number;
  secid: string;
  board: string;
  quantity: number;
  price: string;
}

interface IBuySecurity {
  portfolioid: number;
  secid: string;
  board: string;
  quantity: number;
}

class StockClient extends StockClientWS {
  private useSsl: boolean = false;
  private apiUrl: string;

  constructor(url: string) {
    super();
    if (url.indexOf('http') === 0) {
      if (url.indexOf('https') === 0) {
        this.useSsl = true;
      }

      url = url.replace(/^https?\:/, '');
    }

    this.wsUrl = `ws${this.useSsl ? 's' : ''}://${url}`;
    this.apiUrl = rtrim(`http${this.useSsl ? 's' : ''}://${url}`);
  }

  public apiRequest(url: string, params?: object) {
    return this.getRequest(`${this.apiUrl}${url}`, params);
  }

  public postApiRequest(url: string, data: object) {
    return this.postRequest(`${this.apiUrl}${url}`, data);
  }

  public listFields() {
    return new Promise((resolve, reject) => {
      this.apiRequest(`/stock/fields`).then((response) => {
        resolve(response);
      }).catch(reject);
    });
  }

  public listSecurities({ fields = [], filter }: {fields: string[], filter: string}) {
    const props: string[] = [];
    Array.isArray(fields) && fields.length && props.push(`fields=${fields.join(',')}`);
    filter > '' && typeof filter === 'string' && props.push(`filter=${filter}`);
    return new Promise((resolve, reject) => {
      this.apiRequest(`/stock/securities`, props).then(response => {
        resolve(response);
      }).catch(reject);
    });
  }

  public listPortfolios(portfolioId?: number) {
    // checkRequired
    return new Promise((resolve, reject) => {
      this.apiRequest(`/store/portfolio${portfolioId ? `/${portfolioId}` : ''}`).then(response => {
        resolve(response);
      }).catch(reject);
    });
  }

  public sellSecurity({ portfolioid, secid, board, quantity, price }: ISellSecurity) {
    const data = { portfolioid, secid, board, quantity, price };
    checkRequired(data);
    return this.postApiRequest(`/store/sell`, data);
  }

  public buySecurity({ portfolioid, secid, board, quantity }: IBuySecurity) {
    const data = { portfolioid, secid, board, quantity };
    checkRequired(data);
    return this.postApiRequest(`/store/buy`, data);
  }

  private getRequest(url: string, params?: object) {
    const paramsStr = Array.isArray(params) && params.length ? `?${params.join('&')}` : '';

    return new Promise((resolve, reject) => {
      fetch(`${url}${paramsStr}`).then((response) => {
        resolve(response.json());
      }).catch(reject);
    });
  }

  private postRequest(url: string, body: object) {
    return new Promise((resolve, reject) => {
      const ax = new XMLHttpRequest();
      ax.open('POST', url, true);
      ax.setRequestHeader('Content-type', 'application/json; charset=utf-8');
      ax.onreadystatechange = () => {
        if (ax.readyState === 4) {
          if (ax.status >= 200 && ax.status < 400) {
            resolve(JSON.parse(ax.response));
          } else {
            reject(JSON.parse(ax.response));
          }
        }
      };
      ax.send(JSON.stringify(body));
    });
  }
}

export default StockClient;
