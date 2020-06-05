import React from 'react'
import { DragSource } from 'react-dnd'
import { withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText'
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
const styles = theme => ({
  nested: {
    paddingLeft: theme.spacing(4),
  },
});
// Drag sources and drop targets only interact
// if they have the same string type.
// You want to keep types in a separate file with
// the rest of your app's constants.
const Types = {
  COMPONENT: 'COMPONENT',
};

/**
 * Specifies the drag source contract.
 * Only `beginDrag` function is required.
 */
const cardSource = {
  beginDrag(props) {
    // Return the data describing the dragged item
    const item = { name: props.name, type: props.type }
    return item
  },

  endDrag(props, monitor, component) {
    if (!monitor.didDrop()) {
      return
    }

    // When dropped on a compatible target, do something
    const item = monitor.getItem()
    const dropResult = monitor.getDropResult()
    // CardActions.moveCardToList(item.id, dropResult.listId)
  },
}

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

class DraggableListItem extends React.Component {
  render() {
    // Your component receives its own props as usual
    const {
      isDragging,
      connectDragSource,
      id,
      classes,
      onClick,
      item,
      subtitle
    } = this.props;

    return connectDragSource(
      <div>
        <ListItem
          button
          className={classes.nested}
          onClick={onClick}
        >
          <ListItemText primary={item} secondary={subtitle}/>
        </ListItem>
      </div>
    );
  }
}

DraggableListItem.defaultProps =  {
  subtitle: '',
}


// Export the wrapped version
export default DragSource(Types.COMPONENT, cardSource, collect)(withStyles(styles)(DraggableListItem));
