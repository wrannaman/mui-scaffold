import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { Divider, TextField, IconButton, Fab, TableRow, TableHead, TableCell, TableBody, Table, FormLabel, FormControlLabel, RadioGroup, Radio, Switch, FormGroup } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

import Styler from './Styler';
import SmallRadioGroup from './SmallRadioGroup';

const styles = theme => ({
  root: {
  },
  dense: {
    marginLeft: 10
  }
});


const radioProps = [
  { name: 'Orientation', littleName: 'orientation', values: ["horizontal", "vertical"] },
  { name: 'Value Label Dispay', littleName: 'valueLabelDisplay', values: ['on', 'auto', 'off'] },
  // { name: 'Small', littleName: 'sm', values: [0, 2, 4, 6, 8, 10, 12] },
  // { name: 'Medium', littleName: 'md', values: [0, 2, 4, 6, 8, 10, 12] },
  // { name: 'Small', littleName: 'xs', values: [0, 2, 4, 6, 8, 10, 12] },
];

const boolProps = [
  {name: 'Show Marks', littleName: 'marks'},
  // {name: 'Container', littleName: 'container'},
];

@inject('store')
@observer
class CheckboxEditor extends React.Component {

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

  changeItem = (name, item, index) => (e) => {
    const { page: { update } } = this.props.store;
    const { node } = this.props;
    const { items } = node.props;
    const clone = Array.from(items);
    clone[index][name] = e.target.value;
    node.updateProps('items', clone);
    update('render', new Date().getTime());
  }

  removeItem = (index) => (e) => {
    const { page: { update } } = this.props.store;
    const { node } = this.props;
    const { items } = node.props;
    const clone = Array.from(items);
    clone.splice(index, 1);
    node.updateProps('items', clone);
    update('render', new Date().getTime());
  }

  addItem = () => {
    const { page: { update } } = this.props.store;
    const { node } = this.props;
    const { items } = node.props;
    const clone = Array.from(items);
    clone.push({ value: "new", label: "new" });
    node.updateProps('items', clone);
    update('render', new Date().getTime());
  }

  render() {
    const { node, classes } = this.props;
    const { page: { update, render }, repeatable: { repeatables, workingIndex } } = this.props.store;
    const { items, style } = node.props;

    const rep = repeatables[workingIndex];
    if (rep && rep.type === 'form' && boolProps.filter(b => b.littleName === 'required').length === 0) {
      boolProps.push({ name: 'Required', littleName: 'required' })
    }
    
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
        <TextField
          className={classes.textField}
          value={node.props.name}
          label={"Name"}
          onChange={this.handleChange('name')}
          margin="normal"
        />
        <Divider />
        <TextField
          label="Default Value"
          className={classes.textField}
          value={node.props.defaultValue}
          onChange={this.handleChange('defaultValue')}
          margin="normal"
          type="number"
        />
        <Divider />
        <TextField
          type="number"
          label="Minimum"
          className={classes.textField}
          value={node.props.min}
          onChange={this.handleChange('min')}
          margin="normal"
        />
        <Divider />
        <TextField
          label="Maximum"
          className={classes.textField}
          value={node.props.max}
          onChange={this.handleChange('max')}
          margin="normal"
        />
        <Styler node={node} />
      </div>
    );
  }
}

CheckboxEditor.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(CheckboxEditor));
