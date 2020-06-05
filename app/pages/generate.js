import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';

import { TextField, CircularProgress, InputLabel, MenuItem, FormControl, Select, Grid, Typography, Button } from '@material-ui/core';

import DatabaseConnection from '../components/Data/DatabaseConnection';
import DatabaseTable from '../components/Data/DatabaseTable';
import Side from '../components/Nav/Side';
import Auth from '../src/Auth';
import Stepper from '../components/Data/Stepper';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';

import { fetchProjects, fetchProject } from '../src/apiCalls/project';
import { fetchDatas } from '../src/apiCalls/data';
import { createGenerate } from '../src/apiCalls/generate';


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
    marginTop: 25,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  table: {
    height: 500,
    overflow: 'scroll'
  },
  formRow: {
    width: '50%',
    minWidth: 300,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  }
});

@inject('store')
@observer
class Index extends React.Component {
  state = {
    step: 0,
    pay: "",
    feature: "",
    pain: {
      ops: false,
      db: false,
      backEnd: false,
      frontEnd: false,
    },
    next: {
      design: false,
      features: false,
      database: false,
      deploy: false,
      modify: false,
      lambda: false,
    },
    formSubmitted: false
  }
  async componentDidMount() {
    this.auth = new Auth();
    const {
      auth: { checkTokenAndSetUser },
      project: { limit, page, setProjects }
    } = this.props.store;
    const { query: { projectID } } = this.props.router;
    if (!this.auth.isAuthenticated()) {
      Router.push('/');
    }
    const { token } = this.auth.getSession();
    await checkTokenAndSetUser({ token });

    if (!projectID) {
      const p = await fetchProjects({ limit, page });
      if (p.success) {
        Router.push({ pathname: '/generate', query: { projectID: p.projects.docs[0]._id }, shallow: true });
        setProjects(p.projects);
        setTimeout(() => {
          this.init();
        }, 500);
      }
    } else {
      this.init();
    }
  }

  init = async () => {
    const { project: { update }, data: { updateData }, component: { updateComponent } } = this.props.store;
    const { query: { projectID } } = this.props.router;
    const proj = await fetchProject({ projectID });
    const selected = {};
    const res = await fetchDatas({ projectID, limit: 25 });
    if (proj.success) {
      update('project', proj.project);
      if (proj.project.models) {
        Object.keys(proj.project.models).forEach((proj) => {
          selected[proj] = { create: true, get: true, update: true, delete: true };
        })
      }
      update('selected', selected);
    }
    if (res.success) {
      updateData('datas', res.datas.docs)
    }
  }

  showTable = (key, index) => () => {
    const { project: { update, project: { models } } } = this.props.store;
    update('table', { name: key, ...models[key] })
  }
  generate = async () => {
    const { project: { update, project: { id, models, database }, selected } } = this.props.store;
    update('disabled', true);
    let s3 = await createGenerate({ database, models, selected, project: id, questions: this.state });
    update('disabled', false);
    update('link', s3.link);
  }
  getSteps = () => {
    return ["Database Connection", "Select APIs", "Generate APIs"]
  }

  submit = e => {
    e.preventDefault();
    this.setState({ formSubmitted: true });
    this.generate();
  }

  onChange = (name) => (e) => {
    this.setState({ [name]: e.target.value });
  }
  handleChange = (field, name) => (e) => {
    const clone = Object.assign({}, this.state[field])
    clone[name] = e.target.checked;
    this.setState({ [field]: clone });
  }

  atLeastOne = (obj) => {
    let one = false;
    Object.keys(obj).forEach(k => {
      if (obj[k]) one = true;
    });
    return one;
  }

  hasFilledOutForm = () => {
    const { pay, feature, pain, next } = this.state;
    // && this.atLeastOne(pain)
    return !(pay.length > 0 && feature.length > 0 && this.atLeastOne(next))
  }
  getStepContent = (step) => {
    const { formSubmitted } = this.state;
    const { classes, store: { project: { disabled, link, selected } } } = this.props;

    switch (step) {
      case 0:
        return (
          <Grid item xs={12} >
            <DatabaseConnection
              submitted={this.changeStep(this.state.step + 1, true)}
            />
          </Grid>
        );
      case 1:
        return (
          <div>
            {Object.keys(selected).length > 0 && (
              <Grid item xs={12} md={12} style={{ padding: 25 }} >
                <Typography variant="h6" gutterBottom style={{ textAlign: 'center' }}>
                  Select the APIs to create
                </Typography>
                <div style={{ height: 500, overflow: 'scroll' }}>
                  <DatabaseTable />
                </div>
              </Grid>
            )}
          </div>
        );
      case 2:
        return (
          <div>
            {!formSubmitted && !link && !disabled && (
              <Grid item xs={12} md={12} style={{ padding: 25 }} >
                <Typography variant="h6" gutterBottom style={{ textAlign: 'center' }}>
                  A Few Quick Questions
                </Typography>
                <Typography variant="body1" gutterBottom style={{ textAlign: 'center' }}>
                  It would help us out tremendously if you could answer these <br /> so we can figure out what to build next for you!
                </Typography>
                <form onSubmit={this.submit}>
                  <div className={classes.formRow}>
                    <TextField
                      className={classes.textField}
                      label="Whats one feature you thought would be here but is missing?"
                      margin="normal"
                      value={this.state.feature}
                      onChange={this.onChange('feature')}
                    />
                  </div>
                  <div className={classes.formRow}>
                    <TextField
                      className={classes.textField}
                      value={this.state.pay}
                      type="number"
                      label="How much would you pay for this?"
                      margin="normal"
                      onChange={this.onChange('pay')}
                    />
                  </div>
                  {false && (
                    <div>
                      <FormControl component="fieldset" className={classes.formControl} style={{ marginTop: 25 }}>
                        <FormLabel component="legend">What part of engineering is most painful for you?</FormLabel>
                        <FormGroup>
                          <FormControlLabel
                            control={<Checkbox checked={this.state.pain.ops} onChange={this.handleChange('pain', 'ops')} value="ops" />}
                            label="Dev Ops (spinning up servers, deploying to production, automated builds)"
                          />
                          <FormControlLabel
                            control={<Checkbox checked={this.state.pain.db} onChange={this.handleChange('pain', 'db')} value="db" />}
                            label="Writing Code (building new features, managing bugs)"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox checked={this.state.pain.backEnd} onChange={this.handleChange('pain', 'backEnd')} value="backEnd" />
                            }
                            label="Back End"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox checked={this.state.pain.frontEnd} onChange={this.handleChange('pain', 'frontEnd')} value="frontEnd" />
                            }
                            label="Front End"
                          />
                        </FormGroup>
                      </FormControl>
                    </div>
                  )}
                  <div>
                    <FormControl component="fieldset" className={classes.formControl} style={{ marginTop: 25 }}>
                      <FormLabel component="legend">What should we build next?</FormLabel>
                      <FormGroup>
                        <FormControlLabel
                          control={<Checkbox checked={this.state.next.design} onChange={this.handleChange('next', 'design')} value="design" />}
                          label="Let me design my database here"
                        />
                        <FormControlLabel
                          control={<Checkbox checked={this.state.next.features} onChange={this.handleChange('next', 'features')} value="features" />}
                          label="Add capabilities to my code (like chat, stripe integration, etc.)"
                        />
                        <FormControlLabel
                          control={<Checkbox checked={this.state.next.deploy} onChange={this.handleChange('next', 'deploy')} value="deploy" />}
                          label="Deploy my API for me"
                        />
                        <FormControlLabel
                          control={<Checkbox checked={this.state.next.database} onChange={this.handleChange('next', 'database')} value="database" />}
                          label="Deploy my database for me"
                        />
                        <FormControlLabel
                          control={<Checkbox checked={this.state.next.modify} onChange={this.handleChange('next', 'modify')} value="modify" />}
                          label="Let me modify the code here before generating it."
                        />
                        <FormControlLabel
                          control={<Checkbox checked={this.state.next.lambda} onChange={this.handleChange('next', 'lambda')} value="lambda" />}
                          label="Let me write and deploy lambdas or serverless functions here"
                        />

                      </FormGroup>
                    </FormControl>
                  </div>
                  <div>
                    <Button
                      disabled={this.hasFilledOutForm()}
                      type="submit"
                      size="large"
                      variant="contained"
                      color="primary"
                    >
                      Submit
                    </Button>
                  </div>
                </form>


                {false && (
                  <Typography variant="body1" gutterBottom style={{ textAlign: 'center' }}>
                    Thanks for making it this far. Enjoy your new API!
                  </Typography>
                )}
              </Grid>
            )}
            {!disabled && link && (
              <Grid item xs={12} alignItems="center" alignContent="center" justify="center" style={{ display: 'flex', paddingBottom: 25 }}>
                <Button onClick={() => { window.location = link; }} size="large" variant="contained" color="primary"> Download APIs</Button>
              </Grid>
            )}
            {disabled && (
              <Grid item xs={12} alignItems="center" alignContent="center" justify="center" style={{ display: 'flex', paddingBottom: 25 }}>
                <CircularProgress color="secondary" />
              </Grid>
            )}
            {formSubmitted && !link && Object.keys(selected).length > 0 && (
              <Grid item xs={12} alignItems="center" alignContent="center" justify="center" style={{ display: 'flex' }}>
                <Button disabled={disabled} onClick={this.generate} size="large" variant="contained" color="primary"> Generate APIs </Button>
              </Grid>
            )}
          </div>
        );
      default:
        return 'Unknown step';
    }
    // return ["db connection", "select which to gen", "download zip!"]
  }

  changeStep = (step, refetch = false) => async () => {
    if (refetch) {
      await this.init();
    }
    this.setState({ step });

  }

  render() {
    const { classes, store: { project: { disabled, link, project, table: { name, table }, selected }, data: { data } } } = this.props;
    return (
      <Side
        showSearch={false}
        title={`API Generator - ${project.name}`}
        initialState={"closed"}
      >
        <div className={classes.flexRow}>
          <div className={classes.flexColumWidth}>
            <Grid container justify="space-between">
              <Stepper
                step={this.state.step}
                changeStep={this.changeStep}
                steps={this.getSteps()}
                stepContent={this.getStepContent}
              />
            </Grid>
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
