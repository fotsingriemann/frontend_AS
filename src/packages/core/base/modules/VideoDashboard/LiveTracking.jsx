import React, { Component } from 'react'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'

import iconStartFlag from '@zeliot/common/static/png/start.png'
import iconEndFlag from '@zeliot/common/static/png/stop.png'

import withGoogleMaps from '@zeliot/common/hoc/withGoogleMaps'
import Map from './Map'
import TrackingStats from './TrackingStats'
import getMultiLine from './Map/MultiLine'
import getCustomMarker from './Map/CustomMarker'
import getCustomPopup from './Map/CustomPopup'
import { Grid, Divider, Paper } from '@material-ui/core'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import moment from 'moment'

const DEVICE_LOCATION = gql`
  subscription liveTrackingData($deviceId: String!, $snapToRoad: Boolean!) {
    deviceLiveTracking(deviceId: $deviceId, snapToRoad: $snapToRoad) {
      timestamp
      latitude
      longitude
      haltStatus
      idlingStatus
      isOverspeed
      speed
      extBatVol
      isPrimaryBattery
      isNoGps
      address
      satellites
    }
  }
`

const GET_LATEST_LOCATION = gql`
  query getLatestLocation($uniqueId: String!) {
    latestLocation: getDeviceLatestLocation(deviceId: $uniqueId) {
      timestamp
      latitude
      longitude
      address
      speed
      isNoGps
      isOffline
      satellites
    }
  }
`

const PACKET_INTERVAL = 10000
const ANIMATION_DURATION_THRESHOLD = 60

let CustomMarker
let CustomPopup
let MultiLine
let loop = null
let markerInstance = null
let markerStart = null
let markerEnd = null
let ReplayMultiLine
let markerList = []
let prevReplayTs = 0

let count = 0
let isAnimationActive = false

let loginId = null

class LiveTracking extends Component {
  constructor(props) {
    super(props)
    CustomMarker = getCustomMarker(props.google)
    CustomPopup = getCustomPopup(props.google)
    this.customPopup = new CustomPopup()
    MultiLine = getMultiLine(props.google)
    ReplayMultiLine = getMultiLine(props.google)
  }

  state = {
    liveData: null,
    map: null,
    stats: null,
    snapToRoad: true,
    multiLine: null,
    replayMultiLine: null,
    shouldMount: true
  }

  travelReplayMarker = null

  /* -------------------- LIFECYCLE METHODS ------------------- */
  componentDidMount() {
    this._isMounted = true
    loginId = localStorage.getItem('loginId')
  }

  componentWillUnmount() {
    this._isMounted = false
    markerInstance = null
    count = 0
    isAnimationActive = false
    this.breakTimeout()
    this.stopSubscription()
  }

  componentDidUpdate(prevProps) {
    if (this.props.mode !== prevProps.mode) {
      this.handleModeChange()
    } else if (this.props.travelReplayData !== prevProps.travelReplayData) {
      if (this.props.travelReplayData) {
        this.resetTravelReplay()
        this.drawMarker()
        this.drawReplayMultiline()
        count = this.syncToNearestPointInReplay()
        this.replayControls()
      }
    }
    if (
      this.props.mode === 'TIMELINE' &&
      this.props.tickTock !== prevProps.tickTock &&
      this.props.travelReplayData
    ) {
      if (this.props.tickTock >= prevProps.tickTock) {
        count = this.syncReplayDataWithClock(false)
        if (
          this.props.travelReplayData.response[count].ts - prevReplayTs >
          ANIMATION_DURATION_THRESHOLD
        ) {
          prevReplayTs = this.props.travelReplayData.response[count].ts - 1
        }

        this.replayControls()
        prevReplayTs = this.props.travelReplayData.response[count].ts
      } else {
        if (
          this.props.tickTock <=
          Number(this.props.travelReplayData.response[0].ts)
        ) {
          count = 0
        } else {
          count = this.syncReplayDataWithClock(true)
        }

        prevReplayTs = this.props.travelReplayData.response[count].ts - 1
        this.replayControls()
        prevReplayTs = this.props.travelReplayData.response[count].ts
      }
    }
  }

  /* -------------------- LIVE TRACKING METHODS ------------------- */
  getLatestLocation = async () => {
    const bounds = new this.props.google.maps.LatLngBounds()
    const response = await this.props.client.query({
      query: GET_LATEST_LOCATION,
      variables: {
        uniqueId: this.props.vehicle.uniqueId
      }
    })

    if (response.data && response.data.latestLocation) {
      const snapshot = response.data.latestLocation
      if (snapshot.latitude && snapshot.longitude) {
        this.setState({ shouldMount: true })

        if (!markerInstance) {
          markerInstance = this.getMarkerForVehicle({
            latitude: parseFloat(snapshot.latitude.toFixed(6)),
            longitude: parseFloat(snapshot.longitude.toFixed(6)),
            speed: snapshot.speed,
            isOffline: snapshot.isOffline,
            isNoGps: snapshot.isNoGps,
            timestamp: snapshot.timestamp,
            vehicleType: this.props.vehicle.vehicleType,
            vehicleNumber: this.props.vehicle.vehicleNumber,
            uniqueId: this.props.vehicle.uniqueId
          })
        } else {
          markerInstance.setMap(this.state.map)

          markerInstance.setPosition(
            new this.props.google.maps.LatLng(
              parseFloat(snapshot.latitude.toFixed(6)),
              parseFloat(snapshot.longitude.toFixed(6))
            )
          )
        }

        this.showData({
          speed: snapshot.speed,
          timestamp: snapshot.timestamp,
          address: snapshot.address,
          satellites: snapshot.satellites,
          mode: 'LIVE_TRACKING'
        })

        const extendPoints = new this.props.google.maps.LatLng({
          lat: parseFloat(snapshot.latitude.toFixed(6)),
          lng: parseFloat(snapshot.longitude.toFixed(6))
        })
        bounds.extend(extendPoints)
        this.state.map.fitBounds(bounds)
      } else {
        this.props.openSnackbar(
          'Live tracking is not available for this vehicle'
        )
        this.setState({ shouldMount: false })
      }
    }
  }

  setupSubscription = () => {
    this.deviceSubscription = this.props.client.subscribe({
      query: DEVICE_LOCATION,
      variables: {
        deviceId: this.props.vehicle.uniqueId,
        snapToRoad: false
      }
    })
  }

  startSubscription = () => {
    this.unsubHandle = this.deviceSubscription.subscribe({
      next: ({ data }) => {
        if (this._isMounted) {
          if (isAnimationActive) {
            if (!markerInstance) {
              markerInstance = this.getMarkerForVehicle({
                ...data.deviceLiveTracking[0],
                vehicleType: this.props.vehicle.vehicleType,
                vehicleNumber: this.props.vehicle.vehicleNumber,
                uniqueId: this.props.vehicle.uniqueId
              })
            }

            this.setState(
              {
                liveData: {
                  device: data.deviceLiveTracking,
                  pointsReceived: data.deviceLiveTracking.length
                }
              },
              () => {
                count = 0
                // indexGraph = 0
                this.animateLive()
              }
            )
          } else {
            if (!markerInstance) {
              markerInstance = this.getMarkerForVehicle({
                ...data.deviceLiveTracking[0],
                vehicleType: this.props.vehicle.vehicleType,
                vehicleNumber: this.props.vehicle.vehicleNumber,
                uniqueId: this.props.vehicle.uniqueId
              })
            }
            this.setState(
              {
                liveData: {
                  device: data.deviceLiveTracking,
                  pointsReceived: data.deviceLiveTracking.length
                }
              },
              () => {
                // TODO: Create animation Queue
                count = 0
                // indexGraph = 0
                this.animateLive()
              }
            )
          }
        }
      }
    })
  }

  stopSubscription = () => {
    if (this.unsubHandle) this.unsubHandle.unsubscribe()
  }

  animateLive = () => {
    isAnimationActive = true
    const device = this.state.liveData.device
    const pointsReceived = this.state.liveData.pointsReceived

    if (markerInstance && device && pointsReceived > 0) {
      this.showData({
        speed: device[count].speed,
        timestamp: device[count].timestamp,
        address: device[count].address,
        satellites: device[count].satellites,
        mode: 'LIVE_TRACKING'
      })

      markerInstance.updateMarker(
        {
          lat: parseFloat(device[count].latitude.toFixed(6)),
          lng: parseFloat(device[count].longitude.toFixed(6))
        },
        {
          /* eslint-disable indent */
          status: this.isOffline(device[count].timestamp)
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
          speed: device[count].speed
          /* eslint-enable indent */
        },
        PACKET_INTERVAL / pointsReceived // Calculate interval when snapped points are received
      )

      if (count < pointsReceived - 1) {
        count = count + 1
        // TODO, implement queue instead of setTimeouts
        loop = setTimeout(this.animateLive, PACKET_INTERVAL / pointsReceived)
      }
    }
  }

  resetLiveTracking = () => {
    isAnimationActive = false
    count = 0
    this.setState({
      livedata: {
        device: [],
        pointsReceived: 0
      }
    })
    if (this.state.multiLine instanceof MultiLine) {
      this.state.multiLine.remove()
    }
    this.breakTimeout()
    this.stopSubscription()
  }

  isOffline = timestamp => {
    if (timestamp === null) {
      return false
    }
    // timestamp is assumed to be UTC+0
    const d = new Date()
    const currentTime = Math.round(d.getTime() / 1000)
    return currentTime - parseInt(timestamp) > 1800
  }

  /* -------------------- REPLAY METHODS ------------------- */
  replayControls = () => {
    const shouldAnimateReplay = this.props.travelReplayData.replayCount > count
    const isReplayFinished = this.props.travelReplayData.replayCount === count

    if (isReplayFinished) {
      this.props.openSnackbar('Replay Finished!')
    } else if (shouldAnimateReplay) {
      if (
        this.props.travelReplayData.response[count].speed !== null &&
        this.props.travelReplayData.response[count].ts !== null
      ) {
        if (
          this.props.tickTock >=
          Number(this.props.travelReplayData.response[count].ts)
        ) {
          this.showData({
            speed: this.props.travelReplayData.response[count].speed,
            timestamp: this.props.travelReplayData.response[count].ts,
            address: this.props.travelReplayData.response[count].address
              ? this.props.travelReplayData.response[count].address
              : '',
            distance: this.props.travelReplayData.distanceTravelled,
            satellites: this.props.travelReplayData.response[count].satellites,
            mode: 'TRAVEL_REPLAY'
          })
        } else {
          this.showData({
            speed: 0,
            timestamp: 'Not available',
            address: 'Not available',
            satellites: 'Not available',
            distance: this.props.travelReplayData.distanceTravelled,
            mode: 'TRAVEL_REPLAY'
          })
        }
      }

      if (prevReplayTs === 0) {
        prevReplayTs = Number(this.props.travelReplayData.response[0].ts)
      }

      const animationInterval =
        Number(this.props.travelReplayData.response[count].ts) - prevReplayTs

      if (animationInterval > 0) {
        markerInstance.updateMarker(
          {
            lat: parseFloat(
              this.props.travelReplayData.response[count].lat.toFixed(6)
            ),
            lng: parseFloat(
              this.props.travelReplayData.response[count].lng.toFixed(6)
            )
          },
          {
            status: 'running',
            mode: 'replay',
            timestamp: this.props.travelReplayData.response[count].ts,
            speed: this.props.travelReplayData.response[count].speed
          },
          prevReplayTs ? animationInterval * 1000 : PACKET_INTERVAL // Default animation time is set to 10 second
        )
      }
      this.drawReplayMarkerPolyline()
    } else {
    }
  }

  drawReplayMarkerPolyline = () => {
    if (this.state.multiLine instanceof MultiLine) {
      this.state.multiLine.remove()
    }
    for (var i = 0; i < count; i++) {
      const point = new this.props.google.maps.LatLng({
        lat: this.props.travelReplayData.response[i].lat,
        lng: this.props.travelReplayData.response[i].lng
      })
      this.state.multiLine.addPoint(point, false, 'green')
    }
  }

  resetTravelReplay = () => {
    if (this.state.replayMultiLine instanceof ReplayMultiLine) {
      this.state.replayMultiLine.remove()
    }
    if (this.state.multiLine instanceof MultiLine) {
      this.state.multiLine.remove()
    }

    count = 0
    prevReplayTs = 0
    this.clearMarkers()
    this.showData({
      speed: 0,
      timestamp: 'Not available',
      address: 'Not available',
      distance: 'Not available',
      satellites: 'Not available',
      mode: 'TRAVEL_REPLAY'
    })
  }

  syncReplayDataWithClock = fromStart => {
    let dataIndex = 0
    for (
      let index = fromStart ? 0 : count;
      index < this.props.travelReplayData.response.length;
      index++
    ) {
      if (
        String(this.props.tickTock) ===
        this.props.travelReplayData.response[index].ts
      ) {
        dataIndex = index
        break
      }
    }

    if (dataIndex) return dataIndex
    else return count
  }

  syncToNearestPointInReplay = () => {
    let dataIndex = 0

    for (
      let index = 0;
      index < this.props.travelReplayData.response.length;
      index++
    ) {
      if (
        Number(this.props.travelReplayData.response[index].ts) <=
        this.props.tickTock
      ) {
        dataIndex = index
      } else {
        dataIndex = index - 1
        break
      }
    }

    if (dataIndex >= 0) return dataIndex
    else return 0
  }

  /* -------------------- MAP METHODS ------------------- */
  getMarkerForVehicle = vehicle => {
    return new CustomMarker(
      vehicle,
      this.state.map,
      // this.customPopup,
      null,
      markerId => this.handleMarkerClick(markerId),
      null
    )
  }

  clearMarkers() {
    if (markerList.length > 0) {
      for (var i = 0; i < markerList.length; i++) {
        markerList[i].setMap(null)
      }
      markerList = []
    }
  }

  drawMarker = () => {
    const data = this.props.travelReplayData.response
    const startPoint = new this.props.google.maps.LatLng({
      lat: this.props.travelReplayData.response[0].lat,
      lng: this.props.travelReplayData.response[0].lng
    })

    const bounds = new this.props.google.maps.LatLngBounds()
    data.forEach(index => {
      const extendPoints = new this.props.google.maps.LatLng({
        lat: index.lat,
        lng: index.lng
      })
      bounds.extend(extendPoints)
    })

    this.state.map.fitBounds(bounds)

    markerInstance.setPosition(startPoint)
  }

  drawReplayMultiline = () => {
    // Plot multiline on map
    let i = 0

    if (this.state.replayMultiLine instanceof ReplayMultiLine) {
      this.state.replayMultiLine.remove()
    }

    const length = this.props.travelReplayData.replayCount

    const startPoint = {
      lat: this.props.travelReplayData.response[0].lat,
      lng: this.props.travelReplayData.response[0].lng
    }

    const endPoint = {
      lat: this.props.travelReplayData.response[length - 1].lat,
      lng: this.props.travelReplayData.response[length - 1].lng
    }

    const startFlag = {
      url: iconStartFlag,
      scaledSize: new this.props.google.maps.Size(30, 30),
      anchor: new this.props.google.maps.Point(0, 30)
    }

    const endFlag = {
      url: iconEndFlag,
      scaledSize: new this.props.google.maps.Size(30, 30),
      anchor: new this.props.google.maps.Point(0, 30)
    }

    markerStart = new this.props.google.maps.Marker({
      position: startPoint,
      icon: startFlag,
      map: this.state.map
    })

    markerEnd = new this.props.google.maps.Marker({
      position: endPoint,
      icon: endFlag,
      map: this.state.map
    })

    markerList.push(markerStart)
    markerList.push(markerEnd)

    while (i < this.props.travelReplayData.replayCount) {
      const point = new this.props.google.maps.LatLng({
        lat: this.props.travelReplayData.response[i].lat,
        lng: this.props.travelReplayData.response[i].lng
      })
      this.state.replayMultiLine.addPoint(point, false, 'grey')
      i++
    }
  }

  setMap = map =>
    this.setState({ map }, () => {
      this.getLatestLocation()
      this.setupSubscription()
      this.startSubscription()

      this.setState({
        multiLine: new MultiLine(this.state.map),
        replayMultiLine: new ReplayMultiLine(this.state.map)
      })
    })

  /* ------------------- OTHER METHODS ------------------- */
  breakTimeout = () => {
    if (loop) {
      clearTimeout(loop)
      loop = null
    }
  }

  handleModeChange = () => {
    if (this.props.mode === 'LIVE') {
      this.props.resetTravelReplayData()
      this.resetTravelReplay()
      this.getLatestLocation()
      this.setupSubscription()
      this.startSubscription()
    } else if (this.props.mode === 'STABLE') {
      this.resetLiveTracking()
      if (!this.props.travelReplayData) {
        this.resetTravelReplay()
      }
    } else if (this.props.mode === 'TIMELINE') {
      if (this.props.travelReplayData) {
        count = this.syncToNearestPointInReplay()
        this.replayControls()
      }
    }
  }

  showData = ({ speed, timestamp, address, distance, mode, satellites }) => {
    if (speed !== null && timestamp !== null && address !== null) {
      const items = []
      if (distance >= 0) {
        items.push({ title: 'Total distance covered (km)', data: distance })
      }

      if (speed >= 0) items.push({ title: 'Speed (km/h)', data: speed })

      if (timestamp) {
        items.push({
          title:
            mode === 'TRAVEL_REPLAY' ? 'Last recorded at' : 'Last tracked time',
          data:
            timestamp === 'Not available'
              ? 'Not available'
              : loginId !== '1962'
              ? getFormattedTime(timestamp, 'Do MMM YYYY, h:mm:ss A')
              : moment
                  .unix(timestamp)
                  .utc()
                  .format('Do MMM YYYY, h:mm:ss A')
        })
      }

      if (address) {
        items.push({
          title: 'Location',
          data: address // mode === 'LIVE_TRACKING' ? address : null
        })
      }

      items.push({
        title: 'Satellites',
        data: satellites || 'N/A'
      })

      this.setState({ stats: { items } })
    }
  }

  render() {
    if (this.state.shouldMount) {
      return (
        <Grid container style={{ height: '100%' }} alignContent="flex-end">
          <Grid item xs={12}>
            <Map google={this.props.google} zoom={10} setMap={this.setMap} />
          </Grid>

          <Grid item xs={12}>
            <Divider style={{ margin: '15px 0px 16px 0px' }} />
          </Grid>

          <Grid item xs={12}>
            <Paper
              style={{
                textAlign: 'center',
                borderColor: 'secondary',
                height: 130,
                overflowY: 'auto'
              }}
            >
              <TrackingStats
                stats={this.state.stats}
                vehicleNumber={this.props.vehicle.vehicleNumber}
                snapToRoad={this.state.snapToRoad}
              />
            </Paper>
          </Grid>
        </Grid>
      )
    } else return null
  }
}

export default withSharedSnackbar(withGoogleMaps(withApollo(LiveTracking)))
