import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';

import { Button, Typography, Paper, TextField } from '@material-ui/core';

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
  }
});

@inject('store')
@observer
class DataModels extends React.Component {
  state = {
    shouldDelete: {},
  };

  submit = async (e) => {
    e.preventDefault();
    const { router: { query: { projectID } } }  = this.props;
    const { data: { name, update, datas }, snack: { snacky } } = this.props.store;
    const clone = toJS(datas);
    if (name === 'new') return snacky('You cannot name your model "new"', 'error', 6000);

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
    const { data: { update }, snack: { snacky } } = this.props.store;
    if (e.target.value === 'new') return snacky('You cannot name your model "new"', 'error', 6000);
    if (e.target.value === 'user') return snacky('You cannot name your model "user"', 'error', 6000);
    if (e.target.value === 'auth') return snacky('You cannot name your model "auth"', 'error', 6000);
    if (e.target.value === 'media') return snacky('You cannot name your model "media"', 'error', 6000);
    update(name, e.target.value.replace(/[^A-Za-z]/g, ''));
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
      if (d._id !== dataID && d.model) {
        Object.keys(d.model).forEach((field) => {
          if (typeof d.model[field] === 'object' && d.model[field].model === dataID) {
            hasConflict = `${d.name} => ${field}`;
          }
        });
      }
    });

    return hasConflict;
  }

  delete = (id) => async (e) => {
    const { data: { datas, update }, snack: { snacky } } = this.props.store;

    const hasRelationConflict = this.findRelationConflict(id, datas);
    if (hasRelationConflict) return snacky(`Relation conflict in ${hasRelationConflict}. Delete the relation before deleting this table`, 'error', 9000)

    if (!this.state.shouldDelete[id]) {
      const clone = Object.assign(this.state.shouldDelete);
      clone[id] = true;
      this.setState({ shouldDelete: clone });
      return setTimeout(() => {
        delete clone[id];
        this.setState({ shouldDelete: clone });
      }, 3000);
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
        snacky(deleted.error, 'error', 9000);
      }
    }
  }

  setModel = (data) => async () => {
    if (this.props.onModelChange) this.props.onModelChange(data);
    if (this.props.preventSelection) return;
    if (!data.model) data.model = {};
    const {
      data: { update, setFake },
      repeatable: { updateRepeatable }
    } = this.props.store;
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
    const { classes, showDelete, showForm, title } = this.props;
    const { data: { name, datas, data } } = this.props.store;
    if (!data) return null;

    return (
      <div>
        <Typography variant="h5">
          { title || 'Data Models (Tables)' }
        </Typography>
        <List dense>
          {datas.map((_data, i) => (
            <ListItem button key={_data._id} onClick={this.setModel(_data)} selected={data._id === _data._id} id={i === 0 ? 'data-model' : `data-model-${i}`}>
              <ListItemText
                primary={_data.name}
              />
              {showDelete && _data.deletable && (
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="delete" onClick={this.delete(_data._id)}>
                    <DeleteIcon color={shouldDelete[_data._id] ? "error" : 'inherit'} />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
        </List>
        {showForm && (
          <Paper className={classes.paper}>
            <form onSubmit={this.submit} className={classes.row}>
              <TextField
                label="New Data Model"
                className={classes.textField}
                value={name}
                onChange={this.handleChange('name')}
                margin="normal"
              />
              <Button
                className={classes.textField}
                type="submit"
                disabled={!name}
              >
                Save
              </Button>
            </form>
          </Paper>
        )}
      </div>
    );
  }
}

DataModels.defaultProps = {
  showForm: true,
  showDelete: true,
  onModelChange: () => {},
  preventSelection: false,
}

DataModels.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  showForm: PropTypes.bool,
  showDelete: PropTypes.bool,
  onModelChange: PropTypes.func,
  preventSelection: PropTypes.bool,
};

export default withRouter(withStyles(styles)(DataModels));
