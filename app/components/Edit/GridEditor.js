import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { TextField, FormControlLabel, Switch, FormGroup } from '@material-ui/core';
import Styler from './Styler';


import SmallRadioGroup from './SmallRadioGroup';

const styles = theme => ({
  root: {
  }
});


const radioProps = [
  // { name: 'Spacing', littleName: 'spacing', values: [0, 2, 4, 6, 8, 10] },
  { name: 'Large View', littleName: 'lg', values: [0, 2, 4, 6, 8, 10, 12] },
  // { name: 'Small', littleName: 'sm', values: [0, 2, 4, 6, 8, 10, 12] },
  { name: 'Medium View', littleName: 'md', values: [0, 2, 4, 6, 8, 10, 12] },
  { name: 'Small View', littleName: 'xs', values: [0, 2, 4, 6, 8, 10, 12] },
];

const boolProps = [
  {name: 'Item', littleName: 'item'},
  {name: 'Container', littleName: 'container'},
  // {name: 'Form', littleName: 'form'},
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
    if (propName === 'item') {
      node.updateProps('container', !v);
    }
    if (propName === 'container') {
      node.updateProps('item', !v);
    }
    node.updateProps(propName, v);
    update('render', new Date().getTime());
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
        <TextField
          label="Link"
          className={classes.textField}
          value={node.props.link}
          onChange={this.handleChange('link')}
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
