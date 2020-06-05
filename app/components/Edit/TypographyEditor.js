import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { Divider, TextField, FormLabel, FormControlLabel, RadioGroup, Radio, Paper, Switch, FormGroup, Button } from '@material-ui/core';
import Styler from './Styler';
import SmallRadioGroup from './SmallRadioGroup';

import _ from 'lodash';

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
  { name: 'Color', littleName: 'color', values: ['initial', 'inherit', 'primary', 'secondary', 'textPrimary', 'textSecondary', 'error'] },
  { name: 'Variant', littleName: 'variant', values: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2', 'caption', 'button', 'overline', 'srOnly', 'inherit'] },
];

const boolProps = [
  {name: 'GutterBottom', littleName: 'gutterBottom'},
  // {name: 'Container', littleName: 'container'},
  {name: 'No Wrap', littleName: 'noWrap'},
];

@inject('store')
@observer
class TypographyEditor extends React.Component {

  handleChange = (propName, checked = false) => (e, b) => {
    const { page: { update } } = this.props.store;
    const { node } = this.props;
    let v = e.target.value;
    if (v && !isNaN(Number(v))) v = Number(v);
    if (checked) {
      v = e.target.checked;
    }
    node.updateProps(propName, v);
    update('render', new Date().getTime())
  }

  render() {
    const { node, classes } = this.props;
    const { page: { update, render } } = this.props.store;
    return (
      <div>
        {render && (null)}
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
          value={node.props.text}
          onChange={this.handleChange('text')}
          margin="normal"
          multiline
        />
        <Divider />
        <TextField
          label="Max Length"
          className={classes.textField}
          value={node.props.maxLength}
          onChange={this.handleChange('maxLength')}
          margin="normal"
          type="number"
        />
      </div>
    );
  }
}

TypographyEditor.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(TypographyEditor));
