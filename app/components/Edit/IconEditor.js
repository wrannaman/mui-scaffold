import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { Typography, Divider, TextField, FormLabel, FormControlLabel, RadioGroup, Radio, Paper, Switch, FormGroup, Button } from '@material-ui/core';
import Styler from './Styler';
import SmallRadioGroup from './SmallRadioGroup';

import SearchIcons from '../Icons/SearchIcons';

const styles = theme => ({
  root: {
  },
  dense: {
    marginLeft: 10
  },
  textField: {
    width: 250,
  }
});


const radioProps = [
  // { name: 'Align', littleName: 'align', values: ['inherit', 'left', 'center', 'right', 'justify'] },
  { name: 'Color', littleName: 'color', values: ['default', 'primary', 'secondary'] },
  { name: 'Font Size', littleName: 'fontSize', values: ['default', 'outlined'] },
];

const boolProps = [
  // {name: 'Disabled', littleName: 'disabled'},
  // {name: 'Clickable', littleName: 'clickable'},
  // {name: 'Container', littleName: 'container'},
  // {name: 'No Wrap', littleName: 'noWrap'},
];

@inject('store')
@observer
class ButtonEditor extends React.Component {

  state = {
    openDialog: false,
  }

  toggleDialog = (e) => {
    this.setState({ openDialog: !this.state.openDialog });
  }

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

  handleIconSelected = (icon) => (e) => {
    this.handleChange('icon')({ target: { value: icon.key }});
    this.toggleDialog();

  }

  render() {
    const { node, classes } = this.props;
    const { page: { update, render } } = this.props.store;
    return (
      <div>
        {boolProps.map((item) => (
          <div key={item.name}>
            <FormGroup row>
               <FormControlLabel
                 control={
                   <Switch
                     checked={node.props[item.littleName]}
                     onChange={this.handleChange(item.littleName, true)}
                     value={item.littleName}
                   />
                 }
                 label={item.name}
               />
           </FormGroup>
          </div>
        ))}
        {radioProps.map((item) => (
          <SmallRadioGroup
            item={item}
            node={node}
            onChange={this.handleChange(item.littleName)}
          />
        ))}
        <Divider />
        <Styler node={node} />
        <Divider />
        <Typography>
          Selected: {node.props.icon}
        </Typography>
        <Button onClick={this.toggleDialog}>
          Select Icon
        </Button>
        <SearchIcons
          openDialog={this.state.openDialog}
          onClose={this.toggleDialog}
          handleClickOpen={this.handleIconSelected}
        />
      </div>
    );
  }
}

ButtonEditor.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(ButtonEditor));
