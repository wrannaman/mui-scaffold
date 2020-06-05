import React, { Component } from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';

import { Typography } from '@material-ui/core';

import Side from '../components/Nav/Side';
import Auth from '../src/Auth';

import dynamic from 'next/dynamic';

const D = dynamic(
  () => import('../components/Drag'),
  { ssr: false }
);

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
  }
});

@inject('store')
@observer
class Index extends React.Component {

  async componentDidMount() {
    this.auth = new Auth();
    const {
      auth: { checkTokenAndSetUser },
      project: { limit, page, setProjects }
    } = this.props.store;
    const { query: { pageID } } = this.props.router;
    if (!this.auth.isAuthenticated()) {
      Router.push('/');
    }
    const { token } = this.auth.getSession();
    await checkTokenAndSetUser({ token });

    this.init();
  }

  init = async () => {

  }
  render() {
    const { classes } = this.props;

    return (
      <Side
        showSearch={false}
        title={`blank`}
      >
        <div>
            <D />
        </div>
      </Side>
    );
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Index));
