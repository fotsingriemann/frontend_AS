import React from 'react'
import { withApollo } from 'react-apollo'
import gql from 'graphql-tag'
import TimePeriodSelector from '@zeliot/core/base/pages/OBD/VehicleHealth/Graphs/TimePeriodSelector'
import {
  withStyles,
  Grid,
  Typography,
  CircularProgress
} from '@material-ui/core'
import moment from 'moment'
import getUnixString from '@zeliot/common/utils/time/getUnixString'
import getLoginId from '@zeliot/common/utils/getLoginId'
import ComboBox from '@zeliot/common/ui/ComboBox'

const FETCH_FILES = gql`
  query($id: String!, $from: String!, $to: String!) {
    getFTPfiles(uniqueId: $id, from_ts: $from, to_ts: $to) {
      fileName
      fileLink
      timestampInMs
    }
  }
`

const GET_ALL_VEHICLES = gql`
  query($loginId: Int!) {
    vehicles: getAllVehicleDetails(clientLoginId: $loginId, status: [1, 3]) {
      vehicleNumber
      deviceDetail {
        uniqueDeviceId
      }
    }
  }
`

const styles = () => ({
  itemContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    border: '1px solid lightgray',
    padding: 10,
    margin: 5
  }
})

class DataFileExplorer extends React.Component {
  state = {
    option: 'WEEK',
    fromTs: null,
    toTs: null,
    from: null,
    to: null,
    allFiles: null,
    isQueryActive: false,
    uniqueId: null,
    vehicles: null,
    selectedVehicle: null
  }

  componentDidMount = () => {
    this.fetchAllVehicles()
  }

  fetchAllVehicles = async () => {
    let fetchedVehicles = await this.props.client.query({
      query: GET_ALL_VEHICLES,
      variables: {
        loginId: getLoginId()
      }
    })
    if (fetchedVehicles.data && fetchedVehicles.data.vehicles) {
      this.setState({ vehicles: fetchedVehicles.data.vehicles })
    }
  }

  handleSelectedVehicleChange = selection => {
    if (selection) {
      this.setState({
        selectedVehicle: {
          uniqueId: selection.deviceDetail.uniqueDeviceId,
          vehicleNumber: selection.vehicleNumber
        }
      })
    } else {
      this.setState({
        selectedVehicle: null,
        from: null,
        to: null,
        fromTs: null,
        toTs: null,
        allFiles: null
      })
    }
  }

  fetchFilesData = async () => {
    this.setState({ isQueryActive: true })
    let response = await this.props.client.query({
      query: FETCH_FILES,
      variables: {
        id: this.state.selectedVehicle.uniqueId,
        from: this.state.fromTs,
        to: this.state.toTs
      }
    })
    if (response.data && response.data.getFTPfiles) {
      this.setState({ allFiles: response.data.getFTPfiles })
      console.log('Files', response.data.getFTPfiles)
    }
    this.setState({ isQueryActive: false })
  }

  handleOptionChange = e => {
    this.setState({ option: e.target.value, from: null, to: null })
  }

  handleDateTimeChange = dateType => dateTime =>
    this.setState({
      [dateType]: dateTime
    })

  handleSubmit = () => {
    if (
      this.state.option &&
      this.state.selectedVehicle &&
      this.state.option === 'CUSTOM'
        ? this.state.from && this.state.to
        : true
    ) {
      let fromTs
      let toTs = moment.now()
      switch (this.state.option) {
        case 'HOUR': {
          fromTs = moment().subtract(1, 'hour')
          break
        }
        case 'DAY': {
          fromTs = moment().subtract(1, 'day')
          break
        }
        case 'WEEK': {
          fromTs = moment().subtract(1, 'week')
          break
        }
        case 'MONTH': {
          fromTs = moment().subtract(1, 'month')
          break
        }
        default:
          fromTs = this.state.from
          toTs = this.state.to
      }
      fromTs = fromTs ? getUnixString(moment(fromTs).startOf('day')) : null
      toTs = toTs ? getUnixString(moment(toTs).startOf('day')) : null

      this.setState({ fromTs, toTs }, () => {
        this.fetchFilesData()
      })
    } else {
      this.props.openSnackbar('Please choose all fields')
    }
  }

  render() {
    const {
      option,
      from,
      to,
      allFiles,
      isQueryActive,
      vehicles,
      selectedVehicle
    } = this.state
    const { classes } = this.props
    return (
      <Grid container>
        <Grid item xs={12}>
          <Grid
            container
            className={classes.itemContainer}
            justify="space-between"
          >
            <Grid item xs={12} style={{ padding: 10 }}>
              <Typography variant="button" color="secondary" align="center">
                data file explorer
              </Typography>
            </Grid>

            <Grid item xs={3}>
              <ComboBox
                items={vehicles}
                selectedItem={selectedVehicle}
                onSelectedItemChange={this.handleSelectedVehicleChange}
                placeholder="Choose Vehicle"
                isLoading={false}
                itemKey="vehicleNumber"
                itemToStringKey="vehicleNumber"
              />
            </Grid>

            <Grid item xs={6}>
              <TimePeriodSelector
                option={option}
                from={from}
                to={to}
                onOptionChange={this.handleOptionChange}
                onDateTimeChange={this.handleDateTimeChange}
                onSubmit={this.handleSubmit}
              />
              <br />
            </Grid>
            <Grid item xs={12}>
              {allFiles && allFiles.length === 0 && (
                <Typography color="error">
                  No data available for this duration. Please try different
                  dates
                </Typography>
              )}
            </Grid>
            {isQueryActive && (
              <Grid item>
                <CircularProgress />
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

export default withStyles(styles)(withApollo(DataFileExplorer))
