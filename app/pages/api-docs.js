import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';

import Side from '../components/Nav/Side';
import Auth from '../src/Auth';
import { Typography } from '@material-ui/core';
import { fetchProject } from '../src/apiCalls/project';


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
  }
});

@inject('store')
@observer
class Index extends React.Component {

  state = {
    apiOK: true
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
    const { query: { projectID } } = this.props.router;
    const {
      project: { update },
    } = this.props.store;
    const proj = await fetchProject({ projectID });
    if (proj.success) {
      update('project', proj.project);
    }
    this.tryApiDocs()
  }

  tryApiDocs = async () => {
    try {
      const { project: { project } } = this.props.store;
      const hasAPI = project && project.deployment && project.deployment.api_url && project.deployment.api_url.dev;
      if (!hasAPI) return;
      let res = await fetch(`${hasAPI}?url=${hasAPI}/swagger.json`)
      res = await res.json();
      if (!res || !res.openapi) this.setState({ apiOK: false })
    } catch (e) {
      console.log('e ', e);
    }
  }
  render() {
    const { apiOK } = this.state;
    const { classes } = this.props;
    const { project: { project } } = this.props.store;
    const hasAPI = project && project.deployment && project.deployment.api_url && project.deployment.api_url.dev;

    return (
      <Side
        showSearch={false}
        title={`API Docs`}
      >
        <div className={classes.flexRow} style={{ height: '100%' }}>
          <div className={classes.flexColumWidth} style={{ height: '100%' }}>
            {apiOK && hasAPI && (
              <iframe
                title="api-docs"
                src={`${hasAPI}?url=${hasAPI}/swagger.json`}
                style={{ border: 'none', height: '100%' }}
                height={"90vh"}
              />
            )}
            {(!apiOK || !hasAPI) && (
              <div>
                <Typography variant="body1" style={{ marginTop: 25, textAlign: 'center' }}>
                  Your API documentation will show up here once you build and deploy your app.
                </Typography>
                <Typography variant="body1" style={{ marginTop: 25, textAlign: 'center' }}>
                  This will show you how to interface with your api to integrate with other apps or bring in external data.
                </Typography>
              </div>
            )}
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
