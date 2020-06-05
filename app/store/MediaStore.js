import { action, observable, computed, toJS } from 'mobx';

class MediaStore {

  @observable medias = [];
  @observable media = {};
  @observable limit = 5;
  @observable offset = 0;
  @observable totalDocs = 0;

  @action.bound update = (k, v) => this[k] = v;
  @action.bound updateMedia = (k, v) => this[k] = v;

  @action.bound setMedia = ({ docs, limit, offset, totalDocs }) => {
    this.medias = docs;
    this.limit = limit
    this.offset = offset;
    this.totalDocs = totalDocs;
  }

}

export default MediaStore;
