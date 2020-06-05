import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';

import { TextField } from '@material-ui/core';


const styles = theme => ({
  root: {
  },
});

@inject('store')
@observer
class GeneratedTextField extends React.Component {
  state = {};

  change = (name) => (date) => {
    const { data: { updateFakeData } } = this.props.store;
    updateFakeData(name, date);
  }

  render() {
    const { classes, router, name, type } = this.props;
    const { data: { data: { fakeData } } } = this.props.store;
    if (!fakeData || typeof fakeData[name] === 'undefined') return null;
    return (
      <div>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            disableToolbar
            variant="inline"
            format="MM/dd/yyyy"
            margin="normal"
            label={`${name} - date`}
            value={fakeData[name]}
            onChange={this.change(name)}
            KeyboardButtonProps={{
              'aria-label': 'change date',
            }}
          />
          <KeyboardTimePicker
            margin="normal"
            label={`${name} - time`}
            value={fakeData[name]}
            onChange={this.change(name)}
            KeyboardButtonProps={{
              'aria-label': 'change time',
            }}
          />
        </MuiPickersUtilsProvider>
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
