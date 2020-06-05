import React from 'react';


import {
  Container,
  Grid,
  GridListTile,
  Box,
  MenuItem,
  TextField,
  Popper,
  Paper,
  Chip,
  Button,
  Checkbox,
  Radio,
  RadioGroup,
  FormHelperText,
  FormControlLabel,
  FormControl,
  FormLabel,
  Select,
  InputLabel,
  Slider,
  Typography,
  Switch,
  BottomNavigation,
  BottomNavigationAction,
  Breadcrumbs,
  Link,
  Drawer,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Card,
  CardActions,
  CardContent,
  Snackbar,
  Avatar,
  Badge,
  Divider,
  Icon,
  Table,
  TablePagination,
  Tooltip,
  ExpansionPanel,
  LinearProgress,
  Dialog,
  List,
} from '@material-ui/core';


// Date / Time
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers'


export default (item, props = {}, children = false) => {
  switch (item) {
    case 'div':
      return <div {...props} />;
    case 'Icon':
      return <Icon {...props} />;
    case 'Image':
      return <Image {...props} />;
    case 'Letter':
      return <Letter {...props} />;
    case 'Container':
      return <Container {...props} />;
    case 'Grid':
      return <Grid {...props} />;
    case 'Autocomplete':
      return <Autocomplete {...props} />;
    case 'Buttons':
      return <Button {...props} />;
    case 'Checkboxes':
      return <CheckBox {...props} />;
    case 'Date / Time':
      return <DateTime {...props} />;
    case 'Radio':
      return <RadioButton {...props} />;
    case 'Selects':
      return <Selects {...props} />;
    case 'Slider':
      return <Slider {...props} />;
    case 'Switches':
      return <Switch {...props} />;
    case 'Bottom Navigation':
      return <BottomNavigation {...props} />;
    case 'TextFields':
      return <TextField {...props} />;
    case 'Breadcrumbs':
      return <Breadcrumb {...props} />;
    case 'Drawer':
      return <Drawer {...props} />;
    case 'Link':
      return <Link {...props} />;
    case 'Menu':
      return <Menu {...props} />;
    case 'Stepper':
      return <Stepper {...props} />;
    case 'Tabs':
      return <Tab {...props} />;
    case 'App Bar':
      return <AppBar {...props} />;
    case 'Paper':
      return <Paper {...props} />;
    case 'Cards':
      return <Card {...props} />;
    case 'Expansion Panels':
      return <ExpansionPanel {...props} />;
    case 'LinearProgress':
      return <LinearProgress {...props} />;
    case 'Dialog':
      return <Dialog {...props} />;
    case 'Snackbars':
      return <Snackbar {...props} />;
    case 'Avatars':
      return (
        <div>
          <Icon {...props} />; <Image {...props} />; <Letter {...props} />;
        </div>
      );
    case 'Badges':
      return <Badge {...props} />;
    case 'Chips':
      return <Chip {...props} />;
    case 'Dividers':
      return <Divider {...props} />;
    case 'Icons':
      return <Icon {...props} />;
    case 'Lists':
      return <List {...props} />;
    case 'Tables':
      return <Table {...props} />;
    case 'Tooltips':
      return <Tooltip {...props} />;
    case 'TablePagination':
      return <TablePagination {...props} />;
    case 'Typography':
      return <Typography {...props} />;
    default:
      return <div>{'unknown'}</div>;
    }
};
