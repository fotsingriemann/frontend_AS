/**
 * Trips configuration component
 * @module TripsConfigurationModule
 */

import React, { Component } from 'react'
import gql from 'graphql-tag'
import moment from 'moment'
import { Switch, Link } from 'react-router-dom'
import { withApollo } from 'react-apollo'
import { PrivateRoute } from '@zeliot/common/router'
import SimpleModal from '@zeliot/common/ui/SimpleModal'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import withGoogleMaps from '@zeliot/common/hoc/withGoogleMaps'
import {
  Grid,
  Button,
  Divider,
  Typography,
  withStyles,
  Modal,
  TextField,
  CircularProgress,
} from '@material-ui/core'
import {
  GET_ALL_ROUTES,
  GET_ROUTE_INFO,
  ADD_TRIP,
  GET_ALL_TRIPS,
  GET_ALL_VEHICLES,
  //route module queries
  ADD_ROUTE,
  GET_ALL_AREAS,
  GET_AREA_INFO,
  ADD_AREA,
  ADD_ROUTE_FOR_TRIPS,
} from '@zeliot/common/graphql/queries'
import axios from 'axios'
import Map from '@zeliot/core/base/modules/TrackingControls/Maps/Map'
import getLoginId from '@zeliot/common/utils/getLoginId'
import getUnixString from '@zeliot/common/utils/time/getUnixString'
import TripConfigurationPanel from './TripConfigurationPanel'
import Trips from '@zeliot/core/base/pages/Trips'
import ConfirmationModal from '../TripsDashboard/ConfirmationModal'
import { DownloadProgressDialogConsumer } from '@zeliot/common/shared/DownloadProgressDialog/DownloadProgressDialog.context'
//routes modules dependencies import
import getCustomPopup from '../RoutesModule/CustomPopup/CustomPopup'
import buffer from '@turf/buffer'
import { getItem } from '../../../../../storage'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

const GET_USER_CONFIGURATION = gql`
  {
    userConfiguration {
      plan
    }
  }
`

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

const SUBMIT_TRIPS_LIST = gql`
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

//route module queries
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

const GET_ALL_TYPE_OF_TRIPS = gql`
  query {
    getAllTypeOfTrips {
      id
      typeOfTrip
      createdAt
    }
  }
`

/**
 * @summary Bucket name of all excel templates
 */
const bucketName = 'excel-templates'

/**
 * @summary Name of template file in bucket
 */
const fileName = 'addTrips.xlsx'

/**
 * @summary List of all areas in the route, in order
 */
let markerList = []

/**
 * @summary List of all AOI fences in order
 */
let fenceList = []

/**
 * @summary Google polygon object to store route fence
 */
let routePolygon = null

/**
 * @summary Google polyline object to store route's path
 */
let routePolyline = null

/**
 * @summary Flag to monitor if the route is drawn
 */
let isRouteDrawn = false

/**
 * @summary Flag to monitor if route fence is drawn
 */
let isFenceDrawn = false

/**
 * @summary Vehicle marker reference
 */
let markerInstance = null

//routes dependences variables
let directionsRenderer = null
let fence = null
let isRouteOnViewDrawn = false
let originalCoordinates = null
let CustomPopup

const styles = (theme) => ({
  sliderStyle: {
    position: 'absolute',
    bottom: 10,
    padding: 10,
  },
  root: {
    padding: theme.spacing(3),
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
  buttonContainer: {
    marginTop: 15,
  },
  button: {
    margin: theme.spacing(1),
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
})

/**
 * Modal style
 * @function getModalStyle
 * @return {Object} Style object to place modal on center of screen
 * @summary Function to return modal style
 */
function getModalStyle() {
  const top = 50
  const left = 50

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  }
}

/**
 * TripsConfigurationModule component
 */
class TripsConfigurationModule extends Component {
  //route moudule  constructor
  constructor(props) {
    super(props)
    CustomPopup = getCustomPopup(props.google)
    this._customPopup = new CustomPopup()
  }

  /**
   * @property {boolean} modalOpen Flag to monitor state of modal to accept trip name
   * @property {?string} modalField Trip name input before save
   * @property {?object} map Map object
   * @property {?object[]} vehicles List of all the vehicles associated
   * @property {?object} selectedVehicle Vehicle selected out of the list of vehicles
   * @property {?object[]} tripTypes List of all the tripTypes associated
   * @property {?object} selectedTripType TripType selected out of the list of selectedTripType
   * @property {?object[]} routes List of all the routes created
   * @property {?object} selectedRoute Route selected from the list of routes
   * @property {?object} selectedRouteDetails All metadata associated with selected route
   * @property {?string[]} places Name of all the AOIs or places on selected route in order.
   * @property {?object[]} placesCoordinates Coordinates of all the AOIs or places on selected route in order
   * @property {?string[]} areaTypeBuffer Type of each area in selected route in order
   * @property {?object[]} aoiFenceBuffer Fences of all areas within selected route in order
   * @property {string|number} tolerance Tolerance time considered for trip start and trip end
   * @property {string[]} emails List of emails submitted to notify trip status
   * @property {string[]} numbers List of phone numbers submitted to notify trip status
   * @property {?string} fromDate Trip start date and time in epoch
   * @property {?string} toDate Trip stop date and time in epoch
   * @property {object[]} dayOfWeek Track which day is selected during scheduling a trip. Also disable selection of days based on trip duration.
   * @property {boolean} isSchedulingActive Flag to monitor if user is scheduling current trip
   * @property {?string} scheduledUpto End date and time of schedule in epoch
   * @property {?string} plan Plan assigned to current user
   * @property {string} radioSelectionOld Radio selection to determine if trip is pickup or drop
   * @property {boolean} openModal Flag to monitor state of modal to ask for confirmation
   * @property {string} modalMessage Title on confirmation modal
   * @property {string} modalReason Descriptive text message on confirmation modal
   * @property {boolean} instructionModalOpen State of instruction modal during bulk upload
   * @property {string|object[]} uploadParseError Captured errors during excel upload
   * @property {?string} fileName Name of template file in bucket
   * @property {?string} bucketName Bucket name of all excel templates
   * @property {boolean} uploadSuccess Flag to monitor if upload is successful
   * @property {?string} publicUploadURL Upload URL of the excel file parsed
   * @property {boolean} isUploading Flag to monitor if uploading is in progress
   * @property {boolean} openErrorModal Flag to monitor state of modal to show error message
   */

  state = {
    tripsModalOpen: false,
    //  modalField: null,
    //  map: null,
    vehicles: null,
    selectedVehicle: null,
    tripTypes: null,
    selectedTripType: null,
    routes: null,
    tolerance: '',
    emails: [''],
    numbers: [''],
    fromDate: null,
    toDate: null,
    dayOfWeek: [
      { status: false, disable: false },
      { status: false, disable: false },
      { status: false, disable: false },
      { status: false, disable: false },
      { status: false, disable: false },
      { status: false, disable: false },
      { status: false, disable: false },
    ],
    isSchedulingActive: false,
    scheduledUpto: null,
    plan: null,
    radioSelectionOld: 'PICKUP',
    radioSelectionNew: 'assign',
    openModal: false,
    modalMessage: '',
    modalReason: '',
    instructionModalOpen: false,
    uploadParseError: '',
    fileName: null,
    bucketName: null,
    uploadSuccess: false,
    publicUploadURL: null,
    isUploading: false,
    openErrorModal: false,
    distance: '', //route module states start
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
    isWaypointsOpen: true, //waypoint close after route is saved start
    isCardPresent: true, //for card
  }

  componentDidMount = () => {
    // console.log("inside cdm of moudule")
    this.getplan()
    this.requestAllVehicles()
    this.requestAllRoutes()
    this.requestAllTripTypes()
    this.fetchAllRoutes() //route functions in cdm start
    this.fetchAllAreas()
  }

  //route module functions dependencies
  //***********************start ************************************************************//

  fetchAllAreas = async () => {
    //console.log("inside fetchAllAreas")
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
    //  console.log('Get all vehicles: ', fetchedAreas.data.getAllAreaDetails)
    this.setState({ allAreas: fetchedAreas.data.getAllAreaDetails })
  }

  fetchAllRoutes = async () => {
    // console.log("inside fetchAllRoutes")
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
    // console.log("inside save route to db fn")

    const success = await this.props.client.mutate({
      mutation: ADD_ROUTE_FOR_TRIPS,
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
    if (!success.data.addRouteForTrips) {
      this.props.openSnackbar(
        'Failed to communicate to server. Please try again'
      )
    } else {
      // console.log("data is",success)
      let selectedData = {
        id: success.data.addRouteForTrips.id,
        areaName: success.data.addRouteForTrips.areaName,
        createdAt: success.data.addRouteForTrips.createdAt,
      }
      let selectedRouteDetail = JSON.parse(
        success.data.addRouteForTrips.routeDetail
      )
      this.props.openSnackbar(
        `Route ${success.data.addRouteForTrips.areaName} is saved and assigned to the current trip!`
      )
      // await this.handleClearRoute()

      // this.getRouteByAreaName(this.state.createdRoute.name)
      // this.fetchAllRoutes()
      // this.props.requestAllRoutes()
      //await this.getRouteByAreaName(this.state.createdRoute.name)

      // now set the selected Routes only

      // console.log("selectedRoute is",this.state.selectedRoute)
      // console.log("selectedRouteDetails is",this.state.selectedRouteDetails)
      // console.log("this.state.places is ",this.state.places)
      // console.log("this.state.placesCoordinates is ",this.state.placesCoordinates)
      // console.log("this.state.aoiFenceBuffer is ",this.state.aoiFenceBuffer)
      // console.log("this.state.areaTypeBuffer is ",this.state.areaTypeBuffer)

      this.setState(
        {
          selectedRoute: selectedData,
          selectedRouteDetails: selectedRouteDetail,
          isWaypointsOpen: false,
        },
        () => {
          // console.log("selectedRoute after is ",this.state.selectedRoute)
          // console.log("selectedRouteDetails after is ",this.state.selectedRouteDetails)
        }
      )

      // //now set the selected Routes if not cleared
      //     this.setState({ selectedRoute: success }, () => {
      //       // Request the route selected by user
      //       this.fetchRouteDetails(this.state.selectedRoute.id, () => {
      //         // get coordinates for polyline on map
      //         this.drawRouteOnView()

      //         // get markers for coordinates
      //         this.drawMarkersOnView()

      //         // Calculate fence and show on map
      //         this.plotFenceOnMap(this.state.selectedRouteDetails.routeFence)
      //         // Draw AOI fences on map
      //         this.drawAoiFences()

      //         // Reset flags
      //         isFenceDrawn = true
      //         isRouteDrawn = true
      //       })
      //     })
    }
  }

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
        () => {
          this.drawRouteOnViewInRoutes(overviewPathLatLng)
          // console.log("created route is",this.state.createdRoute)
        }
      )
    }
  }

  drawRouteOnViewInRoutes = (overviewPathLatLng) => {
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
            this.handleModalClose()
            this.saveRouteToDb()
            //  this.handleClearRoute()
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

  clearFence = () => {
    if (fence) {
      fence.setMap(null)
      fence = null
    }
  }

  clearAoiFence = (index) => {
    if (fenceList.length > 0) {
      fenceList[index].setMap(null)
    }
  }

  handleSaveRouteToTrips = () => {
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

  handleFenceDistanceChange = (distance) => {
    this.setState({ distance })
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

  //the {/* Modal to take AOI values on route edit */} is not implemented yet so this is not being used
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

  //the  Modal to take AOI values on route edit  is not implemented yet so this is not being used
  handleClose = () => {
    this.setState({ confirmSave: false })
  }

  //the  Modal to take AOI values on route edit  is not implemented yet so this is not being used
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

  //***********************end of route functions ***************************************************//

  /**
   * @async
   * @function getplan
   * @summary Fetches the plan of existing user. This is used to conditionally render certain components based on plan.
   */
  getplan = async () => {
    const response = await this.props.client.query({
      query: GET_USER_CONFIGURATION,
    })
    if (response.data && response.data.userConfiguration) {
      this.setState({ plan: response.data.userConfiguration.plan.name })
    }
  }

  // ** CREATION VALIDATION AND UTILITY FUNCTIONS ** //------------------------------------------------
  /**
   * @function createGeoJson
   * @return {object} Custom geoJson object
   * @summary Converts created route fence and all area fences into one object in particular format required to save trip.
   */
  createGeoJson = () => {
    //  console.log("inside createGeoJson fn ")

    //  console.log("selectedRoute is",this.state.selectedRoute)
    //  console.log("selectedRouteDetails is",this.state.selectedRouteDetails)
    //  console.log("this.state.places is ",this.state.places)
    //  console.log("this.state.placesCoordinates is ",this.state.placesCoordinates)
    //  console.log("this.state.aoiFenceBuffer is ",this.state.aoiFenceBuffer)
    //  console.log("this.state.areaTypeBuffer is ",this.state.areaTypeBuffer)

    const createdGeoJson = []
    let i = 0

    // Insert route
    const routeFence = this.state.selectedRouteDetails.routeFence
    const geoJsonRouteFence = this.convertToGeoJson(routeFence)
    createdGeoJson.push({
      name: this.state.selectedRoute.areaName,
      geoJson: JSON.stringify({
        type: 'Polygon',
        coordinates: [geoJsonRouteFence],
      }),
      areaType: 'route',
    })

    // Insert all waypoints
    this.state.areaTypeBuffer.forEach((areaType, index) => {
      if (areaType === 'places') {
        createdGeoJson.push({
          name: this.state.places[index],
          geoJson: JSON.stringify({
            type: 'Circle',
            radius: parseInt(this.state.selectedRouteDetails.distance, 10),
            coordinates: [
              this.state.placesCoordinates[index].lat,
              this.state.placesCoordinates[index].lng,
            ],
          }),
          areaType: 'circle',
        })
      } else if (areaType === 'Circle') {
        createdGeoJson.push({
          name: this.state.places[index],
          geoJson: JSON.stringify({
            type: 'Circle',
            radius: parseInt(this.state.aoiFenceBuffer[i++], 10),
            coordinates: [
              this.state.placesCoordinates[index].lat,
              this.state.placesCoordinates[index].lng,
            ],
          }),
          areaType: 'circle',
        })
      } else if (areaType === 'Polygon') {
        createdGeoJson.push({
          name: this.state.places[index],
          geoJson: JSON.stringify({
            type: 'Polygon',
            coordinates: [
              this.convertToGeoJson(this.state.aoiFenceBuffer[i++]),
            ],
          }),
          areaType: 'polygon',
        })
      }
    })
    return createdGeoJson
  }

  /**
   * @function convertToGeoJson
   * @param {Array[]} fence Array of latLng array to be converted to geoJson, Supporting {@link createGeoJson} function
   * @return {object} geoJson
   * @summary Converts supplied fence to geojson object.
   */
  convertToGeoJson = (fence) => {
    const geoJson = []
    fence.forEach((coordinate) => {
      geoJson.push([coordinate.lat, coordinate.lng])
    })
    return geoJson
  }

  /**
   * @function getMasterTimestamps
   * @return {object} masterTimestamps
   * @summary Calculates master from and to timestamps for trip considering tolerance and schedule.
   */
  getMasterTimestamps = () => {
    const masterTimestamps = {}
    let schedule = 0
    masterTimestamps.masterFromDate = getUnixString(
      moment(
        moment(this.state.fromDate).subtract(this.state.tolerance, 'minutes')
      )
    )
    if (this.state.scheduledUpto) {
      masterTimestamps.masterToDate = getUnixString(
        moment(moment(this.state.scheduledUpto).endOf('day'))
      )
    } else {
      masterTimestamps.masterToDate = getUnixString(
        moment(moment(this.state.toDate).add(this.state.tolerance, 'minutes'))
      )
    }

    if (this.state.isSchedulingActive) {
      this.state.dayOfWeek.forEach((day, index) => {
        if (day.status) {
          schedule = schedule + Math.pow(2, 6 - index)
        }
      })
      masterTimestamps.schedule = schedule
    } else {
      masterTimestamps.schedule = 0
    }

    return masterTimestamps
  }

  /**
   * @function validateNumbers
   * @return {boolean} Number valid or invalid.
   * @summary Validate number using regex syntactically.
   */
  validateNumbers = () => {
    const phoneRegex = /\+?\d{9,11}$/

    const filteredNumbers = this.state.numbers.filter((number) => number !== '')

    if (filteredNumbers.every((number) => phoneRegex.test(number))) {
      return filteredNumbers
    } else {
      return false
    }
  }

  /**
   * @function validateEmails
   * @return {boolean} Email valid or invalid.
   * @summary Validate Email using regex syntactically.
   */
  validateEmails = () => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

    const filteredEmails = this.state.emails.filter((email) => email !== '')

    if (filteredEmails.every((email) => emailRegex.test(email))) {
      return filteredEmails
    } else {
      return false
    }
  }

  /**
   * @function getUnix
   * @return {object} From and to date.
   * @summary Converts from and to date in epoch.
   */
  getUnix = () => ({
    fromDate: getUnixString(this.state.fromDate),
    toDate: getUnixString(this.state.toDate),
  })

  /**
   * @function checkInputFields
   * @return {boolean}
   * @summary Check if all the mandatory input fields are filled.
   */
  checkInputFields = () => {
    //  console.log("selectedRoute is ",this.state.selectedRoute)
    return (
      !this.state.selectedRoute ||
      !this.state.selectedVehicle ||
      !this.state.selectedTripType ||
      !this.state.fromDate ||
      !this.state.toDate ||
      this.state.tolerance === '' ||
      (!this.state.scheduledUpto && this.state.isSchedulingActive)
    )
  }
  // ** CREATION VALIDATION AND UTILITY FUNCTIONS ** //------------------------------------------------

  // ** CREATE TRIP FUNCTIONS ** //-------------------------------------------------------------------
  /**
   * @async
   * @function saveTripInDb
   * @return {boolean} Validation and Mutation sucess or failure
   * @summary Validate all the inputs and saves the data in DB.
   */
  saveTripInDb = async () => {
    // Get time in unix
    const unixDates = this.getUnix()
    // Calculate geoJson
    const geoJson = this.createGeoJson()

    //  JSON.stringify(this.state.geoJson)

    // Get master timestamps
    const masterTimestamps = this.getMasterTimestamps()
    const numbers = this.validateNumbers()
    const emails = this.validateEmails()

    if (!emails) {
      this.props.openSnackbar('Invalid email', { type: 'warning' })
      return false
    }

    if (!numbers) {
      this.props.openSnackbar('Invalid phone number', { type: 'warning' })
      return false
    }

    const success = await this.props.client.mutate({
      mutation: ADD_TRIP,
      variables: {
        geoJson: geoJson,
        tripName: this.state.modalField,
        clientLoginId: getLoginId(),
        routeId: this.state.selectedRoute.id,
        fromTimestamp: unixDates.fromDate.toString(),
        scheduleFromTimestamp: masterTimestamps.masterFromDate,
        toTimestamp: unixDates.toDate.toString(),
        scheduleToTimestamp: masterTimestamps.masterToDate,
        tolerance: this.state.tolerance * 60,
        sms: numbers,
        email: emails,
        uniqueDeviceId: this.state.selectedVehicle.deviceDetail.uniqueDeviceId,
        schedule: masterTimestamps.schedule,
        tripType:
          this.state.plan === 'School Plan'
            ? this.state.radioSelectionOld
            : null,
        typeOfTrip: this.state.selectedTripType.typeOfTrip,
      },
      errorPolicy: 'all',
      refetchQueries: [
        {
          query: GET_ALL_TRIPS,
          variables: {
            clientLoginId: getLoginId(),
            status: null,
            uniqueDeviceId: null,
          },
          fetchPolicy: 'network-only',
        },
      ],
    })

    // console.log('check trip creation', success)
    if (success.data && success.data.addTrip) {
      this.props.openSnackbar('Trip saved!', { type: 'success' })
      //waypoint component should open again
      this.setState({ isWaypointsOpen: true })
      return true
    } else {
      this.props.openSnackbar('Failed to save trip', { type: 'error' })
      this.setState({
        openModal: true,
        modalMessage: 'Failed to save trip!',
        modalReason: success.errors[0].message,
      })
      return false
    }
  }

  //
  /**
   * @async
   * @function fetchRouteDetails
   * @param {number} areaId Id of selected roue
   * @callback proceed Called after route details are fetched.e
   * @summary  Fetch details for chosen route
   */
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
        places: JSON.parse(fetchedDetails.data.getRoute.places),
        placesCoordinates: JSON.parse(
          fetchedDetails.data.getRoute.placeCoordinates
        ),
        areaTypeBuffer: JSON.parse(fetchedDetails.data.getRoute.areaTypeBuffer),
        aoiFenceBuffer: JSON.parse(fetchedDetails.data.getRoute.aoiFenceBuffer),
      },
      () => {
        proceed()
      }
    )
  }

  // Get all routes available to create trip
  /**
   * @async
   * @function requestAllRoutes
   * @summary Fetch all routes associated with this user
   */
  requestAllRoutes = async () => {
    //  console.log("inside requestAllRoutes -------------")
    const fetchedRoutes = await this.props.client.query({
      query: GET_ALL_ROUTES,
      variables: {
        clientLoginId: getLoginId(),
      },
    })
    this.setState({ routes: fetchedRoutes.data.getAllRoutes })
  }

  // Get all vehicles for trip creation
  /**
   * @async
   * @function requestAllVehicles
   * @summary Fetch all vehiles associated with this user
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

  // Get all type of trips for trip creation
  /**
   * @async
   * @function requestAllVehicles
   * @summary Fetch all vehiles associated with this user
   */
  requestAllTripTypes = async () => {
    const fetchedTrips = await this.props.client.query({
      query: GET_ALL_TYPE_OF_TRIPS,
      //  variables: {
      //    loginId: getLoginId()
      //  }
    })
    //  console.log("fetchedTrips",JSON.stringify(fetchedTrips))
    this.setState({ tripTypes: fetchedTrips.data.getAllTypeOfTrips })
  }

  /**
   * @function handleModalClose
   * @summary Close trip name modal
   */
  handleModalClose = () => {
    this.setState({ modalOpen: false })
  }

  handleTripsModalClose = () => {
    this.setState({ tripsModalOpen: false })
  }

  /**
   * @function handleModalFieldNameChange
   * @param {string} name String to be saved as trip name
   * @summary Capture keyboard input for trip name
   */
  handleModalFieldNameChange = (name) => {
    this.setState({ modalField: name })
  }

  /**
   * @async
   * @function saveTripName
   * @summary Validate the name given to trip and call mutation to save trip
   */
  saveTripName = async () => {
    if (!this.state.modalField || this.state.modalField === '') {
      this.props.openSnackbar('Please enter a name to save')
    } else {
      this.handleTripsModalClose()
      const status = await this.saveTripInDb()
      if (status) {
        this.handleClearRoute()
      }
    }
  }

  /**
   * @function handleSaveRoute
   * @summary Check if the mutation is success or failure and notify user accordingly
   */
  handleSaveRoute = () => {
    // Check if all values are provided
    const failed = this.checkInputFields()
    if (failed) {
      this.props.openSnackbar('Provide all information to create trip')
    } else {
      // Call modal for confirmation
      this.setState({ tripsModalOpen: true })
    }
  }

  /**
   * @function handleVehicleChange
   * @param {?object} selectedVehicle
   * @summary Capture selected vehicle state
   */
  handleVehicleChange = (selectedVehicle) => {
    this.setState({ selectedVehicle })
  }

  /**
   * @function handleTripType
   * @param {?object} selectedTripType
   * @summary Capture selected trio type state
   */
  handleTripType = (selectedTripType) => {
    this.setState({ selectedTripType }, () => {
      console.log('selectedTripType', this.state.selectedTripType)
    })
  }

  /**
   * @function handleToleranceChange
   * @param {string} tolerance
   * @summary Capture tolerance state
   */
  handleToleranceChange = (tolerance) => {
    this.setState({ tolerance })
  }

  /**
   * @function handleDateChange
   * @param {string} key State name whose value needs to be set
   * @param {object} date Selected date
   * @summary Date change validations and assignment
   */
  handleDateChange = (key, date) => {
    const now = moment()
    if (now > date) {
      this.props.openSnackbar('Selection to past dates not allowed')
    } else {
      if (key === 'scheduledUpto') {
        if (date < this.state.scheduledUpto) {
          this.props.openSnackbar("Schedule needs to be atleast a week's long")
        } else {
          this.setState({ [key]: date })
        }
      } else if (key === 'fromDate') {
        if (this.state.toDate) {
          if (date > this.state.toDate) {
            this.props.openSnackbar("From date can't be greater than To date")
          } else {
            this.setState({ [key]: date }, () => {
              this.resetDayOfWeek()
            })
          }
        } else {
          this.setState({ [key]: date }, () => {
            this.resetDayOfWeek()
          })
        }
      } else {
        if (this.state.fromDate) {
          if (date < this.state.fromDate) {
            this.props.openSnackbar("To date can't be less than From date")
          } else {
            this.setState({ [key]: date }, () => {
              this.resetDayOfWeek()
            })
          }
        } else {
          this.setState({ [key]: date }, () => {
            this.resetDayOfWeek()
          })
        }
      }
    }
  }

  /**
   * @function handleRouteChange
   * @param {?object} value Selected route
   * @summary On route change, clear previous fences and draw new ones
   */
  handleRouteChange = (value) => {
    //  console.log("inside handleRouteChange")
    if (value) {
      // Clear route
      this.clearRoute()
      this.clearMarkers()
      this.clearAoiFences()
      this.setState({ selectedRoute: value }, () => {
        // Request the route selected by user
        this.fetchRouteDetails(this.state.selectedRoute.id, () => {
          // console.log("selectedRoute is",this.state.selectedRoute)
          // console.log("selectedRouteDetails is",this.state.selectedRouteDetails)
          // console.log("this.state.places is ",this.state.places)
          // console.log("this.state.placesCoordinates is ",this.state.placesCoordinates)
          // console.log("this.state.aoiFenceBuffer is ",this.state.aoiFenceBuffer)
          // console.log("this.state.areaTypeBuffer is ",this.state.areaTypeBuffer)

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
      this.setState({ selectedRoute: value })
      // Clear route
      this.clearRoute()
      this.clearMarkers()
      this.clearAoiFences()
    }
  }
  // ** CREATE TRIP FUNCTIONS ** //-------------------------------------------------------------------

  // ** MAP UTILITY FUNCTIONS ** // -----------
  /**
   * @function setMap
   * @summary Set map state
   */
  setMap = (map) => this.setState({ map })

  /**
   * @function drawRouteOnView
   * @summary Draw route path when a route is selected during trip creation
   */
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
    isRouteDrawn = true
  }

  /**
   * @function drawMarkersOnView
   * @summary Draw marker coordinates and set map bounds when route is selected during trip creation
   */
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

  /**
   * @function plotFenceOnMap
   * @summary Draw route fence when a route is selected during trip creation
   */
  plotFenceOnMap = (googlePathGeo) => {
    // Plot fence on map
    if (routePolygon && routePolygon.setMap) routePolygon.setMap(null)
    routePolygon = new this.props.google.maps.Polygon({
      paths: googlePathGeo,
      map: this.state.map,
    })
  }

  /**
   * @function drawAoiFences
   * @summary Draw area fences when a route is selected during trip creation
   */
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

  /**
   * @function drawStaticCircularFence
   * @param {string} radius Radius of circular AOI
   * @param {object} center Coordinates of center of circular AOI
   * @summary Draw circular fences in selected route. Used in {@link drawAoiFences} function.
   */
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

  /**
   * @function drawStaticPolygonFence
   * @param {object} polyFence Fence of polygon AOI
   * @summary Draw polygon fences in selected route. Used in {@link drawAoiFences} function.
   */
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

  // ** MAP UTILITY FUNCTIONS ** //-------------------------------------------------------------------

  // ** CLEAR FUNCTIONS ** //-------------------------------------------------------------------
  /**
   * @function handleClearRoute
   * @summary Clear all map variables and fences when route is deselected
   */

  handleClearRoute = () => {
    this.clearMapVariable()
    this.clearRoute()
    this.clearMarkers()
    this.clearAoiFences()
    this.clearRouteVariables()
  }

  handleClearRouteOnClearButton = () => {
    this.clearMapVariable()
    this.clearRoute()
    this.clearMarkers()
    this.clearAoiFences()
    this.clearRouteVariablesOnly()
  }

  handleClearRouteOfRadioChange = () => {
    this.clearMapVariable()
    this.clearRoute()
    this.clearMarkers()
    this.clearAoiFences()
    this.clearRouteVariablesAndWaypoints()
  }

  /**
   * @function clearMapVariable
   * @summary Clear vehicle marker
   */
  clearMapVariable = () => {
    if (markerInstance) markerInstance.setMap(null)
    markerInstance = null
  }

  /**
   * @function clearRoute
   * @summary Clear route path and fence
   */

  /**
   * @function clearRouteVariables
   * @summary Clear all related variables  when trip is saved and
   */
  clearRouteVariables = () => {
    this.setState({
      modalField: null, //trip related variables
      selectedVehicle: null,
      selectedTripType: null,
      selectedRoute: null,
      selectedRouteDetails: null,
      tolerance: '',
      emails: [''],
      numbers: [''],
      fromDate: null,
      toDate: null,
      dayOfWeek: [
        { status: false, disable: false },
        { status: false, disable: false },
        { status: false, disable: false },
        { status: false, disable: false },
        { status: false, disable: false },
        { status: false, disable: false },
        { status: false, disable: false },
      ],
      isSchedulingActive: false,
      scheduledUpto: null,
      places: [], //routes variables clear
      placesCoordinates: [],
      distance: '',
      selectedArea: null,
      areaTypeBuffer: [],
      aoiFenceBuffer: [],
      areaIds: [],
      createdOn: null,
    })
  }

  //clear Route variables only
  clearRouteVariablesOnly = () => {
    this.setState({
      places: [], //routes variables clear
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

  //to clear route and waypoints variabes only
  clearRouteVariablesAndWaypoints = () => {
    this.setState({
      modalField: null, //trip related variables
      // selectedVehicle: null,
      //selectedTripType:null,
      selectedRoute: null,
      selectedRouteDetails: null,
      // tolerance: '',
      //emails: [''],
      //numbers: [''],
      //fromDate: null,
      // toDate: null,
      // dayOfWeek: [
      //   { status: false, disable: false },
      //   { status: false, disable: false },
      //   { status: false, disable: false },
      //   { status: false, disable: false },
      //   { status: false, disable: false },
      //   { status: false, disable: false },
      //   { status: false, disable: false }
      // ],
      //isSchedulingActive: false,
      //scheduledUpto: null,
      places: [], //routes variables clear
      placesCoordinates: [],
      distance: '',
      selectedArea: null,
      areaTypeBuffer: [],
      aoiFenceBuffer: [],
      areaIds: [],
      createdOn: null,
      radioSelection: 'places', //handled
      isWaypointsOpen: true,
    })
  }

  /**
   * @function clearMarkers
   * @summary Clear all area markers in route
   */
  clearMarkers = () => {
    if (markerList.length > 0) {
      for (let i = 0; i < markerList.length; i++) {
        markerList[i].setMap(null)
      }
      markerList = []
    }
  }

  /**
   * @function clearAoiFences
   * @summary clear all area fences in route
   */
  clearAoiFences = () => {
    if (fenceList.length > 0) {
      for (let i = 0; i < fenceList.length; i++) {
        fenceList[i].setMap(null)
      }
      fenceList = []
    }
  }

  // ** CLEAR FUNCTIONS ** //-------------------------------------------------------------------

  // ** SCHEDULING FUNCTIONS ** //-------------------------------------------------------------------
  /**
   * @function handleDayChange
   * @param {boolean} checkboxState To monitor if checkbox is selected or deselected
   * @param {number} index Index of day which is clicked in checkbox array
   * @summary Sets the daywise mapping of checkbox array
   */
  handleDayChange = (checkboxState, index) => {
    this.getFormattedDayOfWeek(index, {
      status: checkboxState,
      disableChecked: false,
    })
  }

  /**
   * @function handleSwitchChange
   * @param {object} event Switch toggle event
   * @summary Enables or disables schedule selection
   */
  handleSwitchChange = (event) => {
    if (this.state.fromDate && this.state.toDate) {
      // Get duration of trip
      this.setState({
        scheduledUpto: moment(this.state.fromDate).add(1, 'week'),
        isSchedulingActive: event.target.checked,
      })
    } else {
      this.props.openSnackbar(
        'Please enter trip start and end time before scheduling'
      )
    }
  }

  /**
   * @function processDayOfWeek
   * @param {object} options
   * @summary Find index of checkbox array based on date
   */
  processDayOfWeek = (options) => {
    // Get day for trip start date and find index
    const dayOfWeekIndex = this.getDayOfWeekIndex(
      moment(this.state.fromDate).format('ddd')
    )
    // Enable that date and disable adjacent dates in case trip is longer than a day
    this.getFormattedDayOfWeek(dayOfWeekIndex, options)
  }

  /**
   * @function resetDayOfWeek
   * @summary Reset checkbox array used for scheduling
   */
  resetDayOfWeek = () => {
    // Reset is needed when date is changed
    this.setState(
      {
        tripDuration:
          moment(this.state.toDate).unix() - moment(this.state.fromDate).unix(),
        dayOfWeek: [
          { status: false, disable: false },
          { status: false, disable: false },
          { status: false, disable: false },
          { status: false, disable: false },
          { status: false, disable: false },
          { status: false, disable: false },
          { status: false, disable: false },
        ],
      },
      () => {
        this.processDayOfWeek({ status: true, disableChecked: true })
      }
    )
  }

  /**
   * @function getFormattedDayOfWeek
   * @param {number} dayOfWeekIndex Index of checkbox array based on selected from and to date
   * @param {object} options Status to be set for checkbox array at {@link dayOfWeekIndex} index
   * @summary Rearranges the whole mapping of checkbox array. This includes checking of selected fields and disabling of checkboxes in case of multiple day trips
   */
  getFormattedDayOfWeek = (dayOfWeekIndex, options) => {
    const dayOfWeek = this.state.dayOfWeek
    // Trip status on day
    dayOfWeek[dayOfWeekIndex].status = options.status
    // Check for multi-day trip
    if (this.state.tripDuration >= 86400) {
      const noOfDays = parseInt(this.state.tripDuration / 86400, 10) % 7
      for (var i = 0 - noOfDays; i <= noOfDays; i++) {
        if (i !== 0 || options.disableChecked) {
          let index = dayOfWeekIndex + i
          if (index < 0) index = 7 + index
          if (index > 6) index = index - 7
          dayOfWeek[index].disable = options.status
        }
      }
      // unchecking existing day in schedule should hold disabled days for other configured days
      if (!options.status) {
        dayOfWeek.forEach((day, dayOfWeekIndex) => {
          if (day.status) {
            for (var i = 0 - noOfDays; i <= noOfDays; i++) {
              if (i !== 0) {
                let index = dayOfWeekIndex + i
                if (index < 0) index = 7 + index
                if (index > 6) index = index - 7
                dayOfWeek[index].disable = true
              }
            }
          }
        })
      }
    } else {
      if (options.disableChecked) dayOfWeek[dayOfWeekIndex].disable = true
      else dayOfWeek[dayOfWeekIndex].disable = false
    }
    this.setState({ dayOfWeek })
  }

  /**
   * @function getDayOfWeekIndex
   * @param {string} day Day of week
   * @return {number} Index based on day of week.
   * @summary Day of week to index of day mapping. This index is used to calculate value of schedule
   */
  getDayOfWeekIndex = (day) => {
    switch (day) {
      case 'Mon':
        return 0
      case 'Tue':
        return 1
      case 'Wed':
        return 2
      case 'Thu':
        return 3
      case 'Fri':
        return 4
      case 'Sat':
        return 5
      case 'Sun':
        return 6
      default:
        return 0
    }
  }
  // ** SCHEDULING FUNCTIONS ** //-------------------------------------------------------------------

  // ** CONTACT DETAILS FUNCTIONS ** //--------------------------------------------------------------
  /**
   * @function handleAddNumberField
   * @summary Add extra phone number fields in contact information
   */
  handleAddNumberField = () => {
    const lastEntry = this.state.numbers.length - 1
    if (this.state.numbers[lastEntry] === '') {
      this.props.openSnackbar('Fill contact number before adding more')
    } else {
      this.setState({ numbers: [...this.state.numbers, ''] })
    }
  }

  /**
   * @function handleAddEmailField
   * @summary Add extra email fields in contact information
   */
  handleAddEmailField = () => {
    const lastEntry = this.state.emails.length - 1
    if (this.state.emails[lastEntry] === '') {
      this.props.openSnackbar('Fill email details before adding more')
    } else {
      this.setState({ emails: [...this.state.emails, ''] })
    }
  }

  /**
   * @function handleDeleteNumberField
   * @param {number} index Index of number to be removed from list of contact numbers
   * @summary Removes number at given index from contact details
   */
  handleDeleteNumberField = (index) => {
    if (this.state.numbers.length > 1) {
      // Don't delete all entries
      var array = [...this.state.numbers] // make a separate copy of the array
      if (index !== -1) {
        array.splice(index, 1)
        this.setState({ numbers: array })
      }
    }
  }

  /**
   * @function handleDeleteEmailField
   * @param {number} index Index of number to be removed from list of emails
   * @summary Removes email at given index from contact details
   */
  handleDeleteEmailField = (index) => {
    if (this.state.emails.length > 1) {
      // Don't delete all entries
      var array = [...this.state.emails] // make a separate copy of the array
      if (index !== -1) {
        array.splice(index, 1)
        this.setState({ emails: array })
      }
    }
  }

  /**
   * @function handleEmailChange
   * @param {string} email Email string entered by user
   * @param {number} index Index at which email is being entered
   * @summary Capture states of all emails entered
   */
  handleEmailChange = (email, index) => {
    const storedEmails = this.state.emails
    storedEmails[index] = email
    this.setState({ emails: storedEmails })
  }

  /**
   * @function handleNumberChange
   * @param {string} number Phone number string entered by user
   * @param {number} index Index at which phone number is being entered
   * @summary Capture states of all numbers entered
   */
  handleNumberChange = (number, index) => {
    const storedNumbers = this.state.numbers
    storedNumbers[index] = number
    this.setState({ numbers: storedNumbers })
  }

  /**
   * @function onSelectionChanged
   * @param {string} value Trip type selection
   * @summary Capture change in trip type selection
   */
  onSelectionChangedOld = (value) => {
    this.setState({ radioSelectionOld: value })
  }

  onSelectionChangedNew = (value) => {
    this.setState({ radioSelectionNew: value })
  }

  // ** CONTACT DETAILS FUNCTIONS ** //--------------------------------------------------------------
  /**
   * @function handleDownloadTemplate
   * @summary Download trip bulk upload template
   */
  handleDownloadTemplate = () => {
    this.props.downloadSampleFile(
      GET_TEMPLATE,
      {
        bucketName: bucketName,
        name: fileName,
        fileType: 'EXCEL',
      },

      ['getPublicDownloadURL'],
      'Trip Template'
    )
  }

  /**
   * @function handleModalOkPress
   * @summary Confirmation modal accepted
   */
  handleModalOkPress = () => {
    this.setState({ openModal: false, modalMessage: '', modalReason: '' })
  }

  /**
   * @function handlebulkUploadTrips
   * @summary Open instruction modal to download and upload excel with instructions to user.
   */
  handlebulkUploadTrips = () => {
    this.setState({ instructionModalOpen: true })
  }

  /**
   * @function onOkPress
   * @summary Close instruction modal
   */
  onOkPress = () => {
    this.setState({ instructionModalOpen: false })
  }

  /**
   * @async
   * @function onSubmit
   * @summary Handle success or failure of trip bulk upload.
   */
  onSubmit = async () => {
    const response = await this.props.client.mutate({
      mutation: SUBMIT_TRIPS_LIST,
      variables: {
        fileInfo: {
          uploadFor: 'AddTrips',
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
          `Successfully added ${sucessfulEntries} trip(s).`
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
          `Failed to add trips(s). ${failedEntries} error(s) found.`
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

  /**
   * @function onErrorOkPress
   * @summary Close error list modal.
   */
  onErrorOkPress = () => {
    this.setState({ openErrorModal: false })
  }

  /**
   * @async
   * @function handleUploadTrip
   * @param {object} target
   * @summary Upload file in bucket and handle excel parsing error if exists.
   */
  handleUploadTrip = async ({
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
        await axios.put(url, file).catch((e) => console.log(e))
        this.setState({
          fileName: response.data.getPublicUploadURL.filename,
          bucketName: response.data.getPublicUploadURL.bucketName,
          publicUploadURL: response.data.getPublicUploadURL.publicUploadURL,
          uploadSuccess: true,
        })
      }
      this.setState({ isUploading: false })
    }
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
              Trip Bulk Failed
            </Typography>
            <Divider />
            <Typography variant="body2" id="modal-title">
              Upload failed due to following reasons.
            </Typography>
            <Grid container>
              <Grid item xs={12} lg={12}>
                {this.state.uploadErrors &&
                  this.state.uploadErrors.map((errors) => {
                    const reason = errors.errorMsg
                    const name = errors.tripName
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
              Trip Bulk Upload
            </Typography>
            <Divider />
            <br />
            {!this.state.uploadSuccess ? (
              <div>
                <Typography variant="body2">
                  A template is made available for you to download. You have to
                  fill the template sheet in format defined and upload to
                  generate new trips quickly!
                </Typography>
                <br />
                <Typography variant="body2">
                  If you have downloaded the template before, fill the sheet and
                  upload directly.
                </Typography>
              </div>
            ) : (
              <Typography variant="body2">
                List uploaded successfully! Press submit to save these trips.
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
                        onChange={this.handleUploadTrip}
                      />
                      <label htmlFor="contained-button-file">
                        {this.state.isUploading ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Button
                            variant="outlined"
                            color="secondary"
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
                    color="secondary"
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

        <Grid item>
          <Typography variant="h5" className={classes.textLeft} gutterBottom>
            {languageJson[selectedLanguage].tripsPage.tripCreation.pageTitle}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        <Grid item xs={12}>
          <Grid container>
            <ConfirmationModal
              openModal={this.state.openModal}
              modalMessage={this.state.modalMessage}
              reason={this.state.modalReason}
              handleOkClose={this.handleModalOkPress}
            />

            <SimpleModal
              placeholder="Trip Name"
              label="Save Trip as"
              modalOpen={this.state.tripsModalOpen}
              handleModalClose={this.handleTripsModalClose}
              saveAs={this.saveTripName}
              handleModalFieldNameChange={this.handleModalFieldNameChange}
            />
            <Grid item xs={12} style={{ marginBottom: 20 }}>
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    component={Link}
                    variant="outlined"
                    color="default"
                    to="/home/trips"
                  >
                    {
                      languageJson[selectedLanguage].tripsPage.tripCreation
                        .goBackButtonTitle
                    }
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="default"
                    onClick={this.handlebulkUploadTrips}
                  >
                    {
                      languageJson[selectedLanguage].tripsPage.tripCreation
                        .bulkCreationButtonTitle
                    }
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={4}>
              <TripConfigurationPanel
                radioSelectionOld={this.state.radioSelectionOld}
                onSelectionChangedOld={this.onSelectionChangedOld}
                radioSelectionNew={this.state.radioSelectionNew}
                onSelectionChangedNew={this.onSelectionChangedNew}
                plan={this.state.plan}
                vehicles={this.state.vehicles}
                tripTypes={this.state.tripTypes}
                routes={this.state.routes}
                selectedVehicle={this.state.selectedVehicle}
                selectedRouteNew={this.state.selectedRoute}
                selectedTripType={this.state.selectedTripType}
                fromDate={this.state.fromDate}
                toDate={this.state.toDate}
                tolerance={this.state.tolerance}
                emails={this.state.emails}
                handleAddEmailField={this.handleAddEmailField}
                handleDeleteEmailField={this.handleDeleteEmailField}
                numbers={this.state.numbers}
                handleAddNumberField={this.handleAddNumberField}
                handleDeleteNumberField={this.handleDeleteNumberField}
                onSaveTrip={this.handleSaveRoute}
                handleVehicleChange={this.handleVehicleChange}
                handleTripType={this.handleTripType}
                handleRouteChange={this.handleRouteChange}
                onToleranceChange={this.handleToleranceChange}
                onEmailChange={this.handleEmailChange}
                onNumberChange={this.handleNumberChange}
                onDateChange={this.handleDateChange}
                dayOfWeek={this.state.dayOfWeek}
                onDayChange={this.handleDayChange}
                isSchedulingActive={this.state.isSchedulingActive}
                onSwitchChange={this.handleSwitchChange}
                scheduledUpto={this.state.scheduledUpto}
                google={google}
                requestAllRoutes={this.requestAllRoutes}
                onClearRouteOfRadioChange={this.handleClearRouteOfRadioChange}
                //waypoints props
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
                onClearRoute={this.handleClearRouteOnClearButton}
                onSaveRoute={this.handleSaveRouteToTrips}
                onAoiListDragEnd={this.handleAoiListDragEnd}
                //SimpleModal props
                modalOpen={this.state.modalOpen}
                handleModalClose={this.handleModalClose}
                saveAs={this.saveRouteName}
                handleModalFieldNameChange={this.handleModalFieldNameChange}
                //waypoint should close after route is created props
                isWaypointsOpen={this.state.isWaypointsOpen}
                //for card removal present in waypoints
                isCardPresent={this.state.isCardPresent}
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

export default () => (
  <Switch>
    <PrivateRoute
      exact
      path="/home/trips"
      component={withStyles(styles)(Trips)}
    />
    <PrivateRoute
      exact
      path="/home/trips/create"
      component={withGoogleMaps(
        withApollo(
          withSharedSnackbar(
            withLanguage(
              withStyles(styles)((props) => (
                <DownloadProgressDialogConsumer>
                  {({ downloadReport }) => (
                    <TripsConfigurationModule
                      downloadSampleFile={downloadReport}
                      {...props}
                    />
                  )}
                </DownloadProgressDialogConsumer>
              ))
            )
          )
        )
      )}
    />
  </Switch>
)
