import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';

const styles = theme => ({
  root: {
  },
});

@inject('store')
@observer
class RenderDropped extends React.Component {

  constructor() {
    super();
    this.intervals = [];
  }

  componentDidMount() {
    // const { page: { update } } = this.props.store;
    //
    // this.intervals.push(setInterval(() => {
    //     update('render', new Date().getTime())
    // }, 1000))
  }

  componentWillUnmount() {
    // this.intervals.forEach(i => clearInterval(i))
  }


  render() {
    const { page: { nodes, render } } = this.props.store;
    return (
      <div>
        {render > 0 && nodes.render()}
      </div>
    );
  }
}

RenderDropped.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(RenderDropped));
