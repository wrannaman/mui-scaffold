import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import {  Divider, TextField, FormLabel, FormControlLabel, RadioGroup, Radio, Paper, Switch, FormGroup, Button } from '@material-ui/core';

import Styler from './Styler';
import BoundValues from './BoundValues';

const styles = theme => ({
  root: {
  },
});

const boolProps = [
  // {name: 'Show All', littleName: 'showAll'},
  // {name: 'Container', littleName: 'container'},
  // {name: 'No Wrap', littleName: 'noWrap'},
];

@inject('store')
@observer
class RepeatableEditor extends React.Component {

  handleChange = (propName, checked = false) => (e) => {
    const { page: { update } } = this.props.store;
    const { node } = this.props;
    let v = e.target.value;
    if (v && !isNaN(Number(v))) v = Number(v);
    if (checked) {
      v = e.target.checked;
    }
    node.updateProps(propName, v);
    update('render', new Date().getTime());
  }

  render() {
    const { node, classes } = this.props;
    const { page: { type, update, render } } = this.props.store;

    return (
      <div>
        {false && type === 'detail' && (<BoundValues node={node} />)}
      </div>
    );
  }
}

RepeatableEditor.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(RepeatableEditor));
