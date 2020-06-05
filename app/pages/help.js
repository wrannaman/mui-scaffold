import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';

import Side from '../components/Nav/Side';
import Auth from '../src/Auth';
import { Button, TextField, Link, Paper, Grid, Typography } from '@material-ui/core';

import { fetchProject, sendMessage } from '../src/apiCalls/project';
import { updateUser } from '../src/apiCalls/user';


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
    position: 'relative'
  },
  flexCenterColumn: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paperItem: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 15,
    padding: 10,
  }
});

@inject('store')
@observer
class Index extends React.Component {

  state = {
    message: '',
  }

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
    this.init(pageID);
  }

  init = async () => {
    const {
      snack: { snacky },
      auth: { update, setLocalUser, user, helpSteps },
      project: { updateProject },
    } = this.props.store;
    const { query: { projectID } } = this.props.router;

    const proj = await fetchProject({ projectID });
    if (proj.success) {
      updateProject('project', proj.project);
    }
    // 
    // if (!user.intros || !user.intros.help) {
    //   update('steps', helpSteps);
    //   update('tourOpen', true);
    //   update('tourName', 'help');
    // }
  }

  closeTour = async () => {
    const { snack: { snacky }, auth: { tourName, update, setLocalUser, user } } = this.props.store;
    const { name, intros, wantToBuild, isDeveloper } = user;
    if (tourName) {
      const clone = toJS(intros);
      clone[tourName] = true;
      const res = await updateUser({ name, wantToBuild, intros: clone, isDeveloper });
      setLocalUser({ ...user, intros: clone, name, wantToBuild, isDeveloper });
    }
    update('tourOpen', false);
    update('steps', []);
    update('tourName', '');
  }

  submit = async (e) => {
    const { router: { query: { projectID } } } = this.props;
    const { snack: { snacky } } = this.props.store;
    e.preventDefault();
    const m = await sendMessage({ message: this.state.message, projectID });
    if (m.success) {
      snacky("Message Sent. We'll get back to you over email.");
      this.setState({ message: '' });
    } else {
      snacky('Error sending message', 'error');
    }
  }

  viewTemplates = () => {
    const { router: { query } } = this.props;
    this.closeTour();
    Router.push({ pathname: '/templates', query });
  }

  render() {
    const { classes, router: { query } } = this.props;
    const { project: { project: { name } } } = this.props.store;

    const items = [
      { name: 'Quick Start Guide', url: "https://blog.noco.io/quickstart" },
      { name: 'YouTube Tutorials', url: "https://www.youtube.com/channel/UCKcQrJg-N_-SoXZvWw69OyA/playlists" },
      { name: 'All Tutorials', url: "https://blog.noco.io/tag/tutorial/" },
    ]

    return (
      <Side
        showSearch={false}
        title={`${name.slice(0, 20)} ${name.length > 20 ? '...' : ''} - Help`}
      >
        <div className={classes.flexRow}>
          <div className={classes.flexColumWidth}>
            <div className={classes.flexCenterColumn}>
              <Typography variant="h6" style={{ marginTop: 25 }}>
                Help
              </Typography>
              <Typography variant="body1" style={{ marginTop: 15 }}>
                Dropp is a complex product. Before you get started you might want to take a look at a tutorial or two.
              </Typography>
            </div>
            <Grid container row id="help-tutorials">
              {items.map(({ name, url }) => (
                <Grid item xs={12} sm={6} md={4}>
                  <Paper className={classes.paperItem}>
                    <Link onClick={() => window.open(url, '_blank')}>
                      <Typography variant="body1" style={{}}>
                        {name}
                      </Typography>
                    </Link>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            <div className={classes.flexCenterColumn}>
              <Typography variant="h6" style={{ marginTop: 25 }}>
                Clone A Project
              </Typography>
              <Typography variant="body1" style={{ marginTop: 15 }}>
                Templates are a great way to bootstrap a project.
              </Typography>
                <Button
                  variant="contained"
                  style={{ marginTop: 25 }}
                  size="large"
                  id="help-clone"
                  color="primary"
                  onClick={this.viewTemplates}
                >
                  View Templates
                </Button>
            </div>
            <div className={classes.flexCenterColumn}>
              <Typography variant="h6" style={{ marginTop: 25 }}>
                Get In Touch
              </Typography>
              <Typography variant="body1" style={{ marginTop: 15 }}>
                Having trouble? Have some feedback for us?
              </Typography>
              <Paper className={classes.paperItem} style={{  }} id="help-feedback">
                <form onSubmit={this.submit} className={classes.paperItem}>
                  <TextField
                    style={{ width: 250 }}
                    multiline
                    placeholder="What can we help you with?"
                    value={this.state.message}
                    onChange={(e) => this.setState({ message: e.target.value })}
                  />
                  <Button type="submit" variant="contained" color="primary" style={{ marginTop: 15, marginBottom: 25 }}>
                    submit
                  </Button>
                </form>
              </Paper>
            </div>
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
