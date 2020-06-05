import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { FormControl, InputLabel, Select, MenuItem, Button, Typography, TextField, Switch, FormControlLabel } from '@material-ui/core';

import AceEditor from 'react-ace';
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-monokai";

import { updateProject } from '../../src/apiCalls/project';

const styles = theme => ({
  root: {
  },
  container: {
    minWidth: '100%',
    width: '100%',
    height: '100%',
    minHeight: 500,
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    color: 'orange'
  },
  row: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },
  text: {
    width: 150,
    margin: 10,
  },
  titles: {
    width: 150,

  },
  formControl: {
    width: '100%'
  }
});

@inject('store')
@observer
class ThemeEditor extends React.Component {
  state = {
    annotations: [],
    showAce: false,
  };

  constructor(props) {
    super(props);
    this.inProgress = false;
  }

  handleChangeTheme = (name) => (e) => {
    const { project: { update, project } } = this.props.store;
    const clone = Object.assign({}, toJS(project));
    clone[name] = e;
    update('project', project);
  }

  handleChangeType = (key1, key2) => (e) => {
    const { project: { project, update } } = this.props.store;
    const clone = Object.assign({}, toJS(project));
    clone.theme[key1][key2] = e.target.value;
    if (!clone.theme.palette.background) clone.theme.palette.background = {};
    if (clone.theme[key1][key2] === 'dark') {
      clone.theme.palette.background = {
        paper: "#333333",
        default: "#212121",
        level2: "#333",
        level1: "#212121",
      }
      clone.theme.palette.text = {
        primary: "#fff",
        secondary: "rgba(255, 255, 255, 0.7)",
        disabled: "rgba(255, 255, 255, 0.5)",
        hint: "rgba(255, 255, 255, 0.5)",
        icon: "rgba(255, 255, 255, 0.5)",
      };
    } else {
      clone.theme.palette.background = {
        paper: "#fff",
        default: "#fff",
        level2: "#f5f5f5",
        level1: "#fff",
      }
      clone.theme.palette.text = {
        primary: "rgba(0, 0, 0, 0.87)",
        secondary: "rgba(0, 0, 0, 0.54)",
        disabled: "rgba(0, 0, 0, 0.38)",
        hint: "rgba(0, 0, 0, 0.38)",
      };
    }
    update('project', clone);
  }
  handleChangePalette = (key1, key2) => (e) => {
    if (this.inProgress) return;
    this.inProgress = true;
    const { project: { project, update } } = this.props.store;
    const clone = Object.assign({}, toJS(project));
    clone.theme.palette[key1][key2] = e.target.value;
    update('project', clone);
    setTimeout(() => {
      this.inProgress = false;
    }, 200);
  }

  save = async () => {
    const { query: { projectID } } = this.props.router;
    const { project: { update, project: {  fontName, fontURL, theme } }, snack: { snacky } } = this.props.store;
    const up = await updateProject({ id: projectID, theme, fontName, fontURL });
    if (up.success) {
      update('project', up.project);
      snacky('saved');
    } else {
      snacky('error saving theme ', 'error');
    }
  }

  update = (name) => (e) => {
    const { project: { project, update } } = this.props.store;
    const clone = Object.assign({}, toJS(project));
    clone[name] = e.target.value;
    if (name === 'fontName') {
      const splt = clone.theme.typography.fontFamily.split(',');
      splt[0] = `"${e.target.value}"`;
      clone.theme.typography.fontFamily = splt.join(',');
    }
    update('project', clone);
  }

  render() {
    const { showAce } = this.state;
    const { classes, router } = this.props;
    const { project: { project: { fontName, fontURL, theme } } } = this.props.store;
    return (
      <div className={classes.container}>
        {false && (
          <FormControlLabel
            control={<Switch checked={theme.palette.type === 'dark'} onChange={this.handleChangeType('palette', 'type')} />}
            label="Dark Theme"
          />
        )}
        <div className={classes.row}>
          <div>
            <Typography variant="body1" className={classes.titles} >
              Theme Color
            </Typography>
          </div>
          <div style={{ width: 150 }}>
            <FormControl className={classes.formControl}>
             <InputLabel htmlFor="themeColor">Theme Color</InputLabel>
             <Select
               value={theme.palette.type}
               onChange={this.handleChangeType('palette', 'type')}
               inputProps={{
                 name: 'themeColor',
               }}
             >
               <MenuItem value={'light'}>Light</MenuItem>
               <MenuItem value={'dark'}>Dark</MenuItem>
             </Select>
            </FormControl>
          </div>
          <div style={{ width: 170 }} />
          <div style={{ width: 170 }} />
        </div>
        <div className={classes.row}>
          <div>
            <Typography variant="body1" className={classes.titles} >
              Font URL
            </Typography>
          </div>
          <div style={{ textAlign: 'center' }}>
            <TextField
              className={classes.text}
              type="text"
              label={'Font URL'}
              InputLabelProps={{
                className: classes.label,
              }}
              value={fontURL}
              onChange={this.update('fontURL')}
            />
          </div>
          <div style={{ width: 170 }} />
          <div style={{ width: 170 }} />
        </div>
        <div className={classes.row}>
          <div>
            <Typography variant="body1" className={classes.titles} >
              Font Name
            </Typography>
          </div>
          <div>
            <TextField
              className={classes.text}
              type="text"
              label={'Font Name'}
              InputLabelProps={{
                className: classes.label,
              }}
              value={fontName}
              onChange={this.update('fontName')}
            />
          </div>
          <div style={{ width: 170 }} />
          <div style={{ width: 170 }} />
        </div>
        <div className={classes.row}>
          <div>
            <Typography variant="body1" className={classes.titles} >
              Primary Color
            </Typography>
          </div>
          <TextField
            className={classes.text}
            type="color"
            label={'Main Color'}
            InputLabelProps={{
              className: classes.label,
            }}
            value={theme.palette.primary.main}
            onChange={this.handleChangePalette('primary', 'main')}
          />
          <TextField
            className={classes.text}
            type="color"
            label={'Light Color'}
            value={theme.palette.primary.light}
            onChange={this.handleChangePalette('primary', 'light')}
          />
          {false && (
            <TextField
              className={classes.text}
              type="color"
              label={'Dark Color'}
              value={theme.palette.primary.dark}
              onChange={this.handleChangePalette('primary', 'dark')}
            />
          )}
          <TextField
            className={classes.text}
            type="color"
            label={'Contrast Text Color'}
            value={theme.palette.primary.contrastText}
            onChange={this.handleChangePalette('primary', 'contrastText')}
          />
        </div>
        <div className={classes.row}>
          <div>
            <Typography variant="body1" className={classes.titles} >
              Secondary Color
            </Typography>
          </div>
          <TextField
            className={classes.text}
            type="color"
            label={'Main Color'}
            InputLabelProps={{
              className: classes.label,
            }}
            value={theme.palette.secondary.main}
            onChange={this.handleChangePalette('secondary', 'main')}
          />
          <TextField
            className={classes.text}
            type="color"
            label={'Light Color'}
            value={theme.palette.secondary.light}
            onChange={this.handleChangePalette('secondary', 'light')}
          />
          {false && (
            <TextField
              className={classes.text}
              type="color"
              label={'Dark Color'}
              value={theme.palette.secondary.dark}
              onChange={this.handleChangePalette('secondary', 'dark')}
            />
          )}
          <TextField
            className={classes.text}
            type="color"
            label={'Contrast Text Color'}
            value={theme.palette.secondary.contrastText}
            onChange={this.handleChangePalette('secondary', 'contrastText')}
          />
        </div>
        <div className={classes.row}>
          <div>
            <Typography variant="body1" className={classes.titles} >
              Text Color
            </Typography>
          </div>
          <TextField
            className={classes.text}
            type="color"
            label={'Primary Text'}
            InputLabelProps={{
              className: classes.label,
            }}
            value={theme.palette.text.primary}
            onChange={this.handleChangePalette('text', 'primary')}
          />
          <TextField
            className={classes.text}
            type="color"
            label={'Secondary Text'}
            value={theme.palette.text.secondary}
            onChange={this.handleChangePalette('text', 'secondary')}
          />
          <div style={{ width: 170 }} />
        </div>
        <div className={classes.row}>
          <div>
            <Typography variant="body1" className={classes.titles} >
              Background Color
            </Typography>
          </div>
          <TextField
            className={classes.text}
            type="color"
            label={'Default Background'}
            InputLabelProps={{
              className: classes.label,
            }}
            value={theme.palette.background.default}
            onChange={this.handleChangePalette('background', 'default')}
          />
          <TextField
            className={classes.text}
            type="color"
            label={'Paper Background'}
            InputLabelProps={{
              className: classes.label,
            }}
            value={theme.palette.background.paper}
            onChange={this.handleChangePalette('background', 'paper')}
          />
          <div style={{ width: 170 }} />
        </div>

        <div className={classes.row} style={{ margin: '0 auto', marginTop: 25, display: 'flex', width: 300, justifyContent: 'space-around' }}>
          <Button color="primary" variant="outlined" onClick={this.save}> Save Theme </Button>
          {false && (<Button color="secondary" variant="outlined" onClick={() => this.setState({ showAce: !this.state.showAce })}> Show Full Editor </Button>)}
        </div>

        <div>
          <div style={{ textAlign: 'center', marginTop: 25 }}>
            <Typography variant="body2" style={{ marginTop: 15, }}>
              Try fonts from <a href="https://fonts.google.com/">Google</a>.
            </Typography>
            <Typography variant="body2" style={{ marginTop: 15, }}>
              You'll need weights 300, 400, 500, and 700
            </Typography>
            <Typography variant="body2" style={{ marginTop: 15, }}>
              You'll need to find the link that looks like <br />
              {"<link href=\"https://fonts.googleapis.com/css?family=Montserrat:300,400,500,700&display=swap\" rel=\"stylesheet\">"} <br />
              and just enter <strong>"https://fonts.googleapis.com/css?family=Montserrat:300,400,500,700&display=swap"</strong> <br/>
              into the Font URL field.
            </Typography>
            <Typography variant="body2" style={{ marginTop: 15, }}>
              You'll also need the font name, for example, the above link is for 'Montserrat'
            </Typography>
            <Typography variant="body2" style={{ marginTop: 15, }}>
              Fonts will only be able to be previewed once you deploy.
            </Typography>
          </div>
        </div>

        {false && showAce && (
          <AceEditor
            mode="json"
            theme="monokai"
            style={{ width: '100%', height: '76vh' }}
            onChange={this.handleChangeTheme('theme')}
            value={JSON.stringify(theme, null, 2)}
            fontSize={15}
            highlightActiveLine={true}
            showPrintMargin={true}
            showGutter={true}
            name="theme-editor"
            editorProps={{ $blockScrolling: true }}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: true,
              showLineNumbers: true,
              tabSize: 2,
            }}
            annotations={this.state.annotations}
          />
        )}
      </div>
    );
  }
}

ThemeEditor.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(ThemeEditor));
