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

import DataFieldsAsSelect from '../Data/DataFieldsAsSelect';

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


// need pk (will have it)
// need sku / product? ()
// need success url and cancel url  (domian name) // will have it

const radioProps = [
  { name: 'Align', littleName: 'align', values: ['inherit', 'left', 'center', 'right', 'justify'] },
  { name: 'Color', littleName: 'color', values: ['default', 'inherit', 'primary', 'secondary'] },
  { name: 'Size', littleName: 'size', values: ['small', 'medium', 'large'] },
  { name: 'Variant', littleName: 'variant', values: ['text', 'outlined', 'contained'] },
];

const boolProps = [
  {name: 'Full Width', littleName: 'fullWidth'},
  // {name: 'Submit Form', littleName: 'formSubmit'},
  {name: 'Icon Button', littleName: 'isIcon'},
  // {name: 'Container', littleName: 'container'},
  // {name: 'No Wrap', littleName: 'noWrap'},
];

@inject('store')
@observer
class ButtonEditor extends React.Component {

  state = {
    openDialog: false,
  }

  toggleDialog = (e) => {
    this.setState({ openDialog: !this.state.openDialog });
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

  handleIconSelected = (icon) => (e) => {
    this.handleChange('icon')({ target: { value: icon.key }});
    this.toggleDialog();
  }

  showLink = () => {
    return true;
    const { repeatable: { repeatables, workingIndex } } = this.props.store;
    if (repeatables.length > 0 && workingIndex !== -1 && repeatables[workingIndex] && repeatables[workingIndex].type === 'repeatable') return true;
    return false;
  }

  onFieldChange = (propName, isModel = false) => (field) => {
    const { page: { update } } = this.props.store;
    const { node } = this.props;
    if (isModel) {
      node.updateProps('boundDataModelID', field && field.id ? field.id : field);
      node.updateProps('boundDataModel', field && field.name ? field.name : field);

    } else {
      node.updateProps(propName, field);

    }
    update('render', new Date().getTime());
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
          label="Text"
          className={classes.textField}
          value={node.props.text}
          onChange={this.handleChange('text')}
          margin="normal"
          multiline
        />
        <Divider />
        <DataFieldsAsSelect
          onFieldChange={this.onFieldChange('stripeProductID')}
          model={repeatable.boundDataModelID || boundDataModel}
          value={node.props.stripeProductID}
          title={'Stripe ProductID Field'}
        />
        {node.props.isIcon && (
          <div>
            <Button onClick={this.toggleDialog}>
              Select Icon
            </Button>
            <SearchIcons
              openDialog={this.state.openDialog}
              onClose={this.toggleDialog}
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
