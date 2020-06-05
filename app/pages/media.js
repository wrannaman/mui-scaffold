import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';

import Side from '../components/Nav/Side';
import Auth from '../src/Auth';

import { fetchProject, createProjectStorage } from '../src/apiCalls/project';
import { fetchMedias } from '../src/apiCalls/media';

import { Grid, Button, FormHelperText, FormControl, Select, InputLabel, CircularProgress, MenuItem } from '@material-ui/core';

import dynamic from 'next/dynamic';

const ImageUpload = dynamic(
  () => import('../components/Media/ImageUpload'),
  { ssr: false }
);

import MediaDisplay from '../components/Media/MediaDisplay'

const styles = theme => ({
  flexRow: {
    display: 'flex',
    flexDirection: 'row'
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
  formColumn: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    marginTop: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formControl: {
    marginBottom: 25,
    width: 200,
  }
});

@inject('store')
@observer
class Media extends React.Component {
  state = {
    location: 'us-west-1',
    disabled: false,
    ready: false,
  }

  async componentDidMount() {
    this.auth = new Auth();
    const {
      auth: { checkTokenAndSetUser },
      project: { limit, page, setProjects }
    } = this.props.store;
    const { query: { pageID } } = this.props.router;
    if (!this.auth.isAuthenticated()) {
      Router.push('/');
    }
    const { token } = this.auth.getSession();
    await checkTokenAndSetUser({ token });

    this.init();
  }

  init = async () => {
    const { project: { update } } = this.props.store;
    const { query: { projectID } } = this.props.router;
    const proj = await fetchProject({ projectID });
    if (proj.success) update('project', proj.project);
    this.setState({ ready: true })
    this.handleHelp();
  }

  handleHelp = () => {
    const {
      auth: { update, user, mediaSteps },
    } = this.props.store;
    // if (!user.intros || !user.intros.media) {
    //   update('steps', mediaSteps);
    //   update('tourOpen', true);
    //   update('tourName', 'media');
    // }
  }


  createStorage = async () => {
    this.setState({ disabled: true });
    const { location } = this.state;
    const { project: { update }, snack: { snacky } } = this.props.store;
    const { query: { projectID } } = this.props.router;
    const updatedProject = await createProjectStorage({ projectID, location });
    if (updatedProject.project) {
      update('project', updatedProject.project);
      snacky('Storage created');
    } else {
      snacky('Storage creation error', 'error');
    }
    this.setState({ disabled: false });
  }

  fetchMedia = async (limit = 5, page = 0) => {
    const { media: { setMedia } } = this.props.store;
    const { router: { query: { projectID } } } = this.props;
    const medias = await fetchMedias({ limit, page, projectID });
    if (medias.medias) setMedia(medias.medias);
  }

  render() {
    const { disabled, ready } = this.state;
    const { classes } = this.props;
    const { project: { project } } = this.props.store;
    const storageIsSetUp = project.s3 && project.s3.key;
    if (!ready) return (
      <Side
        showSearch={false}
        title={`${project.name} - Media`}
      >
        <Grid item xs={12} alignItems="center" alignContent="center" justify="center" style={{ display: 'flex', paddingBottom: 25, marginTop: 75  }}>
          <CircularProgress color="secondary" />
        </Grid>
      </Side>
    )
    return (
      <Side
        showSearch={false}
        title={`${project.name} - Media`}
      >
        <div className={classes.flexRow}>
          <div className={classes.flexColumWidth} id="media-top">
            {!storageIsSetUp && (
              <div className={classes.formColumn}>
                <FormControl className={classes.formControl}>
                  <InputLabel id="bucket-location">Bucket Location</InputLabel>
                  <Select
                    labelId="bucket-location"
                    id="bucket-location-select"
                    value={this.state.location}
                    onChange={this.handleChange}
                  >
                    <MenuItem value={'us-west-1'}>us-west-1</MenuItem>
                    <MenuItem value={'eu-central-1'}>eu-central-1</MenuItem>
                    <MenuItem value={'us-east-2'}>us-east-2</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  onClick={this.createStorage}
                  variant="contained"
                  color="primary"
                  disabled={disabled}
                >
                  Create Storage Bucket
                </Button>
              </div>
            )}
            {storageIsSetUp && (
              <div>
                <ImageUpload fetchMedia={this.fetchMedia}/>
                <MediaDisplay />
              </div>
            )}
          </div>
        </div>
      </Side>
    );
  }
}

Media.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Media));
