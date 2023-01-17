/**
 * @module Vehicles/AssignVehicle
 * @summary This module exports the component for Assigning vehicles to groups
 */

import React, { Fragment } from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { withApollo, Mutation } from 'react-apollo'
import {
  withStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Toolbar,
  Typography,
  Checkbox,
  IconButton,
  Tooltip,
  Button,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Input,
} from '@material-ui/core'
import { lighten } from '@material-ui/core/styles/colorManipulator'
import {
  Delete as DeleteIcon,
  CloudUpload,
  DeleteForever,
} from '@material-ui/icons'
import getLoginId from '@zeliot/common/utils/getLoginId'
import BulkVehicleAssign from './BulkVehicleAssign'
import DeleteGroup from './DeleteGroup'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
import Loader from 'packages/common/ui/Loader/Loader'

const GET_ALL_VEHICLES = gql`
  query getAllVehicleDetails($clientLoginId: Int) {
    getAllVehicleDetails(clientLoginId: $clientLoginId, status: [1, 3]) {
      entityId
      vehicleNumber
      deviceDetail {
        serial_num
      }
      simDetail {
        phoneNumber
      }
      vehicleType
      vehicleModel
    }
  }
`

const ASSIGN_VEHICLES_TO_GROUP = gql`
  mutation assignVehiclesToGroup(
    $groupId: Int!
    $vehicleList: [VehicleListInput!]!
  ) {
    assignVehiclesToGroup(groupId: $groupId, vehicleList: $vehicleList)
  }
`

const ALL_VEHICLE_GROUP_ASSIGN_DETAILS = gql`
  query allVehicleGroupAssignDetails($groupId: Int, $status: Int) {
    allVehicleGroupAssignDetails(groupId: $groupId, status: $status) {
      vehicle {
        entityId
      }
    }
  }
`

const GET_ALL_GROUPS = gql`
  query allGroupsDetails($clientLoginId: Int!) {
    allGroupsDetails(clientLoginId: $clientLoginId) {
      id
      groupName
      assignedVehicles {
        vehicleNumber
      }
      createdAt
    }
  }
`

const rows = [
  {
    id: 'vehicleNumber',
    numeric: false,
    disablePadding: true,
    label: 'VEHICLE NO',
  },
  {
    id: 'vehicleType',
    numeric: true,
    disablePadding: false,
    label: 'VEHICLE TYPE',
  },
  {
    id: 'vehicleModel',
    numeric: true,
    disablePadding: false,
    label: 'VEHICLE MODEL',
  },
]

/**
 * @summary Table Header component with additional functionality
 */
class EnhancedTableHead extends React.Component {
  createSortHandler = (property) => (event) => {
    this.props.onRequestSort(event, property)
  }

  render() {
    const { onSelectAllClick, numSelected, rowCount } = this.props

    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={numSelected === rowCount}
              onChange={onSelectAllClick}
            />
          </TableCell>
          {rows.map(
            (row) => (
              <TableCell
                key={row.id}
                align={row.numeric ? 'right' : 'inherit'}
                padding={row.disablePadding ? 'none' : 'default'}
              />
            ),
            this
          )}
        </TableRow>
      </TableHead>
    )
  }
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  rowCount: PropTypes.number.isRequired,
}

const toolbarStyles = (theme) => ({
  root: {
    paddingRight: theme.spacing(1),
  },
  highlight: {
    color: theme.palette.secondary.main,
    backgroundColor: lighten(theme.palette.secondary.light, 0.85),
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
 * @summary The table toolbar component
 */
const EnhancedTableToolbar = (props) => {
  const { numSelected, classes, onReset } = props

  return (
    <Toolbar
      className={classNames(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      <div className={classes.title}>
        {numSelected > 0 ? (
          <Typography color="inherit" variant="subtitle1">
            {numSelected} Vehicles in group
          </Typography>
        ) : (
          <Typography variant="h6" id="tableTitle">
            No Vehicles in group
          </Typography>
        )}
      </div>

      <div className={classes.spacer} />

      <div className={classes.actions}>
        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton aria-label="Delete" onClick={onReset}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : null}
      </div>
    </Toolbar>
  )
}

EnhancedTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
}

const WrappedEnhancedTableToolbar = withStyles(toolbarStyles)(
  EnhancedTableToolbar
)

const styles = (theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(0.05),
  },
  table: {
    minWidth: '100%',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  searchSpace: {
    padding: theme.spacing(2),
  },
})

/**
 * @summary AssignVehicle component assigns vehicles to a group
 */
class AssignVehicle extends React.Component {
  /**
   * @property {object[]} selected The array of selected row objects
   * @property {number} page The current page number of the table of vehicles
   * @property {number} rowsPerPage The number of rows per page
   * @property {object[]} vehicleData The array of objects of vehicle data
   * @property {boolean} open Whether the modal is open
   * @property {string} searchValue The value of the search input
   */
  state = {
    selected: [],
    page: 0,
    rowsPerPage: 5,
    vehicleData: [],
    open: false,
    searchValue: '',
    isLoading: true,
  }

  /**
   * @function
   * @summary Fetches all vehicles for the client
   */
  getAllVehicles = async () => {
    const { data } = await this.props.client.query({
      query: GET_ALL_VEHICLES,
      variables: {
        clientLoginId: getLoginId(),
      },
      fetchPolicy: 'network-only',
    })

    if (data) {
      this.setState({
        vehicleData: data.getAllVehicleDetails,
        isLoading: false,
      })
    } else {
      this.setState({ vehicleData: [] })
    }
  }

  /**
   * @function
   * @summary Fetches list of all vehicles assigned to a group
   */
  getAllVehicleGroupAssignDetails = async () => {
    const { data } = await this.props.client.query({
      query: ALL_VEHICLE_GROUP_ASSIGN_DETAILS,
      variables: {
        groupId: this.props.groupId,
      },
      fetchPolicy: 'network-only',
    })
    if (data.allVehicleGroupAssignDetails) {
      this.setState((state) => ({
        selected: data.allVehicleGroupAssignDetails.map(
          (n) => n.vehicle.entityId
        ),
      }))
    }
  }

  /**
   * @summary React lifecycle method called after component mounts
   */
  componentDidMount() {
    this.getAllVehicles()
    this.getAllVehicleGroupAssignDetails()
  }

  /**
   * @callback
   * @summary Selects/deselects all items in the table
   */
  handleSelectAllClick = (event) => {
    if (event.target.checked) {
      this.setState((state) => ({
        selected: this.state.vehicleData.map((n) => n.entityId),
      }))
    } else {
      this.setState({ selected: [] })
    }
  }

  /**
   * @summary Generic change event handler
   */
  handleChange = (name) => (event) => {
    this.setState({ [name]: event.target.checked })
  }

  /**
   * @callback
   * @summary Selects/deselects the clicked row
   */
  handleClick = (event, id) => {
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
    this.setState({ selected: newSelected })
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
   * @summary Changes the number of rows per page
   */
  handleChangeRowsPerPage = (event) => {
    this.setState({ rowsPerPage: event.target.value })
  }

  /**
   * @function
   * @param {number} id The ID of the row to check if it is selected
   * @summary Checks whether a row item is selected or not
   */
  isSelected = (id) => this.state.selected.indexOf(id) !== -1

  /**
   * @function
   * @summary Assigns vehicles to a group
   */
  handleSave = async (assignVehiclesToGroup) => {
    // TODO: Check the result of mutation and take action accordingly
    await assignVehiclesToGroup()

    this.handleClickOpen()
  }

  /**
   * @function
   * @param {number[]} The array of selected vehicle IDs
   * @summary Converts an array of numbers to an array of objects with vehicle IDs
   */
  mapToArr = (vehicleIds) => {
    const fullData = []
    vehicleIds.forEach((element) => {
      fullData.push({ vehicleId: element })
    })

    return fullData
  }

  /**
   * @callback
   * @summary Changes the search text
   */
  handleSearchChange = (e) => this.setState({ searchValue: e.target.value })

  /**
   * @callback
   * @summary Opens the modal
   */
  handleClickOpen = () => this.setState({ open: true })

  /**
   * @callback
   * @summary Closes the modal
   */
  handleClose = () => {
    this.setState({ open: false })
    this.props.closeModal()
  }

  /**
   * @callback
   * @summary Opens the modal for bulk vehicle assignment
   */
  handleClickUploadOpen = () => {
    this.setState({ uploadOpen: true })
  }

  /**
   * @callback
   * @summary Opens the modal for deleting group
   */
  handleClickDeleteOpen = () => {
    this.setState({ deleteOpen: true })
  }

  /**
   * @callback
   * @summary Closes the bulk upload modal
   */
  handleUploadClose = () => {
    this.setState({ uploadOpen: false })
    this.getAllVehicles()
    this.getAllVehicleGroupAssignDetails()
  }

  /**
   * @callback
   * @summary Closes the delete modal
   */
  handleDeleteClose = () => {
    this.setState({ deleteOpen: false })
  }

  /**
   * @function
   * @param {string[]} array The array to be searched
   * @param {string} title The element to be searched
   * @returns {boolean} Whether the element is present in the array
   * @summary Checks whether an element is present in an array
   */
  findArrayElementByTitle = (array, title) => array.includes(title)

  render() {
    const { classes, closeModal } = this.props
    const { selected, rowsPerPage, page, isLoading } = this.state

    const emptyRows =
      rowsPerPage -
      Math.min(rowsPerPage, this.state.vehicleData.length - page * rowsPerPage)

    return (
      <React.Fragment>
        <WrappedEnhancedTableToolbar
          numSelected={selected.length}
          onReset={() => this.setState({ selected: [] })}
        />
        <div className={classes.tableWrapper}>
          <Mutation
            mutation={ASSIGN_VEHICLES_TO_GROUP}
            variables={{
              vehicleList:
                this.state.selected.length > 0
                  ? this.mapToArr(this.state.selected)
                  : [],
              groupId: this.props.groupId,
            }}
            refetchQueries={[
              {
                query: GET_ALL_GROUPS,
                variables: {
                  clientLoginId: getLoginId(),
                },
              },
              {
                query: ALL_VEHICLE_GROUP_ASSIGN_DETAILS,
                variables: {
                  groupId: this.props.groupId,
                },
              },
            ]}
          >
            {(assignVehiclesToGroup) => (
              <Fragment>
                <Grid container spacing={2} className={classes.searchSpace}>
                  <Grid item xs={12}>
                    <Grid
                      container
                      direction="row"
                      justify="space-between"
                      alignItems="flex-start"
                    >
                      <Grid item>
                        <Input
                          value={this.state.searchValue}
                          onChange={this.handleSearchChange}
                          placeholder="Search Vehicles"
                        />
                      </Grid>

                      <Grid item>
                        <Typography variant="Subheading" gutterBottom>
                          Group Name: {this.props.groupsName}
                        </Typography>
                      </Grid>

                      <Grid item>
                        <Tooltip title="Bulk Group Assign to Vehicle">
                          <IconButton
                            aria-label="Upload"
                            onClick={this.handleClickUploadOpen}
                          >
                            <CloudUpload />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Group">
                          <IconButton
                            aria-label="Delete"
                            onClick={this.handleClickDeleteOpen}
                          >
                            <DeleteForever />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                {isLoading ? (
                  <Loader />
                ) : (
                  <Table className={classes.table} aria-labelledby="tableTitle">
                    <EnhancedTableHead
                      numSelected={selected.length}
                      onSelectAllClick={this.handleSelectAllClick}
                      rowCount={this.state.vehicleData.length}
                    />
                    <TableBody>
                      {this.state.vehicleData
                        .filter((vehicle) =>
                          vehicle.vehicleNumber.includes(this.state.searchValue)
                        )
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((n) => {
                          let isSelected = this.isSelected(n.entityId)

                          isSelected = this.findArrayElementByTitle(
                            selected,
                            n.entityId
                          )

                          return (
                            <TableRow
                              hover
                              onClick={(event) =>
                                this.handleClick(event, n.entityId)
                              }
                              role="checkbox"
                              aria-checked={isSelected}
                              tabIndex={-1}
                              key={n.entityId}
                              selected={isSelected}
                            >
                              <TableCell padding="checkbox">
                                <Checkbox
                                  color="primary"
                                  checked={isSelected}
                                />
                              </TableCell>
                              <TableCell
                                component="th"
                                scope="row"
                                padding="none"
                              >
                                {n.vehicleNumber}
                              </TableCell>
                              <TableCell align="right">
                                {n.vehicleType}
                              </TableCell>
                              <TableCell align="right">
                                {n.vehicleModel}
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
                )}

                <TablePagination
                  component="div"
                  count={this.state.vehicleData.length}
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
                <Grid container spacing={2} className={classes.searchSpace}>
                  <Grid item xs={12}>
                    <Grid
                      container
                      direction="row"
                      justify="center"
                      alignItems="center"
                      spacing={2}
                    >
                      <Grid item>
                        <ColorButton
                          color="primary"
                          variant="contained"
                          onClick={() => this.handleSave(assignVehiclesToGroup)}
                        >
                          Save
                        </ColorButton>
                      </Grid>

                      <Grid item>
                        <ColorButton
                          color="default"
                          variant="contained"
                          onClick={closeModal}
                        >
                          Cancel
                        </ColorButton>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Fragment>
            )}
          </Mutation>

          <Grid>
            <Dialog
              open={this.state.open}
              keepMounted
              onClose={this.handleClose}
              aria-labelledby="alert-dialog-slide-title"
              aria-describedby="alert-dialog-slide-description"
            >
              <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                  Vehicle assignments saved succesffully!
                </DialogContentText>
              </DialogContent>

              <DialogActions>
                <Button onClick={this.handleClose} color="primary">
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>

          <Grid>
            <Dialog
              open={this.state.uploadOpen}
              keepMounted
              onClose={this.handleUploadClose}
              aria-labelledby="alert-dialog-slide-title"
              aria-describedby="alert-dialog-slide-description"
            >
              <BulkVehicleAssign
                groupId={this.props.groupId}
                handleClose={this.handleUploadClose}
              />
            </Dialog>

            <Dialog
              open={this.state.deleteOpen}
              keepMounted
              onClose={this.handleDeleteClose}
              aria-labelledby="alert-dialog-slide-title"
              aria-describedby="alert-dialog-slide-description"
            >
              <DeleteGroup
                groupId={this.props.groupId}
                handleClose={this.handleDeleteClose}
                closeModal={this.handleClose}
              />
            </Dialog>
          </Grid>
        </div>
      </React.Fragment>
    )
  }
}

AssignVehicle.propTypes = {
  classes: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired,
}

export default withStyles(styles)(withApollo(AssignVehicle))
