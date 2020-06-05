import { action, observable, computed, toJS } from 'mobx';
import Types from '../utils/render/Types'
import { Nodes, Node } from '../utils/render';

const COMPONENTS = {
  Layout: ['Div', 'Grid', 'Paper'], // 'Container', 'Grid List'
  Inputs: ['Button', 'Checkbox', 'Radio', 'Select', 'Slider', 'Switch', 'Text Field'], // 'Date/Time', 'Autocomplete',
  // Navigation: ['Bottom Navigation', 'Breadcrumbs', 'Drawers', 'Links', 'Menus', 'Steppers', 'Tabs'],
  // Surfaces: ['Card'], // 'App Bar', 'Paper', 'Expansion Panels'
  // Feedback: ['Dialog', 'Snackbar', 'Progress'],
  'Data Display': ['Chip', 'Divider', 'Icon', 'List', 'Typography', 'Image', 'Avatar', 'Rating'], // 'Tables', , 'Badges', 'Tooltips',
};

class PageStore {
  @observable grids = [];
  @observable id = "";
  @observable name = "";
  @observable displayName = "";
  @observable visibility = "";
  @observable project = "";
  @observable auth = "";
  @observable type = "";
  @observable boundDataModel = "";
  @observable team = "";
  @observable layout = [];
  @observable dragging = false; // is a component being dragged
  @observable showNewPageDialog = false; // to create a new page
  @observable order = null;
  @observable showNav = true;
  @observable layouts = {
    lg: [],
    md: [],
    sm: [],
    xs: [],
  };
  @observable layoutMap = {};

  @observable dropAreas = [{
    accepts: [
      Types.GRID,
      Types.COMPONENT,
      // Types.GRID.CONTAINER,
    ],
    lastDroppedItem: null
  }];

  @observable components = COMPONENTS

  @observable page = {};
  @observable demoComponent = ""; // which component to demo

  @observable render = 0; // we just update this to a timestamp to force a render
  @observable editing = ""; // which component or section are we editing
  @observable nodes = new Nodes(this.update);

  @action.bound update = (k, v) => this[k] = v;
  @action.bound updatePage = (k, v) => this[k] = v;

  @observable setPageComponents = () => {
    const clone = Object.assign({}, toJS(this.components));
    clone['Data Display'] = ['Chip', 'Divider', 'Icon', 'List', 'Typography', 'Image', 'Avatar', 'Rating', 'Video', 'Iframe'],
    delete clone.Feedback;
    this.components = clone;
  }

  @observable setRepeatableNodes = () => {
    const clone = Object.assign({}, toJS(this.components));
    clone.Inputs = ['Button'];
    delete clone.Feedback;
    this.components = clone;
  }

  @observable resetNodes = () => {
    this.nodes = new Nodes(this.update);
  }

  @observable resetComponents = () => {
    this.components = COMPONENTS;
  }

  @observable setNodes = (page) => {
    this.id = page.id || '';
    this.name = page.name;
    this.type = page.type;
    this.auth = page.auth;
    if (typeof page.showNav !== 'undefined') this.showNav = page.showNav;
    if (page.order) this.order = page.order;
    else this.order = null;
    if (page.displayName) this.displayName = page.displayName;
    else this.displayName = "";
    if (page.visibility) this.visibility = page.visibility;
    else this.visibility = "all";
    if (page.boundDataModel) this.boundDataModel = page.boundDataModel;
    if (page.team) this.team = page.team;
    this.nodes = new Nodes(this.update);
    if (page.page) this.nodes.load(page.page);
  }

}

export default PageStore;
