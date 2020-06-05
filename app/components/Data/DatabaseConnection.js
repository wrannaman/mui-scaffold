import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { Paper, MenuItem, InputLabel, FormControl, Select, Typography, Button, TextField } from '@material-ui/core';

import { updateProject } from '../../src/apiCalls/project';

const styles = theme => ({
  root: {
  },
  column: {
    flexDirection: 'column',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    maxWidth: 500,
    width: '100%',
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paper: {
    width: '80%',
    margin: '0 auto',
    marginBottom: 25,
  },
  formControl: {
    width: 169,
  }
});


@inject('store')
@observer
class DatabaseConnection extends React.Component {
  state = {
    disabled: false
  };

  submit = async (e) => {
    this.setState({ disabled: true })
    e.preventDefault();
    const { project: { project }, snack: { snacky } } = this.props.store;
    const res = await updateProject(project);
    if (res.success) {
      snacky('Updated');
      this.props.submitted();
    } else {
      snacky(res.error, 'error');
    }
    this.setState({ disabled: false })
  }

  handleChange = (name) => (e) => {
    const { project: { project, update } } = this.props.store;
    const clone = Object.assign({}, toJS(project));
    clone.database[name] = e.target.value;
    update('project', clone);
  }

  render() {
    const { disabled } = this.state;
    const { classes, router } = this.props;
    const { project: { project: { database } } } = this.props.store;
    if (!database) return null;
    return (
      <Paper className={classes.paper}>
        <Typography variant="h6" gutterBottom style={{ textAlign: 'center' }}>
          Database Connection
        </Typography>
        <Typography variant="body2" gutterBottom style={{ textAlign: 'center' }}>
          Our servers are hosted on Google, You'll need to allow access from <br />
          - 35.238.211.241 <br />
        </Typography>
        <form onSubmit={this.submit} className={classes.column}>
          <div className={classes.row}>
            <TextField
              label="DB User"
              className={classes.textField}
              value={database.user}
              onChange={this.handleChange('user')}
              margin="normal"
            />
            <TextField
              label="DB Password"
              className={classes.textField}
              value={database.password}
              type="password"
              autocomplete={false}
              onChange={this.handleChange('password')}
              margin="normal"
            />
          </div>
          <div className={classes.row}>
          <TextField
            label="DB Host"
            className={classes.textField}
            value={database.host}
            onChange={this.handleChange('host')}
            margin="normal"
          />
          <TextField
            label="DB Database"
            className={classes.textField}
            value={database.database}
            onChange={this.handleChange('database')}
            margin="normal"
          />
          </div>
          <div className={classes.row}>
          <FormControl className={classes.formControl}>
           <InputLabel htmlFor="newValue">Dialect</InputLabel>
           <Select
             value={database.dialect}
             onChange={this.handleChange('dialect')}
             inputProps={{
               name: 'dialect',
             }}
           >
             <MenuItem value={'mysql'}>MySQL</MenuItem>
             <MenuItem value={'mssql'} disabled>MsSQL (Coming Soon)</MenuItem>
             <MenuItem value={'postgresql'} disabled>Postgres (Coming Soon)</MenuItem>
             <MenuItem value={'mariadb'} disabled>MariaDB (Coming Soon)</MenuItem>
             <MenuItem value={'sqlite'} disabled>SQLite (Coming Soon)</MenuItem>
           </Select>
          </FormControl>
          <FormControl className={classes.formControl}>
           <InputLabel htmlFor="newValue">Language</InputLabel>
           <Select
             value={database.language}
             onChange={this.handleChange('language')}
             inputProps={{
               name: 'language',
             }}
           >
             <MenuItem value={'nodejs'}>Node JS</MenuItem>
             <MenuItem value={'python'} disabled>Python - Coming Soon</MenuItem>
           </Select>
          </FormControl>
          </div>
          <div className={classes.row} style={{ width: 200, marginTop: 25, marginBottom: 25 }}>
            <Button
              className={classes.textField}
              type="submit"
              variant="outlined"
              disabled={disabled}
            >
              Sync Data
            </Button>
            <Button
              className={classes.textField}
              type="submit"
              variant="contained"
              color="primary"
              disabled={disabled}
            >
              Save
            </Button>
          </div>
        </form>
      </Paper>
    );
  }
}

DatabaseConnection.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(DatabaseConnection));
