import HttpActions from './HttpActions';

class BaseApi {
  protected actions: HttpActions;

  constructor(actions: HttpActions) {
    this.actions = actions;
  }
}

export default BaseApi;
