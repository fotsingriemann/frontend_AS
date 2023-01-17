import React, { Component } from 'react'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import {
  GET_ALL_ROUTES,
  GET_ALL_VEHICLES,
  GET_ROUTE_INFO,
  GET_ALL_AREAS,
  DELETE_ROUTE,
} from '@zeliot/common/graphql/queries'
import buffer from '@turf/buffer'
import RouteDetails from '../RoutesModule/RouteDetails'
import RouteList from '../RoutesModule/RouteList'
import RouteVehicleDetails from './RouteVehicleDetails'
import { withApollo } from 'react-apollo'
import withGoogleMaps from '@zeliot/common/hoc/withGoogleMaps'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import Map from '@zeliot/core/base/modules/TrackingControls/Maps/Map'
import getLoginId from '@zeliot/common/utils/getLoginId'
import gql from 'graphql-tag'
import { DEVICE_LOCATION } from '@zeliot/common/graphql/subscriptions'
import moment from 'moment'
import getCustomMarker from '@zeliot/core/base/modules/TripsModule/MapUtils/CustomMarker'
import getMultiLine from '@zeliot/core/base/modules/TripsModule/MapUtils/MultiLine'
import getCustomPopup from '@zeliot/core/base/modules/TripsModule/MapUtils/CustomPopup'
import ConfirmationModal from '../TripsDashboard/ConfirmationModal'
import {
  Paper,
  Grid,
  withStyles,
  Modal,
  Button,
  Typography,
  CircularProgress,
} from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

const UPDATE_ALERT_CONFIGURATIONS = gql`
  mutation(
    $alertConfigs: [AlertConfigInput!]
    $alertType: String!
    $loginId: Int!
  ) {
    setMultiDeviceAlertConfigs(
      alertConfigs: $alertConfigs
      clientLoginId: $loginId
      alertType: $alertType
    )
  }
`

const EDIT_ROUTE = gql`
  mutation($routeId: Int!, $edits: RouteEdit!) {
    editRoute(routeId: $routeId, edits: $edits) {
      status
      message
      reason {
        tripName
      }
    }
  }
`

const VEHICLE_ALERT_ASSOCIATION = gql`
  query(
    $clientLoginId: Int!
    $alertType: String!
    $routeId: Int
    $uniqueDeviceId: String
    $enableOnly: Boolean
  ) {
    getAllConfiguredDevices(
      clientLoginId: $clientLoginId
      alertType: $alertType
      routeId: $routeId
      uniqueId: $uniqueDeviceId
      enabledOnly: $enableOnly
    ) {
      email
      sms
      vehicleNumber
      uniqueDeviceId
    }
  }
`

const GET_VEHICLE_DETAIL = gql`
  query($id: String) {
    getVehicleDetail(deviceUniqueId_fk: $id) {
      vehicleType
    }
  }
`

const GET_LATEST_LOCATION = gql`
  query($id: String!) {
    latestLocation: getDeviceLatestLocation(deviceId: $id) {
      latitude
      longitude
    }
  }
`

const GET_ROUTE_OSM = gql`
  query($input: [RouteCoordinateInput!]!) {
    getRouteDetails(input: $input) {
      trip {
        legs {
          shape {
            lat
            lon
          }
        }
      }
    }
  }
`

const GET_ETA_OSM = gql`
  query($input: [RouteCoordinateInput!]!) {
    getRouteDetails(input: $input) {
      trip {
        summary {
          time
          length
        }
      }
    }
  }
`

const styles = (theme) => ({
  button: {
    margin: theme.spacing(1),
  },
  paper: {
    position: 'absolute',
    width: theme.spacing(50),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
  },
  buttonContainer: {
    marginTop: 15,
  },
})

function getModalStyle() {
  const top = 50
  const left = 50

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  }
}

let markerList = []
let fenceList = []
let directionsService = null
let directionsRenderer = null
let routePolygon = null
let routePolyline = null
let isRouteDrawn = false
let isFenceDrawn = false
let fence = null
let isRouteOnViewDrawn = false
// let editObject = {}

let count = 0
let markerInstance = null
let loop = null
let isAnimationActive = false

let CustomMarker
let MultiLine
let CustomPopup

class RoutesDashboard extends Component {
  constructor(props) {
    super(props)
    CustomMarker = getCustomMarker(props.google)
    MultiLine = getMultiLine(props.google)
    CustomPopup = getCustomPopup(props.google)
    this._customPopup = new CustomPopup()
  }

  state = {
    map: null,
    multiLine: null,
    places: [], // Get places
    placesCoordinates: [],
    areaTypeBuffer: [],
    aoiFenceBuffer: [],
    vehicles: null,
    selectedVehicle: [],
    allRoutes: null,
    allAreas: null,
    aoiCoordinates: null,
    areaType: null,
    selectedRoute: null, // Selected route to view
    selectedRouteDetails: null,
    geoJson: {},
    routeQueryActive: false,
    assignVehicle: false,
    email: [''],
    sms: [''],
    confirmDelete: false,
    deleteConfirmed: false,
    deletionStatus: null,
    confirmDeleteVehicle: false,
    associatedVehicles: null,
    liveData: {},
    eta: [],
    routeEditActive: false,
    editedRouteName: '',
    editedRoute: null,
    confirmEdit: false,
    openModal: false,
    vehicleAlertEditActive: false,
  }

  async componentDidMount() {
    await this.requestAllVehicles()
    this.fetchAllRoutes()
    this.fetchAllAreas()
  }

  // ** FETCH INITIAL STATES ** //-------------------------------------------------------------
  fetchAllRoutes = async () => {
    this.setState({ isLoading: true })
    const fetchedRoutes = await this.props.client.query({
      query: GET_ALL_ROUTES,
      variables: {
        clientLoginId: getLoginId(),
      },
    })
    // TODO: Handle error
    this.setState(
      { allRoutes: fetchedRoutes.data.getAllRoutes, isLoading: false },
      () => {
        this.handleRequestAreaSort('desc')
      }
    )
  }

  handleRequestAreaSort = (order) => {
    let routes = this.state.allRoutes
    if (order === 'asc') {
      routes.sort(function (a, b) {
        return a.createdAt - b.createdAt
      })
    } else {
      routes.sort(function (a, b) {
        return a.createdAt - b.createdAt
      })
      routes = routes.reverse()
    }
    this.setState({ allRoutes: routes })
  }

  fetchAllAreas = async () => {
    const fetchedAreas = await this.props.client.query({
      query: GET_ALL_AREAS,
      variables: {
        clientLoginId: getLoginId(),
      },
      // TODO: Always request from network and not from cache
      options: {
        fetchPolicy: 'network-only',
      },
    })
    // TODO: Handle error

    this.setState({ allAreas: fetchedAreas.data.getAllAreaDetails })
  }

  requestAllVehicles = async () => {
    const fetchedVehicles = await this.props.client.query({
      query: GET_ALL_VEHICLES,
      variables: {
        loginId: getLoginId(),
      },
    })
    this._unfilteredVehicles = fetchedVehicles.data.vehicles
    this.setState({ vehicles: fetchedVehicles.data.vehicles })
  }
  // ** FETCH INITIAL STATES ** //-------------------------------------------------------------

  // ** ROUTE DETAILS FUNCTIONS ** //----------------------------------------------------------
  getAlertConfiguration = async () => {
    const associatedVehicles = await this.props.client.query({
      query: VEHICLE_ALERT_ASSOCIATION,
      variables: {
        clientLoginId: getLoginId(),
        alertType: 'routefence',
        routeId: this.state.selectedRoute.id,
        uniqueDeviceId: null,
        enableOnly: true,
      },
    })
    if (associatedVehicles.data.getAllConfiguredDevices) {
      this.setState(
        {
          associatedVehicles: associatedVehicles.data.getAllConfiguredDevices,
        },
        () => {
          const allVehicles = [...this._unfilteredVehicles]
          const associatedVehicles = this.state.associatedVehicles
          for (var i = allVehicles.length - 1; i >= 0; i--) {
            for (var j = 0; j < associatedVehicles.length; j++) {
              if (
                allVehicles[i] &&
                allVehicles[i].deviceDetail.uniqueDeviceId ===
                  associatedVehicles[j].uniqueDeviceId
              ) {
                allVehicles.splice(i, 1)
                break
              }
            }
          }
          this.setState({ vehicles: allVehicles })
        }
      )
    }
  }

  handleRouteChange = (value) => {
    if (value) {
      // Clear existing routes first
      this.handleClearRoute()
      this.setState({ selectedRoute: value, routeQueryActive: true }, () => {
        // Request the route selected by user
        this.fetchRouteDetails(this.state.selectedRoute.id, () => {
          // Fetch all vehicles associated with this route
          this.getAlertConfiguration()

          this.setState({
            routeQueryActive: false,
            areaName: this.state.selectedRoute.areaName,
          })
          // Initialize services and plot route
          this.setDirectionServicesForView()

          // get coordinates for polyline on map
          this.drawRouteOnView()

          // get markers for coordinates
          this.drawMarkersOnView()

          // Calculate fence and show on map
          this.plotFenceOnMap(this.state.selectedRouteDetails.routeFence)
          // Draw AOI fences on map
          this.drawAoiFences()

          // Reset flags
          isFenceDrawn = true
          isRouteDrawn = true
        })
      })
    } else {
      this.handleClearRoute()
    }
  }

  fetchRouteDetails = async (areaId, proceed) => {
    const fetchedDetails = await this.props.client.query({
      query: GET_ROUTE_INFO,
      variables: {
        id: areaId,
      },
    })
    // TODO: Handle error

    this.setState(
      {
        selectedRouteDetails: JSON.parse(
          fetchedDetails.data.getRoute.routeDetail
        ),
        distance: JSON.parse(fetchedDetails.data.getRoute.routeDetail).distance,
        places: JSON.parse(fetchedDetails.data.getRoute.places),
        placesCoordinates: JSON.parse(
          fetchedDetails.data.getRoute.placeCoordinates
        ),
        areaTypeBuffer: JSON.parse(fetchedDetails.data.getRoute.areaTypeBuffer),
        aoiFenceBuffer: JSON.parse(fetchedDetails.data.getRoute.aoiFenceBuffer),
        createdOn: getFormattedTime(
          fetchedDetails.data.getRoute.createdAt,
          'lll'
        ),
      },
      () => {
        proceed()
      }
    )
  }
  // ** ROUTE DETAILS FUNCTIONS ** //----------------------------------------------------------

  // ** MAP UTILITY FUNCTIONS ** //-----------------------------------------------------
  setMap = (map) =>
    this.setState({ map }, () => {
      this.setState({ multiLine: new MultiLine(this.state.map) })
    })

  setDirectionServicesForView = () => {
    directionsRenderer = new this.props.google.maps.DirectionsRenderer({
      polylineOptions: {
        strokeColor: 'blue',
      },
    })
    directionsRenderer.setMap(this.state.map)
  }

  getRouteOSM = async () => {
    this.clearRoute()
    let index
    const length = this.state.placesCoordinates.length
    const waypoints = []
    for (index = 0; index < length; index++) {
      waypoints.push({
        lat: this.state.placesCoordinates[index].lat,
        lon: this.state.placesCoordinates[index].lng,
        type: 'break',
      })
    }
    let response = await this.props.client.query({
      query: GET_ROUTE_OSM,
      variables: {
        input: waypoints,
      },
    })

    if (response.data && response.data.getRouteDetails) {
      isRouteDrawn = true

      const legs = response.data.getRouteDetails.trip.legs
      const overviewPathLatLng = []

      // All intermediate points in the path
      for (let i = 0; i < legs.length; i++) {
        const steps = legs[i].shape
        for (let j = 0; j < steps.length; j++) {
          overviewPathLatLng.push({
            lat: steps[j].lat,
            lng: steps[j].lon,
          })
        }
      }

      // Save route created
      this.setState(
        ({ createdRoute }) => ({
          createdRoute: {
            ...createdRoute,
            route: overviewPathLatLng,
          },
          editedRoute: overviewPathLatLng,
        }),
        () => this.drawRouteOnView(overviewPathLatLng)
      )
    }
  }

  drawRouteOnView = (overviewPathLatLng) => {
    routePolyline = new this.props.google.maps.Polyline({
      path: overviewPathLatLng,
      strokeColor: '#0000FF',
      strokeWeight: 3,
    })

    // Plot markers and polyline
    routePolyline.setMap(this.state.map)
    // isFenceDrawn = true
  }

  // drawRoute = () => {
  //   this.clearRoute()
  //   let index
  //   const length = this.state.placesCoordinates.length
  //   const origin = this.state.placesCoordinates[0]
  //   const destination = this.state.placesCoordinates[length - 1]
  //   const waypoints = []
  //   // Initialize direction services
  //   this.setDirectionServicesForEdit()
  //   // Store waypoints between origin and destination
  //   for (index = 1; index < length - 1; index++) {
  //     waypoints.push({
  //       location: this.state.placesCoordinates[index],
  //       stopover: true
  //     })
  //   }
  //   // Request route
  //   directionsService.route(
  //     {
  //       origin: origin,
  //       destination: destination,
  //       waypoints: waypoints,
  //       optimizeWaypoints: this.state.optimalRoute,
  //       travelMode: 'DRIVING'
  //     },
  //     (response, status) => {
  //       if (status === 'OK') {
  //         isRouteDrawn = true
  //         directionsRenderer.setDirections(response)

  //         // Extract coordinates from response before storing
  //         const overviewPathLatLng = []
  //         const legs = response.routes[0].legs
  //         const lastLeg = legs.length - 1

  //         // Start point
  //         overviewPathLatLng.push({
  //           lat: legs[0]['start_location'].lat(),
  //           lng: legs[0]['start_location'].lng()
  //         })
  //         // All intermediate points in the path
  //         for (let i = 0; i < legs.length; i++) {
  //           const steps = legs[i].steps
  //           for (let j = 0; j < steps.length; j++) {
  //             const nextSegment = steps[j].path
  //             for (let k = 0; k < nextSegment.length; k += 3) {
  //               overviewPathLatLng.push({
  //                 lat: nextSegment[k].lat(),
  //                 lng: nextSegment[k].lng()
  //               })
  //             }
  //           }
  //         }
  //         // End point
  //         overviewPathLatLng.push({
  //           lat: legs[lastLeg]['end_location'].lat(),
  //           lng: legs[lastLeg]['end_location'].lng()
  //         })

  //         // Save route edited
  //         this.setState({ editedRoute: overviewPathLatLng })
  //       } else {
  //         this.props.openSnackbar('Request from Google failed due to ' + status)
  //       }
  //     }
  //   )
  // }

  drawRouteFenceOnEdit = () => {
    if (this.state.editedRoute && this.state.distance >= 25) {
      const response = this.state.editedRoute
      if (isFenceDrawn) {
        routePolygon.setMap(null)
      }
      isFenceDrawn = true
      const overviewPath = response

      const distance = parseFloat(this.state.distance) / 1000 // in Km

      // Change to geoJson format to get fence
      const overviewPathGeo = []
      for (let i = 0; i < overviewPath.length; i++) {
        overviewPathGeo.push([overviewPath[i].lng, overviewPath[i].lat])
      }

      const geoJsonPath = {
        type: 'LineString',
        coordinates: overviewPathGeo,
      }

      // Buffered lineString according to fence radius
      // TODO: Incerese steps. Required to increase steps if points are far away
      var polygon = buffer(geoJsonPath, distance) // in Km

      // Change to google coordinates to plot polygon
      const googlePathGeo = []
      const geoJsonCoordinates = []
      const googlePathCoordinates = polygon.geometry.coordinates[0]
      const googlePathLength = polygon.geometry.coordinates[0].length
      for (let i = 0; i < googlePathLength; i++) {
        const item = googlePathCoordinates[i]
        googlePathGeo.push(new this.props.google.maps.LatLng(item[1], item[0]))
        geoJsonCoordinates.push([item[1], item[0]])
      }

      // Save route fence created
      this.setState({ routeFence: googlePathGeo })

      const geoJson = {
        type: 'Polygon',
        coordinates: [geoJsonCoordinates],
      }
      this.setState({ geoJson })

      // Plot the fence
      this.plotFenceOnMap(googlePathGeo)
    } else {
      this.props.openSnackbar(
        'Route fence radius has to be more than 25 meters.'
      )
    }
  }

  setDirectionServicesForEdit = () => {
    directionsService = new this.props.google.maps.DirectionsService()
    directionsRenderer = new this.props.google.maps.DirectionsRenderer({
      draggable: true,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: 'blue',
      },
    })
    directionsRenderer.setMap(this.state.map)

    directionsRenderer.addListener('directions_changed', () => {
      this.getEditedRoute(directionsRenderer.getDirections())
    })
  }

  getEditedRoute = (editedRoute) => {
    // Check if fence exists. Remove if exists while editing route
    if (isFenceDrawn) {
      routePolygon.setMap(null)
    }
    // Process response before saving
    // Extract coordinates from response before storing
    const overviewPathLatLng = []
    const legs = editedRoute.routes[0].legs
    const lastLeg = legs.length - 1

    // Start point
    overviewPathLatLng.push({
      lat: legs[0]['start_location'].lat(),
      lng: legs[0]['start_location'].lng(),
    })
    // All intermediate points in the path
    for (let i = 0; i < legs.length; i++) {
      const steps = legs[i].steps
      for (let j = 0; j < steps.length; j++) {
        const nextSegment = steps[j].path
        for (let k = 0; k < nextSegment.length; k += 3) {
          overviewPathLatLng.push({
            lat: nextSegment[k].lat(),
            lng: nextSegment[k].lng(),
          })
        }
      }
    }
    // End point
    overviewPathLatLng.push({
      lat: legs[lastLeg]['end_location'].lat(),
      lng: legs[lastLeg]['end_location'].lng(),
    })

    // Save route edited
    this.setState({ editedRoute: overviewPathLatLng })
  }

  drawAoiFences = () => {
    let i = 0
    this.state.areaTypeBuffer.forEach((type, index) => {
      if (type === 'places') {
        const radius = this.state.selectedRouteDetails.distance
        this.drawStaticCircularFence(
          radius,
          this.state.placesCoordinates[index]
        )
      } else if (type === 'Circle') {
        this.drawStaticCircularFence(
          this.state.aoiFenceBuffer[i++],
          this.state.placesCoordinates[index]
        )
      } else if (type === 'Polygon') {
        this.drawStaticPolygonFence(this.state.aoiFenceBuffer[i++])
      }
    })
  }

  drawStaticCircularFence = (radius, center) => {
    // Draw fence
    const circularFence = new this.props.google.maps.Circle({
      strokeColor: '#000000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      map: this.state.map,
      center: center,
      radius: parseFloat(radius),
    })
    // Record this fence
    fenceList.push(circularFence)
  }

  drawStaticPolygonFence = (polyFence) => {
    // Draw fence
    const polygonFence = new this.props.google.maps.Polygon({
      paths: polyFence,
      strokeColor: '#000000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
    })
    // Store this fence
    polygonFence.setMap(this.state.map)
    fenceList.push(polygonFence)
  }

  plotFenceOnMap = (googlePathGeo) => {
    // Plot fence on map
    if (routePolygon && routePolygon.setMap) routePolygon.setMap(null)
    routePolygon = new this.props.google.maps.Polygon({
      paths: googlePathGeo,
      map: this.state.map,
    })
  }

  drawRouteOnView = () => {
    const routePolylineCoordinates = []
    const pointsOnRoute = this.state.selectedRouteDetails.route
    for (let i = 0; i < pointsOnRoute.length; i++) {
      routePolylineCoordinates.push(pointsOnRoute[i])
    }

    routePolyline = new this.props.google.maps.Polyline({
      path: routePolylineCoordinates,
      strokeColor: '#0000FF',
      strokeWeight: 3,
    })

    // Plot markers and polyline
    routePolyline.setMap(this.state.map)
    isRouteOnViewDrawn = true
    isFenceDrawn = true
  }

  drawMarkersOnView = () => {
    const markerCoordinates = this.state.placesCoordinates
    const bounds = new this.props.google.maps.LatLngBounds()

    markerCoordinates.forEach((coordinate, index) => {
      const marker = new this.props.google.maps.Marker({
        position: coordinate,
        label: (index + 1).toString(),
        map: this.state.map,
      })
      markerList.push(marker)
      // Plot marker
      marker.setMap(this.state.map)

      // Fit map bounds
      const extendPoints = new this.props.google.maps.LatLng({
        lat: coordinate.lat,
        lng: coordinate.lng,
      })
      bounds.extend(extendPoints)
    })
    this.state.map.fitBounds(bounds)
  }
  // ** MAP UTILITY FUNCTIONS ** //-----------------------------------------------------

  // ** CLEAR FUNCTIONS ** //------------------------------------------------------------
  handleClearRoute = () => {
    this.clearRoute()
    this.clearMarkers()
    this.clearAoiFences()
    this.clearRouteVariables()
  }

  clearRoute = () => {
    if (isRouteDrawn) {
      directionsRenderer.setMap(null)
      isRouteDrawn = false
    }
    if (isFenceDrawn) {
      routePolygon.setMap(null)
      isFenceDrawn = false
    }
    if (isRouteOnViewDrawn) {
      routePolyline.setMap(null)
      isRouteOnViewDrawn = false
    }
  }

  clearRouteVariables = () => {
    this.setState({
      places: [],
      placesCoordinates: [],
      selectedRoute: null,
      selectedRouteDetails: null,
      areaTypeBuffer: [],
      aoiFenceBuffer: [],
      createdOn: null,
      associatedVehicles: null,
      selectedVehicle: [],
    })
  }

  clearMarkers = () => {
    if (markerList.length > 0) {
      for (let i = 0; i < markerList.length; i++) {
        markerList[i].setMap(null)
      }
      markerList = []
    }
  }

  clearFence = () => {
    if (fence) {
      fence.setMap(null)
      fence = null
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
  // ** CLEAR FUNCTIONS ** //------------------------------------------------------------

  // ** ALERT CONFIG FUNCTIONS ** //------------------------------------------------------
  handleVehicleChange = (selectedVehicle) => {
    this.setState({ selectedVehicle })
  }

  addVehicles = () => {
    this.setState({ assignVehicle: true })
  }

  clearVehicle = () => {
    this.setState({ assignVehicle: false })
  }

  validateAlertInputs = () => {
    if (this.state.selectedVehicle.length < 1) {
      this.props.openSnackbar('Choose a vehicle to assign alert')
      return false
    } else {
      return true
    }
  }

  validate = () => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    const phoneRegex = /\+?\d{9,11}$/

    for (const email of this.state.email) {
      if (email && !emailRegex.test(email)) {
        this.props.openSnackbar('Invalid email', { type: 'warning' })
        return false
      }
    }

    for (const phone of this.state.sms) {
      if (phone && !phoneRegex.test(phone)) {
        this.props.openSnackbar('Invalid phone', { type: 'warning' })
        return false
      }
    }

    return true
  }

  handleEmailChange = (email, index) => {
    const storedEmails = this.state.email
    storedEmails[index] = email
    this.setState({ emails: storedEmails })
  }

  handleNumberChange = (number, index) => {
    const storedNumbers = this.state.sms
    storedNumbers[index] = number
    this.setState({ numbers: storedNumbers })
  }

  handleAddNumberField = () => {
    const lastEntry = this.state.sms.length - 1
    if (this.state.sms[lastEntry] === '') {
      this.props.openSnackbar('Fill contact number before adding more')
    } else this.setState({ sms: [...this.state.sms, ''] })
  }

  handleAddEmailField = () => {
    const lastEntry = this.state.email.length - 1
    if (this.state.email[lastEntry] === '') {
      this.props.openSnackbar('Fill email details before adding more')
    } else {
      this.setState({ email: [...this.state.email, ''] })
    }
  }

  handleDeleteNumberField = (index) => {
    if (this.state.sms.length > 1) {
      // Don't delete all entries
      var array = [...this.state.sms] // make a separate copy of the array
      if (index !== -1) {
        array.splice(index, 1)
        this.setState({ sms: array })
      }
    }
  }

  handleDeleteEmailField = (index) => {
    if (this.state.email.length > 1) {
      // Don't delete all entries
      var array = [...this.state.email] // make a separate copy of the array
      if (index !== -1) {
        array.splice(index, 1)
        this.setState({ email: array })
      }
    }
  }

  updateAlertConfigs = async () => {
    const isValid = this.validateAlertInputs()

    if (!this.validate()) return

    const emailString = this.state.email.join(',')
    const smsString = this.state.sms.join(',')
    if (isValid) {
      const response = await this.props.client.mutate({
        mutation: UPDATE_ALERT_CONFIGURATIONS,
        variables: {
          loginId: getLoginId(),
          alertType: 'routefence',
          alertConfigs: this.state.selectedVehicle.map((vehicle) => ({
            uniqueDeviceId: vehicle.deviceDetail.uniqueDeviceId,
            fromTimestamp: '0',
            toTimestamp: '0',
            isAlertEnable: true,
            email: emailString || null,
            sms: smsString || null,
            routeId: this.state.selectedRoute.id,
          })),
        },
        refetchQueries: [
          {
            query: VEHICLE_ALERT_ASSOCIATION,
            variables: {
              clientLoginId: getLoginId(),
              uniqueDeviceId: null,
              enableOnly: true,
              alertType: 'routefence',
              routeId: this.state.selectedRoute.id,
            },
          },
        ],
        awaitRefetchQueries: true,
      })

      if (response.data && response.data.setMultiDeviceAlertConfigs) {
        this.props.openSnackbar('Alerts configured')
        this.setState({ selectedVehicle: [], assignVehicle: false })
        this.getAlertConfiguration()
      } else {
        this.props.openSnackbar('Failed to configure alert')
        this.setState({ selectedVehicle: [], assignVehicle: false })
      }
    }
  }
  // ** ALERT CONFIG FUNCTIONS ** //------------------------------------------------------

  // ** DELETE FUNCTIONS ** //------------------------------------------------------------
  handleVehicleAssociationDelete = (vehicle) => {
    this.setState({
      confirmDeleteVehicle: true,
      selectedAssociatedVehicle: vehicle,
    })
  }

  handleConfirmDeleteVehicle = async () => {
    const response = await this.props.client.mutate({
      mutation: UPDATE_ALERT_CONFIGURATIONS,
      variables: {
        loginId: getLoginId(),
        alertType: 'routefence',
        alertConfigs: [
          {
            uniqueDeviceId: this.state.selectedAssociatedVehicle.uniqueDeviceId.toString(),
            fromTimestamp: '0',
            toTimestamp: '0',
            isAlertEnable: false,
            email: null,
            sms: null,
            routeId: this.state.selectedRoute.id,
          },
        ],
      },
      refetchQueries: [
        {
          query: VEHICLE_ALERT_ASSOCIATION,
          variables: {
            clientLoginId: getLoginId(),
            uniqueDeviceId: null,
            enableOnly: true,
            alertType: 'routefence',
            routeId: this.state.selectedRoute.id,
          },
        },
      ],
      awaitRefetchQueries: true,
    })

    if (response.data && response.data.setMultiDeviceAlertConfigs) {
      this.props.openSnackbar('Vehicle association removed')
      this.setState({
        selectedVehicle: [],
        assignVehicle: false,
        selectedAssociatedVehicle: null,
      })
      this.handleVehicleDeleteClose()
      this.getAlertConfiguration()
    } else {
      this.props.openSnackbar('Failed to remove association')
      this.setState({
        selectedVehicle: [],
        assignVehicle: false,
        selectedAssociatedVehicle: null,
      })
    }
  }

  handleDeletePress = () => this.setState({ confirmDelete: true })

  handleClose = () => this.setState({ confirmDelete: false })

  confirmDeleteRoute = async () => {
    this.handleClose()
    await this.deleteRouteById()
    this.setState({ deleteConfirmed: true })
  }

  handleOkClose = () => {
    setTimeout(this.setState({ deleteConfirmed: false }), 500)
  }

  handleVehicleDeleteClose = () => {
    this.setState({
      confirmDeleteVehicle: false,
      selectedAssociatedVehicle: null,
    })
  }

  deleteRouteById = async () => {
    this.setState({ deletionStatus: null })
    const response = await this.props.client.mutate({
      mutation: DELETE_ROUTE,
      variables: {
        id: this.state.selectedRoute.id,
      },
      refetchQueries: [
        {
          query: GET_ALL_ROUTES,
          variables: {
            clientLoginId: getLoginId(),
          },
        },
      ],
      awaitRefetchQueries: true,
    })
    if (response.data) {
      if (response.data.deleteUnusedRoute) {
        this.setState({ deletionStatus: true, selectedRoute: null })
        this.fetchAllRoutes()
        this.handleClearRoute()
      } else {
        this.setState({ deletionStatus: false, selectedRoute: null })
      }
    }
  }
  // ** DELETE FUNCTIONS ** //-------------------------------------------------------------------

  // ** NAVIGATION FUNCTIONS ** // -----------------------------------------------------------------
  handleBackPress = () => this.handleRouteChange(null)

  handleVehicleBackPress = () => {
    this.setState({
      selectedAssociatedVehicle: null,
      email: [''],
      sms: [''],
      isLiveTracking: false,
    })
    this.resetLiveTracking()
    this.clearMapVariable()
  }
  // ** NAVIGATION FUNCTIONS ** // -----------------------------------------------------------------

  // ** LIVE TRACKING FUNCTIONS ** //-------------------------------------------------------------------
  isOffline = (timestamp) => {
    // timestamp is assumed to be UTC+0
    var d = new Date()
    var currentTime = Math.round(d.getTime() / 1000)
    return currentTime - parseInt(timestamp) > 1800
  }

  setupSubscription = () => {
    this.deviceSubscription = this.props.client.subscribe({
      query: DEVICE_LOCATION,
      variables: {
        deviceId: this.state.selectedAssociatedVehicle.uniqueDeviceId,
        snapToRoad: true,
      },
    })
  }

  resetLiveTracking = () => {
    isAnimationActive = false
    count = 0
    this.setState({
      livedata: {
        device: [],
        pointsReceived: 0,
      },
    })
    this.breakTimeout()
  }

  animateLive = () => {
    const device = this.state.liveData.device
    const pointsReceived = this.state.liveData.pointsReceived

    if (markerInstance && device && pointsReceived > 0) {
      markerInstance.updateMarker(
        {
          lat: parseFloat(device[count].latitude.toFixed(6)),
          lng: parseFloat(device[count].longitude.toFixed(6)),
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
          speed: device[count].speed,
          /* eslint-enable indent */
        },
        10000 / pointsReceived // Calculate interval when snapped points are received
      )
      if (count < pointsReceived - 1) {
        count = count + 1
        // TODO: implement queue instead
        loop = setTimeout(this.animateLive, 10000 / pointsReceived)
      } else {
        this.resetLiveTracking()
      }
    }
  }

  startSubscription = () => {
    // TODO: Request ETA for new location received
    this.setState({ isLiveTracking: true })
    this.unsubHandle = this.deviceSubscription.subscribe({
      next: ({ data }) => {
        if (isAnimationActive) {
          this.resetLiveTracking()
          this.setState(
            {
              liveData: {
                device: data.deviceLiveTracking,
                pointsReceived: data.deviceLiveTracking.length,
              },
            },
            () => {
              count = 0
              this.requestEta()
              this.animateLive()
            }
          )
        } else {
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
              this.requestEta()
              this.animateLive()
            }
          )
        }
      },
    })
  }

  stopSubscription = () => {
    this.setState({ isLiveTracking: false })
    if (this.unsubHandle) this.unsubHandle.unsubscribe()
  }

  handleRequestLive = async () => {
    this.setupSubscription()

    // Vehicle type for marker icon
    const response = await this.props.client.query({
      query: GET_VEHICLE_DETAIL,
      variables: {
        id: this.state.selectedAssociatedVehicle.uniqueDeviceId,
      },
    })
    let vehicleType = 'car'
    if (response.data) {
      vehicleType = response.data.getVehicleDetail.vehicleType
    }

    // Get latest location before subscription to show marker
    const location = await this.props.client.query({
      query: GET_LATEST_LOCATION,
      variables: {
        id: this.state.selectedAssociatedVehicle.uniqueDeviceId,
      },
    })

    let latitude = null
    let longitude = null

    if (location.data) {
      latitude = location.data.latestLocation.latitude
      longitude = location.data.latestLocation.longitude

      this.setState(
        {
          liveData: {
            device: [
              {
                latitude: location.data.latestLocation.latitude,
                longitude: location.data.latestLocation.longitude,
              },
            ],
            pointsReceived: 1,
          },
        },
        () => {
          this.requestEta()
        }
      )
    }

    // Live marker
    markerInstance = new CustomMarker(
      {
        uniqueId: this.state.selectedAssociatedVehicle.uniqueDeviceId,
        latitude: latitude,
        longitude: longitude,
        idlingStatus: false,
        haltStatus: false,
        timestamp: moment().unix(),
        speed: 0,
        vehicleType: vehicleType,
      },
      this.state.map,
      this.state.multiLine
    )

    // Move to vehicle being tracked
    this.state.map.setCenter(
      new this.props.google.maps.LatLng(latitude, longitude)
    )

    // Start subscription for live tracking
    this.startSubscription()
  }

  handleCancelLiveTracking = () => {
    this.resetLiveTracking()
    this.stopSubscription()
    this.clearMapVariable()
  }

  clearMapVariable = () => {
    if (this.state.multiLine instanceof MultiLine) {
      this.state.multiLine.remove()
    }
    if (markerInstance) markerInstance.setMap(null)
    markerInstance = null
    if (this._customPopup) {
      this._customPopup.setMap(null)
      this._customPopup.setPosition(undefined)
    }
  }

  breakTimeout = () => {
    if (loop) {
      clearTimeout(loop)
      loop = null
    }
  }
  // ** LIVE TRACKING FUNCTIONS ** //-------------------------------------------------------------------

  // ** IN-PROGRESS ETA AND POLLING FUNCTIONS ** //-----------------------------------------------------
  getEtaOSM = async (waypoints, index) => {
    waypoints.push()
    let response = await this.props.client.query({
      query: GET_ETA_OSM,
      variables: {
        input: waypoints,
      },
    })
    if (response.data && response.data.getRouteDetails) {
      let eta = (response.data.getRouteDetails.trip.summary.time / 60)
        .toFixed(2)
        .toString()
      this.setState({ eta }, () => {
        console.log(this.state.eta)
        this.setPopup(index)
      })
    }
  }

  requestEta = () => {
    this.setState({ eta: [] }, () => {
      // Latest subscription data
      this.state.placesCoordinates.forEach((place, index) => {
        if (
          Object.keys(this.state.liveData).length > 0 &&
          this.state.liveData.device.length > 0
        ) {
          // calculated ETA
          const liveFeed = this.state.liveData.device[0]

          // Latest live packet from subscription
          var origin = {
            lat: parseFloat(liveFeed.latitude.toFixed(6)),
            lon: parseFloat(liveFeed.longitude.toFixed(6)),
            type: 'break',
          }
          // TODO: Next waypoint coordinates
          var destination = {
            lat: parseFloat(place.lat.toFixed(6)),
            lon: parseFloat(place.lng.toFixed(6)),
            type: 'break',
          }

          this.getEtaOSM([origin, destination], index)

          // var service = new this.props.google.maps.DistanceMatrixService()
          // service.getDistanceMatrix(
          //   {
          //     origins: [origin],
          //     destinations: [destination],
          //     travelMode: 'DRIVING',
          //     unitSystem: this.props.google.maps.UnitSystem.METRIC,
          //     avoidHighways: false,
          //     avoidTolls: false
          //   },
          //   (response, status) => {
          //     if (status !== 'OK') {
          //       console.log('Error was: ' + status)
          //     } else {
          //       if (response) {
          //         this.setState(
          //           ({ eta }) => ({
          //             eta: [...eta, response.rows[0].elements[0].duration.text]
          //           }),
          //           () => {
          //             this.setPopup(index)
          //           }
          //         )
          //       }
          //     }
          //   }
          // )
        }
      })
    })
  }

  // Set popup to show ETA
  setPopup = (index) => {
    this.props.google.maps.event.addListener(
      markerList[index],
      'mouseover',
      () => {
        this.props.google.maps.event.trigger(this.state.map, 'mouseover')
        this._customPopup.setPopupData({
          eta: `${this.state.eta[index]} min`,
        })
        // Next waypoint coordinate
        this._customPopup.setPosition(
          new this.props.google.maps.LatLng({
            lat: this.state.placesCoordinates[index].lat,
            lng: this.state.placesCoordinates[index].lng,
          })
        )
        this._customPopup.setMap(this.state.map)
      }
    )

    this.props.google.maps.event.addListener(
      markerList[index],
      'mouseout',
      () => {
        this._customPopup.setPopupData({
          eta: '',
        })
        // Next waypoint coordinate
        this._customPopup.setPosition(undefined)
        this._customPopup.setMap(null)
      }
    )
  }
  // ** IN-PROGRESS ETA AND POLLING FUNCTIONS ** //-----------------------------------------------------

  onSelectedAssociatedVehicle = (selectedAssociatedVehicle) =>
    this.setState({ selectedAssociatedVehicle }, () => {
      this.getAssociatedVehicleDetails()
    })

  getAssociatedVehicleDetails = async () => {
    const response = await this.props.client.query({
      query: VEHICLE_ALERT_ASSOCIATION,
      variables: {
        clientLoginId: getLoginId(),
        uniqueDeviceId: this.state.selectedAssociatedVehicle.uniqueDeviceId,
        enableOnly: true,
        alertType: 'routefence',
        routeId: this.state.selectedRoute.id,
      },
    })

    if (response.data.getAllConfiguredDevices) {
      const emailString = response.data.getAllConfiguredDevices[0].email
      const smsString = response.data.getAllConfiguredDevices[0].sms
      this.processContactDetails(emailString, smsString)
    }
  }

  processContactDetails = (emailString, smsString) => {
    if (emailString) {
      const email = emailString.split(',')
      this.setState({ email })
    } else {
      this.setState({ email: [''] })
    }
    if (smsString) {
      const sms = smsString.split(',')
      this.setState({ sms })
    } else {
      this.setState({ sms: [''] })
    }
  }

  handleEditPress = () => {
    // this.formEditObject()
    this.setState({ routeEditActive: true })
    this.clearRoute()
    // this.drawRoute()
    this.getRouteOSM()
  }

  handleConfirmEditPress = () => {
    this.setState({ confirmEdit: true })
    this.drawRouteFenceOnEdit()
  }

  saveEditedRoute = async () => {
    const editedRouteDetails = {
      name: this.state.areaName,
      distance: this.state.distance,
      route: this.state.editedRoute,
      routeFence: this.state.routeFence,
    }

    const response = await this.props.client.mutate({
      mutation: EDIT_ROUTE,
      variables: {
        routeId: this.state.selectedRoute.id,
        edits: {
          areaName: this.state.areaName,
          geoJson: JSON.stringify(this.state.geoJson),
          routeDetail: JSON.stringify(editedRouteDetails),
        },
      },
      refetchQueries: [
        {
          query: GET_ALL_ROUTES,
          variables: {
            clientLoginId: getLoginId(),
          },
        },
      ],
      awaitRefetchQueries: true,
    })
    if (response.data.editRoute) {
      let reason = ''
      if (!response.data.editRoute.status) {
        const tripName = response.data.editRoute.reason.tripName
        reason =
          'A trip by the name of ' +
          tripName +
          ' is using this route. Hence the route cannot be edited.'
      }
      this.setState(
        {
          selectedRoute: null,
          openModal: true,
          modalMessage: response.data.editRoute.message,
          modalReason: reason,
          routeEditActive: false,
        },
        () => {
          this.fetchAllRoutes()
          this.handleClearRoute()
        }
      )
    }
  }

  handleCancelEditPress = () => {
    this.setState({ routeEditActive: false })
    this.clearRoute()
    this.drawRouteOnView()
    this.plotFenceOnMap(this.state.selectedRouteDetails.routeFence)
  }

  handleEditConfirmationClose = () => {
    this.setState({ confirmEdit: false })
  }

  handleEditedTextChange = (name, value) => {
    this.setState({ [name]: value })
  }

  handleModalOkPress = () => {
    this.setState({ openModal: false })
  }

  handleVehicleAlertEdit = () => {
    this.setState({ vehicleAlertEditActive: true })
  }

  handleCancelVehicleEditPress = () => {
    this.setState({ vehicleAlertEditActive: false })
  }

  handleConfirmVehicleEdit = async () => {
    if (!this.validate()) return

    const emailString = this.state.email.join(',')
    const smsString = this.state.sms.join(',')

    const response = await this.props.client.mutate({
      mutation: UPDATE_ALERT_CONFIGURATIONS,
      variables: {
        loginId: getLoginId(),
        alertType: 'routefence',
        alertConfigs: [
          {
            uniqueDeviceId: this.state.selectedAssociatedVehicle.uniqueDeviceId.toString(),
            fromTimestamp: '0',
            toTimestamp: '0',
            isAlertEnable: true,
            email: emailString || null,
            sms: smsString || null,
            routeId: this.state.selectedRoute.id,
          },
        ],
      },
      refetchQueries: [
        {
          query: VEHICLE_ALERT_ASSOCIATION,
          variables: {
            clientLoginId: getLoginId(),
            uniqueDeviceId: this.state.selectedAssociatedVehicle.uniqueDeviceId.toString(),
            enableOnly: true,
            alertType: 'routefence',
            routeId: this.state.selectedRoute.id,
          },
        },
      ],
      awaitRefetchQueries: true,
    })

    if (response.data && response.data.setMultiDeviceAlertConfigs) {
      this.props.openSnackbar('Vehicle alerts updated')
      this.setState({
        selectedVehicle: [],
        assignVehicle: false,
        selectedAssociatedVehicle: null,
      })
      this.getAlertConfiguration()
      this.handleCancelVehicleEditPress()
      // reset email, sms states
      this.setState({ email: [''], sms: [''] })
    } else {
      this.props.openSnackbar('Failed to update alerts')
      this.setState({
        selectedVehicle: [],
        assignVehicle: false,
        selectedAssociatedVehicle: null,
      })
      this.handleCancelVehicleEditPress()
      // reset email, sms states
      this.setState({ email: [''], sms: [''] })
    }
  }

  render() {
    const { google, classes } = this.props

    return (
      <Grid container>
        <ConfirmationModal
          openModal={this.state.openModal}
          modalMessage={this.state.modalMessage}
          reason={this.state.modalReason}
          handleOkClose={this.handleModalOkPress}
        />

        {/* Deletion prompt modal */}
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.confirmEdit}
          onClose={this.handleEditConfirmationClose}
        >
          <div style={getModalStyle()} className={classes.paper}>
            <Typography variant="h6" id="modal-title">
              Are you sure?
            </Typography>
            <Typography variant="subtitle1" id="simple-modal-description">
              This will edit the records for this route.
            </Typography>
            <Grid
              container
              justify="space-between"
              className={classes.buttonContainer}
            >
              <Grid item>
                <ColorButton
                  style={styles.button}
                  color="default"
                  variant="contained"
                  onClick={this.handleEditConfirmationClose}
                >
                  Cancel
                </ColorButton>
              </Grid>
              <Grid item>
                <ColorButton
                  style={styles.button}
                  color="primary"
                  variant="contained"
                  onClick={() => {
                    this.saveEditedRoute()
                    this.handleEditConfirmationClose()
                  }}
                >
                  Confirm
                </ColorButton>
              </Grid>
            </Grid>
          </div>
        </Modal>

        {/* Deletion confirmation modal */}
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.deleteConfirmed}
          onClose={this.handleOkClose}
        >
          <div style={getModalStyle()} className={classes.paper}>
            <Typography variant="h6" id="modal-title">
              {this.state.deletionStatus
                ? 'Deleted successfully!'
                : 'This Route is associated with a trip, and cannot be deleted'}
            </Typography>
            <Grid
              container
              justify="space-between"
              className={classes.buttonContainer}
            >
              <Grid item>
                <ColorButton
                  style={styles.button}
                  color="default"
                  variant="contained"
                  onClick={this.handleOkClose}
                >
                  Ok
                </ColorButton>
              </Grid>
            </Grid>
          </div>
        </Modal>

        {/* Deletion prompt modal */}
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.confirmDelete}
          onClose={this.handleClose}
        >
          <div style={getModalStyle()} className={classes.paper}>
            <Typography variant="h6" id="modal-title">
              Are you sure?
            </Typography>
            <Typography variant="subtitle1" id="simple-modal-description">
              This will delete all the records for this route.
            </Typography>
            <Grid
              container
              justify="space-between"
              className={classes.buttonContainer}
            >
              <Grid item>
                <ColorButton
                  style={styles.button}
                  color="default"
                  variant="contained"
                  onClick={this.handleClose}
                >
                  Cancel
                </ColorButton>
              </Grid>
              <Grid item>
                <ColorButton
                  style={styles.button}
                  color="primary"
                  variant="contained"
                  onClick={this.confirmDeleteRoute}
                >
                  Confirm
                </ColorButton>
              </Grid>
            </Grid>
          </div>
        </Modal>

        {/* Deletion prompt for vehicle */}
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.confirmDeleteVehicle}
          onClose={this.handleVehicleDeleteClose}
        >
          <div style={getModalStyle()} className={classes.paper}>
            <Typography variant="h6" id="modal-title">
              Are you sure?
            </Typography>
            <Typography variant="subtitle1" id="simple-modal-description">
              This will delete this vehicle and route's association.
            </Typography>
            <Grid
              container
              justify="space-between"
              className={classes.buttonContainer}
            >
              <Grid item>
                <ColorButton
                  style={styles.button}
                  color="default"
                  variant="contained"
                  onClick={this.handleVehicleDeleteClose}
                >
                  Cancel
                </ColorButton>
              </Grid>
              <Grid item>
                <ColorButton
                  style={styles.button}
                  color="primary"
                  variant="contained"
                  onClick={this.handleConfirmDeleteVehicle}
                >
                  Confirm
                </ColorButton>
              </Grid>
            </Grid>
          </div>
        </Modal>

        <Grid item xs={12} md={4}>
          <Paper
            square
            elevation={8}
            style={{ height: '450px', overflow: 'auto', padding: 10 }}
          >
            {this.state.isLoading && (
              <Grid
                container
                style={{ height: '100%' }}
                justify="center"
                alignItems="center"
              >
                <CircularProgress />
              </Grid>
            )}
            {!this.state.selectedRoute ? (
              this.state.allRoutes && (
                <RouteList
                  routes={this.state.allRoutes}
                  onSelectedRoute={this.handleRouteChange}
                  onRequestAreaSort={this.handleRequestAreaSort}
                />
              )
            ) : !this.state.selectedAssociatedVehicle ||
              this.state.confirmDeleteVehicle ? (
              <RouteDetails
                routeName={
                  this.state.selectedRoute
                    ? this.state.selectedRoute.areaName
                    : null
                }
                emails={this.state.email}
                numbers={this.state.sms}
                onEmailChange={this.handleEmailChange}
                onNumberChange={this.handleNumberChange}
                handleAddEmailField={this.handleAddEmailField}
                handleDeleteEmailField={this.handleDeleteEmailField}
                handleAddNumberField={this.handleAddNumberField}
                handleDeleteNumberField={this.handleDeleteNumberField}
                assignVehicle={this.state.assignVehicle}
                saveAlert={this.updateAlertConfigs}
                addVehicles={this.addVehicles}
                clearVehicle={this.clearVehicle}
                vehicles={this.state.vehicles}
                selectedVehicle={this.state.selectedVehicle}
                handleVehicleChange={this.handleVehicleChange}
                routeQueryActive={this.state.routeQueryActive}
                waypoints={this.state.places ? this.state.places : null}
                createdOn={this.state.createdOn}
                onBackPress={this.handleBackPress}
                onDeletePress={this.handleDeletePress}
                onEditPress={this.handleEditPress}
                onEditedTextChange={this.handleEditedTextChange}
                onConfirmEditPress={this.handleConfirmEditPress}
                onCancelEditPress={this.handleCancelEditPress}
                associatedVehicles={this.state.associatedVehicles}
                onSelectedAssociatedVehicle={this.onSelectedAssociatedVehicle}
                onVehicleAssociationDelete={this.handleVehicleAssociationDelete}
                routeEditActive={this.state.routeEditActive}
                fenceRadius={
                  this.state.selectedRouteDetails
                    ? this.state.selectedRouteDetails.distance
                    : ''
                }
                onViewFencePress={this.drawRouteFenceOnEdit}
              />
            ) : (
              <RouteVehicleDetails
                onBackPress={this.handleVehicleBackPress}
                emails={this.state.email ? this.state.email : []}
                sms={this.state.sms ? this.state.sms : []}
                selectedAssociatedVehicle={this.state.selectedAssociatedVehicle}
                onLiveRequest={this.handleRequestLive}
                isLiveTracking={this.state.isLiveTracking}
                onCancelLiveTracking={this.handleCancelLiveTracking}
                vehicleAlertEditActive={this.state.vehicleAlertEditActive}
                onvehicleAlertEdit={this.handleVehicleAlertEdit}
                onEmailChange={this.handleEmailChange}
                onNumberChange={this.handleNumberChange}
                handleAddEmailField={this.handleAddEmailField}
                handleDeleteEmailField={this.handleDeleteEmailField}
                handleAddNumberField={this.handleAddNumberField}
                handleDeleteNumberField={this.handleDeleteNumberField}
                onCancelEditPress={this.handleCancelVehicleEditPress}
                onConfirmVehicleEdit={this.handleConfirmVehicleEdit}
              />
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Map google={google} setMap={this.setMap} zoom={6} />
        </Grid>
      </Grid>
    )
  }
}

export default withGoogleMaps(
  withApollo(withSharedSnackbar(withStyles(styles)(RoutesDashboard)))
)
