/**
 * @module Vehicles/GroupsView
 * @summary This module exports the Groups management component
 */

import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { withRouter, Link, Switch } from 'react-router-dom'
import { withApollo } from 'react-apollo'
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
  Toolbar,
  Paper,
  IconButton,
  Tooltip,
  Modal,
  Input,
  Button,
  InputAdornment,
  Typography,
} from '@material-ui/core'
import { Search as SearchIcon, Add as AddIcon } from '@material-ui/icons'
import getLoginId from '@zeliot/common/utils/getLoginId'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import VehiclesGroupDetails from './VehiclesGroupDetails'
// import AssignVehicle from '../Vehicles/AssignVehicle/AssignVehicle'
import AddGroup from '../Vehicles/AddGroup/AddGroup'
import { PrivateRoute } from '@zeliot/common/router'

import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'
import { ContinuousSizeLegend } from 'react-vis'
import Loader from 'packages/common/ui/Loader/Loader'

const GET_ALL_GROUPS = gql`
  query allGroupsDetails($accountType: String, $clientLoginId: Int!) {
    allGroupsDetails(accountType: $accountType, clientLoginId: $clientLoginId) {
      id
      groupName
      assignedVehicles {
        vehicleNumber
      }
      createdAt
    }
  }
`

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
 * @param {*[]} array The array to be sorted
 * @param {function} cmp The function to use to compare elements in the array
 * @returns {*[]} The sorted array
 * @summary Sort the array using a comparator function
 */
function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index])

  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })

  return stabilizedThis.map((el) => el[0])
}

/**
 * @param {'asc'|'desc'} order The ordering to be followed
 * @param {string} orderBy The column to order by
 * @returns Ordering between 2 elements
 * @summary Sorts an array of objects by the given ordering column
 */
function getSorting(order, orderBy) {
  return order === 'desc'
    ? (a, b) => desc(a, b, orderBy)
    : (a, b) => -desc(a, b, orderBy)
}

const rows = [
  {
    id: 'groupName',
    numeric: false,
    disablePadding: true,
    label: 'Group Name',
  },
  {
    id: 'assignedVehicles',
    numeric: true,
    disablePadding: false,
    label: 'Assigned Vehicles',
  },
  {
    id: 'createdAt',
    numeric: true,
    disablePadding: false,
    label: 'Created Date',
  },
]

/**
 * @summary EnhancedTableHead component provides a Table Header component with added functionality
 */
class EnhancedTableHead extends React.Component {
  createSortHandler = (property) => (event) => {
    this.props.onRequestSort(event, property)
  }

  getRowDetails = (selectedLanguage) => {
    let rows = [
      {
        id: 'groupName',
        numeric: false,
        disablePadding: true,
        label:
          languageJson[selectedLanguage].vehiclesPage.groupsTable
            .groupsTableColumn[0],
      },
      {
        id: 'assignedVehicles',
        numeric: true,
        disablePadding: false,
        label:
          languageJson[selectedLanguage].vehiclesPage.groupsTable
            .groupsTableColumn[1],
      },
      {
        id: 'createdAt',
        numeric: true,
        disablePadding: false,
        label:
          languageJson[selectedLanguage].vehiclesPage.groupsTable
            .groupsTableColumn[2],
      },
    ]

    return rows
  }

  render() {
    const { order, orderBy, selectedLanguage } = this.props

    return (
      <TableHead>
        <TableRow>
          {this.getRowDetails(selectedLanguage).map((row) => {
            return (
              <TableCell
                key={row.id}
                align={row.numeric ? 'right' : 'inherit'}
                padding={row.disablePadding ? 'default' : 'default'}
                sortDirection={orderBy === row.id ? order : false}
              >
                <Tooltip
                  title="Sort"
                  placement={row.numeric ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={orderBy === row.id}
                    direction={order}
                    onClick={this.createSortHandler(row.id)}
                  >
                    {row.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            )
          }, this)}
        </TableRow>
      </TableHead>
    )
  }
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
}

const toolbarStyles = (theme) => ({
  root: {
    paddingRight: theme.spacing(1),
  },

  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    flex: '0 0 auto',
  },
})

/**
 * @param {object} props React component props
 * @summary TableToolbar component provides a Toolbar for the Table
 */
function TableToolbar(props) {
  const {
    numSelected,
    classes,
    addGroup,
    handleSearchValueChange,
    selectedLanguage,
  } = props

  return (
    <Toolbar
      className={classNames(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      <div className={classes.spacer}>
        <Grid>
          <Typography variant="h6">Groups - View</Typography>
        </Grid>
      </div>

      <Input
        fullWidth
        placeholder={
          languageJson[selectedLanguage].vehiclesPage.groupsTable.searchGroups
        }
        onChange={handleSearchValueChange}
        startAdornment={
          <InputAdornment>
            <SearchIcon />
          </InputAdornment>
        }
      />
    </Toolbar>
  )
}

TableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  addGroup: PropTypes.func.isRequired,
  closeAddGroupModal: PropTypes.func.isRequired,
  handleSearchValueChange: PropTypes.func.isRequired,
}

const EnhancedTableToolbar = withStyles(toolbarStyles)(TableToolbar)

const styles = (theme) => ({
  clickableCard: {
    cursor: 'pointer',
  },
  root: {
    width: '100%',
  },
  table: {
    Width: '100%',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  paper: {
    padding: theme.spacing(2),
  },
})

/**
 * @summary Groups component shows the groups of a client in a table
 */
class VehicleGroupsView extends React.Component {
  /**
   * @property {string} order The ordering of the table
   * @property {string} orderBy The column to order the rows of the table by
   * @property {object[]} selected The selected rows of the table
   * @property {number} page The page number of the table
   * @property {number} rowsPerPage The number of rows per page of the table
   * @property {object[]} groupsData The array of groups
   * @property {boolean} open Whether to open the group assignment dialog
   * @property {string} groupId The ID of the group to edit
   * @property {string} groupsName The name of the group to be edited
   * @property {boolean} addOpen Whether to open the modal to create new group
   * @property {string} searchValue The value of the search bar
   */
  state = {
    order: 'desc',
    orderBy: 'createdAt',
    selected: [],
    page: 0,
    rowsPerPage: 5,
    groupsData: [],
    open: false,
    groupId: '',
    groupsName: '',
    addOpen: false,
    searchValue: '',
    isLoading: true,
  }

  /**
   * @callback
   * @param {string} property The column to sort the data by
   * @summary Sorts the data by the given column
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
   * @summary Selects/Deselects each row in the groups table
   */
  handleClick = (event, id, groupName) => {
    const { selected } = this.state
    const selectedIndex = selected.indexOf(id)

    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id)
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

    this.setState({
      selected: newSelected,
      groupId: id,
      groupsName: groupName,
      open: true,
    })
  }

  /**
   * @callback
   * @summary Changes the page of the table
   */
  handleChangePage = (event, page) => {
    this.setState({ page })
  }

  /**
   * @callback
   * @summary Changes the number of rows displayed per page
   */
  handleChangeRowsPerPage = (event) => {
    this.setState({ rowsPerPage: event.target.value })
  }

  /**
   * @function
   * @param {number} id The ID of the row
   * @summary Checks if the row is selected, using the row ID
   */
  isSelected = (id) => this.state.selected.indexOf(id) !== -1

  /**
   * @function
   * @summary Fetches all groups for a client
   */
  getAllGroups = async () => {
    const accountType = await localStorage.getItem('accountType')
    const { data } = await this.props.client.query({
      query: GET_ALL_GROUPS,
      variables: {
        accountType: accountType,
        clientLoginId: getLoginId(),
      },
      fetchPolicy: 'network-only',
    })
    if (data) {
      this.setState({
        groupsPresent: true,
        groupsData: data.allGroupsDetails,
        isLoading: false,
      })
    } else {
      this.setState({ groupsPresent: false, groupsData: [], isLoading: false })
    }
  }

  /**
   * @callback
   * @summary Sets the search field value
   */
  handleSearchValueChange = (e) => {
    this.setState({ searchValue: e.target.value })
  }

  /**
   * @function
   * @summary Opens the modal to add a group
   */
  openAddGroup = () => {
    this.setState({ addOpen: true })
  }

  /**
   * @function
   * @summary Closes the modal for adding group
   */
  closeAddGroup = () => {
    this.getAllGroups()
    this.setState({ addOpen: false })
  }

  /**
   * @function
   * @summary React component lifecycle called after component mounts
   */
  componentDidMount() {
    this.getAllGroups()
  }

  /**
   * @callback
   * @summary Closes the modal for editing group
   */
  handleClose = () => {
    // this.getAllGroups()
    this.setState({ open: false })
  }

  render() {
    const { classes, selectedLanguage } = this.props
    const {
      order,
      orderBy,
      selected,
      rowsPerPage,
      page,
      searchValue,
      isLoading,
    } = this.state

    const emptyRows =
      rowsPerPage -
      Math.min(rowsPerPage, this.state.groupsData.length - page * rowsPerPage)

    return (
      <div>
        {isLoading ? (
          <Loader />
        ) : (
          <Paper className={classes.root}>
            <EnhancedTableToolbar
              numSelected={selected.length}
              addGroup={this.openAddGroup}
              closeAddGroupModal={this.closeAddGroup}
              handleSearchValueChange={this.handleSearchValueChange}
              selectedLanguage={selectedLanguage}
            />

            <div className={classes.tableWrapper}>
              <Table className={classes.table} aria-labelledby="tableTitle">
                <EnhancedTableHead
                  numSelected={selected.length}
                  order={order}
                  orderBy={orderBy}
                  onSelectAllClick={this.handleSelectAllClick}
                  onRequestSort={this.handleRequestSort}
                  rowCount={this.state.groupsData.length}
                  selectedLanguage={selectedLanguage}
                />

                <TableBody>
                  {stableSort(this.state.groupsData, getSorting(order, orderBy))
                    .filter((n) =>
                      n.groupName
                        .toLowerCase()
                        .includes(searchValue.toLowerCase())
                    )
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((n) => {
                      const isSelected = this.isSelected(n.id)
                      return (
                        <TableRow
                          className={classes.clickableCard}
                          hover
                          onClick={(event) =>
                            this.handleClick(event, n.id, n.groupName)
                          }
                          role="checkbox"
                          aria-checked={isSelected}
                          tabIndex={-1}
                          key={n.id}
                          // selected={isSelected}
                        >
                          <TableCell
                            component="th"
                            scope="row"
                            padding="default"
                          >
                            {n.groupName}
                          </TableCell>

                          <TableCell align="right">
                            {n.assignedVehicles.length}
                          </TableCell>

                          <TableCell align="right">
                            {getFormattedTime(n.createdAt, 'MMMM Do YYYY')}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 49 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <Modal
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={this.state.open}
                onClose={this.handleClose}
              >
                <Grid
                  container
                  style={{ height: '100%' }}
                  justify="center"
                  alignItems="center"
                >
                  <Grid item xs={10} md={4}>
                    <Paper className={classes.paper}>
                      <VehiclesGroupDetails
                        groupId={this.state.groupId}
                        groupsName={this.state.groupsName}
                        closeModal={this.handleClose}
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </Modal>

              <Modal
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={this.state.addOpen}
                onClose={this.closeAddGroup}
              >
                <Grid
                  container
                  style={{ height: '100%' }}
                  justify="center"
                  alignItems="center"
                >
                  <Grid item xs={10} md={4}>
                    <Paper className={classes.paper}>
                      <AddGroup closeAddGroupModal={this.closeAddGroup} />
                    </Paper>
                  </Grid>
                </Grid>
              </Modal>
            </div>

            <TablePagination
              component="div"
              count={this.state.groupsData.length}
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
          </Paper>
        )}
      </div>
    )
  }
}

VehicleGroupsView.propTypes = {
  classes: PropTypes.object.isRequired,
}

const WrappedGroups = withLanguage(
  withStyles(styles)(withApollo(VehicleGroupsView))
)

export default () => (
  <Switch>
    <PrivateRoute
      exact
      path="/home/manage-vehicles-view/"
      render={(props) => <WrappedGroups {...props} />}
      component={withApollo(
        withLanguage(withStyles(styles)(VehicleGroupsView))
      )}
    />
  </Switch>
)
