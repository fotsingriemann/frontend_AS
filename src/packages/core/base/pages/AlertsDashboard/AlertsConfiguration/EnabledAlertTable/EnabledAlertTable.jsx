/**
 * @module AlertsDashboard/AlertsConfiguration/EnabledAlertsTable
 * @summary Renders the table for editing/disabling enabled alert configurations
 */
import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import DoneIcon from '@material-ui/icons/DoneOutlined'
import EditIcon from '@material-ui/icons/EditOutlined'
import DeleteIcon from '@material-ui/icons/DeleteOutlined'
import MultiSelectComboBox from '@zeliot/common/ui/MultiSelectComboBox'
import getLoginId from '@zeliot/common/utils/getLoginId'
import EnabledTableDialog from './EnabledTableDialog'
import SearchIcon from '@material-ui/icons/Search'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

import {
  withStyles,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Checkbox,
  Tooltip,
  Input,
  Chip,
  Button,
  Select,
  MenuItem,
  IconButton,
  TableFooter,
  InputAdornment,
} from '@material-ui/core'

/**
 * @param {object} a The first element of array to compare
 * @param {object} b The second element of array to compare
 * @param {string} orderBy The key of the object to compare
 * @returns {number} Ordering of 2 elements
 * @summary Compares 2 element and returns a number to specify ordering
 */
function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

/**
 * @param {string} order Specifies the order of sorting
 * @param {string} orderBy Specifies the value to compare for ordering
 * @returns {number} The ordering of 2 elements
 * @summary Function to sort array elements
 */
function getSorting(order, orderBy) {
  return order === 'desc'
    ? (a, b) => desc(a, b, orderBy)
    : (a, b) => -desc(a, b, orderBy)
}

/**
 * @param {object} row A row object to determine the column heading
 * @returns {object[]} Array of heading objects for properties of row heading
 * @summary Gets the array of column names for Heading row
 */
function getRowHeading(row, selectedLanguage) {
  // console.log('row heading data', row)
  const rowHeading = [
    {
      id: 'vehicleNumber',
      numeric: false,
      disablePadding: true,
      label: languageJson[selectedLanguage].common.vehicleNumber,
    },
  ]

  if (row && row.value !== undefined) {
    rowHeading.push({
      id: 'value',
      numeric: false,
      disablePadding: true,
      label: 'Value',
    })
  }

  if (row && row.from !== undefined) {
    rowHeading.push({
      id: 'from',
      numeric: false,
      disablePadding: true,
      label: 'From',
    })
  }

  if (row && row.to !== undefined) {
    rowHeading.push({
      id: 'to',
      numeric: false,
      disablePadding: true,
      label: 'To',
    })
  }

  if (row && row.runningHours !== undefined) {
    rowHeading.push({
      id: 'runningHours',
      numberic: false,
      disablePadding: true,
      label: 'Running Hours',
    })
  }

  if (row && row.numberOfDays !== undefined) {
    rowHeading.push({
      id: 'numberOfDays',
      numberic: false,
      disablePadding: true,
      label: 'Number of Days',
    })
  }

  if (row && row.isRecurring !== undefined) {
    rowHeading.push({
      id: 'isRecurring',
      numberic: false,
      disablePadding: true,
      label: 'Recurring ?',
    })
  }

  if (row && row.parametersData !== undefined) {
    rowHeading.push({
      id: 'parameters',
      numberic: false,
      disablePadding: true,
      label: 'Parameters',
    })
  }

  if (row && row.parametersData !== undefined) {
    rowHeading.push({
      id: 'parametersValue',
      numberic: false,
      disablePadding: true,
      label: 'Parameter Value',
    })
  }

  return rowHeading.concat([
    { id: 'email', numeric: false, disablePadding: true, label: 'Email' },
    { id: 'phone', numeric: false, disablePadding: true, label: 'Phone' },
  ])
}

/**
 * @param {object} props React component props
 * @summary The Table Header component with column headings and buttons to sort
 */
function EnhancedTableHead(props) {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    rowHeading,
    onRequestSort,
  } = props

  // console.log('row heading', rowHeading)

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property)
  }

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={numSelected > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>
        {rowHeading.map((column) => {
          return (
            <TableCell
              key={column.id}
              align={column.numeric ? 'right' : 'inherit'}
              padding={column.disablePadding ? 'none' : 'default'}
              sortDirection={orderBy === column.id ? order : false}
            >
              <Tooltip
                title="Sort"
                placement={column.numeric ? 'bottom-end' : 'bottom-start'}
                enterDelay={300}
              >
                <TableSortLabel
                  active={orderBy === column.id}
                  direction={order}
                  onClick={createSortHandler(column.id)}
                >
                  {column.label}
                </TableSortLabel>
              </Tooltip>
            </TableCell>
          )
        }, this)}
        <TableCell padding="none" align="right" />
      </TableRow>
    </TableHead>
  )
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
}

/**
 * @param {number} timeInput The time duration in seconds
 * @summary Converts time duration in seconds to hh:mm string
 */
function getTimeString(timeInput) {
  return (
    parseInt(timeInput / 60, 10)
      .toString()
      .padStart(2, '0') +
    ':' +
    (timeInput % 60).toString().padStart(2, '0')
  )
}

const rowStyles = {
  root: {
    borderBottom: 'none',
  },
  cellStyle: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    width: '19rem',
  },
  inputStyle: {
    width: '20rem',
    // position: "fixed"
  },
  paramContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '20vw',
    marginTop: '1rem',
    marginLeft: '-1rem',
    height: '25vh',
    overflowY: 'scroll',
  },
  paramContainer2: {
    // display: 'flex',
    // flexWrap: 'wrap',
    width: '29vw',
    marginTop: '1rem',
    marginLeft: '-2rem',
    height: '25vh',
    overflowY: 'scroll',
  },
  valueStyle: {
    width: '5.5rem',
    margin: '0 -0.5rem',
  },
}

/**
 * @summary CustomTableRow component creates a TableRow with toggleable inputs & buttons
 */
class CustomizedRow extends Component {
  /**
   * @property {boolean} editMode Flag to indicate if fields can be edited in the row
   * @property {object} preEditValues Values of the row before editing
   */
  state = {
    editMode: false,
    preEditValues: {},
  }

  /**
   * @callback
   * @summary Switch the row to edit mode
   */
  handleEdit = () => {
    this.setState(
      {
        editMode: true,
        preEditValues: {
          ...(this.props.row.value ? { value: this.props.row.value } : {}),
          email: this.props.row.email,
          phone: this.props.row.phone,
        },
      },
      () => {
        console.log('previous edits', this.state.preEditValues)
      }
    )
  }

  render() {
    const {
      isSelected,
      row,
      handleValueChange,
      handleClick,
      options,
      classes,
      searchTerm,
      handleParamCheck,
      handleParamMinMaxValueChange,
      handleSearchInputChange,
      selectedLanguage,
    } = this.props

    let rowValue = row.value
    let newArray

    if (options && options.length > 0 && Array.isArray(row.value)) {
      newArray = row.value.map((item) => options.find(({ id }) => id === item))
    }
    // console.log('row data', row)

    function removeUndefinedValueFromArray(newArray) {
      return newArray.filter(function (ele) {
        return ele != undefined
      })
    }
    if (newArray != undefined) {
      rowValue = removeUndefinedValueFromArray(newArray)
    }
    return (
      <TableRow
        role="checkbox"
        aria-checked={isSelected}
        tabIndex={-1}
        key={row.uniqueId}
        selected={isSelected}
      >
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            checked={isSelected}
            onChange={handleClick(row.uniqueId)}
          />
        </TableCell>

        <TableCell component="th" scope="row" padding="none">
          {row.vehicleNumber}
        </TableCell>

        {row.value !== undefined &&
          (options ? (
            Array.isArray(rowValue) ? (
              <TableCell padding="none">
                <Select
                  style={{ width: 250 }}
                  multiple
                  value={rowValue.map(({ name }) => name)}
                  onChange={(e) => {
                    if (e.target.value.includes('SELECT_ALL')) {
                      if (
                        parseInt(e.target.value.length, 10) ===
                        parseInt(options.length, 10) + 1
                      ) {
                        handleValueChange(
                          row.uniqueId,
                          'value'
                        )({
                          target: {
                            value: [],
                          },
                        })
                      } else {
                        handleValueChange(
                          row.uniqueId,
                          'value'
                        )({
                          target: {
                            value: options.map((option) => option.id),
                          },
                        })
                      }
                    } else {
                      handleValueChange(
                        row.uniqueId,
                        'value'
                      )({
                        target: {
                          value: e.target.value.map((name) => {
                            const option = options.find(
                              ({ name: optionName }) => name === optionName
                            )
                            return option.id
                          }),
                        },
                      })
                    }
                  }}
                >
                  <MenuItem key="SELECT_ALL" value="SELECT_ALL">
                    {parseInt(rowValue.length, 10) ===
                    parseInt(options.length, 10)
                      ? 'Select None'
                      : 'Select All'}
                  </MenuItem>

                  {options.map((option) => (
                    <MenuItem key={option.id} value={option.name}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
            ) : (
              <TableCell padding="none">
                <Select
                  style={{ width: 50 }}
                  value={rowValue}
                  onChange={handleValueChange(row.uniqueId, 'value')}
                >
                  {options.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
            )
          ) : (
            <TableCell padding="none">
              <Input
                style={{ width: 50 }}
                value={row.value}
                onChange={handleValueChange(row.uniqueId, 'value')}
              />
            </TableCell>
          ))}

        {row.from !== undefined && (
          <TableCell padding="none">
            {this.state.editMode ? (
              <input
                required
                type="time"
                step="300"
                value={getTimeString(row.from || 0)}
                onBlur={(e) => {
                  const [hour, minute] = getTimeFromString(e.target.value)

                  handleValueChange(
                    row.uniqueId,
                    'from'
                  )({
                    target: {
                      value:
                        parseInt(hour * 60, 10) + parseInt(minute / 5, 10) * 5,
                    },
                  })
                }}
                onChange={(e) => {
                  const [hour, minute] = getTimeFromString(e.target.value)

                  handleValueChange(
                    row.uniqueId,
                    'from'
                  )({
                    target: {
                      value: parseInt(hour * 60, 10) + parseInt(minute, 10),
                    },
                  })
                }}
              />
            ) : (
              getTimeString(row.from || 0)
            )}
          </TableCell>
        )}

        {row.to !== undefined && (
          <TableCell padding="none">
            {this.state.editMode ? (
              <input
                required
                type="time"
                step="300"
                value={getTimeString(row.to || 0)}
                onBlur={(e) => {
                  const [hour, minute] = getTimeFromString(e.target.value)

                  handleValueChange(
                    row.uniqueId,
                    'to'
                  )({
                    target: {
                      value:
                        parseInt(hour * 60, 10) + parseInt(minute / 5, 10) * 5,
                    },
                  })
                }}
                onChange={(e) => {
                  const [hour, minute] = getTimeFromString(e.target.value)

                  handleValueChange(
                    row.uniqueId,
                    'to'
                  )({
                    target: {
                      value: parseInt(hour * 60, 10) + parseInt(minute, 10),
                    },
                  })
                }}
              />
            ) : (
              getTimeString(row.to || 0)
            )}
          </TableCell>
        )}

        {row.runningHours !== undefined && (
          <TableCell padding="none">
            {this.state.editMode ? (
              <Input
                value={row.runningHours}
                type="number"
                inputProps={{ min: 0, max: 10000 }}
                onChange={handleValueChange(row.uniqueId, 'runningHours')}
              />
            ) : (
              row.runningHours
            )}
          </TableCell>
        )}

        {row.numberOfDays !== undefined && (
          <TableCell padding="none">
            {this.state.editMode ? (
              <Input
                value={row.numberOfDays}
                type="number"
                inputProps={{ min: 0, max: 1000 }}
                onChange={handleValueChange(row.uniqueId, 'numberOfDays')}
              />
            ) : (
              row.numberOfDays
            )}
          </TableCell>
        )}

        {row.isRecurring !== undefined && (
          <TableCell padding="none">
            {this.state.editMode ? (
              <Checkbox
                color="primary"
                checked={row.isRecurring}
                onChange={(e) => {
                  handleValueChange(
                    row.uniqueId,
                    'isRecurring'
                  )({
                    target: {
                      value: e.target.checked,
                    },
                  })
                }}
              />
            ) : (
              <Checkbox disabled color="primary" checked={row.isRecurring} />
            )}
          </TableCell>
        )}

        {row.parametersData !== undefined && (
          <TableCell className={classes.cellStyle}>
            <Input
              id={row.uniqueId}
              className={classes.inputStyle}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              }
              value={searchTerm[row.uniqueId]}
              onChange={handleSearchInputChange(row.uniqueId)}
            />
            <div className={classes.paramContainer}>
              {row.parametersData
                .filter((item) => {
                  // console.log('paramdata', item, searchTerm)
                  return (
                    item.parameter
                      .toLowerCase()
                      .indexOf(searchTerm[row.uniqueId].toLowerCase()) !== -1
                  )
                })
                .map((param) => {
                  // console.log('param', param)
                  return (
                    <TableCell
                      key={param.pid}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0,
                      }}
                      classes={{
                        root: classes.root,
                      }}
                    >
                      <Checkbox
                        color={this.state.editMode ? 'primary' : ''}
                        id={param.pid}
                        checked={param.isEnable}
                        onChange={handleParamCheck(param.pid, row.uniqueId)}
                      />
                      <span>{param.parameter}</span>
                    </TableCell>
                  )
                })}
            </div>
          </TableCell>
        )}

        {row.parametersData !== undefined && (
          <TableCell>
            <div className={classes.paramContainer2}>
              {row.parametersData.map(
                (param) =>
                  param.isEnable && (
                    <TableRow
                      key={param.pid}
                      className={classes.valueContainer}
                    >
                      <TableCell
                        classes={{
                          root: classes.root,
                        }}
                      >
                        {param.parameter}
                      </TableCell>

                      <TableCell
                        classes={{
                          root: classes.root,
                        }}
                      >
                        {this.state.editMode ? (
                          <Input
                            className={classes.valueStyle}
                            placeholder="min value"
                            name="minValue"
                            type="number"
                            inputProps={{ min: -1000, max: 1000 }}
                            value={param.minValue}
                            onChange={handleParamMinMaxValueChange(
                              param.pid,
                              row.uniqueId,
                              'minValue'
                            )}
                          />
                        ) : (
                          param.minValue
                        )}
                      </TableCell>
                      <TableCell
                        classes={{
                          root: classes.root,
                        }}
                      >
                        {this.state.editMode ? (
                          <Input
                            className={classes.valueStyle}
                            placeholder="max value"
                            name="maxValue"
                            type="number"
                            inputProps={{ min: -1000, max: 1000 }}
                            value={param.maxValue}
                            onChange={handleParamMinMaxValueChange(
                              param.pid,
                              row.uniqueId,
                              'maxValue'
                            )}
                          />
                        ) : (
                          param.maxValue
                        )}
                      </TableCell>
                    </TableRow>
                  )
              )}
            </div>
          </TableCell>
        )}

        <TableCell padding="none">
          {this.state.editMode ? (
            <Input
              style={{ width: '10rem' }}
              value={row.email}
              onChange={handleValueChange(row.uniqueId, 'email')}
            />
          ) : (
            row.email
          )}
        </TableCell>

        <TableCell padding="none">
          {this.state.editMode ? (
            <Input
              style={{ width: '10rem' }}
              value={row.phone}
              onChange={handleValueChange(row.uniqueId, 'phone')}
            />
          ) : (
            row.phone
          )}
        </TableCell>

        <TableCell padding="none" align="right">
          {
            <Fragment>
              {this.state.editMode ? (
                <IconButton
                  color="primary"
                  onClick={async () => {
                    const status = await this.props.handleEdit(this.props.row)
                    if (status) {
                      this.setState({ editMode: false })
                    }
                  }}
                >
                  <DoneIcon />
                </IconButton>
              ) : (
                <Tooltip title="Edit Values for Vehicle">
                  <IconButton onClick={this.handleEdit}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="Delete alert for Vehicle">
                <IconButton
                  onClick={() => this.props.handleDelete(this.props.row)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Fragment>
          }
        </TableCell>
      </TableRow>
    )
  }
}

const CustomTableRow = withStyles(rowStyles)(CustomizedRow)

/**
 * @param {string} time Time as a string in hh:mm format
 * @summary Converts time string to an array of hours & minutes
 */
function getTimeFromString(time) {
  let [hour, minute] = time.split(':')
  hour = hour || 0
  minute = minute || 0

  return [hour, minute]
}

const styles = (theme) => ({
  root: {
    width: '100%',
  },
  searchContainer: {
    width: 300,
  },
  table: {
    minWidth: 1020,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  tableToolbar: {
    padding: `${theme.spacing(2)}px ${theme.spacing(4)}px`,
  },
  tableToolbarItem: {
    padding: `${theme.spacing(1)}px 0`,
  },
  tableToolbarContainer: {
    height: theme.spacing(6),
  },
  tableFooterButtons: {
    padding: `${theme.spacing(3)}px 0`,
  },
})

/**
 * @summary EnabledAlertTable renders the table of alert
 * configurations for disabling/editing the configurations
 */
class EnabledAlertTable extends React.Component {
  /**
   * @property {string} order The order of sorting the alert configurations
   * @property {string} orderBy The column name for sorting
   * @property {object[]} selected The selected alert configurations
   * @property {number} page The page number of the alert configurations table
   * @property {number} rowsPerPage The number of rows per page in configurations table
   * @property {string[]} searchedItems The array of unique Ids of vehicles that match the search query
   * @property {object[]} filteredTableItems The array of configuration objects that match the search query
   * @property {string} dialogTitle The title of the dialog
   * @property {string} dialogContent The content of the dialog
   * @property {string} dialogMode The mode of the dialog
   * @property {string} dialogSubmitButtonTitle The title of the Dialog Submit button
   * @property {string} dialogCancelButtonTitle The title of the Dialog Cancel button
   * @property {string} dialogAction The action to execut on submit of Dialog
   */
  state = {
    order: 'asc',
    orderBy: 'vehicleNumber',
    selected: [],
    page: 0,
    rowsPerPage: 5,
    searchedItems: [],
    filteredTableItems: [],
    dialogTitle: '',
    dialogContent: '',
    dialogMode: 'CONFIRMATION',
    showDialog: false,
    dialogSubmitButtonTitle: '',
    dialogCancelButtonTitle: '',
    dialogAction: '',
  }

  /**
   * @callback
   * @param {object} event React Synthetic event
   * @param {string} property The column name to sort the configurations by
   * @summary Callback to handle sorting of alert configurations
   */
  handleRequestSort = (event, property) => {
    const orderBy = property
    let order = 'desc'

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc'
    }

    this.setState({ order, orderBy })
  }

  /**
   * @callback
   * @param {object} event React Synthetic event
   * @param {boolean} checked Boolean to select all or none
   * @summary Callback to toggle selecting all or none of the alert configurations
   */
  handleSelectAllClick = (event, checked) => {
    if (checked) {
      this.setState({
        selected: this.state.searchedItems.length
          ? this.state.filteredTableItems.map((n) => n.uniqueId)
          : this.props.data.map((n) => n.uniqueId),
      })
      return
    }
    this.setState({ selected: [] })
  }

  /**
   * @callback
   * @param {string} uniqueId The unique device Id of the clicked configuration
   * @summary Handles the click of an alert configuration row
   */
  handleClick = (uniqueId) => (event, checked) => {
    const { selected } = this.state
    // console.log('selected vehi', uniqueId, selected)
    const selectedIndex = selected.indexOf(uniqueId)
    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, uniqueId)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      )
    }

    this.setState({ selected: newSelected })
  }

  /**
   * @callback
   * @param {object} event React Synthetic event
   * @param {number} page The page of the alert configurations table
   * @summary Handles changing the page of the alert configurations table
   */
  handleChangePage = (event, page) => this.setState({ page })

  /**
   * @callback
   * @param {object} event React Synthetic event
   * @summary Changes the number of rows to display per page
   */
  handleChangeRowsPerPage = (event) =>
    this.setState({ rowsPerPage: event.target.value })

  /**
   * @function
   * @param {object[]} searchedItems The array of serached parameters
   * @summary Filters the alert configurations by the searched parameters
   */
  handleSearchedItemsChange = (searchedItems) => {
    let toBeFilteredItems = []

    searchedItems.forEach((item) => {
      if (item.type === 'VEHICLE') {
        toBeFilteredItems.push(item.id)
      } else {
        const vehicleIds = this.props.groups
          .find((group) => group.id === item.id)
          .vehicles.map(({ uniqueDeviceId }) => uniqueDeviceId)

        toBeFilteredItems = toBeFilteredItems.concat(vehicleIds)
      }
    })

    this.setState({
      searchedItems,
      filteredTableItems: this.props.data.filter((item) =>
        toBeFilteredItems.includes(item.uniqueId)
      ),
    })
  }

  /**
   * @callback
   * @param {object} selectedItem The item to be deleted from the list of selected items
   * @summary Deletes an item from the list of searched list
   */
  handleChipDelete = (selectedItem) => () => {
    const searchedItems = [...this.state.searchedItems]
    let itemIndex = -1

    for (const i in searchedItems) {
      if (selectedItem.id === searchedItems[i].id) {
        itemIndex = i
        break
      }
    }

    searchedItems.splice(itemIndex, 1)
    this.handleSearchedItemsChange(searchedItems)
    this.setState({ searchedItems })
  }

  /**
   * @callback
   * @param {number} itemId The ID of the vehicle to deleted
   * @summary Deletes an alert configuration by disabling the alert
   */
  handleItemDelete = (itemId) => {
    this.props.handleValueChange(
      itemId,
      'isAlertEnabled'
    )({
      target: {
        value: false,
      },
    })
  }

  /**
   * @callback
   * @param {*} value The value to apply to selected items
   * @summary Handles submit on dialog and edits/deletes all selected
   */
  handleDialogSubmit = (value = null) => {
    // console.log('edited value', value)
    if (this.state.dialogMode === 'EDIT_MULTIPLE') {
      const selected = this.props.data.filter((item) =>
        this.state.selected.includes(item.uniqueId)
      )

      this.props.editMultiple(
        selected.map((item) => {
          // console.log('multi values', item, value)
          return {
            ...item,
            ...value,
          }
        }),
        value
      )
    } else if (this.state.dialogMode === 'CONFIRMATION') {
      if (this.state.dialogAction === 'DELETE') {
        // console.log('TODO: Delete an item from alerts configuration')
      } else if (this.state.dialogAction === 'DELETE_MULTIPLE') {
        // console.log('TODO: Delete multiple items from alerts configuration')
        const selected = this.props.data.filter((item) =>
          this.state.selected.includes(item.uniqueId)
        )
        this.props.deleteMultiple(selected)
      }
    }
  }

  /**
   * @callback
   * @summary Closes the dialog
   */
  handleDialogClose = () => {
    this.setState({
      showDialog: false,
      dialogMode: 'CONFIRMATION',
      dialogTitle: '',
      dialogContent: '',
      dialogSubmitButtonTitle: '',
      dialogCancelButtonTitle: '',
      dialogAction: '',
    })
  }

  /**
   * @function
   * @param {string} uniqueId The uniqueId of the vehicle
   * @summary Check if a vehicle is selected or not
   */
  isSelected = (uniqueId) => this.state.selected.indexOf(uniqueId) !== -1

  /**
   * @summary Renders the table of alert configurations
   */
  renderTable = () => {
    let items
    if (this.state.searchedItems.length) {
      const searchedItemIds = this.state.filteredTableItems.map(
        (item) => item.uniqueId
      )
      items = this.props.data.filter((item) =>
        searchedItemIds.includes(item.uniqueId)
      )
    } else {
      items = this.props.data
    }

    items = items.filter((item) => item.isAlertEnabled)

    const hasValue = items.length ? items[0].value !== undefined : false

    const emptyRows =
      this.state.rowsPerPage -
      Math.min(
        this.state.rowsPerPage,
        items.length - this.state.page * this.state.rowsPerPage
      )

    const searchItems = this.props.groups.map(({ id, name }) => ({
      id,
      name,
      type: 'GROUP',
    }))

    const searchItems2 = this.props.data.map(({ vehicleNumber, uniqueId }) => ({
      id: uniqueId,
      name: vehicleNumber,
      type: 'VEHICLE',
    }))

    const {
      classes,
      data,
      options,
      handleValueChange,
      handleEdit,
      handleDelete,
      selectedAlert,
      searchTerm,
      handleParamCheck,
      handleParamMinMaxValueChange,
      handleSearchInputChange,
      allParameters,
      selectedLanguage,
    } = this.props

    const {
      dialogTitle,
      dialogMode,
      dialogContent,
      showDialog,
      dialogSubmitButtonTitle,
      dialogCancelButtonTitle,
      searchedItems,
      selected,
      order,
      orderBy,
      page,
      rowsPerPage,
    } = this.state

    // console.log('enable alert', selectedAlert)

    return (
      <Fragment>
        <div className={classes.tableWrapper}>
          <EnabledTableDialog
            title={dialogTitle}
            options={options}
            allParameters={allParameters}
            content={dialogContent}
            dialogMode={dialogMode}
            onSubmit={this.handleDialogSubmit}
            open={showDialog}
            hasValue={hasValue}
            onClose={this.handleDialogClose}
            dialogSubmitButtonTitle={dialogSubmitButtonTitle}
            dialogCancelButtonTitle={dialogCancelButtonTitle}
            selectedAlert={selectedAlert}
          />

          <Grid container className={classes.tableToolbar} alignItems="center">
            <Grid item xs={12}>
              <Grid container justify="space-between" alignItems="center">
                <Grid item className={classes.tableToolbarItem}>
                  <Grid
                    container
                    alignItems="center"
                    className={classes.tableToolbarContainer}
                    spacing={3}
                  >
                    <Grid item>
                      <div className={classes.searchContainer}>
                        <MultiSelectComboBox
                          items={searchItems2.concat(searchItems)}
                          itemKey="id"
                          itemToStringKey="name"
                          itemToLabelKey="type"
                          selectedItems={searchedItems}
                          onSelectedItemsChange={this.handleSearchedItemsChange}
                          searchByFields={['name']}
                          isLoading={false}
                          placeholder={
                            languageJson[selectedLanguage].alertsPage
                              .configureAlertsPage.searchVehiclesAndGroups
                          }
                        />
                      </div>
                    </Grid>

                    {selected.length > 0 && (
                      <Fragment>
                        <Grid item>
                          <Button
                            onClick={() => {
                              this.setState({
                                showDialog: true,
                                dialogMode: 'EDIT_MULTIPLE',
                                dialogTitle:
                                  'Update Multiple Vehicle Configurations',
                                dialogSubmitButtonTitle: 'Update Multiple',
                                dialogCancelButtonTitle: 'Cancel',
                                dialogAction: 'EDIT_MULTIPLE',
                              })
                            }}
                            variant="outlined"
                            aria-label="Multiple"
                          >
                            <EditIcon /> &nbsp; Multiple Vehicles
                          </Button>
                        </Grid>

                        <Grid item>
                          <Button
                            onClick={() => {
                              this.setState({
                                showDialog: true,
                                dialogMode: 'CONFIRMATION',
                                dialogTitle:
                                  'Delete Multiple Vehicle Configurations',
                                dialogSubmitButtonTitle: 'Delete Multiple',
                                dialogCancelButtonTitle: 'Cancel',
                                dialogAction: 'DELETE_MULTIPLE',
                              })
                            }}
                            variant="outlined"
                            aria-label="Multiple"
                          >
                            <DeleteIcon /> &nbsp; Multiple Vehicles
                          </Button>
                        </Grid>
                      </Fragment>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {searchedItems.length > 0 && (
              <Grid item xs={12} className={classes.tableToolbarItem}>
                <Grid container spacing={2}>
                  {searchedItems.map((searchedItem) => (
                    <Grid item key={searchedItem.id}>
                      <Chip
                        label={`${searchedItem.name} (${searchedItem.type})`}
                        onDelete={this.handleChipDelete(searchedItem)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}
          </Grid>

          <Table className={classes.table} aria-labelledby="tableTitle">
            {items.length > 0 && (
              <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={this.handleSelectAllClick}
                onRequestSort={this.handleRequestSort}
                rowCount={items.length}
                rowHeading={getRowHeading(data[0], selectedLanguage)}
              />
            )}

            <TableBody>
              {items
                .sort(getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  const isSelected = this.isSelected(row.uniqueId)
                  // console.log('row data', row)
                  return (
                    <CustomTableRow
                      key={row.uniqueId}
                      options={options}
                      selectedAlert={selectedAlert}
                      row={row}
                      isSelected={isSelected}
                      handleValueChange={handleValueChange}
                      handleClick={this.handleClick}
                      handleEdit={handleEdit}
                      searchTerm={searchTerm}
                      handleParamCheck={handleParamCheck}
                      handleParamMinMaxValueChange={
                        handleParamMinMaxValueChange
                      }
                      handleSearchInputChange={handleSearchInputChange}
                      handleDelete={(val) => {
                        handleDelete(val)
                        this.setState(({ filteredTableItems }) => {
                          return {
                            filteredTableItems: filteredTableItems.filter(
                              (item) => val.uniqueId !== item.uniqueId
                            ),
                          }
                        })
                      }}
                    />
                  )
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 49 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  count={items.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  backIconButtonProps={{
                    'aria-label': 'Previous Page',
                  }}
                  nextIconButtonProps={{
                    'aria-label': 'Next Page',
                  }}
                  onChangePage={this.handleChangePage}
                  onChangeRowsPerPage={this.handleChangeRowsPerPage}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </Fragment>
    )
  }

  render() {
    return <div className={this.props.classes.root}>{this.renderTable()}</div>
  }
}

const GET_GROUPS = gql`
  query($loginId: Int!) {
    groups: allGroupsDetails(clientLoginId: $loginId) {
      id
      name: groupName
      vehicles: assignedVehicles {
        vehicleNumber
        uniqueDeviceId
      }
    }
  }
`

const GET_AREAS = gql`
  query($loginId: Int!) {
    options: getAllAreaDetails(clientLoginId: $loginId) {
      id
      name: areaName
    }
  }
`

const GET_ROUTES = gql`
  query($loginId: Int!) {
    options: getAllRoutes(clientLoginId: $loginId) {
      id
      name: areaName
    }
  }
`

/**
 * @param {object} props React component props
 * @summary Query groups, areas/routes and pass them as props to the EnabledAlertTable component
 */
function EnabledAlertTableWithGroups(props) {
  return (
    <Query query={GET_GROUPS} variables={{ loginId: getLoginId() }}>
      {({ loading, error, data: groupsData }) => {
        if (loading) return 'Loading ...'
        if (error) return 'Error fetching groups'

        if (props.alert.type === 'geofence') {
          return (
            <Query query={GET_AREAS} variables={{ loginId: getLoginId() }}>
              {({ loading, error, data }) => {
                if (loading) return 'Loading ...'
                if (error) return 'Error fetching areas'
                return (
                  <EnabledAlertTable
                    groups={groupsData.groups}
                    options={data.options}
                    {...props}
                  />
                )
              }}
            </Query>
          )
        }

        if (props.alert.type === 'routefence') {
          return (
            <Query query={GET_ROUTES} variables={{ loginId: getLoginId() }}>
              {({ loading, error, data }) => {
                if (loading) return 'Loading ...'
                if (error) return 'Error fetching routes'
                return (
                  <EnabledAlertTable
                    groups={groupsData.groups}
                    options={data.options}
                    {...props}
                  />
                )
              }}
            </Query>
          )
        }

        if (props.alert.type === 'halt' || props.alert.type === 'idle') {
          return (
            <EnabledAlertTable
              groups={groupsData.groups}
              options={[10, 20, 30, 40, 50, 60]}
              {...props}
            />
          )
        }

        return <EnabledAlertTable groups={groupsData.groups} {...props} />
      }}
    </Query>
  )
}

export default withLanguage(withStyles(styles)(EnabledAlertTableWithGroups))
