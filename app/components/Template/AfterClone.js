import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { Button, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle  } from '@material-ui/core';

const styles = theme => ({
  root: {
  },
});

@inject('store')
@observer
class AfterClone extends React.Component {
  state = {};

  handleClose = () => {
    const { project: { update } } = this.props.store;
    update('showAfterClone', false)
  }

  ok = () => {
    const { router: { query } } = this.props;
    this.handleClose()
    Router.push({ pathname: '/data-models', query });
  }

  render() {
    const { classes, router } = this.props;
    const { project: { showAfterClone, update } } = this.props.store;
    return (
      <Dialog
        open={showAfterClone}
        onClose={this.handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle>Project Cloned! 🚀</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You're project is all set up!
            As you navigate around this project, it will be filled with the
            contents of the clone. If you get stuck, remember to click on the
            help icon in the top right of each page.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={this.ok}
            color="primary"
            variant="outlined"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AfterClone.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(AfterClone));
