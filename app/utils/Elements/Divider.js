import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { Divider } from '@material-ui/core';
import DragSource from '../../components/Shared/DragSource';

const styles = theme => ({
  root: {
  },
});

@inject('store')
@observer
class WrappedTypography extends React.PureComponent {
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

  render() {
    const { page: { editing, dragging } } = this.props.store;
    const isEditing = editing === this.props.id;
    const ele = (
      <Divider
        onClick={this.onClick}
        key={this.id}
        id={this.id}
        style={{ ...this.props.style }}
        light={this.props.light}
        orientation={this.props.orientation}
        variant={this.props.variant}
        absolute={this.props.absolute}
      />
    );
    if (!this.props.__allowEdit) return ele;
    if (isEditing) {
      return (
        <div style={{ width: '100%' }}>
          <DragSource
            nodeID={this.props.id}
            name="Divider"
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

WrappedTypography.defaultProps = {
  onClick: () => {
  }
}

WrappedTypography.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(WrappedTypography));
