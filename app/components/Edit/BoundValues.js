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
class BoundValues extends React.Component {
  state = {
    open: false,
    render: 1,
  };

  componentDidMount() {
    this.init();
  }

  init = async () => {
    const { data: { update } } = this.props.store;
    const { query: { projectID } } = this.props.router;
    const res = await fetchDatas({ projectID, limit: 25 });
    if (res.success) {
      update('datas', res.datas.docs);
    }
  }

  bindNodeToData = (boundDataModel) => {
    const { node } = this.props;
    const { data: { datas, updateData }, page: { update } } = this.props.store;
    let d = null;
    for (let i = 0; i < datas.length; i++) {
      if (datas[i]._id === boundDataModel) d = datas[i];
    }
    if (d) {
      const newValue = { model: d.name, field: '', id: d._id, type: d.type };
      node.updateProps('boundValue', newValue);
      updateData('data', d);
      update('render', new Date().getTime());
    }
  }

  handleClose = () => {
    if (!this.state.open && this.props.autoBindModel) {
      this.bindNodeToData(this.props.autoBindModel);
    }
    this.setState({ open: !this.state.open });
  }

  selectField = (model, field, id, data) => (e) => {
    const { data: { datas } } = this.props.store;
    const { snack: { snacky }, page: { update } } = this.props.store;
    const { node } = this.props;

    const dataObjs = {};
    datas.forEach(d => dataObjs[d.id] = d);
    if (data && node.type === 'Date/Time' && data.model[field].type !== 'date') {
      return snacky('You must bind to a date field', 'error', 9000);
    }
    if (data && node.type === 'Slider' && data.model[field].type !== 'number') {
      return snacky('You must bind to a number field', 'error', 9000);
    }
    if (data && node.type === 'Switch' && data.model[field].type !== 'boolean') {
      return snacky('You must bind to a Yes/No (Boolean) field', 'error', 9000);
    }

    // file upload. Allow to bind to text and relation hasOne or hasMany
    if (node.type === 'File Upload' && field === 'id') {
      return snacky('You must bind to a text field or a relation', 'error', 9000);
    }
    if (data && node.type === 'File Upload' && data.model[field].type !== 'text' && data.model[field].type !== 'relation' && data.model[field].type !== 'array') {
      return snacky('You must bind to a text field, array (multiple), or a relation', 'error', 9000);
    }

    if (data && data.model && data.model[field].type === 'relation') {
      node.updateProps('boundValue', {
        model,
        field,
        id,
        relationField: '',
        relationModel: data.model[field].model,
        relationModelName: dataObjs[data.model[field].model] ? dataObjs[data.model[field].model].name : '',
        modelRelationType: data.model[field].modelRelationType,
        type: 'relation',
        virtual: data.model[field].virtual ? true : false
      });
      if (!this.props.showVirtual) {
        this.handleClose();
      }

    } else {
      let type = '';
      if (data && data.model && data.model[field] && data.model[field].type) type = data.model[field].type;
      node.updateProps('boundValue', { model, field, id, type });
      this.handleClose();
    }
    update('render', new Date().getTime());
    this.setState({ render: new Date().getTime() })
  }

  selectRelation = (model, field, id, data) => (e) => {
    const { node } = this.props;
    const { page: { update }, snack: { snacky } } = this.props.store;

    // file upload. Allow to bind to text and relation hasOne or hasMany
    if (node.type === 'File Upload' && field === 'id') {
      return snacky('You must bind to a text field or a relation', 'error', 9000);
    }
    if (node.type === 'File Upload' && data.model[field].type !== 'text' && data.model[field].type !== 'relation') {
      return snacky('You must bind to a text field or a relation', 'error', 9000);
    }

    const boundClone = Object.assign({}, node.props.boundValue);
    boundClone.relationField = field;
    node.updateProps('boundValue', boundClone);
    this.handleClose();
    update('render', new Date().getTime());
    this.setState({ render: new Date().getTime() });
  }


  render() {
    const { classes, router, node, autoBindModel, showVirtual } = this.props;
    const { page: { render } } = this.props.store;
    return (
      <div>
        {node.props.boundValue && node.props.boundValue.model && (
          <div>
            <Typography variant="overline">
              Bound To: {node.props.boundValue.model} - {node.props.boundValue.field}
              {node.props.boundValue.type === 'relation' ? ' Relation: ' : ''}
              {node.props.boundValue.relationModelName ? ` ${node.props.boundValue.relationModelName}` : ''}
              {node.props.boundValue.relationField ? ` ${node.props.boundValue.relationField}` : ''}
            </Typography>
          </div>
        )}
        <div>
          <Button onClick={this.handleClose}>
            {this.props.title || 'Bind Value'}
          </Button>
        </div>
        <div>
          <Dialog open={this.state.open} onClose={this.handleClose} aria-labelledby="form-dialog-title">
            <DialogTitle>Bind To Data</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Select the data field to bind this element to
              </DialogContentText>

              {this.state.render > 0 && render > 0 && (
                <DataFields
                  showForm={false}
                  showDelete={false}
                  isButton={true}
                  showVirtual={this.props.showVirtual}
                  onClick={this.selectField}
                  node={node}
                  relationClick={this.selectRelation}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose} color="primary" variant="outlined">
                Cancel
              </Button>
              <Button onClick={this.selectField('', '', '', '')} color="primary" variant="contained">
                Clear Bound Value
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    );
  }
}

BoundValues.defaultProps = {
  showVirtual: false
};

BoundValues.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  node: PropTypes.object.isRequired,
  showVirtual: PropTypes.bool,
};

export default withRouter(withStyles(styles)(BoundValues));
