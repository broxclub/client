import BaseApi from 'services/Api/Base';
import { bind } from 'decko';
import { ISecuritiy } from 'features/stock/namespace';
import { IBuySecurityRequest, IListSecuritiesRequest, ISellSecurityRequest } from 'shared/types/requests';
import { IFieldsResponse, IPortfolioResponse } from 'shared/types/responses';

class StockApi extends BaseApi {
  @bind
  public async listFields(): Promise<IFieldsResponse> {
    const response = await this.actions.get<IFieldsResponse>(`/stock-fields`);
    return response.data;
  }

  @bind
  public async listSecurities(request: IListSecuritiesRequest): Promise<ISecuritiy[]> {
    const response = await this.actions.get<ISecuritiy[]>(`/stock/securities`, request);
    return response.data;
  }

  @bind
  public async loadPortfolio(portfolioId: number): Promise<IPortfolioResponse> {
    const response = await this.actions.get<IPortfolioResponse>(`/store/portfolio/${portfolioId}`);
    return response.data;
  }

  @bind
  public async listPortfolios(): Promise<IPortfolioResponse[]> {
    const response = await this.actions.get<IPortfolioResponse[]>(`/store/portfolio`);
    return response.data;
  }

  @bind
  public async listPortfolioSecurities(portfolioId: number): Promise<any> {
    const response = await this.actions.get<any>(`/store/securities/${portfolioId}`);
    return response.data;
  }

  @bind
  public async buySecurity(request: IBuySecurityRequest): Promise<any> {
    const response = await this.actions.post(`/store/buy`, request);
    return response.data;
  }

  @bind
  public async sellSecurity(request: ISellSecurityRequest): Promise<any> {
    const response = await this.actions.post(`/store/sell`, request);
    return response.data;
  }
}

export default StockApi;
