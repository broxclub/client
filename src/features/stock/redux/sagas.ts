import { call, put, take, race, takeLatest, all, takeEvery } from 'redux-saga/effects';
import { /*END, */eventChannel } from 'redux-saga';
import * as NS from '../namespace';
import * as actions from './actions';
import { IDependencies } from 'shared/types/app';
import { IPortfolioResponse } from 'shared/types/responses';

const loadSecuritiesType: NS.ILoadSecurities['type'] = 'STOCK:LOAD_SECURITIES';
const sellSecurityType: NS.ISellSecurity['type'] = 'STOCK:SELL_SECURITY';
const buySecurityType: NS.IBuySecurity['type'] = 'STOCK:BUY_SECURITY';
const loadPortfolioType: NS.ILoadPortfolio['type'] = 'STOCK:LOAD_PORTFOLIO';
const listPortfolioSecuritiesType: NS.IListPortfolioSecuritiesFailed['type'] = 'STOCK:LIST_PORTFOLIO_SECURITIES';
const loadPortfolioWithSecuritiesType: NS.ILoadPortfolioWithSecurities['type'] =
  'STOCK:LOAD_PORTFOLIO_WITH_SECURITIES';
const subscribeToMarketsType: NS.ISubscribeToMarkets['type'] = 'STOCK:SUBSCRIBE_TO_MARKETS';
const unsubscribeFromMarketsType: NS.IUnsubscribeFromMarkets['type'] = 'STOCK:SUBSCRIBE_TO_MARKETS';

function getSaga(deps: IDependencies) {

  return function* saga() {
    yield all([
      takeLatest(loadSecuritiesType, executeLoadSecurities, deps),
      takeLatest(sellSecurityType, executeSellSecurity, deps),
      takeLatest(buySecurityType, executeBuySecurity, deps),
      takeLatest(loadPortfolioType, executeLoadPortfolio, deps),
      takeLatest(listPortfolioSecuritiesType, executeListPortfolioSecurities, deps),
      takeLatest(loadPortfolioWithSecuritiesType, executeLoadPortfolioWithSecurities, deps),
      takeEvery(subscribeToMarketsType, executeSubscribeToMarkets, deps),
    ]);
  };
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
      yield call(api.stock.buySecurity, {
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

function* executeListPortfolioSecurities({ api }: IDependencies, { payload }: NS.IListPortfolioSecurities) {
  try {
    const securities = yield call(api.stock.listPortfolioSecurities, payload.portfolioId);
    yield put(actions.listPortfolioSecuritiesSuccess(securities));
  } catch (error) {
    console.error(error);
    yield put(actions.listPortfolioSecuritiesFailed(error.message));
  }
}

function* executeLoadPortfolioWithSecurities({ api, securitiesStore }: IDependencies, { payload }: NS.ILoadPortfolioWithSecurities) {
  try {
    const portfolioResponse: IPortfolioResponse = yield call(api.stock.loadPortfolio, payload.portfolioId);
    const securities = yield call(api.stock.listPortfolioSecurities, payload.portfolioId);
    const portfolio = {
      name: portfolioResponse.name,
      id: portfolioResponse.id,
      balance: portfolioResponse.balance,
      createAt: portfolioResponse.create_at,
      startBalance: portfolioResponse.start_balance,
      updateAt: portfolioResponse.update_at,
    };
    const securitiesBuffer = securitiesStore.create(payload.columns, securities, portfolio);
    yield put(actions.loadPortfolioWithSecuritiesSuccess({
      portfolio,
      securities,
    }));
    yield put(actions.updateMarkets({
      totals: securitiesBuffer.totals,
      plates: securitiesBuffer.plates,
      rows: securitiesBuffer.collapsedRows,
    }));
    yield put(actions.subscribeMarkets({
      markets: securitiesBuffer.subscriptions,
    }));
  } catch (error) {
    console.error(error);
    yield put(actions.loadPortfolioWithSecuritiesFailed(error.message));
  }
}

function* executeSubscribeToMarkets({ socket, securitiesStore }: IDependencies, { payload }: NS.ISubscribeToMarkets) {
  let channel;
  let invocationId: number;
  try {
    channel = eventChannel(emitter => {
      invocationId = socket.subscribeMarkets(payload.markets, emitter);

      return () => {
        socket.unsubscribe(invocationId);
      };
    });

    while (true) {
      const {
        cancel,
        task,
      } = yield race({
        task: take(channel),
        cancel: take(unsubscribeFromMarketsType),
      });

      if (cancel) {
        channel.close();
        break;
      }

      if (task) {
        const securitiesBuffer = securitiesStore.securitiesBuffer;
        securitiesBuffer.processSubscription(task);
        yield put(actions.updateMarkets({
          totals: securitiesBuffer.totals,
          plates: securitiesBuffer.plates,
          rows: securitiesBuffer.collapsedRows,
        }));
      }

    }
  } catch (e) {
    console.error(e);
  } finally {
    if (channel) {
      channel.close();
    }
  }
}

export default getSaga;
