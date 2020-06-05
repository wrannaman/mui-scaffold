export default `import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { Typography } from '@material-ui/core';

const styles = theme => ({
  root: {
  },
});

@inject('store')
@observer
class Blank extends React.Component {
  state = {};

  render() {
    const { classes, router } = this.props;
    return (
      <div>
        blank
      </div>
    );
  }
}

Blank.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Blank));`;
