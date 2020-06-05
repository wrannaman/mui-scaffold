import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';

import Side from '../components/Nav/Side';
import Auth from '../src/Auth';
import { ListItemSecondaryAction, List, IconButton, ListItem, ListItemText, TextField, Button, FormGroup, Typography } from '@material-ui/core';
import PermissionItem from '../components/Permission/Item';

import DeleteIcon from '@material-ui/icons/Delete';

import { fetchDatas } from '../src/apiCalls/data';
import { fetchProject, updateProject } from '../src/apiCalls/project';

const styles = theme => ({
  flexRow: {
    display: 'flex',
    flexDirection: 'row'
  },
  rowCenter: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column'
  },
  flexColumWidth: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  }
});

@inject('store')
@observer
class Index extends React.Component {

  state = {
    roleName: '',
    shouldDelete: {},
  };

  async componentDidMount() {
    this.auth = new Auth();
    const {
      auth: { checkTokenAndSetUser },
      project: { limit, page, setProjects }
    } = this.props.store;
    const { query: { pageID } } = this.props.router;
    if (!this.auth.isAuthenticated()) {
      Router.push('/');
    }
    const { token } = this.auth.getSession();
    await checkTokenAndSetUser({ token });

    this.init();
  }

  componentWillUnmount() {
    const { data: { resetData } } = this.props.store;
    resetData();
  }

  resetPermissions = () => {
    const { project: { project, update }, data: { datas }, snack: { snacky } } = this.props.store;
    const clone = Object.assign({}, toJS(project));
    datas.forEach(doc => {
      if (!project.userPermissions) project.userPermissions = {};
      project.userPermissions[doc.name] = {
        create: 'always',
        get: 'always',
        update: 'always',
        delete: 'always',
      }
    });
    update('project', clone)
  }

  init = async () => {
    const { project: { update }, data: { updateData } } = this.props.store;
    const { query: { projectID } } = this.props.router;
    const proj = await fetchProject({ projectID });
    const res = await fetchDatas({ projectID, limit: 25 });
    if (proj.success && res.success) {
      res.datas.docs.forEach(doc => {
        if (!proj.project.userPermissions) proj.project.userPermissions = {};
        proj.project.userPermissions[doc.name] = {
          create: 'always',
          get: 'always',
          update: 'always',
          delete: 'always',
        }
      });
      update('project', proj.project);
      updateData('datas', res.datas.docs);
    }
    this.handleHelp();
  }

  handleHelp = () => {
    const {
      auth: { update, user, userPermissionSteps },
    } = this.props.store;
    // if (!user.intros || !user.intros.userPermissions) {
    //   update('steps', userPermissionSteps);
    //   update('tourOpen', true);
    //   update('tourName', 'userPermissions');
    // }
  }

  submit = async (e) => {
    e.preventDefault();
    const { project: { project }, snack: { snacky } } = this.props.store;
    const clone = Object.assign({}, toJS(project));
    if (!clone.userRoles) clone.userRoles = {};
    if (this.state.roleName) {
      clone.userRoles[this.state.roleName] = project.userPermissions;
    }
    const up = { id: project.id, userPermissions: clone.userPermissions, userRoles: clone.userRoles,  }
    if (clone.defaultUserRole) up.defaultUserRole = clone.defaultUserRole;
    if (clone.defaultAdminRole) up.defaultAdminRole = clone.defaultAdminRole;
    const res = await updateProject(up);
    if (res.success) {
      snacky('saved');
      this.init();
      this.setState({ roleName: '' });
    } else {
      snacky('Uh Oh! Failed to save project.', 'error', 3000);
    }
  }

  setPermissions = (name, permissions) => (e) => {
    const { project: { project, update }, snack: { snacky } } = this.props.store;
    const clone = Object.assign({}, toJS(project));
    clone.userPermissions = Object.assign({}, clone.userPermissions, permissions);
    update('project', clone);
    this.setState({ roleName: name });
  }

  deletePermission = (name) => (e) => {
    const { project: { project, update }, snack: { snacky } } = this.props.store;

    const should = Object.assign({}, this.state.shouldDelete);
    if (!should[name]) {
      should[name] = true;
      this.setState({ shouldDelete: should });
      snacky("If you have users with this permission, \n you'll have to update each user yourself. \n You're better off changing the permissions.", 'warning', 6000);
      return setTimeout(() => {
        should[name] = false;
        this.setState({ shouldDelete: should });
      }, 3000);
    }
    const vis = project.pages.map(page => page.visibility.toLowerCase());
    if (vis.indexOf(name.toLowerCase()) !== -1) return snacky(`Please change ${project.pages[vis.indexOf(name.toLowerCase())].name} visibility settings`, 'error', 6000);

    // check if they have a visibility setting on pages.

    const clone = Object.assign({}, toJS(project));
    delete clone.userRoles[name]
    update('project', clone);
    this.submit({ preventDefault: () => {} });
    this.setState({ roleName: '', shouldDelete: {} });
  }

  makeDefault = (name, prop) => (e) => {
    const { project: { project, update }, snack: { snacky } } = this.props.store;
    const clone = Object.assign({}, toJS(project));
    clone[prop] = name;
    update('project', clone);
    // give it time to update
    setTimeout(() => {
      this.submit({ preventDefault: () => {} });
    }, 300);
  }

  render() {
    const { roleName, shouldDelete,  } = this.state;
    const { classes } = this.props;
    const { data: { datas }, project: { project: { name, userRoles, defaultUserRole, defaultAdminRole } } } = this.props.store;

    return (
      <Side
        showSearch={false}
        title={`${name} - User Permissions`}
      >
        <div className={classes.rowCenter} style={{ marginTop: 25, flexDirection: 'column' }}>
          <Typography variant="h6" id="userPerms-top">
            Configure User Roles
          </Typography>
          <Typography variant="body1">
            These are the permissions that different user types will have in your application.
          </Typography>
          <Typography variant="body2">
            There are 3 types of permissions: <br />
            - never: users will never be able to perform this action <br/>
            - always: users will always be able to perform this action <br/>
            - owned: You *must* have a field on the data model that is named "user" and is bound to the user's id for this to work.
          </Typography>
        </div>
        <form onSubmit={this.submit}>
          <div className={classes.rowCenter} id="userPerms-names">
            <TextField
              value={this.state.roleName}
              onChange={(e) => this.setState({ roleName: e.target.value.replace(/ /g, '') })}
              label="Role Name"
            />
          </div>
          <FormGroup className={classes.fields}>
            {datas.length > 0 && datas.map(d => (<PermissionItem key={d.id} data={d} />))}
          </FormGroup>
          <div className={classes.rowCenter}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              style={{ margin: '0 auto', marginTop: 25, }}
            >
              Save
            </Button>
          </div>

        </form>
        <div id="userPerms-admin">
          <Typography variant="h6">
            User Roles
          </Typography>
          <List dense>
            {userRoles && Object.keys(userRoles).length > 0 && Object.keys(userRoles).map(r => (
              <ListItem button key={r} onClick={this.setPermissions(r, userRoles[r])} selected={roleName === r}>
                <ListItemText
                  primary={`${r} ${r === defaultUserRole ? '- Default User Role' : ''} ${r === defaultAdminRole ? '- Default Admin Role' : ''}`}
                />
                <ListItemSecondaryAction>
                  {r !== defaultUserRole && (
                    <Button
                      size="small"
                      variant="outlined"
                      aria-label="make default User Role"
                      onClick={this.makeDefault(r, 'defaultUserRole')}
                    >
                      Make Default User Role
                    </Button>
                  )}
                  {r !== defaultAdminRole && (
                    <Button
                      size="small"
                      variant="outlined"
                      aria-label="make admin Role"
                      onClick={this.makeDefault(r, 'defaultAdminRole')}
                    >
                      Make Admin Role
                    </Button>
                  )}
                  <IconButton edge="end" aria-label="delete" onClick={this.deletePermission(r)}>
                    <DeleteIcon color={shouldDelete[r] ? "error" : 'inherit'} />
                  </IconButton>

                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </div>
      </Side>
    );
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Index));
