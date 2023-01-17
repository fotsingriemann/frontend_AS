import React, { Component } from 'react'
import gql from 'graphql-tag'
import MUIDataTable from 'mui-datatables'
import { withApollo } from 'react-apollo'
import getLoginId from '@zeliot/common/utils/getLoginId'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import { withStyles, Grid, CircularProgress } from '@material-ui/core'

const GET_ALL_DEVICES = gql`
  query getDevices($clientId: Int!) {
    devices: getCurrentTrackinfo(clientLoginId: $clientId) {
      vehicleNumber
      deviceSlNumber
      phoneNumber
      imeiNumber
      simNumber
      deviceVersion
      vehicleModel
      clientName
      gpsSpeed
      coordinates
      address
      vehicleGroup
      timestamp
      trackingStatus
      batteryStatus
    }
  }
`

const style = theme => ({
  root: {
    padding: theme.spacing(1),
    height: '100%',
    width: '1000px'
  }
})

class CurrentTrackinfo extends Component {
  state = {
    vehicles: null,
    vehiclesArray: []
  }

  options = {
    selectableRows: 'none',
    responsive: 'stacked',
    rowsPerPage: 10,
    filter: false,
    print: false,
    rowHover: false
  }

  columns = [
    'Vehicle No',
    'Date & Time',
    'Device SlNumber',
    'Phone Number',
    'IMEI Number',
    'Sim Number',
    'Vehicle Model',
    'Current Speed',
    'Coordinates',
    'Location',
    'Group(s)',
    'Tracking Status',
    'Battery Status'
  ]

  setupPolling = () => {
    this.allDevicesQuery = this.props.client.watchQuery({
      query: GET_ALL_DEVICES,
      variables: {
        clientId: getLoginId()
      },
      pollInterval: 30000
    })
  }

  startPolling = () => {
    this.allDevicesQuery.subscribe({
      next: ({ data }) => {
        this.setState({ vehicles: data.devices }, () => {
          this.mapToArr()
        })
      }
    })
  }

  mapToArr = () => {
    var rowData = []
    var fullData = []
    let temp = ''

    this.state.vehicles.forEach(element => {
      rowData = []
      rowData.push(element.vehicleNumber)
      if (element.timestamp !== null) {
        temp = getFormattedTime(element.timestamp, 'LLL')
      } else {
        temp = 'No Data'
      }
      rowData.push(temp)
      rowData.push(element.deviceSlNumber)
      rowData.push(element.phoneNumber)
      rowData.push(element.imeiNumber)
      rowData.push(element.simNumber)
      rowData.push(element.vehicleModel)
      rowData.push(element.gpsSpeed)
      rowData.push(element.coordinates)
      rowData.push(element.address)
      rowData.push(element.vehicleGroup)
      rowData.push(element.trackingStatus)
      rowData.push(element.batteryStatus)

      fullData.push(rowData)
    })

    this.setState({ vehiclesArray: fullData })
  }

  stopPolling = () => this.allDevicesQuery.stopPolling()

  componentDidMount = () => {
    this.setupPolling()
    this.startPolling()
  }

  componentWillUnmount = () => {
    this.stopPolling()
  }

  render() {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <Grid
          container
          spacing={2}
          style={{
            height: '100%'
          }}
          alignContent="flex-start"
        >
          <Grid item xs={12}>
            {this.state.vehiclesArray.length > 0 ? (
              <MUIDataTable
                title="Current Trackinfo"
                data={this.state.vehiclesArray}
                columns={this.columns}
                options={this.options}
              />
            ) : (
              <CircularProgress />
            )}
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(style)(withApollo(CurrentTrackinfo))
