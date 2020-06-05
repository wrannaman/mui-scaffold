import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { v4 as uuid } from 'uuid';
import _ from "lodash";
import { Responsive } from "react-grid-layout";
import WidthProvider from './WidthProvider';
const ResponsiveReactGridLayout = WidthProvider(Responsive);

import Example from '../Renderer/Example';
import { getDefaultProps } from '../../utils/render'
// import "./gridLayout.css"
import { Button, Typography, Grid, Paper } from '@material-ui/core';

import WrappedTypography from '../../utils/Elements/Typography';
import WrappedButton from '../../utils/Elements/Button';
import WrappedImage from '../../utils/Elements/Image';

const styles = theme => ({
  root: {
  },
  bg: {
    background: "#eee",
  }
});

function generateLayout() {
  return _.map(_.range(0, 25), function(item, i) {
    var y = Math.ceil(Math.random() * 4) + 1;
    return {
      x: (_.random(0, 5) * 2) % 12,
      y: Math.floor(i / 6) * y,
      w: 2,
      h: y,
      i: i.toString(),
      static: Math.random() < 0.05
    };
  });
}


@inject('store')
@observer
class GridLayout extends React.Component {
  static defaultProps = {
    className: "layout",
    rowHeight: 30,
    onLayoutChange: function() {},
    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
    initialLayout: generateLayout()
  };

  state = {
    currentBreakpoint: "lg",
    compactType: null,
    mounted: false,
    layouts: { lg: this.props.initialLayout }
  };

  doubleClick = (l, i) => (e) => {
    const { page: { update } } = this.props.store;
    update('editing', { item: l, index: i});
  }

  generateDOM = () => {
    const { page: { layouts, layoutMap, nodes } } = this.props.store;
    return _.map(layouts.lg, (l, i) => {
      const itemDefinition = layoutMap[l.i];
      let inner = "ok!";
      if (itemDefinition) {
        switch (itemDefinition.component) {
          case 'typography':
            inner = <WrappedTypography {...itemDefinition} />
            break;
          case 'button':
            inner = <WrappedButton {...itemDefinition} />
            break;
          case 'image':
            inner = <WrappedImage {...itemDefinition} />
            break;
          default:

        }
      }
      return (
         <div onDoubleClick={this.doubleClick(l, i)} key={i} className={l.static ? "static" : ""}>
           {inner}
         </div>
      );
    });
  }

   generateItem = (i = 0) => {
     return {
       x: 4,
       y: 4,
       w: 4,
       h: 4,
       i: String(i),
       static: false,
     };
   }

   addItem = () => {
     // {name: "Grid", type: "Grid"}
     const { page: { nodes, layouts, update, layoutMap } } = this.props.store;
     const item = this.generateItem(layouts.lg ? layouts.lg.length : 0);
     const clone = Object.assign({}, toJS(layouts));
     const cloneMap = Object.assign({}, toJS(layoutMap));
     Object.keys(clone).map(key => clone[key].push(item));
     const props = getDefaultProps('Typography');
     cloneMap[item.i] = { container: 'grid', component: 'typography', ...props };
     update('layouts', clone);
     update('layoutMap', cloneMap);
   }

   onBreakpointChange = breakpoint => {
     this.setState({
       currentBreakpoint: breakpoint
     });
   };

   componentDidMount() {
     // const { page: { update } } = this.props.store;
     // const l = localStorage.getItem('layouts');
     // if (l) update('layouts', JSON.parse(l));
   }

   onCompactTypeChange = () => {
     const { compactType: oldCompactType } = this.state;
     const compactType =
       oldCompactType === "horizontal"
         ? "vertical"
         : oldCompactType === "vertical"
         ? null
         : "horizontal";
     this.setState({ compactType });
   };

   onLayoutChange = (layout, layouts) => {
     this.props.onLayoutChange(layout, layouts);
   };

   onNewLayout = () => {
     this.setState({
       layouts: { lg: generateLayout() }
     });
   };

   onDrop = elemParams => {
     alert(`Element parameters: ${JSON.stringify(elemParams)}`);
   };


  render() {
    const { classes, router, store: { page: { render, layouts }} } = this.props;
    return (
      <div>
        <div>
          <Typography variant="overline">
            Current Breakpoint: {this.state.currentBreakpoint} (
            {this.props.cols[this.state.currentBreakpoint]} columns)
          </Typography>
          <div>
            <Button
              variant="contained"
              color="primary"
              onClick={this.addItem}
            >
              Add Item
            </Button>
          </div>
          {false && (<button onClick={this.onNewLayout}>Generate New Layout</button>)}
          {false && (
            <button onClick={this.onCompactTypeChange}>
              Change Compaction Type
            </button>
          )}
          <ResponsiveReactGridLayout
            {...this.props}
            layouts={layouts}
            onBreakpointChange={this.onBreakpointChange}
            onLayoutChange={this.onLayoutChange}
            onDrop={this.onDrop}
            className={classes.bg}
            margin={[0, 0]}
            containerPadding={[0, 0]}
            cols={{ lg: 24, md: 10, sm: 6, xs: 4, xxs: 2 }}
            // WidthProvider option
            measureBeforeMount={false}
            // I like to have it animate on mount. If you don't, delete `useCSSTransforms` (it's default `true`)
            // and set `measureBeforeMount={true}`.
            useCSSTransforms={this.state.mounted}
            compactType={this.state.compactType}
            preventCollision={true}
          >
            {this.generateDOM()}
          </ResponsiveReactGridLayout>
        </div>
      </div>
    );
  }
}

GridLayout.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(GridLayout));
