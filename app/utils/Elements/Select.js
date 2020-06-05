import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

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

  render() {
    const { classes, id, store: { page: { editing }, data: { datas } } } = this.props;
    const isEditing = editing === this.props.id;

    let inner = this.props.items.map((item) => (
      <MenuItem value={item.value}>{item.label}</MenuItem>
    ));
    if (this.props.boundValue && this.props.boundValue.type === 'enum') {
      let data = null;
      datas.forEach((d) => {
        if (d.id === this.props.boundValue.id) {
          data = d;
        }
      });
      if (data && data.model && data.model[this.props.boundValue.field] && data.model[this.props.boundValue.field].enum) {
        inner = data.model[this.props.boundValue.field].enum.map((item) => (
          <MenuItem value={item}>{item}</MenuItem>
        ));
      }

    }
     const ele = (
      <div onClick={this.onClick} style={{ border: this.props.__allowEdit && editing === id ? '1px solid #5130a4' : 'none' }}>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor={this.props.name} >{this.props.name}</InputLabel>
          <Select
            inputProps={{
              name: this.props.name,
            }}
            style={{ ...this.props.style }}
          >
          {inner}
          </Select>
        </FormControl>
      </div>
    );
    if (!this.props.__allowEdit) return ele;

    if (isEditing) {
      return (
        <DragSource
          nodeID={this.props.id}
          name="Select"
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
