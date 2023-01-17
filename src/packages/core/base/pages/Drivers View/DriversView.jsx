import React, { Component } from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import MUIDataTable from 'mui-datatables'
import { withApollo } from 'react-apollo'
import { withStyles, Grid, Typography } from '@material-ui/core'
import getLoginId from '@zeliot/common/utils/getLoginId'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
import FullScreenLoader from 'packages/common/ui/Loader/FullScreenLoader'

const GET_ALL_DRIVERS = gql`
  query allDrivers(
    $accountType: String
    $userLoginId: Int
    $clientLoginId: Int
  ) {
    allDrivers(
      accountType: $accountType
      userLoginId: $userLoginId
      clientLoginId: $clientLoginId
    ) {
      id
      driverName
      license
      contactNumber
      rfid
      vehicleNumber
      createdAt
      status
      score
      vehicleObject {
        vehicleNumber
      }
    }
  }
`
const styles = (theme) => ({
  root: {
    padding: theme.spacing(2),
  },
})

//sets the driver index for each row
let index = null

class DriversView extends Component {
  state = {
    allFetchedDrivers: [],
    isLoading: true,
  }

  /**
   * @summary The columns of the table of drivers
   */
  columns = [
    'Driver Name',
    'License Number',
    'Contact Number',
    'RFID Number',
    'Current Vehicle Driven',
    'Assigned Vehicles',
    'Driver Score (100)',
    'Status',
  ]

  /**
   * @summary The options for the table of drivers
   */
  options = {
    selectableRows: 'none',
    responsive: 'scrollMaxHeight',
    rowsPerPage: 10,
    onRowClick: (rowData, { dataIndex }) => {
      index = dataIndex
    },
    sort: false,
    print: false,
    download: true,
    filter: false,
    viewColumns: false,
  }

  /**
   * @param {object[]} drivers The array of driver objects
   * @summary Converts array of driver objects to an array of arrays
   */
  mapToArr(drivers) {
    let rowData = []
    const fullData = []
    this.driverId = []
    drivers.forEach((element) => {
      rowData = []
      let vehicles = element.vehicleObject
      let vehicleNumbers

      if (vehicles.length > 0) {
        let vehicleArray = vehicles.flatMap((obj) => obj.vehicleNumber)
        vehicleNumbers = vehicleArray.toString()
      } else {
        vehicleNumbers = 'N/A'
      }

      this.driverId.push(element.id)
      rowData.push(element.driverName)
      rowData.push(element.license)
      rowData.push(element.contactNumber)
      rowData.push(element.rfid ? element.rfid : 'N/A')
      rowData.push(element.vehicleNumber ? element.vehicleNumber : 'N/A')
      rowData.push(vehicleNumbers)
      rowData.push(element.score ? element.score.toFixed(2) : 'N/A')
      // rowData.push(statusButton)
      // rowData.push(editButton)
      if (element.status == 1) {
        rowData.push('ACTIVE')
      } else {
        rowData.push('INACTIVE')
      }
      fullData.push(rowData)
    })

    return fullData
  }

  getAllDrivers = async () => {
    const accountType = await localStorage.getItem('accountType')
    const { loading, errors, data } = await this.props.client.query({
      query: GET_ALL_DRIVERS,
      variables: {
        accountType: accountType,
        clientLoginId: getLoginId(),
      },
      fetchPolicy: 'network-only',
    })

    if (errors) return `Error!: ${errors}`
    if (data) {
      this.setState({
        allFetchedDrivers: this.mapToArr(data.allDrivers),
        isLoading: false,
      })
    }
  }
  async componentDidMount() {
    await this.getAllDrivers()
  }
  render() {
    const { classes } = this.props
    const { allFetchedDrivers, isLoading } = this.state

    return (
      <div>
        {isLoading ? (
          <FullScreenLoader />
        ) : (
          <Grid container className={classes.root}>
            <Grid container justify="space-between">
              <Grid item className={classes.root}>
                <Typography variant="h4">Drivers - View</Typography>
              </Grid>
              <Grid item style={{ paddingTop: '15px' }}>
                <ColorButton
                  style={{ color: 'white' }}
                  onClick={() => this.props.history.goBack()}
                >
                  Back
                </ColorButton>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <MUIDataTable
                data={this.state.allFetchedDrivers}
                columns={this.columns}
                options={this.options}
              />
            </Grid>
          </Grid>
        )}
      </div>
    )
  }
}

DriversView.propTypes = {
  classes: PropTypes.object.isRequired,
}
export default withStyles(styles)(withApollo(DriversView))
