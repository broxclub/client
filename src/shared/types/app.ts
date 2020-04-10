import * as StockFeatureNamespace from 'features/stock/namespace';
import { FormStateMap } from 'redux-form';
import Api from 'services/Api/Api';
import StockClientWS from 'services/Api/StockClientWS';
import SecuritiesStore from 'features/stock/SecuritiesStore';

export interface IAppReduxState {
  stock: StockFeatureNamespace.IReduxState;
  form: FormStateMap;
}

export interface IDependencies {
  api: Api;
  socket: StockClientWS;
  securitiesStore: SecuritiesStore;
}

export interface IAbstractColumn {
  width?: number;
  isSortable?: boolean;
  sortKind?: 'simple' | 'date';
  title?(): string;
}

export interface IHoldingCellRenderer<T> {
  renderCell(value: T, isSelectedRow: boolean): JSX.Element | string;
}

export interface IModelColumn<T> extends IAbstractColumn, Partial<IHoldingCellRenderer<T>> {}

export interface IExtraColumn<T> extends IAbstractColumn, IHoldingCellRenderer<T> {}

export type TableColumns<ColumnData, Model> = Record<keyof ColumnData, IModelColumn<Model>>;
