
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { inject, observer } from 'mobx-react';

import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import Typography from '@material-ui/core/Typography';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import WarningIcon from '@material-ui/icons/Warning';
import { withStyles } from '@material-ui/core/styles';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';

import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
};


const styles = theme => ({
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  info: {
    backgroundColor: theme.palette.primary.dark,
  },
  warning: {
    backgroundColor: amber[700],
  },
  snackbar: {

  },
  message: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff'
  },
  icon: {
    color: '#fff'
  }
});

@inject('store')
@observer
class GlobalSnackbar extends Component {

  render () {
    const { classes, className, ...other } = this.props;
    const { snack: { message, variant, onClose } } = this.props.store;
    let Icon = variant ? variantIcon[variant] : variantIcon.info;
    if (!Icon) Icon = variantIcon.info;
    return (
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={message ? true : false}
        autoHideDuration={6000}
        onClose={onClose}
      >
        <SnackbarContent
          className={clsx(classes[variant], className)}
          aria-describedby="client-snackbar"
          message={
            <span className={classes.message}>
              <Icon className={clsx(classes.icon, classes.iconVariant)} />
              <Typography variant="body2" style={{ whiteSpace: 'pre' }}>
                {message}
              </Typography>
            </span>
          }
          action={[
            <IconButton key="close" aria-label="Close" color="inherit" onClick={onClose}>
              <CloseIcon className={classes.icon} />
            </IconButton>,
          ]}
          {...other}
          onClose={onClose}
        />
      </Snackbar>
    );
  }
}

GlobalSnackbar.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(GlobalSnackbar);
