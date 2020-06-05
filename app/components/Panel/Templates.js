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
import { inject, observer } from 'mobx-react';

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
    open: false
  };

  handleClick = (which) => () => {
    const clone = Object.assign({}, this.state.open);
    if (!clone[which]) clone[which] = true;
    else clone[which] = false;
    this.setState({ open: clone });
  }

  preview = (category, name) => () => {
    const { page: { update } } = this.props.store;
    update('demoComponent', name);
  }

  render() {
    const { classes } = this.props;
    const { open } = this.state;
    const options = {
      Sections: ['Home Page', 'Email Subscribe', 'Explain'],
    };
    return (
      <List
        component="nav"
        aria-labelledby="nested-list-subheader"
        subheader={
          <ListSubheader component="div" id="nested-list-subheader" onClick={() => this.setState({ open: false })}>
            Templates
          </ListSubheader>
        }
        className={classes.root}
      >
        {Object.keys(options).map((option) => (
          <div key={option}>
            <ListItem button onClick={this.handleClick(option)}>
              <ListItemText primary={option} />
              {open[option] ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={open[option]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>

              {options[option].map((o) => (
                <ListItem key={o} button className={classes.nested} onClick={this.preview(option, o)}>
                  <ListItemText primary={o} />
                </ListItem>
              ))}
              </List>
            </Collapse>
          </div>
        ))}
      </List>
    );
  }
}

export default withStyles(styles)(NestedList);
