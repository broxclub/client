import React from 'react';
import { Provider } from 'react-redux';
import { reducer as formReducer } from 'redux-form';
import createSagaMiddleware, { SagaMiddleware } from 'redux-saga';
import thunk from 'redux-thunk';
import { applyMiddleware, combineReducers, compose, createStore, Store } from 'redux';
import { IAppReduxState, IDependencies } from 'shared/types/app';
import stockFeatureSaga from 'features/stock/redux/sagas';
import stockFeatureReducer from 'features/stock/redux/reducer';
import 'decimal.js';
import 'moment';
import Api from 'services/Api/Api';
import { AppContainer } from 'react-hot-loader';
import { IHooks } from 'classes/StockLib';
import * as stockContainers from 'features/stock/view/containers';

import './core.scss';

interface IOwnProps {
  api: Api;
  hooks: IHooks;
}

export interface IAppHookContext {
  hooks: IHooks;
}

type TProps = IOwnProps;

export const AppContext = React.createContext<IAppHookContext>({
  hooks: {},
});

class App extends React.PureComponent<TProps> {
  private store: Store<IAppReduxState>;
  private runSaga: SagaMiddleware<any>['run'];

  constructor(props: TProps) {
    super(props);
    const { api } = props;

    const deps: IDependencies = {
      api,
    };

    const sagaMiddleware = createSagaMiddleware();
    const middlewares = [
      sagaMiddleware,
      thunk.withExtraArgument(deps)
    ];

    this.runSaga = sagaMiddleware.run;
    this.store = createStore(
      (state: IAppReduxState) => state,
      compose(applyMiddleware(...middlewares)),
    );

    this.runSaga(stockFeatureSaga(deps));
    this.store.replaceReducer(combineReducers({
      stock: stockFeatureReducer,
      form: formReducer,
    }));
  }

  public render() {
    return (
      <AppContainer>
        <Provider store={this.store}>
          <AppContext.Provider value={{ hooks: this.props.hooks }}>
            <stockContainers.Modals/>
            {this.props.children}
          </AppContext.Provider>
        </Provider>
      </AppContainer>
    );
  }
}

export default App;
