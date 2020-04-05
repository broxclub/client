import { makeReduxFormEntry } from 'util/redux';
import * as NS from '../namespace';

export const buyFormEntry = makeReduxFormEntry<NS.IBuyForm>('buy-security', [
  'secid', 'quantity'
]);

export const filterSecuritiesEntry = makeReduxFormEntry<NS.IFilterSecuritiesForm>('filter-securities', [
  'secid', 'isin', 'secname',
]);
