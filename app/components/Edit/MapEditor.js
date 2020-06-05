import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { FormControl, InputLabel, Select, MenuItem, Divider, TextField, IconButton, Fab, TableRow, TableHead, TableCell, TableBody, Table, FormLabel, FormControlLabel, RadioGroup, Radio, Switch, FormGroup } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

import Styler from './Styler';
import SmallRadioGroup from './SmallRadioGroup';
import DataFieldsAsSelect from '../Data/DataFieldsAsSelect';
import DataModelsAsSelect from '../Data/DataModelsAsSelect';

const styles = theme => ({
  root: {
  },
  dense: {
    marginLeft: 10
  }
});


const radioProps = [
  // { name: 'Orientation', littleName: 'orientation', values: ["horizontal", "vertical"] },
  // { name: 'Value Label Dispay', littleName: 'valueLabelDisplay', values: ['on', 'auto', 'off'] },
  // { name: 'Small', littleName: 'sm', values: [0, 2, 4, 6, 8, 10, 12] },
  // { name: 'Medium', littleName: 'md', values: [0, 2, 4, 6, 8, 10, 12] },
  // { name: 'Small', littleName: 'xs', values: [0, 2, 4, 6, 8, 10, 12] },
];

const boolProps = [
  {name: 'Cluster Markers', littleName: 'cluster'},
  {name: 'Info Window', littleName: 'infoWindow'},
  // {name: 'Container', littleName: 'container'},
];

@inject('store')
@observer
class MapEditor extends React.Component {

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

  onFieldChange = (propName, isModel = false) => (field) => {
    const { page: { update } } = this.props.store;
    const { node } = this.props;
    if (isModel) {
      node.updateProps('boundDataModelID', field && field.id ? field.id : field);
      node.updateProps('boundDataModel', field && field.name ? field.name : field);

    } else {
      node.updateProps(propName, field);

    }
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
          <SmallRadioGroup
            item={item}
            node={node}
            onChange={this.handleChange(item.littleName)}
          />
        ))}

        <Divider />
        <TextField
          className={classes.textField}
          value={node.props.width}
          label={"Width"}
          onChange={this.handleChange('width')}
          margin="normal"
        />
        <Divider />
        <TextField
          label="Height"
          className={classes.textField}
          value={node.props.height}
          onChange={this.handleChange('height')}
          margin="normal"
        />
        <Divider />
        <TextField
          type="number"
          label="Center Latitude"
          className={classes.textField}
          value={node.props.lat}
          onChange={this.handleChange('lat')}
          type="number"
          margin="normal"
        />
        <Divider />
        <TextField
          label="Center Longitude"
          className={classes.textField}
          value={node.props.lng}
          onChange={this.handleChange('lng')}
          type="number"
          margin="normal"
        />
        <Divider />
        <TextField
          label="Marker Image URL"
          className={classes.textField}
          value={node.props.markerImage}
          onChange={this.handleChange('markerImage')}
          margin="normal"
        />
        {false && node.props.cluster && (
          <TextField
            label="Cluster Image URL"
            className={classes.textField}
            value={node.props.clusterImage}
            onChange={this.handleChange('clusterImage')}
            margin="normal"
          />
        )}
        <Divider />
        <TextField
          label="Zoom"
          className={classes.textField}
          value={node.props.zoom}
          onChange={this.handleChange('zoom')}
          type="number"
          margin="normal"
        />

        {node.props.infoWindow && (
          <React.Fragment>
            <Divider />
            <FormControl className={classes.formControl} style={{ width: '100%' }}>
             <InputLabel htmlFor="newValue">Info Component</InputLabel>
             <Select
               value={node.props.infoWindowComponent}
               onChange={this.handleChange('infoWindowComponent')}
               inputProps={{
                 name: 'infoWindowComponent',
               }}
             >
               {repeatables.map(r => (<MenuItem value={r._id}>{r.name}</MenuItem>))}
               <MenuItem value={''} disabled>None</MenuItem>
             </Select>
            </FormControl>
          </React.Fragment>
        )}

        <DataModelsAsSelect
          onModelChange={this.onFieldChange('boundDataModelID', true)}
          id={node.props.boundDataModelID}
          title={'Select Data Model'}
          nav={false}
        />

        {rep && rep.boundDataModelID && (
          <React.Fragment>
            <DataFieldsAsSelect
              onFieldChange={this.onFieldChange('latField')}
              model={rep.boundDataModelID}
              value={node.props.latField}
              title={'Select Lat Field'}
            />
            <DataFieldsAsSelect
              onFieldChange={this.onFieldChange('lngField')}
              model={rep.boundDataModelID}
              value={node.props.lngField}
              title={'Select Lat Field'}
            />
            <DataFieldsAsSelect
              onFieldChange={this.onFieldChange('title')}
              model={rep.boundDataModelID}
              value={node.props.title}
              title={'Marker Title'}
            />
          </React.Fragment>
        )}

        <Styler node={node} />
      </div>
    );
  }
}

MapEditor.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(MapEditor));
