import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';

import { Button, Typography } from '@material-ui/core';

import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DataModels from '../Data/DataModels';
import DataFields from '../Data/DataFields';

const styles = theme => ({
  root: {
  },
});

import { fetchDatas } from '../../src/apiCalls/data';

@inject('store')
@observer
class BoundPageModel extends React.Component {
  state = {
    open: false,
  };

  componentDidMount() {
    this.init()
  }

  init = async () => {
    const { data: { update } } = this.props.store;
    const { query: { projectID } } = this.props.router;
    const res = await fetchDatas({ projectID, limit: 25 });
    if (res.success) {
      update('datas', res.datas.docs);
    }
  }

  handleClose = () => {
    this.setState({ open: !this.state.open })
  }

  selectModel = (data = "") => {
    const { page: { update } } = this.props.store;
    update('boundDataModel', data.id);
    this.handleClose();
  }

  getPrettyDataName = (datas, boundDataModel) => {
    let d = null;
    for (let i = 0; i < datas.length; i++) {
      if (datas[i]._id === boundDataModel) d = datas[i]
    }
    return d ? d.name : 'not found'
  }

  render() {
    const { classes, router } = this.props;
    const { page: { boundDataModel, }, data: { datas } } = this.props.store;
    return (
      <div style={{ width: '100%' }}>
        {boundDataModel && boundDataModel && (
          <div>
            <Typography variant="overline">
              Bound To: {boundDataModel ? this.getPrettyDataName(datas, boundDataModel) : 'none' }
            </Typography>
          </div>
        )}
        <div>
          <Button onClick={this.handleClose}>
            Bind Page Data Model
          </Button>
        </div>
        <div>
          <Dialog open={this.state.open} onClose={this.handleClose} aria-labelledby="form-dialog-title">
          <DialogTitle>Bind To Data</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Select the data model to bind this page to
            </DialogContentText>
            <DataModels
              showForm={false}
              showDelete={false}
              onModelChange={this.selectModel}
              isButton={true}
              preventSelection={true}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary" variant="outlined">
              Cancel
            </Button>
            <Button onClick={this.selectModel} color="primary" variant="contained">
              Clear Bound Value
            </Button>
          </DialogActions>
        </Dialog>
        </div>
      </div>
    );
  }
}

BoundPageModel.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  node: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(BoundPageModel));
