import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';

import Side from '../components/Nav/Side';
import Auth from '../src/Auth';
import { Paper, Typography } from '@material-ui/core';
import amber from '@material-ui/core/colors/amber';

import { fetchProject, fetchProjectTemplates } from '../src/apiCalls/project';
import { fetchDatas } from '../src/apiCalls/data';
import { fetchRepeatables } from '../src/apiCalls/repeatable';
import Template from '../components/Template/Template';
import AfterClone from '../components/Template/AfterClone';

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
  title: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 25,
  },
  project: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  paper: {
    width: '70%',
    minWidth: 400,
    backgroundColor: amber[700],
    display: 'flex',
    textAlign: 'center',
    margin: 25,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
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
    const {
      page: { setNodes, nodes, updatePage, setRepeatableNodes },
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
    if (d.success) updateData('datas', d.datas.docs);

    // fetch project
    const proj = await fetchProject({ projectID });
    if (proj.success) {
      update('project', proj.project);
    }

    // fetch repeatables
    const repeat = await fetchRepeatables({ project: projectID });
    if (repeat.repeatables) updateRepeatable('repeatables', repeat.repeatables);
  }

  hasStuffInProject = () => {
    const { project: { project }, repeatable: { repeatables }, data: { datas } } = this.props.store;
    if (project.pages.length > 0 || repeatables.length > 0 || datas.length > 2) return true;
    return false;
  }

  render() {
    const { classes } = this.props;
    const { project: { project: { name }, templates } } = this.props.store;

    return (
      <Side
        showSearch={false}
        title={`${name} - Templates`}
      >
        <div className={classes.flexRow}>
          <div className={classes.flexColumWidth}>
            <div className={classes.title}>
              <Typography variant="h4">Templates</Typography>

              {this.hasStuffInProject() ? (
                <Paper className={classes.paper}>
                  <Typography variant="overline" style={{  }}>
                    You must delete all pages, components, and data models before you can clone a project.
                  </Typography>
                </Paper>
              ) : (
                <Typography variant="body2" style={{ marginTop: 15 }}>
                  Select a template to clone to jumpstart your project!
                </Typography>
              )}
            </div>

            <div className={classes.project}>
              {templates.map((t, i) => <Template index={i} template={t} />)}
            </div>
          </div>
        </div>
        <AfterClone />
      </Side>
    );
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Index));
