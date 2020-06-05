import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { Tooltip, Avatar, ListItemAvatar, ListItemText, ListItem, List, Paper, Typography } from '@material-ui/core';
import { capitalize } from 'lodash';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import CheckIcon from '@material-ui/icons/Check';
import moment from 'moment';

const styles = theme => ({
  root: {
  },
  paper: {
    // width: 450,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: 25,
    margin: '0 auto',
    padding: 15,
  }
});

@inject('store')
@observer
class Deploy extends React.Component {
  state = {};

  render() {
    const { classes, router, deploys, totalDeploys } = this.props;
    if (!deploys || deploys.length === 0 || totalDeploys === 0) {
      return (
        <Paper className={classes.paper}>
            <Typography variant="body1">
              No Deployments
            </Typography>
        </Paper>
      )
    }
    return (
      <Paper className={classes.paper}>
          <Typography variant="h6">
            Deployments
          </Typography>
          <Typography variant="overline">
            {totalDeploys} Total Deployments
          </Typography>
          <List className={classes.root}>
            {deploys.map((d) => (
              <ListItem key={d.id}>
                <ListItemAvatar>
                  <Avatar>
                    {d.status === 'deploying' ? (
                      <Tooltip
                        title={capitalize(d.status)}
                      >
                        <AutorenewIcon color="#fff" />
                      </Tooltip>
                    ) : (null)}
                    {d.status === 'success' ? (
                      <Tooltip
                        title={capitalize(d.status)}
                      >
                        <CheckIcon style={{ color: "#50d078" }} />
                      </Tooltip>
                    ) : (null)}
                    {d.status === 'fail' ? (
                      <Tooltip
                        title={capitalize(d.status)}
                      >
                        <ErrorOutlineIcon color="error" />
                      </Tooltip>
                    ) : (null)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${d.name}[${d.type}] - version ${d.version}`}
                  secondary={`${d.status} since ${moment(d.createdAt).format('MM-DD-YY h:mm a')}`}
                />
              </ListItem>
            ))}
          </List>
      </Paper>
    );
  }
}

Deploy.propTypes = {
  classes: PropTypes.object.isRequired,
  deploys: PropTypes.array.isRequired,
  totalDeploys: PropTypes.string.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Deploy));
