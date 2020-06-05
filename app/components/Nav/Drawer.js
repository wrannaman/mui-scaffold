import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx'
import { withStyles, useTheme } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ListSubheader from '@material-ui/core/ListSubheader';

import PanelList from '../Panel/Components';
import ComponentsList from '../Panel/ComponentsList';
import Templates from '../Panel/Templates';
import Links from '../Panel/Links';
import Tree from '../Tree/Tree';

const drawerWidth = 200;

const styles = theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },

  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  logoWrap: {
    position: 'absolute',
    top: 6,
    left: 38,
    zIndex: 2,
    cursor: 'pointer',
  },
  logoIcon: {
    width: 25,
  },
  logo: {
    width: 100,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  active: {
    color: theme.palette.primary.light,
  },
  jazzWrap: {
    position: 'absolute',
    zIndex: -1,
    width: drawerWidth,
    bottom: 0,
  },
  jazz: {
    width: drawerWidth * 1.5
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
});

@inject('store')
@observer
class DrawerContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: {
        [props.router.query.projectID]: true,
      },
    }
  }
  componentDidMount() {
    const { query } = this.props.router;
    if (query.projectID) {
      this.setState({
        open: { [query.projectID]: true },
      })
    }
  }
  render() {
    const { classes, projects, router: { pathname } } = this.props;
    const { auth: { user, userPermissions }, component: { components } } = this.props.store;
    return (
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={this.props.open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={this.props.handleClose()}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
          <div
            onClick={this.props.goToDashboard}
            className={classes.logoWrap}
          >
            <div>
              <img
                src="/img/logo.png"
                className={classes.logo}
              />
            </div>
          </div>
          {false && (
            <div className={classes.jazzWrap}>
              <img src="/img/mask-line-a-double.png" className={classes.jazz}/>
            </div>
          )}
          <Divider />
          <Links />
          {false && (pathname.indexOf('/page') !== -1 || pathname.indexOf('/pages') !== -1) && <PanelList />}
          {false && (pathname.indexOf('/page') !== -1 || pathname.indexOf('/pages') !== -1) && <Templates />}
          {false && (pathname.indexOf('/page') !== -1 || pathname.indexOf('/pages') !== -1) && <Tree />}

      </Drawer>
    );
  }
}

export default withRouter(withStyles(styles)(DrawerContent));

DrawerContent.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleDrawerClose: PropTypes.func.isRequired,
  createProject: PropTypes.func.isRequired,
  activated: PropTypes.func.isRequired,
  active: PropTypes.func.isRequired,
  goToDashboard: PropTypes.func.isRequired,
  projects: PropTypes.array.isRequired,
  activatedByRouteQuery: PropTypes.func.isRequired,
};
