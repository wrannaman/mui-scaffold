import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { TreeView, TreeItem } from '@material-ui/lab';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import 'react-sortable-tree/style.css';
import './tree.css';

import { SortableTreeWithoutDndContext } from 'react-sortable-tree';
// import SortableTree from 'react-sortable-tree';

import { walk } from './utils';

const styles = theme => ({
  root: {
    width: '100%',
    height: '100vh',
    overflow: 'scroll'
  },
});

@inject('store')
@observer
class Tree extends React.Component {
  state = {};

  componentDidMount() {
    const { walk } = require('react-sortable-tree')
  }

  clickTree = (id) => () => {
    const { page: { update } } = this.props.store;
    update('editing', id);
  }

  renderTree = (structure) => {
    if (Array.isArray(structure)) {
      return structure.map((struct, i) => {
        return this.renderTree(struct)
      })
    }
    return Object.keys(structure).map((struct, i) => {
      let inner = null;
      if (structure[struct].children &&
        structure[struct].children.length > 0) {
        return (
          <TreeItem
            nodeId={`${structure[struct].id}`}
            label={struct}
            onClick={this.clickTree(structure[struct].id)}
          >
          {this.renderTree(structure[struct].children)}
          </TreeItem>
        )
      }
      return (
        <TreeItem onClick={this.clickTree(structure[struct].id)} nodeId={`${structure[struct].id}`} label={struct} />
      )
    })
  }

  onChange = (previous) => (treeData) => {
  }

  getNodeKey = (node) => node.node.id;

  onVisibilityToggle = ({ treeData, node, expanded, path }) => {
    const { store: { page: { nodes, update } } } = this.props;
    const ourNode = nodes.find(node.id)
    ourNode.update('expanded', expanded);
    update('render', new Date().getTime());
  }

  onMoveNode = ({ treeData, node, nextParentNode, prevPath, prevTreeIndex, nextTreeIndex }) => {
    const { store: { page: { nodes, update } } } = this.props;
    const ourNode = nodes.find(node.id);
    const ourParent = nodes.find(ourNode.getParent());
    const ourNextParentNode = nodes.find(nextParentNode.id);
    const currentIndex = nodes.find(ourNode.getParent()).findChildIndex(node.id);

    if (node.parent === nextParentNode.id) {
      const numberOfMoves = nextTreeIndex - prevTreeIndex;
      ourParent.moveChild(currentIndex, currentIndex + numberOfMoves)
      update('render', new Date().getTime());
    } else {
      nodes.handleNode(nextParentNode.id)({ nodeID: node.id, pushToFront: true })
      let next = walk({
        treeData,
        getNodeKey: this.getNodeKey,
        ignoreCollapsed: false,
        callback: (walked) => {
          if (walked.node.id === nextParentNode.id) {
            const numberOfMoves = nextTreeIndex - walked.treeIndex - 1;
            ourNextParentNode.moveChild(0, numberOfMoves);
            update('render', new Date().getTime());
          }
        }
      });
    }
  }

  onDragStateChanged =  ({ isDragging, draggedNode }) => {
    const { store: { page: { update } } } = this.props;
    update('editing', draggedNode ? draggedNode.id : '');
  }

  canNodeHaveChildren = (node) => {
    return ['Grid', 'div', 'Paper', 'Section', 'Div'].indexOf(node.title) !== -1;
  }

  rowClick = (rowInfo) => (e) => {
    const { store: { page: { update } } } = this.props;
    update('editing', rowInfo.node.id);
  }

  mouseLeave = () => {
    const { store: { page: { update } } } = this.props;
    update('editing', '');
  }

  mouseEnter = (node) => (e) => {
    const { store: { page: { update } } } = this.props;
    update('editing', node.id);
  }

  canDrop = ({ node, prevPath, prevParent, nextPath, nextParent, nextTreeIndex }) => {
    if (nextTreeIndex === 0) return false;
    return true;
  }

  render() {
    const { classes, router, store: { page: { nodes, render } } } = this.props;
    const tree = [nodes.treeView2()];
    return (
      <div className={classes.root}>
        {render >= 0 && (null)}
        <SortableTreeWithoutDndContext
          treeData={tree}
          onChange={this.onChange(tree)}
          getNodeKey={this.getNodeKey}
          onVisibilityToggle={this.onVisibilityToggle}
          rowHeight={23}
          dndType={'Tree'}
          scaffoldBlockPxWidth={20}
          onMoveNode={this.onMoveNode}
          onDragStateChanged={this.onDragStateChanged}
          canNodeHaveChildren={this.canNodeHaveChildren}
          canDrop={this.canDrop}
          generateNodeProps={rowInfo => ({
            onMouseEnter: this.mouseEnter(rowInfo.node),
            onMouseLeave: this.mouseLeave,
            onClick: this.rowClick(rowInfo)
          })}
        />
      </div>
    );
  }
}

Tree.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Tree));
