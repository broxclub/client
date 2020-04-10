import * as NS from '../namespace';
import { initialCommunicationField } from 'shared/types/redux';

export const initial: NS.IReduxState = {
  communication: {
    loadSecurities: initialCommunicationField,
    sellSecurity: initialCommunicationField,
    buySecurity: initialCommunicationField,
    loadPortfolio: initialCommunicationField,
    listPortfolioSecurities: initialCommunicationField,
    loadPortfolioWithSecurities: initialCommunicationField,
  },
  data: {
    securities: [],
    securitiesVersion: 0,
    currentPortfolio: null,
    buySecurityForm: null,
    sellSecurityForm: null,
    portfolioSecurities: null,
    plates: null,
    totals: null,
    rows: [],
  },
};
