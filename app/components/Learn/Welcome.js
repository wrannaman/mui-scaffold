import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { FormControlLabel, Switch, TextField, Typography, Button } from '@material-ui/core';

const styles = theme => ({
  root: {
  },
  marginTop: {
    marginTop: 25,
  },
  textField: {
    marginTop: 25,
    width: 250,
  }
});

import { updateUser } from '../../src/apiCalls/user';


@inject('store')
@observer
class Welcome extends React.Component {
  state = {};

  change = (item, check = false) => (e) => {
    const { auth: { update, user } } = this.props.store;
    const clone = toJS(user);
    if (check) clone[item] = e.target.checked;
    else clone[item] = e.target.value;
    update('user', clone);
  }

  submit = async (e) => {
    e.preventDefault();
    const { snack: { snacky }, auth: { update, setLocalUser, user, projectSteps } } = this.props.store;
    const { name, intros, wantToBuild, isDeveloper } = user;
    const clone = toJS(intros);
    clone.welcome = true;
    console.log('CLONE', clone)
    const res = await updateUser({ name, wantToBuild, intros: clone, isDeveloper });
    setLocalUser({ ...user, intros: clone, name, wantToBuild, isDeveloper });
    if (res.success) {
      snacky('Saved!');
      update('welcomeDialog', false);
      update('learnType', "");
      if (!user.intros || !user.intros.projects) {
        update('steps', projectSteps);
        update('tourOpen', true);
        update('tourName', 'projects');
      }
    } else {
      return snacky('Error', 'error');
    }
  }

  render() {
    const { classes, router } = this.props;
    const { auth: { user } } = this.props.store;

    return (
      <React.Fragment>
        <form onSubmit={this.submit}>
          <Typography variant="body1" gutterBottom className={classes.marginTop}>
            {"First off, what's your name?"}
          </Typography>
          <TextField
            placeholder="What's your name?"
            onChange={this.change('name')}
            value={user.name}
            className={classes.textField}
          />
          <Typography variant="body1" gutterBottom className={classes.marginTop}>
            Dropp can be tricky to get started with. If you let us know what you're trying to build we can help you make it!
          </Typography>
          <div >
            <TextField
              placeholder="What are you trying to build?"
              value={user.wantToBuild}
              onChange={this.change('wantToBuild')}
              className={classes.textField}
            />
          </div>
          <div className={classes.textField}>
            <FormControlLabel
              control={<Switch checked={user.isDeveloper} onChange={this.change('isDeveloper', true)} />}
              label="Do you code?"
            />
          </div>

          <Button
            disabled={!user.name || !user.wantToBuild}
            type="submit"
            variant="outlined"
            className={classes.marginTop}
          >
            Save
          </Button>

        </form>
      </React.Fragment>
    );
  }
}

Welcome.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Welcome));
