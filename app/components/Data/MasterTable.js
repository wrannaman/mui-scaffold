import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { capitalize } from 'lodash';

import MaterialTable from "material-table";
import moment from 'moment';

import { RefreshOutlined, Add, ArrowUpward, Check, ChevronLeft, ChevronRight, Clear, DeleteOutline, Edit, FilterList, FirstPage, LastPage, Remove, Save, SaveAlt, Search, ViewColumn} from '@material-ui/icons';
import { createDataItem, fetchDataItems, updateDataItem, deleteDataItem } from '../../src/apiCalls/dataItem';

const tableIcons = {
  Add: forwardRef((props, ref) => <Add {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};

const styles = theme => ({
  root: {
  },
});

@inject('store')
@observer
class MasterTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = { };
    this.tableRef = React.createRef();
  }

  getColumns = () => {
    const { editView } = this.props;
    const { data: { data }, repeatable: { dropped } } = this.props.store;
    const columns = [];
    Object.keys(data.model).forEach(item => {
      if (data.model[item]) {
        const obj = { title: item, field: item };
        if (data && data.model && data.model[item]) {
          if (item === 'id') {
            obj.editable = 'never';
            obj.filtering = true;
            obj.readonly = true;
            obj.searchable = true;
            obj.sorting = true;
            obj.type = 'numeric';
          } else {
            switch (data.model[item].type) {
              case 'number':
                obj.type = 'numeric';
                break;
              case 'date':
                obj.type = 'datetime';
                obj.render = rowData => (<span>{moment(rowData[item]).format('MM-DD-YY h:mm a')}</span>);
                break;
              case 'boolean':
                obj.type = 'boolean';
                break;
              case 'array':
                obj.type = 'string';
                obj.render = rowData => {
                  if (rowData && rowData[item]) return (<span>{JSON.stringify(rowData[item])}</span>)
                  return "";
                };
                break;
              case 'relation':
                obj.editable = 'never';
                obj.filtering = false;
                obj.readonly = true;
                obj.searchable = false;
                obj.sorting = false;
                obj.render = rowData => {
                  if (rowData && rowData[item]) return (<span>{JSON.stringify(rowData[item])}</span>)
                  return "";
                };
                break;
              default:
                obj.type = 'string';
            }
          }
        }
        columns.push(obj);
      }
    });
    if (editView) {
      return columns.filter((column) => {
        if (dropped[column.field]) return true;
        return false;
      });
    }

    return columns;
  }

  transformDataItems = (dataItems) => {
    const d = [];
    dataItems.forEach(item => {
      d.push({ ...item, ...item.item });
    });
    return d;
  }

  getData = async (q) => {
    const { router: { query: { projectID } } } = this.props;
    const { data: { data: { id, model, update } } } = this.props.store;
    if (q.orderBy) q.orderBy = JSON.stringify(q.orderBy)
    if (q.filters.length > 0) q.filters = JSON.stringify(q.filters)
    const data = await fetchDataItems({ data: id, project: projectID, ...q });
    return {
      data: this.transformDataItems(data.dataItems.docs),
      page: data.dataItems.offset / data.dataItems.limit,
      totalCount: data.dataItems.totalDocs,
    };
  }

  onRowAdd = newData => new Promise(async (resolve, reject) => {
    const { store: { data: { data }, snack: { snacky } } } = this.props;
    const { router: { query: { projectID } }} = this.props;
    const d = await createDataItem({ item: newData, project: projectID, data: data._id });
    if (d.error) snacky(d.error, 'error', 3000);
    resolve();
  });

  onRowUpdate = (newData, oldData) => new Promise(async (resolve, reject) => {
    const { store: { data: { data }, snack: { snacky } } } = this.props;
    const { router: { query: { projectID } }} = this.props;
    if (newData.id) {
      newData.goodID = newData.id;
      newData.id = newData._id;
    }
    const d = await updateDataItem({ project: projectID, data: data._id, ...newData });
    if (d.error) snacky(d.error, 'error', 3000);
    newData.id = newData.goodID;
    resolve();
  });

  onRowDelete = oldData => new Promise(async (resolve, reject) => {
    const { store: { data: { data } } } = this.props;
    const { router: { query: { projectID } }} = this.props;
    if (oldData.id) oldData.id = oldData._id;
    const d = await deleteDataItem({ project: projectID, data: data._id, ...oldData });
    resolve();
  })

  render() {
    const { classes, router, store: { data: { data }, repeatable: { repeatable } } } = this.props;

    if (!data || !data.model || Object.keys(data.model).length === 0) return null;

    let filtering = true;
    if (repeatable.table && typeof repeatable.table.filter !== 'undefined') filtering = repeatable.table.filter;

    let exportButton = true;
    if (repeatable.table && typeof repeatable.table.export !== 'undefined') exportButton = repeatable.table.export;

    const editable = {
      onRowAdd: this.onRowAdd,
      onRowUpdate: this.onRowUpdate,
      onRowDelete: this.onRowDelete
    };
    if (repeatable.table && typeof repeatable.table.export !== 'undefined' && !repeatable.table.add) delete editable.onRowAdd;
    if (repeatable.table && typeof repeatable.table.export !== 'undefined' && !repeatable.table.edit) delete editable.onRowUpdate;
    if (repeatable.table && typeof repeatable.table.export !== 'undefined' && !repeatable.table.delete) delete editable.onRowDelete;

    return (
      <div id="data-table">
        <MaterialTable
          icons={tableIcons}
          columns={this.getColumns()}
          title={capitalize(data.name)}
          data={this.getData}
          tableRef={this.tableRef}
          onRowClick={repeatable.table && repeatable.table.detail ? () => {} : null}
          options={{
            filtering,
            exportButton,
            search: false,
            draggable: true,
          }}
          editable={editable}
          actions={[
            // {
            //   icon: Save,
            //   tooltip: `Save ${data.name}`,
            //   onClick: (event, rowData) => {
            //     // Do save operation
            //   }
            // },
            {
              icon: RefreshOutlined,
              tooltip: 'Refresh Data',
              isFreeAction: true,
              onClick: () => this.tableRef.current && this.tableRef.current.onQueryChange(),
            }
          ]}
        />
      </div>
    );
  }
}

MasterTable.defaultProps = {
  editView: false,
}

MasterTable.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  editView: PropTypes.bool,
};

export default withRouter(withStyles(styles)(MasterTable));
