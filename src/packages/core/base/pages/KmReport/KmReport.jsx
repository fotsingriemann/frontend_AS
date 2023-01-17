import React, { Component } from 'react'
import {
  Grid,
  Divider,
  withStyles,
  CircularProgress,
  Typography,
  Button,
  Select,
  MenuItem,
} from '@material-ui/core'
import { DatePicker } from '@material-ui/pickers'
import moment from 'moment'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import MUIDataTable from 'mui-datatables'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

var timeZone = null

const GET_KM_REPORT = gql`
  query(
    $from_ts: String!
    $to_ts: String!
    $frequency: KMFREQUENCY
    $timezone: String
  ) {
    getKmSummary(
      from_ts: $from_ts
      to_ts: $to_ts
      frequency: $frequency
      timezone: $timezone
    ) {
      vehicleNumber
      totaldist
      date
      month
    }
  }
`

const PageStyles = (theme) => ({
  ExternalPadding: {
    padding: theme.spacing(2),
  },
  HeaderPadding: {
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
})

class KmReport extends Component {
  state = {
    selectedDate: null,
    from: null,
    to: null,
    kmReport: [],
    loading: false,
    data: null,
    frequency: 'DAILY',
    fromMonth: null,
    toMonth: null,
    fromDate: null,
    toDate: null,
  }

  columns1 = ['Vehicle Number', 'Distance (KM)', 'Date']
  columns2 = ['Vehicle Number', 'Distance (KM)', 'Month']

  options = {
    selectableRows: 'none',
    responsive: 'stacked',
    rowsPerPage: 25,
  }

  handleMonthChange = (dateType) => (date) => {
    this.setState({
      [dateType]: date,
    })

    // console.log(dateType)
    if (dateType === 'fromMonth') {
      var startDate = moment([date.year(), date.month()])
      let fd = startDate.unix()
      // console.log('fd', fd + 19800);

      this.setState({
        from: fd + 19800,
      })
    } else {
      var endDate = moment(date).endOf('month')
      let ed = endDate.unix()
      // console.log('endDate', ed)

      this.setState({
        to: ed + 19800,
      })
    }
  }

  handleClick = async () => {
    if (this.state.from == null || this.state.to == null) {
      this.props.openSnackbar('Please select both the dates')
    } else {
      // console.log('from date',this.state.from.toString(),
      // 'to date', this.state.to.toString(),
      // 'frequency', this.state.frequency,
      // 'timezone', timeZone)
      this.setState({ loading: true })
      const response = await this.props.client.query({
        query: GET_KM_REPORT,
        variables: {
          from_ts: this.state.from.toString(),
          to_ts: this.state.to.toString(),
          frequency: this.state.frequency,
          timezone: timeZone,
        },
      })

      if (response) {
        this.setState(
          { loading: false, kmReport: response.data.getKmSummary },
          () => {
            this.setState({ data: this.mapToArr(this.state.kmReport) })
          }
        )
      }
    }
  }

  mapToArr = (kmReport) => {
    var rowData = []
    var fullData = []
    kmReport.forEach((element) => {
      rowData = []
      rowData.push(element.vehicleNumber)
      rowData.push(element.totaldist)
      this.state.frequency === 'DAILY'
        ? rowData.push(element.date)
        : rowData.push(element.month)
      rowData.push(element.month)
      fullData.push(rowData)
    })

    return fullData
  }

  handleFrequencyChange = (event) => {
    if (event)
      // console.log(event.target.value)
      this.setState({
        frequency: event.target.value,
        from: null,
        to: null,
        fromDate: null,
        toDate: null,
        fromMonth: null,
        toMonth: null,
      })
  }

  onDateChange = (dateType) => (date) => {
    this.setState({
      [dateType]: date,
    })

    if (dateType === 'fromDate') {
      let fd = date.unix()

      this.setState({ from: fd })
    } else {
      let td = date.unix()

      this.setState({ to: td })
    }
  }

  componentDidMount() {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    // console.log('timezone', timeZone, typeof timeZone)
  }

  render() {
    const { classes, selectedLanguage } = this.props

    return (
      <Grid container>
        <Grid item xs={12}>
          <Grid
            container
            justify="space-between"
            alignItems="center"
            className={classes.HeaderPadding}
          >
            <Grid item xs={12}>
              <Typography variant="h5">
                {languageJson[selectedLanguage].kmReportPage.pageTitle}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid
              container
              justify="space-between"
              alignItems="center"
              className={classes.HeaderPadding}
            >
              <Grid item xs={2}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">
                    Select Frequency
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    value={this.state.frequency}
                    onChange={(e) => this.handleFrequencyChange(e)}
                  >
                    <MenuItem value="DAILY">
                      {languageJson[selectedLanguage].kmReportPage.frequency[0]}
                    </MenuItem>
                    <MenuItem value="MONTHLY">
                      {languageJson[selectedLanguage].kmReportPage.frequency[1]}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {this.state.frequency === 'MONTHLY' ? (
                <>
                  <Grid item xs={2}>
                    <DatePicker
                      openTo="month"
                      views={['month', 'year']}
                      label="Select From Month"
                      value={this.state.fromMonth}
                      onChange={this.handleMonthChange('fromMonth')}
                      disableFuture
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <DatePicker
                      openTo="month"
                      views={['month', 'year']}
                      label="Select To Month"
                      value={this.state.toMonth}
                      onChange={this.handleMonthChange('toMonth')}
                      disableFuture
                    />
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={2}>
                    <DatePicker
                      format="DD/MM/YYYY"
                      label={
                        languageJson[selectedLanguage].common.dateFilter
                          .fromDate
                      }
                      value={this.state.fromDate}
                      onChange={this.onDateChange('fromDate')}
                      disableFuture
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <DatePicker
                      format="DD/MM/YYYY"
                      label={
                        languageJson[selectedLanguage].common.dateFilter.toDate
                      }
                      value={this.state.toDate}
                      onChange={this.onDateChange('toDate')}
                      disableFuture
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={2}>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={this.handleClick}
                >
                  {
                    languageJson[selectedLanguage].kmReportPage
                      .getReportButtonTitle
                  }
                </Button>
              </Grid>
            </Grid>

            <Grid
              container
              justify="space-between"
              alignItems="center"
              className={classes.HeaderPadding}
            >
              <Grid item xs={12}>
                {this.state.loading ? (
                  <CircularProgress />
                ) : this.state.kmReport.length > 0 &&
                  this.state.data != null ? (
                  <MUIDataTable
                    title={
                      languageJson[selectedLanguage].kmReportPage.pageTitle
                    }
                    data={this.state.data}
                    columns={
                      this.state.frequency === 'DAILY'
                        ? languageJson[selectedLanguage].kmReportPage
                            .dailyReportTableColumn
                        : languageJson[selectedLanguage].kmReportPage
                            .monthlyReportTableColumn
                    }
                    options={this.options}
                  />
                ) : null}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

export default withStyles(PageStyles)(
  withApollo(withSharedSnackbar(withLanguage(KmReport)))
)
