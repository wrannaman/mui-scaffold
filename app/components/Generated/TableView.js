import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import MaterialTable from "material-table";

import { AddBox, ArrowUpward, Check, ChevronLeft, ChevronRight, Clear, DeleteOutline, Edit, FilterList, FirstPage, LastPage, Remove, SaveAlt, Search, ViewColumn} from '@material-ui/icons';

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
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
class TableView extends React.Component {
  state = {};

  getColumns = (items) => {
    const { data: { data } } = this.props.store;
    const columns = [];
    Object.keys(items).forEach(item => {
      if (items[item]) {
        const obj = { title: item, field: item };
        if (data && data.model && data.model[item]) {
          switch (data.model[item]) {
            case 'number':
              obj.type = 'numeric';
              break;
            case 'date':
              obj.type = 'datetime';
              break;
            case 'boolean':
              obj.type = 'boolean';
              break;
            default:
              obj.type = 'string';
          }
        }
        columns.push(obj);
      }
    });
    return columns;
  }

  getData = (dropped) => {
    const keys = Object.keys(dropped);
    const { data: { data: { model } } } = this.props.store;
    const things = ["yellow", "orange", "green", "blue", "tree", "Dave", "This is long", "how are you?"];

    const data = [];

    for (let j = 0; j < 10; j++) {
      const obj = {};
      for (let i = 0; i < keys.length; i++) {
        if (dropped[keys[i]]) {
          // obj[keys[i]] =
          switch (model[keys[i]]) {
            case 'number':
              obj[keys[i]] = (Math.random() * Math.random() * 100).toFixed(0);
              break;
            case 'date':
              obj[keys[i]] = new Date(+(new Date()) - Math.floor(Math.random() * 10000000000));
              break;
            case 'boolean':
              obj[keys[i]] = Math.random() > 0.5;
              break;
            default:
              obj[keys[i]] = things[Math.floor(Math.random() * things.length)];
          }
        }
      }
      data.push(obj);

    }

    return data;
  }

  render() {
    const { classes, router } = this.props;
    const { repeatable: { repeatable, dropped } } = this.props.store;
    return (
      <div>
        <MaterialTable
          icons={tableIcons}
          columns={this.getColumns(dropped)}
          title={repeatable.name}
          data={this.getData(dropped)}
        />
      </div>
    );
  }
}

TableView.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(TableView));
