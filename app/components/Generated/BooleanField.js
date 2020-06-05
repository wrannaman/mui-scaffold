import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';

import { Switch, FormControlLabel } from '@material-ui/core';


const styles = theme => ({
  root: {
  },
});

@inject('store')
@observer
class BooleanField extends React.Component {
  state = {};

  change = (name) => (e) => {
    const { data: { updateFakeData } } = this.props.store;
    updateFakeData(name, e.target.checked);
  }

  render() {
    const { classes, router, name, type } = this.props;
    const { data: { data: { fakeData } } } = this.props.store;
    if (!fakeData || typeof fakeData[name] === 'undefined') return null;
    return (
      <div>
        <FormControlLabel
          control={
           <Switch checked={fakeData[name]} onChange={this.change(name)} value={fakeData[name]} />
         }
          label={name}
        />
      </div>
    );
  }
}

BooleanField.defaultProps = {
  type: 'text',
  name: '',
};

BooleanField.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  type: PropTypes.string,
  name: PropTypes.string,
};

export default withRouter(withStyles(styles)(BooleanField));
