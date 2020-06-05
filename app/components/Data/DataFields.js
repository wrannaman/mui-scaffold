import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import uniq from 'lodash/uniq';

import { capitalize } from 'lodash';
import { Chip, Select, Typography, Button, TextField, Paper } from '@material-ui/core';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import DeleteIcon from '@material-ui/icons/Delete';

import { updateData, fetchDatas } from '../../src/apiCalls/data';

const styles = theme => ({
  root: {
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 5,
    marginBottom: 5,
  },
  formControl: {
    width: 169
  },
  textField: {
    width: 169,
  },
  paper: {
    background: 'rgba(0, 0, 0, 0.05)'
  }
});

@inject('store')
@observer
class DataFields extends React.Component {
  state = {};

  fetchDatas = async () => {
    const { query: { projectID } } = this.props.router;
    const { data: { updateData } } = this.props.store;
    const res = await fetchDatas({ projectID, limit: 25 });
    if (res.success) {
      updateData('datas', res.datas.docs);
    }
  }

  handleChange = (name) => (e) => {
    const { data: { update }, snack: { snacky } } = this.props.store;
    if (name === 'newMaxLength' && e.target.value > 255) e.target.value = 255;
    else if (name === 'newMinLength' && e.target.value < 0) e.target.value = 0;
    else if (name === 'newKey') e.target.value = e.target.value.replace(/[^A-Za-z]/g, '');
    else if (name === 'newKey' && e.target.value.toLowerCase() === 'id') return snacky('Cannot have a field named "id".', 'error', 5000);
    else if (name === 'newUnique') {
      if (e.target.value) update('newAllowNull', false);
      else update('newAllowNull', true);
    }
    update(name, e.target.value);
  }

  submit = async (e) => {
    const { snack: { snacky }, data: { datas, data, newRelation, enumArray, newAllowNull, newKey, newValue, newDefaultValue, newMinLength, newUnique, newMaxLength, update, setFake } } = this.props.store;
    e.preventDefault();
    const clone = toJS(data);
    if (!clone.model) clone.model = {};
    if (newValue === 'relation') {
      clone.model[newKey] = {
        type: newValue,
        model: newRelation.model,
        modelName: datas[newRelation.index].name,
        modelRelationType: newRelation.type,
        field: newRelation.field,
        deletable: true,
        newAllowNull,
      };
    } else if (newValue === 'enum') {
      if (enumArray.length === 0) return snacky('Please add some values', 'error');
      clone.model[newKey] = {
        type: newValue,
        field: newKey,
        default: newDefaultValue,
        min: newMinLength,
        max: newMaxLength,
        deletable: true,
        unique: newUnique,
        allowNull: newAllowNull,
        enum: enumArray,
      };
    } else {
      clone.model[newKey] = {
        type: newValue,
        field: newKey,
        default: newDefaultValue,
        min: newMinLength,
        max: newMaxLength,
        deletable: true,
        unique: newUnique,
        allowNull: newAllowNull,
      };
    }

    const updated = await updateData({ ...clone });
    if (updated.success) {
      update('data', updated.data);
      setFake(updated.data.model);
      snacky('Saved');
    } else {
      snacky('Error saving.', 'error');
    }
    this.reset();
    this.fetchDatas();
  }

  delete = (key, index) => async () => {
    const { data: { data, update, setFake }, snack: { snacky } } = this.props.store;
    const clone = toJS(data);
    if (!clone.model) clone.model = {};
    delete clone.model[key];
    const updated = await updateData({ ...clone });
    if (updated.success) {
      update('data', updated.data);
      setFake(updated.data.model);
      snacky('Deleted.');
    } else {
      snacky('Error Deleting.', 'error');
    }
    this.reset();
    this.fetchDatas();
  }

  reset = () => {
    const { data: { update } } = this.props.store;
    update('newKey', '');
    update('newValue', 'text');
    update('newMinLength', 0);
    update('newMaxLength', 255);
    update('newDefaultValue', '');
    update('enumVal', '');
    update('enumArray', []);
    update('newAllowNull', true);
    update('newUnique', false);
    update('newRelation', { index: -1, model: null, field: '', type: '' });
  }

  handleRelationChange = (name) => (e) => {
    const { data: { datas, newRelation, update } } = this.props.store;
    const clone = Object.assign({}, toJS(newRelation));
    clone[name] = e.target.value;
    if (name === 'model') {
      for (let i = 0; i < datas.length; i++) {
        if (datas[i]._id === e.target.value) {
          clone.index = i;
          break;
        }
      }
    }
    update('newRelation', clone);
  }

  handleModel = (m) => {
    let enums = ``;
    if (m.virtual) return `Virtual field`;
    if (m.modelName) return `${capitalize(m.type)}: ${`(${m.modelRelationType})`} ${m.modelName}.${m.field} `;
    if (m.type === 'enum') enums = ` (${m.enum.join(', ')})`;
    return `${capitalize(m.type)} ${m.default ? `Default: ${m.default}` : ''}${enums}`;
  }

  // check if the field is a relation and if it has all needed fields. true = ok, false bad
  relationCheck = () => {
    const { data: { datas, data, newKey, newValue, newAllowNull, newRelation, newDefaultValue, newMinLength, newMaxLength, newUnique } } = this.props.store;

    // if (newValue === 'relation' && newRelation.index && newRelation.model && newRelation.type === 'hasMany') return false;
    if (newValue === 'relation' &&
        (newRelation.index === -1 ||
        !newRelation.model ||
        !newRelation.field ||
        !newRelation.type)) {
      return true;
    }
    return false; // should not be disabled
  }

  handleRelationForm = (node) => {
    const { data: { datas } } = this.props.store;
    let data = null;
    datas.forEach((d) => {
      if (d.id === node.props.boundValue.relationModel) {
        data = d;
      }
    });
    return (
      <div>
        <Typography variant="h5">
          Bound Relation
        </Typography>
        <List dense>

        {Object.keys(data.model || {}).map((k, i) => {
          return (
            <React.Fragment>
            <ListItem
              key={k}
              selected={node && node.props && node.props.boundValue && node.props.boundValue.relationField === k}
              onClick={this.props.relationClick(data.name, k, data.id, data)}
            >
              <ListItemText
                primary={`${k} - ${this.handleModel(data.model[k])}`}
              />
            </ListItem>
            {k !== 'id' && (data.model[k].type === 'number' || data.model[k].type === 'float') && (
              <ListItem
                selected={node && node.props && node.props.boundValue && node.props.boundValue.relationField === `${k}__avg`}
                onClick={this.props.relationClick(data.name, `${k}__avg`, data.id, data)}
              >
                <ListItemText
                  primary={`${k} - average ${data.name}s via ${k}`}
                />
              </ListItem>
            )}
            </React.Fragment>
          )
        })}
          <ListItem
            selected={node && node.props && node.props.boundValue && node.props.boundValue.relationField === '__count'}
            onClick={this.props.relationClick(data.name, '__count', data.id, data)}
          >
            <ListItemText
              primary={`count - total number of ${data.name}s`}
            />
          </ListItem>

        </List>

      </div>
    )
  }

  deleteChip = (idx) => (e) => {
    const { data: { enumArray, update } } = this.props.store;
    let clone = toJS(enumArray).slice();
    clone.splice(idx, 1);
    update('enumArray', clone);
  }

  submitChip = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { data: { enumVal, enumArray, update } } = this.props.store;
    let clone = toJS(enumArray).slice();
    clone.push(enumVal);
    clone = uniq(clone);
    update('enumVal', '');
    update('enumArray', clone);
  }

  render() {
    const { node, classes, showDelete, showForm, isButton } = this.props;
    const { page: { render }, data: { enumVal, enumArray, datas, data, newKey, newValue, newAllowNull, newRelation, newDefaultValue, newMinLength, newMaxLength, newUnique } } = this.props.store;
    // for forms, we need to figure out how to tell our rendering engine that a

    if (!data._id) return null;

    return (
      <div>
        <div>
          <Typography variant="h5">
            Data Fields
          </Typography>
        </div>
        <div>
          <Typography variant="overline">
            {data.name}
          </Typography>
        </div>
        {Object.keys(data.model || {}).map((k, i) => {
          return (
            <List dense key={k} id={i === 0 ? 'data-field' : `data-field-${k}`}>
                <ListItem
                  button={isButton}
                  selected={node && node.props && node.props.boundValue && node.props.boundValue.field === k}
                  onClick={this.props.onClick(data.name, k, data.id, data)}
                >
                  <ListItemText
                    primary={`${k} - ${this.handleModel(data.model[k])}`}
                  />
                  {showDelete && data.model[k].deletable && (
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="delete" onClick={this.delete(k, i)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
            </List>
          )
        })}

        {node &&
          node.props &&
          node.props.boundValue &&
          node.props.boundValue.type === 'relation' &&
          this.props.showVirtual &&
          node.props.boundValue.relationModel &&
          this.handleRelationForm(node)}

        {showForm && (
          <Paper className={classes.paper} id="data-field-form">
            <form onSubmit={this.submit} className={classes.column}>
              <div className={classes.row}>
                <TextField
                  label="Field Name"
                  className={classes.textField}
                  value={newKey}
                  onChange={this.handleChange('newKey')}
                  margin="normal"
                />
                {!newUnique && (
                  <TextField
                    label="Default Value"
                    className={classes.textField}
                    value={newDefaultValue}
                    onChange={this.handleChange('newDefaultValue')}
                    margin="normal"
                  />
                )}
                {newUnique && (<div className={classes.formControl} />)}
              </div>
              {['text', 'number'].indexOf(newValue) !== -1 && (
                <div className={classes.row}>
                  <TextField
                    label="Min Length"
                    type="number"
                    className={classes.textField}
                    value={newMinLength}
                    onChange={this.handleChange('newMinLength')}
                    margin="normal"
                  />
                  <TextField
                    type="number"
                    label="Max Length"
                    className={classes.textField}
                    value={newMaxLength}
                    onChange={this.handleChange('newMaxLength')}
                    margin="normal"
                  />
                </div>
              )}
              <div className={classes.row}>
                <FormControl className={classes.formControl}>
                 <InputLabel htmlFor="newValue">Field Type</InputLabel>
                 <Select
                   value={newValue}
                   onChange={this.handleChange('newValue')}
                   inputProps={{
                     name: 'newValue',
                   }}
                 >
                   <MenuItem value={'text'}>Text</MenuItem>
                   <MenuItem value={'number'}>Number</MenuItem>
                   <MenuItem value={'float'}>Float</MenuItem>
                   <MenuItem value={'date'}>Date</MenuItem>
                   <MenuItem value={'enum'}>Enum</MenuItem>
                   <MenuItem value={'boolean'}>Yes / No</MenuItem>
                   <MenuItem value={'relation'}>Relation</MenuItem>
                   <MenuItem value={'array'}>multiple (array)</MenuItem>
                   <MenuItem value={'long_text'}>Long Text</MenuItem>
                   {false && (<MenuItem value={'image'}>Image</MenuItem>)}
                   {false && (<MenuItem value={'file'}>File</MenuItem>)}
                 </Select>
                </FormControl>
                <FormControl className={classes.formControl}>
                 <InputLabel htmlFor="allowNull">Allow Null</InputLabel>
                 <Select
                   value={newAllowNull}
                   onChange={this.handleChange('newAllowNull')}
                   inputProps={{
                     name: 'newAllowNull',
                   }}
                 >
                   <MenuItem value={true}>Yes</MenuItem>
                   <MenuItem value={false}>No</MenuItem>
                 </Select>
                </FormControl>
              </div>
              <div className={classes.row}>
                {newValue === 'relation' && data._id && (
                  <FormControl className={classes.formControl}>
                   <InputLabel htmlFor="relatedModel">Related Model</InputLabel>
                   <Select
                     value={newRelation.model}
                     onChange={this.handleRelationChange('model')}
                     inputProps={{
                       name: 'relatedModel',
                     }}
                   >
                     {datas.filter(d => d._id !== data._id && d.model).map((d) => (<MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>))}
                   </Select>
                  </FormControl>
                )}
                {newValue === 'relation' && data._id && (
                    <FormControl className={classes.formControl}>
                     <InputLabel htmlFor="relationType">Relation Type</InputLabel>
                     <Select
                       value={newRelation.type}
                       onChange={this.handleRelationChange('type')}
                       inputProps={{
                         name: 'relationType',
                       }}
                     >
                       <MenuItem value="hasOne">Has One</MenuItem>
                       {false && (<MenuItem value="belongsTo">Belongs To</MenuItem>)}
                       {false && (<MenuItem value="belongsToMany">Belongs To Many</MenuItem>)}
                       <MenuItem value="hasMany">Has Many</MenuItem>
                     </Select>
                    </FormControl>
                )}
              </div>
              {newValue !== 'relation' && newValue !== 'array' && (
                <div className={classes.row}>
                  <FormControl className={classes.formControl}>
                   <InputLabel htmlFor="relationUnique">Unique</InputLabel>
                   <Select
                     value={newUnique}
                     onChange={this.handleChange('newUnique')}
                     inputProps={{
                       name: 'newUnique',
                     }}
                   >
                     <MenuItem value={true}>True</MenuItem>
                     <MenuItem value={false}>False</MenuItem>
                   </Select>
                  </FormControl>
                  <div className={classes.formControl}></div>
                </div>
              )}

              {newValue === 'enum' && (
                <div>
                  <div>
                    {enumArray.map((e, idx)=> <Chip key={e} label={e} onDelete={this.deleteChip(idx)} className={classes.chip} />)}
                  </div>
                  <form onSubmit={this.submitChip}>
                    <TextField
                      label="Add Item"
                      className={classes.textField}
                      value={enumVal}
                      onChange={this.handleChange('enumVal')}
                      margin="normal"
                    />
                    <Button disabled={!enumVal} type="submit">Add Item</Button>
                  </form >
                </div>
              )}
              {newRelation.model &&
                newRelation.index !== -1 &&
                datas[newRelation.index] &&
                datas[newRelation.index].model && (
                <div className={classes.row}>
                  <FormControl className={classes.formControl}>
                   <InputLabel htmlFor="relatedModel">Related Field</InputLabel>
                   <Select
                     value={newRelation.field}
                     onChange={this.handleRelationChange('field')}
                     inputProps={{
                       name: 'relatedModel',
                     }}
                   >
                     {Object.keys(datas[newRelation.index].model).indexOf('id') === -1 ? (<MenuItem value="id">id</MenuItem>) : (null)}
                     {Object.keys(datas[newRelation.index].model).map((d) => (<MenuItem key={d} value={d}>{d}</MenuItem>))}
                   </Select>
                  </FormControl>
                </div>
              )}
              <div className={classes.row} style={{ marginTop: 15, marginBottom: 15 }}>
                <Button
                  className={classes.textField}
                  onClick={this.reset}
                  variant="outlined"
                >
                  clear
                </Button>
                <Button
                  className={classes.textField}
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={this.relationCheck() || !newKey || !newValue}
                >
                  Save
                </Button>
              </div>
            </form>
          </Paper>
        )}
      </div>
    );
  }
}

DataFields.defaultProps = {
  showForm: true,
  showDelete: true,
  isButton: false,
  onClick: () => {},
};

DataFields.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  showForm: PropTypes.bool,
  showDelete: PropTypes.bool,
  isButton: PropTypes.bool,
  onClick: PropTypes.func,
};

export default withRouter(withStyles(styles)(DataFields));
