import { action, observable, computed, toJS } from 'mobx';
import Types from '../utils/render/Types'
import { Nodes, Node } from '../utils/render';

class RepeatableStore {

  @observable repeatables = [{
    id: '1234',
    name: '1234',
    model: {},
    fakeData: {},
    data: "1234",
    project: "1234",
  }];
  @observable workingIndex = 0;
  @observable showNewRepeatableDialog = false;
  @observable previewNodes = {};
  @observable repeatable = {
    id: '',
    name: '',
    model: {},
    fakeData: {},
    data: "",
    project: "",
    table: {
      add: true,
      delete: true,
      edit: true,
      export: true,
      filter: true,
      detail: false,
      detailPage: "",
    },
    settings: {
      search: false,
      searchFields: {},
      emptyText: "",
      filter: false,
      filterFields: {},
    },
  }
  @observable dropped = {}; // this is for dropping form elements into the form or selecting table elements
  @observable name = "";

  @observable nodes = new Nodes(this.update);

  @action.bound update = (k, v) => {
    this[k] = v;
  }
  @action.bound updateRepeatable = (k, v) => this[k] = v;

  @observable setNodes = (repeatable) => {
    this.id = repeatable.id || '';
    this.name = repeatable.name;
    this.team = repeatable.team;
    this.nodes = new Nodes(this.update);
    if (repeatable.page) this.nodes.load(repeatable.page);
  }

  @observable deletePreviewNodes = (repeatableID) => {
    delete this.previewNodes[repeatableID];
  }

  @observable setPreviewNodes = (repeatable) => {
    this.previewNodes[repeatable._id] = {
      id: repeatable._id,
      name: repeatable.name,
      team: repeatable.team,
      nodes: new Nodes(this.update),
    }
    if (repeatable.node) this.previewNodes[repeatable._id].nodes.load(repeatable.node);
  }

}

export default RepeatableStore;
