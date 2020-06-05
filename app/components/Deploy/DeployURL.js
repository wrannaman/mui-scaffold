import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { Paper, Link, Typography } from '@material-ui/core';
import { capitalize } from 'lodash';

const styles = theme => ({
  root: {
  },
  paper: {
    // marginLeft: 25,
    // marginRight: 25,
    textAlign: 'center',
    // padding: 15
  }
});

@inject('store')
@observer
class Blank extends React.Component {
  state = {};

  render() {
    const { classes, router, project, name, env, type } = this.props;
    const { deployment } = project;
    const has = deployment && deployment[name] && deployment[name][env];
    if (!has) return null;
    return (
      <Paper className={classes.paper}>
        <Typography variant="h6" style={{ marginBottom: 15 }}>
          {capitalize(env)} {capitalize(type)} URL
        </Typography>
        <Link href={has}>
          Your {capitalize(type)} URL
        </Link>
      </Paper>
    );
  }
}

Blank.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  project: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  env: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

export default withRouter(withStyles(styles)(Blank));
