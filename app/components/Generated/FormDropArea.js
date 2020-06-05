import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';

import { FormControlLabel, Switch, TextField, Button, Typography, Grid, Paper } from '@material-ui/core';

import DropSource from '../Shared/DropSource';
import Types from '../../utils/render/Types';

import GeneratedTextField from './TextField';
import DateTime from './DateTime';
import BooleanField from './BooleanField';

import { createRepeatable, fetchRepeatables } from '../../src/apiCalls/repeatable'

const styles = theme => ({
  root: {
  },
  wrapper: {
    padding: 25,
    marginTop: 10,
    maxWidth: '80%'
  },
  drop: {
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  form: {
    background: 'rgba(0, 0, 0, 0.1)',
    margin: 25,
    borderRadius: 5,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    width: 200,
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 25,
    marginBottom: 25
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  }
});

@inject('store')
@observer
class FormDropArea extends React.Component {
  state = {
    configuration: 2,
  };

  onDrop = (i) => (e) => {
    const { repeatable: { dropped, update } } = this.props.store;
    const clone = toJS(dropped);
    Object.keys(clone).forEach(k => {
      if (clone[k] === e.name) delete clone[k];
    });
    clone[i] = e.name;
    update('dropped', clone);
  }

  generateFormItem = (model, key) => {
    switch (model[key]) {
      case 'text':
      case 'number':
        return (
          <GeneratedTextField name={key} type={model[key]} key={key} />
        );
      case 'date':
        return (
          <DateTime name={key} key={key} />
        );
      case 'boolean':
        return (
          <BooleanField name={key} key={key} />
        );
      default:
        return (<Typography key={key}>nothing yet</Typography>);
    }
  }

  gridOrFormItem = (model) => {
    const { classes } = this.props;
    const { repeatable: { dropped } } = this.props.store;
    const keys = Object.keys(model);
    const innards = [];
    for (let i = 0; i < keys.length; i++) {
      const item = model[keys[i]];
      if (typeof dropped[i] !== 'undefined') {
        const repeatable = this.generateFormItem(model, dropped[i]);
        innards.push(
          <Grid
            item
            xs={12}
            sm={12}
            md={6}
            key={keys[i]}
            className={classes.column}
          >
            {repeatable}
          </Grid>
        );
      } else {
        innards.push(
          <Grid item xs={12} sm={12} md={6} key={keys[i]}>
            <DropSource
              accepts={[
                Types.COMPONENT
              ]}
              onDrop={this.onDrop(i)}
            >
              <div className={classes.drop}>
                <Typography varian="overline">
                  Drop one form element.
                </Typography>
              </div>
            </DropSource>
          </Grid>
        );
      }
    }
    return (
      <Grid container spacing={3} column>
        {innards}
      </Grid>
    );
  }

  reset = () => {
    const { repeatable: { update },  data: { data }  } = this.props.store;
    const _dropped = {};
    Object.keys(data.model).forEach(d => _dropped[d] = false);
    update('dropped', _dropped);
    update('repeatable', { name: "", model: {}, table: { add: true, export: true, filter: true, delete: true, edit: true, detail: false, detailPage: "" } });
  }

  submit = async () => {
    const { data: { data }, repeatable: { dropped, repeatable, name, updateRepeatable }, snack: { snacky } } = this.props.store;
    const res = await createRepeatable({ repeatableID: repeatable.id, type: 'form', project: data.project, id: data.id, name: repeatable.name, fields: dropped });
    if (res.success) {
      snacky('Saved');
    } else {
      snacky(res.error, 'error');
    }
    const compRes = await fetchRepeatables({ project: data.project, dataID: data._id, limit: 25 });
    if (compRes.repeatables) updateRepeatable('repeatables', compRes.repeatables);
    const _dropped = {};
    Object.keys(data.model).forEach(d => _dropped[d] = false);
    updateRepeatable('dropped', _dropped);
    updateRepeatable('repeatable', { name: "", model: {}, table: { add: true, export: true, filter: true, delete: true, edit: true, detail: false, detailPage: "" } });
  }

  update = (name) => (e) => {
    const { repeatable: { update, repeatable } } = this.props.store;
    const clone = toJS(repeatable);
    clone[name] = e.target.value;
    update('repeatable', clone);
  }

  render() {
    const { configuration } = this.state;
    const { classes, router } = this.props;
    const { data: { data: { model } }, repeatable: { repeatable } } = this.props.store;
    return (
      <div className={classes.form}>
        <Typography style={{ marginTop: 15 }} variant="h6"> {repeatable.name ? `Edit ${repeatable.name}` : 'Create A New Form View'}</Typography>
        <Paper className={classes.wrapper}>
          {this.gridOrFormItem(model)}
        </Paper>
        <TextField
          label="Form Name"
          value={repeatable.name}
          onChange={this.update('name')}
        />
        <div className={classes.row}>
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
            disabled={!repeatable.name}
            onClick={this.submit}
          >
            Save
          </Button>
        </div>
      </div>
    );
  }
}

FormDropArea.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(FormDropArea));
