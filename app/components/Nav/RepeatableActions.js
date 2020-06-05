import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';

import { Paper, FormControl, InputLabel, Select, Avatar, MenuItem, InputBase, IconButton, Menu, Drawer, AppBar, List, Toolbar, Divider, Typography, Tooltip, Fab } from '@material-ui/core';

import DataModelsAsSelect from '../Data/DataModelsAsSelect';

import AddIcon from '@material-ui/icons/Add';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import SaveIcon from '@material-ui/icons/Save';

import './styles.css';

import { saveRepeatable, deleteRepeatable, fetchRepeatables } from '../../src/apiCalls/repeatable';

const ALLOWED_COMPONENT_TYPES = ['repeatable', 'form', 'basic', 'code'];

const styles = theme => ({
  root: {
  },
  flexRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fab: {
    marginLeft: 10
  },
  formControl: {
    // width: 200,
    width: 120,
  },
  white: {
    color: '#fff !important'
  }
});

@inject('store')
@observer
class RepeatableActions extends React.Component {
  state = {};

  componentDidMount() {
    setTimeout(() => {
      this.init();
    }, 300);
  }

  init = async () => {
    const { repeatable: { update } } = this.props.store;
    const { router: { query: { pageID, projectID } } } = this.props;
    const repeat = await fetchRepeatables({ project: projectID })
    if (repeat.repeatables) update('repeatables', repeat.repeatables)
  }

  checkBoundValue = () => {

  }

  checkBoundValues = (nodes) => {

  }

  saveRepeatable = async () => {
    const { router: { query: { repeatableID, projectID } } } = this.props;
    const { snack: { snacky }, page: { nodes }, repeatable: { repeatables, workingIndex } } = this.props.store;

    const clone = toJS(repeatables).slice();
    const repeat = clone[workingIndex];
    const toJSON = nodes.toJSON();

    if (repeat.type === 'form') {
      const bound = nodes.checkFormBoundValues();
      const unBound = [];
      for (let i = 0; i < bound.length; i++) {
        const keys = Object.keys(bound[i]);
        if (!bound[i][keys[0]]) unBound.push(keys[0]);
      }
      if (unBound.length > 0) return snacky(`The following items need to be bound to a data field: \n -${unBound.join('\n -')}`, 'error', 9000);
      if (!repeat.boundDataModelID) return snacky('You must bind a data model for a form to work.');
    }

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

    this.init();
    if (res.success) snacky('saved');
    else if (res.error) snacky(res.error, 'error');
    else snacky('error! ', 'error');
  }

  showNewRepeatable = () => {
    const { repeatable: { update } } = this.props.store;
    update('showNewRepeatableDialog', true);
  }

  changeRepeatable = (e) => {
    const { router: { query } } = this.props;
    const { repeatable: { update, repeatables, workingIndex } } = this.props.store;
    let idx = 0;
    for (let i = 0; i < repeatables.length; i++) {
      if (repeatables[i]._id === e.target.value) {
        idx = i;
        break;
      }
    }
    update('workingIndex', idx);
    Router.push({ pathname: '/component', query: {...query, repeatableID: repeatables[idx]._id }, shallow: true });
  }

  deleteRepeatable = async () => {
    const { router: { query: { projectID, repeatableID } } } = this.props;
    const { snack: { snacky }, project: { update, project, pageIndex } } = this.props.store;
    if (!this.state.confirmDelete) {
      this.setState({ confirmDelete: true })
      return setTimeout(() => {
        this.setState({ confirmDelete: false })
      }, 3000)
    }
    this.setState({ confirmDelete: false });
    const deleted = await deleteRepeatable({ id: repeatableID, projectID });
    if (deleted.success) snacky('deleted');
    if (deleted.error) return snacky(deleted.error, 'error', 6000);
    Router.push({ pathname: '/component', query: { projectID, repeatableID: '' }, shallow: true });

    this.init();
  }

  handleTypeChange = (e) => {
    const {
      repeatable: { update, repeatables, workingIndex },
      page: { resetComponents, setRepeatableNodes, resetNodes },
    } = this.props.store;
    const clone = toJS(repeatables).slice();
    clone[workingIndex].type = e.target.value;
    update('repeatables', clone);
    if (e.target.value === 'form') resetComponents();
    if (e.target.value === 'repeatable') setRepeatableNodes();
    if (e.target.value === 'code') {
      resetNodes();
    }
  }

  onModelChange = async (selected) => {
    const {
      snack: { snacky },
      page: { nodes, updatePage },
      data: { data, updateData, resetData },
      repeatable: { update, repeatables, workingIndex }
    } = this.props.store;

    const isModelChange = repeatables[workingIndex].boundDataModel !== selected.name;
    if (!isModelChange) return;
    const json = nodes.toJSON();
    const string = JSON.stringify(json);
    const containsBoundValue = string.indexOf(`boundValue":{"model":"${data.name}"`);

    if (containsBoundValue !== -1) {
      return snacky(`You have a value bound to ${data.name}. Please remove bound values in order to switch data types.`, 'error', 7000);
    }
    resetData();


    const clone = toJS(repeatables).slice();
    clone[workingIndex].boundDataModel = selected.name;
    clone[workingIndex].boundDataModelID = selected._id;
    if (clone[workingIndex].settings.searchFields) clone[workingIndex].settings.searchFields = {};
    update('repeatables', clone);
    updateData('data', selected);
    setTimeout(() => {
      updatePage('render', new Date().getTime());
    });
  }

  render() {
    const { confirmDelete } = this.state;
    const { pages } = this.props;
    const {
      project: { project, pageIndex },
      repeatable: { repeatables, workingIndex }
    } = this.props.store;
    const { classes, router: { pathname } } = this.props;
    const onComponentPage = pathname.indexOf('/component') !== -1;
    const onIntroPage = pathname.indexOf('/intro') !== -1;
    const repeatable = repeatables[workingIndex];
    return (
      <div className={classes.flexRow}>
        {(onComponentPage || onIntroPage) && repeatables.length > 0 && typeof workingIndex !== 'undefined' && repeatables[workingIndex] && (
          <div className={classes.flexRow} style={{ marginLeft: 15 }}>
            <FormControl className={classes.formControl}>
              <InputLabel
                className={classes.white}
                htmlFor="page"
              >
                Component
              </InputLabel>
              <Select
                value={repeatables[workingIndex]._id}
                onChange={this.changeRepeatable}
                style={{ color: '#fff', borderBottom: '1px solid #fff' }}
                classes={{
                  icon: classes.white,
                }}
                inputProps={{
                  name: 'component',
                }}
              >
              {repeatables.filter(r => ALLOWED_COMPONENT_TYPES.indexOf(r.type) !== -1).map((repeatable) => (<MenuItem key={repeatable._id} value={repeatable._id}>{repeatable.name}</MenuItem>))}
              </Select>
            </FormControl>
          </div>
        )}



        {(onComponentPage || onIntroPage) && (
          <div className={classes.flexRow} style={{ marginLeft: 15 }}>
            <Tooltip title="Create New Component">
              <Fab size="small" color="primary" aria-label="add" className={classes.fab} onClick={this.showNewRepeatable}>
                <AddIcon />
              </Fab>
            </Tooltip>
            <Tooltip title="Delete Component">
              <Fab size="small" color="primary" aria-label="delete" className={classes.fab} onClick={this.deleteRepeatable}>
                <DeleteForeverIcon style={{ color: confirmDelete ? 'red' : '#fff' }} />
              </Fab>
            </Tooltip>
            <Tooltip title="Save Component">
              <Fab size="small" color="primary" aria-label="save" className={classes.fab} onClick={this.saveRepeatable}>
                <SaveIcon style={{ color: '#fff' }} />
              </Fab>
            </Tooltip>
          </div>
        )}
      </div>
    );
  }
}

RepeatableActions.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(RepeatableActions));
