import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { FormHelperText, FormControl, InputLabel, Select, MenuItem, Divider, TextField, FormLabel, FormControlLabel, RadioGroup, Radio, Paper, Switch, FormGroup, Button } from '@material-ui/core';
import Styler from './Styler';
import SmallRadioGroup from './SmallRadioGroup';
import _ from 'lodash';

import SearchIcons from '../Icons/SearchIcons';

const styles = theme => ({
  root: {
  },
  dense: {
    marginLeft: 10
  },
  textField: {
    width: 250,
  },
  formControl: {
    width: 240,
    marginTop: 10,
  }
});


const radioProps = [
  // { name: 'Align', littleName: 'align', values: ['inherit', 'left', 'center', 'right', 'justify'] },
  { name: 'Color', littleName: 'color', values: ['default', 'inherit', 'primary', 'secondary'] },
  { name: 'Size', littleName: 'size', values: ['small', 'medium', 'large'] },
  // { name: 'Variant', littleName: 'variant', values: ['text', 'outlined', 'contained'] },
];

const boolProps = [
  // {name: 'Full Width', littleName: 'fullWidth'},
  {name: 'Read Only', littleName: 'readOnly'},
  {name: 'Custom Icon', littleName: 'isIcon'},
  // {name: 'Container', littleName: 'container'},
  // {name: 'No Wrap', littleName: 'noWrap'},
];

@inject('store')
@observer
class ButtonEditor extends React.Component {

  state = {
    openDialog: false,
  }

  toggleDialog = (val) => (e) => {
    this.setState({ iconType: val, openDialog: !this.state.openDialog });
  }

  handleChange = (propName, checked = false) => (e) => {
    const { page: { update } } = this.props.store;
    const { node } = this.props;
    let v = e.target.value;
    if (v && !isNaN(Number(v))) v = Number(v);
    if (checked) {
      v = e.target.checked;
    }
    if (propName === 'formSubmit' && v) {
      node.updateProps('link', '');
    }
    node.updateProps(propName, v);
    update('render', new Date().getTime());
  }

  // for some reason the search icon components wont take props correctly
  handleIconSelected = (icon) => (e) => {
    this.handleChange(this.state.iconType)({ target: { value: icon.key }});
    this.toggleDialog()();
  }

  render() {
    const { node, classes, router: { pathname } } = this.props;
    const { data: { datas }, page: { update, render, id, type, boundDataModel }, project: { project: { userRoles, pages, page } }, repeatable: { repeatables, workingIndex } } = this.props.store;
    const userRoleNames = userRoles ? Object.keys(userRoles) : [];
    const repeatable = repeatables[workingIndex]
    const onRepeatable = pathname.indexOf('component') !== -1 && repeatable && repeatable.type === 'repeatable'
    const linkPages = pages.filter(p => {
      if (p.type === 'detail' && type !== 'detail' && pathname.indexOf('component') === -1) return false;
      return p.id !== id
    });
    let model = null;
    const numberFields = [];
    if (type === 'detail') model = datas.filter(d => d._id === boundDataModel);
    if (onRepeatable) model = datas.filter(d => d._id === repeatable.boundDataModelID);
    if (model && model.length === 1) model = model[0];
    if (model && model.model) {
      Object.keys(model.model).forEach(field => {
        if (model.model[field].type === 'number' && field !== 'id') numberFields.push(field);
      });
    }
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
          label="Name"
          className={classes.textField}
          value={node.props.name}
          onChange={this.handleChange('name')}
          margin="normal"
        />
        <TextField
          label="Max Value"
          className={classes.textField}
          value={node.props.max}
          type="number"
          onChange={this.handleChange('max')}
          margin="normal"
        />
        {false && (
          <TextField
            label="Precision"
            className={classes.textField}
            value={node.props.precision}
            type="number"
            onChange={this.handleChange('precision')}
            margin="normal"
          />
        )}
        <TextField
          label="Empy Label Text"
          className={classes.textField}
          value={node.props.emptyText}
          onChange={this.handleChange('emptyText')}
          margin="normal"
        />
        {node.props.isIcon && (
          <div>
            <Button onClick={this.toggleDialog('icon')}>
              Select Filled Icon
            </Button>
            <SearchIcons
              openDialog={this.state.openDialog}
              onClose={this.toggleDialog()}
              type="icon"
              handleClickOpen={this.handleIconSelected}
            />
          </div>
        )}
        {node.props.isIcon && (
          <div>
            <Button onClick={this.toggleDialog('emptyIcon')}>
              Select Empty Icon
            </Button>
            <SearchIcons
              openDialog={this.state.openDialog}
              onClose={this.toggleDialog()}
              type="emptyIcon"
              handleClickOpen={this.handleIconSelected}
            />
          </div>
        )}
      </div>
    );
  }
}

ButtonEditor.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(ButtonEditor));
