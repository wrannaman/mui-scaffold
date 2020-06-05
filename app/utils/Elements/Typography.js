import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { Typography } from '@material-ui/core';
import DragSource from '../../components/Shared/DragSource';

const styles = theme => ({
  root: {
  },
});

@inject('store')
@observer
class WrappedTypography extends React.PureComponent {
  state = {};

  onClick = (e) => {
    if (this.hasBoundData()) return;
    e.preventDefault();
    e.stopPropagation();
    const { page: { update } } = this.props.store;
    update('editing', this.props.id);
  }

  beginDrag = (nodeID) => (e) => {
    if (this.hasBoundData()) return;
    const { page: { update } } = this.props.store;
    update('dragging', nodeID);
  }

  endDrag = (nodeID) => (e) => {
    if (this.hasBoundData()) return;
    const { page: { update } } = this.props.store;
    update('dragging', false);
  }

  handleText = (props) => {
    const { snack: { snacky } } = this.props.store;
    const { boundValue, __data } = this.props;
    if (this.hasBoundData()) {
      if (Array.isArray(__data[boundValue.field])) {
        if (__data[boundValue.field].length > 0) {
          if (boundValue.relationField === '__count') return __data[boundValue.field].length;
          // check if they're objects or strings
          if (typeof __data[boundValue.field][0] === 'string' || typeof __data[boundValue.field][0] === 'number') return __data[boundValue.field][0];
          return __data[boundValue.field][0][boundValue.relationField];
        } else {
          snacky(`Please add some data to ${boundValue.relationModelName}`, 'warning')
          return ""
        }
      } else if (__data && __data.item && Array.isArray(__data.item[boundValue.field])) {
        if (__data.item[boundValue.field].length > 0) {
          if (boundValue.relationField === '__count') return __data.item[boundValue.field].length;
          const item = __data.item[boundValue.field][0][boundValue.relationField]
          if (typeof item === 'string' || typeof item === 'number') return item;
          return "Error parsing test data";
        } else {
          snacky(`Please add some data to ${boundValue.relationModelName}`, 'warning')
          return ""
        }
      } else if (__data && __data.item && __data.item[boundValue.field] && boundValue.relationField && __data.item[boundValue.field][boundValue.relationField]) {
        return __data.item[boundValue.field][boundValue.relationField];
      }
      return typeof __data[boundValue.field] !== 'object' ? __data[boundValue.field] : '?';
    }
    if (this.isBound())  return `<Bound To ${boundValue.model}-${boundValue.field}>`;
    return this.props.text;
  }

  isBound = () => {
    const { boundValue, __data } = this.props;
    return boundValue &&
    boundValue.field &&
    boundValue.model
  }

  hasBoundData = () => {
    const { boundValue, __data } = this.props;
    return boundValue &&
    boundValue.field &&
    boundValue.model &&
    __data &&
    typeof __data[boundValue.field] !== 'undefined';
  }

  render() {
    const { page: { editing }, project: { getTheme } } = this.props.store;
    const { id } = this.props;
    const isEditing = editing === this.props.id;
    const hasBoundData = this.hasBoundData();
    let ele = (
      <Typography
        key={this.props.id}
        id={this.props.id}
        style={{
          color: getTheme().palette.text.primary,
          ...this.props.style,
          border: this.props.__allowEdit && editing === id && !hasBoundData ? '1px solid #5130a4' : 'none',
        }}
        variant={this.props.variant}
        noWrap={this.props.noWrap}
        color={this.props.color}
        align={this.props.align}
        onClick={this.onClick}
      >
        {this.props.maxLength ? `${this.handleText(this.props).slice(0, this.props.maxLength)}${this.handleText(this.props).length > this.props.maxLength ? '...' : ''}` : this.handleText(this.props)}
      </Typography>
    );
    if (hasBoundData || !this.props.__allowEdit) return ele;

    if (isEditing) {
      return (
        <DragSource
          nodeID={this.props.id}
          name="Typography"
          type="node"
          beginDrag={this.beginDrag(this.props.id)}
          endDrag={this.endDrag(this.props.id)}
          extras={true}
        >
          {ele}
        </DragSource>
      );
    }
    return ele;
  }
}

WrappedTypography.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(WrappedTypography));
