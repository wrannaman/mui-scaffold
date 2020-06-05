import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';

import { MenuItem, Select, FormControl, InputLabel, Button, Typography, Paper, TextField } from '@material-ui/core';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';

import DeleteIcon from '@material-ui/icons/Delete';

import { fetchRepeatables } from '../../src/apiCalls/repeatable';
import { fetchDatas, createData, deleteData } from '../../src/apiCalls/data';

const styles = theme => ({
  root: {
  },
  paper: {
    background: 'rgba(0, 0, 0, 0.05)'
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textField: {
    height: 48,
    padding: 0,
    margin: 0
  },
  white: {
    color: '#fff !important'
  },
  formControlNav: {
    width: 120,
    marginLeft: 5,
  },
  formControl: {
    width: '100%',
  }
});

@inject('store')
@observer
class DataModelsAsSelect extends React.Component {
  state = {
    shouldDelete: {},
  };

  submit = async (e) => {
    e.preventDefault();
    const { router: { query: { projectID } } }  = this.props;
    const { data: { name, update, datas } } = this.props.store;
    const clone = toJS(datas);
    const res = await createData({ name, projectID });
    if (res.success) {
      clone.push(res.data);
      update('datas', clone);
      update('name', '');
      this.fetchDatas();
    }
  }

  fetchDatas = async () => {
    const { project: { update }, data: { updateData } } = this.props.store;
    const { query: { projectID } } = this.props.router;
    const res = await fetchDatas({ projectID, limit: 25 });
    if (res.success) {
      updateData('datas', res.datas.docs);
    }
  }

  handleChange = (name) => (e) => {
    const { data: { update } } = this.props.store;
    update(name, e.target.value);
  }


  findRelationConflict = (id, datas) => {
    let hasConflict = false;
    let dataID = null;
    for (let i = 0; i < datas.length; i++) {
      if (datas[i]._id === id) {
        dataID = datas[i]._id;
        break;
      }
    }

    datas.forEach((d) => {
      if (d._id !== dataID) {
        Object.keys(d.model).forEach((field) => {
          if (typeof d.model[field] === 'object' && d.model[field].model === dataID) {
            hasConflict = `${d.name} => ${field}`;
          }
        })
      }
    })

    return hasConflict;
  }

  delete = (id) => async (e) => {
    const { data: { datas, update }, snack: { snacky } } = this.props.store;

    const hasRelationConflict = this.findRelationConflict(id, datas);
    if (hasRelationConflict) return snacky(`Relation conflict in ${hasRelationConflict}. Delete the relation before deleting this table`, 'error', 9000)

    if (!this.state.shouldDelete[id]) {
      const clone = Object.assign(this.state.shouldDelete);
      clone[id] = true;
      return this.setState({ shouldDelete: clone });
    } else {
      const deleted = await deleteData(id);
      if (deleted.success) {
        const clone = toJS(datas);
        let idx = -1;
        for (let i = 0; i < clone.length; i++) {
          if (clone[i]._id === id) {
            idx = i;
            break;
          }
        }
        clone.splice(idx, 1);
        update('datas', clone);
        snacky('Deleted');
        this.fetchDatas();
      } else {
        snacky(deleted.error, 'error');
      }

    }
  }

  setModel = async (e) => {
    const {
      data: { datas, update, setFake },
      repeatable: { updateRepeatable }
    } = this.props.store;

    let data = null;
    for (let i = 0; i < datas.length; i++) {
      if (datas[i]._id === e.target.value) {
        data = datas[i];
        break;
      }
    }

    this.props.onModelChange(data);
    if (this.props.preventSelection) return;

    update('data', {});
    update('data', data);
    setFake(data.model);
    const _dropped = {};
    Object.keys(data.model).forEach(d => _dropped[d] = false);
    const compRes = await fetchRepeatables({  project: data.project, dataID: data._id });
    if (compRes.repeatables) updateRepeatable('repeatables', compRes.repeatables);
    updateRepeatable('dropped', _dropped);
    updateRepeatable('repeatable', { name: "", model: {}, table: { add: true, export: true, filter: true, delete: true, edit: true, detail: false, detailPage: "" } });
  }

  render() {
    const { shouldDelete } = this.state;
    const { classes, showDelete, showForm, title, nav, id } = this.props;
    const { data: { name, datas, data } } = this.props.store;
    if (!data) return null;

    return (
      <div>
        <FormControl className={nav ? classes.formControlNav : classes.formControl}>
          <InputLabel
            className={nav ? classes.white : classes.inherit}
            id="data-model-select-as-select-label"
          >
            {title || 'Data Model'}
          </InputLabel>
          <Select
            labelId="data-model-select-as-select-label"
            id="data-model-select-as-select"
            value={nav ? data.id : id }
            onChange={this.setModel}
            classes={{
              icon: nav ? classes.white : classes.inherit,
            }}
            style={nav ? { color: '#fff', borderBottom: '1px solid #fff' } : {}}
          >
            {datas.map((_data, index) => (
              <MenuItem
                value={_data.id}
              >
                {_data.name}
              </MenuItem>
            ))}
            <MenuItem
              value={""}
            >
              None
            </MenuItem>
          </Select>
        </FormControl>
      </div>
    );
  }
}

DataModelsAsSelect.defaultProps = {
  showForm: true,
  showDelete: true,
  onModelChange: () => {},
  nav: true, // toggles some styling for when used in nav or not.
  id: "", // data model ID
  preventSelection: false,
};

DataModelsAsSelect.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  showForm: PropTypes.bool,
  nav: PropTypes.string,
  showDelete: PropTypes.bool,
  onModelChange: PropTypes.func,
  id: PropTypes.string,
  preventSelection: PropTypes.bool,
};

export default withRouter(withStyles(styles)(DataModelsAsSelect));
