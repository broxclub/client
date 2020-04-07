import { IAppReduxState } from 'shared/types/app';
import * as NS from '../namespace';
import { ICommunication } from 'shared/types/redux';
import { IPortfolio } from '../namespace';

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
