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
  { name: 'Accepted Files', littleName: 'acceptedFiles', values: [
    "image",
    "video",
    "misc",
    "image, video",
    "video, misc",
    "image, video, misc",
    "image, misc",
  ] },
  // { name: 'Variant', littleName: 'variant', values: ['outlined', 'filled', 'standard'] },
  // { name: 'Margin', littleName: 'margin', values: ['none', 'dense', 'normal'] },
  // { name: 'Medium', littleName: 'md', values: [0, 2, 4, 6, 8, 10, 12] },
  // { name: 'Small', littleName: 'xs', values: [0, 2, 4, 6, 8, 10, 12] },
];

const boolProps = [
  // {name: 'Show Previews', littleName: 'showPreviews'},
  // {name: 'Show Previews In Dropzone', littleName: 'showPreviewsInDropzone'},
  // {name: 'Show File Names', littleName: 'showFileNames'},
  // {name: 'Show Alerts', littleName: 'showAlerts'},
  // {name: 'Use Chips For Preview', littleName: 'useChipsForPreview'},
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
    setTimeout(() => {
      update('render', new Date().getTime());
    }, 1000);
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
          label="Message"
          className={classes.textField}
          value={node.props.message}
          onChange={this.handleChange('message')}
          margin="normal"
        />
        <Divider />
        <TextField
          label="Max File Size"
          className={classes.textField}
          value={node.props.maxFileSize}
          onChange={this.handleChange('maxFileSize')}
          type="number"
          margin="normal"
        />
        <Divider />
        <TextField
          label="Files Limit"
          className={classes.textField}
          value={node.props.filesLimit}
          onChange={this.handleChange('filesLimit')}
          helperText="Max Files Allowed To Upload"
          type="number"
          margin="normal"
        />
        <Divider />
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
