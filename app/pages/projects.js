import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';

import Side from '../components/Nav/Side';
import Auth from '../src/Auth';
import ProjectCard from '../components/Project/ProjectCard';
import Skeleton from '@material-ui/lab/Skeleton';

import { Grid, Box, Button, Typography, Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import { getPage } from '../src/apiCalls/page';
import { fetchProjects, createProject } from '../src/apiCalls/project';

const styles = theme => ({
  root: {
     flexGrow: 1,
     flex: 1,
   },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column'
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    flexWrap: 'wrap',
  },
  fabWrap: {
    // position: 'relative'
  },
  fab: {
    position: 'absolute',
    bottom: 25,
    right: 25
  },
  center: {
    margin: '0 auto',
    width: '90%'
  },
  flexCentered: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

@inject('store')
@observer
class Projects extends React.Component {
  state = {
    disabled: false,
    waiting: true,
  }
  async componentDidMount() {
    this.auth = new Auth();
    const { auth: { checkTokenAndSetUser } } = this.props.store;
    if (!this.auth.isAuthenticated()) {
      Router.push('/');
    }
    const { token } = this.auth.getSession();
    await checkTokenAndSetUser({ token });
    setTimeout(() => this.init(), 500);

    setTimeout(() => {
      const { project: { projects } } = this.props.store;
      if (projects.length === 0) this.init();
    }, 5000);
  }

  init = async () => {
    const { project: { limit, page, setProjects  }, auth: { user, update, projectSteps } } = this.props.store;
    const res = await fetchProjects({ limit, page });
    if (res.success) setProjects(res.projects);
    this.setState({ waiting: false })

    // if (!user.intros || !user.intros.welcome) {
    //   update('learnType', 'welcome');
    //   update('welcomeDialog', true);
    // }
  }

  createProject = async () => {
    const { snack: { snacky } } = this.props.store;
    this.setState({ disabled: true });
    snacky('Project creation started. Please give it a minute or two.', 'warning', 6000);

    try {
      const p = await createProject();
      this.init();
      this.setState({ disabled: false });
      if (p.success) snacky('Project created');
      else if (p.error) snacky(p.error, 'error');
      else snacky('Error', 'error');

    } catch (e) {
      snacky(e.message, 'error');
    }
  }

  closeTour = (name) => (e) => {
    this.setState({ isTourOpen: false });
  }

  render() {
    const { disabled, waiting } = this.state;
    const { classes } = this.props;
    const { project: { projects }, auth: { user } } = this.props.store;
    if (waiting) {
      return (
        <Side
          showSearch={false}
          title={'Projects'}
          initialState={"closed"}
          hideOpen={true}
        >
          <Grid container row style={{ marginTop: 25 }} spacing={4}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
              <Grid item xs={4} style={{ width: '90%', padding: 25 }}>
                <Skeleton variant="rect" style={{ height: 100 }}/>
                <Skeleton width="60%" />
              </Grid>
            ))}
          </Grid>
        </Side>
      )
    }
    // if (!user.hasHadTutorial) {
    //   return (
    //     <div className={classes.flexCentered}>
    //       <Typography variant="h2" style={{ marginTop: 25 }}>
    //         Welcome To Dropp
    //       </Typography>
    //       <div className={classes.flexCentered}>
    //         <Typography variant="h6" style={{ marginTop: 25 }}>
    //           The next step to get value out of Dropp is to schedule a tutorial
    //         </Typography>
    //         <Typography variant="h6" style={{ marginTop: 25 }}>
    //           It will only take 30 minutes and we promise it will save you hours of frustration.
    //         </Typography>
    //       </div>
    //       <div>
    //         <Button style={{ marginTop: 25 }} variant="contained" color="primary" onClick={() => window.location = "https://calendly.com/nocode/noco-product-intro"}>
    //           Schedule Demo
    //         </Button>
    //       </div>
    //     </div>
    //   );
    // }

    return (
      <Side
        showSearch={false}
        title={'Projects'}
        initialState={"closed"}
        hideOpen={true}
      >
        <div className={classes.root}>
          <Grid container direction="row" spacing={4} style={{ padding: 25 }}>
            {!waiting && projects.length > 0 && projects.map((p, i) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                xl={3}
              >
                <ProjectCard key={p._id} project={p} index={i} fetchProjects={this.init}/>
              </Grid>
             ))}
            {!waiting && projects.length === 0 && (
              <Grid
                item
                xs={12}
                sm={12}
                md={12}
                xl={12}
                className={classes.flexCentered}
              >
                <Typography variant="h6">
                  No Projects Found
                </Typography>
                <Typography variant="body1">
                  Click on the plus button in the lower right corner to create a new project!
                </Typography>
                <Typography variant="body2">
                  Once you create a project, you'll be able to clone templates to get started quickly.
                </Typography>
              </Grid>
            )}
          </Grid>
        </div>

        <div className={classes.fabWrap}>
          <Fab
            color="secondary"
            aria-label="add"
            className={classes.fab}
            onClick={this.createProject}
            disabled={disabled}
            id="create-new-project"
          >
            <AddIcon />
          </Fab>
        </div>
      </Side>
    );
  }
}

Projects.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Projects));
