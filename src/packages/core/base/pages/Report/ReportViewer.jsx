/**
 * @module Report/ReportViewer
 * @summary ReportViewer module handles querying and rendering reports
 */

import React, { Component, Fragment } from 'react'
import gql from 'graphql-tag'
import moment from 'moment'
import classnames from 'classnames'
import { withRouter } from 'react-router-dom'
import { Query, withApollo } from 'react-apollo'
import { DateTimePicker } from '@material-ui/pickers'
import PdfIcon from 'mdi-material-ui/FilePdf'
import ExcelIcon from 'mdi-material-ui/FileExcel'
import MultiSelectComboBox from '@zeliot/common/ui/MultiSelectComboBox'
import withSharedSnackBar from '@zeliot/common/hoc/withSharedSnackbar'
import { GET_ALL_VEHICLES } from '@zeliot/common/graphql/queries'
import { DownloadProgressDialogConsumer } from '@zeliot/common/shared/DownloadProgressDialog/DownloadProgressDialog.context'
import ReportTable from './ReportTable'
import ReportCard from './ReportCard'
import {
  getQueryToFetchReport,
  parseReportData,
  getFieldTypeFromFieldId,
} from './utils'
import getLoginId from '@zeliot/common/utils/getLoginId'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import DateRangeIcon from '@material-ui/icons/DateRange'
import TimeRangeIcon from '@material-ui/icons/AccessTime'
import Graphs from './Graphs'
import {
  Grid,
  Select,
  MenuItem,
  Typography,
  FormControl,
  InputLabel,
  withStyles,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Chip,
} from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

let vehicleNumber = ''
let uniqueId = ''
moment.suppressDeprecationWarnings = true

const style = (theme) => ({
  root: {
    flexGrow: 1,
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

let gData

const DOWNLOAD_REPORT = gql`
  query(
    $uniqueIds: [String!]!
    $startTime: String!
    $endTime: String!
    $loginId: Int!
    $customReportName: String!
    $reportType: String!
    $category: Int!
    $timezone: String
    $fileType: fileTypes
    $offset: Int
  ) {
    getReportDownloadLink(
      uniqueIds: $uniqueIds
      start_ts: $startTime
      end_ts: $endTime
      clientLoginId: $loginId
      customReportName: $customReportName
      reportType: $reportType
      category: $category
      timezone: $timezone
      offset: $offset
      fileType: $fileType
    ) {
      downloadLink
    }
  }
`

/**
 * @summary ReportViewer component handles the interface for selecting vehicles, date range
 * and rendering report as a table or card
 */
class ReportViewer extends Component {
  /**
   * @property {object[]} vehiclesList The list of vehicles that a user can select
   * @property {object[]} groupsList The list of groups a user can select
   * @property {object[]} selectedItems The list of vehicles/groups that a user has selected
   * @property {string} vehiclesQueryStatus The status of vehicles list fetch query
   * @property {object[]} selectedVehicles The list of vehicles that are selected
   * @property {string} dateRangeType The type of date range selected
   * @property {object?} fromDate The start date for fetching report
   * @property {object?} toDate The end date for fetching report
   * @property {object[]} reportData The report response data
   * @property {string[]} reportColumns The column titles of the report
   * @property {boolean} loadMore A boolean if more rows exist in the report
   * @property {string?} lastFetchedTs The timestamp of the last fetched row in the report
   * @property {boolean} isMoreRowsLoading A boolean indicating whether new rows are being loaded
   * @property {boolean} isReportDataLoading A boolean indicating whether report data is being fetched
   * @property {string} reportFetchingError The error for fetching report
   */
  state = {
    vehiclesList: [],
    groupsList: [],
    selectedItems: [],
    vehiclesQueryStatus: 'EMPTY',
    selectedVehicles: [],
    dateRangeType: 'day',
    interval: 0,
    fromDate: null,
    toDate: null,
    reportData: [],
    reportColumns: [],
    loadMore: false,
    lastFetchedTs: null,
    isMoreRowsLoading: false,
    isReportDataLoading: false,
    reportFetchingError: '',
    isDigitalReportType: false,
    digitalEventList: [],
    // reportName: this.props.defaultReports.reportName
  }

  /**
   * @callback
   * @summary Generic change handler
   */

  handleIntervalChange = (e) => {
    this.setState({ interval: parseInt(e.target.value, 10) })
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value })
    if (e.target.name === 'dateRangeType') {
      this._checkAndResetData()
    } else if (e.target.name === 'baseReport') {
      this.fetchFieldsForReport()
    }
  }

  /**
   * @callback
   * @summary Change date input
   */
  handleDateChange = (dateType) => (date) => {
    this.setState({
      [dateType]: date,
    })
    this._checkAndResetData()
  }

  /**
   * @callback
   * @param {object[]} selectedItems The new list of items selected
   * @summary Update the list of selected items and vehicles
   */
  handleSelectedItemsChange = (selectedItems) => {
    let selectedVehicles = []

    selectedItems.forEach((item) => {
      if (item.type === 'VEHICLE') {
        selectedVehicles.push(item.id)
      } else {
        const vehicleIds = this.props.groups
          .find((group) => group.id === item.id)
          .vehicles.map(({ uniqueId }) => uniqueId)

        selectedVehicles = selectedVehicles.concat(vehicleIds)
      }
    })

    this.setState({
      selectedItems,
      selectedVehicles: this.state.vehiclesList.filter((vehicle) =>
        selectedVehicles.includes(vehicle.id)
      ),
    })

    this._checkAndResetData()
  }

  /**
   * @callback
   * @summary Handles submit actionf or fetching report
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
   * @param {function} cb The callback to be executed
   * @summary Resets current report data
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
   * @function
   * @summary Validates input & parameters before querying for report
   */
  _checkBeforeSubmit = () => {
    if (!this.state.selectedVehicles.length) {
      this.props.openSnackbar('Please select a vehicle!')
      return false
    } else if (this.state.dateRangeType === 'custom') {
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
    } else if (!this.props.report) {
      this.props.openSnackbar('Please select the type of report!')
      return false
    }
    return true
  }

  /**
   * @function
   * @summary Formates the from & to date paramters for fetching report
   */
  _formatDate = () => {
    let startTs
    let endTs

    if (this.state.lastFetchedTs) {
      startTs = moment(moment.unix(this.state.lastFetchedTs).add(1, 's')).unix()
      if (this.state.dateRangeType === 'day') {
        endTs = moment().unix()
      } else if (this.state.dateRangeType === 'week') {
        endTs = moment().unix()
      } else {
        endTs = moment(this.state.toDate).unix()
      }
    } else {
      if (this.state.dateRangeType === 'day') {
        startTs = moment(moment().subtract(1, 'day')).unix()
        endTs = moment().unix()
      } else if (this.state.dateRangeType === 'week') {
        startTs = moment(moment().subtract(1, 'week')).unix()
        endTs = moment().unix()
      } else {
        startTs = moment(this.state.fromDate).unix()
        endTs = moment(this.state.toDate).unix()
      }
    }

    return {
      startTs: startTs.toString(),
      endTs: endTs.toString(),
    }
  }

  /**
   * @function getDIEventCount
   * @summary Maps di events count data to object.
   */

  getDIEventCount = (data) => {
    console.log('di event count data', data)
    const eventCount = []
    let temp
    if (data.totalDIEvents !== undefined) {
      temp = {
        label: 'Total DI Events',
        counts: data.totalDIEvents,
      }
      eventCount.push(temp)
    }
    if (data.total_DI_1_Events !== undefined) {
      temp = {
        label: 'Total DI_1 Events',
        counts: data.total_DI_1_Events,
      }
      eventCount.push(temp)
    }
    if (data.total_DI_2_Events !== undefined) {
      temp = {
        label: 'Total DI_2 Events',
        counts: data.total_DI_2_Events,
      }
      eventCount.push(temp)
    }
    if (data.total_DI_3_Events !== undefined) {
      temp = {
        label: 'Total DI_3 Events',
        counts: data.total_DI_3_Events,
      }
      eventCount.push(temp)
    }
    if (data.total_DI_4_Events !== undefined) {
      temp = {
        label: 'Total DI_4 Events',
        counts: data.total_DI_4_Events,
      }
      eventCount.push(temp)
    }
    console.log('event couns list: -----', eventCount)
    return eventCount
  }

  /**
   * @function renderEventCounts
   * @summary It renders digital event counts above the table.
   */

  renderEventCounts = () => {
    const { digitalEventList } = this.state
    const { classes } = this.props
    return (
      <>
        <Grid md={12} style={{ margin: '1rem 0' }}>
          <Typography variant="h5" component="h2" color="black">
            Digital IO Consolidated Count
          </Typography>
        </Grid>
        <Grid container md={12} justify="flex-start" spacing={2}>
          {digitalEventList.map((event) => {
            return (
              <Grid item container md={2} alignItems="center">
                <Grid item md={6}>
                  <Typography variant="subtitle2" component="h2">
                    {event.label} :
                  </Typography>
                </Grid>
                <Grid item md={6}>
                  <Typography variant="subtitle2" component="h2">
                    {event.counts}
                  </Typography>
                </Grid>
              </Grid>
            )
          })}
        </Grid>
      </>
    )
  }

  previousDist = null

  /**
   * @function
   * @summary Makes a GraphQL query to fetch report and sets the data in state
   */
  fetchReport = async () => {
    if (this.state.reportData.length) {
      this.setState({ isMoreRowsLoading: true })
    } else {
      this.setState({ isReportDataLoading: true })
      this.previousDist = null
    }

    const { category, reportName, reportType, fields } = this.props.report
    const uniqueId = this.state.selectedVehicles[0].id
    const offset = this.state.interval
    const { startTs, endTs } = this._formatDate()

    const response = await this.props.client.query({
      query: getQueryToFetchReport(
        category,
        reportType,
        reportName,
        uniqueId,
        offset,
        startTs,
        endTs,
        fields,
        this.previousDist
      ),
    })

    if (response.data && response.data.report) {
      let dataRows
      let data = response.data.report
      gData = response.data.report

      console.log('category', category)
      if (category === 1) {
        dataRows = data.categoryOneFields
      } else if (category === 2) {
        console.log(
          'category--------',
          category,
          `"${JSON.parse(reportType)[0]}"` === `"digitalIO"`,
          JSON.parse(reportType)[0],
          typeof JSON.parse(reportType)[0]
        )
        dataRows = data.categoryTwoFields
        if (`"${JSON.parse(reportType)[0]}"` === `"digitalIO"`) {
          const _diEventCounts = this.getDIEventCount(data)
          this.setState(
            {
              isDigitalReportType: true,
              digitalEventList: _diEventCounts,
            },
            () => {
              console.log('event count lists', this.state.digitalEventList)
            }
          )
        }
      } else {
        dataRows = data.categoryThreeFields
      }
      if (dataRows.length < 1) {
        this.props.openSnackbar('No data available!')
      }
      // console.log(response.data.report.continue_flag)
      const loadMore = response.data.report.continue_flag

      const lastFetchedTs = response.data.report.end_ts

      this.previousDist = response.data.report.previousDist

      this.setState(({ reportData }) => ({
        loadMore,
        lastFetchedTs,
        reportData: [
          ...reportData,
          ...parseReportData(response.data.report, category),
        ],
      }))
    } else {
      this.setState({
        reportFetchingError: 'No data available!',
        loadMore: false,
        lastFetchedTs: null,
      })
    }

    this.setState({ isMoreRowsLoading: false, isReportDataLoading: false })
  }

  /**
   * @function
   * @summary Fetches the list of vehicles for dropdown
   */
  getVehicles = async () => {
    this.setState({ vehiclesQueryStatus: 'LOADING' })
    const groupsList = this.props.groups.map(({ id, name }) => ({
      id,
      name,
      type: 'GROUP',
    }))

    const response = await this.props.client.query({
      query: GET_ALL_VEHICLES,
      variables: {
        loginId: getLoginId(),
      },
    })

    if (response.data && response.data.vehicles) {
      const vehiclesList = response.data.vehicles.map(
        ({ vehicleNumber, deviceDetail: { uniqueDeviceId: uniqueId } }) => ({
          id: uniqueId,
          name: vehicleNumber,
          vehcleNumber: vehicleNumber,
          uniqueId: uniqueId,
          type: 'VEHICLE',
        })
      )
      this.setState({ vehiclesList, groupsList, vehiclesQueryStatus: 'LOADED' })
    } else {
      this.setState({ vehiclesQueryStatus: 'ERROR' })
    }
  }

  /**
   * @function
   * @summary Resets the selection of date range, vehicle, and other parameters for fetching report
   */
  resetSelection = () => {
    this._checkAndResetData()
    this.setState({
      selectedVehicles: [],
      selectedItems: [],
      dateRangeType: 'day',
      fromDate: null,
      toDate: null,
      isMoreRowsLoading: false,
      isReportDataLoading: false,
      vehiclesQueryStatus: 'EMPTY',
      interval: 0,
    })
  }

  /**
   * @function
   * @summary Navigates back to report selection page
   */
  goBackToReportSelector = () => {
    this.props.history.push('/home/report')
  }

  /**
   * @function
   * @summary Queries to get report download link and handles downloading the report as PDF or excel
   */
  downloadReport = async (fileType) => {
    const { category, reportName, reportType } = this.props.report

    const { startTs, endTs } = this._formatDate()
    const fileName = this.state.selectedVehicles[0].name + '-' + reportName
    const uniqueIds = this.state.selectedVehicles.map((vehicle) => vehicle.id)
    const loginId = getLoginId()
    const offset = this.state.interval

    this.props.downloadReport(
      DOWNLOAD_REPORT,
      {
        category,
        ...(category === 2
          ? { reportType: JSON.parse(reportType)[0] }
          : { reportType: '' }),
        customReportName: reportName,
        uniqueIds,
        startTime: startTs,
        endTime: endTs,
        loginId,
        offset,
        fileType,
      },
      ['getReportDownloadLink', 'downloadLink'],
      fileName
    )
  }

  /**
   * @callback
   * @summary Handles download button click and initiates downloading report, before
   * validating parameters to download report
   */
  handleDownloadSubmit = (reportType) => {
    this._checkAndResetData(() => {
      if (this._checkBeforeSubmit()) {
        this.downloadReport(reportType)
      }
    })
  }

  /**
   * @callback
   * @summary Handles chip deletion(selected items)
   */
  handleChipDelete = (selectedItem) => {
    const selectedItems = [...this.state.selectedItems]
    let itemIndex = -1

    for (const i in selectedItems) {
      if (selectedItem.id === selectedItems[i].id) {
        itemIndex = i
        break
      }
    }
    selectedItems.splice(itemIndex, 1)
    this.handleSelectedItemsChange(selectedItems)
    this.setState({ selectedItems })
  }

  /**
   * @summary React lifecycle method called after the component mounts
   */
  componentDidMount() {
    this.getVehicles()
  }

  /**
   * @summary Computes if the 'Download' button should be shown
   */
  get showDownloadButton() {
    return (
      Boolean(this.state.selectedVehicles.length) &&
      ((this.state.dateRangeType === 'custom' &&
        this.state.fromDate &&
        this.state.toDate &&
        this.state.fromDate < this.state.toDate) ||
        this.state.dateRangeType !== 'custom')
    )
  }

  /**
   * @summary Renders the report parameter selection controls
   */
  renderParameterSelector = () => {
    const { classes, selectedLanguage } = this.props

    return (
      <Grid container justify="flex-start" alignItems="center" spacing={2}>
        <Grid item xs={12} direction={'row'}>
          <Grid container alignItems="center" spacing={4}>
            <Grid
              item
              xs={3}
              sm={6}
              md={4}
              lg={3}
              className={classnames(
                classes.reportSelectorItem,
                classes.comboBoxTopMargin
              )}
            >
              <MultiSelectComboBox
                items={this.state.vehiclesList.concat(this.state.groupsList)}
                itemKey="id"
                itemToStringKey="name"
                itemToLabelKey="type"
                placeholder={
                  languageJson[selectedLanguage].reportsPage.reportsViewPage
                    .searchVehiclesAndGroups
                }
                isLoading={this.state.vehiclesQueryStatus === 'LOADING'}
                selectedItems={this.state.selectedItems}
                onSelectedItemsChange={this.handleSelectedItemsChange}
                searchByFields={['name']}
                errorComponent={
                  <Grid container>
                    <Grid item xs={12}>
                      Error fetching vehicles list
                    </Grid>
                    <Grid item xs={12}>
                      <Button onClick={() => this.getVehicles()}>Retry</Button>
                    </Grid>
                  </Grid>
                }
              />
            </Grid>
            {this.props.report.reportName !== 'Current Summary Report' && (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={2}
                className={classes.reportSelectorItem}
              >
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="date-range">
                    {languageJson[selectedLanguage].common.dateFilter.dateRange}
                  </InputLabel>

                  <Select
                    value={this.state.dateRangeType}
                    onChange={this.handleChange}
                    inputProps={{
                      name: 'dateRangeType',
                      id: 'date-range',
                    }}
                  >
                    <MenuItem value="day">
                      {languageJson[selectedLanguage].common.dateFilter.lastDay}
                    </MenuItem>
                    <MenuItem value="week">
                      {
                        languageJson[selectedLanguage].common.dateFilter
                          .lastWeek
                      }
                    </MenuItem>
                    <MenuItem value="custom">
                      {
                        languageJson[selectedLanguage].common.dateFilter
                          .customRange
                      }
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* {this.props.report.reportName === 'Tracking Report' && (
                  <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="date-range">
                      Time Interval (mins)
                    </InputLabel>

                    <Select
                      value={this.state.interval}
                      onChange={this.handleIntervalChange}
                      inputProps={{
                        name: 'intervalRange',
                        id: 'interval-range'
                      }}
                    >
                      <MenuItem value="0">None</MenuItem>
                      <MenuItem value="5">5</MenuItem>
                      <MenuItem value="10">10</MenuItem>
                      <MenuItem value="15">15</MenuItem>
                      <MenuItem value="20">20</MenuItem>
                      <MenuItem value="25">25</MenuItem>
                      <MenuItem value="30">30</MenuItem>
                      <MenuItem value="35">35</MenuItem>
                      <MenuItem value="40">40</MenuItem>
                      <MenuItem value="45">45</MenuItem>
                      <MenuItem value="50">50</MenuItem>
                      <MenuItem value="55">55</MenuItem>
                      <MenuItem value="60">60</MenuItem>
                    </Select>
                  </FormControl>
                )} */}
              </Grid>
            )}
            {this.props.report.reportName === 'Tracking Report' && (
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="date-range">
                  Time Interval (mins)
                </InputLabel>

                <Select
                  value={this.state.interval}
                  onChange={this.handleIntervalChange}
                  inputProps={{
                    name: 'intervalRange',
                    id: 'interval-range',
                  }}
                >
                  <MenuItem value="0">None</MenuItem>
                  <MenuItem value="5">5</MenuItem>
                  <MenuItem value="10">10</MenuItem>
                  <MenuItem value="15">15</MenuItem>
                  <MenuItem value="20">20</MenuItem>
                  <MenuItem value="25">25</MenuItem>
                  <MenuItem value="30">30</MenuItem>
                  <MenuItem value="35">35</MenuItem>
                  <MenuItem value="40">40</MenuItem>
                  <MenuItem value="45">45</MenuItem>
                  <MenuItem value="50">50</MenuItem>
                  <MenuItem value="55">55</MenuItem>
                  <MenuItem value="60">60</MenuItem>
                </Select>
              </FormControl>
            )}

            {this.state.dateRangeType === 'custom' && (
              <Fragment>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={2}
                  className={classes.reportSelectorItem}
                >
                  <DateTimePicker
                    leftArrowIcon={<ChevronLeftIcon />}
                    rightArrowIcon={<ChevronRightIcon />}
                    dateRangeIcon={<DateRangeIcon />}
                    timeIcon={<TimeRangeIcon />}
                    value={this.state.fromDate}
                    onChange={this.handleDateChange('fromDate')}
                    label={
                      languageJson[selectedLanguage].common.dateFilter.fromDate
                    }
                    style={{ marginLeft: 10 }}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={2}
                  className={classes.reportSelectorItem}
                >
                  <DateTimePicker
                    leftArrowIcon={<ChevronLeftIcon />}
                    rightArrowIcon={<ChevronRightIcon />}
                    dateRangeIcon={<DateRangeIcon />}
                    timeIcon={<TimeRangeIcon />}
                    value={this.state.toDate}
                    onChange={this.handleDateChange('toDate')}
                    label={
                      languageJson[selectedLanguage].common.dateFilter.toDate
                    }
                  />
                </Grid>
              </Fragment>
            )}
          </Grid>
        </Grid>

        <Grid item className={classes.reportSelectorItem}>
          {this.state.isReportDataLoading ? (
            <CircularProgress />
          ) : (
            <ColorButton
              variant="contained"
              color="primary"
              onClick={this.handleSubmit}
              disabled={this.state.selectedVehicles.length !== 1}
            >
              {
                languageJson[selectedLanguage].reportsPage.reportsViewPage
                  .generateReportButtonTitle
              }
            </ColorButton>
          )}
        </Grid>

        <Grid item className={classes.reportSelectorItem}>
          <Button variant="outlined" onClick={this.resetSelection}>
            {
              languageJson[selectedLanguage].reportsPage.reportsViewPage
                .resetButtonTitle
            }
          </Button>
        </Grid>

        <Grid item className={classes.reportSelectorItem}>
          <Button variant="outlined" onClick={this.goBackToReportSelector}>
            {
              languageJson[selectedLanguage].reportsPage.reportsViewPage
                .backToReportsButtonTitle
            }
          </Button>
        </Grid>

        {this.showDownloadButton && (
          <React.Fragment>
            <Grid item className={classes.reportSelectorItem}>
              <IconButton
                onClick={() => this.handleDownloadSubmit('EXCEL')}
                title="Download Excel Report"
              >
                <ExcelIcon />
              </IconButton>
            </Grid>

            <Grid item className={classes.reportSelectorItem}>
              <IconButton
                onClick={() => this.handleDownloadSubmit('PDF')}
                title="Download PDF report"
              >
                <PdfIcon />
              </IconButton>
            </Grid>
          </React.Fragment>
        )}
      </Grid>
    )
  }

  /**
   * @summary Renders the chips for selected items
   */
  renderChips = () => (
    <Grid container spacing={2}>
      {this.state.selectedItems.map((item) => (
        <Grid item key={item.id}>
          <Chip
            key={item.id}
            label={`${item.name} (${item.type})`}
            onDelete={() => this.handleChipDelete(item)}
          />
        </Grid>
      ))}
    </Grid>
  )

  /**
   * @summary Computes if a Card should be shown for rendering report
   */
  get showReportCard() {
    if (this.props.report && this.props.report.category === 3) {
      return true
    }
    return false
  }

  /**
   * @summary Computes if a Table should be shown for rendering report
   */
  get showReportTable() {
    if (this.props.report && this.props.report.category !== 3) {
      return true
    }
    return false
  }

  render() {
    const { classes } = this.props
    const { isDigitalReportType } = this.state

    const columns = this.props.report.fields.map((column) => column.fieldId)
    const addressIndex = columns.indexOf('alertAddress')
    const locationIndex = columns.indexOf('alertLoc')

    let filteredColumns = []

    if (addressIndex !== -1 && locationIndex !== -1) {
      for (let i = 0; i < this.props.report.fields.length; i++) {
        if (i === addressIndex) {
          filteredColumns.push({
            fieldId: 'addressObj',
            fieldName: 'Address',
          })
        } else if (i === locationIndex) {
          continue
        } else {
          filteredColumns.push(this.props.report.fields[i])
        }
      }
    } else {
      filteredColumns = this.props.report.fields
    }

    return (
      <div className={classes.root}>
        <Grid container alignContent="flex-start" spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5">{this.props.report.reportName}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12}>
            {this.renderParameterSelector()}
          </Grid>

          <Grid item xs={12}>
            {this.renderChips()}
          </Grid>

          {isDigitalReportType && (
            <Grid item container xs={12}>
              {this.renderEventCounts()}
            </Grid>
          )}

          {this.showReportTable && (
            <Fragment>
              <Grid item xs={12}>
                <ReportTable
                  vehicleNumber={vehicleNumber}
                  uniqueId={uniqueId}
                  report={this.props.report}
                  data={this.state.reportData}
                  columns={filteredColumns.map((column) => column.fieldName)}
                  columnTypes={filteredColumns.map((column) => {
                    return getFieldTypeFromFieldId(
                      this.props.fields,
                      column.fieldId
                    )
                  })}
                  loadMore={this.state.loadMore}
                  onClickLoadMore={this.fetchReport}
                  isMoreRowsLoading={this.state.isMoreRowsLoading}
                  error={this.state.reportFetchingError}
                />
              </Grid>
              <Grid item xs={12}>
                {/* {console.log(this.state.reportData.length)} */}
                {this.state.selectedVehicles.length != 0 &&
                this.props.report.reportName === 'Tracking Report' &&
                this.state.reportData.length ? (
                  <Graphs
                    vehicle={{
                      vehicleNumber: this.state.selectedVehicles[0].name,
                      uniqueId: this.state.selectedVehicles[0].id,
                    }}
                    data={gData}
                  />
                ) : null}
              </Grid>
            </Fragment>
          )}

          {this.showReportCard && (
            <Fragment>
              <Grid item xs={12}>
                <ReportCard
                  data={this.state.reportData}
                  columns={filteredColumns.map((column) => column.fieldName)}
                  columnTypes={filteredColumns.map((column) =>
                    getFieldTypeFromFieldId(this.props.fields, column.fieldId)
                  )}
                  reportName={this.props.report.reportName}
                />
              </Grid>
            </Fragment>
          )}
        </Grid>
      </div>
    )
  }
}

const GET_GROUPS = gql`
  query($loginId: Int!) {
    groups: allGroupsDetails(clientLoginId: $loginId) {
      id
      name: groupName
      vehicles: assignedVehicles {
        uniqueId: uniqueDeviceId
        vehicleNumber
      }
    }
  }
`

export default withStyles(style)(
  withApollo(
    withSharedSnackBar(
      withLanguage(
        withRouter((props) => (
          <DownloadProgressDialogConsumer>
            {({ downloadReport }) => (
              <Query query={GET_GROUPS} variables={{ loginId: getLoginId() }}>
                {({ loading, error, data }) => {
                  if (loading) return 'Loading...'
                  if (error) return 'Error'
                  return (
                    <ReportViewer
                      downloadReport={downloadReport}
                      groups={data.groups}
                      {...props}
                    />
                  )
                }}
              </Query>
            )}
          </DownloadProgressDialogConsumer>
        ))
      )
    )
  )
)
