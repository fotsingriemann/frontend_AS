import React, { Component } from 'react'
import gql from 'graphql-tag'
import MUIDataTable from 'mui-datatables'
import { withApollo } from 'react-apollo'
import { withStyles, Grid, CircularProgress } from '@material-ui/core'
import getLoginId from '@zeliot/common/utils/getLoginId'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

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

const style = (theme) => ({
  root: {
    padding: theme.spacing(1),
    height: '100%',
    width: '1000px',
  },
})

class CurrentTrackinfo extends Component {
  state = {
    vehicles: null,
    vehiclesArray: [],
    columns:
      languageJson[this.props.selectedLanguage].mainDashboardPage
        .currentTrackingInfo.currentTrackingInfoTableColumn,
  }

  options = {
    selectableRows: 'none',
    responsive: 'stacked',
    rowsPerPage: 10,
    filter: false,
    print: false,
    rowHover: false,
  }

  setupPolling = () => {
    this.allDevicesQuery = this.props.client.watchQuery({
      query: GET_ALL_DEVICES,
      variables: {
        clientId: getLoginId(),
      },
      pollInterval: 30000,
    })
  }

  startPolling = () => {
    this.allDevicesQuery.subscribe({
      next: ({ data }) => {
        this.setState({ vehicles: data.devices }, () => {
          this.mapToArr()
        })
      },
    })
  }

  mapToArr = () => {
    let rowData = []
    const fullData = []
    let temp = ''

    this.state.vehicles.forEach((element) => {
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

  componentDidUpdate = (prevProps) => {
    if (prevProps.selectedLanguage !== this.props.selectedLanguage) {
      this.setState({
        columns:
          languageJson[this.props.selectedLanguage].mainDashboardPage
            .currentTrackingInfo.currentTrackingInfoTableColumn,
      })
    }
  }

  render() {
    const { classes, selectedLanguage } = this.props

    return (
      <div className={classes.root}>
        <Grid
          container
          style={{
            height: '100%',
          }}
          alignContent="flex-start"
        >
          <Grid item xs={12}>
            {this.state.vehiclesArray.length > 0 ? (
              <MUIDataTable
                title={
                  languageJson[selectedLanguage].mainDashboardPage
                    .currentTrackingInfo.currentTrackingInfoTitle
                }
                data={this.state.vehiclesArray}
                columns={this.state.columns}
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

export default withStyles(style)(withApollo(withLanguage(CurrentTrackinfo)))
