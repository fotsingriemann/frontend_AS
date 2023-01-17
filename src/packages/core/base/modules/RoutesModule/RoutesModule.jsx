import React, { Component } from 'react'
import buffer from '@turf/buffer'
import { Link } from 'react-router-dom'
import { withApollo } from 'react-apollo'
import SimpleModal from '@zeliot/common/ui/SimpleModal'
import withGoogleMaps from '@zeliot/common/hoc/withGoogleMaps'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import Map from '@zeliot/core/base/modules/TrackingControls/Maps/Map'
import Waypoints from './Waypoints'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'
import {
  GET_ALL_ROUTES,
  ADD_ROUTE,
  GET_ALL_AREAS,
  GET_AREA_INFO,
  ADD_AREA,
} from '@zeliot/common/graphql/queries'
import getLoginId from '@zeliot/common/utils/getLoginId'
import getCustomPopup from './CustomPopup'
import axios from 'axios'
import gql from 'graphql-tag'
import { DownloadProgressDialogConsumer } from '@zeliot/common/shared/DownloadProgressDialog/DownloadProgressDialog.context'
import { getItem } from '../../../../../storage'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

import {
  Button,
  Grid,
  Divider,
  Typography,
  Modal,
  TextField,
  withStyles,
  CircularProgress,
} from '@material-ui/core'

const GET_TEMPLATE = gql`
  query($bucketName: String!, $name: String!) {
    getPublicDownloadURL(bucketName: $bucketName, filename: $name)
  }
`

const GET_UPLOAD_URL = gql`
  mutation($fileExtension: String!) {
    getPublicUploadURL(fileExtension: $fileExtension) {
      bucketName
      filename
      publicUploadURL
    }
  }
`

const SUBMIT_ROUTES_LIST = gql`
  mutation($fileInfo: FileUploadInput!, $commonInput: CommonInput!) {
    excelFileUpload(fileInfo: $fileInfo, commonInput: $commonInput) {
      totalExcelDataRecords
      totalDuplicateRecords
      successfullyUploaded
      failedToUpload
      failedUploadList
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

let markerList = []
let fenceList = []
// let directionsService = null
let directionsRenderer = null
let routePolygon = null
let routePolyline = null
let isRouteDrawn = false
let isFenceDrawn = false
let fence = null
let isRouteOnViewDrawn = false
let originalCoordinates = null
let CustomPopup

function getModalStyle() {
  const top = 50
  const left = 50

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  }
}

const styles = (theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  button: {
    margin: theme.spacing(1),
  },
  paper: {
    position: 'absolute',
    width: theme.spacing(50),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
    maxHeight: 450,
    overflow: 'auto',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  buttonContainer: {
    marginTop: 15,
  },
  rowSpacing: {
    margin: theme.spacing(1),
  },
})

// Bucket name and file name are static for route template
const bucketName = 'excel-templates'
const fileName = 'routeBulkUploadTemplate.xlsx'
const schoolFileName = 'schoolRouteBulkUploadTemplate.xlsx'

class RoutesModule extends Component {
  constructor(props) {
    super(props)
    CustomPopup = getCustomPopup(props.google)
    this._customPopup = new CustomPopup()
  }

  state = {
    distance: '',
    map: null,
    radioSelection: 'places',
    places: [], // Get places
    placesCoordinates: [],
    areaTypeBuffer: [],
    aoiFenceBuffer: [],
    optimalRoute: false,
    createdRoute: null, // Created route
    allRoutes: null,
    allAreas: null,
    selectedArea: null,
    aoiCoordinates: null,
    areaType: null,
    radius: null,
    selectedRoute: null, // Selected route to view
    selectedRouteDetails: null,
    modalOpen: false,
    modalField: null,
    areaIds: [],
    selectedAoi: null, // Selected AOI while creating route
    geoJson: {},
    confirmSave: false,
    newAoiName: '',
    instructionModalOpen: false,
    uploadSuccess: false,
    // bulk upload credentials
    fileName: null,
    bucketName: null,
    publicUploadURL: null,
    isUploading: false,
    openErrorModal: false,
    uploadParseError: '',
  }

  componentDidMount() {
    this.fetchAllRoutes()
    this.fetchAllAreas()
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
    // console.log('Get all vehicles: ', fetchedAreas.data.getAllAreaDetails)
    this.setState({ allAreas: fetchedAreas.data.getAllAreaDetails })
  }

  fetchAllRoutes = async () => {
    const fetchedRoutes = await this.props.client.query({
      query: GET_ALL_ROUTES,
      variables: {
        clientLoginId: getLoginId(),
      },
    })
    // TODO: Handle error
    // console.log('Get all routes: ', fetchedRoutes.data.getAllRoutes)
    this.setState({ allRoutes: fetchedRoutes.data.getAllRoutes })
  }

  saveRouteToDb = async () => {
    const success = await this.props.client.mutate({
      mutation: ADD_ROUTE,
      variables: {
        areaTypeId: 3,
        areaName: this.state.createdRoute.name,
        clientLoginId: getLoginId(),
        routeDetail: JSON.stringify(this.state.createdRoute),
        places: JSON.stringify(this.state.places),
        placeCoordinates: JSON.stringify(this.state.placesCoordinates),
        areaTypeBuffer: JSON.stringify(this.state.areaTypeBuffer),
        aoiFenceBuffer: JSON.stringify(this.state.aoiFenceBuffer),
        geoJson: JSON.stringify(this.state.geoJson),
        areaIds: this.state.areaIds,
      },
      refetchQueries: [
        {
          query: GET_ALL_ROUTES,
          variables: {
            clientLoginId: getLoginId(),
          },
        },
      ],
    })
    if (!success.data.addRoute) {
      this.props.openSnackbar(
        'Failed to communicate to server. Please try again'
      )
    } else {
      this.props.openSnackbar('Route saved!')
      this.handleClearRoute()
    }
  }

  setMap = (map) => this.setState({ map })

  // setDirectionServicesForEdit = () => {
  //   const iconSettings = {
  //     path: this.props.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
  //     fillColor: 'blue'
  //   }
  //   directionsService = new this.props.google.maps.DirectionsService()
  //   directionsRenderer = new this.props.google.maps.DirectionsRenderer({
  //     draggable: true,
  //     suppressMarkers: true,
  //     polylineOptions: {
  //       strokeColor: 'blue',
  //       icons: [
  //         {
  //           icon: iconSettings,
  //           repeat: '40px',
  //           offset: '100%'
  //         }
  //       ]
  //     }
  //   })
  //   directionsRenderer.setMap(this.state.map)

  //   directionsRenderer.addListener('directions_changed', () => {
  //     this.getEditedRoute(directionsRenderer.getDirections())
  //   })
  // }

  onSelectionChange = (value) => {
    this.setState({ radioSelection: value })
  }

  handlePlaceChange = (selectedPlace) => {
    // let validPlace = true
    // this.state.places.forEach(place => {
    //   if (place === selectedPlace) {
    //     validPlace = false
    //   }
    // })
    // if (validPlace) {
    this.setState({ places: [...this.state.places, selectedPlace] })
    this.storeAreaIds(null)
    // } else {
    //   this.props.openSnackbar(
    //     'This point was already selected. Choose another one.'
    //   )
    // }
  }

  storeAreaIds = (selectedId) => {
    this.setState({ areaIds: [...this.state.areaIds, selectedId] })
  }

  fetchCoordinates = (newCoordinate) => {
    this.setState(
      {
        placesCoordinates: [...this.state.placesCoordinates, newCoordinate],
      },
      () => {
        this.addMarker(newCoordinate)
      }
    )
  }

  handlePlaceDelete = (index) => {
    const updatedPlaces = this.state.places
    const updatedCoordinates = this.state.placesCoordinates
    const updatedAreaTypeBuffer = this.state.areaTypeBuffer
    // TODO: Update area type on place delete
    const deletedMarker = markerList[index]
    updatedPlaces.splice(index, 1)
    updatedCoordinates.splice(index, 1)
    updatedAreaTypeBuffer.splice(index, 1)
    markerList.splice(index, 1)
    this.setState(
      {
        places: updatedPlaces,
        placesCoordinates: updatedCoordinates,
        areaTypeBuffer: updatedAreaTypeBuffer,
      },
      () => {
        this.updateMarkers(deletedMarker)
      }
    )
  }

  addMarker = (coordinates) => {
    const markerCoordinates = this.state.placesCoordinates
    const markerLabel = this.state.placesCoordinates.length
    const bounds = new this.props.google.maps.LatLngBounds()
    // Remove route if already drawn
    this.clearRoute()

    // Add new marker
    const marker = new this.props.google.maps.Marker({
      draggable: true,
      position: coordinates,
      label: markerLabel.toString(),
      map: this.state.map,
    })

    // Set marker drag listener
    marker.addListener('dragend', () => {
      this._markerIndex = marker.getLabel() - 1
      this.handleMarkerDragEndEvent()
    })

    // Confirm aoi save listener
    this._customPopup.addListener('confirm_save', () => {
      // Show modal to take aoi values
      this.setState({ confirmSave: true })
      if (this._customPopup) {
        this._customPopup.setMap(null)
        this._customPopup.setPosition(undefined)
      }
    })

    // Cancel aoi save listener
    this._customPopup.addListener('cancel_save', () => {
      // Close popup and not do anything
      if (this._customPopup) {
        this._customPopup.setMap(null)
        this._customPopup.setPosition(undefined)
      }
    })

    markerList.push(marker)

    // Set bounds for each marker addition
    markerCoordinates.forEach((index) => {
      const extendPoints = new this.props.google.maps.LatLng({
        lat: index.lat,
        lng: index.lng,
      })
      bounds.extend(extendPoints)
    })
    this.state.map.fitBounds(bounds)
  }

  handleMarkerDragEndEvent = () => {
    const index = this._markerIndex
    this.clearRoute()
    // Reset aoi name
    this.setState({ newAoiName: '' })
    // Save original coordinates for marker
    originalCoordinates = this.state.placesCoordinates[this._markerIndex]
    const existingPlaceCoordinates = this.state.placesCoordinates
    const newPolygonFence = this.state.aoiFenceBuffer
    const newPosition = markerList[index].getPosition()
    existingPlaceCoordinates[index] = {
      lat: newPosition.lat(),
      lng: newPosition.lng(),
    }

    // Update fence for polygon aoi
    const intendedIndex = this.getIndexForAreaIdArray()
    if (this.state.areaTypeBuffer[this._markerIndex] === 'Polygon') {
      const deltaLat =
        this.state.placesCoordinates[this._markerIndex].lat -
        originalCoordinates.lat
      const deltaLng =
        this.state.placesCoordinates[this._markerIndex].lng -
        originalCoordinates.lng

      this.state.aoiFenceBuffer[intendedIndex].forEach((point, index) => {
        newPolygonFence[intendedIndex][index] = {
          lat: point.lat + deltaLat,
          lng: point.lng + deltaLng,
        }
      })
      newPolygonFence[intendedIndex][newPolygonFence[intendedIndex].length] = {
        lat: newPolygonFence[intendedIndex][0].lat,
        lng: newPolygonFence[intendedIndex][0].lng,
      }
      this.setState({ aoiFenceBuffer: newPolygonFence })
    }

    // Update coordinates on drag end
    this.setState({ placesCoordinates: existingPlaceCoordinates }, () => {
      // Callout to prompt save AOI
      this.showPromptCallout()
    })
  }

  showPromptCallout = () => {
    const index = this._markerIndex
    // Set popup
    this._customPopup.setPopupData()
    // Next waypoint coordinate
    this._customPopup.setPosition(
      new this.props.google.maps.LatLng({
        lat: this.state.placesCoordinates[index].lat,
        lng: this.state.placesCoordinates[index].lng,
      })
    )
    this._customPopup.setMap(this.state.map)
  }

  updateMarkers = (deletedMarker) => {
    let index
    const markerCoordinates = this.state.placesCoordinates
    const bounds = new this.props.google.maps.LatLngBounds()
    const length = this.state.placesCoordinates.length
    deletedMarker.setMap(null)
    // Remove route if already drawn
    this.clearRoute()

    // Set map if no markers are deleted
    if (length === 0) {
      this.state.map.setCenter(this.props.defaultCenter)
      this.state.map.setZoom(6)
    } else {
      // Set bounds on each marker deletion
      markerCoordinates.forEach((index) => {
        const extendPoints = new this.props.google.maps.LatLng({
          lat: index.lat,
          lng: index.lng,
        })
        bounds.extend(extendPoints)
      })
      this.state.map.fitBounds(bounds)
    }
    // Reset all labels accordingly
    for (index = 0; index < length; index++) {
      markerList[index].setLabel((index + 1).toString())
    }
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

  handleViewRoute = () => {
    const length = this.state.placesCoordinates.length
    if (length < 2) {
      this.props.openSnackbar('Not enough points to create route!')
    } else {
      // Draw Route on request
      if (!isRouteDrawn) {
        // this.drawRoute()
        this.getRouteOSM()
      }
    }
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
  //           lat: legs[0].start_location.lat(),
  //           lng: legs[0].start_location.lng()
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
  //           lat: legs[lastLeg].end_location.lat(),
  //           lng: legs[lastLeg].end_location.lng()
  //         })

  //         // Save route created
  //         this.setState(({ createdRoute }) => ({
  //           createdRoute: {
  //             ...createdRoute,
  //             route: overviewPathLatLng
  //           }
  //         }))
  //       } else {
  //         this.props.openSnackbar('Request from Google failed due to ' + status)
  //       }
  //     }
  //   )
  // }

  drawRouteFence = (response) => {
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
    this.setState(({ createdRoute }) => ({
      createdRoute: {
        ...createdRoute,
        routeFence: googlePathGeo,
      },
    }))

    const geoJson = {
      type: 'Polygon',
      coordinates: [geoJsonCoordinates],
    }
    this.setState({ geoJson })

    // Plot the fence
    this.plotFenceOnMap(googlePathGeo)
  }

  plotFenceOnMap = (googlePathGeo) => {
    // Plot fence on map
    if (routePolygon && routePolygon.setMap) routePolygon.setMap(null)
    routePolygon = new this.props.google.maps.Polygon({
      paths: googlePathGeo,
      map: this.state.map,
    })
  }

  // getEditedRoute = editedRoute => {
  //   // console.log('Directions response', editedRoute)
  //   // Check if fence exists. Remove if exists while editing route
  //   if (isFenceDrawn) {
  //     routePolygon.setMap(null)
  //   }
  //   // Process response before saving
  //   // Extract coordinates from response before storing
  //   const overviewPathLatLng = []
  //   const legs = editedRoute.routes[0].legs
  //   const lastLeg = legs.length - 1

  //   // Start point
  //   overviewPathLatLng.push({
  //     lat: legs[0].start_location.lat(),
  //     lng: legs[0].start_location.lng()
  //   })
  //   // All intermediate points in the path
  //   for (let i = 0; i < legs.length; i++) {
  //     const steps = legs[i].steps
  //     for (let j = 0; j < steps.length; j++) {
  //       const nextSegment = steps[j].path
  //       for (let k = 0; k < nextSegment.length; k += 3) {
  //         overviewPathLatLng.push({
  //           lat: nextSegment[k].lat(),
  //           lng: nextSegment[k].lng()
  //         })
  //       }
  //     }
  //   }
  //   // End point
  //   overviewPathLatLng.push({
  //     lat: legs[lastLeg].end_location.lat(),
  //     lng: legs[lastLeg].end_location.lng()
  //   })

  //   this.setState(({ createdRoute }) => ({
  //     createdRoute: {
  //       ...createdRoute,
  //       route: overviewPathLatLng
  //     }
  //   }))
  // }

  saveRouteName = () => {
    if (!this.state.modalField || this.state.modalField === '') {
      this.props.openSnackbar('Please enter a name to save')
    } else {
      let nameExists = false
      let i = 0
      for (i = 0; i < this.state.allRoutes.length; i++) {
        if (this.state.allRoutes[i].areaName === this.state.modalField) {
          nameExists = true
          break
        }
      }
      if (nameExists) {
        this.props.openSnackbar(
          'You already have route configured with this name. Try another one.'
        )
      } else {
        this.setState(
          ({ createdRoute, modalField, distance }) => ({
            createdRoute: {
              ...createdRoute,
              name: modalField,
              distance: distance,
            },
          }),
          () => {
            // mutation to server
            this.saveRouteToDb()
            this.handleModalClose()
            this.handleClearRoute()
          }
        )
      }
    }
  }

  clearRoute = () => {
    // if (isRouteDrawn) {
    //   directionsRenderer.setMap(null)
    //   isRouteDrawn = false
    // }
    if (isRouteDrawn) {
      routePolyline.setMap(null)
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

  handleClearRoute = () => {
    this.clearRoute()
    this.clearMarkers()
    this.clearAoiFences()
    this.clearRouteVariables()
  }

  clearRouteVariables = () => {
    this.setState({
      places: [],
      placesCoordinates: [],
      distance: '',
      selectedRoute: null,
      selectedRouteDetails: null,
      selectedArea: null,
      areaTypeBuffer: [],
      aoiFenceBuffer: [],
      areaIds: [],
      createdOn: null,
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

  clearAoiFence = (index) => {
    if (fenceList.length > 0) {
      fenceList[index].setMap(null)
    }
  }

  handleSaveRoute = () => {
    const length = this.state.placesCoordinates.length
    if (length < 2) {
      this.props.openSnackbar('Not enough points to save route!')
    } else if (this.state.distance === '') {
      this.props.openSnackbar('Provide routefence buffer to save route!')
    } else if (parseInt(this.state.distance, 10) < 25) {
      this.props.openSnackbar('Fence buffer must be greater than 25 meters')
    } else {
      // draw and save fence
      this.clearAoiFences()
      this.drawRouteFence(this.state.createdRoute.route)
      this.drawAoiFences()

      // Call modal for confirmation
      this.setState({ modalOpen: true })
    }
  }

  handleRouteOptimization = (label, value) =>
    this.setState({ [label]: value }, () => {
      // this.drawRoute()
    })

  handleModalFieldNameChange = (name) => this.setState({ modalField: name })

  handleModalClose = () => this.setState({ modalOpen: false })

  handleFenceDistanceChange = (distance) => {
    this.setState({ distance })
  }

  drawAoiFences = () => {
    let i = 0
    this.state.areaTypeBuffer.forEach((type, index) => {
      if (type === 'places') {
        const radius = this.state.distance
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

  handleAoiChange = (value) => {
    if (value) {
      this.setState({ selectedArea: value }, () => {
        // Request the route selected by user
        this.fetchAreaDetails(this.state.selectedArea.id, () => {
          this.handlePlaceChange(this.state.selectedArea.areaName)
          this.fetchCoordinates(this.state.aoiCoordinates)
          this.defineAoiType(this.state.areaType)
          this.storeAreaIds(this.state.selectedArea.id)
        })
      })
    }
  }

  defineAoiType = (value) =>
    this.setState({ areaTypeBuffer: [...this.state.areaTypeBuffer, value] })

  fetchAreaDetails = async (areaId, proceed) => {
    const fetchedDetails = await this.props.client.query({
      query: GET_AREA_INFO,
      variables: {
        id: areaId,
      },
    })

    const receivedGeoJson = JSON.parse(
      fetchedDetails.data.getAreaDetails.geoJson
    )
    const polygonCenter = JSON.parse(
      fetchedDetails.data.getAreaDetails.geoPosition
    )
    this.decodeGeoJson(receivedGeoJson, polygonCenter, proceed)
  }

  decodeGeoJson = (receivedGeoJson, polygonCenter, proceed) => {
    const geoJson = receivedGeoJson
    if (geoJson.type === 'Circle') {
      this.setState(
        {
          aoiCoordinates: {
            lat: geoJson.coordinates[0],
            lng: geoJson.coordinates[1],
          },
          radius: parseInt(geoJson.radius, 10),
          areaType: geoJson.type,
          aoiFenceBuffer: [
            ...this.state.aoiFenceBuffer,
            parseInt(geoJson.radius, 10),
          ],
        },
        () => {
          proceed()
        }
      )
    } else {
      const coordinates = geoJson.coordinates[0]
      const polygonCoordinates = []
      coordinates.forEach((point) => {
        polygonCoordinates.push({
          lat: point[0],
          lng: point[1],
        })
      })
      this.setState(
        {
          areaType: geoJson.type,
          aoiCoordinates: polygonCenter,
          aoiFenceBuffer: [...this.state.aoiFenceBuffer, polygonCoordinates],
        },
        () => {
          proceed()
        }
      )
    }
  }

  confirmAoiSave = async () => {
    if (this.state.newAoiName === '') {
      this.props.openSnackbar('Provide name before saving')
    } else {
      const placesArray = this.state.places
      const areaTypeBufferArray = this.state.areaTypeBuffer
      const areaIdArray = this.state.areaIds
      const areaFenceArray = this.state.aoiFenceBuffer
      // New name
      placesArray[this._markerIndex] = this.state.newAoiName
      // New aoi will by default be a circular fence
      areaTypeBufferArray[this._markerIndex] = 'Circle'
      // area id array and fence buffer holds information for only aois and not places. Function below gets index for these arrays
      const intendedIndex = this.getIndexForAreaIdArray()

      // Call add area mutation. Always create Circle of 25 m radius
      const response = await this.props.client.mutate({
        mutation: ADD_AREA,
        variables: {
          areaTypeId: 2,
          areaName: this.state.newAoiName,
          clientLoginId: getLoginId(),
          geoJson: JSON.stringify({
            type: 'Circle',
            radius: 25,
            coordinates: [
              this.state.placesCoordinates[this._markerIndex].lat,
              this.state.placesCoordinates[this._markerIndex].lng,
            ],
          }),
          geoPosition: null,
        },
        refetchQueries: [
          {
            query: GET_ALL_AREAS,
            variables: {
              clientLoginId: getLoginId(),
            },
          },
        ],
      })
      if (response.data && response.data.addArea.id) {
        this.props.openSnackbar('New AOI added')
        // Id of created aoi
        areaIdArray[intendedIndex] = response.data.addArea.id
        // Circular fence of 25 m
        areaFenceArray[intendedIndex] = 25
      } else {
        this.props.openSnackbar('Unable to save AOI')
      }

      // Set all changes in route variables
      this.setState({
        confirmSave: false,
        places: placesArray,
        areaTypeBuffer: areaTypeBufferArray,
        areaIds: areaIdArray,
        aoiFenceBuffer: areaFenceArray,
      })
    }
  }

  getIndexForAreaIdArray = () => {
    let index = 0
    for (var i = 0; i < this._markerIndex; i++) {
      if (this.state.areaTypeBuffer[i] === 'places') {
        index++
      }
    }
    return this._markerIndex - index
  }

  handleClose = () => {
    this.setState({ confirmSave: false })
  }

  handleNewAoiName = (event) => {
    this.setState({ newAoiName: event.target.value })
  }

  handleAoiListDragEnd = (result) => {
    const length = markerList.length
    let aoiFenceBuffer = this.state.aoiFenceBuffer
    let areaIds = this.state.areaIds
    // Moved indexes
    const startIndex = result.source.index
    const endIndex = result.destination.index
    // Moved area type. If place, then don't change areaIds and aoiFenceBuffer states
    const isAreaTypeMovedPlace =
      this.state.areaTypeBuffer[result.source.index] === 'places'

    // Reset previous values
    this.placesOverStartIndex = 0
    this.placesOverEndIndex = 0
    // Get places over startIndex and places over endIndex
    for (let index = 0; index < startIndex; index++) {
      if (this.state.areaTypeBuffer[index] === 'places') {
        this.placesOverStartIndex++
      }
    }
    for (let index = 0; index < endIndex; index++) {
      if (this.state.areaTypeBuffer[index] === 'places') {
        this.placesOverEndIndex++
      }
    }
    // Reorder places
    const places = this.reorder(
      this.state.places,
      result.source.index,
      result.destination.index
    )
    // Reorder coordinates of points
    const placesCoordinates = this.reorder(
      this.state.placesCoordinates,
      result.source.index,
      result.destination.index
    )
    // Reorder markers
    markerList = this.reorder(
      markerList,
      result.source.index,
      result.destination.index
    )
    // Reorder area types
    const areaTypeBuffer = this.reorder(
      this.state.areaTypeBuffer,
      result.source.index,
      result.destination.index
    )
    // Reorder area fences
    if (!isAreaTypeMovedPlace) {
      aoiFenceBuffer = this.reorder(
        this.state.aoiFenceBuffer,
        result.source.index,
        result.destination.index,
        true // recalculate index
      )
    }
    // Reorder area area ids
    // if (!isAreaTypeMovedPlace) {
    areaIds = this.reorder(
      this.state.areaIds,
      result.source.index,
      result.destination.index
      // true // recalculate index
    )
    // console.log('area ids', areaIds)
    // }
    // Reorder fences
    if (fenceList.length > 0) {
      fenceList = this.reorder(
        fenceList,
        result.source.index,
        result.destination.index
      )
    }
    // Clear fences if drawn
    this.clearAoiFences()
    this.clearRoute()
    this.clearFence()

    // Reset all labels accordingly
    for (let index = 0; index < length; index++) {
      markerList[index].setLabel((index + 1).toString())
    }
    // Set all states
    this.setState({
      places,
      placesCoordinates,
      areaTypeBuffer,
      aoiFenceBuffer,
      areaIds,
    })
  }

  reorder = (list, startIndex, endIndex, recalculateIndex = false) => {
    const result = Array.from(list)
    // Recalculate index if aois are moved for areaIds and aoiFenceBuffer arrays
    if (recalculateIndex) {
      startIndex = startIndex - this.placesOverStartIndex
      endIndex = endIndex - this.placesOverEndIndex
    }
    const [removed] = result.splice(startIndex, 1)
    // TODO: Check removed for undefined values
    result.splice(endIndex, 0, removed)

    return result
  }

  handlePlaceError = () => {
    this.props.openSnackbar(
      'Invalid place entered. Choose from suggestions provided'
    )
  }

  handlebulkUploadRoutes = () => {
    this.setState({ instructionModalOpen: true })
  }

  onOkPress = () => {
    this.setState({ instructionModalOpen: false })
  }

  handleDownloadTemplate = () => {
    this.props.downloadSampleFile(
      GET_TEMPLATE,
      {
        bucketName: bucketName,
        name:
          getItem('plan', 'PERSISTENT') === 'School Plan'
            ? schoolFileName
            : fileName,
        fileType: 'EXCEL',
      },

      ['getPublicDownloadURL'],
      'Route Template'
    )
  }

  handleUploadRoute = async ({
    target: {
      validity,
      files: [file],
    },
  }) => {
    // TODO: Handle upload errors
    this.setState({ isUploading: true })
    if (validity.valid) {
      const fileExtension = file.name.substring(file.name.lastIndexOf('.') + 1)
      // console.log(fileExtension)
      const response = await this.props.client.mutate({
        mutation: GET_UPLOAD_URL,
        variables: {
          fileExtension,
        },
      })
      if (response.data && response.data.getPublicUploadURL) {
        const url = response.data.getPublicUploadURL.publicUploadURL
        await axios.put(url, file)
        this.setState({
          fileName: response.data.getPublicUploadURL.filename,
          bucketName: response.data.getPublicUploadURL.bucketName,
          publicUploadURL: response.data.getPublicUploadURL.publicUploadURL,
        })
        this.setState({ isUploading: false, uploadSuccess: true })
      }
    }
  }

  onSubmit = async () => {
    const uploadFor =
      getItem('plan', 'PERSISTENT') === 'School Plan'
        ? 'AddSchoolRoutes'
        : 'AddRoutes'
    console.log(uploadFor)
    const response = await this.props.client.mutate({
      mutation: SUBMIT_ROUTES_LIST,
      variables: {
        fileInfo: {
          uploadFor: uploadFor,
          bucketName: this.state.bucketName,
          fileName: this.state.fileName,
        },
        commonInput: {
          clientLoginId: getLoginId(),
        },
      },
      errorPolicy: 'all',
    })
    // console.log('Excel upload response', response)
    if (response.data && response.data.excelFileUpload) {
      const sucessfulEntries =
        response.data.excelFileUpload.successfullyUploaded
      const failedEntries = response.data.excelFileUpload.failedToUpload
      if (response.data.excelFileUpload.failedToUpload === 0) {
        this.props.openSnackbar(
          `Successfully added ${sucessfulEntries} Route(s).`
        )
        this.onOkPress()
        this.setState({
          isUploading: false,
          uploadSuccess: false,
          fileName: null,
          bucketName: null,
          publicUploadURL: null,
        })
      } else {
        this.props.openSnackbar(
          `Failed to add Route(s). ${failedEntries} error(s) found.`
        )
        this.setState(
          {
            uploadErrors: JSON.parse(
              response.data.excelFileUpload.failedUploadList
            ),
            openErrorModal: true,
            isUploading: false,
            uploadSuccess: false,
            fileName: null,
            bucketName: null,
            publicUploadURL: null,
          },
          () => {
            // console.log(this.state.uploadErrors)
          }
        )
        // Show error list to users
        this.onOkPress()
      }
    } else {
      this.setState({ uploadParseError: response.errors })
    }
  }

  onErrorOkPress = () => {
    this.setState({ openErrorModal: false })
  }

  render() {
    const { google, classes, selectedLanguage } = this.props

    return (
      <Grid container spacing={2} className={classes.root}>
        {/* Bulk upload fail reasons modal */}
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.openErrorModal}
          onClose={() => this.onErrorOkPress}
        >
          <div style={getModalStyle()} className={classes.paper}>
            <Typography variant="h6" id="modal-title">
              Route Bulk Failed
            </Typography>
            <Divider />
            <Typography variant="body2" id="modal-title">
              Upload failed due to following reasons.
            </Typography>
            <Grid container>
              <Grid item xs={12} lg={12}>
                {this.state.uploadErrors &&
                  this.state.uploadErrors.map((errors) => {
                    const reason = errors.errorMessage
                    const name = errors.route.Route_Name
                    return (
                      <ul style={{ padding: 5 }}>
                        <li style={{ padding: 5 }}>{reason}</li>
                        {/* {failedAt &&
                      failedAt.map(name => ( */}
                        <ul style={{ padding: 5 }}>
                          <li>
                            <Typography color="textSecondary">
                              {name}
                            </Typography>
                          </li>
                        </ul>
                        {/* ))} */}
                      </ul>
                    )
                  })}
              </Grid>
            </Grid>
            <Grid
              container
              justify="space-between"
              className={classes.buttonContainer}
            >
              <Grid item>
                <Button
                  style={styles.button}
                  color="default"
                  variant="outlined"
                  onClick={this.onErrorOkPress}
                >
                  Okay
                </Button>
              </Grid>
            </Grid>
          </div>
        </Modal>

        {/* Bulk upload instruction modal */}
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.instructionModalOpen}
          onClose={() => this.onOkPress}
        >
          <div style={getModalStyle()} className={classes.paper}>
            <Typography variant="h6" id="modal-title">
              Route Bulk Upload
            </Typography>
            <Divider />
            <br />
            {!this.state.uploadSuccess ? (
              <div>
                <Typography variant="body2">
                  A template is made available for you to download. You have to
                  fill the template sheet in format defined and upload to
                  generate new routes quickly!
                </Typography>
                <br />
                <Typography variant="body2">
                  If you have downloaded the template before, fill the sheet and
                  upload directly.
                </Typography>
              </div>
            ) : (
              <Typography variant="body2">
                List uploaded successfully! Press submit to save this route.
              </Typography>
            )}
            <br />
            {this.state.uploadParseError && (
              <Grid container>
                <Grid item xs={12}>
                  <Typography color="error">
                    You have following error(s). Please rectify and try again.
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  {this.state.uploadParseError.map((error, index) => (
                    <Grid container>
                      <Grid item xs={2}>
                        <Typography color="textSecondary" align="center">
                          {index + 1}
                        </Typography>
                      </Grid>
                      <Grid item xs={10}>
                        <Typography color="textSecondary" align="center">
                          {error.message}
                        </Typography>
                      </Grid>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}
            <br />
            {!this.state.uploadSuccess ? (
              <Grid
                container
                justify="space-between"
                className={classes.buttonContainer}
              >
                <Grid item>
                  <Button
                    style={styles.button}
                    color="default"
                    variant="outlined"
                    onClick={this.onOkPress}
                  >
                    Cancel
                  </Button>
                </Grid>
                <Grid item>
                  <Grid
                    container
                    alignItems="flex-end"
                    direction="column"
                    spacing={1}
                  >
                    <Grid item>
                      <Button
                        style={styles.button}
                        color="primary"
                        variant="outlined"
                        onClick={this.handleDownloadTemplate}
                      >
                        Download Template
                      </Button>
                    </Grid>
                    <Grid item>
                      <input
                        accept="*/*"
                        id="contained-button-file"
                        multiple
                        type="file"
                        style={{
                          display: 'none',
                        }}
                        onChange={this.handleUploadRoute}
                      />
                      <label htmlFor="contained-button-file">
                        {this.state.isUploading ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Button
                            variant="outlined"
                            color="primary"
                            component="span"
                          >
                            Upload
                          </Button>
                        )}
                      </label>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            ) : (
              <Grid container justify="space-between">
                <Grid item>
                  <Button
                    style={styles.button}
                    color="default"
                    variant="outlined"
                    onClick={() => {
                      this.onOkPress()
                      this.setState({
                        isUploading: false,
                        uploadSuccess: false,
                        fileName: null,
                        bucketName: null,
                        publicUploadURL: null,
                        uploadParseError: '',
                      })
                    }}
                  >
                    Cancel
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    disabled={this.state.uploadParseError !== ''}
                    style={styles.button}
                    color="primary"
                    variant="outlined"
                    onClick={this.onSubmit}
                  >
                    Submit
                  </Button>
                </Grid>
              </Grid>
            )}
          </div>
        </Modal>

        {/* Modal to take AOI values on route edit */}
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.confirmSave}
          onClose={this.handleClose}
        >
          <div style={getModalStyle()} className={classes.paper}>
            <Typography variant="h6" id="modal-title">
              AOI details
            </Typography>
            <Grid container spacing={1} justify="center" alignItems="center">
              <Grid item xs={4}>
                <Typography color="textSecondary">Name</Typography>
              </Grid>
              <Grid item xs={8}>
                <TextField
                  id="standard-bare"
                  className={classes.textField}
                  margin="normal"
                  onChange={this.handleNewAoiName}
                />
              </Grid>
            </Grid>
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
                  onClick={this.confirmAoiSave}
                >
                  Confirm
                </ColorButton>
              </Grid>
            </Grid>
          </div>
        </Modal>

        <Grid item xs={12}>
          <Typography variant="h5" className={classes.textLeft} gutterBottom>
            {languageJson[selectedLanguage].routesPage.routeCreation.pageTitle}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        <Grid item xs={12} className={classes.rowSpacing}>
          <Grid container spacing={2}>
            <Grid item>
              <Button
                component={Link}
                variant="outlined"
                color="default"
                to="/home/routes"
              >
                {
                  languageJson[selectedLanguage].routesPage.routeCreation
                    .goBackButtonTitle
                }
              </Button>
            </Grid>

            <Grid item>
              <Button
                variant="outlined"
                color="primary"
                onClick={this.handlebulkUploadRoutes}
              >
                {
                  languageJson[selectedLanguage].routesPage.routeCreation
                    .bulkCreationButtonTitle
                }
              </Button>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Grid container>
            <SimpleModal
              placeholder={
                languageJson[selectedLanguage].routesPage.routeDetails
                  .routeNameLabel
              }
              label="Save route as"
              modalOpen={this.state.modalOpen}
              handleModalClose={this.handleModalClose}
              saveAs={this.saveRouteName}
              handleModalFieldNameChange={this.handleModalFieldNameChange}
            />

            <Grid item xs={12} md={4}>
              <Waypoints
                isRouteDrawn={isRouteDrawn}
                aois={this.state.allAreas}
                selectedAoi={this.state.selectedAoi}
                onSelectedAoiChange={this.handleAoiChange}
                distance={this.state.distance}
                onFenceDistanceChange={this.handleFenceDistanceChange}
                radioSelection={this.state.radioSelection}
                places={this.state.places}
                placesCoordinates={this.state.placesCoordinates}
                showShortestRoute={this.state.optimalRoute}
                onSelectionChanged={this.onSelectionChange}
                getCoordinates={this.fetchCoordinates}
                onNewPlace={this.handlePlaceChange}
                handlePlaceError={this.handlePlaceError}
                onPlaceDelete={this.handlePlaceDelete}
                defineAoiType={this.defineAoiType}
                onRouteOptimization={this.handleRouteOptimization}
                onViewRoute={this.handleViewRoute}
                onClearRoute={this.handleClearRoute}
                onSaveRoute={this.handleSaveRoute}
                onAoiListDragEnd={this.handleAoiListDragEnd}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Map google={google} setMap={this.setMap} zoom={6} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

export default withGoogleMaps(
  withApollo(
    withSharedSnackbar(
      withLanguage(
        withStyles(styles)((props) => (
          <DownloadProgressDialogConsumer>
            {({ downloadReport }) => (
              <RoutesModule downloadSampleFile={downloadReport} {...props} />
            )}
          </DownloadProgressDialogConsumer>
        ))
      )
    )
  )
)
