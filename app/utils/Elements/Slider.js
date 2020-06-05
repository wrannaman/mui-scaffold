import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import Typography from '@material-ui/core/FormLabel';
import Slider from '@material-ui/core/Slider';

import DragSource from '../../components/Shared/DragSource';

const styles = theme => ({
  root: {
  },
});



@inject('store')
@observer
class WrappedCheckbox extends React.PureComponent {
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

  // shouldComponentUpdate = (nextProps) => {
  //   if (JSON.stringify(this.props) === JSON.stringify(nextProps)) {
  //     return false;
  //   }
  //   return true;
  // }

  render() {
    const { classes, id, store: { page: { editing } } } = this.props;
    const isEditing = editing === this.props.id;
    const ele = (
      <div onClick={this.onClick} style={{ border: this.props.__allowEdit && editing === id ? '1px solid #5130a4' : 'none' }}>
        <Typography id={this.props.id} gutterBottom>
          {this.props.name}
        </Typography>
        <Slider
          defaultValue={this.props.defaultValue}
          aria-labelledby={this.props.id}
          valueLabelDisplay={this.props.valueLabelDisplay}
          step={this.props.step}
          marks={this.props.marks}
          min={this.props.min}
          max={this.props.max}
          name={this.props.name}
          orientation={this.props.orientation}
          style={{ ...this.props.style }}
        />
      </div>
    );
    if (!this.props.__allowEdit) return ele;
    if (isEditing) {
      return (
        <DragSource
          nodeID={this.props.id}
          name="Slider"
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

WrappedCheckbox.defaultProps = {
  onClick: () => {
  },
  items: [],
}

WrappedCheckbox.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  items: PropTypes.array,
};

export default withRouter(withStyles(styles)(WrappedCheckbox));
