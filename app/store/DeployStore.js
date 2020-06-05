import { action, observable, computed, toJS } from 'mobx';
import { tokenCheck } from '../src/apiCalls/user';
import { maybeSetToken } from '../src/apiCalls/api';

class AuthStore {
  @observable deploys = [];
  @observable totalDeploys = 0;
  @observable env = "dev";
  @observable name = "0.0.1";

  @action.bound update = (k, v) => this[k] = v;
  @action.bound updateDeploy = (k, v) => this[k] = v;
}

export default AuthStore;
