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
const style = (theme) => ({
  root: {
    padding: theme.spacing(3),
    height: '100%',
    width: '1000px',
  },
})

class CurrentSummary extends Component {
  state = {
    vehicles: null,
    vehiclesArray: [],
    loading: false,
    columns:
      languageJson[this.props.selectedLanguage].mainDashboardPage.currentSummary
        .currentSummaryTableColumn,
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
      next: ({ data, loading }) => {
        if (loading) {
          this.setState({ loading: true })
        } else {
          this.setState({ vehicles: data.devices }, () => {
            this.mapToArr()
          })
        }
      },
    })
  }

  mapToArr = () => {
    let rowData = []
    const fullData = []
    let temp = ''
    let temp2 = ''

    if (this.state.vehicles.length > 0) {
      this.state.vehicles.forEach((element) => {
        rowData = []
        rowData.push(element.vehicleNumber)
        rowData.push(element.distance)

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

        rowData.push(element.speed)
        rowData.push(element.maxSpeed)
        rowData.push(element.avgSpeed)
        rowData.push(element.startAddress)
        rowData.push(element.endAddress)
        rowData.push(element.driverName)
        rowData.push(element.vehicleGroupAssign)
        rowData.push(element.trackingStatus)
        rowData.push(element.batteryStatus)
        rowData.push(element.uniqueid)
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

  componentDidUpdate = (prevProps) => {
    if (prevProps.selectedLanguage !== this.props.selectedLanguage) {
      this.setState({
        columns:
          languageJson[this.props.selectedLanguage].mainDashboardPage
            .currentSummary.currentSummaryTableColumn,
      })
    }
  }

  render() {
    const { classes, selectedLanguage } = this.props

    return (
      <div className={classes.root}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {this.state.loading ? (
              <CircularProgress />
            ) : (
              <MUIDataTable
                title={
                  languageJson[selectedLanguage].mainDashboardPage
                    .currentSummary.currentSummaryTitle
                }
                data={this.state.vehiclesArray}
                columns={this.state.columns}
                options={this.options}
              />
            )}
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(style)(withApollo(withLanguage(CurrentSummary)))
