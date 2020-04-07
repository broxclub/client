import * as NS from '../../namespace';
import { initial } from '../initial';

export default function dataReducer(state: NS.IReduxState['data'] = initial.data, action: NS.Action): NS.IReduxState['data'] {
  switch (action.type) {
    case 'STOCK:LOAD_SECURITIES_SUCCESS':
      return {
        ...state,
        securities: action.payload,
        securitiesVersion: state.securitiesVersion + 1,
      };
    case 'STOCK:LOAD_PORTFOLIO_SUCCESS':
      return {
        ...state,
        currentPortfolio: action.payload,
      };
    case 'STOCK:BUY_SECURITY_REQUEST':
      return {
        ...state,
        buySecurityForm: action.payload,
      };
    case 'STOCK:RESET_BUY_SECURITY_REQUEST':
      return {
        ...state,
        buySecurityForm: null,
      };
    case 'STOCK:SELL_SECURITY_REQUEST':
      return {
        ...state,
        sellSecurityForm: action.payload,
      };
    case 'STOCK:RESET_SELL_SECURITY_REQUEST':
      return {
        ...state,
        sellSecurityForm: null,
      };
  }

  return state;
}
