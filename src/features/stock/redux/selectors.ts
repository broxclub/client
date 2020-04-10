import { IAppReduxState } from 'shared/types/app';
import * as NS from '../namespace';
import { ICommunication } from 'shared/types/redux';
import { IPortfolio } from '../namespace';
import { IPortfolioSecurity } from 'shared/types/responses';
import { TRow } from 'classes/Securities/helpers';
import { ISecurityPlate } from 'features/stock/namespace';

function getFeatureState(state: IAppReduxState): NS.IReduxState {
  return state.stock;
}

export function selectSecurities(state: IAppReduxState): NS.ISecuritiy[] {
  return getFeatureState(state).data.securities;
}

export function selectCommunication(state: IAppReduxState, key: keyof NS.IReduxState['communication']): ICommunication {
  return getFeatureState(state).communication[key];
}

export function selectSecuritiesVersion(state: IAppReduxState): number {
  return getFeatureState(state).data.securitiesVersion;
}

export function selectPortfolio(state: IAppReduxState): IPortfolio | null {
  return getFeatureState(state).data.currentPortfolio;
}

export function selectBuyFormPayload(state: IAppReduxState): NS.IBuySecurityRequestPayload | null {
  return getFeatureState(state).data.buySecurityForm;
}

export function selectSellFormPayload(state: IAppReduxState): NS.ISellSecurityRequestPayload | null {
  return getFeatureState(state).data.sellSecurityForm;
}

export function selectCurrentProfile(state: IAppReduxState): IPortfolio | null {
  return getFeatureState(state).data.currentPortfolio;
}

export function selectPortfolioSecurities(state: IAppReduxState): IPortfolioSecurity[] | null {
  return getFeatureState(state).data.portfolioSecurities;
}

export function selectRows(state: IAppReduxState): NS.IStockTableColumnData[] {
  return getFeatureState(state).data.rows;
}

export function selectTotals(state: IAppReduxState): TRow | null {
  return getFeatureState(state).data.totals;
}

export function selectPlates(state: IAppReduxState): ISecurityPlate[] | null {
  return getFeatureState(state).data.plates;
}
