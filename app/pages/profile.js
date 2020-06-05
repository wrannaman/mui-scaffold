import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';

import Side from '../components/Nav/Side';
import Auth from '../src/Auth';
import { TextField, Typography, Paper } from '@material-ui/core';

import { fetchProjects } from '../src/apiCalls/project';

const styles = theme => ({
  flexRow: {
    display: 'flex',
    flexDirection: 'row'
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column'
  },
  flexColumWidth: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  paper: {
    width: '80%',
    marginTop: 25,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  }
});

@inject('store')
@observer
class Index extends React.Component {

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

  init = async () => {
    const { project: { limit, page, setProjects } } = this.props.store;
    const res = await fetchProjects({ limit: 1000, page: 0 });
    if (res.success) setProjects(res.projects);
  }
  render() {
    const { classes } = this.props;
    const { auth: { user }, project: { projects } } = this.props.store;
    return (
      <Side
        showSearch={false}
        title={`Profile`}
      >
        <div className={classes.flexRow}>
          <div className={classes.flexColumWidth}>
              <Paper className={classes.paper}>
                <TextField
                  value={user.email}
                  placeholder={"Email"}
                  helperText="Email"
                  disabled
                  style={{ width: 250 }}
                />
              </Paper>
              <Paper className={classes.paper} style={{ width: '30%' }}>
                <Typography variant="h6">
                  {projects.length} Total Projects
                </Typography>
              </Paper>
          </div>
        </div>
      </Side>
    );
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Index));
