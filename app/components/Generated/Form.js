import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { Typography, Button } from '@material-ui/core';

import TextField from './TextField';
import DateTime from './DateTime';
import BooleanField from './BooleanField';
import DragSourceWrap from '../Shared/DragSource';
import FormDropArea from './FormDropArea';
import ComponentTypes from '../Component/ComponentTypes';

const styles = theme => ({
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

@inject('store')
@observer
class Form extends React.Component {
  state = {};

  generateForm = (model) => {
    const { classes } = this.props;
    const keys = Object.keys(model);
    const fields = keys.map((key) => {
      switch (model[key]) {
        case 'text':
        case 'number':
          return (
            <DragSourceWrap
              name={key}
              className={classes.row}
              extras={true} >
              <TextField name={key} type={model[key]} key={key} />
            </DragSourceWrap>
          );
        case 'date':
          return (
            <DragSourceWrap
              name={key}
              className={classes.row}
              extras={true} >
              <DateTime name={key} key={key} />
            </DragSourceWrap>
          );
        case 'boolean':
          return (
            <DragSourceWrap
              name={key}
              className={classes.row}
              extras={true} >
              <BooleanField name={key} key={key} />
            </DragSourceWrap>
          );
        default:
          return (<Typography key={key}>nothing yet for {model[key]}</Typography>);
      }
    });
    return (fields);
  }

  render() {
    const { classes, router } = this.props;
    const { data: { data } } = this.props.store;

    return (
      <div>
        <ComponentTypes type="form" />
        <FormDropArea />
        <div>
          <Typography variant="h5">
            Form Elements
          </Typography>
          <div className={classes.row}>
            {this.generateForm(data.model)}
          </div>
        </div>
      </div>
    );
  }
}

Form.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Form));
