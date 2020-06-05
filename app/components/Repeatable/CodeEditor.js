import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { TextField, Grid, Button, Typography } from '@material-ui/core';
import AceEditor from "react-ace";

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
  state = {
    tabSize: 2
  };

  componentDidMount() {
    setTimeout(() => {
      this.resetCode();
    }, 100);
  }

  resetCode = () => {
    const { index, repeatable } = this.props;
    const { repeatable: { repeatables, update } } = this.props.store
    if (!repeatable.code) {
      const clone = toJS(repeatables);
      clone[index].code = DefaultCode
      update('repeatables', clone)
    }
  }

  onChange = (newValue) => {
    const { index, repeatable } = this.props;
    const { repeatable: { repeatables, update } } = this.props.store
    const clone = toJS(repeatables);
    clone[index].code = newValue;
    update('repeatables', clone)
  }


  render() {
    const { classes, router, index, repeatable: { code } } = this.props;
    return (
      <div style={{ width: '100%', minHeight: '50vh' }}>
        <Grid container style={{ marginBottom: 10 }}>
          <Grid item xs={12} sm={2}>
            <Button
              variant="outlined"
              onClick={this.resetCode}
            >
              Reset Code
            </Button>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              onChange={(e) => this.setState({ tabSize: e.target.value })}
              type="number"
              placeholder={"Tab Size"}
              label={"Tab Size"}
              value={this.state.tabSize}
            />
          </Grid>
          <Grid item xs={12} sm={2}>

          </Grid>
        </Grid>
        <AceEditor
          mode="javascript"
          theme="monokai"
          onChange={this.onChange}
          name="ACE-ID"
          value={code}
          style={{ width: '100%' }}
          width={'100%'}
          height={'80vh'}
          editorProps={{ $blockScrolling: true }}
          enableBasicAutocompletion={true}
          enableLiveAutocompletion={true}
          enableSnippets={true}
          tabSize={this.state.tabSize}
          onLoad={this.resetCode}
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
