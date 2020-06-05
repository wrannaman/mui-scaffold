import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';

import Side from '../components/Nav/Side';
import Auth from '../src/Auth';
import { Paper, Link, Button, Grid, Typography } from '@material-ui/core';

import { updateUser } from '../src/apiCalls/user';
import { fetchProject, fetchProjectTemplates } from '../src/apiCalls/project';
import Template from '../components/Template/Template';
import RightDrawer from '../components/Nav/RightDrawer';

const styles = theme => ({
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  flexColumWidth: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  paperItem: {
    padding: 25,
    margin: 25,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const items = [
  { name: 'Quick Start Guide', url: "https://blog.noco.io/quickstart" },
  { name: 'YouTube Tutorials', url: "https://www.youtube.com/channel/UCKcQrJg-N_-SoXZvWw69OyA/playlists" },
  { name: 'All Tutorials', url: "https://blog.noco.io/tag/tutorial/" },
]

@inject('store')
@observer
class Index extends React.Component {

  state = {
    step: 0,
    drawerIndex: 0,
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

    this.init();
  }

  closeTour = async () => {
    const { router: { query } } = this.props;
    const { snack: { snacky }, auth: { tourName, update, setLocalUser, user } } = this.props.store;
    const { intros } = user;
    const clone = toJS(intros);
    clone.school = true;
    const res = await updateUser({ intros: clone });
    setLocalUser({ ...user, intros: clone });
    console.log('setting local user ', clone);
    Router.push({ pathname: '/help', query })
  }

  init = async () => {
    const { project: { update } } = this.props.store;
    // fetch templates
    const res = await fetchProjectTemplates({});
    update("templates", res.templates.docs);
  }

  click = (name) => (e) => {
    const { snack: { snacky } } = this.props.store;
    this.setState({ step: this.state.step + 1 });
    snacky('Awesome!');
    console.log('step ', this.state.step);
    if (this.state.step === 2) return this.closeTour();
  }

  render() {
    const { step } = this.state;
    const { classes } = this.props;
    const { project: { templates } } = this.props.store;

    return (
      <div className={classes.flexRow}>
        <div className={classes.flexColumWidth}>
          <Grid container spacing={4}>
            {step === 0 && (
              <Grid item xs={12} className={classes.flexColumn} justify="center" direction="column" alignContent="center" alignItems="center" style={{ marginTop: 25 }}>
                <Typography variant="h5">
                  Dropp School
                </Typography>
                <Typography variant="body1">
                  Dropp is complicated.
                  So let's go through a few of the basics.
                  It's only going to take 10 minutes.
                </Typography>
              </Grid>
            )}
            {step === 0 && (
              <Grid item xs={12} className={classes.flexColumn} justify="center" direction="column" alignContent="center" alignItems="center">
                <Typography variant="h6">
                  Clone a project
                </Typography>

                <Typography variant="body1">
                  For your first project, you must clone one of the following to get started.
                  You can later delete it but to learn how to use Dropp, please select one from the list below.
                </Typography>

                <div className={classes.flexRow}>
                  {templates.map((t, i) => <Template index={i} template={t} onClick={this.click('template')}/>)}
                </div>
                <Button
                  onClick={this.click('')}
                  style={{ marginTop: 25 }}
                  variant="outlined"
                  color="error"
                >
                  Skip
                </Button>
              </Grid>
            )}
            {step === 1 && (
              <React.Fragment>
                <Grid item xs={10} className={classes.flexColumn} justify="center" direction="column" alignContent="center" alignItems="center">
                  <Typography variant="h6" style={{ marginTop: 25 }}>
                    Drag and Drop Elements to Edit Your Project
                  </Typography>
                  <Typography variant="body1">
                    Now that you've cloned your project, you can start editing your project.
                  </Typography>
                  <Typography variant="body1">
                    In Dropp, we have pages and components.
                    Pages are entire pages of the application and components are the parts of your app.
                  </Typography>
                  <Typography variant="body1">
                    On the right hand side are the elements you can drag and drop onto the page.
                  </Typography>

                  <video
                    autoPlay
                    controls
                    loop
                    style={{ width: 500, marginTop: 25, borderRadius: 10 }}
                  >
                    <source src={"https://s3.us-west-1.wasabisys.com/noco/marketing/drag_and_drop_demo.mp4"} type="video/mp4" />
                    Your browser does not support HTML5 video.
                  </video>

                  <Button
                    onClick={this.click('')}
                    style={{ marginTop: 25 }}
                    variant="outlined"
                    color="primary"
                  >
                    Got It!
                  </Button>
                </Grid>
                <Grid item xs={2} className={classes.flexColumn} justify="center" direction="column" alignContent="center" alignItems="center">
                  <RightDrawer index={1} />
                </Grid>
              </React.Fragment>
            )}
            {step === 2 && (
              <Grid item xs={12} className={classes.flexColumn} justify="center" direction="column" alignContent="center" alignItems="center">
                <Typography variant="body1">
                  Now that you know how to drag and drop pieces to build your app, you should really watch a tutorial or two on how to
                  build things in Dropp.
                </Typography>
                <Grid container column id="help-tutorials" className={classes.flexColumn}>
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
                <Button
                  onClick={this.click('')}
                  style={{ marginTop: 25 }}
                  variant="outlined"
                  color="primary"
                >
                  Understood!
                </Button>
              </Grid>
            )}
          </Grid>

        </div>
      </div>
    );
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Index));
