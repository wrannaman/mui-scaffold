import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, ThemeProvider } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';

import { Grid, Button } from '@material-ui/core';

import DataFields from '../components/Data/DataFields';
import DataModels from '../components/Data/DataModels';
import MasterTable from '../components/Data/MasterTable';
import Form from '../components/Generated/Form';
import Table from '../components/Generated/Table';
import Side from '../components/Nav/Side';
import Auth from '../src/Auth';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import CloseIcon from '@material-ui/icons/Close';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


import { fetchProject } from '../src/apiCalls/project';
import { fetchDatas } from '../src/apiCalls/data';

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
  actions: {
    width: '100%',
    height: 200,
    marginTop: 25,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    position: 'relative'
  }
});

@inject('store')
@observer
class Index extends React.Component {
  state = {
    editTables: false,
    editForms: false,
    showTable: false,
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

    this.init()
    this.handleHelp();
  }

  componentWillUnmount() {
    const { data: { resetData } } = this.props.store;
    resetData();
  }

  handleHelp = () => {
    const {
      auth: { update, user, dataSteps },
    } = this.props.store;
    // if (!user.intros || !user.intros.dataModels) {
    //   update('steps', dataSteps);
    //   update('tourOpen', true);
    //   update('tourName', 'dataModels');
    // }
  }

  init = async () => {
    const { project: { update }, data: { updateData } } = this.props.store;
    const { query: { projectID } } = this.props.router;
    const proj = await fetchProject({ projectID });
    const res = await fetchDatas({ projectID, limit: 25 });
    if (proj.success) {
      update('project', proj.project);
    }
    if (res.success) {
      updateData('datas', res.datas.docs);
    }
  }

  toggleForms = (name) => (e) => {
    this.setState({ [name]: !this.state[name] });
  }

  isOpen = () => {
    const { store: { data: { data } } } = this.props;
    return data && data.model && Object.keys(data.model).length > 0 && (this.state.editTables || this.state.editForms)
  }

  resetForms = () => {
    const { data: { data }, component: { updateComponent } } = this.props.store;
    const _dropped = {};
    Object.keys(data.model).forEach(d => _dropped[d] = false);
    updateComponent('dropped', _dropped);
    updateComponent('component', { name: "", model: {}, table: { add: true, export: true, filter: true, delete: true, edit: true, detail: false, detailPage: "" } });

    this.setState({ editForms: false, editTables: false });
  }

  onModelChange = () => {
    this.setState({ showTable: false })
    setTimeout(() => {
      this.setState({ showTable: true });
    }, 300)
  }

  render() {
    const { showTable } = this.state;
    const { classes, store: { project: { getTheme, project }, data: { data } } } = this.props;

    return (
      <Side
        showSearch={false}
        title={`Data Models - ${project.name}`}
      >
        <div className={classes.flexRow}>
          <div className={classes.flexColumWidth}>
            <Grid container justify="space-between">
              <Grid item xs={12} md={5} >
                <DataModels onModelChange={this.onModelChange} />
                {data.id && (
                  <div className={classes.actions}>
                    {false && (<Button color="secondary" variant="contained" onClick={this.toggleForms('editForms')}> Edit Forms </Button>)}
                    <Button color="secondary" variant="contained" onClick={this.toggleForms('editTables')}> Edit Tables </Button>
                  </div>
                )}
              </Grid>
              <Grid xs={12} md={5}>
                <DataFields showForm={true}/>
              </Grid>
              {data.id && (
                <Grid md={12}>
                  {showTable && <MasterTable />}
                </Grid>
              )}
              <Dialog fullScreen open={this.isOpen()} onClose={this.resetForms} TransitionComponent={Transition}>
                <AppBar className={classes.appBar}>
                  <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={this.resetForms} aria-label="close">
                      <CloseIcon />
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                      {this.state.editForms && (`Form Views For ${_.capitalize(data.name)}`)}
                      {this.state.editTables && (`Table Views For ${_.capitalize(data.name)}`)}
                    </Typography>
                  </Toolbar>
                </AppBar>
                <div style={{ marginTop: 75 }}>
                  {this.state.editForms && (<Form />)}
                  {this.state.editTables && (<Table />)}
                </div>
              </Dialog>
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
