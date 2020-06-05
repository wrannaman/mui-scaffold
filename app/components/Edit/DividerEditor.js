import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { Divider, TextField, FormLabel, FormControlLabel, RadioGroup, Radio, Paper, Switch, FormGroup, Button } from '@material-ui/core';
import Styler from './Styler';
import SmallRadioGroup from './SmallRadioGroup';

const styles = theme => ({
  root: {
  },
  dense: {
    marginLeft: 10
  },
  textField: {
    width: 250,
  }
});


const radioProps = [
  { name: 'Align', littleName: 'align', values: ['inherit', 'left', 'center', 'right', 'justify'] },
  { name: 'Color', littleName: 'color', values: ['default', 'inherit', 'primary', 'secondary'] },
  { name: 'Size', littleName: 'size', values: ['small', 'medium', 'large'] },
  { name: 'Variant', littleName: 'variant', values: ['text', 'outlined', 'contained'] },
  { name: 'Orientation', littleName: 'orientation', values: ['vertical', 'horizontal', 'contained'] },
  { name: 'Variant', littleName: 'variant', values: ['fullWidth', 'inset', 'middle'] },
];

const boolProps = [
  {name: 'Absolute', littleName: 'absolute'},
  {name: 'Light', littleName: 'light'},
  // {name: 'Container', littleName: 'container'},
  // {name: 'No Wrap', littleName: 'noWrap'},
];

@inject('store')
@observer
class ButtonEditor extends React.Component {

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
        {boolProps.map((item) => (
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
        ))}
        {radioProps.map((item) => (
          <SmallRadioGroup
            item={item}
            node={node}
            onChange={this.handleChange(item.littleName)}
          />
        ))}
        <Divider />
        <Styler node={node} />
        <Divider />
        <TextField
          label="Text"
          className={classes.textField}
          value={node.text}
          onChange={this.handleChange('text')}
          margin="normal"
          multiline
        />
      </div>
    );
  }
}

ButtonEditor.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(ButtonEditor));
