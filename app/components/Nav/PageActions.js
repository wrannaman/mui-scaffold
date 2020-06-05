import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';

import { InputLabel, Select, Avatar, MenuItem, InputBase, IconButton, Menu, Drawer, AppBar, List, Toolbar, Divider, Typography, Tooltip, Fab } from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import SaveIcon from '@material-ui/icons/Save';

import { INVALID_PAGE_NAMES } from '../../utils/constants';

import { savePage, deletePage } from '../../src/apiCalls/page';
import { fetchProject } from '../../src/apiCalls/project';


const styles = theme => ({
  root: {
  },
  flexRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fab: {
    marginLeft: 10
  }
});

@inject('store')
@observer
class PageActions extends React.Component {
  state = {};

  savePage = async () => {
    const { router: { query: { pageID, projectID } } } = this.props;
    const { snack: { snacky }, page: { boundDataModel, name, displayName, nodes, auth, visibility, order, showNav } } = this.props.store;
    const toJSON = nodes.toJSON();
    if (INVALID_PAGE_NAMES.indexOf(name) !== -1) return snacky(`Cannot have a page named ${name}`, 'warning', 6000);
    const res = await savePage({ id: pageID, boundDataModel, page: toJSON, project: projectID, name, auth, visibility, displayName, order, showNav, });
    if (res.success) snacky('saved');
    else if (res.error) snacky(res.error, 'error');
    else snacky('error! ', 'error');
  }

  showNewPage = () => {
    const { page: { update } } = this.props.store;
    update('showNewPageDialog', true);
  }

  changePage = (e) => {
    const { router: { query } } = this.props;
    const { project: { update, project, pageIndex }, page: { updatePage } } = this.props.store;
    const { pages } = project;
    let idx = pageIndex;
    for (let i = 0; i < pages.length; i++) {
      if (pages[i]._id === e.target.value) {
        idx = i;
        break;
      }
    }
    updatePage('displayName', '');
    updatePage('visibility', 'all');
    updatePage('auth', '');
    updatePage('type', '');
    updatePage('name', '');
    update('pageIndex', idx);
    Router.push({ pathname: '/pages', query: {...query, pageID: pages[idx]._id }, shallow: true });
  }

  deletePage = async () => {
    const { router: { query: { projectID, pageID } } } = this.props;
    const { project: { update, project, pageIndex }, repeatable: { repeatables }, snack: { snacky } } = this.props.store;
    if (!this.state.confirmDelete) {
      this.setState({ confirmDelete: true })
      return setTimeout(() => {
        this.setState({ confirmDelete: false })
      }, 3000)
    }
    this.setState({ confirmDelete: false });

    // check if this page is in use by other pages.
    let inUseForPage = false
    project.pages.forEach((page) => {
      if (!page.page) return;
      const str = JSON.stringify(toJS(page.page));
      if (str.indexOf(pageID) !== -1) inUseForPage = page.name;
    });
    if (inUseForPage) return snacky(`This page is in use by the "${inUseForPage}" page.\nDelete the reference before deleting this page.`, 'error', 6000)

    let inUseForComponent = false;
    repeatables.forEach((component) => {
      if (!component.node) return;
      const str = JSON.stringify(toJS(component.node));
      if (str.indexOf(pageID) !== -1) inUseForComponent = component.name;
    })
    if (inUseForComponent) return snacky(`This page is in use by the "${inUseForComponent}" component.\nDelete the reference before deleting this page.`, 'error', 6000)

    const deleted = await deletePage({ id: pageID, projectID });
    const proj = await fetchProject({ projectID });
    if (proj.success) {
      update('project', proj.project);
      Router.push({ pathname: '/pages', query: { projectID }, shallow: true });
    }

  }

  render() {
    const { confirmDelete } = this.state;
    const { pages } = this.props;
    const {
      project: { pageIndex },
    } = this.props.store;
    const { classes, router: { pathname } } = this.props;
    const onEditingPage = pathname.indexOf('/pages') !== -1;

    return (
      <div className={classes.flexRow}>
        {onEditingPage && pages.length > 0 && typeof pageIndex !== 'undefined' && pages[pageIndex] && (
          <div className={classes.flexRow} style={{ marginLeft: 15 }}>
            <InputLabel htmlFor="page" style={{ color: '#fff'}}>Page</InputLabel>
            <Select
              value={pages[pageIndex]._id}
              onChange={this.changePage}
              style={{ width: 200, color: '#fff', marginLeft: 10, borderBottom: '1px solid #fff' }}
              variant={'outlined'}
              classes={{ icon: classes.icon }}
              inputProps={{
                name: 'page',
              }}
            >
            {pages.map((page) => (<MenuItem key={page._id} value={page._id}>{page.name}</MenuItem>))}
            </Select>
          </div>
        )}
        {onEditingPage && (
          <div className={classes.flexRow} style={{ marginLeft: 15 }}>
            <Tooltip title="Create New Page">
              <Fab size="small" color="primary" aria-label="add" className={classes.fab} onClick={this.showNewPage}>
                <AddIcon />
              </Fab>
            </Tooltip>
            <Tooltip title="Delete Page">
              <Fab size="small" color="primary" aria-label="delete" className={classes.fab} onClick={this.deletePage}>
                <DeleteForeverIcon style={{ color: confirmDelete ? 'red' : '#fff' }} />
              </Fab>
            </Tooltip>
            <Tooltip title="Save Page">
              <Fab size="small" color="primary" aria-label="save" className={classes.fab} onClick={this.savePage}>
                <SaveIcon style={{ color: '#fff' }} />
              </Fab>
            </Tooltip>
          </div>
        )}
      </div>
    );
  }
}

PageActions.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(PageActions));
