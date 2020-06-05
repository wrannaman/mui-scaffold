import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import dynamic from 'next/dynamic';

const Sorted = dynamic(
  () => import('./Sorted'),
  { ssr: false }
);

// import Sorted from './Sorted';

const styles = theme => ({
  root: {
    width: '100%',
    height: '100vh',
    overflow: 'scroll'
  },
});

@inject('store')
@observer
class Tree extends React.Component {
  render() {
    return (
      <Sorted />
    );
  }
}

Tree.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Tree));
