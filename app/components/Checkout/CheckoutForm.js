// CheckoutForm.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { injectStripe } from 'react-stripe-elements';

import Router, { withRouter } from 'next/router';

// mui
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { stripe, checkout_image } from '../../config';
import { createStripeCheckout } from '../../src/apiCalls/billing';


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
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit,
      width: 500,
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
  });
};

class CheckoutForm extends Component {

  state = {
    months: 1,
    disabled: false,
    token: '',
    description: '',
  }

  componentDidMount() {
    this.handler = window.StripeCheckout.configure({
      key: stripe,
      image: checkout_image,
      locale: 'auto',
      zipCode: true,
      billingAddress: true,
      token: this.handleToken
    });

  }

  openStripe = () => {
    this.setState({ disabled: true });
    const { handler } = this;
    const description = 'Set up billing';
    // `${months} month access token for ${project.name}.`
    this.setState({ description });

    handler.open({
      name: 'SugarKubes',
      description,
      amount: 0
    });
  }

  handleToken = async (token) => {
    const { project } = this.props;
    const { months, description } = this.state;
    const price = months * project.price;
    if (token) {
      const res = await createStripeCheckout({ ...token, description });
      if (res.newCharge && res.newCharge.id) {
        this.setState({ ...res, token: true });
      }
    }
    this.setState({ disabled: false });
  }

  handleChange = (change) => {
    const { error, brand, complete } = change;
    const message = error && error.message ? error.message : '';
    this.setState({ [change.elementType]: { message, brand, complete } });
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


  createOptions = (fontSize, padding) => {
    return {
      style: {
        base: {
          fontSize,
          color: '#424770',
          letterSpacing: '0.025em',
          fontFamily: 'Poppins, Helvetica, monospace',
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

  render() {
    const { project } = this.props;
    const { months, disabled, token } = this.state;
    const padding = '10px 0px 10px 0px';

    return (
      <div>
        {token && (
          <div>
            <Typography variant="body2" gutterBottom>
              You're all set up!
            </Typography>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              onClick={() => window.location = project.web_url}
            >
              Get Started!
            </Button>
          </div>
        )}
        {!token && (
          <div>
            <div style={{ padding }}>
            </div>
            <div style={{ padding, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={disabled}
                onClick={this.openStripe}
              >
                Set up Billing
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

CheckoutForm.propTypes = {
  project: PropTypes.object.isRequired,
};

export default withRouter(injectStripe(withStyles(styles)(CheckoutForm)));
