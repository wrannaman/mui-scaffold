import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import DragSource from '../../components/Shared/DragSource';
import Dropzone from 'react-dropzone'

import { IconButton, Tooltip, Button, CircularProgress, Typography } from '@material-ui/core';

import EditIcon from '@material-ui/icons/Edit';

import { getPresignedURL, saveMedia } from '../../src/apiCalls/media'

const styles = theme => ({
  root: {
  },
  drop: {
    width: '90%',
    height: 200,
    border: `1px solid ${theme.palette.primary.main}`,
    padding: '10%',
    margin: '5%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

const uploadFile = (file, url) => new Promise(async (resolve, reject) => {
  try {
    const res = await fetch(url, {
      method: 'PUT',
      body: file
    });
    return resolve(res);
  } catch (e) {
    return reject('Upload failed');
  }
});

@inject('store')
@observer
class FileUpload extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      waiting: false,
    };
    this.count = 0;
  }

  handleFile = async (f) => {
    const {
      snack: { snacky },
      project: { project: { s3: { bucket } } }
    } = this.props.store;
    try {
      const { router: { query: { projectID } } } = this.props;
      const pre = await getPresignedURL({ fileName: f.name, fileType: f.type, projectID })
      const { presigned, fileName } = pre;
      const up = await uploadFile(f, presigned);
      const key = presigned.split(bucket)[1].split('?')[0].replace('/', '');
      const save = await saveMedia({
        size: f.size,
        projectID,
        fileName: f.name,
        fileType: f.type,
        Key: key
      });
      this.props.fetchMedia();

      snacky(`Uploaded ${f.name}`);
    } catch (e) {
      snacky(`Upload failed for ${f.name}`, 'error');
    }
    this.count -= 1;
    if (this.count === 0) this.setState({ waiting: false });
  }

  handleChange = (files) => {
    const { maxFileSize, filesLimit } = this.props;
    const { snack: { snacky } } = this.props.store;

    if (files.length > filesLimit) return snacky(`You've exceeded the files limit of ${filesLimit}`, 'error')

    this.count = files.length;

    files.forEach(file => {
      // check max file size
      if (file.size > maxFileSize) return snacky(`You've exceeded the files size of ${maxFileSize}`, 'error')
      // Don't upload for file previews
      // this.handleFile(file);
    });
    this.setState({ waiting: true });

    setTimeout(() => {
      this.setState({ waiting: false });
      snacky('Files do not upload in a form preview.', 'warning')
    }, 500);
  }

  beginDrag = (nodeID) => (e) => {
    const { page: { update } } = this.props.store;
    update('dragging', nodeID);
  }

  endDrag = (nodeID) => (e) => {
    const { page: { update } } = this.props.store;
    update('dragging', false);
  }

  onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { page: { update } } = this.props.store;
    update('editing', this.props.id);
  }

  handleAcceptedFiles = (prop) => {
    if (!prop) return ["image/*", "video/*", "application/*"]
    const clone = prop.replace(', misc', ', application, text').replace(/,/g, '/*,').split(', ').map(item => {
      if (item.indexOf('/*') === -1) item += '/*';
      return item;
    });
    return clone;
  }

  render() {
    const { classes } = this.props;
    const { waiting } = this.state;
    const { page: { editing, dragging }, project: { getTheme } } = this.props.store;
    const isEditing = editing === this.props.id;

    let ele = null
    if (!waiting) {
      ele = (
        <div style={{ position: 'relative' }}>
          {this.props.__allowEdit && (
            <Tooltip title={'Edit FileUpload (this only shows up while editing your project)'}>
              <IconButton
                style={{ position: 'absolute', top: 0, left: 0 }}
                aria-label="edit project"
                onClick={this.onClick}
                color="primary"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          {!this.state.waiting && (
            <Dropzone onDrop={this.handleChange}>
              {({getRootProps, getInputProps}) => (
                <div {...getRootProps()} className={classes.dropZone} style={{ ...this.props.style }}>
                  <input {...getInputProps()} />
                  <Typography
                    style={{ color: getTheme().palette.text.primary }}
                    variant="body1"
                  >
                    {this.props.message}
                  </Typography>
                </div>
              )}
            </Dropzone>
          )}
          {this.state.waiting && (
            <div style={{ width: '100%', height: 250, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress color="secondary" style={{ margin: '0 auto' }} />
            </div>
          )}
        </div>
      );
    }
    if (!this.props.__allowEdit) return ele;
    if (isEditing) {
      return (
        <div>
        <DragSource
          nodeID={this.props.id}
          name="File Upload"
          type="node"
          beginDrag={this.beginDrag(this.props.id)}
          endDrag={this.endDrag(this.props.id)}
        />
        {ele}
        </div>
      );
    }
    return ele;
  }


}

FileUpload.defaultProps = {
  onClick: () => {
  }
}

FileUpload.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(FileUpload));
