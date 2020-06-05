import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';

import { ListSubheader, ListItemText, ListItem, Collapse, List } from '@material-ui/core';

import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

const styles = theme => ({
  // root: {
  //   // width: '100%',
  //   // width: 200,
  //   // backgroundColor: theme.palette.background.paper,
  // },
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  color: {
    color: theme.palette.primary.main,
  }
});

// // data
//   data models
//   user permissions
// // design
//   pages
//   components
//   navigation
//   theme
// // settings
//   media
//   settings
// //
// deploy
// templates
// help
// my projects

const pages = [
  // {name: "API", path: '/data-models'},
  // {name: "Pages", path: '/pages'},
  {name: "Components", path: '/component'},
  // {name: "Navigation", path: '/nav'},
  {name: "Theme", path: '/theme'},
  // {name: "Export", path: '/export'},
];


@inject('store')
@observer
class NestedList extends React.Component {
  state = {
    open: {
      settings: false,
      design: false,
      data: false,
    }
  };

  render() {
    const { classes, router: { pathname, query: { projectID }} } = this.props;
    const { project: { project } } = this.props.store;
    const hasAPI = project && project.deployment && project.deployment.api_url && project.deployment.api_url.dev;
    const { open } = this.state;

    return (
      <List
        component="nav"
        aria-labelledby="components"
        className={classes.root}
      >
        {pages.map(page => {
          return (
            <React.Fragment>
              <ListItem
                component="nav"
                button={!page.children ? true : false}
                selected={pathname === page.path}
                className={pathname === page.path ? classes.color : classes.default}
                onClick={page.children ? () => {
                  const clone = Object.assign({}, this.state.open);
                  clone[page.name.toLowerCase()] = !clone[page.name.toLowerCase()];
                  this.setState({ open: clone });
                } : () => Router.push({ pathname: page.path, query: { projectID } })}
              >

                <ListItemText primary={page.name} />
                {page.children && open[page.name.toLowerCase()] && (<ExpandLess /> )}
                {page.children && !open[page.name.toLowerCase()] && (<ExpandMore /> )}
              </ListItem>
              {page.children && page.children.length > 0 && (
                <Collapse in={open[page.name.toLowerCase()]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {page.children.map(child => (
                      <ListItem
                        button
                        className={classes.nested}
                        onClick={(e) => {
                          e.stopPropagation();
                          Router.push({ pathname: child.path, query: { projectID }});
                        }}
                        selected={pathname === child.path}
                      >
                        <ListItemText primary={child.name} />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          )
        })}
        {hasAPI && (
          <ListItem
            button
            selected={pathname === '/api-docs'}
            className={pathname === '/api-docs' ? classes.color : classes.default}
            onClick={() => Router.push({ pathname: '/api-docs', query: { projectID } })}
          >
            API Docs
          </ListItem>
        )}
      </List>

    );
  }
}

export default withRouter(withStyles(styles)(NestedList));
