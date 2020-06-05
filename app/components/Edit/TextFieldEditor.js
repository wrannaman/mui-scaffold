import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { Divider, IconButton, TextField, Fab, TableRow, TableHead, TableCell, TableBody, Table, FormLabel, FormControlLabel, RadioGroup, Radio, Switch, FormGroup } from '@material-ui/core';
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
  { name: 'Type', littleName: 'type', values: [
    "text",
    "search",
    "email",
    "url",
    "tel",
    "number",
    "range",
    "date",
    "month",
    "week",
    "time",
    "datetime",
    "datetime-local",
    "color"
  ] },
  { name: 'Variant', littleName: 'variant', values: ['outlined', 'filled', 'standard'] },
  { name: 'Margin', littleName: 'margin', values: ['none', 'dense', 'normal'] },
  // { name: 'Medium', littleName: 'md', values: [0, 2, 4, 6, 8, 10, 12] },
  // { name: 'Small', littleName: 'xs', values: [0, 2, 4, 6, 8, 10, 12] },
];

const boolProps = [
  {name: 'Full Width', littleName: 'fullWidth'},
  {name: 'Multiline', littleName: 'multiline'},
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
          label="Name"
          className={classes.textField}
          value={node.props.name}
          onChange={this.handleChange('name')}
          margin="normal"
        />
        <Divider />

        <TextField
          label="Label"
          className={classes.textField}
          value={node.props.label}
          onChange={this.handleChange('label')}
          margin="normal"
        />
        <Divider />

        <TextField
          label="Helper Text"
          className={classes.textField}
          value={node.props.helperText}
          onChange={this.handleChange('helperText')}
          margin="normal"
        />
        <Divider />

        <TextField
          label="Placeholder Text"
          className={classes.textField}
          value={node.props.placeholder}
          onChange={this.handleChange('placeholder')}
          margin="normal"
        />
        {node.props.multiline && (<Divider />)}
        {node.props.multiline && (
          <TextField
            label="Multiline Rows"
            className={classes.textField}
            value={node.props.rows}
            onChange={this.handleChange('rows')}
            margin="normal"
          />
        )}
        {node.props.multiline && (<Divider />)}
        {node.props.multiline && (
          <TextField
            label="Multiline Max Rows"
            className={classes.textField}
            value={node.props.rowsMax}
            onChange={this.handleChange('rowsMax')}
            margin="normal"
          />
        )}
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
