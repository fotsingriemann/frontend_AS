import React, { Component, Fragment } from 'react'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import withGoogleMaps from '@zeliot/common/hoc/withGoogleMaps'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import SimpleModal from '@zeliot/common/ui/SimpleModal'
import penMarkerIcon from '@zeliot/common/static/png/penmarker.png'
import schoolMarkerIcon from '@zeliot/common/static/png/school.png'
import Map from '@zeliot/core/base/modules/TrackingControls/Maps/Map'
import Waypoints from './Waypoints'
import RouteTabView from './RouteTabView'
import RouteDetails from './RouteDetails'
import getCustomPopup from './CustomPopup'
import getLoginId from '@zeliot/common/utils/getLoginId'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'

import { Grid, Paper } from '@material-ui/core'

const schoolLocation = {
  pointId: 0,
  coordinates: {
    lat: 12.9719,
    lng: 77.6412
  },
  noOfStudents: 0
}

const GET_ALL_STUDENTS = gql`
  query($clientLoginId: Int!) {
    getAllStudents(clientLoginId: $clientLoginId) {
      studentId
      pickupLocation {
        lat
        lng
      }
      dropLocation {
        lat
        lng
      }
    }
  }
`

const GET_PREDICTED_AOIS = gql`
  query($requestObject: String!) {
    clusterPickupDropPoints(requestObject: $requestObject) {
      cluster {
        pointId
        name
        coordinates {
          lat
          lng
        }
        students
      }
    }
  }
`

const GET_NEW_AOIS_ASSOCIATION = gql`
  query($requestObject: String!) {
    reClusterPickupDropPoints(requestObject: $requestObject) {
      cluster {
        pointId
        coordinates {
          lat
          lng
        }
        students
      }
    }
  }
`

const GET_OPTIMAL_ROUTES = gql`
  query($requestObject: String!) {
    routeRecommender(requestObject: $requestObject) {
      routes {
        load
        vehicle
        order {
          lat
          lng
        }
        aoiOrder
      }
    }
  }
`

const ADD_SCHOOL_ROUTE = gql`
  mutation(
    $routeName: String!
    $clientLoginId: Int!
    $routeDetail: [RouteDetailInput!]!
    $routeType: String!
  ) {
    addSchoolRouteAndAreas(
      routeName: $routeName
      clientLoginId: $clientLoginId
      routeDetails: $routeDetail
      routeType: $routeType
    )
  }
`

const GET_ALL_ROUTES = gql`
  query($clientLoginId: Int!) {
    getAllSchoolRoute(clientLoginId: $clientLoginId) {
      id
      routeName
    }
  }
`

const GET_ROUTE = gql`
  query($id: Int!) {
    getSchoolRoute(id: $id) {
      routeName
      routeDetails
      routeType
      createdAt
    }
  }
`

const GET_SNAPPED_POINTS = gql`
  query(
    $input: [CoordinateInput!]!
    $interpolate: Boolean!
    $snapPointsIndependently: Boolean
  ) {
    getSnappedCoordinates(
      input: $input
      interpolate: $interpolate
      snapPointsIndependently: $snapPointsIndependently
    ) {
      lat
      lng
      idx
    }
  }
`

const GET_ALL_VEHICLES = gql`
  query($clientLoginId: Int!) {
    getAllVehicleDetails(clientLoginId: $clientLoginId, status: [1, 3]) {
      deviceDetail {
        uniqueDeviceId
      }
      vehicleNumber
      vehicleCapacity
    }
  }
`

const routeColors = ['#FF0000', '#00FF00', '#0000FF', '#000000', '#AAAAAA'] // add more colors later

const fenceRadius = 50 // in meters

let schoolMarker = null
let studentMarkers = []
let aoiMarkers = []
let mapBound = null
let directionsService = []
let directionsRenderer = []
let allRoutes = []
let fenceList = []
let routePolyline = []
let CustomPopup
let isRouteDrawn = false
let isRouteOnViewDrawn = false
const allDistances = []
const allDurations = []
const allwaypointsOrder = []

class SchoolBusRoutingModule extends Component {
  constructor(props) {
    super(props)
    CustomPopup = getCustomPopup(props.google)
    this._customPopup = new CustomPopup()
  }

  state = {
    radioSelection: 'pickup',
    showStudentPosition: false,
    isSamePickupDrop: false,
    predictedAois: null,
    registeredStudents: null,
    routeAction: 'view',
    map: null,
    schoolLocation: null,
    optimalRoutes: null, // Route information
    aoisPredictedFlag: false,
    waypointsCount: '',
    pointsSaved: false,
    configuredRoutes: null, // Store route polyline coordinates
    savedRoutes: null, // Final route object. Save as it is in DB
    routeFromQuery: null,
    modalOpen: false,
    modalField: null,
    activeStep: 0,
    selectedRoute: null,
    viewRouteDetail: null
  }

  componentDidMount() {
    this.getRegisteredStudents()
    this.getAllVehicles()
    this.getSchoolLocation()
    this.drawSchoolMarker()
    this.fetchAllRoutes()
  }

  getSchoolLocation = () => {
    this.setState({ schoolLocation: schoolLocation })
  }

  getRegisteredStudents = async () => {
    // Get all students
    const fetchedStudents = await this.props.client.query({
      query: GET_ALL_STUDENTS,
      variables: {
        clientLoginId: getLoginId()
      }
    })
    // TODO: Handle error
    const studentData = fetchedStudents.data.getAllStudents
    const myArray = []
    studentData.forEach(student => {
      if (student.studentId && student.pickupLocation && student.dropLocation) {
        const studentId = student.studentId
        const pickupLocation = student.pickupLocation
        const dropLocation = student.dropLocation
        myArray.push({
          id: studentId,
          pickupAddress: {
            lat: parseFloat(pickupLocation.lat),
            lng: parseFloat(pickupLocation.lng)
          },
          dropAddress: {
            lat: parseFloat(dropLocation.lat),
            lng: parseFloat(dropLocation.lng)
          }
        })
      }
    })
    this.setState({ registeredStudents: myArray }, () => {
      console.log(this.state.registeredStudents)
    })
  }

  getAllVehicles = async () => {
    const vehicles = []
    const fetchedVehicles = await this.props.client.query({
      query: GET_ALL_VEHICLES,
      variables: {
        clientLoginId: getLoginId()
      }
    })
    fetchedVehicles.data.getAllVehicleDetails.forEach(vehicle => {
      vehicles.push({
        id: vehicle.deviceDetail.uniqueDeviceId,
        number: vehicle.vehicleNumber,
        capacity: vehicle.vehicleCapacity
      })
    })
    this.setState({ registeredVehicles: vehicles }, () => {
      // console.log(this.state.registeredVehicles)
    })
  }

  fetchAllRoutes = async () => {
    const fetchedRoutes = await this.props.client.query({
      query: GET_ALL_ROUTES,
      variables: {
        clientLoginId: getLoginId()
      }
    })
    this.setState({ routeFromQuery: fetchedRoutes.data.getAllSchoolRoute })
  }

  getRouteForView = async id => {
    const fetchedRoute = await this.props.client.query({
      query: GET_ROUTE,
      variables: {
        id: id
      }
    })
    const route = {
      name: fetchedRoute.data.getSchoolRoute.routeName,
      routeDetails: JSON.parse(fetchedRoute.data.getSchoolRoute.routeDetails),
      type: fetchedRoute.data.getSchoolRoute.routeType,
      createdOn: fetchedRoute.data.getSchoolRoute.createdAt
    }
    this.setState({ viewRouteDetail: route }, () => {
      this.getAoisOnView()
      this.drawRouteOnView()
      this.drawMarkersOnView()
    })
  }

  getAoisOnView = () => {
    const aois = []
    const routeDetail = this.state.viewRouteDetail.routeDetails
    for (let i = 0; i < routeDetail.length; i++) {
      routeDetail[i].aoiOrderObject.forEach((aoi, index) => {
        aois.push({
          pointId: aoi.pointId,
          coordinates: JSON.parse(aoi.coordinates),
          name: aoi.name,
          geoJson: JSON.parse(aoi.geoJson),
          students: aoi.students,
          type: this.state.viewRouteDetail.type
        })
      })
    }
    this.setState({ predictedAois: aois }, () => {
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
      for (i = 0; i < this.state.viewRouteDetail.routeDetails.length; i++) {
        routePolylineCoordinates = []
        const pointsOnRoute = JSON.parse(
          this.state.viewRouteDetail.routeDetails[i].route
        )
        pointsOnRoute.forEach(coordinate => addCoordinate(coordinate))
        routePolyline[i] = new this.props.google.maps.Polyline({
          path: routePolylineCoordinates,
          strokeColor: routeColors[i % 5],
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

  drawSchoolMarker = () =>
    setTimeout(() => {
      const customSchoolMarker = {
        url: schoolMarkerIcon,
        scaledSize: new this.props.google.maps.Size(30, 30)
      }
      const marker = new this.props.google.maps.Marker({
        position: this.state.schoolLocation.coordinates,
        map: this.state.map,
        icon: customSchoolMarker
      })
      schoolMarker = marker
    })

  clearSchoolMarker = () => {
    if (schoolMarker) {
      schoolMarker.setMap(null)
    }
    schoolMarker = null
  }

  setDirectionServices = () => {
    directionsService = new this.props.google.maps.DirectionsService()
    directionsRenderer = new this.props.google.maps.DirectionsRenderer({
      polylineOptions: {
        strokeColor: 'blue'
      }
    })
  }

  drawStudentMarkers = () =>
    setTimeout(() => {
      const bounds = new this.props.google.maps.LatLngBounds()

      if (this.state.registeredStudents.length > 0) {
        this.clearStudentMarkers()
        this.state.registeredStudents.forEach(student => {
          // Add new marker
          const penMarker = {
            url: penMarkerIcon,
            scaledSize: new this.props.google.maps.Size(30, 30),
            anchor: new this.props.google.maps.Point(0, 30)
          }
          const marker = new this.props.google.maps.Marker({
            position:
              this.state.radioSelection === 'pickup'
                ? student.pickupAddress
                : student.dropAddress,
            map: this.state.map,
            icon: penMarker
          })
          studentMarkers.push(marker)
          // Set bounds for each marker addition
          const extendPoints = new this.props.google.maps.LatLng({
            lat:
              this.state.radioSelection === 'pickup'
                ? student.pickupAddress.lat
                : student.dropAddress.lat,
            lng:
              this.state.radioSelection === 'pickup'
                ? student.pickupAddress.lng
                : student.dropAddress.lng
          })
          bounds.extend(extendPoints)
        })
        mapBound = bounds
        this.state.map.fitBounds(bounds)
      } else {
        this.clearStudentMarkers()
      }
    }, 0)

  clearStudentMarkers = () => {
    if (studentMarkers.length > 0) {
      for (let i = 0; i < studentMarkers.length; i++) {
        studentMarkers[i].setMap(null)
      }
      studentMarkers = []
    }
  }

  getPredictedAois = () => {
    // Make request for all points
    const studentDetails = []
    this.state.registeredStudents.forEach(student => {
      studentDetails.push({
        id: student.id,
        coordinates: {
          lat:
            this.state.radioSelection === 'pickup'
              ? student.pickupAddress.lat
              : student.dropAddress.lat,
          lng:
            this.state.radioSelection === 'pickup'
              ? student.pickupAddress.lng
              : student.dropAddress.lng
        }
      })
    })
    const getAois = {
      maxPoints: parseFloat(this.state.waypointsCount),
      studentDetails: studentDetails
    }
    this.queryPredictedAois(getAois)
  }

  queryPredictedAois = async getAois => {
    // Get predicted aois
    const fetchedAois = await this.props.client.query({
      query: GET_PREDICTED_AOIS,
      variables: {
        requestObject: JSON.stringify(getAois)
      }
    })
    const response = await fetchedAois.data.clusterPickupDropPoints.cluster

    const coordinateArray = []
    await response.forEach(value => {
      coordinateArray.push({
        lat: value.coordinates.lat,
        lng: value.coordinates.lng
      })
    })
    const snappedPoints = await this.props.client.query({
      query: GET_SNAPPED_POINTS,
      variables: {
        input: coordinateArray,
        interpolate: false,
        snapPointsIndependently: true
      }
    })
    const snappedCoordinates = []
    snappedPoints.data.getSnappedCoordinates.forEach(snap => {
      snappedCoordinates.push({
        lat: snap.lat,
        lng: snap.lng
      })
    })

    let isSnapValid = true
    if (response.length > snappedCoordinates.length) {
      this.props.openSnackbar('Could not snap points.')
      isSnapValid = false
    }

    const filteredResponse = []
    response.forEach((value, index) => {
      filteredResponse.push({
        pointId: value.pointId,
        name: value.name.toString(),
        coordinates: isSnapValid
          ? snappedCoordinates[index]
          : coordinateArray[index],
        students: value.students,
        type: this.state.radioSelection === 'pickup' ? 'PICKUP' : 'DROP',
        areaShapeId: 2,
        geoJson: {
          type: 'Circle',
          radius: fenceRadius,
          coordinates: [snappedCoordinates[index]]
        }
      })
    })
    this.setState(
      {
        predictedAois: filteredResponse
      },
      () => {
        // console.log('predictedAois', this.state.predictedAois)
        this.showAoiMarkers()
      }
    )
  }

  handleSelectionChange = value => {
    this.setState({ radioSelection: value }, () => {
      if (this.state.showStudentPosition) {
        this.drawStudentMarkers()
      }
    })
  }

  handleSaveConfiguredPoints = () => {
    this.getNewPointAssociation()
    this.getOptimalRoute()
    this.setState({ pointsSaved: true })
  }

  handleSaveConfiguredRoutes = () => {
    this.setState({ modalOpen: true })
  }

  getNewPointAssociation = async () => {
    const studentDetails = []
    this.state.registeredStudents.forEach(student => {
      studentDetails.push({
        id: student.id,
        coordinates: {
          lat:
            this.state.radioSelection === 'pickup'
              ? student.pickupAddress.lat
              : student.dropAddress.lat,
          lng:
            this.state.radioSelection === 'pickup'
              ? student.pickupAddress.lng
              : student.dropAddress.lng
        }
      })
    })
    const newAois = []
    this.state.predictedAois.forEach(aoi => {
      newAois.push({
        id: aoi.pointId,
        coordinates: aoi.coordinates
      })
    })
    const getAois = {
      studentDetails: studentDetails,
      clusters: newAois
    }
    // Get predicted routes
    const fetchedAois = await this.props.client.query({
      query: GET_NEW_AOIS_ASSOCIATION,
      variables: {
        requestObject: JSON.stringify(getAois)
      }
    })
    const response = fetchedAois.data.reClusterPickupDropPoints.cluster
    const filteredResponse = []
    response.forEach((value, index) => {
      filteredResponse.push({
        pointId: value.pointId,
        name: this.state.predictedAois[index].name.toString(),
        coordinates: {
          lat: value.coordinates.lat,
          lng: value.coordinates.lng
        },
        students: value.students,
        type: this.state.radioSelection === 'pickup' ? 'PICKUP' : 'DROP',
        areaShapeId: 2,
        geoJson: {
          type: 'Circle',
          radius: fenceRadius,
          coordinates: [value.coordinates.lat, value.coordinates.lng]
        }
      })
    })
    this.setState(
      {
        predictedAois: filteredResponse
      },
      () => {
        this.showAoiMarkers()
        aoiMarkers.forEach(marker => {
          marker.setDraggable(false)
        })
      }
    )
  }

  handleSaveConfiguredRoutes = () => {
    // TODO: Draw route fence all each route
    this.setState({ modalOpen: true })
    // console.log('route array', this.state.configuredRoutes)

    // Draw fence
    // this.state.configuredRoutes.forEach((route, index) => {
    //   this.drawRouteFence(route, index)
    // })
  }

  getOptimalRoute = () => {
    const aoiArray = []
    const vehicleArray = []
    let cummulativeCapacity = 0
    aoiArray.push(this.state.schoolLocation)
    this.state.predictedAois.forEach(aoi => {
      aoiArray.push({
        pointId: aoi.pointId,
        coordinates: aoi.coordinates,
        noOfStudents: aoi.students.length
      })
    })
    this.state.registeredVehicles.forEach(vehicle => {
      cummulativeCapacity = cummulativeCapacity + vehicle.capacity
      vehicleArray.push({
        vehicleId: vehicle.id,
        number: vehicle.number,
        capacity: vehicle.capacity
      })
    })
    const routeRequest = {
      points: aoiArray,
      vehicles: vehicleArray
    }
    if (cummulativeCapacity >= this.state.registeredStudents.length) {
      this.queryOptimalRoutes(routeRequest)
    } else {
      this.props.openSnackbar(
        "Number of buses aren't enough to pick all students. Add more buses"
      )
      this.handleClearRoute()
    }
  }

  queryOptimalRoutes = async routeRequest => {
    const fetchedRoutes = await this.props.client.query({
      query: GET_OPTIMAL_ROUTES,
      variables: {
        requestObject: JSON.stringify(routeRequest)
      }
    })
    const response = fetchedRoutes.data.routeRecommender.routes
    let aoiOrderArray = [] // For aoi coordinates
    let aoiIdOrderArray = [] // For aoiId
    const routeArray = []
    let index = 0
    console.log('route recommender response', response)
    console.log('Registered vehicles', this.state.registeredVehicles)
    response.forEach(route => {
      if (route.load > 0) {
        index++
        aoiOrderArray = []
        aoiIdOrderArray = []
        route.order.forEach(order => {
          aoiOrderArray.push({
            lat: order.lat,
            lng: order.lng
          })
        })
        let i = 1
        for (i = 1; i < route.aoiOrder.length - 1; i++) {
          aoiIdOrderArray.push(
            this.state.predictedAois[route.aoiOrder[i] - 1].pointId
          )
        }

        let assignedVehicle = {}
        this.state.registeredVehicles.forEach(vehicle => {
          if (route.vehicle === vehicle.id) assignedVehicle = vehicle
        })
        console.log('Assigned vehicle', assignedVehicle)
        routeArray.push({
          id: index,
          name: 'Route ' + index.toString(),
          load: route.load,
          capacity: assignedVehicle.capacity,
          vehicle: assignedVehicle.number,
          uniqueId: assignedVehicle.id,
          order: aoiOrderArray,
          aoiOrder: aoiIdOrderArray
        })
      }
    })
    this.setState({ optimalRoutes: routeArray }, () => {
      this.manageDrawRoutes()
    })
  }

  setDirectionServicesForEdit = index => {
    const iconSettings = {
      path: this.props.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      fillColor: routeColors[index % 5]
    }
    directionsService[index] = new this.props.google.maps.DirectionsService()
    directionsRenderer[index] = new this.props.google.maps.DirectionsRenderer({
      draggable: true,
      suppressMarkers: true,
      preserveViewport: true,
      polylineOptions: {
        strokeColor: routeColors[index % 5],
        icons: [
          {
            icon: iconSettings,
            repeat: '50px',
            offset: '100%'
          }
        ]
      }
    })
    directionsRenderer[index].setMap(this.state.map)

    directionsRenderer[index].addListener('directions_changed', () => {
      this.getEditedRoute(directionsRenderer[index].getDirections(), index)
    })
  }

  getEditedRoute = (editedRoute, index) => {
    // Extract coordinates from response before storing
    const overviewPathLatLng = []
    const legs = editedRoute.routes[0].legs
    const lastLeg = legs.length - 1
    // let waypointSequence = editedRoute.routes[0].waypoint_order
    // console.log('edited route', editedRoute)

    // Start point
    overviewPathLatLng.push({
      lat: legs[0]['start_location'].lat(),
      lng: legs[0]['start_location'].lng()
    })
    // All intermediate points in the path
    const distance = []
    const duration = []
    for (let i = 0; i < legs.length; i++) {
      distance.push(legs[i].distance)
      duration.push(legs[i].duration)
      const steps = legs[i].steps
      for (let j = 0; j < steps.length; j++) {
        const nextSegment = steps[j].path
        for (let k = 0; k < nextSegment.length; k += 3) {
          overviewPathLatLng.push({
            lat: nextSegment[k].lat(),
            lng: nextSegment[k].lng()
          })
        }
      }
    }
    // End point
    overviewPathLatLng.push({
      lat: legs[lastLeg]['end_location'].lat(),
      lng: legs[lastLeg]['end_location'].lng()
    })

    // Store waypoint order with distance and duration
    // let routeAoiOrder = []
    // waypointSequence.forEach(waypoint => {
    //   routeAoiOrder.push(editedRoute.aoiOrder[waypoint])
    // })

    // Save edited route
    allRoutes[index] = overviewPathLatLng
    allDistances[index] = distance
    allDurations[index] = duration
    // allwaypointsOrder[index] = routeAoiOrder
  }

  manageDrawRoutes = () => {
    // Initialize direction services
    this.state.optimalRoutes.forEach((route, index) => {
      this.setDirectionServicesForEdit(index)
      this.drawRoutes(route, index)
    })
    // Draw waypoint fences
    this.drawAoiFences()
    this.setPopups()
    this.setState({ configuredRoutes: allRoutes })
  }

  drawRoutes = (route, value) => {
    let index
    const length = route.order.length
    const origin = route.order[0]
    const destination = route.order[length - 1]
    const waypoints = []
    // Store waypoints between origin and destination
    for (index = 1; index < length - 1; index++) {
      waypoints.push({
        location: route.order[index],
        stopover: true
      })
    }
    // Request route
    directionsService[value].route(
      {
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        travelMode: 'DRIVING',
        optimizeWaypoints: true
      },
      (response, status) => {
        if (status === 'OK') {
          isRouteDrawn = true
          directionsRenderer[value].setDirections(response)

          // Extract coordinates from response before storing
          const overviewPathLatLng = []
          const legs = response.routes[0].legs
          const lastLeg = legs.length - 1
          const waypointSequence = response.routes[0].waypoint_order

          // Start point
          overviewPathLatLng.push({
            lat: legs[0]['start_location'].lat(),
            lng: legs[0]['start_location'].lng()
          })
          // All intermediate points in the path
          const distance = []
          const duration = []
          for (let i = 0; i < legs.length; i++) {
            distance.push(legs[i].distance)
            duration.push(legs[i].duration)
            const steps = legs[i].steps
            for (let j = 0; j < steps.length; j++) {
              const nextSegment = steps[j].path
              for (let k = 0; k < nextSegment.length; k += 3) {
                overviewPathLatLng.push({
                  lat: nextSegment[k].lat(),
                  lng: nextSegment[k].lng()
                })
              }
            }
          }
          // End point
          overviewPathLatLng.push({
            lat: legs[lastLeg]['end_location'].lat(),
            lng: legs[lastLeg]['end_location'].lng()
          })

          // Store waypoint order with distance and duration
          const routeAoiOrder = []
          waypointSequence.forEach(waypoint => {
            routeAoiOrder.push(route.aoiOrder[waypoint])
          })

          // Save route created
          allRoutes[value] = overviewPathLatLng
          allDistances[value] = distance
          allDurations[value] = duration
          allwaypointsOrder[value] = routeAoiOrder.toString()
        } else {
          this.props.openSnackbar('Request from Google failed due to ' + status)
        }
      }
    )
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
              /* eslint-disable indent */
              this.state.routeAction === 'view'
                ? aoi.type === 'PICKUP'
                  ? 'Picking up'
                  : 'Droping'
                : this.state.radioSelection === 'pickup'
                ? 'Picking up'
                : 'Droping'
            /* eslint-enable indent */
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

  handleAddAnotherPoint = () => {
    this.addExtraMarker()
  }

  addExtraMarker = () => {
    const boundCenter = mapBound.getCenter()
    const label = aoiMarkers.length + 1
    const marker = new this.props.google.maps.Marker({
      position: boundCenter,
      map: this.state.map,
      label: label.toString(),
      draggable: true
    })
    aoiMarkers.push(marker)
    marker.addListener('dragend', this.handleMarkerDragEndEvent(marker))

    const aoiArray = this.state.predictedAois
    aoiArray.push({
      pointId: label,
      name: label.toString(),
      coordinates: {
        lat: boundCenter.lat(),
        lng: boundCenter.lng()
      },
      students: [],
      type: this.state.radioSelection === 'pickup' ? 'PICKUP' : 'DROP',
      areaShapeId: 2,
      geoJson: {
        type: 'Circle',
        radius: fenceRadius,
        coordinates: [boundCenter.lat(), boundCenter.lng()]
      }
    })
    this.setState({ predictedAois: aoiArray })
  }

  showAoiMarkers = () => {
    const bounds = new this.props.google.maps.LatLngBounds()

    if (this.state.predictedAois.length > 0) {
      this.clearAoiMarkers()
      this.state.predictedAois.forEach((aoi, index) => {
        // Add new marker
        const marker = new this.props.google.maps.Marker({
          position: aoi.coordinates,
          map: this.state.map,
          label: (index + 1).toString(),
          draggable: true
        })
        aoiMarkers.push(marker)

        // Set marker drag listener
        marker.addListener('dragend', this.handleMarkerDragEndEvent(marker))

        // Set bounds for each marker addition
        const extendPoints = new this.props.google.maps.LatLng({
          lat: aoi.coordinates.lat,
          lng: aoi.coordinates.lng
        })
        bounds.extend(extendPoints)
      })
      mapBound = bounds
      this.state.map.fitBounds(bounds)
    } else {
      this.clearAoiMarkers()
    }
  }

  handleMarkerDragEndEvent = marker => event => {
    const newPosition = marker.getPosition()
    const label = marker.getLabel()
    const testArray = []
    this.state.predictedAois.forEach(aoi => {
      if (label === aoi.pointId.toString()) {
        testArray.push({
          pointId: aoi.pointId,
          name: aoi.name,
          coordinates: {
            lat: newPosition.lat(),
            lng: newPosition.lng()
          },
          students: aoi.students,
          type: this.state.radioSelection === 'pickup' ? 'PICKUP' : 'DROP',
          areaShapeId: aoi.areaShapeId,
          geoJson: {
            type: 'Circle',
            radius: fenceRadius,
            coordinates: [newPosition.lat(), newPosition.lng()]
          }
        })
      } else {
        testArray.push(aoi)
      }
    })
    this.setState({ predictedAois: testArray })
  }

  clearAoiMarkers = () => {
    if (aoiMarkers.length > 0) {
      for (let i = 0; i < aoiMarkers.length; i++) {
        aoiMarkers[i].setMap(null)
      }
      aoiMarkers = []
    }
  }

  clearRoute = () => {
    if (isRouteDrawn) {
      allRoutes.forEach((route, index) => {
        directionsRenderer[index].setMap(null)
      })
      isRouteDrawn = false
      allRoutes = []
    }
    if (isRouteOnViewDrawn) {
      routePolyline.forEach((route, index) => {
        routePolyline[index].setMap(null)
      })
      routePolyline = []
      isRouteOnViewDrawn = false
    }
    if (isRouteOnViewDrawn) {
      routePolyline.forEach((route, index) => {
        routePolyline[index].setMap(null)
      })
      routePolyline = []
      isRouteOnViewDrawn = false
    }
  }

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

  clearAoiFences = () => {
    if (fenceList.length > 0) {
      for (let i = 0; i < fenceList.length; i++) {
        fenceList[i].setMap(null)
      }
      fenceList = []
    }
  }

  clearAoiMarker = index => {
    const deletedMarker = aoiMarkers.splice(index, 1)
    const length = aoiMarkers.length
    deletedMarker[0].setMap(null)
    // Reset all labels accordingly
    for (index = 0; index < length; index++) {
      aoiMarkers[index].setLabel((index + 1).toString())
    }
  }

  handleAoiNameEdit = (value, name) => {
    const tempArray = []
    this.state.predictedAois.forEach(aoi => {
      if (aoi.pointId === value.pointId) {
        tempArray.push({
          pointId: aoi.pointId,
          name: name,
          coordinates: aoi.coordinates,
          students: aoi.students,
          type: this.state.radioSelection === 'pickup' ? 'PICKUP' : 'DROP',
          areaShapeId: aoi.areaShapeId,
          geoJson: {
            type: 'Circle',
            radius: fenceRadius,
            coordinates: [aoi.coordinates.lat, aoi.coordinates.lng]
          }
        })
      } else {
        tempArray.push(aoi)
      }
    })
    this.setState({ predictedAois: tempArray })
  }

  handleRouteNameEdit = (value, name) => {
    const tempArray = []
    this.state.optimalRoutes.forEach(route => {
      if (route.id === value.id) {
        tempArray.push({
          id: route.id,
          name: name,
          load: route.load,
          capacity: route.capacity,
          vehicle: route.vehicle,
          uniqueId: route.uniqueId,
          order: route.order,
          aoiOrder: route.aoiOrder
        })
      } else {
        tempArray.push(route)
      }
    })
    this.setState({ optimalRoutes: tempArray })
  }

  handleDeleteAoi = (value, index) => {
    const tempArray = []
    let i = 1
    this.state.predictedAois.forEach((aoi, index) => {
      let aoiName = ''
      if (isNaN(parseInt(aoi.name, 10))) {
        aoiName = aoi.name
      } else {
        aoiName = i.toString()
      }
      if (aoi.pointId !== value.pointId) {
        tempArray.push({
          pointId: i,
          name: aoiName,
          coordinates: aoi.coordinates,
          students: aoi.students,
          type: this.state.radioSelection === 'pickup' ? 'PICKUP' : 'DROP',
          areaShapeId: aoi.areaShapeId,
          geoJson: {
            type: 'Circle',
            radius: fenceRadius,
            coordinates: [aoi.coordinates.lat, aoi.coordinates.lng]
          }
        })
        i++
      }
    })
    this.setState({ predictedAois: tempArray })
    this.clearAoiMarker(index)
  }

  onWaypointsCountChange = value => {
    this.setState({ waypointsCount: value })
  }

  handlePickupPointsRequest = () => {
    // Check if all inputs are provided
    if (this.state.waypointsCount === '') {
      this.props.openSnackbar('Provide maximum number of waypoints')
    } else if (this.state.waypointsCount < 1) {
      this.props.openSnackbar('Invalid number of waypoints')
      this.setState({ waypointsCount: '' })
    } else {
      this.setState({ aoisPredictedFlag: true })
      this.setState(state => ({
        activeStep: state.activeStep + 1
      }))
      this.getPredictedAois()
    }
  }

  handleClearRoute = () => {
    this.clearAoiMarkers()
    this.clearAoiFences()
    this.clearRoute()
    this.clearRouteVariables()
  }

  clearRouteVariables = () => {
    this.setState({
      waypointsCount: '',
      aoisPredictedFlag: false,
      predictedAois: null,
      optimalRoutes: null,
      configuredRoutes: null,
      pointsSaved: false,
      viewRouteDetail: null,
      selectedRoute: null,
      showStudentPosition: false,
      activeStep: 0,
      radioSelection: 'pickup'
    })
    mapBound = null
    directionsService = []
    directionsRenderer = []
  }

  onTabChange = tab => {
    this.setState({ routeAction: tab })
    if (tab === 'view') {
      // Clear all markers on tab change
      this.handleClearRoute()
      this.clearStudentMarkers()
      this.clearSchoolMarker()
      this.fetchAllRoutes()
      this.drawSchoolMarker()
    } else {
      this.handleClearRoute()
      this.drawSchoolMarker()
      // Plot all students' location
      if (this.state.showStudentPosition) {
        this.drawStudentMarkers()
      }
    }
  }

  setMap = map => this.setState({ map })

  handleStudentVisualization = value => {
    this.setState({ showStudentPosition: value }, () => {
      if (!this.state.showStudentPosition) {
        this.clearStudentMarkers()
      } else {
        this.drawStudentMarkers()
      }
    })
  }

  handleModalClose = () => {
    this.setState({ modalOpen: false })
  }

  handleModalFieldNameChange = name => {
    this.setState({ modalField: name })
  }

  saveRouteName = () => {
    if (!this.state.modalField || this.state.modalField === '') {
      this.props.openSnackbar('Please enter a name to save')
    } else {
      this.setState({ modalOpen: false })
      // TODO: Form route object and store in DB
      this.createRouteObject()
    }
  }

  createRouteObject = () => {
    const routeInfo = this.state.optimalRoutes
    const routeCoordinates = this.state.configuredRoutes
    const configuredPoints = []
    this.state.predictedAois.forEach(aoi => {
      configuredPoints.push({
        pointId: aoi.pointId,
        name: aoi.name,
        coordinates: JSON.stringify(aoi.coordinates),
        students: aoi.students,
        type: aoi.type,
        areaShapeId: aoi.areaShapeId,
        geoJson: JSON.stringify(aoi.geoJson)
      })
    })
    const routeArray = []
    let aoiOrderObject = []

    routeInfo.forEach((route, index) => {
      aoiOrderObject = []
      route.aoiOrder.forEach(pointId => {
        aoiOrderObject.push(configuredPoints[pointId - 1])
      })
      routeArray.push({
        id: route.id,
        name: route.name.toString(),
        load: route.load,
        capacity: route.capacity,
        vehicleNumber: route.vehicle,
        uniqueId: route.uniqueId,
        route: JSON.stringify(routeCoordinates[index]),
        aoiOrder: allwaypointsOrder[index],
        aoiOrderObject: aoiOrderObject,
        distance: JSON.stringify(allDistances[index]),
        duration: JSON.stringify(allDurations[index])
      })
    })
    this.setState(
      {
        savedRoutes: {
          name: this.state.modalField,
          type: this.state.radioSelection === 'pickup' ? 'PICKUP' : 'DROP',
          routeDetails: routeArray
        }
      },
      () => {
        // console.log('Points configured', this.state.predictedAois)
        // console.log('Final object', this.state.savedRoutes)
        this.saveRouteInDb()
      }
    )
  }

  saveRouteInDb = async () => {
    const success = await this.props.client.mutate({
      mutation: ADD_SCHOOL_ROUTE,
      variables: {
        routeName: this.state.savedRoutes.name,
        clientLoginId: getLoginId(),
        routeDetail: this.state.savedRoutes.routeDetails,
        routeType: this.state.savedRoutes.type
      }
    })
    if (!success.data.addSchoolRouteAndAreas) {
      this.props.openSnackbar(
        'Failed to communicate to server. Please try again'
      )
    } else {
      this.props.openSnackbar('Route saved!')
    }
  }

  handleRouteTableRowHovered = (index, flag) => {
    if (flag === true) {
      directionsRenderer[index].setOptions({
        polylineOptions: {
          strokeColor: routeColors[index % 5],
          strokeWeight: 10,
          strokeOpacity: 0.7
        }
      })
      directionsRenderer[index].setMap(this.state.map)
    } else {
      const iconSettings = {
        path: this.props.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        fillColor: routeColors[index % 5]
      }
      directionsRenderer[index].setOptions({
        draggable: true,
        suppressMarkers: true,
        preserveViewport: true,
        polylineOptions: {
          strokeColor: routeColors[index % 5],
          icons: [
            {
              icon: iconSettings,
              repeat: '50px',
              offset: '100%'
            }
          ]
        }
      })
      directionsRenderer[index].setMap(this.state.map)
    }
  }

  handleNext = () => {
    this.setState(state => ({
      activeStep: state.activeStep + 1
    }))
  }

  handleBack = () => {
    this.setState(state => ({
      activeStep: state.activeStep - 1
    }))
  }

  handleReset = () => {
    this.setState({
      activeStep: 0
    })
  }

  handleRouteChange = route => {
    if (route) {
      this.handleClearRoute()
      this.setState({ selectedRoute: route }, () => {
        this.getRouteForView(route.id)
      })
    } else {
      this.handleClearRoute()
    }
  }

  handleRouteOnViewHovered = (index, flag) => {
    if (flag === true) {
      routePolyline[index].setOptions({
        strokeColor: routeColors[index % 5],
        strokeWeight: 10,
        strokeOpacity: 0.7
      })
      routePolyline[index].setMap(this.state.map)
    } else {
      routePolyline[index].setOptions({
        strokeColor: routeColors[index % 5],
        strokeOpacity: 1.0,
        strokeWeight: 5
      })
      routePolyline[index].setMap(this.state.map)
    }
  }

  render() {
    const { google } = this.props
    return (
      <Fragment>
        <RouteTabView
          routes={this.state.routeFromQuery}
          selectedRoute={this.state.selectedRoute}
          selectedTab={this.state.routeAction}
          onSelectedRouteChange={this.handleRouteChange}
          onTabChange={this.onTabChange}
        />
        {this.state.routeAction === 'create' ? (
          <Grid container>
            <SimpleModal
              placeholder="Route Name"
              label="Save route as"
              modalOpen={this.state.modalOpen}
              handleModalClose={this.handleModalClose}
              saveAs={this.saveRouteName}
              handleModalFieldNameChange={this.handleModalFieldNameChange}
            />
            <Grid item sm={4}>
              <Waypoints
                activeStep={this.state.activeStep}
                predictedAois={this.state.predictedAois}
                handleNext={this.handleNext}
                handleBack={this.handleBack}
                handleReset={this.handleReset}
                pointsSaved={this.state.pointsSaved}
                optimalRoutes={this.state.optimalRoutes}
                onAddAnotherPoint={this.handleAddAnotherPoint}
                showStudentPosition={this.state.showStudentPosition}
                radioSelection={this.state.radioSelection}
                aoisPredictedFlag={this.state.aoisPredictedFlag}
                isSamePickupDrop={this.state.isSamePickupDrop}
                onSelectionChanged={this.handleSelectionChange}
                onStudentVisualization={this.handleStudentVisualization}
                onSaveConfiguredPoints={this.handleSaveConfiguredPoints}
                onGetPickupPoints={this.handlePickupPointsRequest}
                onWaypointsCountChange={this.onWaypointsCountChange}
                waypointsCount={this.state.waypointsCount}
                onClearRoute={this.handleClearRoute}
                handleDeleteAoi={this.handleDeleteAoi}
                handleAoiNameEdit={this.handleAoiNameEdit}
                saveConfiguredRoutes={this.handleSaveConfiguredRoutes}
                handleRouteNameEdit={this.handleRouteNameEdit}
                onRouteTableRowHovered={this.handleRouteTableRowHovered}
              />
            </Grid>
            <Grid item sm={8}>
              <Map google={google} setMap={this.setMap} zoom={6} />
            </Grid>
          </Grid>
        ) : (
          <Grid container>
            <Grid item sm={4}>
              <Paper
                square
                elevation={8}
                style={{ height: '450px', overflowY: 'auto' }}
              >
                <RouteDetails
                  routeName={
                    this.state.viewRouteDetail
                      ? this.state.viewRouteDetail.name
                      : null
                  }
                  type={
                    this.state.viewRouteDetail
                      ? this.state.viewRouteDetail.type
                      : null
                  }
                  routes={
                    this.state.viewRouteDetail
                      ? this.state.viewRouteDetail.routeDetails
                      : null
                  }
                  aois={
                    this.state.predictedAois ? this.state.predictedAois : null
                  }
                  /* eslint-disable indent */
                  createdOn={
                    this.state.viewRouteDetail
                      ? getFormattedTime(
                          this.state.viewRouteDetail.createdOn,
                          'LLLL'
                        )
                      : null
                  }
                  routeOnViewHovered={this.handleRouteOnViewHovered}
                  /* eslint-enable indent */
                />
              </Paper>
            </Grid>
            <Grid item sm={8}>
              <Map google={google} setMap={this.setMap} zoom={6} />
            </Grid>
          </Grid>
        )}
      </Fragment>
    )
  }
}

export default withGoogleMaps(
  withApollo(withSharedSnackbar(SchoolBusRoutingModule))
)
