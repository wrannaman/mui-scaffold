import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { Tooltip, IconButton, TablePagination, Typography } from '@material-ui/core';
import { pdfjs, setOptions, Document, Page } from 'react-pdf';
import { fetchMedias, deleteMedia } from '../../src/apiCalls/media';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import DeleteIcon from '@material-ui/icons/Delete';
import LinkIcon from '@material-ui/icons/Link';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const WIDTH = 300;

const styles = theme => ({
  root: {
  },
  media: {
    width: '100%',
  },
  mediaContainer: {
    width: WIDTH,
    margin: 10,
    position: 'relative'
  },
  document: {
    width: WIDTH,
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  deleteButton: {
    position: 'absolute',
    top: -0,
    right: -10,
    zIndex: 999,
  },
  copy: {
    position: 'absolute',
    top: -10,
    left: -10,
    zIndex: 999,
  }
});

@inject('store')
@observer
class MediaDisplay extends React.Component {
  state = {
    pages: {},
    shouldDelete: {},
  };

  componentDidMount() {
    this.init()
  }

  onDocumentLoadSuccess = (mediaID) => ({ numPages }) => {
    const clone = Object.assign({}, this.state.pages);
    if (!clone[mediaID]) clone[mediaID].numPages = numPages;
    this.setState({ pages: clone });
  }

  init = async (limit = 5, page = 0) => {
    const { media: { setMedia } } = this.props.store;
    const { router: { query: { projectID } } } = this.props;
    const medias = await fetchMedias({ limit, page, projectID });
    if (medias.medias) setMedia(medias.medias);
  }

  handleChangePage = (e, page) => {
    const { media: { limit } } = this.props.store;
    this.init(limit, page);
  }

  handleChangeRowsPerPage = (e) => {
    const { media: { update, page } } = this.props.store;
    this.init(e.target.value, 0);

  }

  getPDF = (classes, media, pages) => (
    <React.Fragment>
      <Document
        file={media.signed}
        onLoadSuccess={this.onDocumentLoadSuccess}
        className={classes.document}
      >
        <Page
          width={WIDTH}
          pageNumber={pages[media._id] ? pages[media._id].pageNumber : 1}
        />
      </Document>
      <Typography variant="body2">
        Page of {pages[media._id] ? pages[media._id].numPages : 0}
      </Typography>
      <Typography variant="body2">{media.name}</Typography>
    </React.Fragment>
  )

  getImage = (classes, media) => (
    <React.Fragment>
      <img
        key={media._id}
        src={media.signed}
        className={classes.media}
      />
      <Typography variant="body2">{media.name}</Typography>
    </React.Fragment>
  )

  getDefaultMedia = (classes, media) => (
    <React.Fragment>
      <Typography variant="body2">{media.name} ({media.type})</Typography>
    </React.Fragment>
  )


  getVideo = (classes, media) => (
    <React.Fragment >
      <video
        key={media._id}
        src={media.signed}
        className={classes.media}
        controls
      >
        <source src={media.signed} type={media.type} />
        Your browser does not support HTML5 video.
      </video>
      <Typography variant="body2">{media.name}</Typography>
    </React.Fragment>
  )

  delete = (mediaID) => async (e) => {
    const { shouldDelete } = this.state;
    const { router: { query: { projectID } } } = this.props;
    const { media: { limit, page }, snack: { snacky } } = this.props.store;

    if (!shouldDelete[mediaID]) {
      const clone = Object.assign({}, shouldDelete);
      clone[mediaID] = true;
      this.setState({ shouldDelete: clone });
      return setTimeout(() => {
        delete clone[mediaID];
        this.setState({
          shouldDelete: clone,
        })
      }, 3000);
    }
    const del = await deleteMedia({ id: mediaID, project: projectID });
    snacky("Deleted");
    this.init(limit, page);
  }

  nakedURL = (u) => {
    u = u.split('?')[0];
    return u;
  }

  onCopy = () => {
    const { snack: { snacky } } =  this.props.store;
    snacky('copied')
  }

  render() {
    const { pages, shouldDelete } = this.state;
    const { media: { medias, limit, offset, totalDocs, rowsPerPage } } = this.props.store;
    const { classes, router } = this.props;
    return (
      <div>
        <div className={classes.container}>
          {medias.map((media) => {
            let inner = null;
            switch (media.type) {
              case 'application/pdf':
                inner = this.getPDF(classes, media, pages);
                break;
              case 'image/png':
              case 'image/jpg':
              case 'image/jpeg':
                inner = this.getImage(classes, media);
                break;
              case 'video/mp4':
                inner = this.getVideo(classes, media);
                break;
              default:
                inner = this.getDefaultMedia(classes, media);
            }
            return (
              <div key={media._id} className={classes.mediaContainer}>
                <Tooltip title="Delete Media">
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={this.delete(media._id)}
                    className={classes.deleteButton}
                    color={'primary'}
                    size="small"
                    style={{ background: '#fff' }}
                  >
                    <DeleteIcon color={shouldDelete[media._id] ? "error" : 'primary'} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Copy URL">
                <CopyToClipboard
                  text={this.nakedURL(media.signed)}
                  onCopy={this.onCopy}
                >
                    <IconButton
                      edge="end"
                      aria-label="copy"
                      className={classes.copy}
                      color={'primary'}
                      size="small"
                      style={{ background: '#fff' }}
                    >
                      <LinkIcon color={'primary'} />
                    </IconButton>
                  </CopyToClipboard>
                </Tooltip>
                {inner}
              </div>
            )
          })}
        </div>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalDocs}
          rowsPerPage={limit}
          page={offset / limit}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </div>
    );
  }
}

MediaDisplay.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(MediaDisplay));
