import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import {  Divider, TextField, FormLabel, FormControlLabel, RadioGroup, Radio, Paper, Switch, FormGroup, Button } from '@material-ui/core';

import Styler from './Styler';

const styles = theme => ({
  root: {
  },
});

const boolProps = [
  {name: 'Show All', littleName: 'showAll'},
  // {name: 'Container', littleName: 'container'},
  // {name: 'No Wrap', littleName: 'noWrap'},
];

@inject('store')
@observer
class GridEditor extends React.Component {

  handleChange = (propName, checked = false) => (e) => {
    const { page: { update } } = this.props.store;
    const { node } = this.props;
    let v = e.target.value;
    if (v && !isNaN(Number(v))) v = Number(v);
    if (checked) {
      v = e.target.checked;
    }
    node.updateProps(propName, v);
    update('render', new Date().getTime());
  }

  render() {
    const { node, classes } = this.props;
    const { page: { update, render } } = this.props.store;

    return (
      <div>
      {boolProps.map((item) => {
        if (item.littleName === 'showAll' &&
          node.props.boundValue &&
          node.props.boundValue.type &&
          (node.props.boundValue.type !== 'array' &&
          node.props.boundValue.modelRelationType !== 'hasMany')) {
            return null;
        }
        return (
          <div key={item.name}>
            <FormGroup row>
               <FormControlLabel
                 control={
                   <Switch
                     checked={node.props[item.littleName]}
                     onChange={this.handleChange(item.littleName, true)}
                     value={item.littleName}
                   />
                 }
                 label={item.name}
               />
           </FormGroup>
          </div>
        )
      })}
        <Divider />
        <TextField
          label="Image Source"
          className={classes.textField}
          value={node.props.src}
          onChange={this.handleChange('src')}
          margin="normal"
        />
        <Styler node={node} />
      </div>
    );
  }
}

GridEditor.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(GridEditor));
