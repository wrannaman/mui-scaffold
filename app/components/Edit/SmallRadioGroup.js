import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';

import { FormLabel, FormControlLabel, RadioGroup, Radio, Paper, Switch, FormGroup, Button } from '@material-ui/core';
import RadioButtonCheckedSharpIcon from '@material-ui/icons/RadioButtonCheckedSharp';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';


const styles = theme => ({
  dense: {
    marginLeft: 10
  },
  rootFormLabel: {
    fontSize: 10,
  },
  radioRoot: {
    padding: 0,
    marginLeft: 0,
    marginRight: 0,
    fontSize: 10,
    width: 15,
    paddingLeft: 0,
    paddingRight: 0,
  },
  radioLabel: {
    // color: 'red',
    // background: 'orange',
    marginLeft: 2,
    fontSize: 10,
  },
  radioLabelRoot: {
    // color: 'green',
    // background: 'blue',
  }
});

@inject('store')
@observer
class SmallRadioGroup extends React.Component {
  state = {};

  render() {
    const { classes, router, item, node } = this.props;
    return (
      <div key={item.name} className={classes.dense}>
        <FormLabel classes={{ root: classes.rootFormLabel }}>{item.name}</FormLabel>
        <RadioGroup
          name={item.littleName}
          aria-label={item.name}
          value={node.props[item.littleName]}
          onChange={this.props.onChange}
          row
          style={{ marginLeft: 5 }}
        >
          {item.values.map(value => (
            <FormControlLabel
              key={value}
              value={value}
              control={
                <Radio
                  classes={{
                    root: classes.radioRoot,

                  }}
                  icon={<RadioButtonUncheckedIcon fontSize="small" />}
                  checkedIcon={<RadioButtonCheckedSharpIcon fontSize="small" />}
                />
              }
              label={value}
              margin="dense"
              classes={{
                root: classes.radioLabelRoot,
                label: classes.radioLabel,
              }}
            />
          ))}
        </RadioGroup>
      </div>
    );
  }
}

SmallRadioGroup.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(SmallRadioGroup));
