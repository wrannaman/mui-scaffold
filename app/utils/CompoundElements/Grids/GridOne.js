import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { Grid, Paper, Typography } from '@material-ui/core';
import DropArea from '../../../components/Renderer/DropArea';
import Types from '../../render/Types'

const styles = theme => ({
  root: {
  },
});

@inject('store')
@observer
class Grids extends React.Component {
  render() {
    const { type, style, children } = this.props;
    return (
      <div style={{ ...style, border: '1px solid blue' }}>
        <Grid container spacing={3}>
          <Grid item xs>
            <div>
              {children}
            </div>
            <DropArea
              type="COMPONENT"
              accepts={[
                Types.COMPONENT
              ]}
              onDrop={item => this.props.onDrop(item)}
            />

          </Grid>
        </Grid>
      </div>
    );
  }
}

Grids.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Grids));
