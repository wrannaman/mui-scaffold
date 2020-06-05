import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';

export default class extends PureComponent {
  static defaultProps = {
    error: ''
  }
  static propTypes = {
    error: PropTypes.string
  }
  static displayName = 'StripeCardsSection';
  render() {
    return (
      <Typography>
        {this.props.error}
      </Typography>
    );
  }
}
