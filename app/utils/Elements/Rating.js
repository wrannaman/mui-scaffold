import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { Rating } from '@material-ui/lab';
import { Box, Tooltip, IconButton, Icon, Button } from '@material-ui/core';
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

  hasBoundData = () => {
    const { boundValue, __data } = this.props;
    // return __data ? true : false;
    return boundValue &&
    boundValue.field &&
    boundValue.model &&
    __data &&
    typeof __data[boundValue.field] !== 'undefined';
  }

  isBound = () => {
    const { boundValue, __data } = this.props;
    return boundValue &&
    boundValue.field &&
    boundValue.model
  }

  handleBoundData = (props) => {
    const { snack: { snacky } } = this.props.store;
    const { boundValue, __data } = this.props;
    if (!__data) return null;
    if (this.hasBoundData()) {
      if (Array.isArray(__data[boundValue.field])) {
        if (__data[boundValue.field].length > 0) {
          // check if they're objects or strings
          if (typeof __data[boundValue.field][0] === 'string') return __data[boundValue.field][0];
          return __data[boundValue.field][0][boundValue.relationField];
        } else {
          snacky(`Please add some data to ${boundValue.relationModelName}`, 'warning')
          return ""
        }
      } else if (__data && __data.item && Array.isArray(__data.item[boundValue.field])) {
        if (__data.item[boundValue.field].length > 0) return __data.item[boundValue.field][0][boundValue.relationField];
        else {
          snacky(`Please add some data to ${boundValue.relationModelName}`, 'warning')
          return ""
        }
      } else if (__data && __data.item && __data.item[boundValue.field] && boundValue.relationField && __data.item[boundValue.field][boundValue.relationField]) {
        return __data.item[boundValue.field][boundValue.relationField];
      }
      return __data[boundValue.field];
    }
    if (this.isBound()) return '/img/bound.png';
    return props.name;
  }

  getIcon = (name, isEmpty = false) => {
    if (!allIconsMap) return null;
    const item = allIconsMap[name];
    if (!item) return null;
    if (isEmpty) {
      return (
        <item.Icon
          fontSize={this.props.size}
        />
      );
    }
    return (
      <item.Icon
        color={this.props.color}
        fontSize={this.props.size}
      />
    );
  }

  hasBoundData = () => {
    const { boundValue, __data } = this.props;
    // return __data ? true : false;
    return boundValue &&
    boundValue.field &&
    boundValue.model &&
    __data &&
    typeof __data[boundValue.field] !== 'undefined';
  }

  isBound = () => {
    const { boundValue, __data } = this.props;
    return boundValue &&
    boundValue.field &&
    boundValue.model
  }

  handleBoundData = (props) => {
    const { snack: { snacky } } = this.props.store;
    const { boundValue, __data } = this.props;
    if (this.hasBoundData()) {
      if (Array.isArray(__data[boundValue.field])) {
        if (__data[boundValue.field].length > 0) {
          // check if they're objects or strings
          if (typeof __data[boundValue.field][0] === 'string') return __data[boundValue.field][0];
          return __data[boundValue.field][0][boundValue.relationField];
        } else {
          snacky(`Please add some data to ${boundValue.relationModelName}`, 'warning')
          return ""
        }
      } else if (__data && __data.item && Array.isArray(__data.item[boundValue.field])) {
        if (__data.item[boundValue.field].length > 0) return __data.item[boundValue.field][0][boundValue.relationField];
        else {
          snacky(`Please add some data to ${boundValue.relationModelName}`, 'warning')
          return ""
        }
      } else if (__data && __data.item && __data.item[boundValue.field] && boundValue.relationField && __data.item[boundValue.field][boundValue.relationField]) {
        return __data.item[boundValue.field][boundValue.relationField];
      }
      return __data[boundValue.field];
    }
    if (this.isBound()) return 2;
    return props.value || 2;
  }

  render() {
    const { page: { editing, dragging } } = this.props.store;
    const isEditing = editing === this.props.id;
    let ele = (
      <Box display="flex" flexDirection="column" onClick={this.onClick}>
        <Rating
          name={this.props.name}
          value={this.handleBoundData(this.props)}
          size={this.props.size}
          onChange={this.onClick}
          color={this.props.color}
          max={this.props.max}
          icon={this.getIcon(this.props.icon)}
          emptyIcon={this.getIcon(this.props.emptyIcon, true)}
          precision={this.props.precision || 1}
          readOnly={this.props.readOnly}
          style={{ ...this.props.style }}
        />
      </Box>
    );
    if (!this.props.__allowEdit) return ele;
    if (isEditing) {
      return (
        <div>
          <DragSource
            nodeID={this.props.id}
            name={'Rating'}
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
  onClick: () => {}
};

WrappedButton.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(WrappedButton));
