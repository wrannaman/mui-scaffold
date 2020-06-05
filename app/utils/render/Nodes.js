import React from 'react';
import Node from './Node';
import { v4 as uuid } from 'uuid';

class Nodes {
  constructor(update) {
    this.trie = {
      top: '*',
      '*': new Node('div', '*', '*'),
    };
    this.update = update;
  }

  handleNode = (newParentNodeID) => (child) => {
    if (!child.nodeID) {
      return this.addChildToNode(newParentNodeID)(child);
    }
    const node = this.trie[child.nodeID];
    const parentID = node.getParent();
    const parent = this.trie[parentID];
    // remove from parent
    parent.deleteChild(child.nodeID);
    // add to new parent
    node.update('parent', newParentNodeID);
    this.trie[newParentNodeID].addChild(node, child.pushToFront);
    this.update('render', new Date().getTime());
  }

  addChildToNode = (parentNodeID) => (child) => {
    // const { page: { update } } = initializeStore();
    this.addNode(child, parentNodeID, child.props);
    // update('render', new Date().getTime())
    this.update('render', new Date().getTime());
  }

  addNode = (item, parent, props = {}) => {
    const id = uuid();
    let type = item.name;
    if (item.type === 'repeatable') type = 'repeatable';
    if (item.type === 'form') type = 'form';
    if (item.type === 'table') type = 'table';
    if (item.type === 'basic') type = 'basic';
    if (item.type === 'code') type = 'code';
    if (item.type === 'generated') {
      type = 'generated';
      item.type = item.props.type; // table or form
    }
    const node = new Node(type, parent, id, props, this.handleNode, item.type, item.index, item.name);
    this.trie[parent].addChild(node, item.pushToFront);
    this.trie[id] = node;
    // if (this.trie[item.index]) {
    //   console.warn('trie conflict', item, this.list())
    // }
    // this.trie[item.index] = node;
  }

  list = () => {
    return Object.keys(this.trie);
  }

  find = (id) => {
    return this.trie[id];
  }

  ids = () => {
    return this.trie['*'].children.map(c => {
      return c.id
    });
  }

  loadNode = ({ type, props, parent, id, children, name }) => {
    const n = new Node(type, parent, id, props, this.handleNode, "", 0, name);
    this.trie[parent].addChild(n);
    this.trie[id] = n;
    this.update('render', new Date().getTime());
    children.forEach((child) => {
      const { name, type, props, parent, id, children } = child;
      this.loadNode({ name, type, props, parent, id, children });
    });
  }

  load = (json) => {
    // create top level node
    const { name, type, props, parent, id, children } = json;
    this.loadNode({ name, type, props, parent, id, children });
  }

  toJSON = () => {
    return this.trie['*'].toJSON();
  }

  delete = (id) => {
    const node = this.trie[id];
    const parent = node.parent;
    delete this.trie[id];
    this.trie[parent].deleteChild(id);
  }

  checkFormBoundValues = () => {
    let val = this.trie['*'].checkFormBoundValues();
    val = val.split(',').filter(v => v.length > 0).map(v => {
      return JSON.parse(v)
    });
    return val;
  }

  render(dataItem = null, allowEdit = true, realID = null) {
    return this.trie['*'].render(dataItem, allowEdit, realID);
  }

  // returns objects
  treeView() {
    return this.trie['*'].treeView();
  }

  // returns arrays
  treeView2() {
    return this.trie['*'].treeView2();
  }
}

export default Nodes;
