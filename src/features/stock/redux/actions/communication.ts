import makeCommunicationActionCreators from 'shared/types/redux/makeCommunicationActionCreators';
import * as NS from '../../namespace';

export const {
  execute: loadSecurities,
  completed: loadSecuritiesSuccess,
  failed: loadSecuritiesFailed,
} = makeCommunicationActionCreators<
  NS.ILoadSecurities,
  NS.ILoadSecuritiesSuccess,
  NS.ILoadSecuritiesFailed
  >(
  'STOCK:LOAD_SECURITIES',
  'STOCK:LOAD_SECURITIES_SUCCESS',
  'STOCK:LOAD_SECURITIES_FAILED',
);

export const {
  execute: sellSecurity,
  completed: sellSecuritySuccess,
  failed: sellSecurityFailed,
} = makeCommunicationActionCreators<
  NS.ISellSecurity,
  NS.ISellSecuritySuccess,
  NS.ISellSecurityFailed
  >(
    'STOCK:SELL_SECURITY',
  'STOCK:SELL_SECURITY_SUCCESS',
  'STOCK:SELL_SECURITY_FAILED',
);

export const {
  execute: buySecurity,
  completed: buySecuritySuccess,
  failed: buySecurityFailed,
} = makeCommunicationActionCreators<
  NS.IBuySecurity,
  NS.IBuySecuritySuccess,
  NS.IBuySecurityFailed
  >(
  'STOCK:BUY_SECURITY',
  'STOCK:BUY_SECURITY_SUCCESS',
  'STOCK:BUY_SECURITY_FAILED',
);

export const {
  execute: loadPortfolio,
  completed: loadPortfolioSuccess,
  failed: loadPortfolioFailed
} = makeCommunicationActionCreators<
  NS.ILoadPortfolio,
  NS.ILoadPortfolioSuccess,
  NS.ILoadPortfolioFailed
  >(
  'STOCK:LOAD_PORTFOLIO',
  'STOCK:LOAD_PORTFOLIO_SUCCESS',
  'STOCK:LOAD_PORTFOLIO_FAILED'
);
