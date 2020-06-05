import { action, observable, computed, toJS } from 'mobx';

class ComponentStore {

  @observable components = [];
  @observable component = {
    id: '',
    name: '',
    model: {},
    fakeData: {},
    data: "",
    project: "",
    table: {},
  };

  @observable dropped = {}; // this is for dropping form elements into the form or selecting table elements
  @observable name = "";

  @action.bound update = (k, v) => this[k] = v;
  @action.bound updateComponent = (k, v) => this[k] = v;
}

export default ComponentStore;
