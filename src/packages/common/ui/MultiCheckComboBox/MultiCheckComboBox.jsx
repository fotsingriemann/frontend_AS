/**
 * @module MultiCheckComboBox
 * @summary This module exports the MultiCheckComboBox
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Downshift from 'downshift'
import SearchIcon from '@material-ui/icons/SearchOutlined'
import {
  Input,
  Paper,
  MenuItem,
  InputAdornment,
  Typography,
  Checkbox,
  withStyles
} from '@material-ui/core'

const style = theme => ({
  inputRoot: {
    width: theme.spacing(30)
  },
  chipRoot: {
    backgroundColor: '#f5f5f5',
    fontSize: '0.6rem',
    height: 'auto'
  },
  searchDropdown: {
    position: 'absolute',
    marginTop: theme.spacing(1),
    left: 0,
    right: 0,
    zIndex: 2,
    maxHeight: theme.spacing(25),
    overflowY: 'auto'
  },
  comboboxContainer: {
    position: 'relative'
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
function renderInput(inputProps) {
  const { InputProps, classes, disabled, ref, ...other } = inputProps

  return (
    <Input
      disabled={disabled}
      inputRef={ref}
      classes={{
        root: classes.inputRoot
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
  selectedItems,
  itemToStringKey,
  itemKey
}) {
  const isSelected = Boolean(
    selectedItems.find(a => a[itemKey] === item[itemKey])
  )

  return (
    <MenuItem
      {...itemProps}
      key={item.uniqueId}
      selected={isSelected}
      component="div"
      style={{
        fontWeight: isSelected ? 500 : 400
      }}
    >
      <Checkbox checked={isSelected} color="primary" />
      {item[itemToStringKey]}
    </MenuItem>
  )
}

renderDropdownItem.propTypes = {
  itemProps: PropTypes.object,
  itemToStringKey: PropTypes.string.isRequired,
  itemKey: PropTypes.string.isRequired,
  selectedItems: PropTypes.array.isRequired,
  item: PropTypes.object.isRequired
}

/**
 * Filter most relevant items
 * @param {Array} items The array of items to be filtered
 * @param {String} inputValue The value entered in the input against which items are to be filtered
 * @param {String} itemToStringKey The key of the object to be used to filter items
 * @param {number} filterSize The max size of filtered items to show
 * @returns {Array} Filtered array of items
 */
function getFilteredItems(items, inputValue, searchByFields, filterSize) {
  let count = 0
  const filteredItems = []

  const finder = item => {
    for (const field of searchByFields) {
      if (item[field].toLowerCase().includes(inputValue.toLowerCase())) {
        filteredItems.push({
          ...item,
          searchedBy: field
        })
        return true
      }
    }
    return false
  }

  for (const item of items) {
    if (count < filterSize) {
      if (finder(item)) {
        count++
      }
    }
  }

  return filteredItems
}

/**
 * @summary MultiCheckComboBox component is a re-usable component for rendering searchable dropdown
 * with multi-select and check box
 */
class MultiCheckComboBox extends Component {
  /**
   * @function
   * @param {object} selectedItem The item that is selected
   * @summary Handles selction/de-selection of an item in the ComboBox
   */
  handleSelectionChange = selectedItem => {
    let action = 'ADD'
    let itemIndex = -1

    for (const i in this.props.selectedItems) {
      if (
        selectedItem[this.props.itemKey] ===
        this.props.selectedItems[i][this.props.itemKey]
      ) {
        action = 'REMOVE'
        itemIndex = i
        break
      }
    }

    let items

    if (action === 'ADD') {
      items = [selectedItem, ...this.props.selectedItems]
    } else {
      items = [...this.props.selectedItems]
      items.splice(itemIndex, 1)
    }

    this.props.onSelectedItemsChange(items)
  }

  /**
   * @function
   * @param {object} state The state of the Downshift component
   * @param {object} changes The object describing the type of change on the state
   * @summary A reducer to change the state of Downshift component based on changes
   */
  stateReducer = (state, changes) => {
    // this prevents the menu from being closed when the user
    // selects an item with a keyboard or mouse
    switch (changes.type) {
      case Downshift.stateChangeTypes.keyDownEnter:
      case Downshift.stateChangeTypes.clickItem:
        return {
          ...changes,
          isOpen: state.isOpen,
          highlightedIndex: state.highlightedIndex
        }
      default:
        return changes
    }
  }

  render() {
    const {
      classes,
      items,
      placeholder,
      searchByFields,
      isLoading,
      disabled,
      loadingComponent,
      errorComponent,
      itemKey,
      itemToStringKey,
      filterSize
    } = this.props

    return (
      <Downshift
        onChange={this.handleSelectionChange}
        selectedItem={this.props.selectedItems}
        itemToString={item => {
          return ''
        }}
        stateReducer={this.stateReducer}
      >
        {({
          getInputProps,
          getItemProps,
          isOpen,
          inputValue,
          selectedItem: selectedItems
        }) => (
          <div className={classes.comboboxContainer}>
            {renderInput({
              disabled,
              classes,
              InputProps: getInputProps({
                placeholder,
                startAdornment: (
                  <InputAdornment>
                    <SearchIcon />
                  </InputAdornment>
                )
              })
            })}
            {isOpen ? (
              <Paper className={classes.searchDropdown} square>
                {items.length > 0
                  ? getFilteredItems(
                    items,
                    inputValue,
                    searchByFields,
                    filterSize
                  ).map(item =>
                    renderDropdownItem({
                      item,
                      itemProps: getItemProps({ item }),
                      selectedItems,
                      itemKey,
                      itemToStringKey
                    })
                  )
                  : isLoading
                    ? loadingComponent
                    : errorComponent}
              </Paper>
            ) : null}
          </div>
        )}
      </Downshift>
    )
  }
}

MultiCheckComboBox.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedItems: PropTypes.array.isRequired,
  onSelectedItemsChange: PropTypes.func.isRequired,
  searchByFields: PropTypes.arrayOf(PropTypes.string).isRequired,
  isLoading: PropTypes.bool.isRequired,
  itemKey: PropTypes.string.isRequired,
  itemToStringKey: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  loadingComponent: PropTypes.element,
  errorComponent: PropTypes.element,
  disabled: PropTypes.bool,
  filterSize: PropTypes.number
}

MultiCheckComboBox.defaultProps = {
  placeholder: 'Search',
  loadingComponent: <Typography>Loading ...</Typography>,
  errorComponent: <Typography>Something went wrong. Try again!</Typography>,
  disabled: false,
  filterSize: 5
}

export default withStyles(style)(MultiCheckComboBox)
