import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import deburr from 'lodash/deburr';
import Downshift from 'downshift';

import { Tooltip, Button, Typography, Table, Paper, TextField, MenuItem, IconButton } from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import RemoveIcon from '@material-ui/icons/Remove';

const styles = theme => ({
  root: {
    width: '100%',
  },
  paper: {
    marginTop: theme.spacing(3),
    width: '100%',
    overflowX: 'auto',
    marginBottom: theme.spacing(2),
  },
  table: {
    // minWidth: 650,
  },
  smallFont: {
    fontSize: 10,
  },
  textField: {
    fontSize: 10,
  },
  closeButton: {
    fontSize: 10
  },
  inputRoot: {
    fontSize: 10,
    width: 70,
    float: 'left'
  },
  inputInput: {
    fontSize: 10,
  },
  smallTableCell: {
    padding: 0,
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  flexActionRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  }
});

import suggestions from '../../utils/styler/styles';

function renderSuggestion(suggestionProps) {
  const { suggestion, index, itemProps, highlightedIndex, selectedItem } = suggestionProps;
  const isHighlighted = highlightedIndex === index;
  const isSelected = (selectedItem || "").indexOf(suggestion.label) > -1;

  return (
    <MenuItem
      {...itemProps}
      key={suggestion.label}
      selected={isHighlighted}
      component="div"
      style={{
        fontWeight: isSelected ? 500 : 400,
        fontSize: 10,
      }}
    >
      {suggestion.label}
    </MenuItem>
  );
}

function getSuggestions(value, { showEmpty = false } = {}) {
  const inputValue = deburr(value.trim()).toLowerCase();
  const inputLength = inputValue.length;
  let count = 0;

  return inputLength === 0 && !showEmpty
    ? []
    : suggestions.filter(suggestion => {
      const keep = count < 5 && suggestion.label.slice(0, inputLength).toLowerCase() === inputValue;
      if (keep) {
        count += 1;
      }
      return keep;
    });
}

function renderInput(inputProps) {
  const { InputProps, classes, ref, ...other } = inputProps;

  return (
    <TextField
      InputProps={{
        inputRef: ref,
        classes: {
          root: classes.inputRoot,
          input: classes.inputInput,
        },
        ...InputProps,
      }}
      margin="dense"
      {...other}
      classes={{
        root: classes.inputRoot,
        input: classes.inputInput,
      }}
    />
  );
}

@inject('store')
@observer
class Styler extends React.Component {

  state = {
    show: false,
  };

  addStyle = () => {
    const {
      repeatable: { update, repeatables, workingIndex }
    } = this.props.store;

    const clone = toJS(repeatables).slice();
    if (!clone[workingIndex].styles) clone[workingIndex].styles = {};
    clone[workingIndex].styles[""] = "";
    update('repeatables', clone);
  }

  changeStyle = (styleName) => (e) => {
    const {
      repeatable: { update, repeatables, workingIndex }
    } = this.props.store;

    const clone = toJS(repeatables).slice();
    if (!clone[workingIndex].styles) clone[workingIndex].styles = {};
    clone[workingIndex].styles[styleName] = e.target.value;
    update('repeatables', clone);
  }

  removeStyle = (styleName) => () => {
    const {
      repeatable: { update, repeatables, workingIndex }
    } = this.props.store;

    const clone = toJS(repeatables).slice();
    if (!clone[workingIndex].styles) clone[workingIndex].styles = {};
    delete clone[workingIndex].styles[styleName];
    update('repeatables', clone);
  }

  onChange = (prev) => (next) => {
    const {
      repeatable: { update, repeatables, workingIndex }
    } = this.props.store;
    const clone = toJS(repeatables).slice();
    if (!clone[workingIndex].styles) clone[workingIndex].styles = {};

    const prevValue = clone[workingIndex].styles[prev];
    delete clone[workingIndex].styles[prev];
    clone[workingIndex].styles[next] = prevValue;
    update('repeatables', clone);
  }

  flexCentered = (direction = 'row') => () => {
    const {
      repeatable: { update, repeatables, workingIndex }
    } = this.props.store;
    const clone = toJS(repeatables).slice();
    if (!clone[workingIndex].styles) clone[workingIndex].styles = {};

    clone[workingIndex].styles.display = 'flex';
    clone[workingIndex].styles.flexDirection = direction;
    clone[workingIndex].styles.alignItems = 'center';
    clone[workingIndex].styles.justifyContent = 'center';
    clone[workingIndex].styles.flexWrap = 'wrap';
    update('repeatables', clone);
  }

  toggleShow = () => this.setState({ show: !this.state.show });

  render() {
    const { show } = this.state;
    const {
      classes,
      store: {
        page: { render },
        repeatable: { update, repeatables, workingIndex },
        project: { getTheme }
      }
    } = this.props;

    const { styles } = repeatables[workingIndex];

    const keys = Object.keys(styles ? styles : {});
    return (
      <div>
        <div style={{ marginTop: 10 }} className={classes.flexRow}>
          <Typography variant="overline" style={{ color: getTheme().palette.text.primary }}>
            Styles
          </Typography>
          <Tooltip title={show ? 'Hide Styles' : 'Show Styles'}>
            <Fab
              size="small"
              color="secondary"
              aria-label="add"
              className={classes.margin}
              onClick={this.toggleShow}
            >
              {show ? <RemoveIcon /> : <AddIcon /> }
            </Fab>
          </Tooltip>
        </div>
        { show && (
          <div>
            <Table className={classes.table} size="small">
               <TableHead>
                 <TableRow>
                   <TableCell
                     size="small"
                     className={classes.smallFont}
                     classes={{ sizeSmall: classes.smallTableCell }}
                   >
                      Style
                   </TableCell>
                   <TableCell
                     size="small"
                     align="left"
                     className={classes.smallFont}
                     classes={{ sizeSmall: classes.smallTableCell }}
                   >
                      Value
                   </TableCell>
                   <TableCell
                     size="small"
                     align="left"
                     className={classes.smallFont}
                     classes={{ sizeSmall: classes.smallTableCell }}
                   >
                      Action
                   </TableCell>
                 </TableRow>
               </TableHead>
               <TableBody>
                {keys.map(key => (
                  <TableRow key={key}>
                    <TableCell
                      size="small"
                      align="right"
                      className={classes.smallFont}
                      classes={{ sizeSmall: classes.smallTableCell }}
                    >
                      <Downshift
                        id="downshift-options"
                        initialSelectedItem={key}
                        onChange={this.onChange(key)}
                      >
                          {({
                            clearSelection,
                            getInputProps,
                            getItemProps,
                            getLabelProps,
                            getMenuProps,
                            highlightedIndex,
                            inputValue,
                            isOpen,
                            openMenu,
                            selectedItem,
                          }) => {
                            const { onBlur, onChange, onFocus, ...inputProps } = getInputProps({
                              onChange: event => {
                                if (event.target.value === '') {
                                  clearSelection();
                                }
                                // this.onChange(key, event.target.value)
                              },
                              onFocus: openMenu,
                              placeholder: 'Property',
                            });

                            return (
                              <div className={classes.container}>
                                {renderInput({
                                  fullWidth: false,
                                  classes,
                                  label: 'Property',
                                  InputLabelProps: getLabelProps({ shrink: true }),
                                  InputProps: { onBlur, onChange, onFocus },
                                  inputProps,
                                })}

                                <div {...getMenuProps()}>
                                  {isOpen ? (
                                    <Paper className={classes.paper} square>
                                      {getSuggestions(inputValue, { showEmpty: true }).map((suggestion, index) =>
                                        renderSuggestion({
                                          suggestion,
                                          index,
                                          itemProps: getItemProps({ item: suggestion.label }),
                                          highlightedIndex,
                                          selectedItem,
                                        }),
                                      )}
                                    </Paper>
                                  ) : null}
                                </div>
                              </div>
                            );
                          }}
                      </Downshift>
                    </TableCell>

                    <TableCell
                      size="small"
                      align="right"
                      classes={{ sizeSmall: classes.smallTableCell }}
                    >
                      <TextField
                        value={styles[key]}
                        onChange={this.changeStyle(key)}
                        label={key}
                        InputProps={{ style: { fontSize: 10 }}}
                        margin="dense"
                        autoFocus={true}
                      />
                    </TableCell>
                    <TableCell
                      size="small"
                      align="right"
                      classes={{ sizeSmall: classes.smallTableCell }}
                    >
                      <IconButton
                        className={classes.closeButton}
                        aria-label="delete"
                        onClick={this.removeStyle(key)}
                      >
                        <HighlightOffIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
               </TableBody>
            </Table>
            <div>
              <Tooltip title="Add a style">
                <Fab
                  size="small"
                  color="secondary"
                  aria-label="add"
                  className={classes.margin}
                  style={{ marginTop: 10 }}
                  onClick={this.addStyle}
                >
                  <AddIcon />
                </Fab>
              </Tooltip>
            </div>
            <div>
              <Typography variant="overline" style={{ color: getTheme().palette.text.primary, marginTop: 15 }}>
                Quick Styles
              </Typography>
              <div className={classes.flexActionRow}>
                <Button onClick={this.flexCentered('row')} size="small" variant="outlined" >Row</Button>
                <Button onClick={this.flexCentered('column')} size="small" variant="outlined">Column</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

Styler.propTypes = {
  classes: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Styler));
