import React, { Fragment } from 'react'
import withGoogleMaps from '@zeliot/common/hoc/withGoogleMaps'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import Map from '@zeliot/core/base/modules/TrackingControls/Maps/Map'
import { THEME_MAIN_COLORS } from '@zeliot/common/constants/styles'
import gql from 'graphql-tag'
import { DateTimePicker } from '@material-ui/pickers'
import getLoginId from '@zeliot/common/utils/getLoginId'
import { withApollo } from 'react-apollo'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import DateRangeIcon from '@material-ui/icons/DateRange'
import TimeRangeIcon from '@material-ui/icons/AccessTime'
import iconPathHA from '@zeliot/common/static/png/HA.png'
import iconPathHB from '@zeliot/common/static/png/HB.png'
import iconStartFlag from '@zeliot/common/static/png/start.png'
import iconEndFlag from '@zeliot/common/static/png/stop.png'
import getMultiLine from '@zeliot/core/base/modules/TrackingControls/Maps/Map/MultiLine'
import ActivityList from './ActivityList'
import ActivityCards from './ActivityCards'
import moment from 'moment'
import * as FileSaver from 'file-saver'
import * as XLSX from 'xlsx'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

import {
  Grid,
  Card as Paper,
  withStyles,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from '@material-ui/core'

const GET_ACTIVITY_DETAILS = gql`
  query($uniqueId: String!, $fromTs: String!, $toTs: String!) {
    getAllActivitiesByUniqueId(
      uniqueId: $uniqueId
      fromTs: $fromTs
      toTs: $toTs
    ) {
      clientLoginId
      uniqueId
      vehicleNumber
      fromTs
      toTs
      activity_completed
      startLoc
      endLoc
      startAddress
      endAddress
      totalDist
      totalRunningTime
      totalHaltTime
      totalHaCount
      totalHbCount
      totalIdlingTime
    }
  }
`

const GET_ALL_ACTIVITIES = gql`
  query($clientLoginId: Int!, $period: period, $fromTs: String, $toTs: String) {
    getAllActivitiesByClientLoginId(
      clientLoginId: $clientLoginId
      period: $period
      fromTs: $fromTs
      toTs: $toTs
    ) {
      uniqueId
      vehicleNumber
      fromTs
      toTs
      activity_completed
    }
  }
`

const TRAVEL_REPLAY_PACKETS = gql`
  query(
    $uniqueId: String!
    $from: String!
    $to: String!
    $snapToRoad: Boolean
  ) {
    getTravelHistory(
      uniqueId: $uniqueId
      from: $from
      to: $to
      snapToRoad: $snapToRoad
    ) {
      distanceTravelledKms
      points {
        ts
        lat
        lng
        speed
        isHA
        isHB
        address
      }
    }
  }
`

const styles = (theme) => ({
  reportSelectorItem: {
    paddingBottom: theme.spacing(1),
  },
  formControl: {
    width: theme.spacing(20),
  },
})

let markerAlert = null
let markerStart = null
let markerEnd = null
let markerList = []
let ReplayMultiLine

class ActivityDashboard extends React.Component {
  constructor(props) {
    super(props)
    ReplayMultiLine = getMultiLine(props.google)
  }

  state = {
    map: null,
    dateRangeType: 'day',
    activities: [],
    selectedActivity: null,
    selectedActivityDetails: null,
    fromDate: null,
    toDate: null,
    travelReplayData: null,
    replayMultiLine: null,
    downloadActivityData: [],
  }

  componentDidMount = () => {
    // this.setState({ activities: dummyActivities })
    this.getAllActivities()
  }

  getAllActivities = async () => {
    this.setState({ isReplayLoading: true })
    const response = await this.props.client.query({
      query: GET_ALL_ACTIVITIES,
      variables: {
        clientLoginId: getLoginId(),
        period: this.getEnum(this.state.dateRangeType),
        fromTs: moment(this.state.fromDate).unix().toString(),
        toTs: moment(this.state.toDate).unix().toString(),
      },
    })
    if (response.data) {
      // console.log('all data', response.data.getAllActivitiesByClientLoginId)
      this.setState(
        {
          activities: response.data.getAllActivitiesByClientLoginId,
        },
        () => {
          this.mapActivityData()
        }
      )
    }
    this.setState({ isReplayLoading: false })
  }

  mapActivityData = () => {
    const { activities } = this.state
    const reducedData = activities
      .reduce((acc, item) => {
        const tempObj = {}
        tempObj.vehicleNumber = item.vehicleNumber
        tempObj.fromTs = moment.unix(parseInt(item.fromTs, 10)).format('LLL')
        tempObj.toTs = moment.unix(parseInt(item.toTs, 10)).format('LLL')
        acc.push(tempObj)
        return acc
      }, [])
      .sort((a, b) => {
        const aD = parseInt(moment(a.fromTs).unix(), 10)
        const bD = parseInt(moment(b.fromTs).unix(), 10)
        return aD - bD
      })
    // console.log(reducedData)
    return reducedData
  }

  getDate = () => {
    const { dateRangeType, fromDate, toDate } = this.state
    let tDate = ''
    let fDate = ''
    if (dateRangeType === 'day') {
      fDate = moment().subtract(1, 'day').format('L')
      tDate = moment().format('L')
    } else if (dateRangeType === 'week') {
      fDate = moment().subtract(7, 'day').format('L')
      tDate = moment().format('L')
    } else if (dateRangeType === 'month') {
      fDate = moment().subtract(1, 'month').add(1, 'day').format('L')
      tDate = moment().format('L')
    } else if (dateRangeType === 'custom') {
      fDate = moment.unix(parseInt(fromDate, 10)).format('L')
      tDate = moment.unix(parseInt(toDate, 10)).format('L')
    }
    return fDate + ' - ' + tDate
  }

  exportTOXLS = (downloadData, fileName) => {
    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    const fileExtension = '.xlsx'
    const ws = XLSX.utils.json_to_sheet(downloadData)
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: fileType })
    FileSaver.saveAs(data, fileName + fileExtension)
  }

  downloadExcelSheet = () => {
    const activityData = this.mapActivityData()
    const date = this.getDate()
    const fileName = 'ActivityData_' + date
    this.exportTOXLS(activityData, fileName)
    // console.log('download', activityData)
  }

  getEnum = (range) => {
    if (range === 'day') {
      return 'DAY'
    } else if (range === 'week') {
      return 'WEEK'
    } else if (range === 'month') {
      return 'MONTH'
    } else if (range === 'custom') {
      return null
    }
  }

  setMap = (map) =>
    this.setState({ map }, () =>
      this.setState({ replayMultiLine: new ReplayMultiLine(this.state.map) })
    )

  handleChange = (e) => {
    // console.log('Menu item', e.target.name, e.target.value)
    this.handleClearVariables()
    this.setState({ dateRangeType: e.target.value }, () => {
      if (this.state.dateRangeType !== 'custom') this.getAllActivities()
    })
  }

  handleActivityChange = (selectedActivity) => {
    this.handleClearVariables()
    this.setState({ selectedActivity }, () => {
      this.getSelectedActivityDetails()
      // this.setState({ selectedActivityDetails: dummyActivities[0] })
      this.fetchReplayPackets()
    })
  }

  handleClearVariables = () => {
    this.clearMarkers()
    if (this.state.replayMultiLine instanceof ReplayMultiLine) {
      this.state.replayMultiLine.remove()
    }
    this.setState({ selectedActivity: null, selectedActivityDetails: null })
  }

  getSelectedActivityDetails = async () => {
    const response = await this.props.client.query({
      query: GET_ACTIVITY_DETAILS,
      variables: {
        uniqueId: this.state.selectedActivity.uniqueId,
        fromTs: this.state.selectedActivity.fromTs,
        toTs: this.state.selectedActivity.toTs,
      },
    })
    if (response.data) {
      // console.log('activity data', response.data.getAllActivitiesByUniqueId)
      this.setState({
        selectedActivityDetails: response.data.getAllActivitiesByUniqueId[0],
      })
    }
  }

  fetchReplayPackets = async () => {
    this.setState({ isReplayLoading: true })
    const localResponse = await this.props.client.query({
      query: TRAVEL_REPLAY_PACKETS,
      variables: {
        uniqueId: this.state.selectedActivity.uniqueId,
        from: this.state.selectedActivity.fromTs,
        to: this.state.selectedActivity.toTs,
        snapToRoad: true,
      },
    })
    if (localResponse.data && localResponse.data.getTravelHistory) {
      const data = localResponse.data.getTravelHistory.points
      console.log('replay data', data)
      const distanceCovered =
        localResponse.data.getTravelHistory.distanceTravelledKms
      const localReplayCount = data.length
      if (localReplayCount < 2) {
        this.props.openSnackbar('No data available for selected duration.')
      } else {
        this.setState({
          travelReplayData: {
            response: data,
            distanceTravelled: distanceCovered,
          },
        })
        this.drawMarker()
        this.drawReplayMultiline()
      }
      this.setState({ isReplayLoading: false })
    } else {
      this.props.openSnackbar('Failed to fetch data.')
      this.setState({ isReplayLoading: false })
    }
  }

  drawMarker = () => {
    const data = this.state.travelReplayData.response
    // let startPoint = new this.props.google.maps.LatLng({
    //   lat: this.state.travelReplayData.response[0].lat,
    //   lng: this.state.travelReplayData.response[0].lng
    // })

    const bounds = new this.props.google.maps.LatLngBounds()
    data.forEach((index) => {
      const extendPoints = new this.props.google.maps.LatLng({
        lat: index.lat,
        lng: index.lng,
      })
      bounds.extend(extendPoints)
    })

    this.state.map.fitBounds(bounds)

    // markerInstance.setPosition(startPoint)
    // this.markerCluster.addMarker(markerInstance)
  }

  drawReplayMultiline = () => {
    // Plot multiline on map
    let i = 0

    if (this.state.replayMultiLine instanceof ReplayMultiLine) {
      this.state.replayMultiLine.remove()
    }

    const length = this.state.travelReplayData.response.length
    const startPoint = {
      lat: this.state.travelReplayData.response[0].lat,
      lng: this.state.travelReplayData.response[0].lng,
    }
    const endPoint = {
      lat: this.state.travelReplayData.response[length - 1].lat,
      lng: this.state.travelReplayData.response[length - 1].lng,
    }

    const iconHA = {
      url: iconPathHA,
      scaledSize: new this.props.google.maps.Size(30, 30),
    }
    const iconHB = {
      url: iconPathHB,
      scaledSize: new this.props.google.maps.Size(30, 30),
    }
    const startFlag = {
      url: iconStartFlag,
      scaledSize: new this.props.google.maps.Size(30, 30),
      anchor: new this.props.google.maps.Point(0, 30),
    }
    const endFlag = {
      url: iconEndFlag,
      scaledSize: new this.props.google.maps.Size(30, 30),
      anchor: new this.props.google.maps.Point(0, 30),
    }
    // console.log('replay object', this.state.replayMultiLine)
    while (i < length) {
      const point = new this.props.google.maps.LatLng({
        lat: this.state.travelReplayData.response[i].lat,
        lng: this.state.travelReplayData.response[i].lng,
      })
      this.state.replayMultiLine.addPoint(
        point,
        false,
        THEME_MAIN_COLORS.mainBlue
      )

      markerStart = new this.props.google.maps.Marker({
        position: startPoint,
        icon: startFlag,
        map: this.state.map,
      })

      markerEnd = new this.props.google.maps.Marker({
        position: endPoint,
        icon: endFlag,
        map: this.state.map,
      })

      if (this.state.travelReplayData.response[i].isHA) {
        markerAlert = new this.props.google.maps.Marker({
          position: point,
          icon: iconHA,
          map: this.state.map,
        })
      } else if (this.state.travelReplayData.response[i].isHB) {
        markerAlert = new this.props.google.maps.Marker({
          position: point,
          icon: iconHB,
          map: this.state.map,
        })
      }

      markerList.push(markerStart)
      markerList.push(markerEnd)
      if (markerAlert !== null) {
        markerList.push(markerAlert)
      }
      i++
    }
  }

  handleDateChange = (dateType) => (date) => {
    this.setState({
      [dateType]: date,
    })
  }

  clearMarkers() {
    if (markerList.length > 0) {
      for (var i = 0; i < markerList.length; i++) {
        markerList[i].setMap(null)
      }
      markerList = []
    }
  }

  render() {
    const { google, classes, selectedLanguage } = this.props

    return (
      <Grid container className={classes.root} spacing={2}>
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <Grid container alignItems="center" justify="flex-start" spacing={1}>
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
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
                    {languageJson[selectedLanguage].common.dateFilter.lastWeek}
                  </MenuItem>
                  <MenuItem value="month">
                    {languageJson[selectedLanguage].common.dateFilter.lastMonth}
                  </MenuItem>
                  <MenuItem value="custom">
                    {
                      languageJson[selectedLanguage].common.dateFilter
                        .customRange
                    }
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {this.state.dateRangeType === 'custom' && (
              <Fragment>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={3}
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
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={3}
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
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={3}
                  lg={2}
                  className={classes.reportSelectorItem}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={this.getAllActivities}
                  >
                    {
                      languageJson[selectedLanguage].activityPage
                        .generateButtonTitle
                    }
                  </Button>
                </Grid>
              </Fragment>
            )}
            <Grid item md={2} lg={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={this.downloadExcelSheet}
              >
                {
                  languageJson[selectedLanguage].activityPage
                    .downloadButtonTitle
                }
              </Button>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} sm={12} md={12} lg={12}>
          <Grid container>
            <Grid item xs={12} md={5} lg={5}>
              <Paper
                square
                elevation={8}
                style={{ height: '450px', overflow: 'auto', padding: 10 }}
              >
                <ActivityList
                  activities={this.state.activities}
                  selectedActivity={this.state.selectedActivity}
                  onActivityChange={this.handleActivityChange}
                  dataLoading={this.state.isReplayLoading}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={7} lg={7}>
              <Map google={google} setMap={this.setMap} zoom={6} />
            </Grid>
          </Grid>
        </Grid>

        {this.state.selectedActivityDetails && (
          <Grid item xs={12} sm={12} md={12} lg={12}>
            <ActivityCards
              selectedActivityDetails={this.state.selectedActivityDetails}
            />
          </Grid>
        )}
      </Grid>
    )
  }
}

export default withApollo(
  withLanguage(
    withGoogleMaps(withSharedSnackbar(withStyles(styles)(ActivityDashboard)))
  )
)
