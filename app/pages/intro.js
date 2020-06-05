import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, ThemeProvider } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';

import Side from '../components/Nav/Side';
import Auth from '../src/Auth';
import { Link, Grid, Stepper, Step, StepLabel, StepContent, Button, Paper, Typography } from '@material-ui/core';
import Template from '../components/Template/Template';

import { updateProject, fetchProject, fetchProjectTemplates } from '../src/apiCalls/project';
import { fetchDatas } from '../src/apiCalls/data';
import { createRepeatable, fetchRepeatables } from '../src/apiCalls/repeatable'
import { getPage } from '../src/apiCalls/page';

import DataFields from '../components/Data/DataFields';
import DataModels from '../components/Data/DataModels';

import Renderer from '../components/Renderer/Renderer';
import Components from '../components/Panel/Components';
import EditComponent from '../components/Edit/EditComponent';
import NewRepeatableDialog from '../components/Repeatable/NewRepeatableDialog';

import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import ClearIcon from '@material-ui/icons/Clear';

import RepeatableActions from '../components/Nav/RepeatableActions';

import { updateUser } from '../src/apiCalls/user';

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
    justifyContent: 'center'
  },
  flexColumWidth: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  template: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
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
  paper: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    margin: 25
  },
});

@inject('store')
@observer
class Index extends React.Component {

  state = {
    activeStep: 0,
    steps: ['Welcome'],
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

  init = async () => {
    const { activeStep } = this.state;
    const { query: { projectID } } = this.props.router;
    const {
      page: { setNodes, nodes, updatePage, setRepeatableNodes, resetComponents },
      project: { update },
      data: { resetData, updateData, setFake },
      snack: { snacky },
      auth: { updateAuth, setLocalUser, user, templateSteps },
      repeatable: { updateRepeatable }
    } = this.props.store;

    // if (!user.intros || !user.intros.template) {
    //   updateAuth('steps', templateSteps);
    //   updateAuth('tourOpen', true);
    //   updateAuth('tourName', 'template');
    // }

    // fetch templates
    const res = await fetchProjectTemplates({});
    update("templates", res.templates.docs);

    // fetch data
    resetData();
    const d = await fetchDatas({ projectID, limit: 25 });
    if (d.success) {
      if (d.datas.docs.length > 0) {
        updateData('data', d.datas.docs[0]);
        setFake(d.datas.docs[0].model);
      }
      updateData('datas', d.datas.docs);
    }

    // set fake

    // fetch project
    const proj = await fetchProject({ projectID });
    if (proj.success) {
      update('project', proj.project);
      if (activeStep === 3 && proj.project.pages.length > 0) {
        update('pageIndex', 0);
        const res = await getPage({ id: proj.project.pages[0]._id });
        setNodes(res.page);
        setRepeatableNodes();
      }
    }

    // fetch repeatables
    let repeat = await fetchRepeatables({ project: projectID });
    if (repeat.repeatables.length === 0) {
      const res = await createRepeatable({ type: 'basic', project: projectID, name: 'test' });
      repeat = await fetchRepeatables({ project: projectID });
    }
    if (repeat.repeatables) {
      updateRepeatable('repeatables', repeat.repeatables);
      if (activeStep === 2 && repeat.repeatables.length > 0) {
        updateRepeatable('workingIndex', 0);
        const rep = repeat.repeatables[0];
        if (!rep) return;
        if (rep.type === 'repeatable') setRepeatableNodes();
        if (rep.type === 'form') resetComponents();
        setNodes({ id: rep._id, name: rep.name, page: rep.node });
        update('render', new Date().getTime());
      }
    }
  }

  handleSteps = (type) => async (e) => {
    const { query: { projectID } } = this.props.router;
    const { project: { update } } = this.props.store;
    await updateProject({ type, projectID });
    if (type === 'api') {
      this.setState({ steps: ['Welcome', 'API'] });
    } else if (type === 'app') {
      this.setState({ steps: ['Welcome', 'Components', 'Pages'] });
    } else {
      this.setState({ steps: ['Welcome', 'API', 'Components', 'Pages'] });
    }
  }

  getStepContent = (step) => {
    const { steps } = this.state;
    const { classes, router: { query: { projectID } } } = this.props;
    const {
      project: { getTheme, project: { name, pages }, templates },
      data: { data },
      page: { render, demoComponent, nodes },
      repeatable: { repeatables, workingIndex }
    } = this.props.store;
    const project = this.props.store.project.project;

    switch (steps[step]) {
      case 'Welcome':
        return (
          <div>
            <Typography variant="h6">
              What do you need?
            </Typography>
            <div className={classes.row} style={{ width: '100%', justifyContent: 'space-evenly', margin: 25,  }}>
              <Button variant="outlined" color="primary" onClick={this.handleSteps('api')}>NodeJS API (sql / Sequelize)</Button>
              <Button variant="outlined" color="primary" onClick={this.handleSteps('app')}>React APP (NextJS / Material UI)</Button>
              <Button variant="contained" color="primary" onClick={this.handleSteps('both')}>Both</Button>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <Typography variant="body1">
              Pick a template. Don't worry, you can change this later.
            </Typography>
            <div className={classes.template}>
              {templates.map((t, i) => <Template onClone={this.onClone} index={i} template={t} />)}
            </div>
          </div>
        );
      case 'API':
        return (
          <div>
            <Typography variant="h5" gutterBottom>
              Data Models
            </Typography>
            <Typography variant="h6" gutterBottom>
              On the left, we have the models (the tables) and on the right we have the fields.
            </Typography>
            <Typography variant="body1" gutterBottom>
              Add new tables on the left and add new fields on the right. You can do this now or finish later.
              We uses a SQL backend. You'll use the Sequelize ORM which is compatible with MySQL, msSQL, SQLite, MariaDB, and PostreSQL
            </Typography>
            <Grid
              container
              justify="space-between"
              style={{ marginTop: 25, marginBottom: 25 }}
            >
              <Grid item xs={12} md={5} >
                <DataModels onModelChange={() => {}} />
                <Typography variant="h6" style={{ marginTop: 10 }}>
                  Go ahead! Add a new table!
                </Typography>
              </Grid>
              <Grid xs={12} md={5}>
                <DataFields showForm={true} />
              </Grid>
            </Grid>
          </div>
        );
      case 'Components':
        return (
          <div>
            <Typography variant="h6" gutterBottom>
              Components are a core part of building an application.
            </Typography>
            <Typography variant="body2" gutterBottom>
              You can select from the items on the right and <strong>Drag And Drop</strong> them onto the light purple areas
            </Typography>
            <Typography variant="body2" gutterBottom>
              Go ahead! Try to drag and drop something onto the page. Don't worry, it won't save.
            </Typography>
            <Grid
              container
              justify="space-between"
              style={{ marginTop: 25, marginBottom: 25 }}
            >
              <Grid item xs={12} md={6} >
                {repeatables[workingIndex] && (
                  <ThemeProvider theme={getTheme()}>
                    <div id="components-first" className={classes.container} onClick={this.clearEditing} style={{ backgroundColor: getTheme().palette.background.default }}>
                      <div
                        className={classes.flexColumWidth}
                        onClick={this.clearEditing}
                      >
                        <Renderer />
                      </div>
                    </div>
                  </ThemeProvider>
                )}
              </Grid>
              <Grid xs={12} md={3}>
                <Components />
              </Grid>
              <Grid xs={12} md={3}>
                <EditComponent embedded={true} />
                <NewRepeatableDialog />
              </Grid>
            </Grid>

          </div>
        );
      case 'Pages':
        return (
          <div>
            <Typography variant="h6" gutterBottom>
              Once you've built your components, you can drag and drop them onto a <strong>Page</strong>
            </Typography>
            <Typography variant="body2" gutterBottom>
              Pages bring your components together to form a single page for the end user.
            </Typography>
          </div>
        );
      // case 4:
      //   return (
      //     <div>
      //
      //
      //     </div>
      //   );
      default:
        return 'Unknown step';
    }
  }

  onClone = () => {
    this.setState({ activeStep: this.state.activeStep + 1 });
  }

  allDone = async () => {
    const { router: { query: { projectID }} } = this.props;
    const { snack: { snacky }, auth: { update, setLocalUser, user, projectSteps } } = this.props.store;
    const { name, intros, wantToBuild, isDeveloper } = user;
    const clone = toJS(intros);
    clone.tutorial = true;
    const res = await updateUser({ name, wantToBuild, intros: clone, isDeveloper });
    setLocalUser({ ...user, intros: clone, name, wantToBuild, isDeveloper });
    if (res.success) {
      snacky('Saved!');
      Router.push({ pathname: '/help', query: { projectID }})
    } else {
      return snacky('Error', 'error');
    }
  }

  render() {
    const { classes, router: { query: { projectID }} } = this.props;

    const { activeStep, steps } = this.state;

    return (
      <div className={classes.flexRow}>
        <div className={classes.flexColumWidth}>
        <div className={classes.flexColumn} style={{ marginTop: 25 }}>
          <Typography variant="h6">
            Tutorial
          </Typography>
          <Typography variant="body1">
            Let's go over some basics to get you started quickly.
          </Typography>
          <Typography variant="overline">
            Approximate Time: 5 minutes
          </Typography>
        </div>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                {this.getStepContent(index)}
                <div className={classes.actionsContainer}>
                  <div>
                    <Button
                      disabled={steps.length === 1 || activeStep === 0}
                      onClick={() => this.setState({ activeStep: activeStep - 1 })}
                      className={classes.button}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={steps.length === 1}
                      onClick={() => {
                        if (activeStep === steps.length - 1) {
                          return this.allDone()
                        }
                        this.setState({ activeStep: activeStep + 1 }, () => {
                          this.init();
                          setTimeout(() => {
                            this.init();
                          }, 1000);
                        });
                      }}
                      className={classes.button}
                    >
                      {activeStep === steps.length - 1 ? 'Finish Tutorial' : 'Next'}
                    </Button>
                  </div>
                </div>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        </div>
      </div>
    );
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Index));
