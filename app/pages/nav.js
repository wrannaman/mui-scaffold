import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, ThemeProvider } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import clsx from 'clsx';
import dynamic from 'next/dynamic';

import { Tooltip, TextField, FormControlLabel, Switch, Select, FormControl, FormHelperText, InputLabel, Drawer, ListItemText, ListItemIcon, ListItem, IconButton, Divider, Typography, List, Toolbar, AppBar, Button, Avatar, MenuItem, Menu } from '@material-ui/core';

import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

import { capitalize } from 'lodash';

import GlobalSnack from '../components/Shared/GlobalSnack'

import Side from '../components/Nav/Side';
import Auth from '../src/Auth';

const Tour = dynamic(
  () => import('reactour'),
  { ssr: false }
);

import { getPage } from '../src/apiCalls/page';
import { updateProject, fetchProject } from '../src/apiCalls/project';
import { fetchRepeatables } from '../src/apiCalls/repeatable';
import { updateUser } from '../src/apiCalls/user';

const drawerWidth = 240;

const styles = theme => ({
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    paddingTop: 25,
    justifyContent: 'space-evenly',
    minWidth: 500,
    alignItems: 'center',
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
  },
  // root: {
  //   display: 'flex',
  // },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  appBarShiftRight: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginRight: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  noWidthDrawerPaper: {

  },
  logo: {
    width: 100,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  drawerHeaderWithLogo: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0),
    ...theme.mixins.toolbar,
    justifyContent: 'space-between',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    // justifyContent: 'center',
    // marginLeft: -drawerWidth,
  },
  contentShiftRight: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: drawerWidth,
  },
  contentShiftLeft: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: drawerWidth,
  },
  buttonTitleGroup: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  formControl: {
    width: 170,
  }
});

@inject('store')
@observer
class EditorPage extends React.Component {
  state = {
    loading: false,
    open: false,
    anchorEl: null,
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

  update = (name, bool = false) => (e) => {
    const { project: { project, update } } = this.props.store;
    const clone = Object.assign({}, toJS(project));
    if (bool) clone.nav[name] = e.target.checked;
    else clone.nav[name] = e.target.value;
    update('project', clone);
  }

  init = async () => {
    const { router: { query: { projectID } }, store: { project: { update } } } = this.props;
    const proj = await fetchProject({ projectID });
    if (proj.success) {
      update('project', proj.project);
    }
    this.handleHelp();
  }

  handleHelp = (bypass = false) => {
    const {
      auth: { update, user, navSteps },
    } = this.props.store;
    // if (bypass || ( !user.intros || !user.intros.nav )) {
    //   update('steps', navSteps);
    //   update('tourOpen', true);
    //   update('tourName', 'nav');
    // }
  }

  closeTour = async () => {
    const { snack: { snacky }, auth: { tourName, update, setLocalUser, user } } = this.props.store;
    const { name, intros, wantToBuild, isDeveloper } = user;
    const clone = toJS(intros);
    clone.nav = true;
    const res = await updateUser({ name, wantToBuild, intros: clone, isDeveloper });
    setLocalUser({ ...user, intros: clone, name, wantToBuild, isDeveloper });
    update('tourOpen', false);
    update('steps', []);
    update('tourName', '');
  }

  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  }

  save = async () => {
    const { snack: { snacky }, project: { project: { nav, id } } } = this.props.store;
    const res = await updateProject({ nav, id });
    if (res.success) {
      snacky('saved');
    } else {
      snacky(res.error, 'error');
    }
  }

  whichPage = () => {
    const { router: { pathname } } = this.props;
    return pathname;
  }

  toggleHelp = () => {
    const {
      auth: {
        tourName,
        update,
        setLocalUser,
        user,
        navSteps,
      }
    } = this.props.store;
    const page = this.whichPage();
    update('tourOpen', true);

    switch (page) {
      case '/nav':
        update('steps', navSteps);
        update('tourName', 'nav');
        break;
      default:
    }
  }


  render() {
    const { classes, router: { query: { projectID }} } = this.props;
    const { open, anchorEl } = this.state;

    const { auth: { tourOpen, steps }, project: { appBarOptions, colorOptions, variantOptions, anchorOptions, getTheme, project: { name, pages, nav, html } } } = this.props.store;
    return (
      <div>
        <ThemeProvider theme={getTheme()}>
          <div className={classes.root} style={{ backgroundColor: getTheme().palette.background.default }}>
            <AppBar
              position={nav.appBar}
              className={clsx(classes.appBar, {
                [classes.appBarShift]: ((open || nav.variant === 'permanent') && nav.anchor === 'left'),
                [classes.appBarShiftRight]: ((open || nav.variant === 'permanent') && nav.anchor === 'right'),
              })}
              color={nav.color}
            >
              <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className={classes.buttonTitleGroup}>
                  <IconButton
                    id="nav-hamburger"
                    color="inherit"
                    aria-label="open drawer"
                    onClick={() => this.setState({ open: !this.state.open })}
                    edge="start"
                    className={clsx(classes.menuButton, open && classes.hide)}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Typography variant="h6" noWrap >
                    Page Title
                  </Typography>
                </div>
                <div>
                  <Tooltip title="Open Help Walkthrough">
                    <IconButton
                      onClick={this.toggleHelp}
                      color="inherit"
                      id="help-button"
                    >
                      <HelpOutlineIcon />
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    aria-owns={open ? 'menu-appbar' : null}
                    aria-haspopup="true"
                    onClick={this.handleMenu}
                    color="inherit"
                    className="step6"
                  >
                    <Avatar style={{ color: getTheme().palette.text.primary }}>U</Avatar>
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorEl)}
                    onClose={() => this.setState({ anchorEl: null })}
                  >
                    <MenuItem onClick={() => this.setState({ anchorEl: null })}>Profile</MenuItem>
                    <MenuItem onClick={() => this.setState({ anchorEl: null })}>Billing</MenuItem>
                    <MenuItem onClick={() => this.setState({ anchorEl: null })}>Log Out</MenuItem>
                  </Menu>
                </div>
              </Toolbar>
            </AppBar>
            <Drawer
              className={classes.drawer}
              variant={nav.variant}
              anchor={nav.anchor}
              open={open}
              onClose={() => this.setState({ open: !this.state.open })}
              classes={{
                paper: ['left', 'right'].indexOf(nav.anchor) !== -1 ? classes.drawerPaper : classes.noWidthDrawerPaper,
              }}
            >
              {nav.variant !== 'permanent' && (
                <React.Fragment>
                  <div className={html.logo ? classes.drawerHeaderWithLogo : classes.drawerHeader}>
                    {nav.logo && html.logo && (
                      <div style={{ width: '100%', textAlign: 'center' }}>
                        <img
                          src={html.logo}
                          className={classes.logo}
                        />
                      </div>
                    )}
                    <IconButton onClick={() => this.setState({ open: !this.state.open })}>
                      <ChevronLeftIcon />
                    </IconButton>
                  </div>
                  <Divider />
                </React.Fragment>
              )}
              <List>
                {pages.map((page, index) => (
                  <ListItem button key={page.displayName || capitalize(page.name)}>
                    {false && (<ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>)}
                    <ListItemText primary={page.displayName || capitalize(page.name)} />
                  </ListItem>
                ))}
              </List>

            </Drawer>
            <main
              className={clsx(classes.content, {
                [classes.contentShiftLeft]: ((open || nav.variant === 'permanent') && nav.anchor === 'left'),
                [classes.contentShiftRight]: ((open || nav.variant === 'permanent') && nav.anchor === 'right'),
              })}
              style={{ height: '100vh'}}
            >
              <div className={classes.drawerHeader} />
              <Typography variant="body1" style={{ color: getTheme().palette.text.primary }} id="nav-top">
                This is where the content from your pages will go.
              </Typography>
              <div className={classes.flexRow}>
                <div>
                  <FormControlLabel
                    control={
                      <Switch checked={nav.logo === true} onChange={this.update('logo', true)} value="logo" />
                    }
                    label="Show Logo"
                    style={{ color: getTheme().palette.text.primary }}
                  />
                </div>
                {false && nav.logo &&  (
                  <div>
                    <TextField
                      className={classes.textField}
                      label="Logo URL"
                      margin="normal"
                      value={nav.logoURL}
                      onChange={this.update('logoURL')}
                    />
                  </div>
                )}
              </div>
              <div className={classes.flexRow}>
                <div>
                  <FormControl className={classes.formControl}>
                    <InputLabel id="variant-opts-label">Drawer Type</InputLabel>
                    <Select
                      labelId="variant-opts-label"
                      id="variant-opts"
                      value={nav.variant}
                      onChange={this.update('variant')}
                    >
                      {variantOptions.map((o) => (<MenuItem key={o} value={o}>{o}</MenuItem>))}
                    </Select>
                  </FormControl>
                </div>
                <div>
                  <FormControl className={classes.formControl}>
                    <InputLabel id="anchor-opts-label">Drawer Position</InputLabel>
                    <Select
                      labelId="anchor-opts-label"
                      id="anchor-opts"
                      value={nav.anchor}
                      onChange={this.update('anchor')}
                    >
                      {anchorOptions.map((o) => (<MenuItem key={o} value={o}>{o}</MenuItem>))}

                    </Select>
                  </FormControl>
                </div>
              </div>
              <div className={classes.flexRow}>
                <div>
                  <FormControl className={classes.formControl}>
                    <InputLabel id="app-bar-opts-label">App Bar Position</InputLabel>
                    <Select
                      labelId="app-bar-opts-label"
                      id="app-bar-opts"
                      value={nav.appBar}
                      onChange={this.update('appBar')}
                    >
                      {appBarOptions.map((o) => (<MenuItem key={o} value={o}>{o}</MenuItem>))}

                    </Select>
                  </FormControl>
                </div>
                <div>
                  <FormControl className={classes.formControl}>
                    <InputLabel id="color-opts-label">App Bar Color Options</InputLabel>
                    <Select
                      labelId="color-opts-label"
                      id="color-opts"
                      value={nav.color}
                      onChange={this.update('color')}
                    >
                      {colorOptions.map((o) => (<MenuItem key={o} value={o}>{o}</MenuItem>))}
                    </Select>
                  </FormControl>
                </div>
              </div>
              <div style={{ marginTop: 25, width: 300, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    this.closeTour();
                    Router.push({ pathname: '/pages', query: { projectID }});
                  }}
                  id="nav-back"
                >
                  Go Back
                </Button>
                <Button variant="contained" color="secondary" onClick={this.save}>Save</Button>
              </div>
            </main>
          </div>
          <GlobalSnack />
        </ThemeProvider>
        {tourOpen && steps && steps.length > 0 && (
          <Tour
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

EditorPage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(EditorPage));
