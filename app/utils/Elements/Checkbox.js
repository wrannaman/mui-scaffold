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
import Checkbox from '@material-ui/core/Checkbox';

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

  render() {
    const { classes, id, store: { page: { editing } } } = this.props;
    const isEditing = editing === this.props.id;
    const ele = (
      <div onClick={this.onClick} style={{ ...this.props.style, border: editing === id && this.props.__allowEdit ? '1px solid #5130a4' : 'none' }}>
        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">{this.props.name}</FormLabel>
          <FormGroup
            style={{ ...this.props.style }}
          >
            {this.props.items.map((item) => (
              <FormControlLabel
                control={
                  <Checkbox value={item.value} color={this.props.color} />
                }
                label={item.label}
              />
            ))}
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
          name="Checkbox"
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
