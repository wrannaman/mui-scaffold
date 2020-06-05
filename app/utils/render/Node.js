import { v4 as uuid } from 'uuid';
import React from 'react';
// import {
//   ,
// } from '@material-ui/core';

import DragSource from '../../components/Shared/DragSource';

import {
  Avatar,
  Grid,
  Paper,
  Image,
  Typography,
  Button,
  Checkbox,
  DateTime,
  Radio,
  Select,
  Slider,
  Switch,
  TextField,
  Card,
  Divider,
  Chip,
  Icon,
  List,
  Table,
  Section,
  FileUpload,
  Rating,
  Map,
  Video,
  Iframe,
  Code,
  StripeCheckoutButton,
} from '../Elements';

import RepeatablePreview from '../../components/Repeatable/RepeatablePreview';
import FormPreview from '../../components/Repeatable/FormPreview';
import Basic from '../../components/Repeatable/Basic';

import getDefaultProps from './getDefaultProps';

/*

"*" as parent and id indicates top of tree

*/

const FORM_ELEMENTS = [
  "Checkbox",
  "Radio",
  "Select",
  "Slider",
  "Switch",
  "TextField",
  "Text Field",
  "DateTime",
  "File Upload",
];

export default class Node {

  // type is really just the name
  // component type was to accommodate forms and tables from the data models.
  /* Bound value shape
  node.props.boundValue = {
    type: string,
    relationModel: string (id),
    relationModelName: string
    field: string,
    modelRelationType: string,
    model: string id,
    sourceModel: string id,
    sourceModelName: string,

  }

  */

  constructor(
    type = null,
    parent = null,
    id = null,
    props = {},
    handleNode = () => {},
    componentType = "",
    index = 0,
    name = ""
  ) {
    if (type === null) console.warn('null type');
    this.id = id;
    if (!id) this.id = uuid();
    this.parent = parent;
    this.type = type || props.type;
    this.props = JSON.stringify(props) !== '{}' ? Object.assign(getDefaultProps(type), props) : getDefaultProps(type);
    this.children = [];
    this.onDrop = handleNode;
    this.componentType = componentType;
    this.index = index || 0;
    this.name = name || "";
    // for drag / drop
    this.expanded = true;
  }

  addChild = (child, pushToFront = false) => {
    if (pushToFront) this.children.unshift(child);
    else this.children.push(child);
  }

  toJSON = () => {
    return {
      id: this.id,
      props: this.props,
      type: this.type,
      parent: this.parent,
      children: this.children.map(c => c.toJSON()),
      name: this.name,
      index: this.index,
      componentType: this.componentType,
    };
  }

  getParent = () => this.parent

  renderChildren = (dataItem = null, allowEdit = true, realID = null) => {
    return this.children.map((child) => child.render(dataItem, allowEdit, realID));
  }

  renderChildrenString = (dataItem = null, allowEdit = true, realID = null) => {
    return this.children.map((child) => child.renderString(dataItem, allowEdit, realID)).join('');
  }

  deleteChild = (id) => {
    const clone = this.children.slice();
    let idx = null;
    for (let i = 0; i < clone.length; i++) {
      if (clone[i].id === id) {
        idx = i;
        break;
      }
    }
    clone.splice(idx, 1);
    this.children = clone;
  }

  findChildIndex = (id) => {
    let idx = null;
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].id === id) {
        idx = i;
        break;
      }
    }
    return idx;
  }

  update = (k, v) => {
    this[k] = v;
  }

  updateProps = (k, v) => {
    this.props[k] = v;
  }

  maybeGenerated = () => {
    return false;
    // if (!this.componentType || this.componentType !== 'form') return false;
    // return (
    //   <h1 key={this.id}>
    //     generated {this.id}
    //   </h1>
    // );
  }

  moveChild = (currentIndex, newIndex) => {
    if (newIndex < 0) newIndex = 0;
    if (newIndex > this.children.length - 1) newIndex = this.children.length - 1;
    this.children.splice(newIndex, 0, this.children.splice(currentIndex, 1)[0]);
  }

  renderChildrenTree() {
    return this.children.map((child) => child.treeView());
  }

  treeView() {
    return { [this.type]: { id: this.id, children: this.renderChildrenTree()} };
  }

  renderChildrenTree2() {
    return this.children.map((child) => child.treeView2());
  }

  treeView2() {
    return { parent: this.parent, expanded: this.expanded, title: this.type, id: this.id, children: this.renderChildrenTree2() };
  }

  checkFormBoundValues  = () => {
    if (FORM_ELEMENTS.indexOf(this.type) !== -1) {
      return `{ "${this.type}": ${this.props.boundValue && this.props.boundValue.id ? true : false}},${this.children.map(c => c.checkFormBoundValues())}`
    } else {
      return `${this.children.map(c => c.checkFormBoundValues())}`
    }
  }

  propFormat = (prop) => {
    if (typeof prop === 'string') return `{"${prop}"}`
    if (typeof prop === 'number' || typeof prop === 'boolean') return `{${prop}}`
  }

  propsAsString = (props) => {
    let str = "";
    Object.keys(props).forEach(prop => {
      console.log('PROPS[PROPS]', props[props])
      if (typeof props[prop] === 'function') return;
      if (props[prop] === undefined) return;
      str += `  ${prop}=${typeof props[prop] === 'object' ? `{${JSON.stringify(props[prop])}}` : this.propFormat(props[prop])}\n`;
    });
    return str;
  }


  renderString(dataItem = null, allowEdit = false, realID = null) {
    if (realID) this.id = realID;

    switch (this.type) {
      case 'div':
        return `<div>${this.renderChildrenString(dataItem, allowEdit, realID)}</div>`
      case 'Grid':
      return (
        `<Grid
          ${this.propsAsString(this.props)}
        >
        ${this.renderChildrenString(dataItem, allowEdit, realID)}
        </Grid>`
      );
      case 'Div':
        return `<div>${this.renderChildrenString(dataItem, allowEdit, realID)}</div>`

      case 'Paper':
        return (
          `<Paper
            ${this.propsAsString(this.props)}
          >
          ${this.renderChildrenString(dataItem, allowEdit, realID)}
          </Paper>`
        );
      case 'Button':
        return (
          `<Button
            ${this.propsAsString(this.props)}
          >
            ${this.props.text || 'new button'}
          </Button>`
        );
      case 'Divider':
        return (
          `<Divider
            ${this.propsAsString(this.props)}
          />`
        );
      case 'Image':
        return (
          `<Image
            ${this.propsAsString(this.props)}
          />`
        );
      case 'Typography':
        return (
          `<Typography
            ${this.propsAsString(this.props)}
          />`
        );
      case 'List':
        return (
          `<List
            ${this.propsAsString(this.props)}
          />`
        );
      case 'Checkbox':
        return (
          `<Checkbox
            ${this.propsAsString(this.props)}
          />`
        );
      case 'Date/Time':
        return (
          `<DateTime
            ${this.propsAsString(this.props)}
          />`
        );
      case 'Radio':
        return (
          `<Radio
            ${this.propsAsString(this.props)}
          />`
        );
      case 'Select':
        return (
          `<Select
            ${this.propsAsString(this.props)}
          />`
        );
      case 'Slider':
        return (
          `<Slider
            ${this.propsAsString(this.props)}
          />`
        );
      case 'Chip':
        return (
          `<Chip
            ${this.propsAsString(this.props)}
          />`
        );
      case 'Switch':
        return (
          `<Switch
            ${this.propsAsString(this.props)}
          />`
        );

      case 'Icon':
        return (
          `<Icon
            ${this.propsAsString(this.props)}
          />`
        );
      case 'Text Field':
        return (
          `<TextField
            ${this.propsAsString(this.props)}
          />`
        );
      case 'Avatar':
        return (
          `<Avatar
            ${this.propsAsString(this.props)}
          >
            ${this.props.name}
          </Avatar>`
        )
      case 'Rating':
        return (
          `<Rating
            ${this.propsAsString(this.props)}
          />`
        )
      default:
        const isGenerated = this.maybeGenerated();
        if (isGenerated) {
          return (isGenerated);
        }
        return (
          <div key={this.id} {...this.props} __allowEdit={allowEdit}>
            {false && (
              <Typography>
                rendered {this.id}
              </Typography>
            )}
            {this.renderChildren(dataItem, allowEdit, realID)}
          </div>
        );
    }
  }

  render(dataItem = null, allowEdit = true, realID = null) {
    if (realID) this.id = realID;
    switch (this.type) {
      case 'div':
        return this.renderChildren(dataItem, allowEdit, realID);
      case 'Grid':
        return (
          <Grid
            {...this.props}
            key={this.id}
            id={this.id}
            onDrop={this.onDrop(this.id)}
            children={this.renderChildren(dataItem, allowEdit, realID)}
            __data={dataItem}
            __allowEdit={allowEdit}
          />
        );
      case 'Section':
        return (
          <Section
            {...this.props}
            key={this.id}
            id={this.id}
            onDrop={this.onDrop(this.id)}
            children={this.renderChildren(dataItem, allowEdit, realID)}
            __data={dataItem}
            __allowEdit={allowEdit}
          />
        );
      case 'Div':
        return (
          <Section
            {...this.props}
            key={this.id}
            id={this.id}
            onDrop={this.onDrop(this.id)}
            children={this.renderChildren(dataItem, allowEdit, realID)}
            __data={dataItem}
            __allowEdit={allowEdit}
          />
        );
      case 'Paper':
        return (
          <Paper
            {...this.props}
            key={this.id}
            id={this.id}
            onDrop={this.onDrop(this.id)}
            children={this.renderChildren(dataItem, allowEdit, realID)}
            __data={dataItem}
            __allowEdit={allowEdit}
          />
        );
      case 'Button':
        return (
          <Button
            {...this.props}
            key={this.id}
            id={this.id}
            __data={dataItem}
            __allowEdit={allowEdit}
          >
            {this.props.text || 'new button'}
          </Button>
        );
      case 'Divider':
        return (
          <Divider
            {...this.props}
            key={this.id}
            id={this.id}
            __data={dataItem}
            __allowEdit={allowEdit}
          />
        );
      case 'Image':
        return (
          <Image
            {...this.props}
            key={this.id}
            id={this.id}
            src={this.props.src}
            __data={dataItem}
            __allowEdit={allowEdit}
          />
        );
      case 'Video':
        return (
          <Video
            {...this.props}
            key={this.id}
            id={this.id}
            src={this.props.src}
            __data={dataItem}
            __allowEdit={allowEdit}
          />
        );
      case 'Iframe':
        return (
          <Iframe
            {...this.props}
            key={this.id}
            id={this.id}
            src={this.props.src}
            __data={dataItem}
            __allowEdit={allowEdit}
          />
        );
      case 'Typography':
        return (
          <Typography
            {...this.props}
            key={this.id}
            id={this.id}
            src={this.props.src}
            __data={dataItem}
            __allowEdit={allowEdit}
          />
        );
      case 'List':
        return (
          <List
            {...this.props}
            key={this.id}
            id={this.id}
            src={this.props.src}
            __data={dataItem}
            __allowEdit={allowEdit}
          />
        );
      case 'Checkbox':
        return (
          <Checkbox
            {...this.props}
            key={this.id}
            id={this.id}
            items={this.props.items}
            __data={dataItem}
            __allowEdit={allowEdit}
          />
        );
      case 'Date/Time':
        return (
          <DateTime
            {...this.props}
            key={this.id}
            id={this.id}
            items={this.props.items}
            __data={dataItem}
            __allowEdit={allowEdit}
          />
        );
      case 'form':
        return (
          <FormPreview
            {...this.props}
            key={this.id}
            id={this.id}
            repeatable={this.props}
            showStyler={false}
            isEditor={false}
            showTitle={false}
            isNodeRender={true}
            __allowEdit={allowEdit}
          />
        );

      case 'basic':
        return (
          <Basic
            {...this.props}
            key={this.id}
            id={this.id}
            repeatable={this.props}
            showStyler={false}
            isEditor={false}
            showTitle={false}
            __allowEdit={allowEdit}
          />
        );
      case 'repeatable':
        return (
          <RepeatablePreview
            {...this.props}
            key={this.id}
            id={this.id}
            repeatable={this.props}
            showStyler={false}
            isEditor={false}
            __allowEdit={allowEdit}
          />
        );
      case 'table':
        return (
          <Table
            {...this.props}
            key={this.id}
            id={this.id}
            editView={false}
            __allowEdit={allowEdit}
          />
        );
      case 'generated':
        if (this.componentType === 'form' || this.props.type === 'form') {
          return (
            <div
              {...this.props}
              key={this.id}
              id={this.id}
            >
              unimplemented
            </div>
          );
        }
        break;
      case 'Radio':
        return (
          <Radio
            {...this.props}
            key={this.id}
            id={this.id}
            items={this.props.items}
            __data={dataItem}
            __allowEdit={allowEdit}
          />
        );
      case 'Select':
        return (
          <Select
            {...this.props}
            key={this.id}
            id={this.id}
            items={this.props.items}
            __data={dataItem}
            __allowEdit={allowEdit}
          />
        );
      case 'File Upload':
        return (
          <FileUpload
            {...this.props}
            key={this.id}
            id={this.id}
            items={this.props.items}
            __data={dataItem}
            __allowEdit={allowEdit}
          />
        );
      case 'Slider':
        return (
          <Slider
            {...this.props}
            key={this.id}
            id={this.id}
            __data={dataItem}
            __allowEdit={allowEdit}
          />
        );
      case 'Chip':
        return (
          <Chip
            {...this.props}
            key={this.id}
            id={this.id}
            __data={dataItem}
            __allowEdit={allowEdit}
          />
        );
      case 'Card':
        return (
          <Card
            {...this.props}
            key={this.id}
            id={this.id}
            onDrop={this.onDrop(this.id)}
            children={this.renderChildren(dataItem, allowEdit, realID)}
            __data={dataItem}
            __allowEdit={allowEdit}
          />
        )
      case 'Switch':
        return (
          <Switch
            {...this.props}
            key={this.id}
            id={this.id}
            __data={dataItem}
            __allowEdit={allowEdit}
          />
        );

      case 'Icon':
        return (
          <Icon
            {...this.props}
            key={this.id}
            id={this.id}
            __data={dataItem}
            __allowEdit={allowEdit}
          />
        );
      case 'Text Field':
        return (
          <TextField
            {...this.props}
            key={this.id}
            id={this.id}
            __data={dataItem}
            __allowEdit={allowEdit}
          />
        );
      case 'Avatar':
        return (
          <Avatar
            {...this.props}
            key={this.id}
            id={this.id}
            __data={dataItem}
            __allowEdit={allowEdit}
          >
            {this.props.name}
          </Avatar>
        )
      case 'Rating':
        return (
          <Rating
            {...this.props}
            key={this.id}
            id={this.id}
            __data={dataItem}
            __allowEdit={allowEdit}
          />
        )
      case 'Map':
        return (
          <Map
            {...this.props}
            key={this.id}
            id={this.id}
            __data={dataItem}
            __allowEdit={allowEdit}
          />
        )
      case 'code':
        return (
          <Code
            {...this.props}
            key={this.id}
            id={this.id}
            __data={dataItem}
            __allowEdit={allowEdit}
          />
        );
      case 'Stripe Checkout':
        return (
          <StripeCheckoutButton
            {...this.props}
            key={this.id}
            id={this.id}
            __data={dataItem}
            __allowEdit={allowEdit}
          />
        );
      default:
        const isGenerated = this.maybeGenerated();
        if (isGenerated) {
          return (isGenerated);
        }
        return (
          <div key={this.id} {...this.props} __allowEdit={allowEdit}>
            {false && (
              <Typography>
                rendered {this.id}
              </Typography>
            )}
            {this.renderChildren(dataItem, allowEdit, realID)}
          </div>
        );
    }
  }
}
