import React from 'react'
import gql from 'graphql-tag'
import getUnixString from '@zeliot/common/utils/time/getUnixString'
import moment from 'moment'
import Button from '@material-ui/core/Button'
// import GraphPlotter from '../../pages/OBD/VehicleHealth/Graphs/GraphPlotter'
import ComboBox from '@zeliot/common/ui/ComboBox'
import getLoginId from '@zeliot/common/utils/getLoginId'
import { withApollo } from 'react-apollo'
import CustomDatePicker from '@zeliot/common/ui/DatePicker'
import TempPressureGraph from '@zeliot/core/base/pages/OBD/VehicleHealth/Graphs/GraphPlotter/Graphs/TempPressureGraph'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import SimpleTable from '@zeliot/common/ui/SimpleTable'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import { MENU_DRAWER_WIDTH } from '@zeliot/common/constants/styles'

import {
  Grid,
  Typography,
  withStyles,
  CircularProgress
} from '@material-ui/core'

// const MULTI_LINE_DATA = gql`
//   query(
//     $clientId: Int!
//     $reportName: String!
//     $uniqueId: String!
//     $start_ts: String!
//     $end_ts: String!
//   ) {
//     obdData: getCategoryOneReport(
//       clientLoginId: $clientId
//       customReportName: $reportName
//       uniqueId: $uniqueId
//       start_ts: $start_ts
//       end_ts: $end_ts
//     ) {
//       dateTime
//       tire_temperature
//       tire_pressure
//       axle_position
//       tire_position
//       tire_air_leakage_rate
//       tire_sensor_enable_status
//       tire_status
//       tire_sensor_electric_fault
//       extended_tire_pressure_support
//       tire_pressure_threshold_detection
//       extended_tire_pressure
//       cpc_system_type
//       required_tire_pressure
//       cpc_tire_id
//       cpc_graphical_position
//       cpc_tire_location
//       cpc_ttm_id
//     }
//   }
// `

const MULTI_LINE_DATA = gql`
  query(
    $clientId: Int!
    $reportName: String!
    $uniqueId: String!
    $start_ts: String!
    $end_ts: String!
    $category: Int!
  ) {
    obdData: getReportPagination(
      clientLoginId: $clientId
      customReportName: $reportName
      uniqueId: $uniqueId
      start_ts: $start_ts
      end_ts: $end_ts
      category: $category
    ) {
      categoryOneFields {
        dateTime
        tire_temperature
        tire_pressure
        axle_position
        tire_position
        tire_air_leakage_rate
        tire_sensor_enable_status
        tire_status
        tire_sensor_electric_fault
        extended_tire_pressure_support
        tire_pressure_threshold_detection
        extended_tire_pressure
        cpc_system_type
        required_tire_pressure
        cpc_tire_id
        cpc_graphical_position
        cpc_tire_location
        cpc_ttm_id
      }
      end_ts
      continue_flag
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

const GET_ALERTS = gql`
  query($from: String!, $to: String!) {
    getTPMSalerts(from_ts: $from, to_ts: $to) {
      ts
      vehicleNumber
      temperature
      pressure
      alertName
    }
  }
`

const GET_AGGREGATIONS = gql`
  query($from: String!, $to: String!) {
    getTPMSaggregates(from_ts: $from, to_ts: $to) {
      date
      no_warn
      under_pressure
      extreme_under_pressure
    }
  }
`

const pidList = ['tire_temperature', 'tire_pressure']
const alertTableKeys = [
  'vehicleNumber',
  'ts',
  'alertName',
  'pressure',
  'temperature'
]
const alertTableHeaders = [
  'VehicleNumber',
  'Time',
  'Alert Name',
  'Pressure (psi)',
  'Temperature (deg C)'
]
const obdTableKeys = [
  'dateTime',
  'axle_position',
  'tire_position',
  'tire_temperature',
  'tire_pressure',
  'tire_air_leakage_rate',
  'tire_sensor_enable_status',
  'tire_status',
  'tire_sensor_electric_fault',
  'extended_tire_pressure_support',
  'tire_pressure_threshold_detection',
  'extended_tire_pressure',
  'cpc_system_type',
  'required_tire_pressure',
  'cpc_tire_id',
  'cpc_graphical_position',
  'cpc_tire_location',
  'cpc_ttm_id'
]
const obdTableHeaders = [
  'Time',
  'Axle position',
  'Tire position',
  'Temperature (deg C)',
  'Pressure (psi)',
  'Tire air leakage rate',
  'Tire sensor enable status',
  'Tire status',
  'Tire sensor electric fault',
  'Extended tire pressure support',
  'Tire pressure threshold detection',
  'Extended tire pressure',
  'CPC system type',
  'Required tire pressure',
  'CPC tire id',
  'CPC graphical position',
  'CPC tire location',
  'CPC TTM id'
]
const barStack = [
  {
    key: 'ok',
    fill: '#00FF00'
  },
  {
    key: 'under_pressure',
    fill: 'yellow'
  },
  {
    key: 'extreme_under_pressure',
    fill: '#FA8072'
  }
]

let data = []
let tableData = []

const styles = () => ({
  itemContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    border: '1px solid lightgray',
    padding: 10,
    margin: 5
  }
})

class ContinentalDashboard extends React.Component {
  state = {
    selectedVehicle: null,
    vehicles: [],
    from: null,
    to: null,
    alertFrom: null,
    alertTo: null,
    barFrom: null,
    barTo: null,
    option: 'HOUR',
    alertOption: 'HOUR',
    barOption: 'HOUR',
    fromTs: null,
    toTs: null,
    alertFromTs: null,
    alertToTs: null,
    barFromTs: null,
    batToTs: null,
    data: [],
    allAlerts: null,
    pressureAggregations: null,
    obdDataQueryActive: false,
    alertQueryActive: false,
    aggregationQueryActive: false,
    tableData: [],
    isDataAvailable: true,
    lastRecordTimestamp: null
  }

  componentDidMount = () => {
    this.lastFetchedDataLength = 0
    this.fetchAllVehicles()
    this.handleAlertSubmit()
    this.handleBarSubmit()
  }

  fetchAllVehicles = async () => {
    const fetchedVehicles = await this.props.client.query({
      query: GET_ALL_VEHICLES,
      variables: {
        loginId: getLoginId()
      }
    })
    if (fetchedVehicles.data && fetchedVehicles.data.vehicles) {
      this.setState({ vehicles: fetchedVehicles.data.vehicles })
    }
  }

  fetchDataInRange = async () => {
    if (this.state.isDataAvailable) {
      this.setState({ obdDataQueryActive: true })
      const response = await this.props.client.query({
        query: MULTI_LINE_DATA,
        variables: {
          clientId: getLoginId(),
          reportName: 'Customized PGN Report',
          uniqueId: this.state.selectedVehicle.uniqueId,
          start_ts: this.state.lastRecordTimestamp.toString(),
          end_ts: (this.state.toTs * 1000).toString(),
          category: 1
        }
      })
      if (response.data && response.data.obdData) {
        this.setState({
          lastRecordTimestamp: response.data.obdData.end_ts,
          isDataAvailable: response.data.obdData.continue_flag
        })
        let fetchedDataCount = 0
        data = []
        tableData = []
        const rawData = response.data.obdData.categoryOneFields
        rawData.forEach(item => {
          if (
            item.tire_temperature &&
            item.tire_pressure &&
            item.tire_temperature !== '-99999' &&
            item.tire_pressure !== '-99999'
          ) {
            data.push({
              dateTime: item.dateTime,
              tire_pressure: item.tire_pressure,
              tire_temperature: item.tire_temperature
            })
            tableData.push({
              ...item,
              dateTime: moment(Number(item.dateTime)).format(
                'Do MMM YYYY hh:mm:ss:SSS'
              )
            })
            fetchedDataCount++
          }
        })
        if (fetchedDataCount) {
          this.setState({
            data: [...this.state.data, ...data],
            tableData: [...tableData.reverse(), ...this.state.tableData]
          })
        }
        if (this.state.tableData.length - this.lastFetchedDataLength < 25) {
          console.log('records fetched if', tableData.length)
          setTimeout(async () => await this.fetchDataInRange(), 200)
        } else {
          console.log('records fetched else', tableData.length)
          this.setState({ obdDataQueryActive: false })
        }
      } else {
        this.props.openSnackbar("No data available!")
        this.setState({ obdDataQueryActive: false })
      }
    }
  }

  getAlerts = async () => {
    this.setState({ alertQueryActive: true })
    const response = await this.props.client.query({
      query: GET_ALERTS,
      variables: {
        from: (this.state.alertFromTs * 1000).toString(),
        to: (this.state.alertToTs * 1000).toString()
      }
    })
    if (response.data && response.data.getTPMSalerts) {
      const allAlerts = []
      const data = response.data.getTPMSalerts
      data.forEach(item => {
        allAlerts.push({
          ...item,
          ts: moment(parseInt(item.ts, 10)).format('Do MMM YYYY hh:mm:ss:SSS')
        })
      })
      this.setState({ allAlerts })
    } else {
      this.props.openSnackbar("No data available!")
    }
    this.setState({ alertQueryActive: false })
  }

  getAggregations = async () => {
    this.setState({ aggregationQueryActive: true })
    const response = await this.props.client.query({
      query: GET_AGGREGATIONS,
      variables: {
        from: (this.state.barFromTs * 1000).toString(),
        to: (this.state.barToTs * 1000).toString()
      }
    })
    if (response.data && response.data.getTPMSaggregates) {
      const data = response.data.getTPMSaggregates
      const pressureAggregations = []
      data.forEach(item => {
        if (
          item.no_warn !== '0' &&
          item.under_pressure !== '0' &&
          item.extreme_under_pressure !== '0'
        ) {
          pressureAggregations.push({
            date: item.date,
            ok: item.no_warn,
            under_pressure: item.under_pressure,
            extreme_under_pressure: item.extreme_under_pressure
          })
        }
      })
      this.setState({ pressureAggregations })
    } else {
      this.props.openSnackbar("No data available!")
    }
    this.setState({ aggregationQueryActive: false })
  }

  handleOptionChange = e => {
    this.setState({ option: e.target.value })
  }

  handleAlertOptionChange = e => {
    this.setState({ alertOption: e.target.value })
  }

  handleBarOptionChange = e => {
    this.setState({ barOption: e.target.value })
  }

  handleDateTimeChange = dateType => dateTime =>
    this.setState({
      [dateType]: dateTime
    })

  handleAlertDateTimeChange = dataType => dateTime =>
    this.setState({
      [dataType === 'from' ? 'alertFrom' : 'alertTo']: dateTime
    })

  handleBarDateTimeChange = dataType => dateTime =>
    this.setState({
      [dataType === 'from' ? 'barFrom' : 'barTo']: dateTime
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
      fromTs = fromTs ? getUnixString(moment(fromTs)) : null
      toTs = toTs ? getUnixString(moment(toTs)) : null

      this.setState(
        { fromTs, toTs, lastRecordTimestamp: fromTs * 1000 },
        () => {
          this.lastFetchedDataLength = this.state.tableData.length
          this.fetchDataInRange()
        }
      )
    } else {
      this.props.openSnackbar('Please choose all fields')
    }
  }

  handleAlertSubmit = () => {
    if (
      this.state.alertOption && this.state.alertOption === 'CUSTOM'
        ? this.state.alertFrom && this.state.alertTo
        : true
    ) {
      let fromTs
      let toTs = moment.now()
      switch (this.state.alertOption) {
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
          fromTs = this.state.alertFrom
          toTs = this.state.alertTo
      }
      fromTs = fromTs ? getUnixString(moment(fromTs)) : null
      toTs = toTs ? getUnixString(moment(toTs)) : null

      this.setState({ alertFromTs: fromTs, alertToTs: toTs }, () => {
        this.getAlerts()
      })
    } else {
      this.props.openSnackbar('Please choose all fields')
    }
  }

  handleBarSubmit = () => {
    if (
      this.state.barOption && this.state.barOption === 'CUSTOM'
        ? this.state.barFrom && this.state.barTo
        : true
    ) {
      let fromTs
      let toTs = moment.now()
      switch (this.state.barOption) {
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
          fromTs = this.state.barFrom
          toTs = this.state.barTo
      }
      fromTs = fromTs ? getUnixString(moment(fromTs)) : null
      toTs = toTs ? getUnixString(moment(toTs)) : null

      this.setState({ barFromTs: fromTs, barToTs: toTs }, () => {
        this.getAggregations()
      })
    } else {
      this.props.openSnackbar('Please choose all fields')
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
        data: [],
        tableData: []
      })
    }
  }

  render() {
    const {
      option,
      alertOption,
      from,
      to,
      alertFrom,
      alertTo,
      barFrom,
      barTo,
      vehicles,
      selectedVehicle,
      fromTs,
      toTs,
      data,
      allAlerts,
      barOption,
      pressureAggregations,
      obdDataQueryActive,
      alertQueryActive,
      aggregationQueryActive,
      tableData
    } = this.state
    const { classes } = this.props
    const screenWidth = window.innerWidth

    return (
      <Grid container spacing={2} style={{ padding: 10 }}>
        <Grid item xs={12} className={classes.itemContainer}>
          <Grid container justify="space-between" alignItems="center">
            <Grid item xs={12} style={{ padding: 10 }}>
              <Typography variant="button" color="primary" align="center">
                Generated alerts
              </Typography>
            </Grid>

            <Grid item xs={12} style={{ marginBottom: 10 }}>
              <CustomDatePicker
                option={alertOption}
                from={alertFrom}
                to={alertTo}
                onOptionChange={this.handleAlertOptionChange}
                onDateChange={this.handleAlertDateTimeChange}
                onSubmit={this.handleAlertSubmit}
              />
            </Grid>
            <Grid item xs={12}>
              {allAlerts && allAlerts.length === 0 && (
                <Typography color="error">
                  No data available for this duration. Please try different
                  dates
                </Typography>
              )}
              {allAlerts && allAlerts.length > 0 && (
                <SimpleTable
                  data={allAlerts}
                  headers={alertTableHeaders}
                  keys={alertTableKeys}
                  ROWS_PER_PAGE={5}
                  searchLabel="vehicleNumber"
                />
              )}
            </Grid>
            {alertQueryActive && (
              <Grid item>
                <CircularProgress />
              </Grid>
            )}
          </Grid>
        </Grid>

        <Grid item xs={12} className={classes.itemContainer}>
          <Grid container justify="space-between" alignItems="center">
            <Grid item xs={12} style={{ padding: 10 }}>
              <Typography variant="button" color="primary" align="center">
                TPMS Data Snapshot
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
            <Grid item xs={6} style={{ marginBottom: 10 }}>
              <CustomDatePicker
                option={option}
                from={from}
                to={to}
                onOptionChange={this.handleOptionChange}
                onDateChange={this.handleDateTimeChange}
                onSubmit={this.handleSubmit}
              />
            </Grid>
          </Grid>
          <Grid container alignitems="center">
            {fromTs && toTs && data && data.length > 0 && (
              <div>
                <Grid item xs={12} style={{ padding: 10 }}>
                  <Typography
                    variant="subtitle2"
                    // color="primary"
                    align="center"
                  >
                    Tire pressure and temperature relationship
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TempPressureGraph
                    data={data}
                    pidList={pidList}
                    isMultiSecond={true}
                  />
                </Grid>
                <br />
                <Grid item xs={12} style={{ padding: 10 }}>
                  <Typography
                    variant="subtitle2"
                    // color="primary"
                    align="center"
                  >
                    Parsed PGN data
                  </Typography>
                </Grid>
                {tableData && tableData.length > 0 && (
                  <Grid
                    item
                    // xs={12}
                    style={{
                      overflow: 'auto',
                      width: screenWidth - MENU_DRAWER_WIDTH // buffer
                    }}
                  >
                    <SimpleTable
                      data={tableData}
                      headers={obdTableHeaders}
                      keys={obdTableKeys}
                      ROWS_PER_PAGE={5}
                    />
                  </Grid>
                )}
                <Grid item style={{ padding: 10 }}>
                  <Button
                    color="primary"
                    variant="outlined"
                    onClick={() => {
                      this.lastFetchedDataLength = this.state.tableData.length
                      this.fetchDataInRange()
                    }}
                    disabled={this.state.obdDataQueryActive}
                  >
                    LOAD MORE
                  </Button>
                </Grid>
              </div>
            )}
            {obdDataQueryActive && (
              <Grid item>
                <CircularProgress />
              </Grid>
            )}
          </Grid>
          {data && data.length === 0 && (
            <Grid container>
              <Grid item>
                <Typography color="error">
                  No data available for this duration. Please try different
                  dates
                </Typography>
              </Grid>
            </Grid>
          )}
        </Grid>

        <Grid item xs={12} className={classes.itemContainer}>
          <Grid container justify="space-between" alignItems="center">
            <Grid item xs={12} style={{ padding: 10 }}>
              <Typography variant="button" color="primary" align="center">
                Tire pressure aggregations
              </Typography>
            </Grid>
            <Grid item xs={12} style={{ marginBottom: 10 }}>
              <CustomDatePicker
                option={barOption}
                from={barFrom}
                to={barTo}
                onOptionChange={this.handleBarOptionChange}
                onDateChange={this.handleBarDateTimeChange}
                onSubmit={this.handleBarSubmit}
              />
            </Grid>
            <Grid item>
              {pressureAggregations && pressureAggregations.length > 0 && (
                <MultiBar
                  data={pressureAggregations}
                  stack={barStack}
                  xAxisKey={'date'}
                  XAxisLabel="Date"
                  YAxisLabel="% Pressure"
                />
              )}
            </Grid>
            {aggregationQueryActive && (
              <Grid item>
                <CircularProgress />
              </Grid>
            )}
          </Grid>
          {pressureAggregations && pressureAggregations.length === 0 && (
            <Grid container>
              <Grid item>
                <Typography color="error">
                  No data available for this duration. Please try different
                  dates
                </Typography>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    )
  }
}

export default withSharedSnackbar(
  withApollo(withStyles(styles)(ContinentalDashboard))
)

export class MultiBar extends React.PureComponent {
  render() {
    const { data, stack, xAxisKey, XAxisLabel, YAxisLabel } = this.props
    return (
      <BarChart
        width={600}
        height={300}
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={xAxisKey}
          label={{
            value: XAxisLabel,
            position: 'insideBottomRight',
            offset: -15
          }}
        ></XAxis>
        <YAxis
          label={{ value: YAxisLabel, angle: -90, position: 'insideLeft' }}
        ></YAxis>
        <Tooltip />
        <Legend />
        {stack &&
          stack.map((item, index) => (
            <Bar key={index} dataKey={item.key} stackId="a" fill={item.fill} />
          ))}
      </BarChart>
    )
  }
}
