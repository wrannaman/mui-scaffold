// CheckoutForm.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
  injectStripe
} from 'react-stripe-elements';
import { inject, observer } from 'mobx-react';


import Router, { withRouter } from 'next/router';

// mui
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

import { createStripeCheckout, addCustomerCard } from '../../src/apiCalls/billing';

const styles = theme => {
  return ({
    container: {
      display: 'flex',
      flexWrap: 'wrap',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    textField: {
      marginLeft: 0,
      marginRight: theme.spacing.unit,
      marginTop: 0,
      // width: 500,
    },
    button: {
      margin: theme.spacing.unit,
    },
    snackbar: {
      margin: theme.spacing.unit,
    },
    chip: {
      margin: theme.spacing.unit,
    },
    flex: {
      display: 'flex',
      flexWrap: 'wrap',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }
  });
};

const createOptions = (fontSize = 15, padding) => {
  return {
    style: {
      base: {
        fontSize,
        color: '#424770',
        letterSpacing: '0.025em',
        fontFamily: 'Poppins, Helvetica',
        '::placeholder': {
          color: '#aab7c4',
        },
        ...(padding ? {padding} : {}),
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };
};

@inject('store')
@observer
class CheckoutForm extends Component {

  state = {
    disabled: false,
    waiting: false,
    token: '',
    snackbarMessage: '',
  }

  componentDidMount() {
    // this.handler = window.StripeCheckout.configure({
    //   key: stripe,
    //   image: checkout_image,
    //   locale: 'auto',
    //   zipCode: true,
    //   billingAddress: true,
    //   token: this.handleToken
    // });
  }

  openStripe = () => {
    this.setState({ disabled: true, waiting: true });
    const { months } = this.state;
    const { project } = this.props;
    const { handler } = this;
    handler.open({
      name: 'SugarKubes',
      description: `${months} month access token for ${project.name}.`,
      amount: (months * project.price * 100)
    });
  }

  handleToken = async (token) => {
    const { project } = this.props;
    const { months } = this.state;
    const price = months * project.price;
    if (token) {
      const res = await createStripeCheckout({ ...token, projectId: project.id, months, price });
      this.setState({ ...res });
    }
    this.setState({ disabled: false, waiting: false });
  }

  handleSubmit = (ev) => {
    const { snack: { snacky } } = this.props.store;
    ev.preventDefault();
    if (!this.state.zip) return snacky('Please enter your zip code');
    const { handleStripeToken } = this;
    if (this.props.stripe) {
      this.setState({ disabled: true });
      this.props.stripe
        .createToken()
        .then((payload) => {
          handleStripeToken({ ...payload, zipCode: this.state.zip });
        })
        .catch((e) => {
          this.setState({ disabled: false });
          console.error('e ', e);
        });
    } else {
      console.error("Stripe.js hasn't loaded yet.");
    }
  }

  handleStripeToken = async (payload) => {
    const {
      props: {
        store: {
          auth: { checkTokenAndSetUser, update }
        }
      }
    } = this;
    try {
      const res = await addCustomerCard(payload);
      if (res && res.success && res.customer) update('customer', res.customer);
    } catch (e) {
      console.error('handleStripeToken ', e);
    }
    this.setState({ disabled: false });
  }

  handleChange = (change) => {
    const { error, brand, complete } = change;
    const message = error && error.message ? error.message : '';
    this.setState({ [change.elementType]: { message, brand, complete } });
  }

  handleBlur = () => {
    // console.log('[blur]');
  }

  handleClick = () => {
    // console.log('[click]');
  }

  handleFocus = () => {
    // console.log('[focus]');
  }

  handleReady = () => {
    // console.log('[ready]');
  }

  handleNonStripeChange = (name) => (e) => {
    this.setState({ [name]: e.target.value });
  }


  render() {
    const { handleNonStripeChange, handleBlur, handleChange, handleFocus, handleReady } = this;
    const { classes } = this.props;
    const {
      disabled,
      snackbarMessage
    } = this.state;
    const padding = '10px 0px 10px 0px';

    // custom checkout ?
    return (
      <div className={classes.flex}>
        <form onSubmit={this.handleSubmit}>
          <div style={{ padding }}>
            <label>
            <Typography variant="subtitle1" gutterBottom>
              Card number
            </Typography>
              <CardNumberElement
                onBlur={handleBlur}
                onChange={handleChange}
                onFocus={handleFocus}
                onReady={handleReady}
                {...createOptions()}
              />
            </label>
          </div>
          <div style={{ padding }}>
            <label>
              <Typography variant="subtitle1" gutterBottom>
                Expiration date
              </Typography>
              <CardExpiryElement
                onBlur={handleBlur}
                onChange={handleChange}
                onFocus={handleFocus}
                onReady={handleReady}
                {...createOptions()}
              />
            </label>
          </div>
          <div style={{ padding }}>
            <label>
              <Typography variant="subtitle1" gutterBottom>
                CVC
              </Typography>
              <CardCVCElement
                onBlur={handleBlur}
                onChange={handleChange}
                onFocus={handleFocus}
                onReady={handleReady}
                {...createOptions()}
              />
            </label>
          </div>
          <div style={{ paddingLeft: 0, marginTop: -10, marginBottom: 20 }}>
            <TextField
              label="Zip Code"
              className={classes.textField}
              value={this.state.zip}
              onChange={handleNonStripeChange('zip')}
              type="number"
            />
          </div>
          {!disabled && (
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={disabled || !this.state.zip}
            >
              Add Card
            </Button>
          )}
          {disabled && (
            <CircularProgress />
          )}
        </form>

      </div>
    );
  }
}

CheckoutForm.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(injectStripe(withStyles(styles)(CheckoutForm)));
