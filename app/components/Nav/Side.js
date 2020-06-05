import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import clsx from 'clsx';
import dynamic from 'next/dynamic';

// next
// import Link from 'next/link';
import Router, { withRouter } from 'next/router';

// mui
import { withStyles } from '@material-ui/core/styles';

import RightDrawer from './RightDrawer';
import NewPageDialog from '../Project/NewPageDialog';
import NewRepeatableDialog from '../Repeatable/NewRepeatableDialog';
import { Button } from '@material-ui/core';

// import "../paperOverride.css";
import Auth from '../../src/Auth';


import { fetchRepeatables } from '../../src/apiCalls/repeatable';
import { updateUser } from '../../src/apiCalls/user';

// apis
// import { fetchTeams } from '../../src/apiCalls/team';
// import { fetchProjects } from '../../src/apiCalls/project';
// ours
// import theme from '../../src/theme';
import OurDrawer from './Drawer';
import OurAppBar from './AppBar';
import Snackbar from '../Shared/GlobalSnack';
import Learn from '../Learn/Learn';

const Tour = dynamic(
  () => import('reactour'),
  { ssr: false }
);

const drawerWidth = 200;

const styles = theme => ({
  root: {
    flexGrow: 1,
    height: '100vh',
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: 0,
    paddingTop: 65,
    overflowX: 'scroll',
    padding: 0,
  },
  contentForEditor: {
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
    marginRight: 0,
    paddingTop: 65,
    overflowX: 'scroll',
    padding: 0,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
});

@inject('store')
@observer
class MiniDrawer extends React.Component {
  static defaultProps = {
    showSearch: false,
    onSearch: () => { },
    children: null,
    query: {},
    title: '...',
    bindInputChange: () => {},
    route: "",
    hideOpen: false,
    initialState: "open",
    pages: [],
    onMainClick: () => {},
  }
  constructor(props) {
    super(props);
    this.state = {
      open: typeof props.initialState !== 'undefined' && props.initialState === 'closed' ? false : true,
      anchorEl: null,
      auth: false,
      user: null,
      projectsExpanded: {},
    };
  }

  componentWillUnmount() {
    if (this.interval) clearInterval(this.interval);
  }

  async componentDidMount() {
    const { props: { router: { query }, store: { auth, snack: { snacky } } } } = this;
    this.auth = new Auth();

    setTimeout(() => {
      this.maybeFetchRepeatables();
    }, 500);

    // try {
    //   const { checkTokenAndSetUser } = auth;
    //   const { access_token, id_token } = this.auth.getSession();
    //
    //   if (query && query.search) {
    //     this.setState({ search: query.search });
    //   } else {
    //     this.setState({ search: "" });
    //   }
    //
    //   if (!this.auth.isAuthenticated()) {
    //     Router.push({ pathname: '/' });
    //   }
    //
    //   await checkTokenAndSetUser({ access_token, id_token });
    // } catch (e) {
    //   snacky("Authentication failed", "error");
    //   Router.push('/');
    // }
  }

  maybeFetchRepeatables = async () => {
    const { repeatable: { updateRepeatable } } = this.props.store;
    const { router: { query: { projectID } } } = this.props;
    if (!projectID) return;

    const compRes = await fetchRepeatables({ project: projectID, limit: 25 });
    if (compRes.repeatables) updateRepeatable('repeatables', compRes.repeatables);
  }

  handleDrawerOpen = () => {
    const { page: { update } } = this.props.store;
    // const { map: { resizeMap } } = this.props.store;
    this.setState({ open: true });
    // resizeMap();
    update('render', new Date().getTime());
  };

  handleDrawerClose = () => {
    const { page: { update } } = this.props.store;
    this.setState({ open: false });
    update('render', new Date().getTime())
  };

  logout = () => {
    // const { auth: { logout } }  = this.props.store;
    this.auth.logout(Router);
  }

  prepareSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const { onSearch } = this.props;
    onSearch(e, this.state.search);
  }

  handleInputChange = (e) => {
    const { onSearch, route } = this.props;
    const { query } = this.props.router;
    let { search, limit, page } = query;
    if (!limit) limit = 10;
    if (!page) page = 0;
    search = e.target.value;
    if (!search) search = "";
    if (!e.target.value) {
      onSearch(e, '');
    }
    this.setState({ [e.target.name]: e.target.value });
    delete query.search;
    Router.push({
      pathname: `/${route ? route : 'projects'}`,
      query: { ...query, search, limit, page },
      // shallow: true,
    });
  }

  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose = (route, query) => () => {
    // const { map: { resizeMap } } = this.props.store;
    if (route) {
      const goTo = { pathname: route };
      if (query) goTo.query = query;
      Router.push(goTo);
    }
    if (this.state.anchorEl) {
      this.setState({ anchorEl: null });
    } else {
      this.setState({ open: !this.state.open });
    }
    // resizeMap();
  };

  getRoute = () => {
    const { pathname } = this.props.router;
    return pathname;
  }

  activated = (r, projectID, username) => {
    const { query } = this.props.router;
    const route = this.getRoute();
    if (r.length && r[0] !== '/') r = `/${r}`;

    if (projectID) {
      return route === r && projectID === query.projectID ? true : false;
    } else if (username) {
      return route === r && username === query.search ? true : false;
    } else {
      return route === r ? true : false;
    }
  }

  activatedByRouteQuery = (match) => {
    let isActive = false;
    const { query } = this.props.router;
    const keys = Object.keys(match);
    keys.forEach(k => {
      if (match[k] === query[k]) isActive = true;
    });
    return isActive;
  }

  createProject = () => {
    const { project: { update, createProjectModalOpen } } = this.props.store;
    update('createProjectModalOpen', true);
  }

  goToDashboard = () => {
    Router.push({ pathname: '/projects' });
  }

  goTo = (pathname, query) => {
    Router.push(pathname, query)
  }

  closeTour = async () => {
    const { snack: { snacky }, auth: { tourName, update, setLocalUser, user } } = this.props.store;
    const { name, intros, wantToBuild, isDeveloper } = user;
    if (tourName) {
      const clone = toJS(intros);
      clone[tourName] = true;
      const res = await updateUser({ name, wantToBuild, intros: clone, isDeveloper });
      setLocalUser({ ...user, intros: clone, name, wantToBuild, isDeveloper });
    }
    update('tourOpen', false);
    update('steps', []);
    update('tourName', '');
  }

  render() {
    const { goToDashboard, createProject, handleInputChange, activated } = this;
    const { classes, title, showSearch, bindInputChange, breadcrumbs, hideOpen, pages, router: { pathname } } = this.props;
    const { open, anchorEl, auth, search } = this.state;
    const { auth: { tourOpen, steps } } = this.props.store;

    const onEditingPage = pathname.indexOf('/pages') !== -1;
    const onComponentPage = pathname.indexOf('/component') !== -1;
    const onThemePage = pathname.indexOf('/theme') !== -1;
    const onSettingsPage = pathname.indexOf('/settings') !== -1;
    const onBillingPage = pathname.indexOf('/billing') !== -1;
    const onProfilePage = pathname.indexOf('/profile') !== -1;
    const onAPIPage = pathname.indexOf('/api-docs') !== -1;
    const onDeployPage = pathname.indexOf('/export') !== -1;
    const onDataModelsPage = pathname.indexOf('/data-models') !== -1;
    const onTemplatesPage = pathname.indexOf('/templates') !== -1;
    const onIndexPage = pathname.indexOf('/') !== -1;

    return (
      <div className={classes.root}>
          <OurAppBar
            handleMenu={this.handleMenu}
            auth={auth}
            showSearch={showSearch}
            search={search}
            title={title}
            open={open}
            hideOpen={hideOpen}
            prepareSearch={this.prepareSearch}
            handleClose={this.handleClose}
            anchorEl={anchorEl}
            handleInputChange={handleInputChange}
            handleDrawerOpen={this.handleDrawerOpen}
            logout={this.logout}
            breadcrumbs={breadcrumbs}
            pages={pages}
          />

          {!hideOpen && (
            <OurDrawer
              goToDashboard={goToDashboard}
              activated={activated}
              createProject={createProject}
              handleClose={this.handleClose}
              open={open}
              activatedByRouteQuery={this.activatedByRouteQuery}
            />
          )}

          <main
            className={clsx((onEditingPage || onTemplatesPage || onThemePage || onSettingsPage || onBillingPage || onProfilePage || onAPIPage || onDeployPage || onDataModelsPage) ? classes.contentForEditor : classes.content, {
              [classes.contentShift]: (open),
            })}
            onClick={this.props.onMainClick}
          >
            {this.props.children}
          </main>

          {(true || onComponentPage) && <RightDrawer />}
          {(onEditingPage) && <NewPageDialog />}
          {(onComponentPage) && <NewRepeatableDialog />}
          <Snackbar />
          <Learn />
          {tourOpen && steps && steps.length > 0 && (
            <Tour
              badgeContent={(curr, tot) => `${curr} of ${tot}`}
              steps={steps}
              isOpen={tourOpen}
              onRequestClose={this.closeTour}
              style={{ maxWidth: '600' }}
              closeWithMask={false}
              disableDotsNavigation={true}
              lastStepNextButton={<Button variant="outlined" color="primary" size="small">Got It</Button>}
              showCloseButton={false}
            />
          )}
      </div>
    );
  }
}

MiniDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  showSearch: PropTypes.bool,
  onSearch: PropTypes.func,
  query: PropTypes.object,
  children: PropTypes.object,
  title: PropTypes.string,
  route: PropTypes.string,
  router: PropTypes.object.isRequired,
  bindInputChange: PropTypes.func,
  store: PropTypes.object.isRequired,
  hideOpen: PropTypes.bool,
  breadcrumbs: PropTypes.object,
  pages: PropTypes.array,
  initialState: PropTypes.string,
  onMainClick: PropTypes.func,
};

export default withRouter(withStyles(styles, { withTheme: true })(MiniDrawer));
