import { action, observable, computed, toJS } from 'mobx';
import Types from '../utils/render/Types'
import { Nodes, Node } from '../utils/render';
import { red, green, orange } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

import THEME from '../utils/theme';

class ProjectStore {
  @observable projects = [];
  @observable templates = [];
  @observable showAfterClone = false;
  @observable project = {
    name: '',
    id: '',
    pages: [],
    stat: '',
    team: '',
    stripeSecretKey: "",
    stripePublishableKey: "",
    code: "",
    database: {
      dialect: "mysql",
      user: "",
      password: "",
      host: "",
      database: "",
      language: "nodejs"
    },
    models: {},
    theme: THEME,
    nav: {
      color: 'primary',
      variant: 'persistent',
      anchor: 'left',
      appBar: 'fixed',
      logo: true,
      logoURL: "/img/logo.png",
    },
    fontName: "",
    fontURL: "",
    html: {
      head: '',
      code: '',
      css: '',
      favicon: '',
      logo: '',
      bgImage: '',
      homePage: '',
      afterLogin: '',
    },
    auth: {
      type: 'anyone',
      whiteList: '',
    },
    userPermissions: {},
    userRoles: {},
    defaultUserRole: "",
    defaultAdminRole: "",
    s3: {
      key: '',
      secret: ''
    },
    customDomain: '',
  };

  @observable colorOptions = ['default', 'inherit', 'primary', 'secondary'];
  @observable variantOptions = ['permanent', 'persistent', 'temporary'];
  @observable anchorOptions = ['left', 'top', 'right', 'bottom'];
  @observable appBarOptions = ['fixed', 'absolute', 'relative', 'sticky'];

  @observable disabled = false;
  @observable link = "";
  @observable limit = 25;
  @observable page = 0;
  @observable offset = 0;
  @observable totalDocs = 0;
  @observable pageIndex = 0;
  @observable table = {
    name: "",
    table: {},
    foreignKeys: [],
  };
  @observable selected = {};

  @action.bound update = (k, v) => {
    this[k] = v;
  }

  @action.bound updateProject = (k, v) => {
    this[k] = v;
  }

  @action.bound getTheme = () => {
    return createMuiTheme(this.project.theme);
  }

  @action.bound resetTheme = () => {
    this.project.theme = THEME;
  }

  @action.bound setProjects = (res) => {
    const { docs, limit, offset, totalDocs } = res;
    this.projects = docs;
    this.limit = limit;
    this.offset = offset;
    this.total = totalDocs;
  }
}

export default ProjectStore;
