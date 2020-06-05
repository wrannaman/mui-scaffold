import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';

import { MenuItem, Select, FormControl, InputLabel, Button, Typography, Paper, TextField } from '@material-ui/core';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';

import DeleteIcon from '@material-ui/icons/Delete';

import { fetchRepeatables } from '../../src/apiCalls/repeatable';
import { fetchDatas, createData, deleteData } from '../../src/apiCalls/data';

const styles = theme => ({
  root: {
  },
  paper: {
    background: 'rgba(0, 0, 0, 0.05)'
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textField: {
    height: 48,
    padding: 0,
    margin: 0
  },
  white: {
    color: '#fff !important'
  },
  formControlNav: {
    width: 120,
    marginLeft: 5,
  },
  formControl: {
    width: '100%',
  }
});

@inject('store')
@observer
class DataModelsAsSelect extends React.Component {
  state = {
    shouldDelete: {},
  };

  fetchDatas = async () => {
    const { project: { update }, data: { updateData } } = this.props.store;
    const { query: { projectID } } = this.props.router;
    const res = await fetchDatas({ projectID, limit: 25 });
    if (res.success) {
      updateData('datas', res.datas.docs);
    }
  }

  setField = async (e) => {
    this.props.onFieldChange(e.target.value);
  }

  render() {
    const { shouldDelete } = this.state;
    const { classes, showDelete, showForm, title, model, value, } = this.props;
    const { data: { name, datas } } = this.props.store;
    let data = datas.filter(d => d._id === model);
    if (data.length === 1) data = data[0];
    if (!data || !data.model || Object.keys(data.model).length === 0) return null;
    return (
      <div>
        <FormControl className={classes.formControl}>
          <InputLabel
            className={classes.inherit}
            id="data-fields-select-as-select-label"
          >
            {title || 'Data Fields'}
          </InputLabel>
          <Select
            labelId="data-fields-select-as-select-label"
            id="data-fields-select-as-select"
            value={value}
            onChange={this.setField}
          >
            {Object.keys(data.model).map((field, index) => (
              <MenuItem
                value={field}
              >
                {field}
              </MenuItem>
            ))}
            <MenuItem
              value={""}
            >
              None
            </MenuItem>
          </Select>
        </FormControl>
      </div>
    );
  }
}

DataModelsAsSelect.defaultProps = {
  onFieldChange: () => {},
  model: "",
  value: ""
};

DataModelsAsSelect.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  onFieldChange: PropTypes.func,
  model: PropTypes.string,
  field: PropTypes.string,
};

export default withRouter(withStyles(styles)(DataModelsAsSelect));
