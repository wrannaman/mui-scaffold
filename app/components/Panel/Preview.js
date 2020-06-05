import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { inject, observer } from 'mobx-react';

import { toJS } from 'mobx';
import Router, { withRouter } from 'next/router';

import { Icon, Image, Letter } from '../Demos/DataDisplay/Avatars';
import { Container, Grid, GridList } from '../Demos/Layout';
import {
  Dialogs,
  Progress,
  Snackbars,
} from '../Demos/Feedback';

import {
  Badges,
  Chips,
  Dividers,
  Icons,
  Lists,
  Table,
  Tooltips,
  Typography
} from '../Demos/DataDisplay';

import {
  Autocomplete,
  DateTime,
  Buttons,
  RadioButtons,
  Selects,
  CheckBoxes,
  Slider,
  Switches,
  TextFields
} from '../Demos/Inputs'

import {
  BottomNavigation,
  Links,
  Breadcrumbs,
  Menus,
  Steppers,
  Drawers,
  Tabs,
} from '../Demos/Navigation'

import {
  AppBar,
  Cards,
  Paper,
  ExpansionPanels,
} from '../Demos/Surfaces'

const styles = theme => ({
  root: {
  },
  demo: {
    padding: 10,
    background: 'rgba(0, 0, 0, 0.4)'
  }
});

@inject('store')
@observer
class NestedList extends React.Component {
  componentDidMount() {
    this.options = {
      Icon, Image, Letter,
      Container, Grid, GridList
    };
  }
  render() {
    const { classes } = this.props;
    const { page: { demoComponent } } = this.props.store;
    if (!demoComponent) return null;
    switch (demoComponent) {
      case 'Icon':
        return <Icons className={classes.demo} />
      case 'Image':
        return <Image className={classes.demo} />
      case 'Letter':
        return <Letter className={classes.demo} />
      case 'Container':
        return <Container className={classes.demo} />
      case 'Grid':
        return <Grid className={classes.demo} />
      case 'Autocomplete':
        return <Autocomplete className={classes.demo} />
      case 'Button':
        return <Buttons className={classes.demo} />
      case 'Checkbox':
        return <CheckBoxes className={classes.demo} />
      case 'Date/Time':
        return <DateTime className={classes.demo} />
      case 'Radio':
        return <RadioButtons className={classes.demo} />
      case 'Select':
        return <Selects className={classes.demo} />
      case 'Slider':
        return <Slider className={classes.demo} />
      case 'Switch':
        return <Switches className={classes.demo} />
      case 'Bottom Navigation':
        return <BottomNavigation className={classes.demo} />
      case 'Text Field':
        return <TextFields className={classes.demo} />
      case 'Breadcrumbs':
        return <Breadcrumbs className={classes.demo} />
      case 'Drawers':
        return <Drawers className={classes.demo} />
      case 'Links':
        return <Links className={classes.demo} />
      case 'Menus':
        return <Menus className={classes.demo} />
      case 'Steppers':
        return <Steppers className={classes.demo} />
      case 'Tabs':
        return <Tabs className={classes.demo} />
      case 'App Bar':
        return <AppBar className={classes.demo} />
      case 'Paper':
        return <Paper className={classes.demo} />
      case 'Cards':
        return <Cards className={classes.demo} />
      case 'Expansion Panels':
        return <ExpansionPanels className={classes.demo} />
      case 'Progress':
        return <Progress className={classes.demo} />
      case 'Dialog':
        return <Dialogs className={classes.demo} />
      case 'Snackbar':
        return <Snackbars className={classes.demo} />
      case 'Avatar':
        return (
          <div>
            <Icon className={classes.demo} /> <Image className={classes.demo} /> <Letter className={classes.demo} />
          </div>
        )
      case 'Badges':
        return <Badges className={classes.demo} />
      case 'Chip':
        return <Chips className={classes.demo} />
      case 'Divider':
        return <Dividers className={classes.demo} />
      case 'List':
        return <Lists className={classes.demo} />
      case 'Tables':
        return <Table className={classes.demo} />
      case 'Tooltip':
        return <Tooltips className={classes.demo} />
      case 'Typography':
        return <Typography className={classes.demo} />
      case 'Card':
        return <Cards className={classes.demo} />
      default:
        return <div>{demoComponent}</div>;
    }
  }
}

export default withStyles(styles)(NestedList);
