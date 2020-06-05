import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';

import DragSource from '../../components/Shared/DragSource';

const styles = theme => ({
  root: {
  },
});

@inject('store')
@observer
class Video extends React.PureComponent {
  state = {};

  onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (this.hasBoundData() || !this.props.__allowEdit) return;
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
    if (this.hasBoundData()) {
      if (Array.isArray(__data[boundValue.field])) {
        if (__data[boundValue.field].length > 0) {
          // check if they're objects or strings
          if (typeof __data[boundValue.field][0] === 'string') return __data[boundValue.field][0];
          return __data[boundValue.field][0][boundValue.relationField];
        } else {
          snacky(`Please add some data to ${boundValue.relationModelName}`, 'warning')
          return ""
        }
      } else if (__data && __data.item && Array.isArray(__data.item[boundValue.field])) {
        if (__data.item[boundValue.field].length > 0) return __data.item[boundValue.field][0][boundValue.relationField];
        else {
          snacky(`Please add some data to ${boundValue.relationModelName}`, 'warning')
          return ""
        }
      } else if (__data && __data.item && __data.item[boundValue.field] && boundValue.relationField && __data.item[boundValue.field][boundValue.relationField]) {
        return __data.item[boundValue.field][boundValue.relationField];
      }
      return __data[boundValue.field];
    }
    if (this.isBound()) return '/img/bound.png';
    return props.src;
  }

  maybeMultiple = (ele, props) => {
    const { snack: { snacky }, page: { editing } } = this.props.store;
    const { boundValue, __data, showAll } = this.props;
    const isEditing = editing === this.props.id;
    if (!showAll) return ele;
    if (this.hasBoundData() && Array.isArray(__data[boundValue.field])) {
      ele = [];
      __data[boundValue.field].forEach(d => {
        ele.push(
          <video
            onClick={this.onClick}
            key={this.id}
            id={this.id}
            controls={this.props.controls}
            autoPlay={this.props.autoPlay}
            height={Number(this.props.height)}
            width={Number(this.props.width)}
            style={{ ...this.props.style, border: isEditing && this.props.__allowEdit ? '1px solid #5130a4' : 'none' }}
          >
            <source src={d[boundValue.relationField]} type="video/mp4" />
          </video>
        )
      })
    }
    if (!this.hasBoundData() && this.isBound()) {
      // for detail pages, you want to preview having multiple images
      ele = [];
      [1, 2, 3].forEach((e) => {
        ele.push(
          <video
            onClick={this.onClick}
            key={this.id}
            id={this.id}
            controls={this.props.controls}
            autoPlay={this.props.autoPlay}
            height={Number(this.props.height)}
            width={Number(this.props.width)}
            style={{ ...this.props.style, border: isEditing && this.props.__allowEdit ? '1px solid #5130a4' : 'none' }}
          >
            <source src={this.props.src} type="video/mp4" />
          </video>
        )
      });
    }
    return ele;
  }

  render() {
    const { page: { editing } } = this.props.store;
    const isEditing = editing === this.props.id;
    let ele = (
      <video
        onClick={this.onClick}
        key={this.id}
        id={this.id}
        height={Number(this.props.height)}
        width={Number(this.props.width)}
        style={isEditing && this.props.__allowEdit ? { maxWidth: '100%'} : { ...this.props.style }}
        controls={this.props.controls}
        autoPlay={this.props.autoPlay}
      >
        <source src={this.handleBoundData(this.props)} type="video/mp4" />
      </video>
    );
    ele = this.maybeMultiple(ele);
    if (this.hasBoundData() || !this.props.__allowEdit) return ele;
    if (isEditing) {
      return (
        <div
          style={{ ...this.props.style, border: isEditing && this.props.__allowEdit ? '1px solid #5130a4' : 'none' }}
        >
          <DragSource
            nodeID={this.props.id}
            name="Video"
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

Video.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Video));
