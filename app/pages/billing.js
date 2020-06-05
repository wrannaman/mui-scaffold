import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core/styles';
// import { stripe } from '../config';
import { toJS } from 'mobx';

// mui
import { Grid, Button, TextField, Typography, Paper, CircularProgress } from '@material-ui/core'

import { StripeProvider, Elements } from 'react-stripe-elements';
// next
import Router, { withRouter } from 'next/router';

// ours
import Side from '../components/Nav/Side';
import Auth from '../src/Auth';
import Subscriptions from '../components/Billing/Subscriptions';
import AddCardForm from '../components/Checkout/AddCardForm';

const PRICE = 19.99

import { fetchProjects } from '../src/apiCalls/project';
import { fetchStripeInfo, makeCardDefault, deleteCard, cancelSubscription, getBillingUsage, subscribe } from '../src/apiCalls/billing';

const findPriceByUsage = (projectCount) => {
  return projectCount * PRICE;
};

const styles = theme => ({
  root: {
  },
  container: {
    width: '80%',
    minwidth: 300,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto'
  },
  snackbar: {
    margin: theme.spacing.unit,
  },
  paper: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    alignItems: 'center',
    // justifyContent: 'space-evenly',
    display: 'flex',
    flexDirection: 'column',
    margin: '0 auto',
    maxWidth: '60%',
    marginTop: 25,
  },
  textField: {
    minWidth: 300,
  },
  error: {
    color: theme.palette.error.main,
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
    margin: 25,
    minWidth: '100%',
  }
});

@inject('store')
@observer
class Billing extends React.Component {

  state = {
    waiting: true,
    snackbarMessage: '',
    user: {},
    submitDisabled: false,
    disabled: false,
    name: '',
    customer: {},
    showCardModal: false,
    numProjects: 0,
  };

  componentDidMount() {
    this.init()
    this.fetchProjects()
  }

  init = async () => {
    const {
      props: {
        store: {
          auth: { checkTokenAndSetUser, update }
        }
      }
    } = this;
    this.auth = new Auth();
    if (!this.auth.isAuthenticated()) {
      Router.push({ pathname: '/' });
    }
    const { access_token, id_token } = this.auth.getSession();
    await checkTokenAndSetUser({ access_token, id_token });
    const res = await fetchStripeInfo();
    const usage = await getBillingUsage();
    if (usage.numProjects) update('numProjects', usage.numProjects);
    if (res.customer) update('customer', res.customer);
    this.setState({ waiting: false });
  }

  fetchProjects = async () => {
    const { project: { limit, page, setProjects } } = this.props.store;
    const res = await fetchProjects({ limit, page });
    if (res.success) setProjects(res.projects);
    this.setState({ waiting: false });
  }

  handleChange = _name => event => {
    const { name, submitDisabled } = this.state;
    let value = event.target.value;
    if (_name === 'price') {
      value = Number(event.target.value);
    }
    this.setState({ [_name]: value });
    if (name && name.length > 3) this.setState({ submitDisabled: false });
    else if (submitDisabled === false) this.setState({ submitDisabled: true });
  }

  makeCardDefault = (card) => async () => {
    const { auth: { update } } = this.props.store;
    this.setState({ disabled: true, submitDisabled: true });
    const res = await makeCardDefault(card);
    if (res && res.success && res.customer) {
      update('customer', res.customer);
    }
    this.setState({ disabled: false, submitDisabled: false });
  }

  addCardModal = () => {
    this.setState({ showCardModal: !this.state.showCardModal });
  }

  saveCard = () => {
    this.addCardModal();
  }

  updateCustomer = (customer) => {
    this.setState({ customer });
    this.addCardModal();
  }

  subscribe = async (e) => {
    this.setState({ waiting: true });
    const { auth: { update }, snack: { snacky } } = this.props.store;
    const res = await subscribe({ numProjects: this.state.numProjects });
    if (res && res.success && res.customer) {
      update('customer', res.customer);
      this.setState({ numProjects: 0 });
    } else if (res.error) {
      return snacky(res.error, 'error');
    } else {
      return snacky('An Error Ocurred.', 'error');
    }
    this.setState({ waiting: false });
  }

  deleteCard = (card) => async () => {
    const { auth: { update } } = this.props.store;
    this.setState({ disabled: true, submitDisabled: true });
    const res = await deleteCard(card);
    if (res && res.success && res.customer) update('customer', res.customer);
    this.setState({ disabled: false, submitDisabled: false });
  }

  cancelSubscription = async (sub) => {
    this.setState({ waiting: true, modify: false });
    const cancel = await cancelSubscription({ subID: sub.id });
    const res = await fetchStripeInfo();
    if (res && res.success && res.customer) {
      this.setState({ customer: res.customer, waiting: false });
    }
  }

  render() {
    const { handleChange, deleteCard, makeCardDefault, addCardModal, saveCard, updateCustomer, cancelSubscription } = this;
    const { classes, store: { auth: { customer, exportCount }, project: { projects }, } } = this.props;
    const { waiting, snackbarMessage, disabled, submitDisabled, showCardModal, numProjects } = this.state;
    const noStripeCustomer = (
      <div>
        <Typography variant="body1" gutterBottom>
          Please enter your card to set up billing. You will not be charged at this time.
        </Typography>
      </div>
    );
    const hasSubscriptions = customer && customer.subscriptions && customer.subscriptions.data && customer.subscriptions.data.length
    const haveCustomer = customer && customer.sources && customer.sources.data;
    return (
      <div className={classes.root}>
        <Side
          showSearch={false}
          title={'Billing'}
        >
          <div className={classes.container}>
            <Paper className={classes.flexColumn}>
              <Typography variant="body1" gutterBottom style={{ marginTop: 10 }}>
                Having any trouble or have any questions? Email me at andrew@noco.io!
              </Typography>
              <Typography variant="h5">
                Total Projects: {projects.length}
              </Typography>
              {false && (
                <Typography variant="body2">
                  Current Cost: ${findPriceByUsage(projects.length).toFixed(2)} at $PRICE per project
                </Typography>
              )}
            </Paper>
            {!waiting && !haveCustomer && (noStripeCustomer)}
            {!waiting && haveCustomer && (
              <div>
                <Subscriptions
                  customer={customer}
                  cancelSubscription={this.cancelSubscription}
                />
              </div>
            )}
            {!waiting && customer && customer.sources && (
              <Paper className={classes.flexColumn}>
                <Typography variant="h6">
                  Manage your Subscription
                </Typography>
                <TextField
                  style={{ marginTop: 15 }}
                  onChange={handleChange('numProjects')}
                  type="number"
                  placeholder="How Many Projects?"
                  name="How Many Projects?"
                  label="Number of Projects"
                />
                {numProjects > 0 && (
                  <Typography variant="body2" style={{ marginTop: 15 }}>
                    Your total will be ${(numProjects * PRICE).toFixed(2)} / month
                  </Typography>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  style={{ marginTop: 25 }}
                  disabled={numProjects === 0 || waiting}
                  onClick={this.subscribe}
                >
                    Subscribe
                </Button>
              </Paper>
            )}
            {!waiting && customer && customer.sources && (
              <Paper elevation={1} className={classes.flexColumn}>
                <Typography variant="h6">
                  Cards On File
                </Typography>
                <div className={classes.flexRow}>
                  {haveCustomer && customer.sources.data.map((card) => {
                    const isDefault = customer.default_source === card.id;
                    return (
                      <div
                        key={card.id}
                        className={classes.flexRow}
                      >
                        <TextField
                          disabled
                          label={card.brand}
                          defaultValue={`Ending In ${card.last4} (Exp ${card.exp_month}/${card.exp_year})`}
                          className={classes.textField}
                          margin="normal"
                          variant="outlined"
                        />
                        <Button
                          disabled={isDefault || disabled}
                          color="secondary"
                          className={classes.button}
                          type="submit"
                          onClick={makeCardDefault(card)}
                          style={{ marginLeft: 10, minWidth: 145 }}
                        >
                          { isDefault ? 'Default' : 'Make Default'}
                        </Button>
                        {!isDefault && (
                          <Button
                            disabled={disabled}
                            color="secondary"
                            className={classes.error}
                            type="submit"
                            onClick={deleteCard(card)}
                            style={{ marginLeft: 10, minWidth: 90 }}
                          >
                            Delete
                          </Button>
                        )}
                        {isDefault && (<div style={{ width: 90, marginLeft: 10 }}></div>)}
                      </div>
                    );
                  })}
                </div>
                {!showCardModal && (<Button onClick={this.addCardModal}>Add A Card</Button>)}
              </Paper>
            )}
            {waiting && (
              <div className={classes.flexColumn} style={{ marginTop: 25 }}>
                <CircularProgress />
              </div>
            )}
            {!waiting && (showCardModal || !haveCustomer) && (
              <Paper className={classes.flexColumn}>
                <Typography variant="h6">
                  Add A Card
                </Typography>
                <StripeProvider apiKey={stripe}>
                  <Elements>
                    <AddCardForm
                      onClose={addCardModal}
                      updateCustomer={updateCustomer}
                    />
                  </Elements>
                </StripeProvider>
              </Paper>
            )}
          </div>
        </Side>
      </div>
    );
  }
}

Billing.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Billing));
