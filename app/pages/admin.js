/* eslint-disable jsx-a11y/anchor-is-valid */

import React from 'react';
import PropTypes from 'prop-types';
import { TextField, Paper, Button, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import Auth from '../src/Auth';
import { EmailRegex } from '../utils/regex';

const styles = theme => ({
  root: {
    textAlign: 'center',
    paddingTop: theme.spacing(20),
    backgroundImage: 'url("/img/cool!.png")',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    height: '100vh',
  },
  center: {
    position: 'absolute',
    width: 500,
    height: 400,
    top: 'calc(50% - 200px)',
    left: 'calc(50% - 250px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '50%',
    marginBottom: 15,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

@inject('store')
@observer
class Index extends React.Component {
  state = {
    error: '',
    email: '',
    code: '',
    enterCode: false,
  };

  componentDidMount() {
    this.auth = new Auth();
    if (this.auth.isAuthenticated()) {
      Router.push({
        pathname: '/projects',
        query: { projectID: "" }
      });
    }
    const { query } = this.props.router;
    if (query.error) {
      this.setState({ error: query.error });
    }
  }

  handleChange = (name) => (e) => {
    if (name === 'email') {
      if (EmailRegex.test(e.target.value)) {
        this.setState({ errorText: '' })
      } else {
        this.setState({ errorText: 'Invalid Email' })
      }
    }
    this.setState({ [name]: e.target.value });
  }

  submit = (type) => async (e) => {
    const { snack: { snacky  } } = this.props.store;
    this.setState({ waiting: true })
    e.preventDefault();
    if (type === 'email') {
      // const emailRes = await this.auth.requestCode({ email: this.state.email });
      this.setState({ enterCode: true });
    } else {
      const codeRes = await this.auth.validateCode({ email: this.state.email, code: this.state.code });
      if (codeRes.success) {
        this.auth = new Auth();
        const {
          auth: { checkTokenAndSetUser },
          project: { limit, page, setProjects }
        } = this.props.store;
        const { query: { redirect } } = this.props.router;
        const { token } = this.auth.getSession();
        await checkTokenAndSetUser({ token });
        Router.push({ pathname: '/projects', query: { redirect } });
      } else {
        snacky(codeRes.error, 'error');
      }
      // if (emailRes.success) this.setState({ enterCode: true });
    }
    this.setState({ waiting: false })
  }

  render() {
    const { classes } = this.props;
    const { error, enterCode } = this.state;

    return (
      <div className={classes.root}>
        <Paper className={classes.center} elevation={24}>
          <img src="/img/logo.png" className={classes.logo} />
          <Typography gutterBottom>
          {error && (
            <Typography variant="body2" gutterBottom color="error">
              {error}
            </Typography>
          )}
          </Typography>
          <div>
            {!enterCode && (
              <form onSubmit={this.submit('email')} className={classes.form}>
                <TextField
                  label="Email"
                  className={classes.textField}
                  value={this.state.email}
                  type="email"
                  name="email"
                  error={this.state.errorText ? true : false}
                  onChange={this.handleChange('email')}
                  margin="normal"
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!this.state.email || this.state.errorText || this.state.waiting}
                  style={{ marginTop: 20 }}
                >
                  Log in or Sign Up
                </Button>
              </form>
            )}
            {enterCode && (
              <div>
                <Typography variant="body1">
                  Check your email to find your login code.
                </Typography>
              </div>
            )}
            {enterCode && (
              <form onSubmit={this.submit('code')} className={classes.form}>
                <TextField
                  label="Code"
                  className={classes.textField}
                  value={this.state.code}
                  type="number"
                  name="code"
                  error={this.state.errorText ? true : false}
                  onChange={this.handleChange('code')}
                  margin="normal"
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  style={{ marginTop: 20 }}
                  disabled={this.state.waiting}
                >
                  Submit Code
                </Button>
              </form>
            )}
            {enterCode && (
              <Button
                variant="outlined"
                color="primary"
                style={{ marginTop: 20 }}
                onClick={() => this.setState({ enterCode: false })}
              >
                Start Over
              </Button>
            )}
          </div>
        </Paper>
      </div>
    );
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Index));
