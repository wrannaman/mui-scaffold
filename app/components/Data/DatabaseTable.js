import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import { Button, Typography } from '@material-ui/core';

const styles = theme => ({
  root: {
  },
  table: {

  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

@inject('store')
@observer
class DatabaseTable extends React.Component {
  state = {};

  handleChange = (type, table, index) => (e) => {
    const { project: { update, selected } } = this.props.store;
    const clone = Object.assign({}, toJS(selected));
    clone[table][type] = e.target.checked;
    update('selected', clone);
  }

  toggle = (type) => (e) => {
    const { project: { update, selected } } = this.props.store;
    const clone = Object.assign({}, toJS(selected));
    Object.keys(clone).forEach((table) => {
      clone[table][type] = !clone[table][type];
    })
    update('selected', clone);
  }

  render() {
    const { classes, store: { project: { project, table: { name, table }, selected }, data: { data } } } = this.props;
    return (
      <Table className={classes.table} size="small" aria-label="generate schemas">
        <TableHead>
          <TableRow>
            <TableCell>Table</TableCell>
            <TableCell align="center">
              <div className={classes.column}>
                <Typography variant="overline" style={{ width: 85, textAlign: 'center' }}>
                  Create
                </Typography>
                <Button variant="outlined" onClick={this.toggle('create')}>Toggle</Button>
              </div>
            </TableCell>
            <TableCell align="center">
              <div className={classes.column}>
                <Typography variant="overline" style={{ width: 85, textAlign: 'center' }}>
                  Get
                </Typography>
                <Button variant="outlined" onClick={this.toggle('get')}>Toggle</Button>
              </div>
            </TableCell>
            <TableCell align="center">
              <div className={classes.column}>
                <Typography variant="overline" style={{ width: 85, textAlign: 'center' }}>
                  Update
                </Typography>
                <Button variant="outlined" onClick={this.toggle('update')}>Toggle</Button>
              </div>
            </TableCell>
            <TableCell align="center">
              <div className={classes.column}>
                <Typography variant="overline" style={{ width: 85, textAlign: 'center' }}>
                  Delete
                </Typography>
                <Button variant="outlined" onClick={this.toggle('delete')}>Toggle</Button>
              </div>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {project.models &&
          Object.keys(selected).length > 0 &&
          Object.keys(project.models).map((key, i) => {
          return (
            <TableRow key={key}>
              <TableCell component="th" scope="row">
                {key}
              </TableCell>
              <TableCell align="center">
                <Checkbox
                  checked={selected[key].create}
                  onChange={this.handleChange('create', key, i)}
                  value="create"
                  inputProps={{
                    'aria-label': 'create checkbox',
                  }}
                />
              </TableCell>
              <TableCell align="center">
                <Checkbox
                  checked={selected[key].get}
                  onChange={this.handleChange('get', key, i)}
                  value="get"
                  inputProps={{
                    'aria-label': 'get checkbox',
                  }}
                />
              </TableCell>
              <TableCell align="center">
                <Checkbox
                  checked={selected[key].update}
                  onChange={this.handleChange('update', key, i)}
                  value="update"
                  inputProps={{
                    'aria-label': 'update checkbox',
                  }}
                />
              </TableCell>
              <TableCell align="center">
                <Checkbox
                  checked={selected[key].delete}
                  onChange={this.handleChange('delete', key, i)}
                  value="delete"
                  inputProps={{
                    'aria-label': 'delete checkbox',
                  }}
                />
              </TableCell>
            </TableRow>
          );
        })}
        </TableBody>
      </Table>
    );
  }
}

DatabaseTable.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(DatabaseTable));
