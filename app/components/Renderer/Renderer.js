import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles, ThemeProvider } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
// import { DndProvider } from 'react-dnd'
// import HTML5Backend from 'react-dnd-html5-backend'

import Example from './Example';

// import {
//   jsonToPage,
// } from '../../utils/render';

const styles = theme => ({
  root: {
  },
});

@inject('store')
@observer
class Renderer extends React.Component {
  state = {};

  render() {
    const { classes } = this.props;
    const { page: { page } } = this.props.store;
    // return jsonToPage(page)
    return (
      <div style={{ width: '100%' }}>
        <Example />
      </div>
    );
  }
}

Renderer.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Renderer));
