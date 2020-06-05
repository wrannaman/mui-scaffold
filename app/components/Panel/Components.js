import React from 'react';
import Router, { withRouter } from 'next/router';
import { withStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';

import InboxIcon from '@material-ui/icons/MoveToInbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import SendIcon from '@material-ui/icons/Send';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';
import Types from '../../utils/render/Types'

import DraggableListItem from '../Nav/DraggableListItem';

import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';

const styles = theme => ({
  root: {
    // width: '100%',
    // width: 200,
    // backgroundColor: theme.palette.background.paper,
    // height: 20,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  primaryLabel: {
    fontSize: 12
  },
  listRow: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItem: 'center',
    justifyContent: 'flex-start'
  },
  list: {
    // minHeight: 30,
  },
  listItem: {
    // minHeight: 30,
  }
});

@inject('store')
@observer
class NestedList extends React.Component {
  state = {
    open: {
      generated: true,
      repeatable: true,
      Layout: true,
      Inputs: true,
      Surfaces: true,
      'Data Display': true,
    }
  };

  componentDidMount() {
    // this.toggleAllComponents();
  }

  handleClick = (which) => () => {
    const clone = toJS(this.state.open);
    if (!clone[which]) clone[which] = true;
    else clone[which] = false;
    this.setState({ open: clone });
  }

  preview = (category, name) => () => {
    const { page: { update } } = this.props.store;
    update('demoComponent', name);
  }

  toggleAllComponents = () => {
    const { page: { components } } = this.props.store;
    let clone = toJS(this.state.open);
    if (JSON.stringify(clone) === "{}") {
      Object.keys(components).forEach((k) => clone[k] = true);
      clone.generated = true;
      clone.repeabable = true;
    } else {
      clone = {};
    }

    this.setState({ open: clone });
  }

  render() {
    const { classes, router: { query, pathname } } = this.props;
    const { open } = this.state;
    const { page: { components }, component, repeatable: { repeatables } } = this.props.store;
    const generatedComponenents = component.components;
    const onEditingPage = pathname.indexOf('/pages') !== -1;
    const onComponentPage = pathname.indexOf('/component') !== -1;

    return (
      <List
        component="nav"
        aria-labelledby="components"
        dense
        subheader={
          <ListSubheader component="div" onClick={this.toggleAllComponents}>
            Drag And Drop Elements
          </ListSubheader>
        }
        className={classes.root}
      >
        {Object.keys(components).map((option) => (
          <div key={option} className={classes.listItemWrap} >
            <ListItem button onClick={this.handleClick(option)} className={classes.listItem}>
              <ListItemText primary={option} classes={{ primary: classes.primaryLabel }}/>
              {open[option] ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={open[option]} timeout="auto" unmountOnExit>
              <List dense component="div" disablePadding className={classes.listRow}>
              {components[option].map((o) => (
                <DraggableListItem
                  key={o}
                  item={o}
                  type={o}
                  name={o}
                  onClick={this.preview(option, o)}
                />
              ))}
              </List>
            </Collapse>
          </div>
        ))}

        {(onEditingPage) && (
          <div>
            <ListItem
              button
              dense
              onClick={this.handleClick('repeatable')}
              className={classes.list}
            >
              <ListItemText
                primary={'Custom Components'}
                classes={{ primary: classes.primaryLabel }}
              />
              {open.repeatable ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={open.repeatable} timeout="auto" unmountOnExit>
              <List dense component="div" disablePadding className={classes.listRow}>
                {repeatables.map((option) => {
                  option = Object.assign({}, toJS(option));
                  option._type = option.type;
                  // option.type = 'repeatable';
                  // if (option._type === )
                  let dataType = "";
                  if (option.type === 'table' && option.data && option.data.name) dataType = `(${option.data.name})`;
                  return (
                    <Tooltip title={`${option.name} ${dataType} (${option._type})`} key={option.name}>
                      <div>
                        <DraggableListItem
                          key={option.name}
                          item={option.name}
                          type={option._type}
                          name={option.name}
                          subtitle={option._type}
                          onClick={this.preview(option)}
                        />
                      </div>
                    </Tooltip>
                  )
                })}
              </List>
            </Collapse>
          </div>
        )}
        {false && onEditingPage && (
          <div>
            <ListItem
              button
              dense
              onClick={this.handleClick('generated')}
              className={classes.list}
            >
              <ListItemText
                primary={'Generated Components'}
                classes={{ primary: classes.primaryLabel }}
              />
              {open.generated ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={open.generated} timeout="auto" unmountOnExit>
                <List dense component="div" disablePadding className={classes.listRow}>
                  {generatedComponenents.map((option) => {
                    option = Object.assign({}, toJS(option));
                    option.componentType = option.type;
                    option.type = 'generated';
                    return (
                      <Tooltip title={`${option.name} (${option.type})`} key={option.name}>
                        <div>
                          <DraggableListItem
                            key={option.name}
                            item={option.name}
                            type={option.type}
                            name={option.name}
                            subtitle={option.type}
                            onClick={this.preview(option)}
                          />
                        </div>
                      </Tooltip>
                    );
                  })}
                </List>
            </Collapse>
            {false && (
              <Button
                variant="contained"
                style={{ marginTop: 10 }}
                onClick={() => Router.push({ pathname: '/component', query })}
              >
                Repeatable Component
              </Button>
            )}
          </div>
        )}
      </List>
    );
  }
}

export default withRouter(withStyles(styles)(NestedList));
