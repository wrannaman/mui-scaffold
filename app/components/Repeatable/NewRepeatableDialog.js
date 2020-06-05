import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';

import { saveRepeatable, fetchRepeatables } from '../../src/apiCalls/repeatable';

const styles = theme => ({
  root: {
  },
  flexRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});

@inject('store')
@observer
class NewPageDialog extends React.Component {
  state = {
    name: '',
    selected: '',
  };

  submit = async (e) => {
    e.preventDefault();
    const { name, selected } = this.state;
    const { router: { query: { pageID, projectID, repeatableID } } } = this.props;
    const { snack: { snacky }, repeatable: { repeatables, nodes, update }, project: { updateProject } } = this.props.store;

    const opts = { boundDataModel: '', boundDataModelID: '' };
    for (let i = 0; i < repeatables.length; i++) {
      if (repeatables[i]._id === selected) {
        opts.boundDataModel = repeatables[i].boundDataModel;
        opts.boundDataModelID = repeatables[i].boundDataModelID;
        opts.name = repeatables[i].name;
        break;
      }
    }
    // const toJSON = nodes.toJSON();
    const res = await saveRepeatable({ project: projectID, cloneFrom: selected, ...opts, name });
    if (res.success) {
      const repeat = await fetchRepeatables({ project: projectID })
      if (repeat.repeatables) update('repeatables', repeat.repeatables)
      snacky('saved');
      update('showNewRepeatableDialog', false);
      if (repeat.repeatables.length > 0) update('workingIndex', 0)
      if (!repeatableID) {
        Router.push({ pathname: '/component', query: { projectID, repeatableID: repeat.repeatables[0].id }, shallow: true });
      }
      update('render', new Date().getTime())
      this.setState({ name: '', selected: '' });
    } else {
      snacky('error! ', 'error');
    }
  }

  handleClose = () => {
    const { repeatable: { update } } = this.props.store;
    update('showNewRepeatableDialog', false);
  }

  render() {
    const { repeatable: { repeatables, showNewRepeatableDialog }, project: { pageIndex, project: { pages } } } = this.props.store;
    const { classes, router } = this.props;
    if (!showNewRepeatableDialog) return null;
    return (
      <Dialog open={showNewRepeatableDialog} onClose={this.handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Create A New Component</DialogTitle>
        <form onSubmit={this.submit}>
        <DialogContent>
          <DialogContentText>
            {"Name your new component, and (optionally) select if you'd like to clone from another component"}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="New Repeatable Name"
            value={this.state.name}
            onChange={(e) => this.setState({ name: e.target.value.replace(/[^A-Za-z]/g, '') })}
            type="text"
          />
          {repeatables.length > 0 && (
            <div style={{ marginTop: 15 }}>
              <InputLabel htmlFor="clone">Clone From</InputLabel>
              <Select
                value={this.state.selected}
                onChange={(e) => this.setState({ selected: e.target.value })}
                variant={'outlined'}
                classes={{ icon: classes.icon }}
                style={{ marginTop: 5 }}
                inputProps={{
                  name: 'clone',
                }}
              >
              {repeatables.map((repeatable) => (<MenuItem key={repeatable._id} value={repeatable._id}>{repeatable.name}</MenuItem>))}
              <MenuItem value="">None</MenuItem>

              </Select>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleClose} color="primary">
            Cancel
          </Button>
          <Button type="submit" color="primary" variant="contained" disabled={!this.state.name}>
            Create Component
          </Button>
        </DialogActions>
        </form>
      </Dialog>
    );
  }
}

NewPageDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(NewPageDialog));
