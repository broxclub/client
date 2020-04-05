import HttpActions from 'services/Api/HttpActions';
import StockApi from './modules/Stock';

class Api {
  public stock: StockApi;
  private readonly actions: HttpActions;

  constructor(baseUrl: string) {
    this.actions = new HttpActions(baseUrl);
    this.stock = new StockApi(this.actions)
  }
}

export default Api;
