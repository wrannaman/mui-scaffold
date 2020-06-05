import React from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import { withStyles } from '@material-ui/core/styles';
import { inject, observer } from 'mobx-react';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import {
  Tooltip,
  Paper,
  Grid,
  Typography
} from '@material-ui/core';

import FormatAlignLeftIcon from '@material-ui/icons/FormatAlignLeft';
import FormatAlignCenterIcon from '@material-ui/icons/FormatAlignCenter';
import FormatAlignRightIcon from '@material-ui/icons/FormatAlignRight';
import FormatAlignJustifyIcon from '@material-ui/icons/FormatAlignJustify';
import FormatBoldIcon from '@material-ui/icons/FormatBold';
import FormatItalicIcon from '@material-ui/icons/FormatItalic';
import FormatUnderlinedIcon from '@material-ui/icons/FormatUnderlined';
import FormatColorFillIcon from '@material-ui/icons/FormatColorFill';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import DeleteIcon from '@material-ui/icons/Delete';

import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

const styles = theme => ({
  nested: {
  },
  drag: {
    // position: 'relative'
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    width: 450
  },
  dragIcon: {
    marginRight: 10,
    cursor: 'move',
    color: '#fff',
    background: '#5130a4',
    // position: 'absolute',
    // left: -30,
    // top: 25,
  },
  absolute: {
    position: 'absolute',
    top: -40,
    left: 0,
    zIndex: 999,
    background: '#5130a4',
    padding: 10,
    height: 40,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  container: {
    position: 'relative'
  }
});
// Drag sources and drop targets only interact
// if they have the same string type.
// You want to keep types in a separate file with
// the rest of your app's constants.
const Types = {
  COMPONENT: 'COMPONENT',
};

@inject('store')
@observer
class DragSourceWrap extends React.Component {
  static defaultProps = {
    showToolTip: true,
    extras: true, // on the edit page we have more than just the move icon
  }
  state = {
    alignment: '',
  }
  handleAlignment = (e, updated) => {
    console.log('UPDATED', updated)
    e.preventDefault();
    e.stopPropagation();
    const { page: { nodes, update } } = this.props.store;
    const node = nodes.find(this.props.nodeID);
    console.log('THIS.PROPS.NODEID', this.props.nodeID)

    const parent = nodes.find(node.getParent())
    const totalLength = parent.children.length;
    const idx = parent.findChildIndex(this.props.nodeID);
    switch (updated) {
      case 'left':
        parent.moveChild(idx, idx - 1);
        break;
      case 'right':
        parent.moveChild(idx, idx + 1);
        break;
      case 'delete':
        nodes.delete(this.props.nodeID)
        break;
      default:
    }
    update('render', new Date().getTime());
  }

  checkIfNext = (dir = 'left') => {
    const { page: { nodes, update } } = this.props.store;
    if (!this.props.nodeID) return false;
    const node = nodes.find(this.props.nodeID);
    const parent = nodes.find(node.getParent())
    const totalLength = parent.children.length;
    const idx = parent.findChildIndex(this.props.nodeID);
    if (dir === 'left') return idx - 1 >= 0;
    return idx + 1 <= totalLength - 1;
  }

  render() {
    // Your component receives its own props as usual
    const {
      isDragging,
      connectDragSource,
      id,
      classes,
      onClick,
      item,
      className,
      nodeID,
      showToolTip,
      extras
    } = this.props;
    const { page: { render } } = this.props.store

    return connectDragSource(
      <div className={className || classes.container}>
        {render >= 0 && showToolTip && (
          <Paper className={classes.absolute}>
            <Tooltip title="Drag me">
              <DragIndicatorIcon className={classes.dragIcon} />
            </Tooltip>
            {extras && (
              <Typography variant="overline" style={{ color: '#fff', paddingRight: 15, fontSize: 11 }}>
                {this.props.name}
              </Typography>
            )}
            {extras && (
              <ToggleButtonGroup
                value={this.state.alignment}
                exclusive
                onChange={this.handleAlignment}
                aria-label="text alignment"
                size="small"
              >
                <Tooltip title="delete">
                  <ToggleButton value="delete" aria-label="Delete">
                    <DeleteIcon color="primary" />
                  </ToggleButton>
                </Tooltip>
                {this.checkIfNext('left') && (
                  <Tooltip title="Move Left">
                    <ToggleButton value="left" aria-label="Move Left">
                      <ArrowBackIcon color="primary" />
                    </ToggleButton>
                  </Tooltip>
                )}
                {this.checkIfNext('right') && (
                  <Tooltip title="Move Right">
                    <ToggleButton value="right" aria-label="Move Right">
                      <ArrowForwardIcon color="primary" />
                    </ToggleButton>
                  </Tooltip>
                )}

                {false && (
                  <ToggleButton value="right" aria-label="right aligned" disabled={this.checkIfNext('right')}>
                    <FormatAlignRightIcon />
                  </ToggleButton>
                )}
                {false && (
                  <ToggleButton value="justify" aria-label="justified" disabled>
                    <FormatAlignJustifyIcon />
                  </ToggleButton>
                )}
              </ToggleButtonGroup>
            )}

          </Paper>
        )}
        {this.props.children}
      </div>
    );
  }
}
DragSourceWrap.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  showToolTip: PropTypes.bool,
  extras: PropTypes.bool,
};
/**
 * Specifies which props to inject into your component.
 */

function collect(connect, monitor) {
  return {
    // Call this function inside render()
    // to let React DnD handle the drag events:
    connectDragSource: connect.dragSource(),
    // You can ask the monitor about the current drag state:
    isDragging: monitor.isDragging(),
  }
}

/**
 * Specifies the drag source contract.
 * Only `beginDrag` function is required.
 */
const cardSource = {
  beginDrag(props) {
    if (props.beginDrag) props.beginDrag();
    // Return the data describing the dragged item
    const item = { name: props.name, type: props.type, nodeID: props.nodeID }
    return item
  },

  endDrag(props, monitor, component) {
    if (props.endDrag) props.endDrag();
    if (!monitor.didDrop()) {
      return;
    }

    // When dropped on a compatible target, do something
    const item = monitor.getItem()
    const dropResult = monitor.getDropResult()
    // DragSourceWrapActions.moveCardToList(item.id, dropResult.listId)
  },
};

// Export the wrapped version
export default DragSource(Types.COMPONENT, cardSource, collect)(withStyles(styles)(DragSourceWrap));
