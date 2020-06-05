import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { Grid, Paper, Typography } from '@material-ui/core';
import DropSource from './DropSource';
import Types from '../../utils/render/Types'

const styles = theme => ({
  root: {
  },
});

@inject('store')
@observer
class Grids extends React.Component {

  handleDrop = (item) => {
  }

  render() {
    const { type, style } = this.props;
    switch (type) {
      case 'ONE':
        return (
          <div style={{ ...style }}>
            <Grid container spacing={3}>
              <Grid item xs>
                <Paper>
                  <Typography>
                    One
                  </Typography>
                  <DropSource
                    type="COMPONENT"
                    accepts={[
                      GridTypes.COMPONENT
                    ]}
                    onDrop={item => this.handleDrop(item)}
                  />
                </Paper>
              </Grid>
            </Grid>
          </div>
        )
      case 'TWO':
        return (
          <div style={{ ...style }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={6}>
                <Paper>
                  <Typography style={{ textAlign: 'center' }}>
                    Two
                  </Typography>
                  <DropSource
                    type="COMPONENT"
                    accepts={[
                      GridTypes.COMPONENT
                    ]}
                    onDrop={item => this.handleDrop(item)}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6} lg={6}>
                <Paper>
                  <Typography style={{ textAlign: 'center' }}>
                    Two
                  </Typography>
                  <DropSource
                    accepts={[
                      GridTypes.COMPONENT
                    ]}
                    type="COMPONENT"
                    onDrop={item => this.handleDrop(item)}
                  />
                </Paper>
              </Grid>
            </Grid>
          </div>
        )
      case 'THREE':
        return (
          <div style={{ ...style }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={4}>
                <Paper>
                  <Typography style={{ textAlign: 'center' }}>
                    Three
                  </Typography>
                  <DropSource
                    accepts={[
                      GridTypes.COMPONENT
                    ]}
                    type="COMPONENT"
                    onDrop={item => this.handleDrop(item)}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6} lg={4}>
                <Paper>
                  <Typography style={{ textAlign: 'center' }}>
                    Three
                  </Typography>
                  <DropSource
                    accepts={[
                      GridTypes.COMPONENT
                    ]}
                    type="COMPONENT"
                    onDrop={item => this.handleDrop(item)}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6} lg={4}>
                <Paper>
                  <Typography style={{ textAlign: 'center' }}>
                    Three
                  </Typography>
                  <DropSource
                    accepts={[
                      GridTypes.COMPONENT
                    ]}
                    type="COMPONENT"
                    onDrop={item => this.handleDrop(item)}
                  />
                </Paper>
              </Grid>
            </Grid>
          </div>
        )
      case 'FOUR':
        return (
          <div style={{ ...style }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={3}>
                <Paper>
                  <Typography style={{ textAlign: 'center' }}>
                    Four
                  </Typography>
                  <DropSource
                    accepts={[
                      GridTypes.COMPONENT
                    ]}
                    type="COMPONENT"
                    onDrop={item => this.handleDrop(item)}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Paper>
                  <Typography style={{ textAlign: 'center' }}>
                    Four
                  </Typography>
                  <DropSource
                    accepts={[
                      GridTypes.COMPONENT
                    ]}
                    type="COMPONENT"
                    onDrop={item => this.handleDrop(item)}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Paper>
                  <Typography style={{ textAlign: 'center' }}>
                    Four
                  </Typography>
                  <DropSource
                    accepts={[
                      GridTypes.COMPONENT
                    ]}
                    type="COMPONENT"
                    onDrop={item => this.handleDrop(item)}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Paper>
                  <Typography style={{ textAlign: 'center' }}>
                    Four
                  </Typography>
                  <DropSource
                    accepts={[
                      GridTypes.COMPONENT
                    ]}
                    type="COMPONENT"
                    onDrop={item => this.handleDrop(item)}
                  />
                </Paper>
              </Grid>
            </Grid>
          </div>
        )
      default:
    }
  }
}

Grids.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Grids));
