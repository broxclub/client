import { combineReducers } from 'redux';
import * as NS from '../../namespace';
import { initial } from '../initial';
import makeCommunicationReducer from 'shared/types/redux/makeCommunicationReducer';
import { ReducersMap } from 'shared/types/redux';

export default combineReducers<NS.IReduxState['communication']>(
  {
    loadSecurities: makeCommunicationReducer<NS.ILoadSecurities,
      NS.ILoadSecuritiesSuccess,
      NS.ILoadSecuritiesFailed>(
      'STOCK:LOAD_SECURITIES',
      'STOCK:LOAD_SECURITIES_SUCCESS',
      'STOCK:LOAD_SECURITIES_FAILED',
      initial.communication.loadSecurities,
    ),
    buySecurity: makeCommunicationReducer<NS.IBuySecurity,
      NS.IBuySecuritySuccess,
      NS.IBuySecurityFailed>(
      'STOCK:BUY_SECURITY',
      'STOCK:BUY_SECURITY_SUCCESS',
      'STOCK:BUY_SECURITY_FAILED',
      initial.communication.buySecurity,
    ),
    sellSecurity: makeCommunicationReducer<NS.ISellSecurity,
      NS.ISellSecuritySuccess,
      NS.ISellSecurityFailed>(
      'STOCK:SELL_SECURITY',
      'STOCK:SELL_SECURITY_SUCCESS',
      'STOCK:SELL_SECURITY_FAILED',
      initial.communication.sellSecurity,
    ),
    loadPortfolio: makeCommunicationReducer<NS.ILoadPortfolio,
      NS.ILoadPortfolioSuccess,
      NS.ILoadPortfolioFailed>(
      'STOCK:LOAD_PORTFOLIO',
      'STOCK:LOAD_PORTFOLIO_SUCCESS',
      'STOCK:LOAD_PORTFOLIO_FAILED',
      initial.communication.loadPortfolio,
    ),
  } as ReducersMap<NS.IReduxState['communication']>,
);
