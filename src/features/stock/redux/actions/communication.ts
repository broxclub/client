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

export const {
  execute: listPortfolioSecurities,
  completed: listPortfolioSecuritiesSuccess,
  failed: listPortfolioSecuritiesFailed
} = makeCommunicationActionCreators<
  NS.IListPortfolioSecurities,
  NS.IListPortfolioSecuritiesSuccess,
  NS.IListPortfolioSecuritiesFailed
  >(
    'STOCK:LIST_PORTFOLIO_SECURITIES',
  'STOCK:LIST_PORTFOLIO_SECURITIES',
  'STOCK:LIST_PORTFOLIO_SECURITIES'
);

export const {
  execute: loadPortfolioWithSecurities,
  completed: loadPortfolioWithSecuritiesSuccess,
  failed: loadPortfolioWithSecuritiesFailed
} = makeCommunicationActionCreators<
  NS.ILoadPortfolioWithSecurities,
  NS.ILoadPortfolioWithSecuritiesSuccess,
  NS.ILoadPortfolioWithSecuritiesFailed
  >(
  'STOCK:LOAD_PORTFOLIO_WITH_SECURITIES',
  'STOCK:LOAD_PORTFOLIO_WITH_SECURITIES_SUCCESS',
  'STOCK:LOAD_PORTFOLIO_WITH_SECURITIES_FAILED',
);
