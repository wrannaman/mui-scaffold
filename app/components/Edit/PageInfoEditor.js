import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import _ from 'lodash';
import {
  TextField,
  Typography,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Icon,
} from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

import BoundPageModel from './BoundPageModel';

const styles = theme => ({
  column: {
    // maxWidth: 500,
    width: '100%',
    flexDirection: 'column',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  textField: {
    width: '90%'
  },
  formControl: {
    width: '90%',
    marginTop: 24,
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  }
});

@inject('store')
@observer
class PageNameEditor extends React.Component {

  state = {
    disabled: true,
    doDelete: false,
    show: false,
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

  onChange = (key) => (e) => {
    const { page: { update }, project: { project, pageIndex, updateProject } } = this.props.store;
    const projectClone = toJS(project)
    if (key === 'name') e.target.value = e.target.value.replace(/[^A-Za-z]/g, '');
    projectClone.pages[pageIndex][key] = e.target.value;
    update(key, e.target.value);
    updateProject('project', projectClone);
    update('render', new Date().getTime());
  }

  render() {
    const { doDelete } = this.state;
    const { classes, item, embedded } = this.props;
    const { project: { project: { userRoles, pages }, }, data: { datas }, page: { showNav, order, auth, type, name, displayName, visibility, editing, layoutMap } } = this.props.store;
    const userRoleNames = userRoles ? Object.keys(userRoles) : [];

    if (!name) return null;

    return (
      <div className={classes.column} style={{ justifyContent: 'flex-start', marginBottom: 20 }}>
        <div className={classes.row}>
          <Typography variant="body1">Page Details</Typography>
          <Tooltip title={`${this.state.show ? 'Hide' : 'Show'} Page Details`}>
            <IconButton
              className={classes.closeButton}
              onClick={() => this.setState({ show: !this.state.show })}
            >
              {this.state.show ? (<RemoveIcon />) : (<AddIcon />)}
            </IconButton>
          </Tooltip>
        </div>
        {this.state.show && (
          <React.Fragment>
            <TextField
              id="standard-basic"
              className={classes.textField}
              label="Page Name"
              value={name}
              onChange={this.onChange("name")}
              margin="normal"
            />
            <TextField
              id="standard-basic"
              className={classes.textField}
              label="Page Display Name"
              helperText="The Page Name Your Users Will See"
              value={displayName}
              onChange={this.onChange("displayName")}
              margin="normal"
            />
            <FormControl className={classes.formControl}>
             <InputLabel htmlFor="pageType">Page Type</InputLabel>
             <Select
               value={type}
               onChange={this.onChange('type')}
               inputProps={{
                 name: 'pageType',
               }}
             >
               <MenuItem value={'default'}>Default</MenuItem>
               <MenuItem value={'detail'}>Detail</MenuItem>
             </Select>
             <FormHelperText>
              Detail pages have access to data from one data model.
             </FormHelperText>
            </FormControl>
            <FormControl className={classes.formControl}>
             <InputLabel htmlFor="auth">Authentication</InputLabel>
             <Select
               value={auth}
               onChange={this.onChange('auth')}
               inputProps={{
                 name: 'auth',
               }}
             >
               <MenuItem value={'authenticated'}>Authenticated</MenuItem>
               <MenuItem value={'unauthenticated'}>Unauthenticated</MenuItem>
             </Select>
             <FormHelperText>Do people need to be logged in to see this page?</FormHelperText>
            </FormControl>
            <FormControl className={classes.formControl}>
             <InputLabel htmlFor="showNav">Show Nav</InputLabel>
             <Select
               value={showNav}
               onChange={this.onChange('showNav')}
               inputProps={{
                 name: 'showNav',
               }}
             >
               <MenuItem value={true}>Yes</MenuItem>
               <MenuItem value={false}>No</MenuItem>
             </Select>
             <FormHelperText>Do people need to be logged in to see this page?</FormHelperText>
            </FormControl>
            {false && (
              <FormControl className={classes.formControl}>
               <InputLabel htmlFor="visibility">Visibility</InputLabel>
               <Select
                 value={visibility}
                 onChange={this.onChange('visibility')}
                 inputProps={{
                   name: 'visibility',
                 }}
               >
                 <MenuItem value={'all'}>all</MenuItem>
                 {userRoleNames.map((_name) => (<MenuItem value={_name}>{_.capitalize(_name)}</MenuItem>))}
               </Select>
               <FormHelperText>Which user roles can see this page?</FormHelperText>
              </FormControl>
            )}
            {type !== 'detail' && pages && pages.length > 0 && (
              <FormControl className={classes.formControl}>
               <InputLabel htmlFor="auth">Page Order</InputLabel>
               <Select
                 value={order}
                 onChange={this.onChange('order')}
                 inputProps={{
                   name: 'order',
                 }}
               >
                {pages.map((p, i) => (<MenuItem key={`${p.id}-${i}`} value={i}>{i}</MenuItem>))}
               </Select>
               <FormHelperText>Page order for navigation.</FormHelperText>
              </FormControl>
            )}
            {type === 'detail' && (
              <BoundPageModel />
            )}
          </React.Fragment>
        )}
      </div>
    );
  }
}

PageNameEditor.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(PageNameEditor));
