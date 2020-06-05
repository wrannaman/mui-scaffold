import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import _ from 'lodash';
import { MenuItem, Select, InputLabel, FormControl, FormLabel, FormGroup, Checkbox, TextField, FormControlLabel, Switch, Typography, Grid, Paper, TablePagination, IconButton, Tooltip } from '@material-ui/core';
import RepeatableStyler from './RepeatableStyler';
import DragSource from '../Shared/DragSource';
import EditIcon from '@material-ui/icons/Edit';

import Search from './Search';

const styles = theme => ({
  root: {
  },
});

import { fetchDataItems } from '../../src/apiCalls/dataItem';


@inject('store')
@observer
class RepeatablePreview extends React.Component {
  state = {
    rowsPerPage: 5,
    page: 0,
    data: [],
    dataChange: false,
  };

  componentDidMount() {
    const { nodes, repeatable } = this.props;
    const { repeatable: { setPreviewNodes } } = this.props.store;
    if (!nodes) {
      // we're in a node render
      setPreviewNodes(repeatable);
      // return setTimeout(() => {
      //   this.fetchData();
      // }, 3000)
    }
    this.fetchData();
  }

  componentWillUpdate(nextProps) {
    const { page: { nodes }, repeatable: { setPreviewNodes } } = this.props.store;
    if (JSON.stringify(nextProps.store.page.nodes.toJSON()) === this.prev) return;
    if (!nextProps.nodes) {
      this.prev = JSON.stringify(nextProps.store.page.nodes.toJSON());
      setPreviewNodes({ ...nextProps.repeatable, node: nextProps.store.page.nodes.toJSON() });
    }
  }

  transformDataItems = (dataItems) => {
    const d = [];
    dataItems.forEach(item => {
      d.push({ ...item, ...item.item })
    })
    return d
  }

  fetchData = async (page = 0, pageSize = 5, orderBy = null, filters = [], totalCount = 0, orderDirection = '') => {
    this.setState({ dataChange: false });
    const { repeatable, router: { query: { projectID } } } = this.props;
    const { data: { data: { id } } } = this.props.store;

    if (!id && !repeatable.boundDataModelID) return;
    if (orderBy) orderBy = JSON.stringify(orderBy)
    if (filters.length > 0) filters = JSON.stringify(filters)

    const data = await fetchDataItems({
      data: id ? id : repeatable.boundDataModelID,
      project: projectID,
      orderBy,
      filters,
      totalCount,
      pageSize,
      page,
      orderDirection
    });
    let stateUpdate = {};
    if (data && data.dataItems && data.dataItems.docs) {
      stateUpdate = {
        data: this.transformDataItems(data.dataItems.docs),
        page: (data.dataItems.offset || 0) / data.dataItems.limit,
        totalCount: data.dataItems.totalDocs,
        rowsPerPage: pageSize,
      };
    } else {
      stateUpdate = {
        data: [],
        page: 0,
        totalCount: 0,
        rowsPerPage: pageSize,
      };
    }
    this.setState(stateUpdate, () => {
      this.setState({ dataChange: true });
    });
  }

  onChangePage = (e, page) => {
    this.fetchData(page)
  }

  onChangeRowsPerPage = (e) => {
    this.fetchData(this.state.page, e.target.value);
  }

  edit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { page: { update } } = this.props.store
    update('editing', this.props.id);
  }

  beginDrag = (nodeID) => (e) => {
    const { page: { update } } = this.props.store;
    update('dragging', nodeID);
  }

  endDrag = (nodeID) => (e) => {
    const { page: { update } } = this.props.store;
    update('dragging', false);
  }

  updateSettings = (setting, checked = false) => (e) => {
    const { repeatable: { repeatables, update, workingIndex }, page: { updatePage } } = this.props.store;
    const repeat = toJS(repeatables);
    const clone = toJS(repeat[workingIndex]);
    if (!clone.settings) clone.settings = { filterFields: {}, searchFields: {}, constraintFields: {}, constraints: {} };
    if (checked) clone.settings[setting] = e.target.checked;
    else clone.settings[setting] = e.target.value;
    repeat[workingIndex] = clone;
    update('repeatables', repeat);
    setTimeout(() => {
      updatePage('render', new Date().getTime());
    });
  }
  updateSearchFields = (setting, field, checked = true) => (e) => {
    const { repeatable: { repeatables, update, workingIndex }, page: { updatePage } } = this.props.store;
    const repeat = toJS(repeatables);
    const clone = toJS(repeat[workingIndex]);
    if (!clone.settings) clone.settings = { filterFields: {}, searchFields: {}, constraintFields: {}, constraints: {} };
    if (!clone.settings.filterFields) clone.settings.filterFields = {};
    if (!clone.settings.searchFields) clone.settings.searchFields = {};
    if (!clone.settings.constraintFields) clone.settings.constraintFields = {};
    if (!clone.settings.constraints) clone.settings.constraints = {};
    if (checked && !clone.settings[setting]) clone.settings[setting] = {};
    if (checked) clone.settings[setting][field] = typeof clone.settings[setting][field] !== 'undefined' ? !clone.settings[setting][field] : true;
    else clone.settings[setting][field] = e.target.value;

    // true up the constraintFields and the constraints
    Object.keys(clone.settings.constraintFields).forEach(c => {
      if (clone.settings.constraints[c] && !clone.settings.constraintFields[c]) delete clone.settings.constraints[c];
    });

    repeat[workingIndex] = clone;
    update('repeatables', repeat);
    setTimeout(() => {
      updatePage('render', new Date().getTime());
    }, 300);
  }

  render() {
    const { rowsPerPage, page, data, totalCount, dataChange } = this.state;
    const { showStyler, classes, router, repeatable, nodes } = this.props;
    if (!repeatable.settings) repeatable.settings = { search: false, searchFields: {}, emptyText: '' };
    if (!repeatable.settings.searchFields) repeatable.settings.searchFields = {};

    const {
      page: { editing, render },
      repeatable: { previewNodes },
      data: { datas },
    } = this.props.store;
    const isEditing = editing === this.props.id;
    const editingStyles = { border: '1px solid #5130a4', position: 'relative' };
    let model = datas.filter(d => d._id === repeatable.boundDataModelID);
    if (model && model.length === 1) model = model[0]
    else model = null;

    const ele = (
      <div onClick={this.edit} style={{ position: 'relative' }}>
        {showStyler && (
          <Grid container spacing={4} style={{ marginBottom: 25, marginTop: 25 }}>
            <Grid item xs={12} sm={6}>
              <Paper style={{ padding: 25, minHeight: 207 }}>
                <Typography variant="h6">
                  Repeatable Styler
                </Typography>
                <Typography variant="body1">
                  Style the element enclosing your repeatable
                </Typography>
                <RepeatableStyler />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper style={{ padding: 25,  minHeight: 207 }}>
                <Typography variant="h6">
                  Repeatable Options
                </Typography>
                <div style={{ marginTop: 25, marginBottom: 15 }}>
                  <FormGroup row >
                     <FormControlLabel
                       control={
                         <Switch
                           checked={repeatable.settings.search ? true : false}
                           onChange={this.updateSettings('search', true)}
                         />
                       }
                       label={"Make Searchable"}
                     />
                  </FormGroup>
                  {model && repeatable.settings.search && render > 0 && (
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Searchable Fields</FormLabel>
                      <FormGroup aria-label="searchFields" name="searchFields" row>
                        {Object.keys(model.model).length > 0 &&
                          Object.keys(model.model).map(fieldName => (
                            <FormControlLabel
                              key={fieldName}
                              label={_.capitalize(fieldName)}
                              control={
                                <Checkbox
                                  checked={repeatable.settings.searchFields[fieldName] ? true : false}
                                  onChange={this.updateSearchFields('searchFields', fieldName)}
                                  value={fieldName}
                                />
                              }
                            />
                          ))}
                      </FormGroup>
                    </FormControl>
                  )}
                </div>
                <div style={{ marginTop: 25, marginBottom: 15 }}>
                  <FormGroup row style={{ marginTop: 25, marginBottom: 15 }}>
                     <FormControlLabel
                       control={
                         <Switch
                           checked={repeatable.settings.filter ? true : false}
                           onChange={this.updateSettings('filter', true)}
                         />
                       }
                       label={"Make Filterable"}
                     />
                  </FormGroup>
                  {model && repeatable.settings.filter && render > 0 && (
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Filterable Fields</FormLabel>
                      <FormGroup aria-label="searchFields" name="searchFields" row>
                        {Object.keys(model.model).length > 0 &&
                          Object.keys(model.model).filter(fieldName => model.model[fieldName].type === 'enum').map(fieldName => (
                            <FormControlLabel
                              key={fieldName}
                              label={_.upperFirst(fieldName)}
                              control={
                                <Checkbox
                                  checked={repeatable.settings.filterFields && repeatable.settings.filterFields[fieldName] ? true : false}
                                  onChange={this.updateSearchFields('filterFields', fieldName)}
                                  value={fieldName}
                                />
                              }
                            />
                          ))}
                      </FormGroup>
                    </FormControl>
                  )}
                </div>
                <div style={{ marginTop: 25, marginBottom: 15 }}>
                  <FormGroup row style={{ marginTop: 25, marginBottom: 15 }}>
                     <FormControlLabel
                       control={
                         <Switch
                           checked={repeatable.settings.constraint ? true : false}
                           onChange={this.updateSettings('constraint', true)}
                         />
                       }
                       label={"Add A Constraint"}
                     />
                  </FormGroup>
                  {model && repeatable.settings.constraint && render > 0 && (
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Constraint Fields</FormLabel>
                      <FormGroup aria-label="constraintFields" name="constraintFields" row>
                        {Object.keys(model.model).length > 0 &&
                          Object.keys(model.model).filter(fieldName => model.model[fieldName].type === 'enum').map(fieldName => (
                            <FormControlLabel
                              key={fieldName}
                              label={_.upperFirst(fieldName)}
                              control={
                                <Checkbox
                                  checked={repeatable.settings.constraintFields && repeatable.settings.constraintFields[fieldName] ? true : false}
                                  onChange={this.updateSearchFields('constraintFields', fieldName)}
                                  value={fieldName}
                                />
                              }
                            />
                          ))}
                      </FormGroup>
                    </FormControl>
                  )}
                  {repeatable.settings.constraint && repeatable.settings.constraintFields && Object.keys(repeatable.settings.constraintFields).length > 0 && (
                    Object.keys(repeatable.settings.constraintFields).filter(f => repeatable.settings.constraintFields[f]).map((f) => {
                      if (model && model.model && model.model[f] && model.model[f].enum && Array.isArray(model.model[f].enum)) {
                        return (
                          <div style={{ marginLeft: 15 }}>
                            <InputLabel htmlFor="constraints">{_.upperFirst(f)}</InputLabel>
                            <Select
                              value={repeatable.settings.constraints[f] || ""}
                              style={{ width: 150 }}
                              inputProps={{
                                name: 'constraints',
                              }}
                              onChange={this.updateSearchFields('constraints', f, false)}
                            >
                              {model.model[f].enum.map(e => <MenuItem key={e} value={e}>{_.upperFirst(e)}</MenuItem>)}
                            </Select>
                          </div>
                        );
                      }
                    })
                  )}
                </div>
                <div style={{ marginTop: 25, marginBottom: 15 }}>
                  <TextField
                    name="Empty Text"
                    placeholder="Empty Text"
                    helperText="Displayed when there are no results"
                    value={repeatable.settings.emptyText}
                    onChange={this.updateSettings('emptyText', false)}
                  />
                </div>
              </Paper>
            </Grid>
          </Grid>
        )}
        {render > 0 && (
          <React.Fragment>
            {!showStyler && (
              <Tooltip title={'Edit Repeatable (this only shows up while editing your project)'}>
                <IconButton
                  style={{ position: 'absolute', top: 0, left: 0, zIndex: 999 }}
                  aria-label="edit project"
                  onClick={this.edit}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}

            {repeatable && repeatable.settings && (
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
                {repeatable.settings.search && (<Search />)}
                {repeatable.settings.filter && repeatable.settings.filterFields && Object.keys(repeatable.settings.filterFields).length > 0 && (
                  Object.keys(repeatable.settings.filterFields).filter(f => repeatable.settings.filterFields[f]).map((f) => {
                    if (model && model.model && model.model[f] && model.model[f].enum && Array.isArray(model.model[f].enum)) {
                      return (
                        <div style={{ marginLeft: 15 }}>
                          <InputLabel htmlFor="filters">{_.upperFirst(f)}</InputLabel>
                          <Select
                            style={{ width: 150 }}
                            inputProps={{
                              name: 'filters',
                            }}
                          >
                            {model.model[f].enum.map(e => <MenuItem key={e} value={e}>{_.upperFirst(e)}</MenuItem>)}
                          </Select>
                        </div>
                      );
                    }
                  })
                )}
              </div>
            )}

            <div style={Object.assign(isEditing ? editingStyles : { position: 'relative' }, repeatable.styles ? repeatable.styles : {})}>

              {render > 0 && dataChange && data.map(d => {
                if (previewNodes && previewNodes[repeatable._id]) {
                  return previewNodes[repeatable._id].nodes.render(d, false);
                }
                return nodes.render(d, false);
              })}
            </div>
            <TablePagination
              onChangePage={this.onChangePage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              page={page}
              rowsPerPage={rowsPerPage}
              count={totalCount}
              onChangeRowsPerPage={this.onChangeRowsPerPage}
            />
          </React.Fragment>
        )}
      </div>
    );
    if (!this.props.__allowEdit) return ele;
    if (isEditing) {
      return (
        <div style={{ position: 'relative' }}>
          <DragSource
            nodeID={this.props.id}
            name="Repeatable"
            type="node"
            beginDrag={this.beginDrag(this.props.id)}
            endDrag={this.endDrag(this.props.id)}
          />
        {ele}
        </div>
      );
    }
    return ele;
  }
}

RepeatablePreview.defaultProps = {
  showStyler: true,
};

RepeatablePreview.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  repeatable: PropTypes.object.isRequired,
  nodes: PropTypes.object.isRequired,
  showStyler: PropTypes.bool,
};

export default withRouter(withStyles(styles)(RepeatablePreview));
