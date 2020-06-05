import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography } from '@material-ui/core';

import CloseIcon from '@material-ui/icons/Close';


import Welcome from './Welcome';


const styles = theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

@inject('store')
@observer
class Learn extends React.Component {
  state = {};


  close = () => {
    const { auth: { learnType, update } } = this.props.store;
    update('welcomeDialog', false);
  }

  render() {
    const { classes, router } = this.props;
    const { auth: { welcomeDialog, learnType } } = this.props.store;
    let which = null;
    let title = null;
    let showActions = true;
    switch (learnType) {
      case 'welcome':
        which = <Welcome />;
        title = 'Welcome To Dropp 🥳!';
        showActions = false;
        break;
      default:

    }
    return (
      <Dialog onClose={this.close} aria-labelledby="learn-dialog-title" open={welcomeDialog}>
        <DialogTitle id="learn-dialog-title" onClose={this.close}>
          {title}
        </DialogTitle>
        <DialogContent dividers>
          {which}
        </DialogContent>
        {showActions && (
          <DialogActions>
            <Button autoFocus onClick={this.close} color="primary">
              Got It
            </Button>
          </DialogActions>
        )}
      </Dialog>
    );
  }
}

Learn.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Learn));
