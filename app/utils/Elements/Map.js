import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
// import { google_maps } from '../../config';

import DragSource from '../../components/Shared/DragSource';
// import { InfoWindow, GoogleMap, LoadScript, MarkerClusterer, Marker } from '@react-google-maps/api'
import { fetchDataItems } from '../../src/apiCalls/dataItem';
import { Typography } from '@material-ui/core';

const styles = theme => ({
  root: {
  },
});

@inject('store')
@observer
class Map extends React.PureComponent {
  state = {
    data: [],
    page: 0,
    totalCount: 0,
    rowsPerPage: 100,
    position: {
      lat: 0,
      lng: 0,
    },
    waiting: true,
  };

  componentDidMount() {
    this.fetchData()
    this.markerInfoHelper()
    this.setState({ waiting: false });
  }

  componentWillUnmount() {
    this.setState({ waiting: true });
    const { repeatable: { repeatables, deletePreviewNodes, setPreviewNodes, previewNodes }, data: { updateData } } = this.props.store;
    if (this.props.infoWindowComponent && previewNodes[this.props.infoWindowComponent]) deletePreviewNodes(this.props.infoWindowComponent);
    updateData('repeatableData', []);
  }

  markerInfoHelper = () => {
    if (!this.props.infoWindow || !this.props.infoWindowComponent ) return console.log('no');
    const { repeatable: { repeatables, setPreviewNodes, previewNodes } } = this.props.store;
    if (previewNodes[this.props.infoWindowComponent]) return console.log('already have it');
    let repeat = repeatables.filter(r => r.id === this.props.infoWindowComponent);
    if (repeat && repeat.length === 1) repeat = repeat[0];
    if (repeat && repeat.id && repeat.node) {
      setPreviewNodes(repeat);
    }
  }

  transformDataItems = (dataItems) => {
    const d = [];
    dataItems.forEach(item => {
      d.push({ ...item, ...item.item });
    });
    return d;
  }

  fetchData = async (page = 0, pageSize = 100, orderBy = null, filters = [], totalCount = 0, orderDirection = '') => {
    this.setState({ dataChange: false });
    const { repeatable, router: { query: { projectID } } } = this.props;
    const { data: { datas, updateData } } = this.props.store;

    if (!this.props.boundDataModelID) return;
    if (orderBy) orderBy = JSON.stringify(orderBy)
    if (filters.length > 0) filters = JSON.stringify(filters)
    const data = await fetchDataItems({
      data: this.props.boundDataModelID,
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
    }
    /*
      else {
       stateUpdate = {
         data: [],
         page: 0,
         totalCount: 0,
         rowsPerPage: pageSize,
       };
     }
    */
    if (stateUpdate.data && stateUpdate.data.length > 0) updateData('repeatableData', stateUpdate.data);
    this.setState(stateUpdate, () => {
      // this.setState({ dataChange: true });
    });
  }


  onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { page: { update } } = this.props.store;
    update('editing', this.props.id);
  }

  beginDrag = (nodeID) => (e) => {
    if (this.hasBoundData() || !this.props.__allowEdit) return;
    const { page: { update } } = this.props.store;
    update('dragging', nodeID);
  }

  endDrag = (nodeID) => (e) => {
    if (this.hasBoundData() || !this.props.__allowEdit) return;
    const { page: { update } } = this.props.store;
    update('dragging', false);
  }

  hasBoundData = () => {
    const { boundValue, __data } = this.props;
    // return __data ? true : false;
    return boundValue &&
    boundValue.field &&
    boundValue.model &&
    __data &&
    typeof __data[boundValue.field] !== 'undefined';
  }

  isBound = () => {
    const { boundValue, __data } = this.props;
    return boundValue &&
    boundValue.field &&
    boundValue.model
  }

  handleBoundData = (props) => {
    const { snack: { snacky } } = this.props.store;
    const { boundValue, __data } = this.props;
    // if (this.hasBoundData()) {
    //   if (Array.isArray(__data[boundValue.field])) {
    //     if (__data[boundValue.field].length > 0) {
    //       // check if they're objects or strings
    //       if (typeof __data[boundValue.field][0] === 'string') return __data[boundValue.field][0];
    //       return __data[boundValue.field][0][boundValue.relationField];
    //     } else {
    //       snacky(`Please add some data to ${boundValue.relationModelName}`, 'warning')
    //       return ""
    //     }
    //   } else if (__data && __data.item && Array.isArray(__data.item[boundValue.field])) {
    //     if (__data.item[boundValue.field].length > 0) return __data.item[boundValue.field][0][boundValue.relationField];
    //     else {
    //       snacky(`Please add some data to ${boundValue.relationModelName}`, 'warning')
    //       return ""
    //     }
    //   } else if (__data && __data.item && __data.item[boundValue.field] && boundValue.relationField && __data.item[boundValue.field][boundValue.relationField]) {
    //     return __data.item[boundValue.field][boundValue.relationField];
    //   }
    //   return __data[boundValue.field];
    // }
    // if (this.isBound()) return '/img/bound.png';
    // return props.src;
  }

  markerClick = (data) => (e) => {
    const position = { lat: Number(data[this.props.latField]), lng: Number(data[this.props.lngField]) }
    this.setState({ position, showInfoWindow: true, data });
  }

  getMarker = (data, clusterer = null) => {
    const position = { lat: Number(data[this.props.latField]), lng: Number(data[this.props.lngField]) };
    return (
      <Marker
        position={position}
        icon={this.props.markerImage ? this.props.markerImage : null}
        label={this.props.title && data[this.props.title] ? data[this.props.title] : null}
        clusterer={clusterer}
        onClick={this.markerClick(data)}
      />
    );
  }

  closeInfoWindow = (e) => {
    // console.log('close window');
    this.setState({ showInfoWindow: false });
  }

  renderInfoWindow = (repeatableID) => {
    const { data } = this.state;
    const { repeatable: { previewNodes } } = this.props.store;
    // let repeat = repeatables.filter(r => r.id === repeatableID);
    // if (repeat && repeat.length === 1) repeat = repeat[0];
    if (previewNodes && repeatableID && previewNodes[repeatableID] && previewNodes[repeatableID].nodes) return previewNodes[repeatableID].nodes.render(data, false);
    return (<div><Typography variant="body1">Error, please attach a component and refresh this page</Typography></div>);
  }

  render() {
    const { data, showInfoWindow, waiting } = this.state;
    const { page: { editing }, data: { datas, repeatableData } } = this.props.store;
    const isEditing = editing === this.props.id;
    const clusterOptions = {};
    if (waiting) return null;
    let ele = (
      <div
        onClick={this.onClick}
        style={{ ...this.props.style }}
      >
        <LoadScript
          id={this.props.id}
          googleMapsApiKey={google_maps}
        >
          <GoogleMap
            id={`${this.props.id}-map`}
            mapContainerStyle={{
              height: `${this.props.height || "400px"}`,
              width: `${this.props.width || "800px"}`,
            }}
            zoom={Number(this.props.zoom) || 7}
            center={{
              lat: Number(this.props.lat) || -3.745,
              lng: Number(this.props.lng) || -38.523,
            }}
          >
          {this.props.infoWindow && showInfoWindow && this.props.infoWindowComponent && (
            <InfoWindow
              position={this.state.position}
              onCloseClick={this.closeInfoWindow}
            >
              <React.Fragment>
                {this.renderInfoWindow(this.props.infoWindowComponent)}
              </React.Fragment>
            </InfoWindow>
          )}
          {!this.props.cluster && repeatableData && repeatableData.length > 0 && repeatableData.map(d => (this.getMarker(d)))}
          {this.props.cluster && repeatableData && repeatableData.length > 0 && (
            <MarkerClusterer
              options={clusterOptions}
            >
              {
                (clusterer) => repeatableData.map(d => this.getMarker(d, clusterer))
              }
            </MarkerClusterer>
          )}
          </GoogleMap>
        </LoadScript>
      </div>
    );
    if (this.hasBoundData() || !this.props.__allowEdit) return ele;
    if (isEditing) {
      return (
        <div
          style={{ ...this.props.style, border: isEditing && this.props.__allowEdit ? '1px solid #5130a4' : 'none' }}
        >
          <DragSource
            nodeID={this.props.id}
            name="Map"
            type="node"
            beginDrag={this.beginDrag(this.props.id)}
            endDrag={this.endDrag(this.props.id)}
            extras={true}
          >
            {ele}
          </DragSource>
        </div>
      );
    }
    return ele;
  }
}

Map.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Map));
