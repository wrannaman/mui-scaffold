import React, { Component } from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { Typography } from '@material-ui/core';

import DropSource from './Shared/DropSource';
import Types from '../utils/render/Types';

const styles = theme => ({
  flexRow: {
    display: 'flex',
    flexDirection: 'row'
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column'
  },
  flexColumWidth: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  body: {
    border: '1px solid blue',
    height: '100vh'
  }
});

@inject('store')
@observer
class Index extends React.Component {

  async componentDidMount() {}

  init = async () => {

  }

  onDrop = (item) => {
  }
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.body}>
        drag
        <DropSource
          accepts={[
            Types.COMPONENT
          ]}
          onDrop={this.onDrop}
        />
      </div>
    );
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Index));
