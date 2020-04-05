import * as StockFeatureNamespace from 'features/stock/namespace';
import { FormStateMap } from 'redux-form';
import Api from 'services/Api/Api';

export interface IAppReduxState {
  stock: StockFeatureNamespace.IReduxState;
  form: FormStateMap;
}

export interface IDependencies {
  api: Api;
}
