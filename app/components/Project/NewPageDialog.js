import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';

import { savePage, getPage } from '../../src/apiCalls/page';
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
});

@inject('store')
@observer
class NewPageDialog extends React.Component {
  state = {
    name: '',
    selected: '',
  };

  submit = async (e) => {
    e.preventDefault();
    const { name, selected } = this.state;
    const { router: { query: { pageID, projectID } } } = this.props;
    const {
      snack: { snacky },
      page: { nodes, update, setNodes, setRepeatableNodes },
      project: { updateProject }
    } = this.props.store;
    const toJSON = nodes.toJSON();
    const res = await savePage({ project: projectID, name, cloneFrom: selected });
    if (res.success) {
      const proj = await fetchProject({ projectID });
      if (proj.success) updateProject('project', proj.project);
      this.setState({ name: '', selected: '' });
      snacky('saved');
      update('showNewPageDialog', false);
      update('render', new Date().getTime());

      if (proj.project.pages.length === 1) {
        Router.push({
          pathname: '/pages',
          query: { projectID, pageID: proj.project.pages[0]._id },
          shallow: true
        });
        let res2 = null;
        if (proj.project.pages.length > 0) {
          updateProject('pageIndex', 0);
          res2 = await getPage({ id: proj.project.pages[0]._id });
          setNodes(res.page);
          setRepeatableNodes();
        }
      }

    } else {
      snacky(res.error ? res.error : 'error!', 'error');
    }
  }

  handleClose = () => {
    const { page: { update } } = this.props.store;
    update('showNewPageDialog', false);
  }

  render() {
    const { page: { showNewPageDialog }, project: { pageIndex, project: { pages } } } = this.props.store;
    const { classes, router } = this.props;
    // if (!pages) return null;
    return (
      <Dialog open={showNewPageDialog} onClose={this.handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Create A New Page</DialogTitle>
        <form onSubmit={this.submit}>
        <DialogContent>
          <DialogContentText>
            Name your new page, and (optionally) select if you'd like to clone from another page
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="New Page Name"
            value={this.state.name}
            onChange={(e) => this.setState({ name: e.target.value.replace(/[^A-Za-z]/g, '') })}
            type="text"
          />
          {pages.length > 0 && (
            <div style={{ marginTop: 15 }}>
              <InputLabel htmlFor="clone">Clone From</InputLabel>
              <Select
                value={this.state.selected}
                onChange={(e) => this.setState({ selected: e.target.value })}
                variant={'outlined'}
                classes={{ icon: classes.icon }}
                style={{ marginTop: 5 }}
                inputProps={{
                  name: 'clone',
                }}
              >
              {pages.map((page) => (<MenuItem key={page._id} value={page._id}>{page.name}</MenuItem>))}
              <MenuItem value="">None</MenuItem>

              </Select>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleClose} color="primary">
            Cancel
          </Button>
          <Button type="submit" color="primary" variant="contained" disabled={!this.state.name}>
            Create Page
          </Button>
        </DialogActions>
        </form>
      </Dialog>
    );
  }
}

NewPageDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(NewPageDialog));
