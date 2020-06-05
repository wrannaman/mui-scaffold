import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { Tooltip, IconButton, Icon, Button } from '@material-ui/core';
import DragSource from '../../components/Shared/DragSource';

import allIconsMap from '../Icons/icons';

const styles = theme => ({
  root: {
  },
});

@inject('store')
@observer
class WrappedButton extends React.PureComponent {
  state = {};

  beginDrag = (nodeID) => (e) => {
    const { page: { update } } = this.props.store;
    update('dragging', nodeID);
  }

  endDrag = (nodeID) => (e) => {
    const { page: { update } } = this.props.store;
    update('dragging', false);
  }

  onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { page: { update } } = this.props.store;
    update('editing', this.props.id);
  }

  getIcon = (name) => {
    if (!allIconsMap) return null;
    const item = allIconsMap[name];
    if (!item) return null;
    return (
      <item.Icon
        color={this.props.color}
      />
    );
  }

  render() {
    const { page: { editing, dragging } } = this.props.store;
    const isEditing = editing === this.props.id;
    let ele = (
      <Button
        key={this.id}
        id={this.id}
        style={{ ...this.props.style }}
        color={this.props.color}
        onClick={this.onClick}
        variant={this.props.variant}
        size={this.props.size}
        fullWidth={this.props.fullWidth}
      >
        {this.props.text}
      </Button>
    );

    if (this.props.isIcon && this.props.icon) {
      ele = (
        <Tooltip title={this.props.text}>
          <IconButton
            key={this.id}
            id={this.id}
            style={{ ...this.props.style }}
            color={this.props.color}
            onClick={this.onClick}
          >
            {this.getIcon(this.props.icon)}
          </IconButton>
        </Tooltip>
      )
    }
    if (!this.props.__allowEdit) return ele;
    if (isEditing) {
      return (
        <div>
          <DragSource
            nodeID={this.props.id}
            name={'Stripe Checkout'}
            type="node"
            beginDrag={this.beginDrag(this.props.id)}
            endDrag={this.endDrag(this.props.id)}
          />
          {ele}
        </div>
      );
    }
    return ele;
  }


}

WrappedButton.defaultProps = {
  onClick: () => {
  }
}

WrappedButton.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(WrappedButton));
