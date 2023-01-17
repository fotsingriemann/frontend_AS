import React, { Component } from 'react'
import moment from 'moment'
import { Switch } from 'react-router-dom'
import { withApollo } from 'react-apollo'
import { PrivateRoute } from '@zeliot/common/router'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import getUnixString from '@zeliot/common/utils/time/getUnixString'
import OSMapControls from './OSMapControls'
import {
  TRAVEL_REPLAY_PACKETS,
  GET_ALL_DEVICES
} from '@zeliot/common/graphql/queries'
import { DEVICE_LOCATION } from '@zeliot/common/graphql/subscriptions'
import CurrentTrackinfo from './CurrentTrackinfo'
import CurrentSummary from './CurrentSummary/CurrentSummary'

function isOffline(timestamp) {
  if (timestamp === null) {
    // no data vehicle
    return false
  }
  // timestamp is assumed to be UTC+0
  const d = new Date()
  const currentTime = Math.round(d.getTime() / 1000)
  return currentTime - parseInt(timestamp) > 1800
}

class OSMap extends Component {
  state = {
    filteredVehicles: {},
    markerFilter: 'TRACKING',
    selectedTab: 'overview',
    vehicles: [],
    selectedVehicle: null,
    fromDate: null,
    toDate: null,
    sliderValue: 0,
    interval: 1000,
    isPause: false,
    replaySpeed: 8,
    isReplayActive: false,
    travelReplayData: {},
    liveData: null,
    showStats: false,
    isTravelReplayDataLoading: false,
    stats: null,
    showTrackingStats: false,
    replayData: null,
    mapZoom: 5,
    mapCenter: [22, 78],
    flags: null,
    order: 'desc',
    selected: []
  }

  getInterval = factor => {
    this.handleIntervalChange(1000 / factor, factor)
  }

  resetLiveTracking = () => {
    this.isAnimationActive = false
    this.count = 0
    this.setState({
      livedata: {
        position: [],
        duration: 0,
        device: null
      }
    })
    this.breakTimeout()
  }

  breakTimeout = () => {
    if (this.loop) {
      clearTimeout(this.loop)
      this.loop = null
    }
  }

  goToLiveTrackingMode = () => {
    this.handleSelectedTabChange('live')
    this.stopPolling()

    if (this.isAnimationActive) {
      this.resetLiveTracking()
    }

    this.stopSubscription()
    this.setupSubscription()

    this.setState({
      showTrackingStats: true,
      replayData: null,
      mapCenter: [
        this.state.selectedVehicle.latitude,
        this.state.selectedVehicle.longitude
      ],
      mapZoom: 18
    })

    this.startSubscription()
  }

  goToTravelReplayMode = () => {
    this.setState({
      showStats: false,
      liveData: null
    })

    this.stopPolling()

    if (this.isAnimationActive) {
      this.resetLiveTracking()
    }

    this.stopSubscription()
  }

  goToOverviewMode = () => {
    this.setState({
      showTrackingStats: false,
      mapZoom: 6,
      mapCenter: [12, 77]
    })

    if (this.unsubHandle) this.unsubHandle.unsubscribe()
    this.allDevicesQuery.startPolling(10000)
  }

  handleSelectedVehicleChange = value => {
    if (value) {
      const selectedTab =
        this.state.selectedTab === 'overview' ? 'live' : this.state.selectedTab

      this.handleSelectedTabChange(selectedTab, () =>
        this.setState(
          {
            selectedVehicle: value
          },
          this.goToLiveTrackingMode
        )
      )
    } else {
      this.handleSelectedTabChange('overview', () =>
        this.setState(
          {
            selectedVehicle: value
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
            [key]: date
          })
        } else {
          const diff = (date - this.state.fromDate) / 3600000
          if (diff > 0 && diff < 24) {
            this.setState({ [key]: date })
          } else {
            this.setState({
              fromDate: moment(date).subtract(24, 'hours'),
              [key]: date
            })
          }
        }
      }
    }
  }

  handleSliderChange = value => this.setState({ sliderValue: value })

  handlePlayPauseChange = isPause => this.setState({ isPause }, this.replay)

  togglePlay = value => this.handlePlayPauseChange(!value)

  handleIntervalChange = (interval, replaySpeed) =>
    this.setState({ interval, replaySpeed })

  handleTabChange = value => {
    if (value !== this.state.selectedTab) {
      // Clear polylines and markers
      this.setState({ fromDate: null, toDate: null, liveData: null })
      this.handleSelectedTabChange(value)
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

  setupPolling = () => {
    this.allDevicesQuery = this.props.client.watchQuery({
      query: GET_ALL_DEVICES,
      pollInterval: 10000
    })
  }

  setupSubscription = () => {
    this.deviceSubscription = this.props.client.subscribe({
      query: DEVICE_LOCATION,
      variables: {
        deviceId: this.state.selectedVehicle.uniqueId,
        snapToRoad: false
      }
    })
  }

  startPolling = () => {
    this.allDevicesQuery.subscribe({
      next: ({ data }) => {
        if (this._isMounted && this.state.selectedTab === 'overview') {
          this.setState(
            {
              vehicles: data.devices.map(device => {
                if (isOffline(device.timestamp)) {
                  device.isOffline = true
                } else {
                  device.isOffline = false
                }

                device.isSelected = Boolean(
                  this.state.filteredVehicles[device.uniqueId] &&
                  this.state.filteredVehicles[device.uniqueId].isSelected
                )

                return device
              })
            },
            this.getFilteredMarkers
          )
        }
      }
    })
  }

  count = 0

  isAnimationActive = false

  animateLive = () => {
    this.isAnimationActive = true
    const { points } = this.state

    if (points && points.length > 0) {
      this.setState({
        liveData: {
          position: [
            parseFloat(points[this.count].latitude.toFixed(6)),
            parseFloat(points[this.count].longitude.toFixed(6))
          ],
          duration: 5000 / points.length,
          device: {
            ...this.state.selectedVehicle,
            haltStatus: points[0].haltStatus,
            idlingStatus: points[0].idlingStatus
          }
        }
      })
      if (this.count < points.length - 1) {
        this.count++
        console.log('Snap in progress')
        console.log('marker updated', this.count, 'time out of ', points.length)
        // TODO, implement queue instead of setTimeouts
        this.loop = setTimeout(this.animateLive, 5000 / points.length)
      } else {
        this.resetLiveTracking()
      }
    }
  }

  startSubscription = async () => {
    const selectedVehicle = this.state.vehicles.find(
      vehicle => vehicle.uniqueId === this.state.selectedVehicle.uniqueId
    )

    this.setState({
      liveData: {
        position: [selectedVehicle.latitude, selectedVehicle.longitude],
        duration: 0,
        device: selectedVehicle
      },
      showStats: true,
      stats: {
        items: [
          {
            title: 'Speed',
            data: selectedVehicle.speed
          },
          {
            title: 'Last tracked time',
            data: getFormattedTime(
              selectedVehicle.timestamp,
              'Do MMM YYYY, h:mm:ss A'
            )
          },
          {
            title: 'Address',
            data: selectedVehicle.address
          }
        ]
      }
    })

    this.unsubHandle = this.deviceSubscription.subscribe({
      next: async ({ data }) => {
        const items = data.deviceLiveTracking
        this.count = 0

        this.setState(
          {
            points: items,
            showStats: true,
            stats: {
              items: [
                {
                  title: 'Speed',
                  data: items[items.length - 1].speed
                },
                {
                  title: 'Last tracked time',
                  data: getFormattedTime(
                    items[items.length - 1].timestamp,
                    'Do MMM YYYY, h:mm:ss A'
                  )
                },
                {
                  title: 'Address',
                  data: items[items.length - 1].address
                }
              ]
            }
          },
          this.animateLive
        )
      }
    })
  }

  replay = () => {
    if (!this.state.isReplayActive) {
      this.setState({
        fromDate: null,
        toDate: null,
        showStats: false
      })
      this.count = 0
      this.breakTimeout()
    } else if (this.state.isPause) {
      this.breakTimeout()
    } else if (this.state.travelReplayData.replayCount === this.count) {
      this.setState({
        isReplayActive: false,
        fromDate: null,
        toDate: null,
        showStats: false
      })
      this.props.openSnackbar('Replay Finished!')
      this.breakTimeout()
    } else if (this.state.travelReplayData.replayCount > this.count) {
      this.handleSliderChange(
        this.state.sliderValue + this.state.travelReplayData.step
      )

      this.setState({
        replayData: {
          points: this.state.travelReplayData.response,
          position: [
            parseFloat(
              this.state.travelReplayData.response[this.count].lat.toFixed(6)
            ),
            parseFloat(
              this.state.travelReplayData.response[this.count].lng.toFixed(6)
            )
          ],
          duration: this.state.interval
        }
      })
      if (this.state.travelReplayData.response[this.count].ts) {
        this.setState({
          stats: {
            items: [
              {
                title: 'Speed',
                data: this.state.travelReplayData.response[this.count].speed
              },
              {
                title: 'Last tracked time',
                data: getFormattedTime(
                  this.state.travelReplayData.response[this.count].ts,
                  'Do MMM YYYY, h:mm:ss A'
                )
              },
              {
                title: 'Address',
                data: this.state.travelReplayData.response[this.count].address
                  ? this.state.travelReplayData.response[this.count].address
                  : ''
              }
            ]
          }
        })
      }
      this.count += 1
    }
    if (this.state.isReplayActive && !this.state.isPause) {
      this.loop = setTimeout(this.replay, this.state.interval)
    }
    if (this.state.isReplayActive) {
      this.setState({
        showStats: true
      })
    }
  }

  stopPolling = () => this.allDevicesQuery.stopPolling()

  stopSubscription = () => {
    if (this.unsubHandle) this.unsubHandle.unsubscribe()
  }

  getUnix = () => ({
    fromDate: getUnixString(this.state.fromDate),
    toDate: getUnixString(this.state.toDate)
  })

  handleRequestReplayData = async () => {
    this.setState({
      isTravelReplayDataLoading: true,
      replayData: null,
      travelReplayData: null
    })

    const unixDates = this.getUnix()

    const localResponse = await this.props.client.query({
      query: TRAVEL_REPLAY_PACKETS,
      variables: {
        uniqueId: this.state.selectedVehicle.uniqueId,
        from: unixDates.fromDate,
        to: unixDates.toDate
      }
    })

    const data = localResponse.data.getTravelHistory.points
    const localReplayCount = data.length

    if (localReplayCount < 2) {
      this.props.openSnackbar('No data available for selected duration.')
      this.setState({
        isReplayActive: false,
        sliderValue: 0,
        fromDate: null,
        toDate: null,
        isTravelReplayDataLoading: false,
        flags: {
          startPosition: null,
          stopPosition: null,
          haFlags: [],
          hbFlags: []
        }
      })
    } else {
      const localStep = parseFloat((100 / localReplayCount).toFixed(3))
      const haFlags = []
      const hbFlags = []
      data.forEach(point => {
        if (point.isHA) {
          haFlags.push([point.lat, point.lng])
        }
        if (point.isHB) {
          hbFlags.push([point.lat, point.lng])
        }
      })

      this.setState({
        travelReplayData: {
          response: data,
          replayCount: localReplayCount,
          step: localStep
        },
        isTravelReplayDataLoading: false,
        flags: {
          startPosition: [data[0].lat, data[0].lng],
          stopPosition: [data[data.length - 1].lat, data[data.length - 1].lng],
          haFlags,
          hbFlags
        }
      })

      this.count = 0
      this.replay()
    }
  }

  getFilteredMarkers = () => {
    const filteredVehicles = {}

    const { markerFilter } = this.state

    this.state.vehicles.forEach(vehicle => {
      const {
        haltStatus,
        idlingStatus,
        isNoGps,
        timestamp,
        isPrimaryBattery,
        uniqueId
      } = vehicle

      let condition = false

      if (markerFilter === 'ALL') {
        condition = true
      } else if (timestamp === null || isOffline(timestamp)) {
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
        filteredVehicles[uniqueId] = vehicle
      }
    })

    const newSelected = this.state.selected.filter(
      uniqueId => Object.keys(filteredVehicles).indexOf(uniqueId) !== -1
    )

    this.setState({
      filteredVehicles,
      selected: newSelected
    })
  }

  clearSelection = () => {
    const vehicles = Object.assign({}, this.state.filteredVehicles)

    this.state.selected.forEach(uniqueId => {
      vehicles[uniqueId].isSelected = false
    })

    this.setState({
      selected: [],
      filteredVehicles: vehicles
    })
  }

  handleSelectionChange = uniqueId => {
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
        selected: selectedVehicles
      }
    })
  }

  handleSelectionAllChange = (e, checked) => {
    this.setState(({ selected, filteredVehicles }) => {
      const vehicles = Object.assign({}, filteredVehicles)

      if (checked) {
        const allSelected = Object.keys(vehicles).map(uniqueId => {
          vehicles[uniqueId].isSelected = true
          return uniqueId
        })

        return {
          selected: allSelected,
          filteredVehicles: vehicles
        }
      } else {
        selected.forEach(uniqueId => {
          vehicles[uniqueId].isSelected = false
        })

        return {
          selected: [],
          filteredVehicles: vehicles
        }
      }
    })
  }

  handleReplayStatusChange = status => {
    this.setState({
      isReplayActive: status,
      showStats: false,
      replayData: null,
      travelReplayData: null
    })
  }

  handleMarkerFilterChange = markerFilter => {
    if (this.state.vehicles.length) {
      if (this.state.markerFilter === markerFilter) markerFilter = 'ALL'

      this.setState({ markerFilter }, this.getFilteredMarkers)
    }
  }

  handleMarkerClick = device => this.handleSelectedVehicleChange(device)

  componentDidMount() {
    this._isMounted = true
    this.setupPolling()
    this.startPolling()
  }

  componentWillUnmount() {
    this._isMounted = false
    this.stopPolling()
    this.stopSubscription()
  }

  handleRequestSort = event => {
    let order = 'desc'
    if (this.state.order === 'desc') {
      order = 'asc'
    }
    this.setState({ order }, () => {
      this.getFilteredMarkers()
    })
  }

  render() {
    return (
      <div style={{ padding: 16 }}>
        <OSMapControls
          markerFilter={this.state.markerFilter}
          onMarkerFilterChange={this.handleMarkerFilterChange}
          liveData={this.state.liveData}
          vehicles={this.state.vehicles}
          filteredVehicles={this.state.filteredVehicles}
          selectedVehicle={this.state.selectedVehicle}
          onSelectedVehicleChange={this.handleSelectedVehicleChange}
          selectedTab={this.state.selectedTab}
          filter={this.state.markerFilter}
          stats={this.state.stats}
          showStats={this.state.showStats}
          fromDate={this.state.fromDate}
          toDate={this.state.toDate}
          sliderValue={this.state.sliderValue}
          onRequestTravelReplayData={this.handleRequestReplayData}
          onReplayStatusChange={this.handleReplayStatusChange}
          onSliderChange={this.handleSliderChange}
          onDateChange={this.handleDateChange}
          onPlayPauseChange={this.togglePlay}
          interval={this.state.interval}
          isPause={this.state.isPause}
          speed={this.state.replaySpeed}
          isReplayActive={this.state.isReplayActive}
          isTravelReplayDataLoading={this.state.isTravelReplayDataLoading}
          onIntervalChange={this.handleIntervalChange}
          onTabChange={this.handleTabChange}
          getInterval={this.getInterval}
          replayData={{
            ...this.state.replayData,
            ...(this.state.selectedVehicle
              ? { vehicleType: this.state.selectedVehicle.vehicleType }
              : {})
          }}
          zoom={this.state.mapZoom}
          center={this.state.mapCenter}
          handleMapCenterChange={mapCenter => this.setState({ mapCenter })}
          handleMapZoomChange={mapZoom => this.setState({ mapZoom })}
          onMarkerClick={this.handleMarkerClick}
          flags={this.state.flags}
          order={this.state.order}
          handleRequestSort={this.handleRequestSort}
          selectedVehicleIds={this.state.selected}
          onSelectionChange={this.handleSelectionChange}
          onSelectionAllChange={this.handleSelectionAllChange}
        />
      </div>
    )
  }
}

const WrappedOSMap = withSharedSnackbar(withApollo(OSMap))

export default () => (
  <Switch>
    <PrivateRoute
      exact
      path="/home/dashboard"
      render={props => <WrappedOSMap {...props} />}
    />
    <PrivateRoute
      exact
      path="/home/dashboard1"
      render={props => <WrappedOSMap {...props} />}
    />
    <PrivateRoute
      exact
      path="/home/dashboard/current-trackinfo"
      render={props => <CurrentTrackinfo {...props} />}
    />
    <PrivateRoute
      exact
      path="/home/dashboard/current-summary"
      render={props => <CurrentSummary {...props} />}
    />
  </Switch>
)
