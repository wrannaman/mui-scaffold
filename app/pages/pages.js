import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, ThemeProvider } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { find } from 'lodash';

import { Typography, DialogContent, DialogActions, Button, Dialog, DialogTitle } from '@material-ui/core';

import Preview from '../components/Panel/Preview';

import Renderer from '../components/Renderer/Renderer';
import EditComponent from '../components/Edit/EditComponent';

import Side from '../components/Nav/Side';
import Auth from '../src/Auth';

import { getPage } from '../src/apiCalls/page';
import { fetchProject } from '../src/apiCalls/project';
import { fetchRepeatables } from '../src/apiCalls/repeatable';
import { fetchDatas } from '../src/apiCalls/data';

const styles = theme => ({
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    paddingTop: 25,
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
    minWidth: 300,
    minHeight: 300
  }
});

@inject('store')
@observer
class EditorPage extends React.Component {
  state = {
    loading: false,
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
    this.init(pageID);
  }

  componentWillUnmount() {
    const {
      page: { resetComponents }
    } = this.props.store;
    resetComponents();
  }

  componentWillUpdate(nextProps) {
    const { query: { pageID } } = this.props.router;
    if (pageID !== nextProps.router.query.pageID) {
      this.init(nextProps.router.query.pageID);
    }
  }

  handleHelp = () => {
    const {
      auth: { update, user, pageSteps },
    } = this.props.store;
    // if (!user.intros || !user.intros.pages) {
    //   update('steps', pageSteps);
    //   update('tourOpen', true);
    //   update('tourName', 'pages');
    // }
  }

  init = async (nextPage = false) => {
    const { query: { projectID } } = this.props.router;
    const {
      page: { setNodes, nodes, updatePage, setRepeatableNodes, setPageComponents },
      project: { update },
      data: { resetData, updateData, setFake },
      snack: { snacky },
      repeatable: { updateRepeatable }
    } = this.props.store;

    resetData();
    setPageComponents();
    const d = await fetchDatas({ projectID, limit: 25 });
    if (d.success) updateData('datas', d.datas.docs);
    const proj = await fetchProject({ projectID });
    if (proj.success) {
      update('project', proj.project);
      let idx = 0;
      for (let i = 0; i < proj.project.pages.length; i++) {
        if (proj.project.pages[i]._id === nextPage) {
          idx = i;
          break;
        }
      }
      if (!nextPage && proj.project.pages.length > 0) {
        Router.push({
          pathname: '/pages',
          query: { projectID, pageID: nextPage ? nextPage : proj.project.pages[idx]._id },
          shallow: true
        });
      }

      let res = null;
      if (proj.project.pages.length > 0) {
        update('pageIndex', idx);
        res = await getPage({ id: nextPage ? nextPage : proj.project.pages[idx]._id });
        setNodes(res.page);
        setRepeatableNodes();
      }


      // fetch repeatables
      const repeat = await fetchRepeatables({ project: projectID });
      if (repeat.repeatables) updateRepeatable('repeatables', repeat.repeatables);

      // set data model if the page is a detail page
      if (res && res.page.type === 'detail' && res.page.boundDataModel) {
        const data = find(d.datas.docs, { id: res.page.boundDataModel });
        updateData('data', {});
        updateData('data', data);
        setFake(data.model);
      }

      update('render', new Date().getTime());
      this.handleHelp();
    } else {
      snacky(proj.error, 'error');
    }
  }

  handleClose = () => {
    const { page: { update } } = this.props.store;
    update('demoComponent', '');
  }

  clearEditing = () => {
    const { page: { update } } = this.props.store;
    update('editing', '');
  }

  render() {
    const { classes, router: { query: { pageID } } } = this.props;
    const { loading } = this.state;
    const { page: { demoComponent, nodes }, project: { getTheme, project: { userRoles, defaultUserRole, name, pages } } } = this.props.store;

    return (
      <Side
        showSearch={false}
        title={`${name.slice(0, 20)} ${name.length > 20 ? '...' : ''} - Pages`}
        pages={pages}
        onMainClick={this.clearEditing}
      >
        <ThemeProvider theme={getTheme()}>
          <div
            className={classes.flexRow}
            onClick={this.clearEditing}
            style={{ backgroundColor: getTheme().palette.background.default }}
          >
            <div
              className={classes.flexColumWidth}
              onClick={this.clearEditing}
            >
              <Dialog
                maxWidth={false}
                open={demoComponent}
                classes={{ paper: classes.paper }}
                onClose={this.handleClose}
              >
                <DialogTitle>{demoComponent} Demo</DialogTitle>
                <DialogContent>
                  <Typography variant="body1" gutterBottom>
                    To use this component, close this window, then drag and drop the element on to the page to use it.
                  </Typography>
                  <Preview />
                </DialogContent>
                <DialogActions>
                  <Button onClick={this.handleClose} color="primary">
                   Close
                  </Button>
                </DialogActions>
              </Dialog>
              {pages.length > 0 && <Renderer />}
              {pages.length === 0 && (
                <div style={{ textAlign: 'center' }}>
                  <Typography variant="body1" style={{ margin: '0 auto' }}>
                    Create a page to get started.
                  </Typography>
                </div>
              )}
              {false && (<EditComponent />)}
            </div>
          </div>
        </ThemeProvider>
      </Side>
    );
  }
}

EditorPage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(EditorPage));
