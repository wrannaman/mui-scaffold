import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { Button } from '@material-ui/core';
import DragSource from '../../components/Shared/DragSource';

import MaterialTable from "material-table";
import moment from 'moment';

import { RefreshOutlined, Add, ArrowUpward, Check, ChevronLeft, ChevronRight, Clear, DeleteOutline, Edit, FilterList, FirstPage, LastPage, Remove, Save, SaveAlt, Search, ViewColumn } from '@material-ui/icons';
import { createDataItem, fetchDataItems, updateDataItem, deleteDataItem } from '../../src/apiCalls/dataItem';

import { fetchData } from '../../src/apiCalls/data';


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
class WrappedTable extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataModel: {},
    };
    this.tableRef = React.createRef();
  }

  async componentDidMount() {
    await this.init();
  }

  init = async () => {
    // get data model.
    let whichData = this.props.data;
    if (whichData.id) whichData = whichData.id;
    const data = await fetchData({ id: whichData });
    if (data.success) this.setState({ dataModel: data.data });
  }

  getColumns = () => {
    const { editView } = this.props;
    const { component: { dropped } } = this.props.store;
    const { dataModel } = this.state;
    if (!dataModel || !dataModel.model) return [];
    const keys = Object.keys(dataModel.model);
    const columns = [];
    if (keys.length === 0) return columns;
    keys.forEach(item => {
      if (dataModel.model[item]) {
        const obj = { title: item, field: item };
        if (dataModel && dataModel.model && dataModel.model[item]) {
          switch (dataModel.model[item]) {
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
            default:
              obj.type = 'string';
              obj.render = rowData => {
                if (typeof rowData === 'object' && item.indexOf('Id') !== -1 && typeof rowData[item].id !== 'undefined') return rowData.id;
                if (typeof rowData[item] !== 'string') return <span>{JSON.stringify(rowData[item])}</span>
                return rowData[item];
              };

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

    if (this.props.model && Object.keys(this.props.model).length > 0) {
      return columns.filter(column => {
        if (this.props.model[column.field]) return true;
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

  getData = async (q = { filters: [], orderBy: '', }) => {
    const { router: { query: { projectID } }, data } = this.props;
    const { snack: { snacky } } = this.props.store;
    if (q.orderBy) q.orderBy = JSON.stringify(q.orderBy)
    if (q.filters.length > 0) q.filters = JSON.stringify(q.filters)
    const _data = await fetchDataItems({ data: data && data.id ? data.id : data, project: projectID, ...q });
    if (_data.error) {
      snacky('Error getting data')
      return { data: [], page: 0, totalCount: 0 };
    }
    console.log('data ', {
      data: this.transformDataItems(_data.dataItems.docs),
      page: isNaN(_data.dataItems.offset / _data.dataItems.limit) ? 0 : _data.dataItems.offset / _data.dataItems.limit,
      totalCount: _data.dataItems.totalDocs,
    });
    return {
      data: this.transformDataItems(_data.dataItems.docs),
      page: isNaN(_data.dataItems.offset / _data.dataItems.limit) ? 0 : _data.dataItems.offset / _data.dataItems.limit,
      totalCount: _data.dataItems.totalDocs,
    };
  }



  onRowAdd = newData => new Promise(async (resolve, reject) => {
    const { data } = this.props;
    const { router: { query: { projectID } }} = this.props;
    await createDataItem({ item: newData, project: projectID, data });
    resolve();
  });

  onRowUpdate = (newData, oldData) => new Promise(async (resolve, reject) => {
    const { data } = this.props;
    const { router: { query: { projectID } }} = this.props;
    const d = await updateDataItem({ project: projectID, data, ...newData });
    resolve();
  });

  onRowDelete = oldData => new Promise(async (resolve, reject) => {
    const { data } = this.props;
    const { router: { query: { projectID } }} = this.props;
    const d = await deleteDataItem({ project: projectID, data, ...oldData });
    resolve();
  })

  beginDrag = (nodeID) => (e) => {
    const { page: { update } } = this.props.store;
    update('dragging', nodeID);
  }

  endDrag = (nodeID) => (e) => {
    const { page: { update } } = this.props.store;
    update('dragging', false);
  }

  onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { page: { update } } = this.props.store;
    update('editing', this.props.id);
  }

  render() {
    const {
      classes,
      router,
      store: {
        repeatable: { repeatable },
        page: { editing, dragging }
      },
      id,
      style,
      data,
      table,
    } = this.props;

    const isEditing = editing === this.props.id;

    let filtering = true;
    if (table && typeof table.filter !== 'undefined') filtering = table.filter;

    let exportButton = true;
    if (table && typeof table.export !== 'undefined') exportButton = table.export;

    const editable = {
      onRowAdd: this.onRowAdd,
      onRowUpdate: this.onRowUpdate,
      onRowDelete: this.onRowDelete
    };
    if (table && typeof table.add !== 'undefined' && !table.add) delete editable.onRowAdd;
    if (table && typeof table.edit !== 'undefined' && !table.edit) delete editable.onRowUpdate;
    if (table && typeof table.delete !== 'undefined' && !table.delete) delete editable.onRowDelete;

    const styleCopy = Object.assign({}, style);
    if (this.props.__allowEdit && (dragging || editing === id)) styleCopy.border = '1px solid #5130a4';

    console.log('this.getColumns( ', this.getColumns());

    console.log('this props', this.props);

    const ele = (
      <div
        key={this.id}
        id={this.id}
        style={{ ...styleCopy }}
        onClick={this.onClick}
      >
      <MaterialTable
        icons={tableIcons}
        columns={this.getColumns()}
        title={this.props.name}
        data={this.getData}
        tableRef={this.tableRef}
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
    if (!this.props.__allowEdit) return ele;
    if (isEditing) {
      return (
        <div>
        <DragSource
          nodeID={this.props.id}
          name="Table"
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

WrappedTable.defaultProps = {
  onClick: () => {
  }
};

WrappedTable.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(WrappedTable));
