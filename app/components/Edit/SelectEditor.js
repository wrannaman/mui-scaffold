import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { Divider, IconButton, TextField, Fab, TableRow, TableHead, TableCell, TableBody, Table, FormLabel, FormControlLabel, RadioGroup, Radio, Switch, FormGroup } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

import DataModelsAsSelect from '../Data/DataModelsAsSelect';
import DataFieldsAsSelect from '../Data/DataFieldsAsSelect';
import Styler from './Styler';

const styles = theme => ({
  root: {
  },
  dense: {
    marginLeft: 10
  },
  smallFont: {
    fontSize: 10,
  },
  textField: {
    fontSize: 10,
  },
  closeButton: {
    fontSize: 10
  },
  inputRoot: {
    fontSize: 10,
    width: 70,
  },
  inputInput: {
    fontSize: 10,
  },
  smallTableCell: {
    padding: 0,
  },
});


const radioProps = [
  // { name: 'Spacing', littleName: 'spacing', values: [0, 2, 4, 6, 8, 10] },
  // { name: 'Color', littleName: 'color', values: ['primary', 'secondary', 'default'] },
  // { name: 'Small', littleName: 'sm', values: [0, 2, 4, 6, 8, 10, 12] },
  // { name: 'Medium', littleName: 'md', values: [0, 2, 4, 6, 8, 10, 12] },
  // { name: 'Small', littleName: 'xs', values: [0, 2, 4, 6, 8, 10, 12] },
];

const boolProps = [
  // {name: 'Item', littleName: 'item'},
  // {name: 'Container', littleName: 'container'},
];

@inject('store')
@observer
class CheckboxEditor extends React.Component {

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

  changeItem = (name, item, index) => (e) => {
    const { page: { update } } = this.props.store;
    const { node } = this.props;
    const { items } = node.props;
    const clone = Array.from(items);
    clone[index][name] = e.target.value;
    node.updateProps('items', clone);
    update('render', new Date().getTime());
  }

  removeItem = (index) => (e) => {
    const { page: { update } } = this.props.store;
    const { node } = this.props;
    const { items } = node.props;
    const clone = Array.from(items);
    clone.splice(index, 1);
    node.updateProps('items', clone);
    update('render', new Date().getTime());
  }

  addItem = () => {
    const { page: { update } } = this.props.store;
    const { node } = this.props;
    const { items } = node.props;
    const clone = Array.from(items);
    clone.push({ value: "new", label: "new" });
    node.updateProps('items', clone);
    update('render', new Date().getTime());
  }

  onModelChange = (model) => {
    const { page: { update } } = this.props.store;
    const { node } = this.props;
    node.updateProps('sourceModel', model.id);
    node.updateProps('sourceModelName', model.name);
    update('render', new Date().getTime());
  }

  onFieldChange = (propName) => (field) => {
    const { page: { update } } = this.props.store;
    const { node } = this.props;
    node.updateProps(propName, field);
    update('render', new Date().getTime());
  }

  render() {
    const { node, classes } = this.props;
    const { page: { update, render }, repeatable: { repeatables, workingIndex } } = this.props.store;
    const { items, style } = node.props;

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
                  style={this.props.style}
                />
              ))}
            </RadioGroup>
          </div>
        ))}
        <div>
          <TextField
            label="Name"
            className={classes.textField}
            value={node.props.name}
            onChange={this.handleChange('name')}
            margin="normal"
          />
        </div>
        <div>
          <Table className={classes.table} size="small">
             <TableHead>
               <TableRow>
                 <TableCell size="small" className={classes.smallFont} classes={{ sizeSmall: classes.smallTableCell }}>Name</TableCell>
                 <TableCell size="small" className={classes.smallFont} classes={{ sizeSmall: classes.smallTableCell }}>Value</TableCell>
                 <TableCell size="small" className={classes.smallFont} classes={{ sizeSmall: classes.smallTableCell }}>Action</TableCell>
               </TableRow>
             </TableHead>
             <TableBody>
              {items.map((key, i) => (
                <TableRow key={key.name + key.value}>
                  <TableCell align="right" size="small" className={classes.smallFont} classes={{ sizeSmall: classes.smallTableCell }}>
                    <TextField
                      value={key.label}
                      onChange={this.changeItem('label', key, i)}
                      label={'Label'}
                      InputProps={{ style: { fontSize: 10 }}}
                      margin="dense"
                      autoFocus={true}
                    />
                  </TableCell>

                  <TableCell align="right" size="small" className={classes.smallFont} classes={{ sizeSmall: classes.smallTableCell }}>
                    <TextField
                      value={key.value}
                      onChange={this.changeItem('value', key, i)}
                      label={'Value'}
                      InputProps={{ style: { fontSize: 10 }}}
                      margin="dense"
                      autoFocus={true}
                    />
                  </TableCell>
                  <TableCell align="right" size="small" className={classes.smallFont} classes={{ sizeSmall: classes.smallTableCell }}>
                    <IconButton
                      className={classes.closeButton}
                      aria-label="delete"
                      onClick={this.removeItem(i)}
                    >
                      <HighlightOffIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
             </TableBody>
          </Table>
          <div>
            <Fab
              size="small"
              color="secondary"
              aria-label="add"
              className={classes.margin}
              onClick={this.addItem}
            >
              <AddIcon />
            </Fab>
          </div>
        </div>
        <Styler node={node} />
        {rep && rep.type === 'form' && (
          <div style={{ marginTop: 10 }}>
            <Divider />
            <DataModelsAsSelect
              onModelChange={this.onModelChange}
              showDelete={false}
              showForm={false}
              nav={false}
              id={node.props.sourceModel}
              title={'Data Source Model'}
              preventSelection={true}
            />
            <DataFieldsAsSelect
              onFieldChange={this.onFieldChange('sourceModelField')}
              model={node.props.sourceModel}
              value={node.props.sourceModelField}
              title={'Select Value'}
            />
            <DataFieldsAsSelect
              onFieldChange={this.onFieldChange('sourceModelFieldDisplay')}
              model={node.props.sourceModel}
              value={node.props.sourceModelFieldDisplay}
              title={'Select Display Name'}
            />
          </div>
        )}
      </div>
    );
  }
}

CheckboxEditor.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(CheckboxEditor));
