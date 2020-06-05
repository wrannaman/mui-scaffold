import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { FormControl, InputLabel, MenuItem, Select, Tooltip, Switch, TextField, Typography, Button, Paper } from '@material-ui/core';

import _ from 'lodash';

import DateTime from './DateTime';
import BooleanField from './BooleanField';
import FormDropArea from './FormDropArea';
import ComponentTypes from '../Component/ComponentTypes';

import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';



import { createRepeatable, fetchRepeatables } from '../../src/apiCalls/repeatable'


const styles = theme => ({

  form: {
    background: 'rgba(0, 0, 0, 0.1)',
    margin: 25,
    borderRadius: 5,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    padding: 25,
    marginTop: 10,
    maxWidth: '80%'
  },
  row: {
    width: 200,
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 25,
    marginBottom: 25
  },
  buttonRow: {
    width: 200,
    display: 'flex',
    justifyContent: 'space-between',
    margin: '0 auto',
    marginTop: 25,
    marginBottom: 15
  },
  bools: {
    width: '100%',
  },
  rootLabel: {
    width: 230,
  }
});

@inject('store')
@observer
class Form extends React.Component {
  state = {};

  componentDidMount() {
    this.reset();
  }

  handleChange = (key) => (e) => {
    const { repeatable: { update, dropped } } = this.props.store;
    const clone = toJS(dropped);
    clone[key] = e.target.checked;
    update('dropped', clone);
  }

  handleTableChange = (key, value = false) => (e) => {
    const { repeatable: { update, repeatable } } = this.props.store;
    const clone = toJS(repeatable);
    if (value) clone.table[key] = e.target.value;
    else clone.table[key] = e.target.checked;
    update('repeatable', clone);
  }

  update = (name, checked = false) => (e) => {
    const { repeatable: { update, repeatable } } = this.props.store;
    const clone = toJS(repeatable);
    if (checked) {
      clone[name] = e.target.checked;
    } else {
      clone[name] = e.target.value;
    }
    update('repeatable', clone);
  }

  generateForm = (_model, options) => {
    const { classes } = this.props;
    const { repeatable: { repeatable: { model }, dropped } } = this.props.store;
    if (JSON.stringify(toJS(dropped)) === '{}') return null;
    const keys = Object.keys(_model);
    const fields = keys.map((key) => {
      return (
        <FormControlLabel
          key={key}
          control={
            <Checkbox checked={dropped[key]} onChange={this.handleChange(key)} value={key} />
          }
          label={_.capitalize(key)}
        />
      );
    });
    return (fields);
  }

  reset = () => {
    const { repeatable: { update }, data: { data } } = this.props.store;
    const _dropped = {};
    Object.keys(data.model).forEach(d => _dropped[d] = false);
    update('dropped', _dropped);
    update('repeatable', { name: "", model: {}, table: { add: true, export: true, filter: true, delete: true, edit: true } });
  }

  submit = async e => {
    e.preventDefault();
    const { data: { data }, repeatable: { dropped, repeatable, name, updateRepeatable }, snack: { snacky } } = this.props.store;
    const res = await createRepeatable({
      repeatableID: repeatable.id,
      type: 'table',
      project: data.project,
      dataID: data.id,
      name: repeatable.name,
      fields: toJS(dropped),
      table: repeatable.table,
    });
    if (res.success) {
      snacky('Saved');
    } else {
      return snacky(res.error, 'error');
    }
    const compRes = await fetchRepeatables({ project: data.project, dataID: data._id });
    const _dropped = {};
    Object.keys(data.model).forEach(d => _dropped[d] = false);
    if (compRes.repeatables) updateRepeatable('repeatables', compRes.repeatables);
    updateRepeatable('dropped', _dropped);
    updateRepeatable('repeatable', { name: "", model: {}, table: { add: true, export: true, filter: true, delete: true, edit: true } });
  }

  render() {
    const { classes, router } = this.props;
    const { data: { data }, repeatable: { repeatable }, project: { project: { pages } } } = this.props.store;
    const detailPages = pages.filter(p => p.type === 'detail');

    return (
      <div className={classes.form}>
        <Typography style={{ marginTop: 15 }} variant="h6"> {repeatable.id ? `Edit ${repeatable.name}` : 'Create A New Table View'}</Typography>
        <Paper className={classes.wrapper}>
          <Typography variant="h6">
            Table Elements
          </Typography>
          <form onSubmit={this.submit}>
            <FormGroup row>
              {this.generateForm(data.model, data.options)}
            </FormGroup>
            <TextField
              label="Table Name"
              value={repeatable.name}
              onChange={this.update('name')}
            />
            <div className={classes.bools}>
              <FormControlLabel
                classes={{
                  root: classes.rootLabel
                }}
                control={
                  <Switch
                    checked={repeatable.table.add}
                    onChange={this.handleTableChange('add')}
                    value="add"
                  />
                }
                label="Show Add"
              />
              <FormControlLabel
                classes={{
                  root: classes.rootLabel
                }}
                control={
                  <Switch
                    checked={repeatable.table.delete}
                    onChange={this.handleTableChange('delete')}
                    value="delete"
                  />
                }
                label="Show Delete"
              />
            </div>
            <div className={classes.bools}>
              <FormControlLabel
                classes={{
                  root: classes.rootLabel
                }}
                control={
                  <Switch
                    checked={repeatable.table.export}
                    onChange={this.handleTableChange('export')}
                    value="export"
                  />
                }
                label="Show Export"
              />
              <FormControlLabel
                classes={{
                  root: classes.rootLabel
                }}
                control={
                  <Switch
                    checked={repeatable.table.edit}
                    onChange={this.handleTableChange('edit')}
                    value="edit"
                  />
                }
                label="Show Edit"
              />
            </div>
            <div className={classes.bools}>
              <FormControlLabel
                classes={{
                  root: classes.rootLabel
                }}
                control={
                  <Switch
                    checked={repeatable.table.filter}
                    onChange={this.handleTableChange('filter')}
                    value="filter"
                  />
                }
                label="Show Filter"
              />
              <Tooltip title="When a user clicks on a table row, it will take them to a new page with data from that row. You must configure a page of type 'detail' for this to work.">
                <FormControlLabel
                  classes={{
                    root: classes.rootLabel
                  }}
                  control={
                    <Switch
                      checked={repeatable.table.detail}
                      onChange={this.handleTableChange('detail')}
                      value="detail"
                      disabled={detailPages.length === 0}
                    />
                  }
                  label="Click To Detail Page"
                />
              </Tooltip>
            </div>
            {repeatable.table.detail && (
              <div>
                <FormControl
                  className={classes.formControl}
                  classes={{
                    root: classes.rootLabel
                  }}
                >
                 <InputLabel htmlFor="detailPage">Detail Page</InputLabel>
                 <Select
                   value={repeatable.table.detailPage}
                   onChange={this.handleTableChange('detailPage', true)}
                   inputProps={{
                     name: 'detailPage',
                   }}
                 >
                   {detailPages.map(d => (<MenuItem value={d.id}>{d.name}</MenuItem>))}
                 </Select>
                </FormControl>
              </div>
            )}
            <div className={classes.buttonRow}>
              <Button
                color="secondary"
                variant="outlined"
                onClick={this.reset}
              >
                Reset
              </Button>

              <Button
                color="primary"
                variant="contained"
                disabled={!repeatable.name || (repeatable.table.detail && !repeatable.table.detailPage)}
                onClick={this.submit}
              >
                Save
              </Button>
            </div>
          </form>
        </Paper>
      </div>
    );
  }
}

Form.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Form));
