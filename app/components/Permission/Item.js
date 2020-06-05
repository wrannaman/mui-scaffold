import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { capitalize } from 'lodash';

import { FormControl, InputLabel, Select, MenuItem, Divider, Switch, FormControlLabel, FormGroup, Typography } from '@material-ui/core';

const styles = theme => ({
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },
  flexRowItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    border: '1px solid rgba(81, 48, 164, 0.1)',
    width: 150,
    margin: 5,
    padding: 5,
  },
});

@inject('store')
@observer
class PermissionItem extends React.Component {
  state = {};

  handleChange = (key, perm) => (e) => {

  }

  handleCondition = (key, perm) => (e) => {
    const { project: { project, update } } = this.props.store;
    const clone = Object.assign({}, toJS(project));
    if (!clone.userPermissions[key][perm]) clone.userPermissions[key][perm] = {};
    clone.userPermissions[key][perm] = e.target.value;
    update('project', clone);
  }

  render() {
    const { project: { project: { userPermissions } } } = this.props.store;
    const { classes, router, data } = this.props;

    const actions = ['create', 'get', 'update', 'delete'];
    const conditions = ['public', 'always', 'never', 'owned'];

    if (!userPermissions || Object.keys(userPermissions).length === 0) return null;

    return (
      <div className={classes.flexRow}>
        <Typography variant="h6" style={{ padding: 5, width: 150 }}>
          {capitalize(data.name)}
        </Typography>
        {actions.map(action => {
          if (!userPermissions || !userPermissions[data.name] || !userPermissions[data.name][action]) return null;
          return (
            <div className={classes.flexRowItem} key={`${data.name}-${action}`}>
              <Typography variant="body1">
                {capitalize(action)}
              </Typography>
              <FormControl
                className={classes.formControl}
                classes={{
                  root: classes.rootLabel
                }}
              >
               <InputLabel htmlFor="condition">Condition</InputLabel>
               <Select
                 value={userPermissions[data.name][action]}
                 onChange={this.handleCondition(data.name, action)}
                 inputProps={{
                   name: 'condition',
                 }}
                 style={{ width: 140 }}
               >
                 {conditions.map(condition => (<MenuItem key={condition} value={condition}>{condition}</MenuItem>))}
               </Select>
              </FormControl>
            </div>
          );
        })}

      </div>
    );
  }
}

PermissionItem.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(PermissionItem));
