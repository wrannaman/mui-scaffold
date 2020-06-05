import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { Typography, Collapse, Card, CardHeader, CardMedia, CardContent, CardActions, Button } from '@material-ui/core';

import DragSource from '../../components/Shared/DragSource';
import DropSource from '../../components/Shared/DropSource';
import Types from '../render/Types'


import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const styles = theme => ({
  card: {
    // maxWidth: 345,
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  avatar: {
    // backgroundColor: red[500],
  },
});

@inject('store')
@observer
class WrappedCard extends React.PureComponent {
  state = {
    showDrop: false
  };

  beginDrag = (nodeID) => (e) => {
    const { page: { update } } = this.props.store;
    update('dragging', nodeID);
  }

  endDrag = (nodeID) => (e) => {
    const { page: { update } } = this.props.store;
    update('dragging', false);
  }

  mouseEnter = event => {
    event.stopPropagation();
    this.setState({ showDrop: true });
  }

  mouseLeave = event => {
    event.stopPropagation();
    this.setState({ showDrop: false });
  }

  onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { page: { update } } = this.props.store;
    update('editing', this.props.id);
  }

  onDrop = (direction) => (item) => {
    const { page: { update, nodes }, repeatable: { repeatables }, component: { components } } = this.props.store;
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
    this.props.onDrop(item, direction);
  }

  render() {
    const {
      classes,
      style,
      mediaURL,
      mediaTitle,
      cardTitle,
      cardSubheader,
      contentText,
      collapse,
      id,
      children,
    } = this.props;
    const styleCopy = Object.assign({}, style);
    const { showDrop } = this.state;
    const { page: { editing, dragging } } = this.props.store;
    const isEditing = editing === this.props.id;
    if ((dragging || editing === id || showDrop) && this.props.__allowEdit) styleCopy.border = '1px solid #5130a4';

    const ele = (
      <Card
        className={classes.card}
        onClick={this.onClick}
        style={{ ...styleCopy }}
        onMouseEnter={this.mouseEnter}
        onMouseLeave={this.mouseLeave}
      >
         <CardHeader
           title={cardTitle}
           subheader={cardSubheader}
         />
         {mediaURL && (
           <CardMedia
             className={classes.media}
             image={mediaURL}
             title={mediaTitle}
             src={this.props.mediaSrc}
           />
         )}
         <CardContent>
         {children}
         {(dragging || showDrop || editing === this.props.id) && (
           <DropSource
             type="COMPONENT"
             accepts={[
               Types.COMPONENT
             ]}
             onDrop={this.onDrop('top')}
             className={classes.absolute}
           />
         )}
         </CardContent>
         <CardActions disableSpacing>
           {false && collapse && (
             <IconButton
               className={clsx(classes.expand, {
                 [classes.expandOpen]: this.state.expanded,
               })}
               onClick={() => this.setState({ expanded: !this.state.expanded })}
               aria-expanded={this.state.expanded}
               aria-label="show more"
             >
               <ExpandMoreIcon />
             </IconButton>
           )}
         </CardActions>
         {false && (
           <Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
             <CardContent>
               {(dragging || showDrop || editing === this.props.id) && (
                 <DropSource
                   type="COMPONENT"
                   accepts={[
                     Types.COMPONENT
                   ]}
                   onDrop={this.onDrop('top')}
                   className={classes.absolute}
                 />
               )}
             </CardContent>
           </Collapse>
         )}
      </Card>
    );
    if (!this.props.__allowEdit) return ele;
    if (isEditing) {
      return (
        <div>
        <DragSource
          nodeID={this.props.id}
          name="Card"
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

WrappedCard.defaultProps = {
  onClick: () => {
  }
}

WrappedCard.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(WrappedCard));
