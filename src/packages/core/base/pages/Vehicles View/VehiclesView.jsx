/**
 * @module VehiclesView
 * @summary This module exports the component for rendering VehiclesView page
 */

import React from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import { withApollo } from 'react-apollo'
import MUIDataTable from 'mui-datatables'
import { withStyles, Grid, Modal, Paper } from '@material-ui/core'
import getLoginId from '@zeliot/common/utils/getLoginId'
import VehicleGroupsView from './VehicleGroupsView'
import VehicleEdit from '../VehicleRegistrationStatus/VehicleEdit/VehicleEdit'
import FullScreenLoader from 'packages/common/ui/Loader/FullScreenLoader'

import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

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
      vehicleLicense
      cartegrise
      amortization
      insurance
      purchaseDate
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
class VehiclesView extends React.Component {
  /**
   * @property {boolean} open Boolean flag to check if VehicleEdit modal is open
   * @property {string} entityId The entity ID of the vehicle
   */
  state = {
    open: false,
    entityId: '',
    accountType: null,
    fetchedVehicleData: [],
    isLoading: true,
  }

  /**
   * @summary The column names of the vehicles table
   */
  //  columns = ['Vehicle Number', 'Serial Number', 'SIM Number','Vehicle License','Cartegrise','Amortization','Insurance','Purchase Date']

  /**
   * @summary The options for the table component
   */
  options = {
    selectableRows: 'none',
    responsive: 'stacked',
    rowsPerPage: 10,
    sort: false,
    print: false,
    download: true,
    filter: false,
    viewColumns: false,
  }

  /**
   * @param {object[]} devices The array of vehicle objects
   * @summary Convert array of objects to array of arrays
   */
  mapToArr(devices) {
    let rowData = []
    const fullData = []
    this.entityId = []

    let cartegrise
    let amortization
    let insurance
    let purchaseDate
    let vehicleLicense

    devices.forEach((element) => {
      rowData = []

      {
        element.vehicleLicense
          ? (vehicleLicense = element.vehicleLicense)
          : (vehicleLicense = 'N/A')
      }
      {
        element.cartegrise
          ? (cartegrise = element.cartegrise)
          : (cartegrise = 'N/A')
      }
      {
        element.amortization
          ? (amortization = element.amortization)
          : (amortization = 'N/A')
      }
      {
        element.insurance
          ? (insurance = element.insurance)
          : (insurance = 'N/A')
      }
      {
        element.purchaseDate
          ? (purchaseDate = element.purchaseDate)
          : (purchaseDate = 'N/A')
      }
      this.entityId.push(element.entityId)
      rowData.push(element.vehicleNumber)
      rowData.push(element.deviceDetail.serial_num)
      rowData.push(element.simDetail.phoneNumber)
      rowData.push(vehicleLicense)
      rowData.push(cartegrise)
      rowData.push(amortization)
      rowData.push(insurance)
      rowData.push(purchaseDate)
      fullData.push(rowData)
    })

    return fullData
  }

  /**
   * @callback
   * @summary Navigates to groups page on click
   */
  handleClick = (e) => {
    this.props.history.push({
      pathname: '/home/manage-vehicles/groups',
    })
  }

  /**
   * @callback
   * @summary Opens the vehicle edit modal on click
   */
  handleVehicleClick = (entityId) => {
    this.setState({ open: true, entityId: entityId })
  }

  /**
   * @callback
   * @summary Closes the vehicle edit modal
   */
  handleClose = () => {
    this.setState({ open: false, entityId: '' })
  }

  getAccountType = async () => {
    let fetchAccountType = await localStorage.getItem('accountType')
    this.setState({ accountType: fetchAccountType })
  }

  getAllVehicles = async () => {
    const { loading, errors, data } = await this.props.client.query({
      query: GET_ALL_VEHICLES,
      variables: {
        accountType: this.state.accountType,
        clientLoginId: getLoginId(),
      },
      fetchPolicy: 'network-only',
    })
    if (errors) return `Error!: ${errors}`

    if (data) {
      this.setState({
        fetchedVehicleData: this.mapToArr(data.getAllVehicleDetails),
        isLoading: false,
      })
    }
  }
  async componentDidMount() {
    await this.getAccountType()
    await this.getAllVehicles()
  }
  render() {
    const { classes, selectedLanguage } = this.props
    const { fetchedVehicleData, isLoading } = this.state
    return isLoading ? (
      <FullScreenLoader />
    ) : (
      <div className={classes.root}>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} md={7}>
            <MUIDataTable
              title={'Vehicles - View'}
              data={fetchedVehicleData}
              columns={
                languageJson[this.props.selectedLanguage].vehiclesPage
                  .vehiclesTable.vehiclesTableColumn
              }
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
                      closeModal={this.handleClose}
                    />
                  </Paper>
                </Grid>
              </Grid>
            </Modal>
          </Grid>

          <Grid item xs={12} md={5}>
            <VehicleGroupsView />
          </Grid>
        </Grid>
      </div>
    )
  }
}

VehiclesView.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withLanguage(withStyles(styles)(withApollo(VehiclesView)))
