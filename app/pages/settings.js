import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';

import Side from '../components/Nav/Side';
import Auth from '../src/Auth';
import { Grid, AppBar, Toolbar, FormControl, InputLabel, Select, MenuItem, Typography, Paper, TextField, Button } from '@material-ui/core';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
// import { html } from 'react-syntax-highlighter/dist/esm/languages/hljs';
import { fetchProject, updateProject } from '../src/apiCalls/project';

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
    width: '90%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
  },
  paper: {
    width: '50%',
    minWidth: 500,
    margin: '0 auto',
    padding: 25,
    marginTop: 25,
  },
  code: {
    width: '50%',
    minWidth: 400,
    marginTop: 25,
  },
  paperItem: {
    padding: 25,
    marginTop: 25,
    textAlign: 'center'
  },
  paperGridItem: {
    padding: 25,
    marginTop: 25,
    height: 200,
  },
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
    const { query: { projectID } } = this.props.router;
    const {
      project: { updateProject },
    } = this.props.store;

    const proj = await fetchProject({ projectID });
    if (proj.success) {
      updateProject('project', proj.project);
    }

    this.handleHelp();
  }

  handleHelp = () => {
    const {
      auth: { update, user, settingsSteps },
    } = this.props.store;
    // if (!user.intros || !user.intros.settings) {
    //   update('steps', settingsSteps);
    //   update('tourOpen', true);
    //   update('tourName', 'settings');
    // }
  }

  projectChange = (name) => (e) => {
    const { project: { update, project } } = this.props.store;
    const clone = Object.assign({}, toJS(project));
    clone[name] = e.target.value;
    update('project', clone);
  }

  save = async (e) => {
    const { snack: { snacky }, project: { project } } = this.props.store;
    const res = await updateProject({ id: project.id, html: project.html, auth: project.auth, customDomain: project.customDomain, stripeSecretKey: project.stripeSecretKey, stripePublishableKey: project.stripePublishableKey });
    if (res.success) snacky('saved');
    else snacky(res.error, 'error');
  }

  change = (name) => (e) => {
    const { project: { update, project } } = this.props.store;
    const clone = Object.assign({}, toJS(project));
    clone.html[name] = e.target.value;
    update('project', clone);
  }

  changeAuth = (name) => (e) => {
    const { project: { update, project } } = this.props.store;
    const clone = Object.assign({}, toJS(project));
    clone.auth[name] = e.target.value;
    update('project', clone);
  }
  render() {
    const { classes } = this.props;
    const { project: { project: { stripeSecretKey, stripePublishableKey, apiKeys, name, pages, html, auth, customDomain } } } = this.props.store;
    const { project: { project } } = this.props.store;

    return (
      <Side
        showSearch={false}
        title={`${name} - Settings`}
      >
        <div className={classes.flexRow}>
          <div className={classes.flexColumWidth}>
            <Paper className={classes.paper} style={{ textAlign: 'center' }} id="settings-top">
              <Typography variant="h6">Project Settings</Typography>
              <TextField
                value={apiKeys && Array.isArray(apiKeys) ? apiKeys[0].apiKey : '...'}
                className={classes.code}
                label={"API Key"}
                disabled
                id="settings-api-key"
              />
            </Paper>

            <div className={classes.inject}>
              <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <Paper className={classes.paperGridItem}>
                      <Typography variant="h6">Project Name*</Typography>
                      <TextField
                        value={name}
                        className={classes.code}
                        onChange={this.projectChange('name')}
                        label={"Project Name"}
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper className={classes.paperGridItem}>
                      <Typography variant="h6">Auth Controls*</Typography>
                      <Typography variant="body2">Who can sign up for your app?</Typography>
                      <FormControl className={classes.formControl}>
                       <InputLabel htmlFor="auth">Auth Control</InputLabel>
                       <Select
                         value={auth.type}
                         className={classes.code}
                         onChange={this.changeAuth('type')}
                         inputProps={{
                           name: 'auth',
                         }}
                       >
                         <MenuItem selected={auth.type} value={'anyone'}>Anyone</MenuItem>
                         <MenuItem selected={auth.type} value={'none'}>Disable Signup (manually create users)</MenuItem>
                         <MenuItem selected={auth.type} value={'whitelist'}>Whitelist an Email Address</MenuItem>
                       </Select>
                      </FormControl>
                      {auth.type && auth.type === 'whitelist' && (
                        <React.Fragment>
                          <Typography variant="body2" style={{ marginTop: 25 }}>
                            Only people with an email adress on the whitelist will be allowed to sign up
                          </Typography>
                          <TextField
                            value={auth.whitelist}
                            className={classes.code}
                            onChange={this.changeAuth('whitelist')}
                            label={"Whitelisted Domain"}
                          />
                        </React.Fragment>
                      )}
                    </Paper>
                  </Grid>
              </Grid>

              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <Paper className={classes.paperGridItem}>
                    <Typography variant="h6">Home Page*</Typography>
                    <Typography variant="body2">Which page do people see when they first come to your app?</Typography>
                    <FormControl className={classes.formControl}>
                     <InputLabel htmlFor="homePage">Home Page</InputLabel>
                     <Select
                       value={html.homePage}
                       className={classes.code}
                       onChange={this.change('homePage')}
                       inputProps={{
                         name: 'homePage',
                       }}
                     >
                      {pages.filter(p => p.type !== 'detail').map(p => <MenuItem selected={html.homePage} value={p._id}>{p.name}</MenuItem>)}
                      <MenuItem value={""} selected={html.homePage}>Default</MenuItem>
                     </Select>
                    </FormControl>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper className={classes.paperGridItem}>
                    <Typography variant="h6">After Login*</Typography>
                    <Typography variant="body2">Where do you want people to go after they log in?</Typography>
                    <FormControl className={classes.formControl}>
                     <InputLabel htmlFor="afterLogin">After Login</InputLabel>
                     <Select
                       value={html.afterLogin}
                       className={classes.code}
                       onChange={this.change('afterLogin')}
                       inputProps={{
                         name: 'afterLogin',
                       }}
                     >
                      {pages.filter(p => p.type !== 'detail').map(p => <MenuItem selected={html.afterLogin} value={p._id}>{p.name}</MenuItem>)}
                     </Select>
                    </FormControl>
                  </Paper>
                </Grid>
              </Grid>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <Paper className={classes.paperGridItem}>
                    <Typography variant="h6">Logo URL</Typography>
                    <Typography variant="body2">Pick an image to display as your logo throughout your app.</Typography>
                    <TextField
                      className={classes.code}
                      value={html.logo}
                      onChange={this.change('logo')}
                      label="Logo"
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper className={classes.paperGridItem}>
                    <Typography variant="h6">Login Page Background Image</Typography>
                    <Typography variant="body2">Choose a large background image users see when they are on the login page.</Typography>
                    <TextField
                      className={classes.code}
                      value={html.bgImage}
                      onChange={this.change('bgImage')}
                      label="Background Image"
                    />
                  </Paper>
                </Grid>
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <Paper className={classes.paperGridItem}>
                      <Typography variant="h6">Favicon URL</Typography>
                      <TextField
                        className={classes.code}
                        value={html.favicon}
                        onChange={this.change('favicon')}
                        label="Favicon"
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper className={classes.paperGridItem}>
                      <Typography variant="h6">Custom Domain</Typography>
                      <Typography variant="body2">If this is a new domain, instructions will be sent on verifying your domain with us.</Typography>
                      <TextField
                        className={classes.code}
                        value={customDomain}
                        onChange={this.projectChange('customDomain')}
                        label="Custom Domain (e.g. noco.io)"
                      />
                    </Paper>
                  </Grid>
                </Grid>
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <Paper className={classes.paperItem}>
                      <Typography variant="h6">Stripe Keys</Typography>
                      <Typography variant="body2"></Typography>
                      <TextField
                        className={classes.code}
                        value={stripePublishableKey}
                        onChange={this.projectChange('stripePublishableKey')}
                        label="Stripe Publishable Key"
                      />
                      <TextField
                        className={classes.code}
                        value={stripeSecretKey}
                        onChange={this.projectChange('stripeSecretKey')}
                        label="Stripe Secret Key"
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper className={classes.paperItem}>
                      <Typography variant="h6">Include Javascript</Typography>

                      <SyntaxHighlighter language={"javascript"} style={darcula} customStyle={{ width: '100%', minWidth: 500 }}>
                        {`// Only put the JS in, do not put script tags here
// for example Google Analytics should look like
window.dataLayer = window.dataLayer || [];
function gtag(){ dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'UA-xxxxxxxx-xx');`}
                      </SyntaxHighlighter>
                      <TextField
                        multiline
                        className={classes.code}
                        value={html.code}
                        onChange={this.change('code')}
                        label="Javascript To Inject"
                      />
                    </Paper>
                  </Grid>
                </Grid>
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <Paper className={classes.paperItem}>
                      <Typography variant="h6">Include Link tags</Typography>

                      <SyntaxHighlighter language="html" style={darcula} customStyle={{ width: '100%', minWidth: 500 }}>
                        {`// Only put link tags in here, make sure to close the link tag at the end.
// For example, do this:
<link rel="shortcut icon" type="image/png" href="/img/favicon.png" />
// NOT
<link rel="shortcut icon" type="image/png" href="/img/favicon.png" >`}
                      </SyntaxHighlighter>
                      <TextField
                        multiline
                        className={classes.code}
                        value={html.css}
                        onChange={this.change('css')}
                        label="Links To Inject"
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper className={classes.paperItem} style={{ marginBottom: 100 }}>
                      <Typography variant="h6">Include Meta Tags</Typography>

                      <SyntaxHighlighter language="html" style={darcula} customStyle={{ width: '100%', minWidth: 500 }}>
                        {`// This will get injected into the head of the app, SEO stuff generally goes here
<meta name="description" content="No Code Development Platform" />
<meta name="keywords" content="nocode, no-code, no code, low-code, low code" />`}
                      </SyntaxHighlighter>
                      <TextField
                        multiline
                        className={classes.code}
                        value={html.head}
                        onChange={this.change('head')}
                        label="Head Items To Inject"
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </div>
            <AppBar position="static" style={{ position: 'fixed', height: 50, bottom: 0 }}>
              <Toolbar className={classes.flexColumWidth}>
                <Button variant="contained" color="primary" onClick={this.save} style={{  }}> Save </Button>
              </Toolbar>
            </AppBar>
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
