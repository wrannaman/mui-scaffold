import React from 'react'
import { withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText'
import { toJS } from 'mobx';
import DragSource from '../Shared/DragSource';
import { inject, observer } from 'mobx-react';

import SvgIcon from '@material-ui/core/SvgIcon';

import InboxIcon from '@material-ui/icons/Inbox';
import ViewColumnIcon from '@material-ui/icons/ViewColumn';
import Crop75Icon from '@material-ui/icons/Crop75';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import ScheduleIcon from '@material-ui/icons/Schedule';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import TuneIcon from '@material-ui/icons/Tune';
import ToggleOnIcon from '@material-ui/icons/ToggleOn';
import TextFieldsIcon from '@material-ui/icons/TextFields';
import InputIcon from '@material-ui/icons/Input';
import LabelIcon from '@material-ui/icons/Label';
import BorderHorizontalIcon from '@material-ui/icons/BorderHorizontal';
import MoodIcon from '@material-ui/icons/Mood';
import ListIcon from '@material-ui/icons/List';
import ImageIcon from '@material-ui/icons/Image';
import ListAltIcon from '@material-ui/icons/ListAlt';
import SubtitlesIcon from '@material-ui/icons/Subtitles';
import RepeatIcon from '@material-ui/icons/Repeat';
import BallotIcon from '@material-ui/icons/Ballot';
import FolderSpecialIcon from '@material-ui/icons/FolderSpecial';
import DeveloperBoardIcon from '@material-ui/icons/DeveloperBoard';
import PublishIcon from '@material-ui/icons/Publish';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import StarHalfIcon from '@material-ui/icons/StarHalf';
import MapIcon from '@material-ui/icons/Map';
import VideocamIcon from '@material-ui/icons/Videocam';
import WebIcon from '@material-ui/icons/Web';
import CodeIcon from '@material-ui/icons/Code';
import PaymentIcon from '@material-ui/icons/Payment';

const ButtonIcon = require('../Icons/Button.svg');
const TextFieldIcon = require('../Icons/TextField.svg');
const ModalIcon = require('../Icons/Modal.svg');
const SnackIcon = require('../Icons/Snack.svg');
const TableIcon = require('../Icons/Table.svg');

const styles = theme => ({
  nested: {
    // paddingLeft: theme.spacing(4),
    width: 77,
    padding: 1
  },
  primaryLabel: {
    fontSize: 11
  },
  secondaryLabel: {
    fontSize: 11
  },
  listItemRoot: {
    margin: 0,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #e4e4e4',
    margin: 1,
    width: 77,
    cursor: 'pointer',
    height: 50,
  },
  icon: {
    width: '90%',
    maxHeight: 25,
  }
});

@inject('store')
@observer
class DraggableListItem extends React.Component {

  beginDrag = (nodeID = true) => (e) => {
    const { page: { update } } = this.props.store;
    update('dragging', nodeID);
  }

  endDrag = () => (e) => {
    const { page: { update } } = this.props.store;
    update('dragging', false);
  }

  getIcon = (icon) => {
    const { classes } = this.props;
    switch (icon.toLowerCase()) {
      case "grid":
        return (<ViewColumnIcon className={classes.icon} />);
      case "section":
        return (<Crop75Icon className={classes.icon} />);
      case "div":
        return (<Crop75Icon className={classes.icon} />);
      case "paper":
        return (<BallotIcon className={classes.icon} />);
      case "button":
        return (<img src={ButtonIcon} className={classes.icon} />);
      case "checkbox":
        return (<CheckBoxIcon className={classes.icon} />);
      case "date/time":
        return (<ScheduleIcon className={classes.icon} />);
      case "radio":
        return (<RadioButtonCheckedIcon className={classes.icon} />);
      case "select":
        return (<ArrowDropDownIcon className={classes.icon} />);
      case "slider":
        return (<TuneIcon className={classes.icon} />);
      case "switch":
        return (<ToggleOnIcon className={classes.icon} />);
      case "text field":
        return (<img src={TextFieldIcon} className={classes.icon} />);
      case "dialog":
        return (<img src={ModalIcon} className={classes.icon} />);
      case "snackbar":
        return (<img src={SnackIcon} className={classes.icon} />);
      case "card":
        return (<SubtitlesIcon className={classes.icon} />);
      case "chip":
        return (<LabelIcon className={classes.icon} />);
      case "divider":
        return (<BorderHorizontalIcon className={classes.icon} />);
      case "icon":
        return (<MoodIcon className={classes.icon} />);
      case "list":
        return (<ListIcon className={classes.icon} />);
      case "typography":
        return (<TextFieldsIcon className={classes.icon} />);
      case "image":
        return (<ImageIcon className={classes.icon} />);
      case 'form':
        return (<ListAltIcon className={classes.icon} />);
      case 'table':
        return (<img src={TableIcon} className={classes.icon} />);
      case 'repeatable':
        return (<RepeatIcon className={classes.icon} />);
      case 'generated':
        return (<FolderSpecialIcon className={classes.icon} />);
      case 'basic':
        return (<DeveloperBoardIcon className={classes.icon} />);
      case 'file upload':
        return (<PublishIcon className={classes.icon} />);
      case 'avatar':
        return (<AccountCircleIcon className={classes.icon} />);
      case 'rating':
        return (<StarHalfIcon className={classes.icon} />);
      case 'map':
        return (<MapIcon className={classes.icon} />);
      case 'video':
        return (<VideocamIcon className={classes.icon} />);
      case 'iframe':
        return (<WebIcon className={classes.icon} />);
      case 'code':
        return (<CodeIcon className={classes.icon} />);
      case 'stripe checkout':
        return (<PaymentIcon className={classes.icon} />);
      default:
        return (<InboxIcon className={classes.icon} />);
    }
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
      subtitle
    } = this.props;

    return (
      <DragSource
        type={this.props.type}
        name={this.props.name}
        item={this.props.item}
        beginDrag={this.beginDrag()}
        endDrag={this.endDrag()}
        showToolTip={false}
      >
        <div
          className={classes.column}
          onClick={onClick}
        >
          {this.getIcon(subtitle ? subtitle : item)}
          <ListItemText
            primary={item.slice(0, 10)}
            dense
            classes={{
              root: classes.listItemRoot,
              primary: classes.primaryLabel,
              secondary: classes.secondaryLabel
            }}
          />
        </div>
      </DragSource>
    )
  }
}

DraggableListItem.defaultProps =  {
  subtitle: '',
}


// Export the wrapped version
export default withStyles(styles)(DraggableListItem);
