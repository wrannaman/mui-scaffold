import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { TextField, Grid, Button, Typography } from '@material-ui/core';
import AceEditor from "react-ace";
import prettier from "prettier/standalone";
import babel from "prettier/parser-babylon";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";

const styles = theme => ({
  root: {
  },
});

import { DefaultCode } from '../../utils/Elements';

@inject('store')
@observer
class CodeEditor extends React.Component {

  componentDidMount() {  }

  renderCode  = (repeat) => {

  }
  render() {
    const { classes, router, index, } = this.props;
    const { page: { nodes }, component: { component, components }, repeatable: { repeatables, workingIndex } } = this.props.store;

    const code = prettier.format(nodes.trie["*"].renderString(), { semi: false, parser: "babel", plugins: [babel] }).replace(/;/g, '')
    return (
      <div style={{ width: '100%', minHeight: '50vh' }}>

        <AceEditor
          mode="javascript"
          theme="monokai"
          name="ACE-ID"
          value={code}
          style={{ width: '100%' }}
          width={'100%'}
          height={'70vh'}
          editorProps={{ $blockScrolling: true }}
          enableBasicAutocompletion={true}
          enableLiveAutocompletion={true}
          enableSnippets={true}
          tabSize={2}
          onLoad={() => {}}
          onChange={() => {}}
        />
      </div>
    );
  }
}

CodeEditor.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(CodeEditor));
