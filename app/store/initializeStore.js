import { useStaticRendering } from 'mobx-react';
import AuthStore from './AuthStore';
import PageStore from './PageStore';
import SnackStore from './SnackStore';
import ProjectStore from './ProjectStore';
import DataStore from './DataStore';
import ComponentStore from './ComponentStore';
import RepeatableStore from './RepeatableStore';
import MediaStore from './MediaStore';
import DeployStore from './DeployStore';

let store = null;
const isServer = !process.browser;

useStaticRendering(isServer);

export default (initialData) => {
  if (isServer) {
    return {
      auth: new AuthStore(isServer, initialData),
      page: new PageStore(isServer, initialData),
      snack: new SnackStore(isServer, initialData),
      project: new ProjectStore(isServer, initialData),
      data: new DataStore(isServer, initialData),
      component: new ComponentStore(isServer, initialData),
      repeatable: new RepeatableStore(isServer, initialData),
      media: new MediaStore(isServer, initialData),
      deploy: new DeployStore(isServer, initialData),
    };
  }
  if (store === null) {
    store = {
      auth: new AuthStore(isServer, initialData),
      page: new PageStore(isServer, initialData),
      snack: new SnackStore(isServer, initialData),
      project: new ProjectStore(isServer, initialData),
      data: new DataStore(isServer, initialData),
      component: new ComponentStore(isServer, initialData),
      repeatable: new RepeatableStore(isServer, initialData),
      media: new MediaStore(isServer, initialData),
      deploy: new DeployStore(isServer, initialData),
    };
  }
  return store;
};
