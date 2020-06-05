import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';

import Side from '../components/Nav/Side';
import Auth from '../src/Auth';
import DeployURL from '../components/Deploy/DeployURL';
import Deploy from '../components/Deploy/Deploy';

import {
  Paper,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  Typography,
  Button,
  TextField,
  Link,
  Grid,
} from '@material-ui/core';

import { Skeleton } from '@material-ui/lab';


import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import ClearIcon from '@material-ui/icons/Clear';

import { createDeploy, fetchDeploys } from '../src/apiCalls/deploy';
import { fetchProject } from '../src/apiCalls/project';
import { fetchStripeInfo } from '../src/apiCalls/billing';


const styles = theme => ({
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly'
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
  paper: {
    // width: 450,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: 25,
    // margin: '0 auto',
    padding: 15,
  },
  submit: {
    margin: '0 auto',
    marginTop: 25,
  },
  row: {
    width: 200,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 5,
  },
  textItem: {
    width: 150,
  },
  container: {
    margin: 50,
  }
});

@inject('store')
@observer
class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inProgress: false,
      waiting: true,
    }
    this.intervals = [];
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
    this.refreshInterval();
  }

  refreshInterval = () => {
    this.intervals.push(setInterval(() => {
      this.init();
    }, 10 * 1000));
  }

  componentWillUnmount() {
    this.intervals.forEach(i => clearInterval(i));
  }

  init = async () => {
    const { query: { projectID } } = this.props.router;
    const {
      project: { update },
      deploy: { updateDeploy },
      auth: { updateAuth }
    } = this.props.store;
    const depRes = await fetchDeploys({ projectID });
    if (depRes.success) {
      updateDeploy('deploys', depRes.deployments)
      updateDeploy('totalDeploys', depRes.total);
    }
    const proj = await fetchProject({ projectID });
    if (proj.success) {
      update('project', proj.project);
    }

    const stripeRes = await fetchStripeInfo();
    if (stripeRes.customer) updateAuth('customer', stripeRes.customer);

    this.handleHelp();
    this.setState({ waiting: false })

  }

  handleHelp = () => {
    const {
      auth: { update, user, deploySteps },
    } = this.props.store;
    // if (!user.intros || !user.intros.deploy) {
    //   update('steps', deploySteps);
    //   update('tourOpen', true);
    //   update('tourName', 'deploy');
    // }
  }

  handleChange = (name) =>  (e) => {
    const { deploy: { update } } = this.props.store;
    update(name, e.target.value);
  }

  submit = async (e) => {
    e.preventDefault();
    this.setState({ inProgress: true });

    const { router: { query: { projectID } } } = this.props;
    const { deploy: { env, name  }, snack: { snacky } } = this.props.store;
    snacky('Deployment Started. Please allow up to 5 minutes to view your changes.')
    const res = await createDeploy({ env, name, projectID });
    if (res.success) {
      if (res.isNew) snacky('Deployment Build Started. Please allow up to 5 minutes to see your changes.');
      else snacky('No Changes detected. Please make changes to re-deploy your app', 'warning');
    } else {
      snacky(res.error ? res.error : 'Uh Oh, your deployment failed', 'error')
    }
    // snacky('Sorry! Deployment is still under construction.', 'warn');
    this.setState({ inProgress: false })
    this.init();
  }

  hasBilling = () => {
    const { auth: { customer } } = this.props.store;
    if (!customer || !customer.id) return false;
    let hasActiveSubscription = false;
    if (customer && customer.id && customer.subscriptions && customer.subscriptions.data && customer.subscriptions.data.length > 0) {
      customer.subscriptions.data.forEach(d => {
        if (d.status === "active") hasActiveSubscription = true;
      })
    }
    return hasActiveSubscription;
  }

  disabled = () => {
    const { project: { project }, deploy: { env, name }, auth: { user } } = this.props.store;
    if (user && ['andrew@noco.io', 'andrewpierno@gmail.com'].indexOf(user.email) !== -1) return false;
    if (this.state.inProgress) return true;
    return !name ||
      !this.hasBilling() ||
      !project.auth.type ||
      !project.defaultUserRole ||
      !project.defaultAdminRole ||
      !project.html.afterLogin ||
      !project.html.logo ||
      !project.html.favicon ||
      !project.s3.secret ||
      project.pages.length === 0
  }

  render() {
    const { waiting } = this.state;
    const { classes, router: { query: { projectID }} } = this.props;
    const { project: { project, pages }, deploy: { env, name, deploys, totalDeploys  } } = this.props.store;

    return (
      <Side
        showSearch={false}
        title={`${project.name} - Deploy`}
      >
        <div className={classes.container}>

          <Grid container spacing={4}>
            {(!waiting && !this.hasBilling()) && (
              <Grid item xs={12} md={12}>
                <Paper className={classes.paper} elevation={12} style={{ padding: 20 }}>
                  <Typography variant="h6">
                    Upgrade your project to deploy your app.
                  </Typography>
                  <Button variant="contained" color="primary" style={{ marginTop: 15 }} onClick={() => Router.push({ pathname: '/billing' })}>Set Up Billing</Button>
                </Paper>
              </Grid>
            )}
            <Grid item xs={12} md={4} id="deploy-list">
              {waiting && (
                <React.Fragment>
                  <div className={classes.flexRow} style={{ margin: 10 }}>
                    <Skeleton variant="circle" width={40} height={40} />
                    <Skeleton variant="rect" width={200} height={40} />
                  </div>
                  <div className={classes.flexRow} style={{ margin: 10 }}>
                    <Skeleton variant="circle" width={40} height={40} />
                    <Skeleton variant="rect" width={200} height={40} />
                  </div>
                  <div className={classes.flexRow} style={{ margin: 10 }}>
                    <Skeleton variant="circle" width={40} height={40} />
                    <Skeleton variant="rect" width={200} height={40} />
                  </div>
                  <div className={classes.flexRow} style={{ margin: 10 }}>
                    <Skeleton variant="circle" width={40} height={40} />
                    <Skeleton variant="rect" width={200} height={40} />
                  </div>
                  <div className={classes.flexRow} style={{ margin: 10 }}>
                    <Skeleton variant="circle" width={40} height={40} />
                    <Skeleton variant="rect" width={200} height={40} />
                  </div>
                </React.Fragment>
              )}
              {!waiting && (<Deploy deploys={deploys} totalDeploys={totalDeploys} />)}
            </Grid>
            <Grid item xs={12} md={4} id="deploy-checklist">
              <Paper className={classes.paper}>
                <Typography variant="h6" style={{ marginBottom: 15 }}>
                  Deploy Checklist
                </Typography>
                <div className={classes.row}>
                  <Link href={`/settings?projectID=${projectID}`}>
                    <Typography variant="body2" className={classes.textItem}>
                      Signup Controls
                    </Typography>
                  </Link>
                  {project.auth.type ? <CheckCircleOutlineIcon color="primary" /> : <ClearIcon color="error" />}
                </div>
                <div className={classes.row}>
                  <Link href={`/user-permissions?projectID=${projectID}`}>
                    <Typography variant="body2" className={classes.textItem}>
                      Default User Role
                    </Typography>
                  </Link>
                  {project.defaultUserRole ? <CheckCircleOutlineIcon color="primary" /> : <ClearIcon color="error" />}
                </div>
                <div className={classes.row}>
                  <Link href={`/user-permissions?projectID=${projectID}`}>
                    <Typography variant="body2" className={classes.textItem}>
                      Default Admin Role
                    </Typography>
                  </Link>
                  {project.defaultAdminRole ? <CheckCircleOutlineIcon color="primary" /> : <ClearIcon color="error" />}
                </div>
                <div className={classes.row}>
                  <Link href={`/settings?projectID=${projectID}`}>
                    <Typography variant="body2" className={classes.textItem}>
                      After Login
                    </Typography>
                  </Link>
                  {project.html.afterLogin ? <CheckCircleOutlineIcon color="primary" /> : <ClearIcon color="error" />}
                </div>
                <div className={classes.row}>
                  <Link href={`/settings?projectID=${projectID}`}>
                    <Typography variant="body2" className={classes.textItem}>
                      Project Logo
                    </Typography>
                  </Link>
                  {project.html.logo ? <CheckCircleOutlineIcon color="primary" /> : <ClearIcon color="error" />}
                </div>
                <div className={classes.row}>
                  <Link href={`/settings?projectID=${projectID}`}>
                    <Typography variant="body2" className={classes.textItem}>
                      Favicon
                    </Typography>
                  </Link>
                  {project.html.favicon ? <CheckCircleOutlineIcon color="primary" /> : <ClearIcon color="error" />}
                </div>
                <div className={classes.row}>
                  <Link href={`/pages?projectID=${projectID}`}>
                    <Typography variant="body2" className={classes.textItem}>
                      Pages
                    </Typography>
                  </Link>
                  {project.pages.length > 0 ? <CheckCircleOutlineIcon color="primary" /> : <ClearIcon color="error" />}
                </div>
                <div className={classes.row}>
                  <Link href={`/media?projectID=${projectID}`}>
                    <Typography variant="body2" className={classes.textItem}>
                      Storage
                    </Typography>
                  </Link>
                  {project.s3 && project.s3.secret ? <CheckCircleOutlineIcon color="primary" /> : <ClearIcon color="error" />}
                </div>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4} spacing={8} direction="column">
              <Grid item xs={12} id="deploy-new">
                <Paper className={classes.paper}>
                  <form onSubmit={this.submit} style={{ textAlign: 'center' }}>
                    <Typography variant="h6" style={{ marginBottom: 15 }}>Create A New Deployment</Typography>
                    <div className={classes.flexRow}>
                      <TextField
                        label="Deployment Name"
                        value={name}
                        onChange={this.handleChange('name')}
                      />
                      {false && (
                        <FormControl className={classes.formControl}>
                         <InputLabel htmlFor="environment">Environment</InputLabel>
                         <Select
                           value={env}
                           onChange={this.handleChange('env')}
                           inputProps={{
                             version: 'environment',
                           }}
                         >
                           <MenuItem value={'dev'}>Dev</MenuItem>
                           <MenuItem value={'stage'}>Stage</MenuItem>
                           <MenuItem value={'production'}>Production</MenuItem>
                         </Select>
                        </FormControl>
                      )}
                    </div>
                    <Button className={classes.submit} type="submit" disabled={this.disabled()}>Create</Button>
                  </form>
                </Paper>
              </Grid>
              {["dev", "stage", "prod"].map((e, i) => (
                <Grid item xs={12} style={{ marginTop: 25 }} id={i === 0 ? 'deploy-url' : `deploy-url-${i}`}>
                  <DeployURL
                    project={project}
                    name={"app_url"}
                    env={e}
                    type="app"
                  />
                </Grid>
              ))}
              {["dev", "stage", "prod"].map((e) => (
                <Grid item xs={12} style={{ marginTop: 25 }}>
                  <DeployURL
                    project={project}
                    name={"api_url"}
                    env={e}
                    type="api"
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </div>
      </Side>
    );
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Index));
