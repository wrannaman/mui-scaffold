import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { FormLabel, FormControlLabel, RadioGroup, Radio, Paper, Switch, FormGroup, Button } from '@material-ui/core';
import Styler from './Styler';

const styles = theme => ({
  root: {
  },
  dense: {
    marginLeft: 10
  }
});


const radioProps = [];

const boolProps = [
  {name: 'Show Time', littleName: 'showTime'},
  // {name: 'Container', littleName: 'container'},
];

@inject('store')
@observer
class GridEditor extends React.Component {

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
    const { page: { update, render }, repeatable: { repeatables, workingIndex } } = this.props.store;

    const rep = repeatables[workingIndex];
    if (rep && rep.type === 'form' && boolProps.filter(b => b.littleName === 'required').length === 0) {
      boolProps.push({ name: 'Required', littleName: 'required' })
    }
    
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
          <div key={item.name} className={classes.dense}>
            <FormLabel>{item.name}</FormLabel>
            <RadioGroup
              name={item.littleName}
              aria-label={item.littleName}
              value={node.props[item.littleName]}
              onChange={this.handleChange(item.littleName)}
              row
            >
              {item.values.map(value => (
                <FormControlLabel
                  key={value}
                  value={value}
                  control={<Radio style={{ padding: 0 }}/>}
                  label={value}
                  margin="dense"
                  style={{ padding: 0 }}
                />
              ))}
            </RadioGroup>
          </div>
        ))}
        <Styler node={node} />
      </div>
    );
  }
}

GridEditor.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(GridEditor));
