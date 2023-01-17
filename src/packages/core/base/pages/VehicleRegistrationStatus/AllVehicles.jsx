/**
 * @module Vehicles
 * @summary This module exports the component for rendering Vehicles page
 */

import React from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import MUIDataTable from 'mui-datatables'
import { withStyles, Grid, Modal, Paper } from '@material-ui/core'
import getLoginId from '@zeliot/common/utils/getLoginId'
// import Groups from './Groups'
import VehicleEdit from './VehicleEdit'
import Chip from '@material-ui/core/Chip'

const GET_ALL_VEHICLES = gql`
  query getAllVehicleDetails($clientLoginId: Int) {
    getAllVehicleDetails(clientLoginId: $clientLoginId, status: [1, 3]) {
      entityId
      vehicleNumber
      engineNumber
      chassisNumber
      certificatePath
      approveStatus
      deviceDetail {
        serial_num
      }
      simDetail {
        phoneNumber
        simNumber
      }
      vehicleType
      vehicleModel
    }
  }
`

const styles = (theme) => ({
  root: {
    padding: theme.spacing(2),
    flexGrow: 1,
    width: '100%',
  },
  clickableCard: {
    cursor: 'pointer',
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
 * @summary Vehicles component renders the Vehicle management page
 */
class AllVehicles extends React.Component {
  /**
   * @property {boolean} open Boolean flag to check if VehicleEdit modal is open
   * @property {string} entityId The entity ID of the vehicle
   */
  state = {
    open: false,
    entityId: '',
    did: '',
    vs: '',
  }

  /**
   * @summary The column names of the vehicles table
   */
  columns = [
    'Vehicle Number',
    'Serial Number',
    'Phone Number',
    'SIM Number',
    'Engine Number',
    'Chassis Number',
    'Status',
    'Certificate',
  ]

  /**
   * @summary The options for the table component
   */
  options = {
    selectableRows: 'none',
    responsive: 'stacked',
    rowsPerPage: 5,
    sort: false,
    print: false,
    download: true,
    filter: false,
    viewColumns: false,
    // onRowClick: (rowData, dataIndex, rowIndex) => {
    // 	console.log(rowData)
    // 	/*
    // 			Waits for double click to allow text selection through double click,
    // 			if text is selected, click is ignored
    // 	*/
    // 	setTimeout(() => {
    // 		if (!window.getSelection().toString()) {
    // 			this.handleVehicleClick(this.entityId[dataIndex.dataIndex], rowData[1], rowData[6])
    // 		}
    // 	}, 500)
    // }
  }

  /**
   * @param {object[]} devices The array of vehicle objects
   * @summary Convert array of objects to array of arrays
   */
  mapToArr(devices) {
    let rowData = []
    const fullData = []
    this.entityId = []
    this.deviceUniqueId_fk = []

    devices.forEach((element) => {
      rowData = []
      this.entityId.push(element.entityId)
      this.deviceUniqueId_fk.push(element.serial_num)
      rowData.push(element.vehicleNumber)
      rowData.push(element.deviceDetail.serial_num)
      rowData.push(element.simDetail.phoneNumber)
      rowData.push(element.simDetail.simNumber)
      rowData.push(element.engineNumber ? element.engineNumber : 'NA')
      rowData.push(element.chassisNumber ? element.chassisNumber : 'NA')
      rowData.push(
        element.approveStatus ? (
          <a href="#" onClick={() => this.handleVehicleClick(element)}>
            {' '}
            {element.approveStatus === 'REJECT'
              ? 'REJECTED'
              : element.approveStatus}
          </a>
        ) : (
          <a href="#" onClick={() => this.handleVehicleClick(element)}>
            PENDING
          </a>
        )
      )

      rowData.push(
        <>
          {element.certificatePath ? (
            <a href={element.certificatePath} target="_blank">
              View Certificate
            </a>
          ) : (
            'NA'
          )}
        </>
      )

      fullData.push(rowData)
    })

    return fullData
  }

  /**
   * @callback
   * @summary Opens the vehicle edit modal on click
   */
  handleVehicleClick = (element) => {
    this.setState({
      open: true,
      entityId: element.entityId,
      deviceUniqueId_fk: element.deviceDetail.serial_num,
      vehicleStatus: element.approveStatus,
    })
  }

  /**
   * @callback
   * @summary Closes the vehicle edit modal
   */
  handleClose = () => {
    this.setState({ open: false, entityId: '' })
  }

  render() {
    const { classes } = this.props

    return (
      <Query
        query={GET_ALL_VEHICLES}
        variables={{
          clientLoginId: getLoginId(),
        }}
        fetchPolicy="network-only"
      >
        {({ loading, error, data }) => {
          if (loading) return null
          if (error) return `Error!: ${error}`

          const response = this.mapToArr(data.getAllVehicleDetails)

          return (
            <div className={classes.root}>
              <Grid container spacing={2} alignItems="flex-start">
                <Grid item xs={12} md={12}>
                  <MUIDataTable
                    title={'Vehicle Activation Status'}
                    data={response}
                    columns={this.columns}
                    options={this.options}
                  />

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
                          <VehicleEdit
                            entityId={this.state.entityId}
                            deviceUniqueId_fk={this.state.deviceUniqueId_fk}
                            vehicleStatus={this.state.vehicleStatus}
                            closeModal={this.handleClose}
                          />
                        </Paper>
                      </Grid>
                    </Grid>
                  </Modal>
                </Grid>
              </Grid>
            </div>
          )
        }}
      </Query>
    )
  }
}

AllVehicles.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(AllVehicles)
