/**
 * @module AlertsDashboard/AlertsDashboard
 * @summary AlertsDhaboard module exports the page component for rendering the Alerts Dashboard
 */

import React, { Component } from 'react'
import moment from 'moment'
import gql from 'graphql-tag'
import * as xlsx from 'xlsx'
import FileSaver from 'file-saver'
import { Link, Switch } from 'react-router-dom'
import { withApollo } from 'react-apollo'
import {
  Divider,
  Typography,
  Grid,
  withStyles,
  Button,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableSortLabel,
  TableCell,
  IconButton,
  Tooltip,
  Paper,
} from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CloudDownload as DownloadIcon,
} from '@material-ui/icons'
import ComboBox from '@zeliot/common/ui/ComboBox'
import { GET_ALL_VEHICLES } from '@zeliot/common/graphql/queries'
import getLoginId from '@zeliot/common/utils/getLoginId'
import { PrivateRoute } from '@zeliot/common/router'
import { THEME_MAIN_COLORS as COLOR_RANGE } from '@zeliot/common/constants/styles'
import { ALERT_ICONS } from '@zeliot/common/constants/others'
import getUnixString from '@zeliot/common/utils/time/getUnixString'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import AlertCard from './AlertCard'
import TimePeriodSelector from '../OBD/VehicleHealth/Graphs/TimePeriodSelector'
import AlertsConfiguration from './AlertsConfiguration'
import EmergencyAlerts from './EmergencyAlerts'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

const fileType =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
const fileExtension = '.xlsx'

const GET_ALERT_BY_TYPE = gql`
  query($clientId: Int!, $alertType: String!, $from: String, $to: String) {
    getAllAlertsByAlertType(
      clientLogin: $clientId
      alertType: $alertType
      from: $from
      to: $to
    ) {
      uniqueid
      alerttype
      alertvalue
      from_ts
      to_ts
      address
      view_status
      lat
      lng
    }
  }
`

const GET_ALL_ALERTS_COUNT = gql`
  query getAllAlertsByClientLogin($clientId: Int!, $from: String, $to: String) {
    alerts: getAllAlertsByClientLogin(
      clientLogin: $clientId
      from: $from
      to: $to
    ) {
      alerttype
      view_status
    }
  }
`

const GET_ALERT_TYPES = gql`
  query allAlerts {
    alertTypes: allAlerts {
      alertName
      alertType
      alertDescription
      valueType
    }
  }
`

const style = (theme) => ({
  root: {
    padding: theme.spacing(3),
    height: '100%',
  },
  customFooter: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

const ROWS_PER_PAGE = 5

/**
 * @summary AlertsDashboard component renders the Dashboard of alerts page
 */
class AlertsDashboard extends Component {
  /**
   * @property {object[]?} vehicles The list of vehicles of a client
   * @property {object} selectedVehicle The selected vehicle object
   * @property {object[]} alerts The list of alerts
   * @property {object[]} alertCounts The counts of alerts
   * @property {object[]} alertTypes The types of alerts
   * @property {object[]?} alertTableValues The values for the alert table
   * @property {string?} alertTableTitle The title of the alert table
   * @property {object?} selectedAlert The selected alert
   * @property {boolean} isFetchingAlert State variable to check if alert is being fetched
   * @property {object?} from The start datetime of the alerts
   * @property {object?} to The end datetime of the alerts
   * @property {string} option The date range type
   * @property {string?} fromTs The from timestamp for fetching alerts
   * @property {string?} toTs The to timestamp for fetching alerts
   * @property {number} currentPage The current page of the alerts table
   * @property {string} order The order of sorting the alerts
   */
  state = {
    vehicles: null,
    selectedVehicle: null,
    alerts: [],
    alertCounts: [],
    alertTypes: null,
    alertTableValues: [],
    alertTableTitle: null,
    selectedAlert: null,
    isFetchingAlert: false,
    from: null,
    to: null,
    option: 'WEEK',
    fromTs: null,
    toTs: null,
    currentPage: 0,
    order: 'desc',
  }

  /**
   * @callback
   * @summary Callback called on sort request
   */
  handleRequestSort = (event) => {
    let order = 'asc'
    if (this.state.order === 'asc') {
      order = 'desc'
    }
    this.setState({ order }, () => {
      this.setState({
        alertTableValues: this.sortAlerts(this.state.alertTableValues),
      })
    })
  }

  /**
   * @function
   * @summary Sorts the alerts by timestamp
   */
  sortAlerts = (alerts) => {
    alerts.sort(function (a, b) {
      const timeA = a.from_ts
      const timeB = b.from_ts
      if (timeA < timeB) {
        // sort string ascending
        return -1
      }
      if (timeA > timeB) return 1
      return 0 // default return value (no sorting)
    })
    if (this.state.order === 'asc') {
      return alerts
    } else {
      return alerts.reverse()
    }
  }

  /**
   * @callback
   * @summary Callback called on change of date range selection
   */
  handleOptionChange = (e) => {
    this.setState({ option: e.target.value, from: null, to: null })
  }

  /**
   * @callback
   * @summary Callback called on change of date & time
   */
  handleDateTimeChange = (dateType) => (dateTime) =>
    this.setState({
      [dateType]: dateTime,
    })

  /**
   * @function
   * @summary Calculates the from time based on time range selected
   */
  calculateRange = () => {
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

    fromTs = fromTs ? getUnixString(fromTs) : null
    toTs = toTs ? getUnixString(toTs) : null
    return { fromTs, toTs }
  }

  /**
   * @callback
   * @summary Callback called on submitting request to fetch alerts
   */
  handleSubmit = () => {
    this.setState({ currentPage: 0 })
    const { fromTs, toTs } = this.calculateRange()

    if (fromTs >= toTs) {
      this.props.openSnackbar('Date range provided is wrong')
    } else if (
      fromTs > getUnixString(moment.now()) ||
      toTs > getUnixString(moment.now())
    ) {
      this.props.openSnackbar('Future dates are not allowed')
    } else {
      this.setState({ fromTs, toTs }, () => {
        if (this.state.selectedAlert) {
          this.updateAlertCounts()
          this.filterAlertsByType(this.state.selectedAlert.alertType)
        } else this.props.openSnackbar('Please select an alert to view data.')
      })
    }
  }

  /**
   * @function
   * @summary Fetch all vehicles for a client
   */
  requestAllVehicles = async () => {
    const fetchedVehicles = await this.props.client.query({
      query: GET_ALL_VEHICLES,
      variables: {
        loginId: getLoginId(),
      },
    })

    this.setState({ vehicles: fetchedVehicles.data.vehicles })
  }

  /**
   * @function
   * @summary Attach alert counts to alert types
   */
  loadToAlertTypes = () => {
    const alertTypesLocal = this.state.alertTypes

    if (this._isMounted === true && alertTypesLocal) {
      alertTypesLocal.forEach((type) => {
        type.alertCount = 0
        // set icon
        type.alertIcon = ALERT_ICONS.find((element) => {
          // console.log('icons', type)
          return element.type === type.alertType
        }).icon
      })

      this.setState({ alertTypes: alertTypesLocal })
    }
  }

  /**
   * @function
   * @summary Filter alert types by selected vehicle
   */
  loadAlertBadges = () => {
    const alertsLocal = this.state.alertCounts
    const alertsTypeLocal = this.state.alertTypes

    if (this._isMounted === true && alertsTypeLocal) {
      alertsTypeLocal.forEach((type) => {
        const filteredAlerts = alertsLocal.filter((alert) => {
          if (this.state.selectedVehicle) {
            return (
              type.alertType === alert.alerttype &&
              alert.view_status === false &&
              this.state.selectedVehicle.deviceDetail.uniqueDeviceId ===
                alert.uniqueid
            )
          } else {
            return (
              type.alertType === alert.alerttype && alert.view_status === false
            )
          }
        })

        if (filteredAlerts) {
          type.alertCount = filteredAlerts.length
        }
      })

      this.setState({ alertTypes: alertsTypeLocal })
    }
  }

  /**
   * @function
   * @summary Fetches all alert types
   */
  requestAllAlertTypes = async () => {
    const alerts = await this.props.client.query({
      query: GET_ALERT_TYPES,
    })

    if (alerts.data && alerts.data.alertTypes) {
      const queryResponse = alerts.data.alertTypes
      const masterAlerts = []

      queryResponse.forEach((item) => {
        if (item.alertType === 'geofence') {
          masterAlerts.push({
            alertDescription: item.alertDescription,
            alertName: item.alertName,
            alertType: 'aoi',
            valueType: item.valueType,
            typename: item.typename,
          })
        } else {
          masterAlerts.push(item)
        }
      })

      this.setState({ alertTypes: masterAlerts })
      this.loadToAlertTypes()
    }

    this.setupPolling()
    this.startPolling()
  }

  updateAlertCounts = async () => {
    const response = await this.props.client.query({
      query: GET_ALL_ALERTS_COUNT,
      variables: {
        clientId: getLoginId(),
        from: this.state.fromTs,
        to: this.state.toTs,
      },
    })

    if (response && response.data && response.data.alerts) {
      this.setState({ alertCounts: response.data.alerts }, () => {
        this.loadAlertBadges()
      })
    }
  }

  /**
   * @function
   * @summary Sets up polling query
   */
  setupPolling = () => {
    this.allAlertsQuery = this.props.client.watchQuery({
      query: GET_ALL_ALERTS_COUNT,
      variables: {
        clientId: getLoginId(),
        from: this.state.fromTs,
        to: this.state.toTs,
      },
      pollInterval: 60000,
    })
  }

  /**
   * @function
   * @summary Start polling all alerts
   */
  startPolling = () => {
    this.allAlertsQuery.subscribe({
      next: (response) => {
        if (response && response.data && response.data.alerts) {
          this.setState({ alertCounts: response.data.alerts }, () => {
            this.loadAlertBadges()
          })
        }
      },
    })
  }

  /**
   * @function
   * @summary Stop polling all queries
   */
  stopPolling = () => {
    if (this.allAlertsQuery) this.allAlertsQuery.stopPolling()
  }

  /**
   * @function
   * @summary React lifecycle method to execute after the component mounts
   */
  componentDidMount = () => {
    this._isMounted = true
    const { fromTs, toTs } = this.calculateRange()

    this.setState({ fromTs, toTs }, () => {
      this.requestAllVehicles()
      this.requestAllAlertTypes()
    })
  }

  /**
   * @function
   * @summary React lifecycle method to execute before the component unmounts
   */
  componentWillUnmount = () => {
    this._isMounted = false
    this.stopPolling()
  }

  /**
   * @callback
   * @summary Callback called on changing the selected vehicle
   */
  handleVehicleChange = (selectedVehicle) => {
    this.setState({ selectedVehicle }, () => {
      this.loadAlertBadges()
      if (this.state.selectedAlert) {
        this.filterAlertsByType(this.state.selectedAlert.alertType)
      }
    })
  }

  /**
   * @function
   * @param {string} alertType The type of the alert to be filtered
   * @summary Filter list of alerts by alert type
   */
  filterAlertsByType = async (alertType) => {
    // set alert table title
    let filteredAlerts = null
    const alertTypeLocal = this.state.alertTypes.find(
      (type) => type.alertType === alertType
    )

    this.setState({
      selectedAlert: alertTypeLocal,
      alertTableTitle: alertTypeLocal.alertName,
      alertTableValues: [],
      isFetchingAlert: true,
    })

    const response = await this.props.client.query({
      query: GET_ALERT_BY_TYPE,
      variables: {
        clientId: getLoginId(),
        alertType: alertTypeLocal.alertType,
        from: this.state.fromTs,
        to: this.state.toTs,
      },
      fetchPolicy: 'network-only',
    })

    if (response.data && response.data.getAllAlertsByAlertType) {
      this.setState(
        {
          alerts: response.data.getAllAlertsByAlertType,
          isFetchingAlert: false,
        },
        () => {
          filteredAlerts = this.state.alerts.filter((alert) => {
            if (this.state.selectedVehicle) {
              return (
                alertType === alert.alerttype &&
                alert.view_status === false &&
                alert.uniqueid ===
                  this.state.selectedVehicle.deviceDetail.uniqueDeviceId
              )
            } else {
              return (
                alertType === alert.alerttype && alert.view_status === false
              )
            }
          })
        }
      )
    }

    this.setState({ alertTableValues: this.sortAlerts(filteredAlerts) })
  }

  /**
   * @function
   * @param {string} uniqueId Vehicle unique ID
   * @returns {object} The vehicle object with the given unique ID
   * @summary Finds the vehicle with the given unique ID and returns it
   */
  getVehicleNumber = (uniqueId) => {
    const vehicle = this.state.vehicles.find(
      (device) => device.deviceDetail.uniqueDeviceId === uniqueId
    )

    if (vehicle) {
      return vehicle.vehicleNumber
    } else {
      return uniqueId
    }
  }

  /**
   * @callback
   * @summary Handle page change in alerts table
   */
  handlePageChange = (pageNumber) => this.setState({ currentPage: pageNumber })

  /**
   * @function
   * @summary Converts the data and downloads as an excel file
   */
  downloadCSV = (rawData, fileName) => {
    const alerts = []
    rawData.forEach((item) => {
      alerts.push({
        Date: moment(parseInt(item.from_ts, 10)).format('lll'),
        Vehicle: this.getVehicleNumber(item.uniqueid),
        Location: item.address,
        Value: item.alertvalue,
        Latitude: item.lat,
        Longitude: item.lng,
      })
    })

    const ws = xlsx.utils.json_to_sheet(alerts)
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
    const excelBuffer = xlsx.write(wb, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: fileType })
    FileSaver.saveAs(data, fileName + fileExtension)
  }

  render() {
    const { classes, selectedLanguage } = this.props

    const {
      alertTypes,
      alertTableValues,
      alertTableTitle,
      isFetchingAlert,
      option,
      from,
      to,
      currentPage,
    } = this.state

    const count = alertTableValues.length
    const fromPage = count === 0 ? 0 : currentPage * ROWS_PER_PAGE + 1
    const toPage = Math.min(count, (currentPage + 1) * ROWS_PER_PAGE)
    const allAlerts = this.state.alertTableValues.slice(
      currentPage * ROWS_PER_PAGE,
      currentPage * ROWS_PER_PAGE + ROWS_PER_PAGE
    )

    return (
      <div className={classes.root}>
        <Grid container spacing={2} alignContent="flex-start">
          <Grid item xs={12}>
            <Grid
              container
              spacing={1}
              justify="space-between"
              alignItems="flex-end"
            >
              <Grid item>
                <Typography variant="h5">
                  {languageJson[selectedLanguage].alertsPage.pageTitle}
                </Typography>
              </Grid>

              <Grid item>
                <ColorButton
                  component={Link}
                  variant="contained"
                  color="primary"
                  to="/home/alerts/configure"
                >
                  {
                    languageJson[selectedLanguage].alertsPage
                      .configurationButtonTitle
                  }
                </ColorButton>
              </Grid>
            </Grid>
            <br />
            <Divider />
          </Grid>

          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} md={12}>
                <Grid container alignItems="flex-end">
                  <Grid item xs={12} md={4} style={{ paddingTop: 20 }}>
                    <ComboBox
                      items={this.state.vehicles || []}
                      selectedItem={this.state.selectedVehicle}
                      onSelectedItemChange={this.handleVehicleChange}
                      placeholder={
                        languageJson[selectedLanguage].common.chooseVehicle
                      }
                      isLoading={false}
                      itemKey="entityId"
                      itemToStringKey="vehicleNumber"
                      filterSize={100}
                    />
                    <br />
                  </Grid>

                  <Grid item xs={12} md={8} style={{ paddingLeft: 20 }}>
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
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Grid container spacing={2}>
                    {alertTypes &&
                      alertTypes.map((alert) => (
                        <Grid item xs={3} key={alert.alertName}>
                          <AlertCard
                            alertName={alert.alertName}
                            alertDescription={alert.alertDescription}
                            cardColor={COLOR_RANGE.sunshine}
                            alertCount={alert.alertCount}
                            filter={() =>
                              this.filterAlertsByType(alert.alertType)
                            }
                            clicked={alert === this.state.selectedAlert}
                            AlertIcon={alert.alertIcon}
                          />
                        </Grid>
                      ))}
                  </Grid>
                </Grid>

                <Grid item xs={12} md={8}>
                  {alertTableTitle && allAlerts ? (
                    !isFetchingAlert ? (
                      <Grid container alignItems="center">
                        <Grid item xs={12}>
                          <Paper>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell colSpan={5}>
                                    <Typography variant="h5">
                                      {' '}
                                      {alertTableTitle}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Tooltip title="Download Excel">
                                      <IconButton
                                        onClick={() =>
                                          this.downloadCSV(
                                            this.state.alertTableValues,
                                            'AlertDetails'
                                          )
                                        }
                                      >
                                        <DownloadIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </TableCell>
                                </TableRow>

                                <TableRow>
                                  <TableCell
                                    size="small"
                                    sortDirection={this.state.order}
                                  >
                                    <TableSortLabel
                                      active={true}
                                      direction={this.state.order}
                                      onClick={this.handleRequestSort}
                                    >
                                      {
                                        languageJson[selectedLanguage]
                                          .alertsPage.alertsTableColumn[0]
                                      }
                                    </TableSortLabel>
                                  </TableCell>

                                  <TableCell size="small">
                                    {
                                      languageJson[selectedLanguage].alertsPage
                                        .alertsTableColumn[1]
                                    }
                                  </TableCell>
                                  <TableCell size="small">
                                    {
                                      languageJson[selectedLanguage].alertsPage
                                        .alertsTableColumn[2]
                                    }
                                  </TableCell>
                                  <TableCell size="small">
                                    {
                                      languageJson[selectedLanguage].alertsPage
                                        .alertsTableColumn[3]
                                    }
                                  </TableCell>
                                  <TableCell size="small">
                                    {
                                      languageJson[selectedLanguage].alertsPage
                                        .alertsTableColumn[4]
                                    }
                                  </TableCell>
                                  <TableCell size="small">
                                    {
                                      languageJson[selectedLanguage].alertsPage
                                        .alertsTableColumn[5]
                                    }
                                  </TableCell>
                                </TableRow>
                              </TableHead>

                              <TableBody>
                                {allAlerts.map((alert, index) => (
                                  <TableRow
                                    hover
                                    className={classes.clickableTableRow}
                                    key={index}
                                  >
                                    <TableCell size="small">
                                      {moment(
                                        parseInt(alert.from_ts, 10)
                                      ).format('lll')}
                                    </TableCell>
                                    <TableCell size="small">
                                      {this.getVehicleNumber(alert.uniqueid)}
                                    </TableCell>
                                    <TableCell size="small">
                                      {alert.address}
                                    </TableCell>
                                    <TableCell size="small">
                                      {alert.alertvalue}
                                    </TableCell>
                                    <TableCell size="small">
                                      {alert.lat}
                                    </TableCell>
                                    <TableCell size="small">
                                      {alert.lng}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            <div className={classes.customFooter}>
                              <IconButton
                                onClick={() => {
                                  this.handlePageChange(currentPage - 1)
                                }}
                                disabled={currentPage === 0}
                              >
                                <ChevronLeftIcon />
                              </IconButton>
                              <Typography variant="caption">{`${fromPage} - ${toPage} of ${count}`}</Typography>
                              <IconButton
                                onClick={() => {
                                  this.handlePageChange(currentPage + 1)
                                }}
                                disabled={
                                  currentPage >=
                                  Math.ceil(count / ROWS_PER_PAGE) - 1
                                }
                              >
                                <ChevronRightIcon />
                              </IconButton>
                            </div>
                          </Paper>
                        </Grid>
                      </Grid>
                    ) : (
                      <CircularProgress />
                    )
                  ) : null}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default () => (
  <Switch>
    <PrivateRoute
      exact
      path="/home/alerts"
      component={withLanguage(
        withSharedSnackbar(withStyles(style)(withApollo(AlertsDashboard)))
      )}
    />
    <PrivateRoute
      exact
      path="/home/alerts/emergency-alerts"
      render={(props) => <EmergencyAlerts {...props} />}
    />
    <PrivateRoute
      exact
      path="/home/alerts/configure"
      render={(props) => <AlertsConfiguration {...props} />}
    />
  </Switch>
)
