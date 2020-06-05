import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { TreeView, TreeItem } from '@material-ui/lab';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const styles = theme => ({
  root: {
  },
});

@inject('store')
@observer
class Tree extends React.Component {
  state = {};

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

  render() {
    const { classes, router, store: { page: { nodes, render } } } = this.props;
    return (
      <div>
        {render > 0 && (null)}
        <TreeView
          className={classes.root}
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          {this.renderTree(nodes.treeView())}
        </TreeView>
      </div>
    );
  }
}

Tree.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Tree));
