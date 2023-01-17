import React, { Component } from 'react'
import gql from 'graphql-tag'
import MUIDataTable from 'mui-datatables'
import { withApollo } from 'react-apollo'
import getLoginId from '@zeliot/common/utils/getLoginId'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import { withStyles, Grid, CircularProgress } from '@material-ui/core'

const GET_ALL_DEVICES = gql`
  query getDevices($clientId: Int!) {
    devices: getCurrentSummaryDetails(clientLoginId: $clientId) {
      uniqueid
      startTime
      startLoc
      endTime
      endLoc
      distance
      speed
      maxSpeed
      avgSpeed
      startAddress
      endAddress
      clientName
      driverName
      vehicleNumber
      vehicleGroupAssign
      trackingStatus
      batteryStatus
    }
  }
`
const style = theme => ({
  root: {
    padding: theme.spacing(3),
    height: '100%',
    width: '1000px'
  }
})

class CurrentSummary extends Component {
  state = {
    vehicles: null,
    vehiclesArray: [],
    loading: false
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
    'Unique Id',
    'Start Time',
    'Start Loc',
    'Last Track Time',
    'Last Tracak Loc',
    'Distance',
    'Speed',
    'Max Speed',
    'Avg Speed',
    'Start Address',
    'Last Track Address',
    'Driver Name',
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
      next: ({ data, loading }) => {
        if (loading) {
          this.setState({ loading: true })
        } else {
          this.setState({ vehicles: data.devices }, () => {
            this.mapToArr()
          })
        }
      }
    })
  }

  mapToArr = () => {
    var rowData = []
    var fullData = []
    let temp = ''
    let temp2 = ''
    // console.log('Data in trackinfo', this.state.vehicles)
    if (this.state.vehicles.length > 0) {
      this.state.vehicles.forEach(element => {
        rowData = []
        rowData.push(element.vehicleNumber)
        rowData.push(element.uniqueid)
        if (element.startTime !== null) {
          temp = getFormattedTime(element.startTime, 'LLL')
        } else {
          temp = 'No Data'
        }
        rowData.push(temp)
        if (element.startLoc !== null) {
          rowData.push(element.startLoc)
        } else {
          rowData.push('No Data')
        }
        if (element.endTime !== null) {
          temp2 = getFormattedTime(element.endTime, 'LLL')
        } else {
          temp2 = 'No Data'
        }
        rowData.push(temp2)
        if (element.endLoc !== null) {
          rowData.push(element.endLoc)
        } else {
          rowData.push('No Data')
        }
        rowData.push(element.distance)
        rowData.push(element.speed)
        rowData.push(element.maxSpeed)
        rowData.push(element.avgSpeed)
        rowData.push(element.startAddress)
        rowData.push(element.endAddress)
        rowData.push(element.driverName)
        rowData.push(element.vehicleGroupAssign)
        rowData.push(element.trackingStatus)
        rowData.push(element.batteryStatus)
        // if (element.latitude && element.longitude) {
        //   temp = element.latitude.toFixed(6) + ', ' + element.longitude.toFixed(6)
        // } else {
        //   temp = 'No Data'
        // }

        fullData.push(rowData)
      })

      this.setState({ vehiclesArray: fullData })
    }
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
            {this.state.loading ? (
              <CircularProgress />
            ) : (
              <MUIDataTable
                title="Current Summary"
                data={this.state.vehiclesArray}
                columns={this.columns}
                options={this.options}
              />
            )}
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(style)(withApollo(CurrentSummary))
