import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { Paper, Typography } from '@material-ui/core';
import Types from '../render/Types'
import DropSource from '../../components/Shared/DropSource';
import DragSource from '../../components/Shared/DragSource';

const styles = theme => ({
  root: {
  },
  grid: {
    position: 'relative',
  },
  absolute: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  description: {
    position: 'absolute',
    top: -10,
    left: 0,
    background: '#5130a4',
    color: '#fff',
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 10,
  },
  drag: {
    position: 'absolute',
    top: 0,
    left: 0,
  }
});

@inject('store')
@observer
class Grids extends React.PureComponent {

  state = {
    showDrop: false,
  };

  static defaultProps = {
    renderChildren: () => {},
    container: false,
    spacing: 3,
    item: false,
    xs: 12,
    sm: 12,
    lg: 12,
    md: 12,
    zeroMinWidth: false,
  };

  onDrop = (direction) => (item) => {
    if (this.hasBoundData()) return;
    const { page: { update, nodes }, repeatable: { repeatables }, component: { components } } = this.props.store;
    if (item.type === 'repeatable' || item.type === 'form' || item.type === 'table' || item.type === 'basic' || item.type === 'code') {
      for (let i = 0; i < repeatables.length; i++) {
        if (repeatables[i].name === item.name) {
          item.props = Object.assign({}, toJS(repeatables[i]));
          break;
        }
      }
    }
    if (item.type === 'generated') {
      for (let i = 0; i < components.length; i++) {
        if (components[i].name === item.name) {
          item.props = Object.assign({}, toJS(components[i]));
          item.type = 'generated';
          item.componentType = item.props.type; // table or form
          break;
        }
      }
    }
    this.props.onDrop(item, direction);
  }

  edit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (this.hasBoundData()) return;
    const { page: { update } } = this.props.store
    update('editing', this.props.id);
  }
  mouseEnter = event => {
    event.stopPropagation();
    if (this.hasBoundData()) return;
    this.setState({ showDrop: true });
  }

  mouseLeave = event => {
    event.stopPropagation();
    if (this.hasBoundData()) return;
    this.setState({ showDrop: false });
  }

  nameHelper = (node) => {
    // if (node && node.type && node.children.length === 1) return node.children[0].type;
    return node.type
  }

  onOuterDrop = () => {
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

  hasBoundData = () => {
    const { boundValue, __data } = this.props;
    return __data && typeof __data.id !== 'undefined';
  }

  render() {
    const { page: { editing, nodes, dragging } } = this.props.store
    const { children, lg, id, type, style, spacing, classes } = this.props;
    const { showDrop } = this.state;
    const styleCopy = Object.assign({}, style);
    if (!styleCopy.height) styleCopy.height = '100%';
    styleCopy.position = 'relative';
    const node = nodes.find(id);
    const isEditing = editing === this.props.id;

    if (this.props.__allowEdit && !this.hasBoundData() && (dragging || editing === id || showDrop)) styleCopy.border = '1px solid #5130a4';

    let ele = (null)
    if (isEditing) {
      ele = (
        <DragSource
          nodeID={this.props.id}
          name="Paper"
          type="node"
          className={classes.drag}
          beginDrag={this.beginDrag(this.props.id)}
          endDrag={this.endDrag(this.props.id)}
        >
        </DragSource>
      );
    }
    if (this.hasBoundData() || !this.props.__allowEdit) ele = null;
    return (
        <Paper
          onMouseEnter={this.mouseEnter}
          onMouseLeave={this.mouseLeave}
          onClick={this.edit}
          id={id}
          className={classes.grid}
          style={{ ...styleCopy }}
          square={this.props.square}
          elevation={this.props.elevation}
        >
          {false && (dragging || showDrop || editing === this.props.id) && (
            <div className={classes.description}>
              {this.nameHelper(node)}
            </div>
          )}
          {(dragging || showDrop || editing === this.props.id) &&
            !this.hasBoundData() &&
            this.props.__allowEdit && (
            <DropSource
              type="COMPONENT"
              accepts={[
                Types.COMPONENT
              ]}
              onDrop={this.onDrop('top')}
              className={classes.absolute}
            />
          )}
          {ele}
          {children}
          {(dragging || showDrop || editing === this.props.id) &&
            !this.hasBoundData() &&
            this.props.__allowEdit && (
            <DropSource
              type="COMPONENT"
              accepts={[
                Types.COMPONENT
              ]}
              onDrop={this.onDrop('bottom')}
              className={classes.absolute}
            />
          )}
        </Paper>
    );
  }
}

Grids.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  container: PropTypes.object,
  renderChildren: PropTypes.func,
  spacing: PropTypes.number,
  item: PropTypes.bool,
  xs: PropTypes.number,
  sm: PropTypes.number,
  lg: PropTypes.number,
  md: PropTypes.number,
  zeroMinWidth: PropTypes.bool,
};

export default withRouter(withStyles(styles)(Grids));
