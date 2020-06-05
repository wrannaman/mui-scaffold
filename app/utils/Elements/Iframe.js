import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import DragSource from '../../components/Shared/DragSource';

const styles = theme => ({
  root: {
  },
});

@inject('store')
@observer
class Iframe extends React.PureComponent {
  state = {};

  onClick = (e) => {
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
    const { classes, id, store: { page: { editing } } } = this.props;
    const isEditing = editing === this.props.id;
    const ele = (
      <div onClick={this.onClick} style={{ border: this.props.__allowEdit && editing === id ? '1px solid #5130a4' : 'none' }}>
        <iframe
          style={{ ...this.props.style }}
          width={this.props.width}
          height={this.props.height}
          src={this.props.src}
          title={this.props.name || "iframe"}
          allowFullScreen={this.props.allowFullScreen}
          allowPaymentRequest={this.props.allowPaymentRequest}
        />
      </div>
    );
    if (!this.props.__allowEdit) return ele;
    if (isEditing) {
      return (
        <DragSource
          nodeID={this.props.id}
          name="Iframe"
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

Iframe.defaultProps = {
  onClick: () => {
  },
}

Iframe.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Iframe));
