import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { CircularProgress, Typography } from '@material-ui/core';
import Dropzone from 'react-dropzone'


import { getPresignedURL, saveMedia } from '../../src/apiCalls/media'

const styles = theme => ({
  root: {
  },
  image: {
    maxWidth: 100,
  },
  dropZone: {
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
class ImageUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      waiting: false,
      counter: 1,
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
    this.count = files.length;
    files.forEach(file => {
      this.handleFile(file);
    });

    setTimeout(() => {
      this.setState({ waiting: true });
    }, 500);
  }

  render() {
    const { files, counter, waiting } = this.state;
    const { classes, router } = this.props;
    return (
      <div>
        {!waiting && (
          <Dropzone onDrop={this.handleChange}>
            {({getRootProps, getInputProps}) => (
              <div {...getRootProps()} className={classes.dropZone}>
                <input {...getInputProps()} />
                <Typography variant="body1">
                  Drop a file or two 🗂!
                </Typography>
              </div>
            )}
          </Dropzone>
        )}
        {waiting && (
          <div style={{ width: '100%', height: 250, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress color="secondary" style={{ margin: '0 auto' }} />
          </div>
        )}
      </div>
    );
  }
}

ImageUpload.defaultProps = {
  fetchMedia: () => {},
};

ImageUpload.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  fetchMedia: PropTypes.func,
};

export default withRouter(withStyles(styles)(ImageUpload));
