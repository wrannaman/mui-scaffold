import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import _ from 'lodash';
import {
  TextField,
  Button,
} from '@material-ui/core';
import { savePage } from '../../src/apiCalls/page';
import { saveRepeatable } from '../../src/apiCalls/repeatable';


const styles = theme => ({
  row: {
    // maxWidth: 500,
    width: '100%',
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});

@inject('store')
@observer
class NodeActions extends React.Component {

  state = {
    disabled: true,
    doDelete: false,
  };

  delete = () => {
    if (!this.state.doDelete) {
      this.setState({ doDelete: true });
      return setTimeout(() => {
        this.setState({ doDelete: false });
      }, 3000);
    }
    const { page: { update, nodes, editing } } = this.props.store;
    nodes.delete(editing);
    update('render', new Date().getTime());
    update('editing', '');
  }

  saveRepeatable = async () => {
    const { router: { query: { repeatableID, projectID } } } = this.props;
    const { snack: { snacky }, page: { nodes }, repeatable: { repeatables, workingIndex } } = this.props.store;

    const repeat = repeatables[workingIndex];
    const toJSON = nodes.toJSON();

    const res = await saveRepeatable({
      styles: repeat.styles,
      boundDataModelID: repeat.boundDataModelID,
      boundDataModel: repeat.boundDataModel,
      id: repeatableID,
      node: toJSON,
      project: projectID,
      type: 'basic',
      name: repeat.name,
      settings: repeat.settings,
      code: repeat.code,
    });
    if (res.success) snacky('saved');
    else snacky('error! ', 'error');
  }

  save = async () => {
    const { router: { pathname, query: { pageID, projectID } } } = this.props;
    if (pathname.indexOf('component') !== -1) return this.saveRepeatable();
    const { snack: { snacky }, page: { boundDataModel, nodes, name, displayName, type, auth, visibility, order, showNav } } = this.props.store;
    const toJSON = nodes.toJSON();
    const res = await savePage({ boundDataModel, type, id: pageID, page: toJSON, project: projectID, name, displayName, auth, visibility, order, showNav });
    if (res.success) snacky('saved');
    else if (res.error) snacky(res.error, 'error');
    else snacky('error! ', 'error');
  }

  onChange = (key) => (e) => {
    const { page: { update }, project: { project, pageIndex, updateProject } } = this.props.store;
    const projectClone = toJS(project)
    projectClone.pages[pageIndex][key] = e.target.value;
    update(key, e.target.value);
    updateProject('project', projectClone);
  }

  render() {
    const { doDelete } = this.state;
    const { classes, item, embedded, showSave, router: { pathname } } = this.props;
    const { page: { name, editing, layoutMap }, repeatable: { repeatables, workingIndex } } = this.props.store;

    const isPage = pathname.indexOf('pages') !== -1;
    const isComponent = pathname.indexOf('component') !== -1;

    let repeat = {};
    let disabled = isPage && !name;
    if (isComponent) {
      if (repeatables.length > 0 && repeatables[workingIndex]) repeat = repeatables[workingIndex];
      disabled = isComponent && !repeat.name
    }

    return (
      <div>
        <div className={classes.row}>
          <Button onClick={this.delete} variant="outlined" color="primary">{doDelete ? "Confirm Delete" : "Delete"}</Button>
          {showSave && (<Button onClick={this.save} variant="contained" color="primary" disabled={disabled}> Save </Button>)}
        </div>
      </div>
    );
  }
}

NodeActions.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(NodeActions));
