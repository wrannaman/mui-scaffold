import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import SendIcon from '@material-ui/icons/Send';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';

import Types from '../../utils/render/Types'

import DraggableListItem from '../Nav/DraggableListItem';

import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';

const styles = theme => ({
  root: {
    // width: '100%',
    width: 200,
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
});

@inject('store')
@observer
class NestedList extends React.Component {
  state = {
    open: {}
  };

  handleClick = (which) => () => {
    const clone = toJS(this.state.open);
    if (!clone[which]) clone[which] = true;
    else clone[which] = false;
    this.setState({ open: clone })
  }

  preview = (category, name) => () => {
    const { page: { update } } = this.props.store;
    update('demoComponent', name)
  }

  toggleAllComponents = () => {
    const { page: { components } } = this.props.store;
    let clone = toJS(this.state.open);
    if (JSON.stringify(clone) === "{}") {
      Object.keys(components).forEach((k) => clone[k] = true);
    } else {
      clone = {};
    }

    this.setState({ open: clone });
  }

  render() {
    const { classes } = this.props;
    const { open } = this.state;
    const { component: { components } } = this.props.store;

    return (
      <List
        component="nav"
        aria-labelledby="components"
        subheader={
          <ListSubheader component="div" onClick={this.toggleAllComponents}>
            Form Components
          </ListSubheader>
        }
        className={classes.root}
      >
        {components.map((option) => (
          <DraggableListItem
            key={option._id}
            item={option.name}
            type={option.type}
            name={option.name}
            onClick={this.handleClick(option)}
          />
        ))}
      </List>
    );
  }
}

export default withStyles(styles)(NestedList);
