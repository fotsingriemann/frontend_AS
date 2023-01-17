import React, { Component, Fragment } from 'react'
import { DateTimePicker, DatePicker } from '@material-ui/pickers'

import moment from 'moment'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import getLoginId from '@zeliot/common/utils/getLoginId'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import MUIDataTable from 'mui-datatables'

import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import {
  withStyles,
  Grid,
  Typography,
  Divider,
  Button,
  CircularProgress,
} from '@material-ui/core'
import {
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
} from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

const GET_VEHICLE_STATUS = gql`
  query($clientLoginId: Int!, $fromTimestamp: String!, $toTimestamp: String!) {
    getVehicleStatus(
      clientLoginId: $clientLoginId
      fromTimestamp: $fromTimestamp
      toTimestamp: $toTimestamp
    ) {
      clientLoginId
      timestamp
      offlineDeviceCount
      noDataDeviceCount
      deadDeviceCount
    }
  }
`

const GET_LAST_LOGIN = gql`
  query($clientLoginId: Int!) {
    getAllParentsLoginTime(clientLoginId: $clientLoginId) {
      username
      lastLoginTime
      student {
        studentName
        email
        rfid
        contactNumber
        gender
        parentLoginId
        clientLoginId
        schoolId
        studentId
      }
    }
  }
`

const style = (theme) => ({
  root: {
    padding: theme.spacing(3),
  },
})

class Insights extends Component {
  state = {
    startDate: '',
    start: null,
    end: null,
    endDate: '',
    loginId: getLoginId(),
    vehicleStatus: [],
    loginDetails: [],
    isLoading: true,
    vehicles: null,
    vehiclesArray: [],
    vehiclesArray1: [],
    vehicles1: null,
    progress: false,
  }

  options = {
    selectableRows: 'none',
    responsive: 'stacked',
    rowsPerPage: 10,
    filter: false,
    print: false,
    rowHover: false,
    downloadOptions: {
      filename: 'Last_Login_Report.csv',
    },
  }

  trackingOptions = {
    selectableRows: 'none',
    responsive: 'stacked',
    rowsPerPage: 10,
    filter: false,
    print: false,
    rowHover: false,
    downloadOptions: {
      filename: 'Non-Tracking_Status.csv',
    },
  }

  columns = [
    'Student Name',
    'Last Login Time',
    'Contact Number',
    'Student Email',
    'RFID Number',
    'Gender',
  ]

  trackingColumns = ['DATE', 'OFFLINE', 'NODATA', 'DEAD']

  mapToArr = () => {
    var rowData = []
    var fullData = []

    this.state.loginDetails.forEach((element) => {
      rowData = []
      if (element.student.studentName) {
        rowData.push(element.student.studentName)
      } else {
        rowData.push('N/A')
      }
      if (element.lastLoginTime) {
        var duration = moment.duration({ hours: 5, minutes: 30 })
        rowData.push(
          element.lastLoginTime &&
            moment.unix(element.lastLoginTime).utc().add(duration).format('lll')
        )
      } else {
        rowData.push('N/A')
      }

      if (element.student.contactNumber) {
        rowData.push(element.student.contactNumber)
      } else {
        rowData.push('N/A')
      }

      if (element.student.email) {
        rowData.push(element.student.email)
      } else {
        rowData.push('N/A')
      }
      if (element.student.rfid) {
        rowData.push(element.student.rfid)
      } else {
        rowData.push('N/A')
      }

      if (element.student.gender) {
        rowData.push(element.student.gender)
      } else {
        rowData.push('N/A')
      }

      fullData.push(rowData)
    })

    this.setState({ vehiclesArray: fullData })
  }

  mapToArr1 = () => {
    var rowData1 = []
    var fullData1 = []

    this.state.vehicleStatus.forEach((element1) => {
      rowData1 = []
      if (element1.timestamp) {
        var duration = moment.duration({ hours: 5, minutes: 30 })
        rowData1.push(
          moment.unix(element1.timestamp).utc().add(duration).format('ll')
        )
      } else {
        rowData1.push('N/A')
      }

      if (element1.offlineDeviceCount || element1.offlineDeviceCount == 0) {
        rowData1.push(element1.offlineDeviceCount)
      } else {
        rowData1.push('N/A')
      }

      if (element1.noDataDeviceCount || element1.noDataDeviceCount == 0) {
        rowData1.push(element1.noDataDeviceCount)
      } else {
        rowData1.push('N/A')
      }
      if (element1.deadDeviceCount || element1.deadDeviceCount == 0) {
        rowData1.push(element1.deadDeviceCount)
      } else {
        rowData1.push('N/A')
      }

      fullData1.push(rowData1)
    })

    this.setState({ vehiclesArray1: fullData1 })
  }

  componentDidMount() {
    // this.getStatus()
    {
      this.setState({ progress: false })
    }
    this.getLastLogin()
  }

  getStatus = async () => {
    if (this.state.startDate === '' || this.state.endDate === '') {
      // alert('Please select proper dates.')
      this.props.openSnackbar('Please select proper dates')
    }
    const response = await this.props.client.query({
      query: GET_VEHICLE_STATUS,
      variables: {
        clientLoginId: this.state.loginId,
        fromTimestamp: this.state.startDate,
        toTimestamp: this.state.endDate,
      },

      errorPolicy: 'all',
    })

    if (response.data && response.data.getVehicleStatus) {
      const vStatus = response.data.getVehicleStatus
      this.setState({ vehicleStatus: vStatus, vehiclesArray1: [] })
      this.mapToArr1()
    }

    if (this.state.vehicleStatus.length == 0) {
      // alert('No data available for these dates')
      this.props.openSnackbar('No data available for these dates')
      this.setState({ start: null, end: null, vehiclesArray1: [] })
      //this.setState({ vehicleStatus: vStatus, vehiclesArray1: [] })
    }
  }

  getLastLogin = async () => {
    const response = await this.props.client.query({
      query: GET_LAST_LOGIN,
      variables: {
        clientLoginId: this.state.loginId,
      },

      errorPolicy: 'all',
    })

    if (response.data) {
      // console.log(response.data)
      this.setState({ progress: true })
      const lStatus = response.data.getAllParentsLoginTime

      this.setState({ loginDetails: lStatus, isLoading: false }, () => {
        this.mapToArr()
      })
    }
  }

  handleFromDateChange = (moment) => {
    this.setState(
      { start: moment, startDate: moment.unix().toString() },
      () => {}
    )
  }
  checkDate() {
    if (this.state.endDate < this.state.startDate) {
      // alert('Start date cannot be greater than end date')
      this.props.openSnackbar('Start date cannot be greater than end date')
      this.setState({ start: null, end: null, vehiclesArray1: [] })
    }
  }

  handleToDateChange = (moment) => {
    this.setState({ end: moment, endDate: moment.unix().toString() }, () => {
      this.checkDate()
    })
  }
  render() {
    const { google, classes } = this.props

    let vehicleReport

    if (this.state.vehicleStatus.length === 0) {
    } else {
      vehicleReport = (
        <Grid
          container
          // spacing={2}
          style={{
            height: '100%',
          }}
          alignContent="flex-center"
        >
          <Grid item md={12}>
            {this.state.vehiclesArray1.length > 0 ? (
              <MUIDataTable
                data={this.state.vehiclesArray1}
                columns={this.trackingColumns}
                options={this.trackingOptions}
              />
            ) : null}
          </Grid>
        </Grid>
      )
    }

    return (
      <div className={classes.root}>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Typography variant="h4" className={classes.textLeft} gutterBottom>
              Insights
            </Typography>
          </Grid>

          <Divider />
          <br />
        </Grid>

        <ExpansionPanel>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography variant="h6" className={classes.heading}>
              Last Login Report
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            {this.state.progress ? (
              <Grid
                container
                spacing={2}
                style={{
                  height: '100%',
                  marginTop: '5px',
                  marginBottom: '15px',
                }}
              >
                <Grid item md={12}>
                  <></>
                  {this.state.vehiclesArray.length > 0 ? (
                    <MUIDataTable
                      data={this.state.vehiclesArray}
                      columns={this.columns}
                      options={this.options}
                    />
                  ) : null}
                </Grid>
              </Grid>
            ) : (
              <CircularProgress />
            )}
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <br />
        <ExpansionPanel>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography variant="h6" className={classes.heading}>
              Non Tracking Status
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <DatePicker
                  lable="From"
                  placeholder="Select From Date"
                  onChange={this.handleFromDateChange}
                  value={this.state.start}
                  selected={this.state.start}
                  disableFuture
                />
              </Grid>
              <Grid item md={3}>
                <DatePicker
                  lable="To"
                  value={this.state.end}
                  onChange={this.handleToDateChange}
                  selected={this.state.end}
                  placeholder="Select To Date"
                  disableFuture
                />
              </Grid>

              <Grid item md={3}>
                <ColorButton
                  variant="contained"
                  color="primary"
                  onClick={this.getStatus}
                  //onclick={this.handleSubmit}
                >
                  Generate Report
                </ColorButton>
              </Grid>
              {vehicleReport}
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    )
  }
}

export default withSharedSnackbar(withStyles(style)(withApollo(Insights)))
