import React from 'react';
import Router, { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import { withStyles, ThemeProvider } from '@material-ui/core/styles';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import dynamic from 'next/dynamic';

import Renderer from '../components/Renderer/Renderer';
import RepeatablePreview from '../components/Repeatable/RepeatablePreview';
import FormPreview from '../components/Repeatable/FormPreview';
const CodeEditor = dynamic(
  () => import('../components/Repeatable/CodeEditor'),
  { ssr: false }
);

import Side from '../components/Nav/Side';
import Auth from '../src/Auth';
const CodeExport = dynamic(
  () => import('../components/Repeatable/CodeExport'),
  { ssr: false }
);

import { AppBar, Tabs, Tab, Box, Typography } from '@material-ui/core';

import { fetchProject } from '../src/apiCalls/project';
import { fetchRepeatables } from '../src/apiCalls/repeatable';
import { fetchDatas } from '../src/apiCalls/data';

const styles = theme => ({
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    paddingTop: 25,
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column'
  },
  flexColumWidth: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  paper: {
    minWidth: 300,
    minHeight: 300
  },
  formControl: {
    width: 200,
  },
  container: {
    marginTop: 25,
  }
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

@inject('store')
@observer
class EditorPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      showPreview: false,
      tabIndex: 0,
    }
  }

  async componentDidMount() {
    this.auth = new Auth();
    const {
      auth: { checkTokenAndSetUser },
      project: { limit, page, setProjects },
    } = this.props.store;
    const { query: { repeatableID } } = this.props.router;
    if (!this.auth.isAuthenticated()) {
      Router.push('/');
    }
    const { token } = this.auth.getSession();
    await checkTokenAndSetUser({ token });
    await this.init(repeatableID);
    this.handleHelp();

  }

  componentWillUpdate(nextProps) {
    const { page: { nodes } } = this.props.store;
    const { query: { repeatableID } } = this.props.router;
    if (repeatableID !== nextProps.router.query.repeatableID) {
      this.init(nextProps.router.query.repeatableID);
    }
    // this.prevNodes = nodes.toJSON();
  }

  init = async (nextRepeatable = false) => {
    this.setState({ showPreview: false });

    const {
      page: { setNodes, nodes, updatePage, resetComponents, setRepeatableNodes },
      repeatable: { update, repeatables, workingIndex },
      project: { updateProject },
      data: { updateData },
      snack: { snacky }
    } = this.props.store;
    const { query: { projectID } } = this.props.router;

    const res = await fetchDatas({ projectID, limit: 25 });
    if (res.success) {
      updateData('datas', res.datas.docs);
    }
    const repeat = await fetchRepeatables({ project: projectID })
    if (repeat.repeatables) update('repeatables', repeat.repeatables);

    // we need to clear out the page. essentailly the repeatable component is a single node
    setNodes({ id: '', name: '', team: '' });
    const proj = await fetchProject({ projectID });
    if (proj.success) {
      updateProject('project', proj.project);
      let idx = -1;
      for (let i = 0; i < repeat.repeatables.length; i++) {
        if (repeat.repeatables[i]._id === nextRepeatable) {
          idx = i;
          break;
        }
      }
      if (idx === -1) {
        for (let i = 0; i < repeat.repeatables.length; i++) {
          if (repeat.repeatables[i].type !== 'table') {
            idx = i;
            break;
          }
        }
      }
      let repeatableID = '';
      if (!nextRepeatable) {
        // if (nextRepeatable) repeatableID = nextRepeatable;
        if (repeat.repeatables.length > 0 && repeat.repeatables[idx]) {
          repeatableID = repeat.repeatables[idx]._id;
          Router.push({ pathname: '/component', query: { projectID, repeatableID }, shallow: true });
        }
      }
      update('workingIndex', idx);
      const rep = repeat.repeatables[idx];
      if (!rep) return;
      if (rep.type === 'repeatable') setRepeatableNodes();
      if (rep.type === 'form') resetComponents();
      setNodes({ id: rep._id, name: rep.name, page: rep.node });
      updatePage('render', new Date().getTime());

      let whichData = res.datas.docs[0];
      let hasBoundData = false;
      res.datas.docs.forEach(d => {
        if (d.name === repeat.repeatables[idx].boundDataModel) {
          whichData = d;
          hasBoundData = true;
        }
      });
      updateData('data', whichData);
      if (!hasBoundData && rep.type !== 'basic') {
        const clone = repeat.repeatables.slice();
        clone[idx].boundDataModel = whichData.name;
        clone[idx].boundDataModelID = whichData._id;
        setTimeout(() => {
          update('repeatables', clone);
        }, 500);
      }
      this.setState({ showPreview: true });

    } else {
      snacky(proj.error, 'error');
    }
  }

  handleHelp = () => {
    const {
      auth: { update, user, componentSteps },
    } = this.props.store;
    // if (!user.intros || !user.intros.components) {
    //   update('steps', componentSteps);
    //   update('tourOpen', true);
    //   update('tourName', 'components');
    // }
  }

  handleClose = () => {
    const { page: { update } } = this.props.store;
    update('demoComponent', '');
  }

  clearEditing = () => {
    const { page: { update } } = this.props.store;
    update('editing', '');
  }

  tabChange = (e, tabIndex) => {
    this.setState({ tabIndex })
  }

  render() {
    const { classes } = this.props;
    const { loading, showPreview, tabIndex } = this.state;
    const {
      page: { render, demoComponent, nodes },
      project: { getTheme, project: { name, pages } },
      repeatable: { repeatables, workingIndex }
    } = this.props.store;
    // const repeatable = repeatables[workingIndex];
    /*

    */
    return (
      <Side
        showSearch={false}
        title={`${name.slice(0, 20)} ${name.length > 20 ? '...' : ''} Components`}
        pages={pages}
        hideOpen={true}
        onMainClick={this.clearEditing}
      >
        <AppBar position="static">
          <Tabs value={tabIndex} onChange={this.tabChange} aria-label="simple tabs example">
            <Tab label="Design" />
            <Tab label="Code" />
          </Tabs>
        </AppBar>
        <TabPanel value={tabIndex} index={0}>
          <ThemeProvider theme={getTheme()}>
            <div id="components-first" className={classes.container} onClick={this.clearEditing} style={{ backgroundColor: getTheme().palette.background.default }}>
              <div
                className={classes.flexColumWidth}
                onClick={this.clearEditing}
              >
                {repeatables[workingIndex] && repeatables[workingIndex].type === 'code' && (
                  <CodeEditor
                    index={workingIndex}
                    repeatable={repeatables[workingIndex]}
                  />
                )}
                {repeatables[workingIndex] && repeatables[workingIndex].type !== 'code' && <Renderer />}
                {showPreview && render > 0 && repeatables[workingIndex] && repeatables[workingIndex].type === 'repeatable' && (
                  <RepeatablePreview
                    nodes={nodes}
                    repeatable={repeatables[workingIndex]}
                  />
                )}
                {showPreview && render > 0 && repeatables[workingIndex] && repeatables[workingIndex].type === 'form' && (
                  <FormPreview
                    nodes={nodes}
                    repeatable={repeatables[workingIndex]}
                  />
                )}
              </div>
            </div>
          </ThemeProvider>
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          <CodeExport />
        </TabPanel>
      </Side>
    );
  }
}

EditorPage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(EditorPage));
