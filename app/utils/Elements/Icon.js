import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { Icon, IconButton } from '@material-ui/core';
import DragSource from '../../components/Shared/DragSource';

const styles = theme => ({
  root: {
  },
});

import allIconsMap from '../Icons/icons';


@inject('store')
@observer
class WrappedIcon extends React.PureComponent {
  state = {
    selectedIcon: null
  };

  componentDidMount() {
    if (allIconsMap) this.setState({ selectedIcon: allIconsMap[this.props.icon] })
  }

  componentWillUpdate(nextProps) {
    if (nextProps && nextProps.icon && nextProps.icon !== this.props.icon) {
      if (allIconsMap) this.setState({ selectedIcon: allIconsMap[nextProps.icon] });
    }
  }

  getIcon = (name) => {
    if (!allIconsMap) return null;
    const { selectedIcon } = this.state;
    if (!selectedIcon || !selectedIcon.Icon) return null;
    return (
      <selectedIcon.Icon
        key={this.id}
        id={this.id}
        style={{ ...this.props.style }}
        onClick={this.onClick}
        color={this.props.color}
        fontSize={this.props.fontSize}
      />
    );
  }

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

    const ele = this.getIcon(this.props.icon)
    if (!this.props.__allowEdit) return ele;
    if (isEditing) {
      return (
        <div>
          <DragSource
            nodeID={this.props.id}
            name="Icon"
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

WrappedIcon.defaultProps = {
  onClick: () => {
  }
}

WrappedIcon.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(WrappedIcon));
