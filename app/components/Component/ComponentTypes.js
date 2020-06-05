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

import GlobalSnack from '../Shared/GlobalSnack';

import { deleteRepeatable } from '../../src/apiCalls/repeatable';
import { createData } from '../../src/apiCalls/data';

import _ from 'lodash';


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
class DataTypes extends React.Component {
  state = {
    shouldDelete: {},
  };

  submit = async (e) => {
    e.preventDefault();
    const { router: { query: { projectID } } } = this.props;
    const { data: { name, update, datas } } = this.props.store;
    const clone = Array.from(datas);
    const res = await createData({ name, projectID });
    if (res.success) {
      clone.push(res.data);
      update('datas', clone);
      update('name', '');
    }
  }

  handleChange = (name) => (e) => {
    const { repeatable: { update, repeatable } } = this.props.store;
    const clone = Object.create(toJS(repeatable));
    clone[name] = e.target.value;
    update('repeatable', clone);
  }

  delete = (id) => async (e) => {
    const { router: { query: { projectID } } } = this.props;
    const { repeatable: { repeatables, update }, snack: { snacky } } = this.props.store;
    if (!this.state.shouldDelete[id]) {
      const clone = Object.assign({}, this.state.shouldDelete);
      clone[id] = true;
      return this.setState({ shouldDelete: clone });
    } else {
      const deleted = await deleteRepeatable({ id, projectID });
      if (deleted.success) {
        const clone = toJS(repeatables);
        let idx = -1;
        for (let i = 0; i < clone.length; i++) {
          if (clone[i]._id === id) {
            idx = i;
            break;
          }
        }
        clone.splice(idx, 1);
        update('repeatables', clone);
        snacky('Deleted');
      } else {
        snacky(deleted.error, 'error');
      }
    }
  }

  setRepeatable = (repeatable) => async () => {
    const { repeatable: { update }, data: { data } } = this.props.store;
    const _dropped = {};
    Object.keys(data.model).forEach(d => _dropped[d] = false);
    if (!repeatable.table) repeatable.table = {};
    update('repeatable', repeatable);
    update('dropped', Object.assign(_dropped, repeatable.model));
  }

  render() {
    const { shouldDelete } = this.state;
    const { classes, type, showTitle } = this.props;
    const { data: { data }, repeatable: { name, repeatables, repeatable } } = this.props.store;
    return (
      <div>
        {showTitle && (
          <Typography variant="h5">
            {_.capitalize(type)} Views
          </Typography>
        )}
        <List dense>
          {repeatables.map((_repeatable) => type && _repeatable.data && _repeatable.data._id && _repeatable.type === type && _repeatable.data._id === data.id &&  (
            <ListItem button key={_repeatable._id} onClick={this.setRepeatable(_repeatable)} selected={repeatable._id === _repeatable._id}>
              <ListItemText
                primary={_repeatable.name}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="delete" onClick={this.delete(_repeatable._id)}>
                  <DeleteIcon color={shouldDelete[_repeatable._id] ? "error" : 'inherit'} />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        {false && (
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
        <GlobalSnack />
      </div>
    );
  }
}

DataTypes.defaultProps = {
  type: "",
  showTitle: true
};

DataTypes.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  type: PropTypes.string,
  showTitle: PropTypes.bool,
};

export default withRouter(withStyles(styles)(DataTypes));
