// CheckoutForm.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  injectStripe
} from 'react-stripe-elements';

import Router, { withRouter } from 'next/router';

// mui
import { withStyles } from '@material-ui/core/styles';
import { Paper, Button, Typography, CircularProgress } from '@material-ui/core';


// import StripeElementWrapper from '../Checkout/StripeElementWrapper';
import { stripe, checkout_image } from '../../config';
import { createStripeCheckout, addCustomerCard } from '../../src/apiCalls/billing';

import Subscription from './Subscription';

const styles = theme => {
  return ({
    paper: {
      ...theme.mixins.gutters(),
      paddingTop: theme.spacing.unit * 2,
      paddingBottom: theme.spacing.unit * 2,
      // width: '50%',
      minHeight: 200,
      alignItems: 'center',
      // justifyContent: 'space-evenly',
      display: 'flex',
      flexDirection: 'column',
      margin: '0 auto',
      // maxWidth: '60%',
      marginTop: 25,
    },
    subs: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-evenly'
    }
  });
};



class Subscriptions extends Component {
  static defaultProps = {
    customer: {},
    classes: {},
    cancelSubscription: () => {}
  }
  static propTypes = {
    customer: PropTypes.object,
    classes: PropTypes.object,
    cancelSubscription: PropTypes.func,
  }

  render() {
    const { customer, classes, cancelSubscription } = this.props;
    const hasSubscriptions = customer && customer.subscriptions && customer.subscriptions.data && customer.subscriptions.data.length
    if (!hasSubscriptions) return null;
    const subscriptions = customer.subscriptions.data;
    return (
      <div className={classes.paper} elevation={1}>
        <Typography variant="h4">
          Subscriptions
        </Typography>
        <div className={classes.subs}>
          {subscriptions.map(subscription =>
            <Subscription
              subscription={subscription}
              key={subscription.id}
              cancel={cancelSubscription}
            />
          )}
        </div>
      </div>
    );
  }
}

export default withRouter(withStyles(styles)(Subscriptions));
