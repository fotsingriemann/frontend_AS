/**
 * @module Vehicles/VehiclesGroupDetails
 * @summary This module exports the component for Assigning vehicles to groups
 */

import React, { Fragment } from 'react'
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
  Typography,
  Grid,
  Input,
} from '@material-ui/core'
import { lighten } from '@material-ui/core/styles/colorManipulator'
import getLoginId from '@zeliot/common/utils/getLoginId'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
import Loader from 'packages/common/ui/Loader'

const GET_ALL_VEHICLES = gql`
  query getAllVehicleDetails($accountType: String, $clientLoginId: Int) {
    getAllVehicleDetails(
      accountType: $accountType
      clientLoginId: $clientLoginId
      status: [1, 3]
    ) {
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
class VehiclesGroupDetails extends React.Component {
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
    isSearchValueChanged: null,
    noOfenteries: null,
    isLoading: true,
  }

  /**
   * @function
   * @summary Fetches all vehicles for the client
   */
  getAllVehicles = async () => {
    const accountType = await localStorage.getItem('accountType')
    const { data } = await this.props.client.query({
      query: GET_ALL_VEHICLES,
      variables: {
        accountType: accountType,
        clientLoginId: getLoginId(),
      },
      fetchPolicy: 'network-only',
    })

    if (data) {
      this.setState({
        vehicleData: data.getAllVehicleDetails.filter((vehicle) => {
          if (this.state.selected.includes(vehicle.entityId)) {
            return vehicle
          }
        }),
        isLoading: false,
      })
    } else {
      this.setState({ vehicleData: [], isLoading: false })
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
      this.setState(
        (state) => ({
          selected: data.allVehicleGroupAssignDetails.map(
            (n) => n.vehicle.entityId
          ),
        }),
        () => {
          this.getAllVehicles()
        }
      )
    }
  }

  /**
   * @summary React lifecycle method called after component mounts
   */
  componentDidMount() {
    this.getAllVehicleGroupAssignDetails()
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
  handleSearchChange = (e) => {
    this.setState(
      { searchValue: e.target.value, page: 0, isSearchValueChanged: true },
      () => this.numberOfCurrentPages(this.state.searchValue)
    )
  }

  numberOfCurrentPages = (searchValue) => {
    const fetchedNumberOfenteries = this.state.vehicleData.filter((vehicle) =>
      vehicle.vehicleNumber.includes(searchValue)
    )
    this.setState({
      noOfenteries: fetchedNumberOfenteries.length,
    })
  }
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
                            <TableRow hover tabIndex={-1} key={n.entityId}>
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
                  count={
                    this.state.isSearchValueChanged
                      ? this.state.noOfenteries
                      : this.state.vehicleData.length
                  }
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
                          color="default"
                          variant="contained"
                          style={{ color: 'white' }}
                          onClick={closeModal}
                        >
                          Close
                        </ColorButton>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Fragment>
            )}
          </Mutation>
        </div>
      </React.Fragment>
    )
  }
}

VehiclesGroupDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired,
}

export default withStyles(styles)(withApollo(VehiclesGroupDetails))
