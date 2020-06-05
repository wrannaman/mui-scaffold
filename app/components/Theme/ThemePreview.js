import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles, ThemeProvider } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';

import { Typography, Button, Paper } from '@material-ui/core';

import Chips from '../Demos/DataDisplay/Chips';
import Lists from '../Demos/DataDisplay/Lists';
import TextFields from '../Demos/Inputs/TextFields';

const styles = theme => ({
  background: {
    color: theme.palette.background.default,
  },
});

@inject('store')
@observer
class ThemePreview extends React.Component {
  state = {};

  render() {
    const { classes, router } = this.props;
    const { project: { getTheme } }  = this.props.store;

    return (
      <ThemeProvider theme={getTheme()}>
        <div style={{ overflow: 'scroll', height: '90vh', backgroundColor: getTheme().palette.background.default }}>
          <div>
            <Typography variant="h3" style={{ color: getTheme().palette.text.primary, marginBottom: 25 }}>Theme Preview</Typography>

            <Typography variant="h1" color="primary">h1 primary</Typography>
            <Typography variant="h2" color="secondary">h2 secondary</Typography>
            <Typography variant="h3" style={{ color: getTheme().palette.text.primary }}>h3</Typography>
            <Typography variant="h4" style={{ color: getTheme().palette.text.primary }}>h4</Typography>
            <Typography variant="h5" style={{ color: getTheme().palette.text.primary }}>h5</Typography>
            <Typography variant="h6" style={{ color: getTheme().palette.text.primary }}>h6</Typography>
            <Typography variant="body1" style={{ color: getTheme().palette.text.primary }}>body1</Typography>
            <Typography variant="body2" style={{ color: getTheme().palette.text.primary }}>body2</Typography>
            <Paper style={{ margin: 10, padding: 25, width: '80%', }}>
              <Typography variant="overline" style={{ color: getTheme().palette.text.primary }}>overline in paper</Typography>
            </Paper>
          </div>
          <div>
            <Button variant="outlined" color="primary">Button outlined primary</Button>
            <Button variant="contained" color="secondary">Button contained</Button>
            <Button variant="text" color="error">Button text error</Button>
          </div>
          <div>
            <Chips />
            <Lists color={getTheme().palette.text.primary } />
            <TextFields />
          </div>
        </div>
      </ThemeProvider>
    );
  }
}

ThemePreview.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(ThemePreview));
