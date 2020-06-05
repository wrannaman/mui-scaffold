import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { TextField, Divider, FormControlLabel, Switch, FormGroup } from '@material-ui/core';
import Styler from './Styler';


import SmallRadioGroup from './SmallRadioGroup';
import BoundValues from './BoundValues';

const styles = theme => ({
  root: {
  }
});


const radioProps = [
  { name: 'Media Source', littleName: 'mediaSrc', values: ["video", "audio", "picture", "iframe", "img"] },
  // { name: 'Large View', littleName: 'lg', values: [0, 2, 4, 6, 8, 10, 12] },
  // // { name: 'Small', littleName: 'sm', values: [0, 2, 4, 6, 8, 10, 12] },
  // { name: 'Medium View', littleName: 'md', values: [0, 2, 4, 6, 8, 10, 12] },
  // { name: 'Small View', littleName: 'xs', values: [0, 2, 4, 6, 8, 10, 12] },
];

const boolProps = [
  // { name: 'Iterable', littleName: 'iterable'},
  // {name: 'Container', littleName: 'container'},
  // {name: 'Form', littleName: 'form'},
];

@inject('store')
@observer
class CardEditor extends React.Component {

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
    const { page: { update, render } } = this.props.store;
    return (
      <div>
        {render && (null)}
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
        {!node.props.iterable && (
          <div>
            <TextField
              label="Card Title"
              className={classes.textField}
              value={node.props.cardTitle}
              onChange={this.handleChange('cardTitle')}
              margin="normal"
            />
            <Divider />

            <TextField
              label="Card SubHeader"
              className={classes.textField}
              value={node.props.cardSubheader}
              onChange={this.handleChange('cardSubheader')}
              margin="normal"
            />
            <Divider />

            <TextField
              label="Media URL"
              className={classes.textField}
              value={node.props.mediaURL}
              onChange={this.handleChange('mediaURL')}
              margin="normal"
            />
            <Divider />
          </div>
        )}

        {false && (<BoundValues node={node} />)}
        <Styler node={node} />
      </div>
    );
  }
}

CardEditor.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(CardEditor));
