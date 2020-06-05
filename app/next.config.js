const withCSS = require('@zeit/next-css');
const withImages = require('next-images');
const withTM = require('next-transpile-modules');

module.exports = withTM(withImages(withCSS({
  transpileModules: ['react-dnd', 'react-sortable-tree', 'dnd-core', 'react-dnd-html5-backend', 'react-syntax-highlighter']
})));
