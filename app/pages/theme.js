import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, ThemeProvider } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import dynamic from 'next/dynamic';

import Side from '../components/Nav/Side';
import Auth from '../src/Auth';
import ThemePreview from '../components/Theme/ThemePreview'
const ThemeEditor = dynamic(
  () => import('../components/Theme/ThemeEditor'),
  { ssr: false }
);

import { fetchProject } from '../src/apiCalls/project';
import { Grid, CircularProgress } from '@material-ui/core';

const styles = theme => ({
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    height: '90vh',
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
    const { project: { update } } = this.props.store;
    const proj = await fetchProject({ projectID });
    if (proj.success) {
      update('project', proj.project);
    }
    this.handleHelp();
  }

  handleHelp = () => {
    const {
      auth: { update, user, themeSteps },
    } = this.props.store;
    // if (!user.intros || !user.intros.theme) {
    //   update('steps', themeSteps);
    //   update('tourOpen', true);
    //   update('tourName', 'theme');
    // }
  }

  render() {
    const { classes } = this.props;
    const { project: { getTheme, project: { name, theme } } } = this.props.store;
    return (
      <Side
        showSearch={false}
        title={`${name} - Theme`}
      >
        {(!name || !theme) && (
          <Grid item xs={12} alignItems="center" alignContent="center" justify="center" style={{ display: 'flex', paddingBottom: 25, marginTop: 75  }}>
            <CircularProgress color="secondary" />
          </Grid>
        )}
        {name && theme && (
          <Grid container className={classes.flexRow}>
            <Grid item lg={8} id="theme-top" >
              <ThemeEditor />
            </Grid>
            <Grid item lg={4} id="theme-preview" >
              <ThemeProvider theme={getTheme()}>
                <ThemePreview />
              </ThemeProvider>
            </Grid>
          </Grid>
        )}
      </Side>
    );
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Index));
