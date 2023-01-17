import React, { Component, Fragment } from 'react'
import moment from 'moment'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import Map from '@zeliot/core/base/modules/TrackingControls/Maps/Map'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import withGoogleMaps from '@zeliot/common/hoc/withGoogleMaps'
import SimpleModal from '@zeliot/common/ui/SimpleModal'
import schoolMarkerIcon from '@zeliot/common/static/png/school.png'
import TripTabView from './TripTabView'
import CreateTrip from './CreateTrip'
import ViewWhileCreateTrip from './ViewWhileCreateTrip'
import getCustomPopup from './CustomPopup'
import SchoolTripView from './SchoolTripView'
import getLoginId from '@zeliot/common/utils/getLoginId'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import { Grid } from '@material-ui/core'

const GET_ALL_ROUTES = gql`
  query($clientLoginId: Int!) {
    getAllSchoolRoute(clientLoginId: $clientLoginId) {
      id
      routeName
      routeType
    }
  }
`
const GET_SELECTED_ROUTE = gql`
  query($id: Int!) {
    getSchoolRoute(id: $id) {
      id
      routeName
      routeDetails
      routeType
    }
  }
`

const ADD_SCHOOL_TRIP = gql`
  mutation(
    $tripName: String!
    $clientLoginId: Int!
    $routeId: Int!
    $tripType: String!
    $schedulingFrequency: String!
    $scheduledDays: ScheduledDaysList!
    $tolerance: Int!
    $stoppageTime: Int!
    $schoolTime: String!
  ) {
    addSchoolTrip(
      tripName: $tripName
      clientLoginId: $clientLoginId
      routeId: $routeId
      tripType: $tripType
      schedulingFrequency: $schedulingFrequency
      scheduledDays: $scheduledDays
      tolerance: $tolerance
      stoppageTime: $stoppageTime
      schoolTime: $schoolTime
    )
  }
`

const GET_ALL_TRIPS = gql`
  query($clientLoginId: Int!) {
    getAllSchoolTrip(clientLoginId: $clientLoginId) {
      id
      tripName
    }
  }
`

const GET_SELECTED_TRIP = gql`
  query($id: Int!) {
    getSchoolTrip(id: $id) {
      id
      tripName
      tripType
      route {
        routeName
        routeDetails
        routeType
      }
      schedulingFrequency
      scheduledDays
      tolerance
      stoppageTime
      schoolTime
      createdAt
    }
  }
`

const schoolLocation = {
  pointId: 0,
  coordinates: {
    lat: 12.9719,
    lng: 77.6412
  },
  noOfStudents: 0
}

const fenceRadius = 50 // in meters
const routeColors = ['#FF0000', '#00FF00', '#0000FF', '#000000', '#AAAAAA'] // add more colors later
const weekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

let aoiMarkers = []
let fenceList = []
let routePolyline = []
let CustomPopup
let isRouteOnViewDrawn = false

class SchoolBusTripModule extends Component {
  constructor(props) {
    super(props)
    CustomPopup = getCustomPopup(props.google)
    this._customPopup = new CustomPopup()
  }

  state = {
    selectedTab: 'view',
    modalOpen: false,
    selectedTrip: null,
    trips: null, // All trips
    radioSelection: 'pickup',
    routes: null, // filtered routes
    unfilteredRoutes: null, // all routes
    selectedRoute: null,
    selectedRouteDetails: null,
    predictedAois: null,
    map: null,
    schoolTime: null,
    allEta: null,
    stopTime: '',
    tolerance: '',
    autoAssignVehicle: false,
    scheduledDays: null,
    savedTripName: null,
    allEtaConfigured: false,
    dayOfWeek: [true, true, true, true, true, false, false],
    schedulingFrequency: 'Monthly'
  }

  componentDidMount = () => {
    this.fetchAllTrips()
    this.getSchoolLocation()
  }

  fetchAllTrips = async () => {
    const allTrips = await this.props.client.query({
      query: GET_ALL_TRIPS,
      variables: {
        clientLoginId: getLoginId()
      }
    })
    this.setState({ trips: allTrips.data.getAllSchoolTrip })
  }

  getSelectedTripDetails = async id => {
    const fetchedTrip = await this.props.client.query({
      query: GET_SELECTED_TRIP,
      variables: {
        id: id
      }
    })
    this.restructureSelectedTrip(fetchedTrip.data.getSchoolTrip)
  }

  restructureSelectedTrip = receivedObject => {
    const structuredObject = {
      id: receivedObject.id,
      createdAt: getFormattedTime(
        parseInt(receivedObject.createdAt, 10),
        'LLLL'
      ),
      route: {
        routeName: receivedObject.route.routeName,
        routeDetails: JSON.parse(receivedObject.route.routeDetails),
        routeType: receivedObject.route.routeType
      },
      scheduledDays: JSON.parse(receivedObject.scheduledDays),
      schedulingFrequency: receivedObject.schedulingFrequency,
      schoolTime: receivedObject.schoolTime,
      stoppageTime: receivedObject.stoppageTime,
      tolerance: receivedObject.tolerance,
      tripName: receivedObject.tripName,
      tripType: receivedObject.tripType
    }
    this.setState({ selectedTrip: structuredObject }, () => {
      const seconds = moment(
        this.state.selectedTrip.schoolTime,
        'HH:mm:ss: A'
      ).diff(moment().startOf('day'), 'seconds')
      if (this.state.selectedTrip.tripType === 'PICKUP') {
        this.setState({ radioSelection: 'pickup' }, () => {
          this.getAllPickupEta(seconds)
        })
      } else {
        this.setState({ radioSelection: 'drop' }, () => {
          this.getAllDropEta(seconds)
        })
      }
      this.setState(
        {
          selectedRouteDetails: structuredObject.route
        },
        () => {
          this.getAoisOnView()
          this.drawRouteOnView()
          this.drawMarkersOnView()
        }
      )
    })
  }

  getSchoolLocation = () => {
    this.setState({ schoolLocation: schoolLocation }, () => {
      this.drawSchoolMarker()
    })
  }

  fetchAllRoutes = async () => {
    const fetchedRoutes = await this.props.client.query({
      query: GET_ALL_ROUTES,
      variables: {
        clientLoginId: getLoginId()
      }
    })
    const response = fetchedRoutes.data.getAllSchoolRoute
    this.setState({ unfilteredRoutes: response })

    const tripType = this.state.radioSelection === 'pickup' ? 'PICKUP' : 'DROP'
    const getAllSchoolRoute = []

    response.forEach(route => {
      if (route.routeType === tripType) {
        getAllSchoolRoute.push(route)
      }
    })
    this.setState({ routes: getAllSchoolRoute })
  }

  getFinalTripObject = async () => {
    const configuredDays = []
    this.state.dayOfWeek.forEach((day, index) => {
      if (day) {
        configuredDays.push(weekdayNames[index])
      }
    })
    const response = await this.props.client.mutate({
      mutation: ADD_SCHOOL_TRIP,
      variables: {
        tripName: this.state.savedTripName,
        clientLoginId: getLoginId(),
        routeId: this.state.selectedRouteDetails.id,
        tripType: this.state.radioSelection === 'pickup' ? 'PICKUP' : 'DROP',
        schedulingFrequency: this.state.schedulingFrequency,
        scheduledDays: {
          scheduledDays: configuredDays
        },
        tolerance: parseInt(this.state.tolerance, 10),
        stoppageTime: parseInt(this.state.stopTime, 10),
        schoolTime: moment(this.state.schoolTime)
          .format('hh:mm:ss a')
          .toString()
      }
    })
    const success = response.data.addSchoolTrip
    if (success) {
      this.props.openSnackbar('Trip Saved!')
    } else {
      this.props.openSnackbar('Something went wrong. Try again.')
    }
  }

  getSelectedRoute = async routeId => {
    const fetchedRoute = await this.props.client.query({
      query: GET_SELECTED_ROUTE,
      variables: {
        id: routeId
      }
    })
    const route = {
      id: fetchedRoute.data.getSchoolRoute.id,
      name: fetchedRoute.data.getSchoolRoute.routeName,
      routeDetails: JSON.parse(fetchedRoute.data.getSchoolRoute.routeDetails),
      type: fetchedRoute.data.getSchoolRoute.routeType
    }
    this.setState({ selectedRouteDetails: route }, () => {
      // console.log(
      //   'Selected route details',
      //   this.state.selectedRouteDetails.routeDetails
      // )
      this.getAoisOnView()
      this.drawRouteOnView()
    })
  }

  getAoisOnView = () => {
    const aois = []
    const routeDetail = this.state.selectedRouteDetails.routeDetails
    for (let i = 0; i < routeDetail.length; i++) {
      routeDetail[i].aoiOrderObject.forEach((aoi, index) => {
        aois.push({
          pointId: aoi.pointId,
          coordinates: JSON.parse(aoi.coordinates),
          name: aoi.name,
          geoJson: JSON.parse(aoi.geoJson),
          students: aoi.students,
          type: this.state.selectedRouteDetails.type
        })
      })
    }
    this.setState({ predictedAois: aois }, () => {
      this.drawMarkersOnView()
      // console.log('extracted aois', this.state.predictedAois)
    })
  }

  drawRouteOnView = () =>
    setTimeout(() => {
      let i = 0
      let routePolylineCoordinates = []
      routePolyline = []
      const addCoordinate = coordinate => {
        routePolylineCoordinates.push(coordinate)
      }
      for (
        i = 0;
        i < this.state.selectedRouteDetails.routeDetails.length;
        i++
      ) {
        routePolylineCoordinates = []
        const pointsOnRoute = JSON.parse(
          this.state.selectedRouteDetails.routeDetails[i].route
        )
        pointsOnRoute.forEach(coordinate => addCoordinate(coordinate))
        routePolyline[i] = new this.props.google.maps.Polyline({
          path: routePolylineCoordinates,
          strokeColor: routeColors[i],
          strokeWeight: 4
        })
        // Plot polyline
        routePolyline[i].setMap(this.state.map)
      }
      isRouteOnViewDrawn = true
    })

  drawMarkersOnView = () =>
    setTimeout(() => {
      const bounds = new this.props.google.maps.LatLngBounds()
      this.state.predictedAois.forEach((aoi, index) => {
        const markerCoordinates = aoi.coordinates
        const marker = new this.props.google.maps.Marker({
          position: markerCoordinates,
          label: aoi.pointId.toString(),
          map: this.state.map
        })
        aoiMarkers.push(marker)
        // Plot marker
        marker.setMap(this.state.map)

        // Fit map bounds
        const extendPoints = new this.props.google.maps.LatLng({
          lat: markerCoordinates.lat,
          lng: markerCoordinates.lng
        })
        bounds.extend(extendPoints)
      })

      this.state.map.fitBounds(bounds)
      this.drawAoiFences()
      this.setPopups()
    })

  drawAoiFences = () => {
    this.state.predictedAois.forEach(aois => {
      this.drawStaticCircularFence(aois.coordinates)
    })
  }

  drawStaticCircularFence = center => {
    // Draw fence
    const circularFence = new this.props.google.maps.Circle({
      strokeColor: '#000000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#0000FF',
      fillOpacity: 0.35,
      map: this.state.map,
      center: center,
      radius: fenceRadius
    })
    // Record this fence
    fenceList.push(circularFence)
  }

  setPopups = () => {
    this.state.predictedAois.forEach((aoi, index) => {
      this.props.google.maps.event.addListener(
        aoiMarkers[index],
        'mouseover',
        () => {
          this.props.google.maps.event.trigger(this.state.map, 'mouseover')
          this._customPopup.setPopupData({
            name: aoi.name,
            noOfStudents: aoi.students.length,
            trip:
              this.state.routeAction === 'view'
                ? aoi.type === 'PICKUP'
                  ? 'Picking up'
                  : 'Droping'
                : this.state.radioSelection === 'pickup'
                ? 'Picking up'
                : 'Droping'
          })
          this._customPopup.setPosition(
            new this.props.google.maps.LatLng({
              lat: aoi.coordinates.lat,
              lng: aoi.coordinates.lng
            })
          )
          this._customPopup.setMap(this.state.map)
        }
      )

      this.props.google.maps.event.addListener(
        aoiMarkers[index],
        'mouseout',
        () => {
          this.props.google.maps.event.trigger(this.state.map, 'mouseout')
          this._customPopup.setPopupData({
            name: '',
            noOfStudents: '',
            trip: ''
          })
          this._customPopup.setPosition(undefined)
          this._customPopup.setMap(null)
        }
      )
    })
  }

  handleClearRoute = () => {
    this.clearRouteVariables()
    this.clearAoiMarkers()
    this.clearAoiFences()
    this.clearRoute()
  }

  clearRouteVariables = () => {
    this.setState({
      predictedAois: null,
      selectedRoute: null,
      selectedRouteDetails: null,
      schoolTime: null,
      allEta: null,
      stopTime: '',
      tolerance: '',
      autoAssignVehicle: false,
      scheduledDays: null,
      savedTripName: null,
      allEtaConfigured: false,
      schedulingFrequency: 'Monthly',
      selectedTrip: null,
      dayOfWeek: [true, true, true, true, true, false, false]
    })
  }

  clearAoiMarkers = () => {
    if (aoiMarkers.length > 0) {
      for (let i = 0; i < aoiMarkers.length; i++) {
        aoiMarkers[i].setMap(null)
      }
      aoiMarkers = []
    }
  }

  clearAoiFences = () => {
    if (fenceList.length > 0) {
      for (let i = 0; i < fenceList.length; i++) {
        fenceList[i].setMap(null)
      }
      fenceList = []
    }
  }

  clearRoute = () => {
    if (isRouteOnViewDrawn) {
      routePolyline.forEach((route, index) => {
        routePolyline[index].setMap(null)
      })
      routePolyline = []
      isRouteOnViewDrawn = false
    }
  }

  setMap = map => this.setState({ map })

  onTabChange = value => {
    this.setState({ selectedTab: value })
    if (value === 'view') {
      this.handleClearRoute()
      this.fetchAllTrips()
      this.drawSchoolMarker()
    } else {
      this.handleClearRoute()
      this.fetchAllRoutes()
      this.drawSchoolMarker()
    }
  }

  handleRadioChange = value => {
    this.handleClearRoute()
    this.setState({ radioSelection: value }, () => {
      const tripType =
        this.state.radioSelection === 'pickup' ? 'PICKUP' : 'DROP'
      const response = this.state.unfilteredRoutes
      const getAllSchoolRoute = []
      response.forEach(route => {
        if (route.routeType === tripType) {
          getAllSchoolRoute.push(route)
        }
      })
      this.setState({ routes: getAllSchoolRoute })
    })
  }

  handleRouteChange = value => {
    if (value) {
      this.setState({ selectedRoute: value }, () => {
        this.getSelectedRoute(this.state.selectedRoute.id)
      })
    } else {
      this.handleClearRoute()
    }
  }

  handleRouteOnViewHovered = (index, flag) => {
    if (flag === true) {
      routePolyline[index].setOptions({
        strokeColor: routeColors[index],
        strokeWeight: 10,
        strokeOpacity: 0.7
      })
      routePolyline[index].setMap(this.state.map)
    } else {
      routePolyline[index].setOptions({
        strokeColor: routeColors[index],
        strokeOpacity: 1.0,
        strokeWeight: 5
      })
      routePolyline[index].setMap(this.state.map)
    }
  }

  drawSchoolMarker = () =>
    setTimeout(() => {
      const customSchoolMarker = {
        url: schoolMarkerIcon,
        scaledSize: new this.props.google.maps.Size(30, 30)
      }
      // eslint-disable-next-line
      new this.props.google.maps.Marker({
        position: this.state.schoolLocation.coordinates,
        map: this.state.map,
        icon: customSchoolMarker
      })
    })

  handleDayChange = (checkboxState, index) => {
    const weekdays = this.state.dayOfWeek
    weekdays[index] = checkboxState
    this.setState({ dayOfWeek: weekdays })
  }

  handleSchoolStartTimeChange = value => {
    this.setState({ schoolTime: value })
  }

  handleSchoolEndTimeChange = value => {
    this.setState({ schoolTime: value })
  }

  handleStopTimeChange = value => {
    this.setState({ stopTime: value })
  }

  handleToleranceChange = value => {
    this.setState({ tolerance: value })
  }

  handleGetEta = () => {
    if (!this.state.schoolTime) {
      this.props.openSnackbar('School timings not provided')
    } else if (this.state.stopTime === '') {
      this.props.openSnackbar('Wait time not provided')
    } else if (this.state.stopTime < 0) {
      this.props.openSnackbar('Invalid wait time provided')
      this.setState({ stopTime: '' })
    } else if (this.state.tolerance === '') {
      this.props.openSnackbar('Tolerance not provided')
    } else if (this.state.tolerance < 0) {
      this.props.openSnackbar('Invalid tolerance provided')
      this.setState({ tolerance: '' })
    } else {
      this.setState({ allEtaConfigured: true })
      this.getArrivalOnEachPoint()
    }
  }

  handleAutoAssignBuses = () => {
    let i = 0
    let unselectedDays = 0
    for (i = 0; i < this.state.dayOfWeek.length; i++) {
      if (this.state.dayOfWeek[i] === false) {
        unselectedDays++
      }
    }
    if (unselectedDays < i) {
      this.setState({ autoAssignVehicle: true })
    } else {
      this.props.openSnackbar('Schedule atleast one day')
    }
  }

  getArrivalOnEachPoint = () => {
    const time = moment(this.state.schoolTime).format('hh:mm:ss a')
    const seconds = moment(time, 'HH:mm:ss: A').diff(
      moment().startOf('day'),
      'seconds'
    )
    if (this.state.radioSelection === 'pickup') {
      this.getAllPickupEta(seconds)
    } else {
      this.getAllDropEta(seconds)
    }
  }

  getAllPickupEta = pickupEndTime => {
    const eachStop = this.state.stopTime * 60
    const tolerance = this.state.tolerance * 60
    const allRoutes = this.state.selectedRouteDetails.routeDetails
    const durations = []
    allRoutes.forEach(route => {
      durations.push(JSON.parse(route.duration))
    })
    const allEta = []
    durations.forEach(duration => {
      let endTime = pickupEndTime - tolerance
      const etaList = []
      let i
      etaList.push(this.hhmmss(endTime))
      for (i = duration.length - 1; i >= 0; i--) {
        const travelSeconds = duration[i].value
        endTime = endTime - travelSeconds - eachStop
        etaList.push(this.hhmmss(endTime))
      }
      allEta.push(etaList.reverse())
    })
    this.setState({ allEta: allEta }, () => {
      // console.log('All pickup route ETAs', this.state.allEta)
    })
  }

  getAllDropEta = dropStartTime => {
    const eachStop = this.state.stopTime * 60
    const allRoutes = this.state.selectedRouteDetails.routeDetails
    const durations = []
    allRoutes.forEach(route => {
      durations.push(JSON.parse(route.duration))
    })
    const allEta = []
    durations.forEach(duration => {
      let startTime = dropStartTime
      const etaList = []
      let i
      etaList.push(this.hhmmss(startTime))
      for (i = 0; i < duration.length; i++) {
        const travelSeconds = duration[i].value
        startTime = startTime + travelSeconds + eachStop
        etaList.push(this.hhmmss(startTime))
      }
      allEta.push(etaList)
    })
    this.setState({ allEta: allEta }, () => {
      // console.log('All drop route ETAs', this.state.allEta)
    })
  }

  pad(num) {
    return ('0' + num).slice(-2)
  }

  hhmmss(secs) {
    var minutes = Math.floor(secs / 60)
    secs = secs % 60
    var hours = Math.floor(minutes / 60)
    minutes = minutes % 60
    return this.pad(hours) + ':' + this.pad(minutes) + ':' + this.pad(secs)
  }

  clearTrip = () => {
    this.handleClearRoute()
  }

  saveTrip = () => {
    this.setState({ modalOpen: true })
  }

  saveTripName = name => {
    if (name === '') {
      this.props.openSnackbar('Name field cannot be empty')
    } else {
      this.handleModalClose()
      this.clearTrip()
      this.getFinalTripObject()
    }
  }

  handleModalClose = () => {
    this.setState({ modalOpen: false })
  }

  handleModalFieldNameChange = name => {
    this.setState({ savedTripName: name })
  }

  handleSchedulingFrequencyChange = frequency => {
    this.setState({ schedulingFrequency: frequency })
  }

  onSelectedTripChange = selection => {
    if (selection) {
      const selectedTripId = selection.id
      this.handleClearRoute()
      this.getSelectedTripDetails(selectedTripId)
    } else {
      this.handleClearRoute()
    }
  }

  render() {
    const { google } = this.props
    return (
      <Fragment>
        <TripTabView
          trips={this.state.trips}
          selectedTrip={this.state.selectedTrip}
          selectedTab={this.state.selectedTab}
          onSelectedTripChange={this.onSelectedTripChange}
          onTabChange={this.onTabChange}
        />
        {this.state.selectedTab === 'create' ? (
          <Grid container>
            <SimpleModal
              placeholder="Trip Name"
              label="Save Trip as"
              modalOpen={this.state.modalOpen}
              handleModalClose={this.handleModalClose}
              saveAs={this.saveTripName}
              handleModalFieldNameChange={this.handleModalFieldNameChange}
            />
            <Grid item sm={4}>
              <CreateTrip
                radioSelection={this.state.radioSelection}
                handleRadioChange={this.handleRadioChange}
                routes={this.state.routes}
                selectedRoute={this.state.selectedRoute}
                handleRouteChange={this.handleRouteChange}
                schoolTime={this.state.schoolTime}
                stopTime={this.state.stopTime}
                onStopTimeChange={this.handleStopTimeChange}
                onSchoolStartTimeChange={this.handleSchoolStartTimeChange}
                onSchoolEndTimeChange={this.handleSchoolEndTimeChange}
                tolerance={this.state.tolerance}
                onToleranceChange={this.handleToleranceChange}
                onGetEta={this.handleGetEta}
                allEtaConfigured={this.state.allEtaConfigured}
                onAutoAssignBuses={this.handleAutoAssignBuses}
                onDayChange={this.handleDayChange}
                isScheduled={this.state.autoAssignVehicle}
                saveTrip={this.saveTrip}
                clearTrip={this.clearTrip}
                dayOfWeek={this.state.dayOfWeek}
                schedulingFrequency={this.state.schedulingFrequency}
                onSchedulingFrequencyChange={
                  this.handleSchedulingFrequencyChange
                }
              />
            </Grid>
            {this.state.selectedRoute && (
              <Grid item sm={3}>
                <ViewWhileCreateTrip
                  radioSelection={this.state.radioSelection}
                  routeDetails={
                    this.state.selectedRouteDetails
                      ? this.state.selectedRouteDetails.routeDetails
                      : []
                  }
                  routeOnViewHovered={this.handleRouteOnViewHovered}
                  schoolTime={this.state.schoolTime}
                  allEta={this.state.allEta}
                  autoAssignVehicle={this.state.autoAssignVehicle}
                />
              </Grid>
            )}
            <Grid item sm={this.state.selectedRoute ? 5 : 8}>
              <Map google={google} setMap={this.setMap} zoom={6} />
            </Grid>
          </Grid>
        ) : (
          <Grid container>
            <Grid item sm={4}>
              <SchoolTripView selectedTrip={this.state.selectedTrip} />
            </Grid>
            {this.state.selectedTrip && (
              <Grid item sm={3}>
                <ViewWhileCreateTrip
                  radioSelection={this.state.radioSelection}
                  routeDetails={
                    this.state.selectedTrip
                      ? this.state.selectedTrip.route.routeDetails
                      : []
                  }
                  routeOnViewHovered={this.handleRouteOnViewHovered}
                  schoolTime={
                    this.state.selectedTrip
                      ? this.state.selectedTrip.schoolTime
                      : null
                  }
                  allEta={this.state.allEta}
                  autoAssignVehicle={true}
                />
              </Grid>
            )}
            <Grid item sm={this.state.selectedTrip ? 5 : 8}>
              <Map google={google} setMap={this.setMap} zoom={6} />
            </Grid>
          </Grid>
        )}
      </Fragment>
    )
  }
}

export default withGoogleMaps(
  withApollo(withSharedSnackbar(SchoolBusTripModule))
)
