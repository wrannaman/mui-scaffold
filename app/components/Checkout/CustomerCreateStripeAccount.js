// CheckoutForm.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  injectStripe
} from 'react-stripe-elements';

import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

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
    dense: {
      marginTop: 16,
    },
    menu: {
      width: 200,
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
    if (token) {
      const res = await createStripeCheckout(token);
    }
    this.setState({ disabled: false });
  }

  handleSubmit = (ev) => {
    ev.preventDefault();
    const { handleStripeToken } = this;
    if (this.props.stripe) {
      this.setState({ disabled: true });
      this.props.stripe
      .createToken()
      .then((payload) => {
        handleStripeToken(payload)
      })
        .catch((e) => {
          this.setState({ disabled: false });
          console.error('e handleSubmit ', e)
        });
    } else {
      console.error("Stripe.js hasn't loaded yet.");
    }
  }

  handleStripeToken = (payload) => {
    // try {
    //   console.log('payload ', payload);
    //   console.log('do something');
    // } catch (e) {
    //   console.log('handleStripeToken ', e);
    //   this.setState({ disabled: false });
    // }
  }


  render() {
    const { openStripe } = this;
    const { project } = this.props;
    const { months, disabled } = this.state;
    const padding = '10px 0px 10px 0px';
    return (
      <div>
        <div style={{ padding }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={disabled}
            onClick={openStripe}
          >
            Pay {`$${months * project.price}`}
          </Button>
        </div>
      </div>
    );
  }
}

CheckoutForm.propTypes = {
  project: PropTypes.object.isRequired,
};

export default injectStripe(withStyles(styles)(CheckoutForm));
