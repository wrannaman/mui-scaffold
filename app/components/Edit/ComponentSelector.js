import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import _ from "lodash";

import { getDefaultProps } from '../../utils/render';

const components = ['image', 'typography', 'button', 'checkbox', 'date/time', 'radio', 'select', 'slider', 'switch', 'textField'];

const styles = theme => ({
  root: {
  },
  formControl: {
    width: 200,
  }
});

@inject('store')
@observer
class ComponentSelector extends React.Component {
  state = {};

  handleChange = (type, index) => (e) => {
    const { store: { page: { update, layoutMap } } } = this.props;
    const clone = Object.assign({}, toJS(layoutMap));
    clone[index][type] = e.target.value;

    if (type === 'component') {
      const props = getDefaultProps(_.capitalize(e.target.value));
      clone[index] = { ...clone[index], ...props };
      update('layoutMap', clone);
    }


    update('layoutMap', clone);
  }

  render() {
    const { classes, router, item, store: { page: { layoutMap } } } = this.props;
    if (!layoutMap[item.index]) return (null)
    return (
      <div>
        <div>
          <FormControl className={classes.formControl}>
           <InputLabel id="container-select-label">Container</InputLabel>
           <Select
             labelId="container-select-label"
             id="container-select"
             value={layoutMap[item.index].container}
             onChange={this.handleChange('container', item.index)}
           >
             <MenuItem value={'grid'}>Grid</MenuItem>
             <MenuItem value={'paper'}>Paper</MenuItem>
           </Select>
         </FormControl>
        </div>
       <div>
         <FormControl className={classes.formControl}>
          <InputLabel id="component-select-label">Component</InputLabel>
          <Select
            labelId="component-select-label"
            id="component-select"
            value={layoutMap[item.index].component}
            onChange={this.handleChange('component', item.index)}
          >
            {components.map(c => (<MenuItem key={c} value={c}>{_.capitalize(c.toLowerCase())}</MenuItem>))}
          </Select>
        </FormControl>
       </div>
      </div>
    );
  }
}

ComponentSelector.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(ComponentSelector));
