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
    show: true,
  };

  addStyle = () => {
    const { page: { update } } = this.props.store;
    const { node } = this.props;
    const clone = Object.assign({}, node.props.style);
    clone[""] = "";
    node.updateProps('style', clone);
    update('render', new Date().getTime())
  }

  changeStyle = (styleName) => (e) => {
    const { page: { update } } = this.props.store;
    const { node } = this.props;
    const clone = Object.assign({}, node.props.style);
    clone[styleName] = e.target.value;
    node.updateProps('style', clone);
    update('render', new Date().getTime())
  }

  removeStyle = (styleName) => () => {
    const { page: { update } } = this.props.store;
    const { node } = this.props;
    const clone = Object.assign({}, node.props.style);
    delete clone[styleName];
    node.updateProps('style', clone);
    update('render', new Date().getTime())
  }

  onChange = (prev) => (next) => {
    const { page: { update } } = this.props.store;
    const { node } = this.props;
    const clone = Object.assign({}, node.props.style);
    const prevValue = clone[prev];
    delete clone[prev];
    clone[next] = prevValue;
    node.updateProps('style', clone);
    update('render', new Date().getTime())
  }

  flexCentered = (direction = 'row') => () => {
    const { page: { update } } = this.props.store;
    const { node } = this.props;
    const clone = Object.assign({}, node.props.style);
    clone.display = 'flex';
    clone.flexDirection = direction;
    clone.alignItems = 'center';
    clone.justifyContent = 'center';
    clone.flexWrap = 'wrap';
    node.updateProps('style', clone);
    update('render', new Date().getTime())
  }

  toggleShow = () => this.setState({ show: !this.state.show });

  render() {
    const { show } = this.state;
    const { classes, node, store: { page: { render } } } = this.props;
    const { style } = node.props
    const keys = Object.keys(style ? style : {});
    return (
      <div>
        <div style={{ marginTop: 10 }} className={classes.flexRow}>
          <Typography variant="overline">
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
                        value={style[key]}
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
              <Fab
                size="small"
                color="secondary"
                aria-label="add"
                className={classes.margin}
                onClick={this.addStyle}
              >
                <AddIcon />
              </Fab>
            </div>
            {(node.type.toLowerCase() === 'grid' || node.type.toLowerCase() === 'paper' || node.type.toLowerCase() === 'div' || node.type.toLowerCase() === 'section') && (
              <div>
                <Typography variant="overline">
                  Quick Styles
                </Typography>
                <div>
                  <Button onClick={this.flexCentered('row')} size="small" variant="outlined" >Row</Button>
                  <Button onClick={this.flexCentered('column')} size="small" variant="outlined">Column</Button>
                </div>
              </div>
            )}
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
