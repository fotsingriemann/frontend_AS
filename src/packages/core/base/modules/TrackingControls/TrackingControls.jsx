import React, { Component } from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import moment from 'moment'
import { Switch, Link } from 'react-router-dom'
import {
  Slider,
  Grid,
  withStyles,
  Button,
  Tooltip,
  Divider,
  Typography,
  Paper,
} from '@material-ui/core'
import { point, lineString } from '@turf/helpers'
import nearestPointOnLine from '@turf/nearest-point-on-line'
import withGoogleMaps from '@zeliot/common/hoc/withGoogleMaps'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import { REPLAY_DURATION } from '@zeliot/common/constants/others'
import {
  TRAVEL_REPLAY_PACKETS,
  GET_ALL_DEVICES,
} from '@zeliot/common/graphql/queries'
import { DEVICE_LOCATION } from '@zeliot/common/graphql/subscriptions'
import iconPathHA from '@zeliot/common/static/png/HA.png'
import iconPathHB from '@zeliot/common/static/png/HB.png'
import iconStartFlag from '@zeliot/common/static/png/start.png'
import iconEndFlag from '@zeliot/common/static/png/stop.png'
import MarkerClusterer from '@google/markerclusterer'
import clusterIcon from '@zeliot/common/static/png/cluster-blue.png'
import getLoginId from '@zeliot/common/utils/getLoginId'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import { PrivateRoute } from '@zeliot/common/router'
import MapTabView from './MapTabView'
import Map from './Maps/Map'
import getCustomMarker from './Maps/Map/CustomMarker'
import getCustomPopup from './Maps/Map/CustomPopup'
import MapSideBar from './MapSideBar'
import getMultiLine from './Maps/Map/MultiLine'
import ReplayControlPanel from './ReplayControlPanel'
import PlaceSearcher from './PlaceSearcher/'
import CurrentTrackinfo from './CurrentTrackinfo'
import CurrentSummary from './CurrentSummary'
// import StatCard from './StatCard/StatCard'
import VehicleStats from './VehicleStats/VehicleStats'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

const GET_ALL_GROUPS = gql`
  query {
    getAllGroups {
      id
      groupName
      assignedVehicles {
        vehicleNumber
      }
    }
  }
`

const GET_DRIVER_DETAILS = gql`
  query getDriverDetails($uniqueDeviceId: String) {
    getDriverDetails(uniqueDeviceId: $uniqueDeviceId) {
      driverName
      contactNumber
      driverImage
      rfid
    }
  }
`
const GET_VEHICLE_DETAILS = gql`
  query getVehicleDetail($vehicleNumber: String) {
    getVehicleDetail(vehicleNumber: $vehicleNumber) {
      device {
        imei_num
      }
    }
  }
`
const GET_DRIVER_DETAILS_BY_IMEI_RFID = gql`
  query findDriverDetailsByImeiAndRfid($imei: String!, $rfid: String) {
    findDriverDetailsByImeiAndRfid(imei: $imei, rfid: $rfid) {
      data {
        image
        name
        phone
      }
    }
  }
`

const style = (theme) => ({
  paper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  mapReplayControl: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    width: '90%',
    pointerEvents: 'none',
  },
  catchAllEvents: {
    pointerEvents: 'all',
  },
  placeSearcher: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  topPadding: {
    paddingTop: theme.spacing(2),
  },
  bottomButtonsContainer: {
    padding: theme.spacing(2),
  },
  bottomButtons: {
    fontSize: 10,
    padding: theme.spacing(1),
  },
  centralContainer: {
    padding: theme.spacing(4),
  },
})

let loop = null
let markerInstance = null
let markerAlert = null
let markerStart = null
let markerEnd = null
let markerList = []

let count = 0
let indexGraph = 0
let isAnimationActive = false

const defaultZoom = 6

let CustomMarker
let CustomPopup
let MultiLine
let ReplayMultiLine
let sliderTitle = ''

class TrackingControls extends Component {
  constructor(props) {
    super(props)
    CustomMarker = getCustomMarker(props.google)
    CustomPopup = getCustomPopup(props.google)
    this.customPopup = new CustomPopup()
    MultiLine = getMultiLine(props.google, { clickable: false })
    ReplayMultiLine = getMultiLine(props.google)
  }

  state = {
    filteredVehicles: {},
    markerFilter: 'TRACKING',
    selectedTab: 'overview',
    vehicles: {},
    selectedVehicle: null,
    fromDate: null,
    toDate: null,
    sliderValue: 0,
    interval: REPLAY_DURATION,
    isPause: false,
    replaySpeed: 8,
    isReplayActive: false,
    travelReplayData: {},
    liveData: {},
    markers: {},
    multiLine: null,
    replayMultiLine: null,
    map: null,
    isTravelReplayDataLoading: false,
    stats: null,
    showTrackingStats: false,
    replayDuration: 0,
    isSpeedGraphAnimationLive: false,
    liveSpeed: 0,
    graphIndex: 0,
    order: 'desc',
    snapToRoad: false,
    snapToRoadToggleScheduled: false,
    selected: [],
    allGroups: [],
    isGroupSearchActive: false,
    selectedGroup: null,
    driverName: null,
    driverContactNo: null,
    driverImage: null,
    fetchedImeiNumber: null,
    fetchedRfidNumber: null,
  }

  getAllGroups = async () => {
    let response = await this.props.client.query({
      query: GET_ALL_GROUPS,
    })
    if (response.data && response.data.getAllGroups) {
      this.setState({ allGroups: response.data.getAllGroups })
    }
  }

  handleSelectedVehicleChange = (value) => {
    if (value) {
      const selectedTab =
        this.state.selectedTab === 'overview' ? 'live' : this.state.selectedTab

      this.handleSelectedTabChange(selectedTab, () =>
        this.setState(
          {
            selectedVehicle: value,
            driverName: null,
            driverContactNo: null,
            driverImage: null,
          },
          this.goToLiveTrackingMode
        )
      )
    } else {
      this.handleSelectedTabChange('overview', () =>
        this.setState(
          {
            selectedVehicle: value,
          },
          this.goToOverviewMode
        )
      )
    }
  }

  handleDateChange = (key, date) => {
    if (!date) {
      this.setState({ [key]: date })
    } else {
      if (key === 'fromDate') {
        const now = moment()
        const dateDiff = (now - date) / 3600000

        if (dateDiff > 24) {
          this.setState({ toDate: moment(date).add(24, 'hours') })
        } else {
          this.setState({ toDate: now })
        }
        this.setState({ [key]: date })
      } else {
        if (!this.state.fromDate) {
          this.setState({
            fromDate: moment(date).subtract(24, 'hours'),
            [key]: date,
          })
        } else {
          const diff = (date - this.state.fromDate) / 3600000
          if (diff > 0 && diff < 24) {
            this.setState({ [key]: date })
          } else {
            this.setState({
              fromDate: moment(date).subtract(24, 'hours'),
              [key]: date,
            })
          }
        }
      }
    }
  }

  handleSliderChange = (value) => {
    let sliderIndex = 0
    if (this.state.travelReplayData.response) {
      sliderIndex = parseInt(value / this.state.travelReplayData.step, 10)

      if (sliderIndex < this.state.travelReplayData.replayCount) {
        sliderTitle = getFormattedTime(
          this.state.travelReplayData.response[sliderIndex].ts,
          'Do MMM YYYY h:mm:ss A'
        )
      }
    }

    this.setState({ sliderValue: value })
  }

  handlePlayPauseChange = (isPause) =>
    this.setState({ isPause }, () => {
      this.getInterval(this.state.replaySpeed)
      this.replayControls()
    })

  handleIntervalChange = (interval, replaySpeed) =>
    this.setState({ interval, replaySpeed })

  handleReplayStatus = (status) => {
    this.setState({
      isReplayActive: status,
      showTrackingStats: false,
    })

    // Clear multiline and markers
    if (this.state.multiLine instanceof MultiLine) {
      this.state.multiLine.remove()
    }
    if (this.state.replayMultiLine instanceof ReplayMultiLine) {
      this.state.replayMultiLine.remove()
    }

    this.clearMarkers()
    // Clear vehicle marker
    this.markerCluster.clearMarkers()
  }

  handleTabChange = (value) => {
    if (value !== this.state.selectedTab) {
      if (this.state.multiLine instanceof MultiLine) {
        this.state.multiLine.remove()
        this.clearMarkers()
      }

      if (this.state.replayMultiLine instanceof ReplayMultiLine) {
        this.state.replayMultiLine.remove()
        this.clearMarkers()
      }

      this.handleSelectedTabChange(value)

      this.setState({
        fromDate: moment().startOf('date'),
        toDate: moment().format('lll'),
        snapToRoad: false,
      })

      if (value === 'replay') {
        this.goToTravelReplayMode()
      } else if (value === 'live') {
        this.goToLiveTrackingMode()
      }
    }
  }

  handleSelectedTabChange = (selectedTab, cb) => {
    this.setState({ selectedTab }, () => {
      if (cb && typeof cb === 'function') {
        cb()
      }
    })
  }

  breakTimeout = () => {
    if (loop) {
      clearTimeout(loop)
      loop = null
    }
  }

  goToOverviewMode = () => {
    this.setState({
      showTrackingStats: false,
    })

    this.state.map.setOptions({
      maxZoom: 20,
      minZoom: 5,
      zoom: 6,
      draggable: true,
      gestureHandling: 'greedy',
      center: this.props.defaultCenter,
    })

    if (this.unsubHandle) this.unsubHandle.unsubscribe()
    this.allDevicesQuery.startPolling(10000)
    this.filterMarkers()
  }

  goToTravelReplayMode = () => {
    this.setState({
      showTrackingStats: false,
    })
    // Travel replay has started this is commit
    // Stop all subscriptions and polling
    this.stopPolling()
    if (isAnimationActive) {
      this.resetLiveTracking()
    }
    this.stopSubscription()

    // Show marker on map
    const marker = this.state.markers[this.state.selectedVehicle.uniqueId]
    markerInstance = marker
    markerInstance.drawLine = false
    this.markerCluster.clearMarkers()
    this.state.map.setOptions({
      maxZoom: 20,
      minZoom: 7,
      zoom: defaultZoom,
      draggable: true,
      gestureHandling: 'greedy',
      center: marker.getPosition(),
    })
  }

  animateLive = async () => {
    isAnimationActive = true
    const device = this.state.liveData.device
    const pointsReceived = this.state.liveData.pointsReceived
    const localVehicle = this.state.selectedVehicle
    if (markerInstance && device && pointsReceived > 0) {
      if (device.timestamp !== null) {
        // let driverName = null
        // let driverContactNo = null
        // let driverImage = null
        // set details to selectedVehicle state
        if (localVehicle) {
          localVehicle.speed = device[count].speed
          localVehicle.timestamp = device[count].timestamp
          localVehicle.isPrimaryBattery = device[count].isPrimaryBattery
          if (device[count].address) {
            localVehicle.address = device[count].address
          }

          // let response = await this.props.client.query({
          //   query: GET_DRIVER_DETAILS,
          //   variables: {
          //     uniqueDeviceId: localVehicle.uniqueId,
          //   },
          // })

          // if (response.data && response.data.getDriverDetails !== null) {
          //   driverName = response.data.getDriverDetails.driverName
          //   driverContactNo = response.data.getDriverDetails.contactNumber
          //   driverImage = response.data.getDriverDetails.driverImage
          // }
        } else {
          this.breakTimeout()
        }
        this.setState({ selectedVehicle: localVehicle })

        this.showData({
          speed: localVehicle.speed,
          timestamp: localVehicle.timestamp,
          address: localVehicle.address,
          isPrimaryBattery: localVehicle.isPrimaryBattery,
          mode: 'LIVE_TRACKING',
          // driverName: this.state.driverName,
          // driverContactNo: this.state.driverContactNo,
          // driverImage:
          //   this.state.driverImage && this.state.driverImage.slice(2, -1),
        })
      }

      markerInstance.updateMarker(
        {
          lat: parseFloat(device[count].latitude.toFixed(6)),
          lng: parseFloat(device[count].longitude.toFixed(6)),
        },
        {
          /* eslint-disable indent */
          status: device[count].isOffline
            ? 'offline'
            : device[count].isNoGps
              ? 'nogps'
              : device[count].haltStatus
                ? 'halt'
                : device[count].idlingStatus === true
                  ? 'idle'
                  : device[count].idlingStatus === false &&
                    device[count].haltStatus === false
                    ? 'running'
                    : 'default',
          mode: 'live',
          isOverspeed: device[count].isOverspeed,
          timestamp: device[count].timestamp,
          speed: device[count].speed,
          /* eslint-enable indent */
        },
        10000 / pointsReceived // Calculate interval when snapped points are received
      )
      if (count < pointsReceived - 1) {
        count = count + 1
        // TODO, implement queue instead of setTimeouts
        loop = setTimeout(this.animateLive, 10000 / pointsReceived)
      } else {
        this.resetLiveTracking()
        if (this.state.snapToRoadToggleScheduled) {
          this.setState({ snapToRoadToggleScheduled: false }, async () => {
            const marker = this.state.markers[
              this.state.selectedVehicle.uniqueId
            ]
            marker.ignoreEvents = true
            await this.stopSubscription()
            await this.setupSubscription()
            this.startSubscription(marker)
          })
        }
      }
    }
  }

  goToLiveTrackingMode = async () => {
    // Stop Polling and any subscriptions if present
    this.handleSelectedTabChange('live')
    this.stopPolling()
    if (isAnimationActive) {
      this.resetLiveTracking()
    }
    this.stopSubscription()
    this.setupSubscription()

    const latLng = {}
    latLng.lat = parseFloat(this.state.selectedVehicle.latitude.toFixed(6), 10)
    latLng.lng = parseFloat(this.state.selectedVehicle.longitude.toFixed(6), 10)

    const vehicle = this.state.selectedVehicle
    if (vehicle) {
      // let response = await this.props.client.query({
      //   query: GET_DRIVER_DETAILS,
      //   variables: {
      //     uniqueDeviceId: vehicle.uniqueId,
      //   },
      // })
      // let driverName = null
      // let driverContactNo = null
      // let driverImage = null
      // if (response.data && response.data.getDriverDetails !== null) {
      //   driverName = response.data.getDriverDetails.driverName
      //   driverContactNo = response.data.getDriverDetails.contactNumber
      //   driverImage = response.data.getDriverDetails.driverImage
      // }
      this.getDriverDetails()
      this.showData({
        speed: vehicle.speed,
        timestamp: vehicle.timestamp,
        address: vehicle.address,
        isPrimaryBattery: vehicle.isPrimaryBattery,
        mode: 'LIVE_TRACKING',
        // driverName: this.state.driverName && this.state.driverName,
        // driverContactNo:
        //   this.state.driverContactNo && this.state.driverContactNo,
        // driverImage:
        //   this.state.driverImage && this.state.driverImage.slice(2, -1),
      })
    }

    const marker = this.state.markers[this.state.selectedVehicle.uniqueId]
    marker.ignoreEvents = true
    // marker.drawLine = true
    this.markerCluster.clearMarkers()
    this.markerCluster.addMarker(marker)
    this.state.map.setOptions({
      maxZoom: 22,
      minZoom: 8,
      zoom: 16,
      draggable: true,
      gestureHandling: 'greedy',
      center: marker.getPosition(),
    })

    this.setState({
      showTrackingStats: true,
    })

    this.startSubscription(marker)
  }

  setMap = (map) =>
    this.setState({ map }, () => {
      this.setState({ multiLine: new MultiLine(this.state.map) })
      this.setState({ replayMultiLine: new ReplayMultiLine(this.state.map) })
    })

  drawReplayMultiline = () => {
    // Plot multiline on map
    let i = 0

    if (this.state.replayMultiLine instanceof ReplayMultiLine) {
      this.state.replayMultiLine.remove()
    }

    const length = this.state.travelReplayData.replayCount

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

    while (i < this.state.travelReplayData.replayCount) {
      const point = new this.props.google.maps.LatLng({
        lat: this.state.travelReplayData.response[i].lat,
        lng: this.state.travelReplayData.response[i].lng,
      })

      this.state.replayMultiLine.addPoint(point, false, 'grey')

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

    const infoWindow = new this.props.google.maps.InfoWindow({
      maxWidth: 200,
      pixelOffset: new this.props.google.maps.Size(0, -5),
    })

    const line = lineString(
      this.state.replayMultiLine.currentLine
        .getPath()
        .getArray()
        .map(({ lat, lng }) => [lng(), lat()])
    )

    const openInfoWindow = (latLng) => {
      infoWindow.open(this.state.map)

      const pt = point([latLng.lng(), latLng.lat()])

      const nearestPoint = nearestPointOnLine(line, pt)

      const index = nearestPoint.properties.index

      const { ts, address, speed } = this.state.travelReplayData.response[index]

      infoWindow.setContent(
        `
        <div style="color: black;">
          <b>Time</b><br /><span>${getFormattedTime(
          ts,
          'Do MMM YYYY, h:mm:ss A'
        )}</span><br /><br />
          <b>Speed</b><br /><span>${speed} km/h</span><br /><br />
          <b>Address</b><br /><span>${address}</span><br />
        </div>
        `
      )

      infoWindow.setPosition(latLng)
    }

    this.state.replayMultiLine.currentLine.addListener('mouseover', (e) => {
      openInfoWindow(e.latLng)
    })

    this.state.replayMultiLine.currentLine.addListener('mousemove', (e) => {
      openInfoWindow(e.latLng)
    })

    this.state.replayMultiLine.currentLine.addListener('mouseout', (e) => {
      infoWindow.setMap(null)
      infoWindow.close()
    })

    this.state.replayMultiLine.currentLine.addListener('click', (e) => {
      if (this.state.isReplayActive) {
        const pt = point([e.latLng.lng(), e.latLng.lat()])

        const nearestPoint = nearestPointOnLine(line, pt)

        count = nearestPoint.properties.index

        this.setState(
          {
            sliderValue: this.state.travelReplayData.step * count,
          },
          () => {
            markerInstance.setPosition(
              new this.props.google.maps.LatLng({
                lat: nearestPoint.geometry.coordinates[1],
                lng: nearestPoint.geometry.coordinates[0],
              })
            )
            this.drawReplayMarkerPolyline()
            this.replayControls()
          }
        )
      }
    })
  }

  clearMarkers() {
    if (markerList.length > 0) {
      for (let i = 0; i < markerList.length; i++) {
        markerList[i].setMap(null)
      }
      markerList = []
    }
  }

  drawMarker = () => {
    const data = this.state.travelReplayData.response
    const startPoint = new this.props.google.maps.LatLng({
      lat: this.state.travelReplayData.response[0].lat,
      lng: this.state.travelReplayData.response[0].lng,
    })

    const bounds = new this.props.google.maps.LatLngBounds()
    data.forEach((index) => {
      const extendPoints = new this.props.google.maps.LatLng({
        lat: index.lat,
        lng: index.lng,
      })
      bounds.extend(extendPoints)
    })

    this.state.map.fitBounds(bounds)

    markerInstance.setPosition(startPoint)
    this.markerCluster.addMarker(markerInstance)
  }

  breakTimeout = () => {
    if (loop) {
      clearTimeout(loop)
      loop = null
    }
  }

  replayControls = () => {
    if (!this.state.isReplayActive) {
      this.setState({ fromDate: null, toDate: null, showTrackingStats: false })
      count = 0
      indexGraph = 0
      this.breakTimeout()
    } else if (this.state.isPause) {
      this.breakTimeout()
    } else if (this.state.travelReplayData.replayCount === count) {
      this.setState({
        isReplayActive: false,
        fromDate: null,
        toDate: null,
        showTrackingStats: false,
      })
      this.props.openSnackbar('Replay Finished!')
      this.breakTimeout()
    } else if (this.state.travelReplayData.replayCount > count) {
      this.handleSliderChange(
        this.state.sliderValue + this.state.travelReplayData.step
      )
      if (
        this.state.travelReplayData.response[count].speed !== null &&
        this.state.travelReplayData.response[count].ts !== null
      ) {
        this.setState({
          liveSpeed: this.state.travelReplayData.response[count].speed,
          graphIndex: indexGraph++,
        })
        this.showData({
          speed: this.state.travelReplayData.response[count].speed,
          timestamp: this.state.travelReplayData.response[count].ts,
          address: this.state.travelReplayData.response[count].address
            ? this.state.travelReplayData.response[count].address
            : '',
          distance: this.state.travelReplayData.distanceTravelled,
          mode: 'TRAVEL_REPLAY',
        })
      }

      markerInstance.updateMarker(
        {
          lat: parseFloat(
            this.state.travelReplayData.response[count].lat.toFixed(6)
          ),
          lng: parseFloat(
            this.state.travelReplayData.response[count].lng.toFixed(6)
          ),
        },
        {
          status: 'running',
          mode: 'replay',
          timestamp: this.state.travelReplayData.response[count].ts,
          speed: this.state.travelReplayData.response[count].speed,
        },
        this.state.interval
      )

      this.addMultiLinePoint(
        new this.props.google.maps.LatLng({
          lat: parseFloat(
            this.state.travelReplayData.response[count].lat.toFixed(6)
          ),
          lng: parseFloat(
            this.state.travelReplayData.response[count].lng.toFixed(6)
          ),
        })
      )

      count++
    }

    if (this.state.isReplayActive && !this.state.isPause) {
      loop = setTimeout(this.replayControls, this.state.interval)
    }

    if (this.state.isReplayActive) {
      this.setState({
        showTrackingStats: true,
        isSpeedGraphAnimationLive: true,
      })
    }
  }

  getUnix = () => {
    const unixFrom = moment(this.state.fromDate).unix()
    const unixTo = moment(this.state.toDate).unix()

    return {
      fromDate: unixFrom.toString(),
      toDate: unixTo.toString(),
    }
  }

  requestReplayData = async () => {
    // Clear multiline and markers
    if (this.state.multiLine instanceof MultiLine) {
      this.state.multiLine.remove()
    }
    if (this.state.replayMultiLine instanceof ReplayMultiLine) {
      this.state.replayMultiLine.remove()
    }

    this.setState({
      isTravelReplayDataLoading: true,
    })
    this.clearMarkers()

    const unixDates = this.getUnix()
    const localResponse = await this.props.client.query({
      query: TRAVEL_REPLAY_PACKETS,
      variables: {
        uniqueId: this.state.selectedVehicle.uniqueId,
        from: unixDates.fromDate,
        to: unixDates.toDate,
        snapToRoad: this.state.snapToRoad,
      },
    })

    if (localResponse.data && localResponse.data.getTravelHistory) {
      const data = localResponse.data.getTravelHistory.points
      const distanceCovered =
        localResponse.data.getTravelHistory.distanceTravelledKms
      const localReplayCount = data.length
      if (localReplayCount < 2) {
        this.props.openSnackbar('No data available for selected duration.')
        this.setState({
          isReplayActive: false,
          sliderValue: 0,
          fromDate: null,
          toDate: null,
          isTravelReplayDataLoading: false,
        })
      } else {
        const localStep = parseFloat((100 / localReplayCount).toFixed(3))
        this.setState({
          travelReplayData: {
            response: data,
            distanceTravelled: distanceCovered,
            replayCount: localReplayCount,
            step: localStep,
          },
          isTravelReplayDataLoading: false,
        })
        count = 0
        indexGraph = 0
        this.drawMarker()
        this.drawReplayMultiline()
        this.getInterval(this.state.replaySpeed)
        this.replayControls()
      }
    } else {
      this.props.openSnackbar('Failed to fetch data.')
    }
  }

  isOffline = (timestamp) => {
    if (timestamp === null) {
      // no data vehicle
      return false
    }
    // timestamp is assumed to be UTC+0
    const d = new Date()
    const currentTime = Math.round(d.getTime() / 1000)
    return currentTime - parseInt(timestamp) > 43200
  }

  updateData = (vehicles) => {
    // console.log(vehicles, 'vehicles')
    const newMarkers = {}
    if (
      Object.keys(this.state.vehicles).length === 0 &&
      this.state.vehicles.constructor === Object
    ) {
      const updatedVehicles = {}
      const bounds = new this.props.google.maps.LatLngBounds()
      vehicles.forEach((vehicle) => {
        let vehicleType = vehicle.vehicleType.toLowerCase()
        let modelName = vehicle.model_name.toLowerCase()

        if (vehicle.model_name) {
          if (
            (modelName == 'ux101' ||
              modelName == 'ts101_advance' ||
              (modelName == 'ts101 basic' && vehicleType == 'bike')) &&
            this.props.primaryChecked == false
          ) {
            updatedVehicles[vehicle.uniqueId] = vehicle

            if (vehicle.latitude && vehicle.longitude) {
              bounds.extend({
                lat: parseFloat(vehicle.latitude.toFixed(6)),
                lng: parseFloat(vehicle.longitude.toFixed(6)),
              })
            }
          } else if (
            ((modelName != 'ux101' &&
              modelName != 'ts101_advance' &&
              modelName == 'teltonika tat 100') ||
              (modelName != 'ux101' &&
                modelName != 'ts101_advance' &&
                modelName == 'ts101 basic' &&
                vehicleType != 'bike')) &&
            this.props.primaryChecked == true
          ) {
            updatedVehicles[vehicle.uniqueId] = vehicle
            if (vehicle.latitude && vehicle.longitude) {
              bounds.extend({
                lat: parseFloat(vehicle.latitude.toFixed(6)),
                lng: parseFloat(vehicle.longitude.toFixed(6)),
              })
            }
          }
        }
      })

      // Set bounds the first time
      this.handleBoundsChange(bounds)
      this.setState({ vehicles: updatedVehicles }, () => {
        this.addMarkers()
      })
    } else {
      // TODO: Remove markers with lost connection
      const updatedVehicles = {}
      const bounds = new this.props.google.maps.LatLngBounds()
      vehicles.forEach((vehicle) => {
        let vehicleType = vehicle.vehicleType.toLowerCase()
        let modelName = vehicle.model_name.toLowerCase()

        // If this vehicle was present previously
        if (this.state.vehicles[vehicle.uniqueId]) {
          if (vehicle.model_name != null) {
            if (
              (modelName == 'ux101' ||
                modelName == 'ts101_advance' ||
                (modelName == 'ts101 basic' && vehicleType == 'bike')) &&
              this.props.primaryChecked == false
            ) {
              updatedVehicles[vehicle.uniqueId] = vehicle

              if (vehicle.latitude && vehicle.longitude) {
                bounds.extend({
                  lat: parseFloat(vehicle.latitude.toFixed(6)),
                  lng: parseFloat(vehicle.longitude.toFixed(6)),
                })
              }
            } else if (
              ((modelName != 'ux101' &&
                modelName != 'ts101_advance' &&
                modelName == 'teltonika tat 100') ||
                (modelName != 'ux101' &&
                  modelName != 'ts101_advance' &&
                  modelName == 'ts101 basic' &&
                  vehicleType != 'bike')) &&
              this.props.primaryChecked == true
            ) {
              updatedVehicles[vehicle.uniqueId] = vehicle

              if (vehicle.latitude && vehicle.longitude) {
                bounds.extend({
                  lat: parseFloat(vehicle.latitude.toFixed(6)),
                  lng: parseFloat(vehicle.longitude.toFixed(6)),
                })
              }
            }
          }

          const marker = this.state.markers[vehicle.uniqueId]

          if (marker) {
            marker.updateMarker(
              {
                lat: parseFloat(vehicle.latitude.toFixed(6)),
                lng: parseFloat(vehicle.longitude.toFixed(6)),
              },
              {
                /* eslint-disable indent */
                status:
                  // this.isOffline(vehicle.timestamp)
                  vehicle.isOffline
                    ? 'offline'
                    : vehicle.isNoGps
                      ? 'nogps'
                      : vehicle.haltStatus
                        ? 'halt'
                        : vehicle.idlingStatus === true
                          ? 'idle'
                          : vehicle.idlingStatus === false &&
                            vehicle.haltStatus === false
                            ? 'running'
                            : 'default',
                mode: 'overview',
                isOverspeed: vehicle.isOverspeed,
                timestamp: Number(vehicle.timestamp),
                speed: vehicle.speed,
                /* eslint-enable indent */
              },
              10000
            )
          }
        } else {
          // Add this marker
          if (vehicle.model_name != null) {
            if (
              (modelName == 'ux101' ||
                modelName == 'ts101_advance' ||
                (modelName == 'ts101 basic' && vehicleType == 'bike')) &&
              this.props.primaryChecked == false
            ) {
              updatedVehicles[vehicle.uniqueId] = vehicle

              if (vehicle.latitude && vehicle.longitude) {
                bounds.extend({
                  lat: parseFloat(vehicle.latitude.toFixed(6)),
                  lng: parseFloat(vehicle.longitude.toFixed(6)),
                })
              }
            } else if (
              ((modelName != 'ux101' &&
                modelName != 'ts101_advance' &&
                modelName == 'teltonika tat 100') ||
                (modelName != 'ux101' &&
                  modelName != 'ts101_advance' &&
                  modelName == 'ts101 basic' &&
                  vehicleType != 'bike')) &&
              this.props.primaryChecked == true
            ) {
              updatedVehicles[vehicle.uniqueId] = vehicle

              if (vehicle.latitude && vehicle.longitude) {
                bounds.extend({
                  lat: parseFloat(vehicle.latitude.toFixed(6)),
                  lng: parseFloat(vehicle.longitude.toFixed(6)),
                })
              }
            }
          }
          if (vehicle.latitude && vehicle.longitude) {
            newMarkers[vehicle.uniqueId] = this.getMarkerForVehicle(vehicle)
            newMarkers[vehicle.uniqueId].setMap(null)
          }
        }
      })
      // Update state and add to cluster
      this.setState(
        {
          vehicles: updatedVehicles,
          markers: { ...this.state.markers, ...newMarkers },
        },
        this.filterMarkers
      )
    }
  }

  getImeiNumber = async (vehicleNumber) => {
    let imeiNumber = await this.props.client.query({
      query: GET_VEHICLE_DETAILS,
      variables: {
        vehicleNumber: vehicleNumber,
      },
    })

    if (imeiNumber) {
      this.setState({
        fetchedImeiNumber: imeiNumber.data.getVehicleDetail.device.imei_num,
      })
    }
  }

  getRfidNumber = async (uniqueId) => {
    let rfidData = await this.props.client.query({
      query: GET_DRIVER_DETAILS,
      variables: {
        uniqueDeviceId: uniqueId,
        // uniqueDeviceId: '6672462545245456544498',
      },
    })

    if (rfidData) {
      this.setState({
        fetchedRfidNumber:
          rfidData.data.getDriverDetails == null
            ? null
            : rfidData.data.getDriverDetails.rfid,
      })
    }
  }

  getDriverData = async (imeiNumber, rfid) => {
    let response = await this.props.client.query({
      query: GET_DRIVER_DETAILS_BY_IMEI_RFID,
      variables: {
        imei: imeiNumber,
        rfid: rfid,
      },
    })
    if (response && response.data.findDriverDetailsByImeiAndRfid !== null) {
      this.setState({
        driverName: response.data.findDriverDetailsByImeiAndRfid.data.name,
        driverContactNo:
          response.data.findDriverDetailsByImeiAndRfid.data.phone,
        driverImage: response.data.findDriverDetailsByImeiAndRfid.data.image,
      })
    } else {
      return null
    }
    // console.log('name', this.state.driverName)
    // console.log('number', this.state.driverContactNo)
    // console.log('image', this.state.driverImage)
  }

  getDriverDetails = async () => {
    await this.getImeiNumber(this.state.selectedVehicle.vehicleNumber)
    await this.getRfidNumber(this.state.selectedVehicle.uniqueId)
    await this.getDriverData(
      this.state.fetchedImeiNumber,
      this.state.fetchedRfidNumber
    )
  }

  setupPolling = () => {
    this.allDevicesQuery = this.props.client.watchQuery({
      query: GET_ALL_DEVICES,
      pollInterval: 10000,
    })
  }

  setupSubscription = () => {
    this.deviceSubscription = this.props.client.subscribe({
      query: DEVICE_LOCATION,
      variables: {
        deviceId: this.state.selectedVehicle.uniqueId,
        snapToRoad: this.state.snapToRoad,
      },
    })
  }

  startPolling = () => {
    this.allDevicesQuery.subscribe({
      next: ({ data }) => {
        if (this._isMounted && this.state.selectedTab === 'overview') {
          this.updateData(data.devices)
        }
      },
    })
  }

  resetLiveTracking = () => {
    isAnimationActive = false
    count = 0
    indexGraph = 0
    this.setState({
      livedata: {
        device: [],
        pointsReceived: 0,
      },
    })
    markerInstance = null
    this.breakTimeout()
  }

  startSubscription = (marker) => {
    this.unsubHandle = this.deviceSubscription.subscribe({
      next: ({ data }) => {
        if (this._isMounted) {
          if (isAnimationActive) {
            this.resetLiveTracking()
            markerInstance = marker
            this.setState(
              {
                liveData: {
                  device: data.deviceLiveTracking,
                  pointsReceived: data.deviceLiveTracking.length,
                },
              },
              () => {
                count = 0
                indexGraph = 0
                this.animateLive()
              }
            )
          } else {
            markerInstance = marker
            this.setState(
              {
                liveData: {
                  device: data.deviceLiveTracking,
                  pointsReceived: data.deviceLiveTracking.length,
                },
              },
              () => {
                // TODO: Create animation Queue
                count = 0
                indexGraph = 0
                this.animateLive()
              }
            )
          }
        }
      },
    })
  }

  stopPolling = () => this.allDevicesQuery.stopPolling()

  stopSubscription = () => {
    if (this.unsubHandle) this.unsubHandle.unsubscribe()
  }

  handleMarkerClick = (markerId) => {
    if (this.state.selectedTab === 'overview') {
      this.handleSelectedVehicleChange(this.state.vehicles[markerId])
    }
  }

  getMarkerForVehicle = (vehicle) =>
    new CustomMarker(
      vehicle,
      this.state.map,
      this.customPopup,
      (markerId) => this.handleMarkerClick(markerId),
      this.state.multiLine
    )

  addMarkers() {
    const markers = {}
    Object.values(this.state.vehicles).forEach((vehicle) => {
      if (vehicle.latitude !== null && vehicle.longitude !== null) {
        markers[vehicle.uniqueId] = this.getMarkerForVehicle(vehicle)
      }
    })

    this.setState({ markers }, () => {
      this.setMarkerCluster()
      this.filterMarkers()
    })
  }

  setMarkerCluster = () => {
    this.markerCluster = new MarkerClusterer(
      this.state.map,
      this.getInitialFilteredMarkers(),
      {
        maxZoom: 10,
        minimumClusterSize: 250,
        styles: [
          {
            url: clusterIcon,
            height: 40,
            width: 40,
            textColor: 'white',
          },
          {
            url: clusterIcon,
            height: 40,
            width: 40,
            textColor: 'white',
          },
          {
            url: clusterIcon,
            height: 40,
            width: 40,
            textColor: 'white',
          },
        ],
      }
    )
  }

  getInitialFilteredMarkers = () => {
    const filteredMarkers = []
    const filteredVehicles = {}

    Object.values(this.state.vehicles).forEach(
      ({ uniqueId, timestamp, isOffline }) => {
        let condition = false
        if (
          !(
            timestamp === null ||
            // this.isOffline(timestamp)
            isOffline
          )
        )
          condition = true

        if (timestamp !== null) {
          /* eslint-disable react/no-direct-mutation-state */
          if (this.state.markers[uniqueId]) {
            this.state.markers[uniqueId].ignoreEvents = false
          }
          /* eslint-enable react/no-direct-mutation-state */
          // don't add marker for no data vehicles
          filteredMarkers.push(this.state.markers[uniqueId])
        }

        if (condition) {
          filteredVehicles[uniqueId] = {
            ...this.state.vehicles[uniqueId],
            isSelected: false,
          }
        }
      }
    )

    this.setState({
      filteredVehicles,
    })

    return filteredMarkers
  }

  getFilteredMarkers = (groupedVehicles) => {
    const filteredMarkers = []
    let filteredVehicles = []
    const markerFilter = this.state.markerFilter

    Object.values(
      !groupedVehicles ? this.state.vehicles : groupedVehicles
    ).forEach(
      ({
        haltStatus,
        idlingStatus,
        isNoGps,
        uniqueId,
        timestamp,
        isPrimaryBattery,
        isOffline,
      }) => {
        let condition = false
        if (markerFilter === 'ALL') {
          condition = true
        } else if (
          timestamp === null ||
          // this.isOffline(timestamp)
          isOffline
        ) {
          // offline
          if (markerFilter === 'NON_TRACKING') {
            condition = true
          } else if (isPrimaryBattery === false) {
            // device switched to secondary battery before going offline, assumed device dead
            condition = markerFilter === 'DEAD'
          } else if (timestamp === null) {
            condition = markerFilter === 'NO_DATA'
          } else {
            condition = markerFilter === 'OFFLINE'
          }
        } else {
          // all online vehicles
          if (markerFilter === 'TRACKING') {
            condition = true
          } else if (isNoGps) {
            // NoGps
            condition = markerFilter === 'NO_GPS'
            // condition = false
          } else {
            if (markerFilter === 'HALT' && haltStatus) {
              condition = true
            } else if (markerFilter === 'IDLE' && idlingStatus) {
              condition = true
            } else if (
              markerFilter === 'RUNNING' &&
              !idlingStatus &&
              !haltStatus
            ) {
              condition = true
            }
          }
        }

        if (condition) {
          if (timestamp !== null) {
            /* eslint-disable react/no-direct-mutation-state */
            if (this.state.markers[uniqueId]) {
              this.state.markers[uniqueId].ignoreEvents = false
            }
            /* eslint-enable react/no-direct-mutation-state */
            // don't add marker for no data vehicles
            filteredMarkers[uniqueId] = this.state.markers[uniqueId]
          }

          filteredVehicles[uniqueId] = {
            ...this.state.vehicles[uniqueId],
            isSelected: Boolean(
              this.state.filteredVehicles[uniqueId] &&
              this.state.filteredVehicles[uniqueId].isSelected
            ),
          }
        }
      }
    )

    const newSelected = this.state.selected.filter(
      (uniqueId) => Object.keys(filteredVehicles).indexOf(uniqueId) !== -1
    )

    this.setState({
      filteredVehicles,
      selected: newSelected,
    })

    const filteredSelectedMarkers =
      newSelected.length > 0
        ? newSelected.map((uniqueId) => filteredMarkers[uniqueId])
        : filteredMarkers

    return filteredSelectedMarkers
  }

  filterMarkers = async () => {
    let filteredMarkers = await this.getFilteredMarkers()
    console.log(filteredMarkers)
    // if (filteredMarkers) {
    //   this.markerCluster.clearMarkers()
    //   this.markerCluster.addMarkers(filteredMarkers)
    //   this.markerCluster.addMarkers(this.getFilteredMarkers())
    // }

  }

  showData = ({
    speed,
    timestamp,
    address,
    battery,
    isPrimaryBattery,
    distance,
    mode,
    driverName,
    driverContactNo,
    driverImage,
  }) => {
    if (
      speed !== null &&
      timestamp !== null &&
      battery !== null &&
      address !== null
    ) {
      //  let src = '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';
      const items = []
      if (distance >= 0) {
        items.push({ title: 'Total distance covered (km)', data: distance })
      }

      if (speed >= 0)
        items.push({
          title:
            languageJson[this.props.selectedLanguage].mainDashboardPage
              .trackingLiveTab.vehicleSpeedLabel,
          data: speed,
        })

      if (timestamp) {
        items.push({
          title:
            mode === 'TRAVEL_REPLAY'
              ? 'Time'
              : languageJson[this.props.selectedLanguage].mainDashboardPage
                .trackingLiveTab.lastTrackedTimeLabel,
          data: getFormattedTime(timestamp, 'Do MMM YYYY, h:mm:ss A'),
        })
      }

      if (address) {
        items.push({
          title:
            languageJson[this.props.selectedLanguage].mainDashboardPage
              .trackingLiveTab.locationLabel,
          data: address, // mode === 'LIVE_TRACKING' ? address : null
        })
      }

      if (isPrimaryBattery) {
        // voltage calculation
        const voltage = (battery / 1000).toFixed(2).toString()
        // text for battery
        let batteryText = battery > 0 ? voltage + ' V ' : ''
        batteryText += isPrimaryBattery === true ? 'Primary' : 'Secondary'
        items.push({
          title:
            languageJson[this.props.selectedLanguage].mainDashboardPage
              .trackingLiveTab.batteryLabel,
          data: batteryText,
        })
      }

      // if (driverName) {
      //   items.push({
      //     title: 'Driver Name',
      //     data: driverName,
      //   })
      // }

      // if (driverContactNo) {
      //   items.push({
      //     title: 'Contact number',
      //     data: driverContactNo,
      //   })
      // }

      // if (driverImage) {
      //   items.push({
      //     title: 'Driver Image',
      //     data: (
      //       <img
      //         style={{
      //           height: '180px',
      //           backgroundImage: 'cover',
      //         }}
      //         src={`data:image/png;base64,${driverImage}`}
      //       />
      //     ),
      //   })
      // }

      this.setState({ stats: { items } })
    }
  }

  clearSelection = () => {
    const vehicles = Object.assign({}, this.state.filteredVehicles)

    this.state.selected.forEach((uniqueId) => {
      vehicles[uniqueId].isSelected = false
    })

    this.setState({
      selected: [],
      filteredVehicles: vehicles,
    })
  }

  handleMarkerFilterChange = (markerFilter) => {
    console.log(markerFilter)
    this.clearSelection()

    if (this.state.markerFilter === markerFilter) markerFilter = 'ALL'

    this.setState(
      {
        markerFilter,
      },
      this.filterMarkers
    )
  }

  getAllDeviceQuery = async () => {
    const response = await this.props.client.query({
      query: GET_ALL_DEVICES,
    })
    if (response.data) {
      console.log(response.data)
      this.updateData(response.data.devices)
    }
  }

  getInterval = (factor) =>
    this.handleIntervalChange(REPLAY_DURATION / factor, factor)

  onSliderChange = (event, value) => this.handleSliderChange(value)

  handleBoundsChange = (bounds) => {
    if (bounds.isEmpty()) {
      bounds.extend(this.props.defaultCenter)
    }

    this.state.map.fitBounds(bounds)

    const currentZoom = this.state.map.getZoom()

    this.state.map.setZoom(currentZoom > 10 ? 10 : currentZoom)
  }

  togglePlay = (value) => this.handlePlayPauseChange(!value)

  componentDidMount() {
    this._isMounted = true
    this.setupPolling()
    this.startPolling()
    this.getAllGroups()
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.primaryChecked !== prevProps.primaryChecked) {
      this.getAllDeviceQuery()
    }
  }

  componentWillUnmount() {
    this._isMounted = false
    this.breakTimeout()
    this.stopPolling()
    this.stopSubscription()
  }

  handleRequestSort = (event) => {
    let order = 'desc'

    if (this.state.order === 'desc') {
      order = 'asc'
    }

    this.setState({ order }, () => this.getFilteredMarkers())
  }

  handleSnapToRoadChange = () => {
    this.setState({ snapToRoad: !this.state.snapToRoad }, async () => {
      if (this.state.selectedTab === 'live') {
        if (!isAnimationActive) {
          const marker = this.state.markers[this.state.selectedVehicle.uniqueId]
          marker.ignoreEvents = true
          await this.stopSubscription()
          await this.setupSubscription()
          this.startSubscription(marker)
        } else {
          this.setState({ snapToRoadToggleScheduled: true })
        }
      }
    })
  }

  handleMouseDown = () =>
    this.setState({ sliderMovementActive: true, isPause: true })

  handleChangeCommit = (event, value) => {
    count = parseInt(value / this.state.travelReplayData.step, 10)
    this.setState(
      { sliderMovementActive: false, isPause: false, sliderValue: value },
      () => {
        const resetPoint = new this.props.google.maps.LatLng({
          lat: this.state.travelReplayData.response[count <= 0 ? 0 : count - 1]
            .lat,
          lng: this.state.travelReplayData.response[count <= 0 ? 0 : count - 1]
            .lng,
        })
        markerInstance.setPosition(resetPoint)
        this.drawReplayMarkerPolyline()
        this.replayControls()
      }
    )
  }

  drawReplayMarkerPolyline = () => {
    if (this.state.multiLine instanceof MultiLine) {
      this.state.multiLine.remove()
    }

    for (let i = 0; i < count; i++) {
      const point = new this.props.google.maps.LatLng({
        lat: this.state.travelReplayData.response[i].lat,
        lng: this.state.travelReplayData.response[i].lng,
      })

      this.state.multiLine.addPoint(point, false, 'green')
    }
  }

  addMultiLinePoint = (point) => {
    this.state.multiLine.addPoint(point, false, 'green')
  }

  handleSelectionChange = (uniqueId) => {
    this.setState(({ filteredVehicles, selected }) => {
      const selectedVehicles = selected.slice()

      const index = selectedVehicles.indexOf(uniqueId)
      if (index === -1) {
        selectedVehicles.push(uniqueId)
      } else {
        selectedVehicles.splice(index, 1)
      }

      const vehicles = Object.assign({}, filteredVehicles)
      vehicles[uniqueId].isSelected = !vehicles[uniqueId].isSelected

      return {
        filteredVehicles: vehicles,
        selected: selectedVehicles,
      }
    }, this.filterSelectedMarkers)
  }

  filterSelectedMarkers = () => {
    /* eslint-disable indent */
    const selectedMarkers =
      this.state.selected.length > 0
        ? this.state.selected.map((uniqueId) => this.state.markers[uniqueId])
        : Object.keys(this.state.filteredVehicles).map(
          (uniqueId) => this.state.markers[uniqueId]
        )
    /* eslint-enable indent */

    this.markerCluster.clearMarkers()
    this.markerCluster.addMarkers(selectedMarkers)
  }

  handleSelectionAllChange = (e, checked) => {
    this.setState(({ selected, filteredVehicles }) => {
      const vehicles = Object.assign({}, filteredVehicles)

      if (checked) {
        const allSelected = Object.keys(vehicles).map((uniqueId) => {
          vehicles[uniqueId].isSelected = true
          return uniqueId
        })

        return {
          selected: allSelected,
          filteredVehicles: vehicles,
        }
      } else {
        selected.forEach((uniqueId) => {
          vehicles[uniqueId].isSelected = false
        })

        return {
          selected: [],
          filteredVehicles: vehicles,
        }
      }
    }, this.filterSelectedMarkers)
  }
  handleSearchChangeToGroup = (toggleToGroupSearch) => {
    if (toggleToGroupSearch) this.stopPolling()
    else {
      this.allDevicesQuery.startPolling(10000)
    }

    this.setState({ isGroupSearchActive: toggleToGroupSearch })
  }

  handleSelectedGroupChange = (selectedGroup) => {
    let groupedVehicles = []
    Object.values(this.state.vehicles).forEach((vehicle) => {
      if (
        selectedGroup.assignedVehicles.find((v) => {
          return v.vehicleNumber === vehicle.vehicleNumber
        })
      ) {
        groupedVehicles.push(vehicle)
      }
    })
    this.markerCluster.clearMarkers()
    this.markerCluster.addMarkers(this.getFilteredMarkers(groupedVehicles))
  }

  render() {
    const {
      selectedVehicle,
      isPause,
      isTravelReplayDataLoading,
      interval,
      replaySpeed,
      fromDate,
      toDate,
      sliderValue,
      selectedTab,
      isReplayActive,
      markerFilter,
      stats,
      showTrackingStats,
      filteredVehicles,
      vehicles,
      selected,
    } = this.state

    const { classes, selectedLanguage } = this.props

    return (
      <Grid container spacing={1}>
        {selectedTab === 'overview' && (
          <Grid item xs={12}>
            <VehicleStats
              vehicles={this.state.vehicles}
              markerFilter={markerFilter}
              onMarkerFilterChange={this.handleMarkerFilterChange}
            />
            <Divider />
          </Grid>
        )}

        <Grid item xs={12}>
          <Paper square className={classes.paper}>
            <Grid container spacing={1}>
              <Grid item xs={12} md={4}>
                <MapSideBar
                  snapToRoad={this.state.snapToRoad}
                  onSnapToRoadChange={this.handleSnapToRoadChange}
                  vehicles={filteredVehicles}
                  order={this.state.order}
                  handleRequestSort={this.handleRequestSort}
                  selectedVehicle={selectedVehicle}
                  onSelectedVehicleChange={this.handleSelectedVehicleChange}
                  onTabChange={this.handleTabChange}
                  filter={markerFilter}
                  stats={stats}
                  showStats={showTrackingStats}
                  selectedTab={selectedTab}
                  interval={interval}
                  isPause={!isPause}
                  speed={replaySpeed}
                  isReplayActive={isReplayActive}
                  isTravelReplayDataLoading={isTravelReplayDataLoading}
                  fromDate={fromDate}
                  toDate={toDate}
                  sliderValue={sliderValue}
                  onSliderChange={this.handleSliderChange}
                  onDateChange={this.handleDateChange}
                  onIntervalChange={this.handleIntervalChange}
                  onPlayPauseChange={this.handlePlayPauseChange}
                  onReplayStatusChange={this.handleReplayStatus}
                  onRequestTravelReplayData={this.requestReplayData}
                  selectedVehicleIds={selected}
                  onSelectionChange={this.handleSelectionChange}
                  onSelectionAllChange={this.handleSelectionAllChange}
                  isGroupSearchActive={this.state.isGroupSearchActive}
                  onSearchChangeToGroup={this.handleSearchChangeToGroup}
                  allGroups={this.state.allGroups}
                  selectedGroup={this.state.selectedGroup}
                  onSelectedGroupChange={this.handleSelectedGroupChange}
                  driverName={this.state.driverName}
                  driverContactNo={this.state.driverContactNo}
                  driverImage={this.state.driverImage}
                />

                {selectedTab === 'overview' && (
                  <Grid
                    container
                    spacing={1}
                    justify="center"
                    alignItems="center"
                  >
                    <Grid item sm={6} md={6} lg={6}>
                      <ColorButton
                        component={Link}
                        variant="contained"
                        to="/home/dashboard/current-trackinfo"
                        fullWidth={true}
                      >
                        <Typography variant="caption" noWrap={true}>
                          {
                            languageJson[selectedLanguage].mainDashboardPage
                              .currentTrackingInfo
                              .currentTrackingInfoButtonTitle
                          }
                        </Typography>
                      </ColorButton>
                    </Grid>

                    <Grid item sm={6} md={6} lg={6}>
                      <ColorButton
                        component={Link}
                        variant="contained"
                        to="/home/dashboard/current-summary"
                        fullWidth={true}
                      >
                        <Typography variant="caption" noWrap={true}>
                          {
                            languageJson[selectedLanguage].mainDashboardPage
                              .currentSummary.currentSummaryButtonTitle
                          }
                        </Typography>
                      </ColorButton>
                    </Grid>
                  </Grid>
                )}
              </Grid>

              <Grid item xs={12} md={8}>
                <MapTabView
                  selectedTab={selectedTab}
                  isReplayActive={isReplayActive}
                  onTabChange={this.handleTabChange}
                  selectedVehicle={selectedVehicle}
                />

                <Map google={this.props.google} zoom={5} setMap={this.setMap}>
                  {isReplayActive && (
                    <Grid
                      container
                      alignItems="center"
                      className={classes.mapReplayControl}
                    >
                      <Grid item xs={12} md={3}>
                        <ReplayControlPanel
                          togglePlay={!isPause}
                          speed={replaySpeed}
                          onPlayPause={this.togglePlay}
                          speedFactor={this.getInterval}
                        />
                      </Grid>

                      <Grid
                        item
                        xs={12}
                        md={9}
                        className={classes.playControls}
                      >
                        <Slider
                          disabled={isTravelReplayDataLoading}
                          value={sliderValue}
                          onChange={this.onSliderChange}
                          className={classes.catchAllEvents}
                          onMouseDown={this.handleMouseDown}
                          onChangeCommitted={this.handleChangeCommit}
                          ValueLabelComponent={ValueLabelComponent}
                        />
                      </Grid>
                    </Grid>
                  )}

                  {selectedTab === 'overview' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 20,
                      }}
                    >
                      <PlaceSearcher changeBounds={this.handleBoundsChange} />
                    </div>
                  )}
                </Map>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    )
  }
}

const GET_CLIENT_DETAIL = gql`
  query($loginId: Int!) {
    clientDetail(loginId: $loginId) {
      lat
      long
    }
  }
`

const WrappedDashboard = withStyles(style)(
  withGoogleMaps(
    withApollo(
      withLanguage(
        withSharedSnackbar((props) => (
          <Query
            query={GET_CLIENT_DETAIL}
            variables={{ loginId: getLoginId() }}
          >
            {({ data }) => (
              <TrackingControls
                defaultCenter={{
                  lat: data.clientDetail.lat || 7.36,
                  lng: data.clientDetail.long || 12.35,
                }}
                {...props}
              />
            )}
          </Query>
        ))
      )
    )
  )
)

export default (props) => (
  <Switch>
    <PrivateRoute
      exact
      path="/home/dashboard"
      render={() => <WrappedDashboard {...props} />}
    />
    <PrivateRoute
      exact
      path="/home/dashboard1"
      render={() => <WrappedDashboard {...props} />}
    />
    <PrivateRoute
      exact
      path="/home/dashboard/current-trackinfo"
      render={() => <CurrentTrackinfo {...props} />}
    />
    <PrivateRoute
      exact
      path="/home/dashboard/current-summary"
      render={() => <CurrentSummary {...props} />}
    />
  </Switch>
)

function ValueLabelComponent(props) {
  const { children, open } = props

  const popperRef = React.useRef(null)
  React.useEffect(() => {
    if (popperRef.current) {
      popperRef.current.update()
    }
  })

  return (
    <Tooltip
      PopperProps={{
        popperRef,
      }}
      open={open}
      enterTouchDelay={0}
      placement="top"
      title={sliderTitle}
    >
      {children}
    </Tooltip>
  )
}

ValueLabelComponent.propTypes = {
  children: PropTypes.element.isRequired,
  open: PropTypes.bool.isRequired,
  value: PropTypes.number.isRequired,
}
