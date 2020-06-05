import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import TextField from '@material-ui/core/TextField';
import DragSource from '../../components/Shared/DragSource';

const styles = theme => ({
  root: {
  },
});

@inject('store')
@observer
class WrappedTextField extends React.PureComponent {
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
        <TextField
          style={{ ...this.props.style }}
          fullWidth={this.props.fullWidth}
          helperText={this.props.helperText}
          label={this.props.label}
          margin={this.props.margin}
          multiline={this.props.multiline}
          name={this.props.name}
          placeholder={this.props.placeholder}
          rows={this.props.rows}
          rowsMax={this.props.rowsMax}
          type={this.props.type}
          variant={this.props.variant}
        />
      </div>
    );
    if (!this.props.__allowEdit) return ele;
    if (isEditing) {
      return (
        <DragSource
          nodeID={this.props.id}
          name="Text Field"
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

WrappedTextField.defaultProps = {
  onClick: () => {
  },
}

WrappedTextField.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(WrappedTextField));
