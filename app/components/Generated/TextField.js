import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';

import { TextField } from '@material-ui/core';


const styles = theme => ({
  root: {
  },
});

@inject('store')
@observer
class GeneratedTextField extends React.Component {
  state = {};

  change = (name) => (e) => {
    const { data: { updateFakeData } } = this.props.store;
    updateFakeData(name, e.target.value);
  }

  render() {
    const { classes, router, name, type } = this.props;
    const { data: { data: { fakeData } } } = this.props.store;
    if (!fakeData || typeof fakeData[name] === 'undefined') return null;
    return (
      <div>
        <TextField
          label={name}
          className={classes.textField}
          margin="normal"
          onChange={this.change(name)}
          type={type}
          value={fakeData[name]}
        />
      </div>
    );
  }
}

GeneratedTextField.defaultProps = {
  type: 'text',
  name: '',
};

GeneratedTextField.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  type: PropTypes.string,
  name: PropTypes.string,
};

export default withRouter(withStyles(styles)(GeneratedTextField));
