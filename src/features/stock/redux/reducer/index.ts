import { combineReducers, Reducer } from 'redux';
import { ReducersMap } from 'shared/types/redux';
import makeResetStateReducer from 'shared/types/redux/makeResetStateReducer';
import composeReducers from 'shared/types/redux/composeReducers';
import * as NS from '../../namespace';
import { initial } from '../initial';

import communicationReducer from './communication';
import dataReducer from './data';

const resetReducer = makeResetStateReducer<NS.IReset, NS.IReduxState>('STOCK:RESET', initial);

const baseReducer = combineReducers<NS.IReduxState>({
  communication: communicationReducer,
  data: dataReducer,
} as ReducersMap<NS.IReduxState>);

const reducer: Reducer<NS.IReduxState> = composeReducers<NS.IReduxState>([baseReducer, resetReducer]);

export default reducer;
