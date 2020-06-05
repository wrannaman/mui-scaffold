import { action, observable, computed, toJS } from 'mobx';

class DataStore {

  @observable datas = [];
  @observable data = {
    id: '',
    name: '',
    model: {},
    fakeData: {},
  };
  @observable name = "";

  // @observable dataItems = [];
  @observable dataItemQuery = {
    limit: 10,
    query: '',
  };

  // these three are for new model definitions
  @observable newKey = "";
  @observable newValue = "text";
  @observable newMinLength = 0;
  @observable newMaxLength = 255;
  @observable newAllowNull = true;
  @observable newUnique = false;
  @observable newDefaultValue = "";
  @observable newRelation = { index: -1, model: '', field: '', type: ''  };
  @observable repeatableData = []; // only used by the map component at this time.
  @observable enumArray = [];
  @observable enumVal = [];

  @action.bound update = (k, v) => this[k] = v;
  @action.bound updateData = (k, v) => this[k] = v;
  @action.bound updateModel = (k, v) => {
    this.model[k] = v;
  }

  @action.bound resetData = () => {
    this.data = {
      id: '',
      name: '',
      model: {},
      fakeData: {},
    };
  }


  @action.bound setFake = (model) => {
    this.data.fakeData = {};
    if (!model) return;
    Object.keys(model).forEach((key) => {
      if (model[key] === 'date') {
        this.data.fakeData[key] = new Date();
      } else {
        this.data.fakeData[key] = "";
      }
    });
  }
  @action.bound updateFakeData = (name, v) => {
    this.data.fakeData[name] = v;
  }
}

export default DataStore;
