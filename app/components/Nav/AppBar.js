import React, { Component } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx'
import Router, { withRouter } from 'next/router';

import { withStyles, useTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import { Button, Tooltip, Avatar, MenuItem, InputBase, IconButton, Menu, AppBar, Toolbar, Typography } from '@material-ui/core';

import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

import { fade } from '@material-ui/core/styles/colorManipulator';

import PageActions from './PageActions';
import RepeatableActions from './RepeatableActions';

import { savePage, deletePage } from '../../src/apiCalls/page';
import { fetchProject } from '../../src/apiCalls/project';

const drawerWidth = 200;
const rightDrawerWidth = 240;

const styles = theme => ({
  grow: {
    flexGrow: 1,
  },
  label: {
    marginLeft: 10
  },
  flexRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  searchIcon: {
    width: theme.spacing(9),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    // marginRight: rightDrawerWidth,
  },
  appBarEditPage: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    paddingRight: rightDrawerWidth,
  },
  appBarShift: {
    width: `calc(100% - ${0}px)`,
    // marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
  },
  inputRoot: {
    color: 'inherit',
    width: '100%',
  },
  inputInput: {
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(10),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 120,
      '&:focus': {
        width: 200,
      },
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(),
      width: 'auto',
    },
  },
  hide: {
    display: 'none',
  },
  menuButton: {
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
  icon: {
    color: '#fff'
  },

});

@inject('store')
@observer
class OurAppBar extends Component {
  state = {
    confirmDelete: false
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
        projectSteps,
        helpSteps,
        templateSteps,
        dataSteps,
        pageSteps,
        deploySteps,
        settingsSteps,
        themeSteps,
        userPermissionSteps,
        mediaSteps,
        navSteps,
        componentSteps,
      }
    } = this.props.store;
    const page = this.whichPage();
    console.log('PAGE', page)
    update('tourOpen', true);

    switch (page) {
      case '/projects':
        update('steps', projectSteps);
        update('tourName', 'projects');
        break;
      case '/help':
        update('steps', helpSteps);
        update('tourName', 'help');
        break;
      case '/templates':
        update('steps', templateSteps);
        update('tourName', 'template')
        break;
      case '/data-models':
        update('steps', dataSteps);
        update('tourName', 'dataModels')
        break;
      case '/pages':
        update('steps', pageSteps)
        update('tourName', 'pages')
        break;
      case '/export':
        update('steps', deploySteps)
        update('tourName', 'deploy')
        break;
      case '/settings':
        update('steps', settingsSteps)
        update('tourName', 'settings')
        break;
      case '/theme':
        update('steps', themeSteps)
        update('tourName', 'theme')
        break;
      case '/media':
        update('steps', mediaSteps)
        update('tourName', 'media')
        break;
      case '/nav':
        update('steps', navSteps)
        update('tourName', 'nav')
        break;
      case '/component':
        update('steps', componentSteps)
        update('tourName', 'components')
        break;
      default:

    }
  }

  render() {
    const {
      classes,
      breadcrumbs,
      open,
      handleDrawerOpen,
      title,
      showSearch,
      anchorEl,
      handleClose,
      auth,
      handleMenu,
      prepareSearch,
      search,
      handleInputChange,
      logout,
      hideOpen,
      pages,
      router: { pathname, query }
    } = this.props;
    const {
      auth: { user },
      project: { pageIndex },
      page: { render },
      repeatable: { repeatableNodes, repeatableIndex }
    } = this.props.store;

    const onEditingPage = pathname.indexOf('/pages') !== -1;
    const onComponentPage = pathname.indexOf('/component') !== -1;

    return (
      <AppBar
        position="fixed"
        className={clsx((onEditingPage) ? classes.appBarEditPage : classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar disableGutters={!open} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className={classes.flexRow} style={{ width: '100%' }}>
            {!hideOpen && (
              <div>
                <IconButton
                  color="inherit"
                  aria-label="Open drawer"
                  onClick={handleDrawerOpen}
                  edge="start"
                  className={classNames(classes.menuButton, open && classes.hide)}
                >
                  <MenuIcon style={{ color: '#fff' }} />
                </IconButton>
                {breadcrumbs ? breadcrumbs : (
                  <Typography variant="title" color="inherit" noWrap style={{ color: '#fff' }}>
                    {title}
                  </Typography>
                )}
              </div>
            )}
            {hideOpen && (
              <div className={classes.flexRow} style={{ width: '100%', justifyContent: 'space-between' }}>
                <Typography variant="h6" color="inherit" noWrap style={{ color: "#fff", marginLeft: 25 }}>
                  {title}
                </Typography>
                <Button color="secondary" variant="contained" style={{ marginRight: 150, }} onClick={() => window.location = 'https://sugarkubes.substack.com/'}>
                  Subscribe For Updates
                </Button>
              </div>
            )}
            {/* Component Page */}
            {false && onComponentPage && (<RepeatableActions />)}

            {/* Editing Page */}
            {onEditingPage && (
              <PageActions
                pages={pages}
              />
            )}

          </div>
          {user && showSearch && (
            <div className="step2" >
              <div className={classes.grow} />
              <div className={classes.search}>
                <div className={classes.searchIcon}>
                  <SearchIcon style={{ color: "#fff" }} />
                </div>
                <form
                  className={classes.container}
                  autoComplete="off"
                  onSubmit={prepareSearch}
                >
                  <InputBase
                    placeholder="Search…"
                    name={"search"}
                    value={search || ''}
                    style={{ color: "#fff" }}
                    classes={{
                      root: classes.inputRoot,
                      input: classes.inputInput,
                    }}
                    onChange={handleInputChange}
                  />
                </form>
              </div>
            </div>
          )}
          {false && this.whichPage().indexOf('/pages') !== -1 && <MenuItem onClick={this.savePage}>Save</MenuItem>}
          {user && (
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
                onClick={handleMenu}
                color="inherit"
                className="step6"
              >
                {user.avatar_url && (
                  <Avatar
                    style={{ color: "#fff" }}
                    src={user.avatar_url}
                  />
                )}
                {!user.avatar_url && user.email && (
                  <Avatar>{user.email[0].toUpperCase()}</Avatar>
                )}
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
                onClose={handleClose()}
              >
                <MenuItem onClick={handleClose('/profile', query)}>Profile</MenuItem>
                {false && (<MenuItem onClick={handleClose('/team', query)}>Team</MenuItem>)}
                <MenuItem onClick={handleClose('/billing', query)}>Billing</MenuItem>
                <MenuItem onClick={logout}>Log Out</MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
    );
  }
}

OurAppBar.defaultProps = {
  breadcrumbs: null,
  pages: [],
};

OurAppBar.propTypes = {
  handleMenu: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleDrawerOpen: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  auth: PropTypes.string.isRequired,
  search: PropTypes.string.isRequired,
  logout: PropTypes.func.isRequired,
  anchorEl: PropTypes.element.isRequired,
  open: PropTypes.bool.isRequired,
  showSearch: PropTypes.bool.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  prepareSearch: PropTypes.func.isRequired,
  breadcrumbs: PropTypes.element,
  hideOpen: PropTypes.bool.isRequired,
  pages: PropTypes.array,
};

export default withRouter(withStyles(styles)(OurAppBar));
