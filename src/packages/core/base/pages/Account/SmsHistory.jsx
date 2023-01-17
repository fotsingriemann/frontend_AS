/**
 * @module Account/SmsHistory
 * @summary This module exports the SMS History page
 */
import React, { Component } from 'react'
import gql from 'graphql-tag'
import moment from 'moment'
import { withApollo } from 'react-apollo'
import { DateTimePicker } from '@material-ui/pickers'
import MUIDataTable from 'mui-datatables'
import withSharedSnackBar from '@zeliot/common/hoc/withSharedSnackbar'
import getLoginId from '@zeliot/common/utils/getLoginId'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import DateRangeIcon from '@material-ui/icons/DateRange'
import TimeRangeIcon from '@material-ui/icons/AccessTime'
import BackIcon from '@material-ui/icons/KeyboardBackspace'
import { MuiThemeProvider } from '@material-ui/core/styles'
import {
  Grid,
  Typography,
  withStyles,
  Button,
  CircularProgress,
  Divider,
} from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

moment.suppressDeprecationWarnings = true

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    height: '100%',
    padding: theme.spacing(2),
  },
  reportPageTitle: {
    paddingBottom: theme.spacing(3),
  },
  reportSelectorItem: {
    padding: `0 ${theme.spacing(2)} 0 0px`,
  },
  formControl: {
    width: theme.spacing(20),
  },
  comboBoxTopMargin: {
    marginTop: theme.spacing(2),
  },
  customItemCard: {
    overflow: 'visible',
  },
  topPadding: {
    paddingTop: theme.spacing(3),
  },
})

// querygql
const GET_SMS_HISTORY = gql`
  query getSMSHistory($loginId: Int!, $from_ts: String!, $to_ts: String!) {
    getSMSHistory(clientLoginId: $loginId, from_ts: $from_ts, to_ts: $to_ts) {
      vehicleNumber
      message_sent
      alert_type
      alert_time
    }
  }
`

/**
 * @summary SMS-History page shows the SMS usage report
 */
class SmsHistory extends Component {
  /**
   * @property {object?} fromDate The start date for fetching SMS report
   * @property {object?} toDate The end date for fetching SMS report
   * @property {object[]} reportData The array of report rows object
   * @property {object[]} reportColumns The columns of the report
   * @property {boolean} loadMore A boolean flag to indicate if more rows can be loaded
   * @property {string} lastFetchedTs The timestamp of the last row of the report
   * @property {boolean} isMoreRowsLoading A boolean flag to determine is more reports are loading
   * @property {boolean} isReportDataLoading A boolean flag to determine if report is loading
   * @property {string} reportFetchingError The error if report could not be fetched
   * @property {string|object} result The report response
   * @property {boolean} response A boolean flag to determine if there was a successful response
   */
  state = {
    fromDate: null,
    toDate: null,
    reportData: [],
    reportColumns: [],
    loadMore: false,
    lastFetchedTs: null,
    isMoreRowsLoading: false,
    isReportDataLoading: false,
    reportFetchingError: '',
    result: '',
    response: false,
  }

  /**
   * @callback
   * @summary Handles changing of date
   */
  handleDateChange = (dateType) => (date) => {
    this.setState({
      [dateType]: date,
    })
    this._checkAndResetData()
  }

  /**
   * @function
   * @summary Resets the report data
   */
  _checkAndResetData = (cb) =>
    this.setState(
      {
        reportData: [],
        loadMore: false,
        lastFetchedTs: null,
        reportFetchingError: '',
      },
      () => {
        if (typeof cb === 'function' && cb()) {
          cb()
        }
      }
    )

  /**
   * @callback
   * @summary Clears previous report data & fetches new report
   */
  handleSubmit = () => {
    this._checkAndResetData(() => {
      if (this._checkBeforeSubmit()) {
        this.fetchReport()
      }
    })
  }

  /**
   * @function
   * @summary Validates dates for fetching report
   */
  _checkBeforeSubmit = () => {
    if (!this.state.fromDate) {
      this.props.openSnackbar('Please select From Date!')
      return false
    } else if (!this.state.toDate) {
      this.props.openSnackbar('Please select To Date!')
      return false
    } else {
      if (this.state.fromDate >= this.state.toDate) {
        this.props.openSnackbar('From date should be before To date')
        return false
      }
    }

    return true
  }

  /**
   * @function
   * @summary Makes a query to fetch report
   */
  fetchReport = async () => {
    const startTs = moment(this.state.fromDate).unix()
    const endTs = moment(this.state.toDate).unix()

    const fetchSmsDetails = await this.props.client.query({
      query: GET_SMS_HISTORY,
      variables: {
        loginId: getLoginId(),
        from_ts: startTs.toString(),
        to_ts: endTs.toString(),
      },
    })

    const data = this.mapToArr(fetchSmsDetails.data.getSMSHistory)
    if (data) {
      this.setState({ response: true, result: data })
    }
  }

  /**
   * @summary Columns for the report
   */
  columns = ['Vehicle Name', 'Alert Type', 'Date/Time', 'Message']

  /**
   * @summary Options for the `MUIDataTable` component
   */
  options = {
    selectableRows: 'none',
    responsive: 'stacked',
    rowsPerPage: 5,
    sort: false,
    print: true,
    download: true,
    filter: false,
    viewColumns: false,
  }

  /**
   * @function
   * @param {object[]} fetchSmsDetails The response of the report
   * @summary Maps an array of report objects to an array of arrays
   */
  mapToArr(fetchSmsDetails) {
    var rowData = []
    var fullData = []
    fetchSmsDetails.forEach((element) => {
      rowData = []
      rowData.push(element.vehicleNumber)
      rowData.push(element.alert_type)
      rowData.push(
        moment.unix(element.alert_time).format('D/M/YYYY, h:mm:ss A')
      )
      rowData.push(element.message_sent)
      fullData.push(rowData)
    })
    return fullData
  }

  render() {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <Grid container alignContent="flex-start" spacing={2}>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              size="small"
              onClick={this.props.history.goBack}
            >
              <BackIcon />
            </Button>{' '}
            {'    '}
            <Typography variant="h5">SMS Sent History</Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider />
            &nbsp;
            <Grid container alignItems="center" spacing={1}>
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                className={classes.reportSelectorItem}
              >
                <DateTimePicker
                  leftArrowIcon={<ChevronLeftIcon />}
                  rightArrowIcon={<ChevronRightIcon />}
                  dateRangeIcon={<DateRangeIcon />}
                  timeIcon={<TimeRangeIcon />}
                  value={this.state.fromDate}
                  onChange={this.handleDateChange('fromDate')}
                  label="From Date"
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                className={classes.reportSelectorItem}
              >
                <DateTimePicker
                  leftArrowIcon={<ChevronLeftIcon />}
                  rightArrowIcon={<ChevronRightIcon />}
                  dateRangeIcon={<DateRangeIcon />}
                  timeIcon={<TimeRangeIcon />}
                  value={this.state.toDate}
                  onChange={this.handleDateChange('toDate')}
                  label="To Date"
                />
              </Grid>
              <Grid item className={classes.reportSelectorItem}>
                {this.state.isReportDataLoading ? (
                  <CircularProgress />
                ) : (
                  <ColorButton
                    variant="contained"
                    color="primary"
                    onClick={this.handleSubmit}
                    disabled={
                      this.state.fromDate === null || this.state.toDate === null
                    }
                  >
                    Generate Report
                  </ColorButton>
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            {this.state.response && (
              <MUIDataTable
                data={this.state.result}
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

export default withStyles(styles)(withSharedSnackBar(withApollo(SmsHistory)))
