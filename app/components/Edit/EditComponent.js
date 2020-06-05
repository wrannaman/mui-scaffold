import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import Draggable from 'react-draggable';
import _ from 'lodash';
import {
  Divider,
  Button,
  Paper,
  IconButton,
  Typography
} from '@material-ui/core';

import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';

import BoundValues from './BoundValues';
import PageInfoEditor from './PageInfoEditor';
import NodeActions from './NodeActions';
import GridEditor from './GridEditor';
import SectionEditor from './SectionEditor';
import CardEditor from './CardEditor';
import ImgEditor from './ImgEditor';
import ButtonEditor from './ButtonEditor';
import TypographyEditor from './TypographyEditor';
import CheckboxEditor from './CheckboxEditor';
import DateTimeEditor from './DateTimeEditor';
import RadioEditor from './RadioEditor';
import SelectEditor from './SelectEditor';
import SliderEditor from './SliderEditor';
import SwitchEditor from './SwitchEditor';
import TextFieldEditor from './TextFieldEditor';
import ComponentSelector from './ComponentSelector';
import PaperEditor from './PaperEditor';
import DividerEditor from './DividerEditor';
import ChipEditor from './ChipEditor';
import IconEditor from './IconEditor';
import ListEditor from './ListEditor';
import FileUploadEditor from './FileUploadEditor';
import RepeatableEditor from './RepeatableEditor';
import AvatarEditor from './AvatarEditor';
import RatingEditor from './RatingEditor';
import MapEditor from './MapEditor';
import VideoEditor from './VideoEditor';
import IframeEditor from './IframeEditor';
import StripeCheckoutEditor from './StripeCheckoutEditor';

import { savePage } from '../../src/apiCalls/page';

const boundTypes = ['Button', 'Map', 'Iframe', 'Video', 'Rating', 'Chip', 'Image', 'Typography', 'Text Field', 'Switch', 'Slider', 'Select', 'Radio', 'Date/Time', 'Checkbox', 'File Upload', 'Avatar']

const styles = theme => ({
  root: {
    // position: 'absolute',
    zIndex: 9999,
    width: 350,
    height: 'auto',
    minHeight: 100,
    maxHeight: '100vh',
    overflow: 'scroll',
    background: 'rgba(255, 255, 255, 0.9)',
    position: 'relative',
  },
  embeddedRoot: {
    position: 'relative',
  },
  wrapper: {
    position: 'relative'
  },
  closeButton: {
    position: 'absolute',
    top: -30,
    left: -30,
    zIndex: 999,
  },
  moveButton: {
    position: 'absolute',
    top: -30,
    right: -30,
    zIndeX: 9999
  },
  row: {
    maxWidth: 500,
    width: '100%',
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

@inject('store')
@observer
class EditComponent extends React.Component {

  static defaultProps = {
    embedded: false,
  }

  state = {
    disabled: true,
    doDelete: false,
  };


  closeEdit = (e) => {
    const { page: { update } } = this.props.store;
    update('editing', '');
  }

  delete = () => {
    if (!this.state.doDelete) {
      this.setState({ doDelete: true });
      return setTimeout(() => {
        this.setState({ doDelete: false });
      }, 3000);
    }
    const { page: { update, nodes, editing } } = this.props.store;
    nodes.delete(editing);
    update('render', new Date().getTime());
    update('editing', '');
  }

  save = async () => {
    const { router: { query: { pageID, projectID } } } = this.props;
    const { snack: { snacky }, page: { nodes, name, displayName } } = this.props.store;
    const toJSON = nodes.toJSON();
    const res = await savePage({ id: pageID, page: toJSON, project: projectID, name, displayName });
    if (res.success) snacky('saved');
    else if (res.error) snacky(res.error, 'error');
    else snacky('error! ', 'error');
  }

  shouldShowBind = () => {
    const { router: { pathname } } = this.props;
    const { page: { nodes, editing, type }, repeatable: { repeatables, workingIndex } } = this.props.store;

    let node = nodes.find(editing);
    if (!node) node = editing;

    const repeatable = repeatables.length > 0 && repeatables[workingIndex] ? repeatables[workingIndex] : null;
    let hideDueToRepeatableType = false;
    // if (repeatable && repeatable.type && repeatable.type === 'basic') {
    //   hideDueToRepeatableType = true;
    // }

    const isOnComponentsPage = pathname.indexOf('/component') !== -1;

    if (type === 'detail') return boundTypes.indexOf(node.type) !== -1;

    return !hideDueToRepeatableType &&
    isOnComponentsPage &&
    boundTypes.indexOf(node.type) !== -1;
  }

  getEditor = (node) => {
    switch (node.type) {
      case 'Grid':
        return <GridEditor node={node} />;
      case 'Section':
        return <SectionEditor node={node} />;
      case 'Div':
        return <SectionEditor node={node} />;
      case 'Chip':
        return <ChipEditor node={node} />;
      case 'Divider':
        return <DividerEditor node={node} />;
      case 'Card':
        return <CardEditor node={node} />;
      case 'Paper':
        return <PaperEditor node={node} />;
      case 'Image':
        return <ImgEditor node={node} />;
      case 'Typography':
        return <TypographyEditor node={node} />;
      case 'Button':
        return <ButtonEditor node={node} />;
      case 'Checkbox':
        return <CheckboxEditor node={node} />;
      case 'Date/Time':
        return <DateTimeEditor node={node} />;
      case 'Radio':
        return <RadioEditor node={node} />;
      case 'Select':
        return <SelectEditor node={node} />;
      case 'Slider':
        return <SliderEditor node={node} />;
      case 'Switch':
        return <SwitchEditor node={node} />;
      case 'Text Field':
        return <TextFieldEditor node={node} />;
      case 'Icon':
        return <IconEditor node={node} />;
      case 'List':
        return <ListEditor node={node} />;
      case 'File Upload':
        return <FileUploadEditor node={node} />;
      case 'repeatable':
        return <RepeatableEditor node={node} />;
      case 'Avatar':
        return <AvatarEditor node={node} />;
      case 'Rating':
        return <RatingEditor node={node} />;
      case 'Map':
        return <MapEditor node={node} />;
      case 'Video':
        return <VideoEditor node={node} />;
      case 'Iframe':
        return <IframeEditor node={node} />;
      case 'Stripe Checkout':
        return <StripeCheckoutEditor node={node} />;
      default:
    }
  }

  autoBindModelBool = () => {
    const { page: { type, nodes, editing, boundDataModel } } = this.props.store;
    const node = nodes.find(editing);
    if (type === 'detail' &&
      boundDataModel &&
      node &&
      (!node.props.boundValue || !node.props.boundValue.model)) {
      return boundDataModel;
    }
    return null;
  }

  render() {
    const { doDelete } = this.state;
    const { classes, item, embedded, router: { pathname } } = this.props;
    const { page: { nodes, editing, layoutMap }, repeatable: { repeatables, workingIndex } } = this.props.store;
    if (!editing) {
      return (
        <React.Fragment>
          <Typography variant="body1" style={{ textAlign: 'center', marginTop: 5 }}>Click on an item to edit.</Typography>
          {pathname.indexOf('pages') !== -1 && (<PageInfoEditor /> )}
          <NodeActions showSave={pathname.indexOf('pages') !== -1 || pathname.indexOf('component') !== -1}/>
        </React.Fragment>
      );
    }
    let node = nodes.find(editing);
    if (!node) node = editing;
    const whichComponentEditor = this.getEditor(node);

    const closeIcon = (
      <div>
        <IconButton
          className={classes.closeButton}
          aria-label="delete"
          onClick={this.closeEdit}
        >
          <HighlightOffIcon />
        </IconButton>
        <IconButton
          className={classes.moveButton}
          aria-label="delete"
          onMouseEnter={() => {
            this.setState({ disabled: false });
          }}
          onMouseLeave={() => {
            this.setState({ disabled: true });
          }}
        >
          <DragIndicatorIcon />
        </IconButton>
      </div>
    );

    const innards = (
      <div className={classes.wrapper}>
        {closeIcon}
        <Paper className={classes.root}>
          <Typography variant="overline">
            Edit {node.type}
          </Typography>
          <ComponentSelector item={editing} />
          {whichComponentEditor}
          <Divider />
          <Button onClick={this.delete}>{doDelete ? "Confirm Delete" : "Delete"}</Button>
        </Paper>
      </div>
    );

    if (embedded) {
      return (
        <div className={classes.wrapper}>
          <div className={classes.embeddedRoot}>
            <Typography variant="overline">
              Edit {node.type}
            </Typography>
            <ComponentSelector item={editing} />
            {whichComponentEditor}
            { false && this.shouldShowBind() && <Divider style={{ marginTop: 10, marginBottom: 10 }} />}
            { false && this.shouldShowBind() && (
              <BoundValues
                node={node}
                autoBindModel={this.autoBindModelBool()}
                showVirtual={true}
              />
            )}
            <Divider style={{ marginTop: 10, marginBottom: 10}} />
            {pathname.indexOf('pages') !== -1 && (<PageInfoEditor /> )}
            <NodeActions showSave={false}/>
          </div>
        </div>
      );
    }

    return (
      <div style={{ position: 'absolute', top: 85, right: 30 }}>
        <Draggable
          grid={[25, 25]}
          scale={1}
          disabled={this.state.disabled}
        >
        {innards}
        </Draggable>
      </div>
    );
  }
}

EditComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  embedded: PropTypes.bool,
};

export default withRouter(withStyles(styles)(EditComponent));
