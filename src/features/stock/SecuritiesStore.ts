import { IPortfolioSecurity } from 'shared/types/responses';
import { IPortfolio } from 'features/stock/namespace';
import SecuritiesBuffer from 'classes/Securities/SecuritiesBuffer';
import { TColumnsDefinition } from 'classes/Securities/helpers';

class SecuritiesStore {
  private _securitiesBuffer: SecuritiesBuffer | null = null;

  public create(columns: TColumnsDefinition, portfolioSecurities: IPortfolioSecurity[], portfolio: IPortfolio) {
    const { id, balance, startBalance } = portfolio;
    this._securitiesBuffer = new SecuritiesBuffer(columns, portfolioSecurities as any, id, balance, startBalance);
    return this._securitiesBuffer;
  }

  public get securitiesBuffer(): SecuritiesBuffer {
    return this._securitiesBuffer!;
  }
}

export default SecuritiesStore;
