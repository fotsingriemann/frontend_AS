/**
 * @module Combobox
 * @summary Combobox component is used for rendering a searchable dropdown
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SearchIcon from '@material-ui/icons/SearchOutlined'
import CloseIcon from '@material-ui/icons/CloseOutlined'
import Downshift from 'downshift'
import {
  Input,
  Paper,
  MenuItem,
  InputAdornment,
  IconButton,
  Typography,
  withStyles
} from '@material-ui/core'

const style = theme => ({
  searchDropdown: {
    position: 'absolute',
    marginTop: theme.spacing(1),
    left: 0,
    right: 0,
    zIndex: 100,
    maxHeight: theme.spacing(25),
    overflowY: 'auto'
  },
  inputRoot: {
    width: '100%'
  },
  comboboxContainer: {
    position: 'relative',
    width: '100%',
    flexGrow: 1
  },
  errorMessage: {
    textAlign: 'center',
    padding: theme.spacing(1)
  }
})

/**
 * Renders the Input component of Combobox
 * @param {Object} props Props passed to the Input component of Combobox
 */
function renderInput({ InputProps, classes, ref, disabled, ...other }) {
  return (
    <Input
      disabled={disabled}
      inputRef={ref}
      classes={{
        root: classes.inputRoot
      }}
      inputProps={{
        autoComplete: 'off'
      }}
      {...InputProps}
      {...other}
    />
  )
}

renderInput.propTypes = {
  InputProps: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  ref: PropTypes.element.isRequired,
  disabled: PropTypes.bool.isRequired
}

/**
 * Renders each item in the dropdown
 * @param {Object} props Props passed to the individual dropdown item
 */
function renderDropdownItem({
  item,
  itemProps,
  selectedItem,
  itemToStringKey,
  itemKey
}) {
  const isSelected = selectedItem && selectedItem[itemKey] === item[itemKey]

  return (
    <MenuItem
      {...itemProps}
      key={item[itemKey]}
      selected={isSelected}
      component="div"
      style={{
        fontWeight: isSelected ? 500 : 400
      }}
    >
      {item[itemToStringKey]}
    </MenuItem>
  )
}

renderDropdownItem.propTypes = {
  itemToStringKey: PropTypes.string.isRequired,
  itemKey: PropTypes.string.isRequired,
  itemProps: PropTypes.object,
  selectedItem: PropTypes.string.isRequired,
  item: PropTypes.object.isRequired
}

/**
 * Filter most relevant items
 * @param {Array} items The array of items to be filtered
 * @param {String} inputValue The value entered in the input against which items are to be filtered
 * @param {String} itemToStringKey The key of the object to be used to filter items
 * @returns {Array} Filtered array of items
 */
function getFilteredItems(items, inputValue, itemToStringKey, filterSize) {
  let count = 0
  // console.log('items:', items, inputValue, itemToStringKey, filterSize)
  if (!inputValue) {
    return items.slice(0, 50)
  }

  return items.filter(item => {
    const keep =
      (!inputValue ||
        item[itemToStringKey]
          .toLowerCase()
          .indexOf(inputValue.toLowerCase()) !== -1) &&
      count < filterSize

    if (keep) {
      count += 1
    }

    return keep
  })
}

/**
 * @summary ComboBox component is a re-usable component for rendering searchable dropdown
 */
class ComboBox extends Component {
  /**
   * @function
   * @param {object} selectedItem The new item that is selected
   * @summary Handles menu item selection
   */
  handleSelectionChange = selectedItem => {
    this.props.onSelectedItemChange(selectedItem)
  }

  handleInputValueChange = inputValue => {
    this.props.onSearchValueChange(inputValue)
  }

  render() {
    const {
      classes,
      items,
      isLoading,
      placeholder,
      disabled,
      itemToStringKey,
      loadingComponent,
      errorComponent,
      itemKey,
      filterSize
    } = this.props

    return (
      <Downshift
        selectedItem={this.props.selectedItem}
        onChange={this.handleSelectionChange}
        itemToString={item => (item ? item[itemToStringKey] : '')}
        onInputValueChange={this.handleInputValueChange}
      >
        {({
          getInputProps,
          getItemProps,
          isOpen,
          inputValue,
          selectedItem,
          clearSelection,
          openMenu
        }) => (
          <div className={classes.comboboxContainer}>
            {renderInput({
              disabled,
              classes,
              InputProps: getInputProps({
                placeholder,
                onChange: e => {
                  if (e.target.value === '') {
                    clearSelection()
                  }
                },
                onFocus: () => {
                  openMenu()
                },
                startAdornment: (
                  <InputAdornment>
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: selectedItem && (
                  <InputAdornment>
                    <IconButton onClick={clearSelection} disabled={disabled}>
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                )
              })
            })}
            {isOpen ? (
              <Paper className={classes.searchDropdown} square>
                {/* eslint-disable indent */
                items.length > 0
                  ? getFilteredItems(
                      items,
                      inputValue,
                      itemToStringKey,
                      filterSize
                    ).map(item =>
                      renderDropdownItem({
                        item,
                        itemProps: getItemProps({ item }),
                        selectedItem,
                        itemToStringKey,
                        itemKey
                      })
                    )
                  : isLoading
                  ? loadingComponent
                  : errorComponent
                /* eslint-enable indent */
                }
              </Paper>
            ) : null}
          </div>
        )}
      </Downshift>
    )
  }
}

ComboBox.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedItem: PropTypes.object,
  itemToStringKey: PropTypes.string.isRequired,
  onSelectedItemChange: PropTypes.func.isRequired,
  onSearchValueChange: PropTypes.func,
  handleClearSelection: PropTypes.func,
  isLoading: PropTypes.bool.isRequired,
  itemKey: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  loadingComponent: PropTypes.element,
  errorComponent: PropTypes.element,
  disabled: PropTypes.bool,
  filterSize: PropTypes.number,
  showOptions: PropTypes.bool
}

ComboBox.defaultProps = {
  placeholder: 'Search Vehicle (Type something)',
  loadingComponent: <Typography>Loading ...</Typography>,
  errorComponent: <Typography>No Results Found!</Typography>,
  disabled: false,
  filterSize: 5,
  showOptions: false,
  onSearchValueChange: () => {}
}

export default withStyles(style)(ComboBox)
