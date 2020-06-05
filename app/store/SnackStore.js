import { action, observable, computed, toJS } from 'mobx';

class SnackStore {

  @observable variant = "";
  @observable message = "";

  @action.bound update = (k, v) => {
    this[k] = v;
  }

  @action.bound snacky = (message = '', variant = 'success', timeout = 3000) => {
    this.message = message;
    this.variant = variant;
    if (this.variant === 'error' && timeout === 3000) timeout = 6000;
    setTimeout(() => {
      this.message = '';
    }, timeout);
  }

  @action.bound onClose = () => {
    this.variant = "successs";
    this.message = "";
  }

}

export default SnackStore;
