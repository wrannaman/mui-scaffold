import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';

import { IconButton, Tooltip, Switch, FormControlLabel, FormGroup, Typography, Button, CardContent, TextField, CardActions, Card } from '@material-ui/core';

import SaveIcon from '@material-ui/icons/Save';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

import { updateProject, deleteProject } from '../../src/apiCalls/project';

const styles = theme => ({
  root: {
    // width: 325,
    position: 'relative',
    // padding: 25,
    // minHeight: 250,
  },
  delete: {
    position: 'absolute',
    top: 10,
    right: 15,
  },
  button: {
    // width: 100,
    // height: 100,
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly'
  },
});

@inject('store')
@observer
class ProjectCard extends React.Component {
  state = {
    showExtras: false,
    shouldDelete: {}
  };

  update = (name) => (e) => {
    const { index } = this.props;
    const { project: { update, projects } } = this.props.store;
    const clone = toJS(projects).slice();
    clone[index][name] = e.target.checked;
    update('projects', clone);
  }

  save = async (e) => {
    e.preventDefault();
    const { index } = this.props;
    const { project: { update, projects }, snack: { snacky } } = this.props.store;
    const clone = toJS(projects).slice()[index];
    const res = await updateProject(clone);
    if (res.success) {
      snacky('Project Saved');
      this.toggleExtras();
    } else {
      snacky(res.error, 'error');
    }
  }

  toggleExtras = () => {
    this.setState({
      showExtras: !this.state.showExtras
    });
  }

  handleClick = () => {
    const { project, classes } = this.props;
    const { router: { query: { redirect } } } = this.props;
    const { project: { limit, page, setProjects  }, auth: { user, update, projectSteps } } = this.props.store;

    if (!user.intros || !user.intros.tutorial) {
      return Router.push({ pathname: `/intro`, query: { projectID: project._id }});
    }

    if (redirect) return Router.push({ pathname: `/${redirect}`, query: { projectID: project._id }});
    else Router.push({ pathname: `/components`, query: { projectID: project._id }});
  }

  change = (name) => (e) => {
    const { index } = this.props;
    const { project: { update, projects } } = this.props.store;
    const clone = toJS(projects).slice();
    clone[index][name] = e.target.value;
    update('projects', clone);
  }

  delete = (id) => async (e) => {
    const { repeatable: { repeatables, update }, snack: { snacky } } = this.props.store;
    if (!this.state.shouldDelete[id]) {
      const clone = Object.assign({}, this.state.shouldDelete);
      clone[id] = true;
      this.setState({ shouldDelete: clone });
      return setTimeout(() => {
        clone[id] = false;
        this.setState({ shouldDelete: clone });
      }, 3000);
    } else {
      const deleted = await deleteProject(id);
      snacky('Deleted');
      this.props.fetchProjects();
    }
  }

  render() {
    const { showExtras, shouldDelete } = this.state;
    const { project, classes, index } = this.props;
    return (
      <div
        className={classes.root}
        id={index === 0 ? 'first-project' : `first-project-${project._id}`}
      >
        <Card className={classes.card}>
          <CardContent>
            <Typography className={classes.title} color="textSecondary" gutterBottom>
              {project.name}
            </Typography>
            {false && (
              <Typography variant="overline">
                Options
              </Typography>
            )}
            <form className={classes.row}>
              {false && (
                <FormGroup row>
                  <Tooltip title="Users must log in to see the pages in your app.">
                    <FormControlLabel
                      control={
                          <Switch
                            checked={project.authentication}
                            onChange={this.update('authentication')}
                            value="authentication"
                          />
                      }
                      label="Authentication"
                    />
                  </Tooltip>
                </FormGroup>
              )}
              {showExtras && (
                <React.Fragment>
                    <Tooltip title={'Delete Project. Warning, this cannot be undone.'}>
                      <IconButton color="primary" edge="end" aria-label="delete" className={classes.delete} onClick={this.delete(project._id)}>
                        <DeleteIcon color={shouldDelete[project._id] ? "error" : 'inherit'} />
                      </IconButton>
                    </Tooltip>
                    <TextField
                      name="Project Name"
                      value={project.name}
                      onChange={this.change('name')}
                      label={"Project Name"}
                    />
                </React.Fragment>
              )}
              {showExtras && (
                <Tooltip title={'Save project settings.'}>
                  <IconButton
                    className={classes.button}
                    aria-label="edit project"
                    onClick={this.save}
                    color="primary"
                    type="submit"
                  >
                    <SaveIcon />
                  </IconButton>
                </Tooltip>
              )}
            </form>
          </CardContent>
          <CardActions className={classes.flexRow}>
            <Button
              className={classes.button}
              size="small"
              variant="outlined"
              color="primary"
              onClick={this.handleClick}
              id={index === 0 ? 'first-project-select' : `first-project-select-${project._id}`}
            >
              Select
            </Button>
            {!showExtras && (
              <Tooltip title={'Edit project settings.'}>
                <IconButton
                  className={classes.button}
                  aria-label="edit project"
                  onClick={this.toggleExtras}
                  color="primary"
                  id={index === 0 ? 'first-project-edit' : `first-project-edit-${project._id}`}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}

          </CardActions>
        </Card>
      </div>
    );
  }
}

ProjectCard.defaultProps = {
  fetchProjects: () => {},
};

ProjectCard.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  project: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  fetchProjects: PropTypes.func,
};

export default withRouter(withStyles(styles)(ProjectCard));
