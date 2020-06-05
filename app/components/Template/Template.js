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

import { updateProject, deleteProject, cloneProject } from '../../src/apiCalls/project';
import { updateUser } from '../../src/apiCalls/user';

const styles = theme => ({
  root: {
    // width: 325,
    // position: 'relative',
    // padding: 25,
    // height: 250,
  },
  card: {
    width: 325,
    height: 250,
    margin: 25,
  },
  cardContent: {
    height: 200,
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

  closeTour = async () => {
    const { snack: { snacky }, auth: { tourName, update, setLocalUser, user } } = this.props.store;
    const { name, intros, wantToBuild, isDeveloper } = user;
    if (tourName) {
      const clone = toJS(intros);
      clone[tourName] = true;
      console.log('CLONE[TOURNAME]', tourName, 'to ', clone[tourName])
      const res = await updateUser({ name, wantToBuild, intros: clone, isDeveloper });
      setLocalUser({ ...user, intros: clone, name, wantToBuild, isDeveloper });
    }
    update('tourOpen', false);
    update('steps', []);
    update('tourName', '');
  }

  clone = (id) => async () => {
    this.closeTour();
    if (this.props.onClick) {
      this.props.onClick();
    }
    const { router: { query: { projectID } } } = this.props;
    const { snack: { snacky }, project: { update } } = this.props.store;
    this.closeTour();

    update('showAfterClone', true);
    const res = await cloneProject({ projectID, toClone: id });
    if (this.props.onClone) this.props.onClone();
    if (res.success) {
      update('project', res.project);
      update('showAfterClone', true);
      snacky('Cloned!');
    } else {
      snacky('There was an error clonging this project', 'error');
    }
  }

  hasStuffInProject = () => {
    const { project: { project }, repeatable: { repeatables }, data: { datas } } = this.props.store;
    if (project.pages.length > 0 || repeatables.length > 0 || datas.length > 2) return true;
    return false;
  }

  render() {
    const { showExtras, shouldDelete } = this.state;
    const { template, classes, index } = this.props;
    const { title, description, price } = template.template;
    return (
      <div className={classes.root} id={index === 0 ? 'template-container' : `template-container-${index}`}>
        <Card className={classes.card}>
          <CardContent className={classes.cardContent}>
            <Typography variant="h6" className={classes.title} color="textSecondary" gutterBottom>
              {title.slice(0, 22)} {title.length > 22 ? '...' : ''}
            </Typography>
            <Typography variant="overline" className={classes.title} color="textSecondary" gutterBottom>
              {price ? `$${price.toFixed(2)}` : "Free"}
            </Typography>
            <Typography variant="body1" className={classes.title} color="textSecondary" gutterBottom>
              {description.slice(0, 120)} {description.length > 120 ? '...' : ''}
            </Typography>
          </CardContent>
          <CardActions className={classes.flexRow}>
            <Button
              className={classes.button}
              size="small"
              variant="contained"
              color="primary"
              id={index === 0 ? 'template-demo' : `template-demo-${index}`}
              onClick={() => window.open(template.deployment.app_url.dev, '_blank')}
            >
              Demo
            </Button>
            <Tooltip title="This will remove all items in this project and replace it with the template.">
              <Button
                className={classes.button}
                size="small"
                variant="outlined"
                color="primary"
                onClick={this.clone(template.id)}
                disabled={this.hasStuffInProject()}
                id={index === 0 ? 'template-clone' : `template-clone-${index}`}
              >
                Clone
              </Button>
            </Tooltip>
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
  template: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  fetchProjects: PropTypes.func,
};

export default withRouter(withStyles(styles)(ProjectCard));
