import React from 'react'
import { DragSource } from 'react-dnd';
import { Grid, Paper, Typography } from '@material-ui/core';

const style = {
  border: '1px dashed gray',
  padding: 10,
  margin: 10,
  // backgroundColor: 'white',
  // padding: '0.5rem 1rem',
  // marginRight: '1.5rem',
  // marginBottom: '1.5rem',
  // cursor: 'move',
  // float: 'left',
}
export const Box = (props) => {
  const { name, type, isDropped, isDragging, connectDragSource } = props;
  const opacity = isDragging ? 0.4 : 1
  //     <div >{isDropped ? <s>{name}</s> : name}</div>,
  switch (type) {
    case 'ONE':
      return connectDragSource(
        <div style={{ ...style, opacity }}>
          <Grid container spacing={3}>
            <Grid item xs>
              <Paper>
                <Typography style={{ textAlign: 'center' }}>
                  One
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </div>
      )
    case 'TWO':
      return connectDragSource(
        <div style={{ ...style, opacity }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={6}>
              <Paper>
                <Typography style={{ textAlign: 'center' }}>
                  Two
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <Paper>
                <Typography style={{ textAlign: 'center' }}>
                  Two
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </div>
      )
    case 'THREE':
      return connectDragSource(
        <div style={{ ...style, opacity }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <Paper>
                <Typography style={{ textAlign: 'center' }}>
                  Three
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Paper>
                <Typography style={{ textAlign: 'center' }}>
                  Three
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Paper>
                <Typography style={{ textAlign: 'center' }}>
                  Three
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </div>
      )
      case 'FOUR':
        return connectDragSource(
          <div style={{ ...style, opacity }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={3}>
                <Paper>
                  <Typography style={{ textAlign: 'center' }}>
                    Four
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Paper>
                  <Typography style={{ textAlign: 'center' }}>
                    Four
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Paper>
                  <Typography style={{ textAlign: 'center' }}>
                    Four
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Paper>
                  <Typography style={{ textAlign: 'center' }}>
                    Four
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </div>
        )
    default:

  }

  // return connectDragSource(
  //   <div style={{ ...style, opacity }}>
  //     <Grid container spacing={3}>
  //       <Grid item xs>
  //         <Paper style={{ ...style, opacity }}>xs</Paper>
  //       </Grid>
  //       <Grid item xs>
  //         <Paper style={{ ...style, opacity }}>xs</Paper>
  //       </Grid>
  //       <Grid item xs>
  //         <Paper style={{ ...style, opacity }}>xs</Paper>
  //       </Grid>
  //     </Grid>
  //   </div>
  // );
}
export default DragSource(
  props => props.type,
  {
    beginDrag: props => ({ name: props.name }),
  },
  (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }),
)(Box)
