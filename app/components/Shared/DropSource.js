import React from 'react'
import { DropTarget } from 'react-dnd';
import Typography from '@material-ui/core/Typography';
import { inject, observer } from 'mobx-react';

const style = {
  // height: '12rem',
  // width: '12rem',
  width: '100%',
  padding: 0,
  height: 4,
};

@inject('store')
@observer
class DropArea extends React.Component {
  render() {
    const {
      accepts,
      isOver,
      canDrop,
      connectDropTarget,
      lastDroppedItem,
      type,
      className
    } = this.props;
    const { page: { dragging } } = this.props.store;

    const isActive = (isOver) && canDrop;
    let backgroundColor = 'rgba(81, 48, 164, 0.1)';
    style.height = 4;
    if (isActive) {
      backgroundColor = 'rgba(81, 48, 164, 0.8)';
      style.height = 20;
    } else if (canDrop) {
      backgroundColor = 'rgba(81, 48, 164, 0.1)';
    }

    let instructions = 'Release to drop';
    if (!isActive && type === 'grid') instructions = ``;
    else if (!isActive && type === 'COMPONENT') instructions = ``;

    return connectDropTarget(
      <div style={{ ...style, backgroundColor }} className={className}>
        {instructions && (
          <Typography style={{ textAlign: 'center', color: '#fff' }}>
            {instructions}
          </Typography>
        )}
        {this.props.children && (this.props.children)}
      </div>,
    );
  }
}
export default DropTarget(
  props => props.accepts,
  {
    drop(props, monitor) {
      props.onDrop(monitor.getItem())
    },
  },
  (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  }),
)(DropArea)
