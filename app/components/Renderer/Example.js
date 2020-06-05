import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { NativeTypes } from 'react-dnd-html5-backend'
import DropSource from '../Shared/DropSource'
import GridSection from './GridSection'
import RenderDropped from './RenderDropped';

import Types from '../../utils/render/Types';

const styles = theme => ({
  root: {
  },
});

@inject('store')
@observer
class Example extends React.Component {
  state = {}

  handleDrop = (where, item, type) => {
    const { page: { update, nodes }, repeatable: { repeatables }, component: { components } } = this.props.store;
    if (where === 'top') {
      item.pushToFront = true;
    }
    if (!type && (item.type === 'basic' || item.type === 'code')) type = item.type;
    if (item.type === 'repeatable' || item.type === 'form' || item.type === 'table' || item.type === 'basic' || item.type === 'code') {
      for (let i = 0; i < repeatables.length; i++) {
        if (repeatables[i].name === item.name) {
          item.props = Object.assign({}, toJS(repeatables[i]));
          break;
        }
      }
    }
    if (item.type === 'generated') {
      for (let i = 0; i < components.length; i++) {
        if (components[i].name === item.name) {
          item.props = Object.assign({}, toJS(components[i]));
          item.type = 'generated';
          item.componentType = item.props.type; // table or form
          break;
        }
      }
    }
    nodes.handleNode('*')(item);
  }

  render() {
    const { page: { grids, dropAreas } } = this.props.store;

    return (
      <div>
      <div style={{ overflow: 'hidden', clear: 'both', marginTop: 10 }}>
        {dropAreas.map(({ accepts, lastDroppedItem }, index) => (
          <DropSource
            type={Types.COMPONENT}
            accepts={accepts}
            lastDroppedItem={lastDroppedItem}
            onDrop={item => this.handleDrop('top', item)}
            key={index}
          />
        ))}
      </div>
        <RenderDropped />
        <div style={{ overflow: 'hidden', clear: 'both', marginTop: 10 }}>
          {dropAreas.map(({ accepts, lastDroppedItem }, index) => (
            <DropSource
              type={Types.COMPONENT}
              accepts={accepts}
              lastDroppedItem={lastDroppedItem}
              onDrop={item => this.handleDrop('bottom', item)}
              key={index}
            />
          ))}
        </div>

        {false && (
          <div style={{ overflow: 'hidden', clear: 'both' }}>
            {grids.map(({ name, type }, index) => (
              <GridSection
                name={name}
                type={type}
                key={index}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
}

Example.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Example));
