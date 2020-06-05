import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';

import Grid from '@material-ui/core/Grid';

import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';

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
      <div onClick={this.onClick} style={{ border: editing === id && this.props.__allowEdit ? '1px solid #5130a4' : 'none' }}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
         <Grid container justify="space-around">
           <KeyboardDatePicker
             variant="inline"
             format={this.props.format}
             margin="normal"
             label={this.props.dateLabel}
             style={{ ...this.props.style }}
             onChange={() => {}}
             KeyboardButtonProps={{
               'aria-label': 'change date',
             }}
             style={{ ...this.props.style }}
           />
           {this.props.showTime && (
             <KeyboardTimePicker
               margin="normal"
               label={this.props.timeLabel}
               style={this.props.style}
               onChange={() => {}}
               KeyboardButtonProps={{
                 'aria-label': 'change time',
               }}
               style={{ ...this.props.style }}
             />
           )}
         </Grid>
       </MuiPickersUtilsProvider>
      </div>
    );
    if (!this.props.__allowEdit) return ele;
    if (isEditing) {
      return (
        <DragSource
          nodeID={this.props.id}
          name="Date / Time"
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
