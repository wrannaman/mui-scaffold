
import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';

import { Divider } from '@material-ui/core';

import ComponentTypes from '../Component/ComponentTypes';
import TableColumns from './TableColumns';
import TableView from './TableView';
import MasterTable from '../Data/MasterTable';

const styles = theme => ({
  root: {
  },
});

@inject('store')
@observer
class Table extends React.Component {
  state = {};

  render() {
    const { classes, router } = this.props;
    return (
      <div>
        <ComponentTypes type="table" />
        <TableColumns />
        <MasterTable editView={true} />
      </div>
    );
  }
}

Table.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Table));
