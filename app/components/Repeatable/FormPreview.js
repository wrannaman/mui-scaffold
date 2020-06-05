import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';

import { Typography } from '@material-ui/core';
import DragSource from '../Shared/DragSource';

const styles = theme => ({
  root: {
  },
});

@inject('store')
@observer
class FormPreview extends React.Component {

  componentDidMount() {
    const { repeatable } = this.props;
    const { repeatable: { setPreviewNodes } } = this.props.store;
    setPreviewNodes(repeatable);
  }

  transformDataItems = (dataItems) => {
    const d = [];
    dataItems.forEach(item => {
      d.push({ ...item, ...item.item });
    });
    return d;
  }

  componentWillUpdate(nextProps) {
    if (nextProps.isNodeRender) return;
    const { page: { nodes }, repeatable: { setPreviewNodes } } = this.props.store;
    if (JSON.stringify(nextProps.store.page.nodes.toJSON()) === this.prev) return;
    this.prev = JSON.stringify(nextProps.store.page.nodes.toJSON());
    setPreviewNodes({ ...nextProps.repeatable, node: nextProps.store.page.nodes.toJSON() });
  }

  onChangePage = (e, page) => {
    this.fetchData(page);
  }

  onChangeRowsPerPage = (e) => {
    this.fetchData(this.state.page, e.target.value);
  }

  edit = (e) => {
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
    const { showTitle, showStyler, repeatable } = this.props;
    const { page: { editing, render }, repeatable: { previewNodes } } = this.props.store;

    const isEditing = editing === this.props.id;
    const editingStyles = { border: '1px solid #5130a4' };

    const ele = (
      <div onClick={this.edit} style={isEditing ? editingStyles : {}}>
        {showTitle && (
          <div>
            <Typography> Form Preview (will not submit data)</Typography>
          </div>
        )}
        <form style={Object.assign({}, repeatable.styles ? repeatable.styles : {})}>
          {render > 0 &&
            previewNodes &&
            repeatable &&
            repeatable._id &&
            previewNodes[repeatable._id] &&
            previewNodes[repeatable._id].nodes.render(null, false, this.props.id)}
        </form>
      </div>
    );
    if (isEditing) {
      return (
        <div>
        <DragSource
          nodeID={this.props.id}
          name="Form"
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

FormPreview.defaultProps = {
  showStyler: true,
  showTitle: true,
};

FormPreview.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  repeatable: PropTypes.object.isRequired,
  nodes: PropTypes.object.isRequired,
  showStyler: PropTypes.bool,
  showTitle: PropTypes.string,
};

export default withRouter(withStyles(styles)(FormPreview));
