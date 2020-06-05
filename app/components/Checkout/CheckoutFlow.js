import React from 'react';
import PropTypes from 'prop-types';

// Mui
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import LinearProgress from '@material-ui/core/LinearProgress';

// Next
import Link from 'next/link';
import Router, { withRouter } from 'next/router'

// others
import { Elements, CardElement } from 'react-stripe-elements';
import { slightly_dark } from '../../utils/colors';


// ours
// import { stripe } from '../../config';
// import Amplitude from '../../src/amplitude';

// components
import InjectedCheckoutForm from './CheckoutForm';


let StripeProvider = null;

const styles = theme => ({
  root: {
    height: '100vh',
    // textAlign: 'center',
    // paddingTop: theme.spacing.unit * 20,
  },
  form: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    // height: 300,
    width: 500,
    // alignItems: 'center',
    // justifyContent: 'space-evenly',
    // display: 'flex',
    // flexDirection: 'column',
    // margin: 25
  }
});

class Check extends React.Component {

  state = {
    open: false,
    error: '',
    waiting: true,
  };

  componentDidMount() {
    const { init } = this;
    StripeProvider = require('react-stripe-elements').StripeProvider;
    this.setState({ waiting: false })
  }

  render() {
    const { classes } = this.props;
    const { project, user, waiting } = this.state;
    return (
      <div className={classes.root}>
          <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>

            {waiting && (<LinearProgress />)}
            {!waiting && StripeProvider && (
              <StripeProvider apiKey={stripe}>
                <Paper className={classes.form}>
                  <Elements>
                    <InjectedCheckoutForm project={project} user={user} />
                  </Elements>
                </Paper>
              </StripeProvider >
            )}
          </div>
      </div>
    );
  }
}

Check.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Check));
