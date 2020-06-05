import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Switch from '@material-ui/core/Switch';

import DragSource from '../../components/Shared/DragSource';

const styles = theme => ({
  root: {
  },
});

// shouldComponentUpdate = (nextProps) => {
//   if (JSON.stringify(this.props) === JSON.stringify(nextProps)) {
//      return false;
//   }
//   return true;
// }

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

  hasBoundData = () => {
    const { boundValue, __data } = this.props;
    // return __data ? true : false;
    return boundValue &&
    boundValue.field &&
    boundValue.model &&
    __data &&
    typeof __data[boundValue.field] !== 'undefined';
  }

  render() {
    const { classes, id, boundValue, __data, store: { page: { editing } } } = this.props;
    const isEditing = editing === this.props.id;

    let switchEle = (
      <Switch
        color={this.props.color}
        size={this.props.size}
      />
    )

    if (this.hasBoundData()) {
      switchEle = (
        <Switch
          color={this.props.color}
          size={this.props.size}
          checked={__data[boundValue.field]}
        />
      )
    }

    const ele = (
      <div onClick={this.onClick} style={{ border: editing === id && this.props.__allowEdit ? '1px solid #5130a4' : 'none' }}>
        <FormControl component="fieldset" className={classes.formControl} style={{ ...this.props.style }}>
          {false && (<FormLabel component="legend">{this.props.name}</FormLabel>)}
          <FormGroup
            style={{ ...this.props.style }}
          >
          <FormControlLabel
            control={switchEle}
            label={this.props.name}
          />
          </FormGroup>
          {false && (<FormHelperText>Be careful</FormHelperText>)}
        </FormControl>
      </div>
    );
    if (!this.props.__allowEdit) return ele;

    if (isEditing) {
      return (
        <DragSource
          nodeID={this.props.id}
          name="Switch"
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
