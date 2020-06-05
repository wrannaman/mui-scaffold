import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { toJS } from 'mobx';
import { inject, observer } from 'mobx-react';
import Router, { withRouter } from 'next/router';
import moment from 'moment';
import { withStyles } from '@material-ui/core/styles';

import { Button, CardContent, CardActions, Card, Typography, TextField } from '@material-ui/core';

import { updateSubscription } from '../../src/apiCalls/billing';

const styles = theme => ({
  card: {
    minWidth: 275,
    margin: 25,
    minHeight: 250,
  },
  title: {
    fontSize: 14,
  },
  pos: {
    paddingBottom: 12,
  },
  error: {
    color: theme.palette.error.main,
  },
  flexColumn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  modifyForm: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    margin: 15,
    marginTop: 25
  }
});

@inject('store')
@observer
class Subscription extends PureComponent {
  static defaultProps = {
    subscription: {},
    classes: {},
    cancel: () => {}
  }
  static propTypes = {
    subscription: PropTypes.object,
    classes: PropTypes.object,
    cancel: PropTypes.func,
  }
  state = {
    cancelForReal: false,
    hover: false,
    modify: false,
    numProjects: 0,
    waiting: false,
  }
  static displayName = 'Subscription';

  handleCancel = () => {
    const { cancelForReal } = this.state;
    const { subscription, cancel } = this.props;
    if (cancelForReal) {
      return cancel(subscription);
    }
    this.setState({ cancelForReal: true });
  }

  toggleHover = (hover) => () => {
    this.setState({ hover });
  }

  componentDidMount() {
    const { subscription } = this.props;
    this.setState({ numProjects: subscription.items.data[0].quantity })
  }

  modifySubscription = async (e) => {
    e.preventDefault();
    this.setState({ waiting: true })
    const { auth: { update }, snack: { snacky } } = this.props.store;
    const { subscription } = this.props;
    const res = await updateSubscription({ subID: subscription.id, projects: this.state.numProjects, proration: false });
    if (res.customer) update('customer', res.customer);
    if (res.success) snacky('Subscription updated');
    else if (res.error) snacky(res.error, 'error');
    else snacky('Error', 'error');
    this.setState({ waiting: false, modify: false });
  }

  update = async (e) => {
    const { snack: { snacky } } = this.props.store;
    const { subscription } = this.props;
    if (Number(e.target.value) < 1) return snacky('Number of projects must be at least 1');
    this.setState({ numProjects: Number(e.target.value)})
    if (Number(e.target.value) === Number(subscription.items.data[0].quantity)) {
      return this.setState({ diff: 0 });
    }
    // const res = await updateSubscription({ subID: subscription.id, projects: Number(e.target.value), proration: true });
    // if (res && typeof res.diff) this.setState({ diff: res.diff });
  }

  render() {
    const { handleCancel, toggleHover } = this;
    const { subscription, classes } = this.props;
    const { waiting, cancelForReal, hover, modify, numProjects, diff } = this.state;
    return (
      <Card
        onMouseEnter={toggleHover(true)}
        onMouseLeave={toggleHover(false)}
        className={classes.card}
        style={subscription.cancel_at_period_end ? { background: '#a0a0a0' } : {}}
      >
        <CardContent className={classes.flexColumn}>
          <Typography className={classes.title} color="textSecondary" gutterBottom>
            {subscription.cancel_at_period_end ? 'Cancelled' : ''} Subscription to
          </Typography>
          <Typography variant="h6" >
            {subscription.items.data[0].plan.nickname}
          </Typography>
          <Typography variant="overline" color="textSecondary">
            ${((subscription.items.data[0].plan.amount / 100) * subscription.items.data[0].quantity).toFixed(2)} / {subscription.items.data[0].plan.interval}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {subscription.items.data[0].quantity === 1 ? `${subscription.items.data[0].quantity} Project` : `${subscription.items.data[0].quantity} Projects`}
          </Typography>
          <Typography variant="body2">
            Start Date: {moment(subscription.start * 1000).format('MM/DD/YY')}
            <br />
            {!subscription.cancel_at_period_end && (
              <div>
                Next Billing Date: {moment(subscription.start * 1000).add(1, subscription.items.data[0].plan.interval).format('MM/DD/YY')}
              </div>
            )}
            {subscription.cancel_at_period_end && (
              <div>
                Cancelled on {moment(subscription.canceled_at * 1000).format('MM/DD/YY')}
              </div>
            )}
          </Typography>
          {modify && diff > 0 && (
            <React.Fragment>
              <Typography variant="overline" style={{ marginTop: 25 }}>
                {subscription.items.data[0].quantity > this.state.numProjects ? 'Billing amount will decrease' : 'This will cost'} ${diff / 100} today (prorated).
              </Typography>
              <Typography variant="overline" style={{ marginTop: 5 }}>
                The full amount will be included in your next bill.
              </Typography>
            </React.Fragment>
          )}
          {modify && numProjects !== subscription.items.data[0].quantity && (
            <React.Fragment>
              <Typography variant="overline" style={{ marginTop: 5 }}>
                The amount for the new project is prorated for the month.
              </Typography>
            </React.Fragment>
          )}
          {modify && (
            <form onSubmit={this.modifySubscription} className={classes.modifyForm}>
              <TextField
                type="number"
                placeholder="New Number Of Projects"
                value={numProjects}
                label="New Number Of Projects"
                onChange={this.update}
                disabled={waiting}
                style={{ width: 250 }}
              />
              <Button
                type="submit"
                variant="outlined"
                color="primary"
                disabled={waiting || numProjects === subscription.items.data[0].quantity}
                style={{ marginTop: 10 }}
              >
                Change
              </Button>
            </form>
          )}
        </CardContent>
          <CardActions>
            {!subscription.cancel_at_period_end && (
              <Button
                size="small"
                color="error"
                onClick={handleCancel}
                variant="outlined"
                className={cancelForReal ? classes.error : classes.none}
              >
                {cancelForReal ? 'Cancel For Real' : 'Cancel'}
              </Button>
            )}
            {!subscription.cancel_at_period_end && (<div style={{ height: 31 }} />)}
            {!subscription.cancel_at_period_end && (
              <Button
                size="small"
                variant="contained"
                color="secondary"
                onClick={() => this.setState({ modify: !modify })}
              >
                {modify ? 'Cancel Modification' : 'Modify'}
              </Button>
            )}
          </CardActions>
      </Card>
    );
  }
}

Subscription.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Subscription));
