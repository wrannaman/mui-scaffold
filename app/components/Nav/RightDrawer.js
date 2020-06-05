import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';

import { Tooltip, Tabs, Tab, Drawer, Divider, List, ListItemIcon, ListItem, ListItemText } from '@material-ui/core';

import BrushIcon from '@material-ui/icons/Brush';
import AddIcon from '@material-ui/icons/Add';
import AccountTreeIcon from '@material-ui/icons/AccountTree';

import EditComponent from '../Edit/EditComponent';
import Tree from '../Tree/Tree';
import Components from '../Panel/Components';

const drawerWidth = 240;

const styles = theme => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
    background: '#f8f5ff'
  },
  tabRoot: {
    minWidth: 80,
  }
});

@inject('store')
@observer
class RightDrawer extends React.Component {
  state = {
    value: 1,
  };

  handleChange = (e, value) => {
    this.setState({ value })
  }

  render() {
    const { value } = this.state;
    const { classes, router, index } = this.props;
    const correctIndex = index ? index : value;
    return (
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
        anchor="right"
      >
      <Tabs
        value={correctIndex}
        onChange={this.handleChange}
        variant="standard"
        indicatorColor="primary"
        textColor="primary"
        aria-label="actions"
      >
        <Tooltip title="Edit Component">
          <Tab
            icon={<BrushIcon />}
            id="pages-edit"
            aria-label="style component"
            classes={{
              root: classes.tabRoot
            }}
          />
        </Tooltip>
        <Tooltip title="Add Element">
          <Tab
            icon={<AddIcon />}
            id="pages-elements"
            aria-label="add element"
            classes={{
              root: classes.tabRoot
            }}
          />
        </Tooltip>
        <Tooltip title="Tree View">
          <Tab
            id="pages-tree"
            icon={<AccountTreeIcon />}
            aria-label="tree view"
            classes={{
              root: classes.tabRoot
            }}
          />
        </Tooltip>
      </Tabs>
      <div style={{ overflowY: 'scroll', overflowX: 'hidden' }}>
        {correctIndex === 0 && (
          <div>
            <EditComponent embedded={true} />
          </div>
        )}
        {correctIndex === 1 && (<Components />)}
        {correctIndex === 2 && (<Tree />)}
      </div>
      </Drawer>
    );
  }
}

RightDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(RightDrawer));
