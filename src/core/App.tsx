import React from 'react';
import { Provider } from 'react-redux';
import { createStore, Store } from 'redux';
import { IAppReduxState } from 'shared/types/app';
import 'decimal.js';
import 'moment';

class App extends React.PureComponent {
  private store: Store<IAppReduxState>;

  constructor(props: any) {
    super(props);
    this.store = createStore(
      (state: IAppReduxState) => state,
    );
  }

  public render() {
    return (
      <Provider store={this.store}>
        <div>APP</div>
      </Provider>
    );
  }
}

export default App;
