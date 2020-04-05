import { call, put, takeLatest, all } from 'redux-saga/effects';
import * as NS from '../namespace';
import * as actions from './actions';
import { IDependencies } from 'shared/types/app';

function getSaga(deps: IDependencies) {
  const loadSecuritiesType: NS.ILoadSecurities['type'] = 'STOCK:LOAD_SECURITIES';
  const sellSecurityType: NS.ISellSecurity['type'] = 'STOCK:SELL_SECURITY';
  const buySecurityType: NS.IBuySecurity['type'] = 'STOCK:BUY_SECURITY';
  const loadPortfolioType: NS.ILoadPortfolio['type'] = 'STOCK:LOAD_PORTFOLIO';

  return function* saga() {
    yield all([
      takeLatest(loadSecuritiesType, executeLoadSecurities, deps),
      takeLatest(sellSecurityType, executeSellSecurity, deps),
      takeLatest(buySecurityType, executeBuySecurity, deps),
      takeLatest(loadPortfolioType, executeLoadPortfolio, deps)
    ]);
  }
}

function* executeLoadSecurities({ api }: IDependencies, { payload }: NS.ILoadSecurities) {
  try {
    const { fields, filter } = payload;
    const securities = yield call(api.stock.listSecurities, {
      fields,
      filter,
      format: 'json',
    });

    yield put(actions.loadSecuritiesSuccess(securities));
  } catch (error) {
    console.error(error);
    yield put(actions.loadSecuritiesFailed(error.message));
  }
}

function* executeSellSecurity({ api }: IDependencies, { payload }: NS.ISellSecurity) {
  try {
    const { board, portfolioid, price, quantity, secid } = payload;
    yield call(api.stock.sellSecurity, {
      board,
      price,
      quantity,
      secid,
      portfolioid,
    });
    yield put(actions.sellSecuritySuccess());
  } catch (error) {
    console.error(error);
    yield put(actions.sellSecurityFailed(error.message));
  }
}

function* executeBuySecurity({ api }: IDependencies, { payload }: NS.IBuySecurity) {
  try {
    const { securities, portfolioId } = payload;
    for (const sec of securities) {
      const { BOARDID, SECID, quantity } = sec;
      yield call(api.stock.buySecurity,{
        quantity,
        secid: SECID,
        board: BOARDID,
        portfolioid: portfolioId,
      });
    }
    yield put(actions.buySecuritySuccess());
  } catch (error) {
    console.error(error.message);
    yield put(actions.buySecurityFailed(error.message));
  }
}

function* executeLoadPortfolio({ api }: IDependencies, { payload }: NS.ILoadPortfolio) {
  try {
    const portfolio = yield call(api.stock.loadPortfolio, payload);
    yield put(actions.loadPortfolioSuccess(portfolio));
  } catch (error) {
    console.error(error);
    yield put(actions.loadPortfolioFailed(error.message));
  }
}

export default getSaga;
