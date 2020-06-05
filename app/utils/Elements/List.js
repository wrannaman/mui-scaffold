import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import InboxIcon from '@material-ui/icons/Inbox';
import DraftsIcon from '@material-ui/icons/Drafts';

import DragSource from '../../components/Shared/DragSource';

const styles = theme => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
});

// shouldComponentUpdate = (nextProps) => {
//   if (JSON.stringify(this.props) === JSON.stringify(nextProps)) {
//      return false;
//   }
//   return true;
// }

@inject('store')
@observer
class WrappedCheckbox extends React.PureComponent {
  state = {};

  onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { page: { update } } = this.props.store;
    update('editing', this.props.id);
  }

  beginDrag = (nodeID) => (e) => {
    const { page: { update } } = this.props.store;
    update('dragging', nodeID);
  }

  endDrag = (nodeID) => (e) => {
    const { page: { update } } = this.props.store;
    update('dragging', false);
  }

  render() {
    const { classes, id, store: { page: { editing } } } = this.props;
    const isEditing = editing === this.props.id;
    const ele = (
      <List
        component="nav"
        onClick={this.onClick}
        aria-label="list"
        style={{ ...this.props.style, border: editing === id && this.props.__allowEdit ? '1px solid #5130a4' : 'none' }}
        dense={this.props.dense}
      >
        {this.props.items.map(item => (
          <ListItem
            dense={this.props.dense}
            disabled={this.props.disabled}
            disableGutters={this.props.disableGutters}
            divider={this.props.divider}
            button={this.props.button}
          >
            {false && (
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
            )}
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    );
    if (!this.props.__allowEdit) return ele;
    if (isEditing) {
      return (
        <React.Fragment>
          <DragSource
            nodeID={this.props.id}
            name="List"
            type="node"
            beginDrag={this.beginDrag(this.props.id)}
            endDrag={this.endDrag(this.props.id)}
            extras={true}
          />
          {ele}
        </React.Fragment>
      );
    }
    return ele;
  }
}

WrappedCheckbox.defaultProps = {
  onClick: () => {
  },
  items: [],
}

WrappedCheckbox.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  items: PropTypes.array,
};

export default withRouter(withStyles(styles)(WrappedCheckbox));
