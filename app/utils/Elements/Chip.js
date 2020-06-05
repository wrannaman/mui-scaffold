import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { Chip } from '@material-ui/core';
import DragSource from '../../components/Shared/DragSource';

const styles = theme => ({
  root: {
  },
});

@inject('store')
@observer
class WrappedChip extends React.PureComponent {
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
    return boundValue &&
    boundValue.field &&
    boundValue.model &&
    __data &&
    typeof __data[boundValue.field] !== 'undefined';
  }

  handleText = (props) => {
    const hasBoundValue = props.boundValue && props.boundValue.field && props.boundValue.model;
    if (hasBoundValue) {
      if (props.__data && typeof props.__data[props.boundValue.field] !== 'undefined') {
        return props.__data[props.boundValue.field];
      }
      return `<Bound To ${props.boundValue.model}-${props.boundValue.field}>`;
    }
    return this.props.label;
  }

  render() {
    const { page: { editing, dragging } } = this.props.store;
    const isEditing = editing === this.props.id;
    const hasBoundData = this.hasBoundData();

    const ele = (
      <Chip
        key={this.id}
        id={this.id}
        style={{ ...this.props.style }}
        onClick={this.onClick}
        color={this.props.color}
        clickable={this.props.clickable}
        variant={this.props.variant}
        size={this.props.size}
        label={this.handleText(this.props)}
      />
    );
    if (hasBoundData || !this.props.__allowEdit) return ele;
    if (isEditing) {
      return (
        <div>
        <DragSource
          nodeID={this.props.id}
          name="Chip"
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

WrappedChip.defaultProps = {
  onClick: () => {
  }
}

WrappedChip.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(WrappedChip));
