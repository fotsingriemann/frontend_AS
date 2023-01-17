/**
 * Trips dashboard component
 * @module TripsDashboard
 */

//#region Imports
import React, { Component } from 'react'
import getLoginId from '@zeliot/common/utils/getLoginId'
import ComboBox from '@zeliot/common/ui/ComboBox'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import withGoogleMaps from '@zeliot/common/hoc/withGoogleMaps'
import { withApollo } from 'react-apollo'
import AlertCard from '@zeliot/core/base/pages/AlertsDashboard/AlertCard'
import TripList from '../TripsModule/TripList'
import TripDetails from '../TripsModule/TripDetails'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import Map from '@zeliot/core/base/modules/TrackingControls/Maps/Map'
import {
  Slider,
  Grid,
  withStyles,
  Divider,
  Paper,
  CircularProgress,
  Button,
  Typography,
  Modal,
  FormControlLabel,
  Switch,
} from '@material-ui/core'
import getCustomMarker from '@zeliot/core/base/modules/TripsModule/MapUtils/CustomMarker'
import getMultiLine from '@zeliot/core/base/modules/TripsModule/MapUtils/MultiLine'
import getCustomPopup from '@zeliot/core/base/modules/TripsModule/MapUtils/CustomPopup'
import {
  GET_ALL_VEHICLES,
  // GET_ALL_TRIPS,
  GET_TRIP_INFO,
  TRAVEL_REPLAY_PACKETS,
} from '@zeliot/common/graphql/queries'
import { DEVICE_LOCATION } from '@zeliot/common/graphql/subscriptions'
import {
  REPLAY_DURATION,
  TRIP_STATUS_TYPES,
} from '@zeliot/common/constants/others'
import { THEME_MAIN_COLORS as COLOR_RANGE } from '@zeliot/common/constants/styles'
import getUnixString from '@zeliot/common/utils/time/getUnixString'
import iconStartFlag from '@zeliot/common/static/png/start.png'
import iconEndFlag from '@zeliot/common/static/png/stop.png'
import ConfirmationModal from './ConfirmationModal'
import EditModal from './EditModal'
import SubtripDetails from './SubtripDetails'
import moment from 'moment'
import gql from 'graphql-tag'
import axios from 'axios'
import { DownloadProgressDialogConsumer } from '@zeliot/common/shared/DownloadProgressDialog/DownloadProgressDialog.context'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'
//#endregion

// Query for 'GET_ALL_TRIPS'
const GET_ALL_TRIPS = gql`
  query(
    $clientLoginId: Int!
    $status: Int
    $uniqueDeviceId: String
    $cursor: String
    $limit: Int
  ) {
    getAllTrips(
      clientLoginId: $clientLoginId
      status: $status
      uniqueDeviceId: $uniqueDeviceId
      cursor: $cursor
      limit: $limit
    ) {
      totalCount
      edges {
        cursor
        node {
          tripId
          tripName
          status
          createdAt
          scheduledSubTrip {
            fromTimestamp
          }
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
      }
    }
  }
`
const GET_SEARCHED_TRIPS = gql`
  query($field: TripSearchFields!, $searchTerms: [String!]!) {
    searchTrips(field: $field, searchTerms: $searchTerms) {
      totalCount
      edges {
        cursor
        node {
          tripId
          tripName
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
      }
    }
  }
`

//#region Query Variable Declaration
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

const GET_ALL_SUBTRIPS_ON_STATUS = gql`
  query($tripId: Int!, $status: Int, $uniqueDeviceId: String) {
    getAllSubTrips(
      tripId: $tripId
      status: $status
      uniqueDeviceId: $uniqueDeviceId
    ) {
      subTripId
      tripId
      fromTimestamp
      toTimestamp
      status
    }
  }
`

const GET_SUBTRIP_DETAILS = gql`
  query($id: Int!) {
    getSubTrip(subTripId: $id) {
      fromTimestamp
      toTimestamp
      events {
        type
        details {
          areaName
          startLocation {
            address
          }
          startTimestamp
          endLocation {
            address
          }
          endTimestamp
        }
      }
      status
    }
  }
`

const GET_SUBTRIP_DETAILS_POLL = gql`
  query($id: Int!) {
    getSubTrip(subTripId: $id) {
      events {
        type
        details {
          index
        }
      }
      status
    }
  }
`

const DELETE_TRIP = gql`
  mutation($id: Int!) {
    deleteTrip(tripId: $id) {
      status
      reason {
        subTripId
        fromTimestamp
        toTimestamp
      }
      message
    }
  }
`

const PAUSE_TRIP = gql`
  mutation($id: Int!) {
    pauseTrip(tripId: $id) {
      status
      reason {
        subTripId
        fromTimestamp
        toTimestamp
      }
      message
    }
  }
`

const RESUME_TRIP = gql`
  mutation($id: Int!) {
    resumeTrip(tripId: $id) {
      status
      reason {
        subTripId
        fromTimestamp
        toTimestamp
      }
      message
    }
  }
`

const EDIT_TRIP = gql`
  mutation(
    $id: Int!
    $fromTimestamp: String!
    $toTimestamp: String!
    $scheduleFromTimestamp: String!
    $scheduleToTimestamp: String!
    $schedule: Int!
    $email: [String]
    $sms: [String]
    $tolerance: Int!
    $tripName: String!
  ) {
    editTrip(
      tripId: $id
      edits: {
        fromTimestamp: $fromTimestamp
        toTimestamp: $toTimestamp
        scheduleFromTimestamp: $scheduleFromTimestamp
        scheduleToTimestamp: $scheduleToTimestamp
        schedule: $schedule
        email: $email
        sms: $sms
        tolerance: $tolerance
        tripName: $tripName
      }
    ) {
      status
      reason {
        tripName
        fromTimestamp
        toTimestamp
      }
      message
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

const DELETE_TRIPS_LIST = gql`
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

const styles = (theme) => ({
  root: {
    height: '100%',
    width: '100%',
  },
  sliderStyle: {
    position: 'absolute',
    bottom: 10,
    padding: 10,
  },
  paper: {
    position: 'absolute',
    width: theme.spacing(75),
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
})

const instructions = [
  'Trip can be deleted by name, vehicle number or trip type',
  "Trip name is wildcard. Enclose the name with '*' to find near match and delete. Ex. *TRIP-SERVICE-01* will delete all trips which contains 'TRIP-SERVICE-01'",
  'Full vehicle name needs to be provided to delete trip based o vehicle',
  "Trip type needs to be 'PICKUP' or 'DROP'",
  'Multiple columns can be provided to combine filters for delete. Ex. If trip name, vehicle and trip type is provided, then all trips which satisfies all these conditions will be deleted',
  "In progress couldn't be deleted. They can be deleted when the trip completes",
]

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
 * @summary Bucket name of all excel templates
 */
const bucketName = 'excel-templates'

/**
 * @summary Name of template file in bucket
 */
const fileName = 'tripDeleteTemplate.xlsx'
/**
 * @summary List of all markers in route
 */
let markerList = []
/**
 * @summary List of fences of all points on the route
 */
let fenceList = []
/**
 * @summary Fence of the route
 */
let routePolygon = null
/**
 * @summary Route polyline
 */
let routePolyline = null
/**
 * @summary Flag to monitor if route is drawn
 */
let isRouteDrawn = false
/**
 * @summary Flag to monitor if route fence is drawn
 */
let isFenceDrawn = false
/**
 * @summary Counter to monitor animation of marker during replay
 */
let count = 0
/**
 * @summary Vehicle marker object
 */
let markerInstance = null
/**
 * @summary Loop to monotor traversal of travel replay data during animation
 */
let loop = null
/**
 * @summary Flag to monitor if marker animation is active
 */
let isAnimationActive = false
/**
 * @summary Object to store all previous trip data temperorily with changed new values
 */
const editObject = {}
/**
 * @summary Start flag marker
 */
let markerStart = null
/**
 * @summary End flag marker
 */
let markerEnd = null
/**
 * @summary Custom marker object
 */
let CustomMarker
/**
 * @summary Custom multicolour polyline object
 */
let MultiLine
/**
 * @summary Custom popup object
 */
let CustomPopup

class TripsDashboard extends Component {
  constructor(props) {
    super(props)
    CustomMarker = getCustomMarker(props.google)
    MultiLine = getMultiLine(props.google)
    CustomPopup = getCustomPopup(props.google)
    this._customPopup = new CustomPopup()
  }
  //#endregion

  /**
   * @property {?object[]} vehicles List of all vehicles registered in current user
   * @property {?object} selectedVehicle Vehicle selected from the list of all the vehicles
   * @property {object} selectedTripType Selected type amongst trip types available
   * @property {?object[]} trips List of all trips created by current user
   * @property {?object} selectedTrip Trip selected from the list of all trips
   * @property {?object[]} allSubtrips List of all subtrips associated with selected trip
   * @property {?object} selectedSubTrip subtrip selected from list of available subtrips
   * @property {?string|number} tolerance Time leniance given to start or finish trip
   * @property {?object} map Map object
   * @property {?object} selectedRouteDetails Details of route associated with selected trip
   * @property {?object[]} placesCoordinates Array of objects containing latitude and longitude values for each area in route in sequence
   * @property {?string[]} areaTypeBuffer Type of each area in selected route in order
   * @property {?object[]} aoiFenceBuffer Fences of all areas within selected route in order
   * @property {?object} fromDate From time of trip
   * @property {?object} toDate To time of trip
   * @property {string} tripName Name of newly made trip
   * @property {object} assignedVehicle Vehicle assigned to selected trip
   * @property {number} status Status of the trip selected
   * @property {string} scheduleToTimestamp Human readable trip to date
   * @property {number} schedule Schedule set during trip creation
   * @property {string} modalMessage Message on modal for user information
   * @property {boolean} editingActive Flag to monitor if editing is active
   * @property {string[]} emails All registered emails list
   * @property {string[]} numbers All registered phone numbers
   * @property {object[]} dayOfWeek Day of week selection and enable mapping object
   * @property {boolean} areTripDetailsFetched Flag to monitor if trip details are currently being fetched
   * @property {?object} multiLine Custom multi colour polyline object for replay and live tracking
   * @property {number} sliderValue Slider value
   * @property {number} interval Interval at which each point is simulated in animation
   * @property {number} replaySpeed Times factor to change animation speed
   * @property {boolean} isReplayActive Flag to monitor if replay animation in active
   * @property {object} travelReplayData Travel replay data object
   * @property {boolean} isQueryActive Flag to check if replay data is being fetched
   * @property {object} liveData Live data object fetched from live subscription
   * @property {boolean} isLiveTracking Flag to monitor if live tracking subscription is active
   * @property {number} indexOfIntrest Index of day of week selected during scheduling
   * @property {boolean} instructionModalOpen Flag to monitor modal state
   * @property {boolean} uploadSuccess Flag to monitor state of upload
   * @property {?object[]} uploadParseError Stores all parsing errors and displays to user
   * @property {boolean} isUploading Flag to monitor upload state
   * @property {boolean} keepOldTripsHistory Flag to monitor if completed trips should be deleted
   */
  state = {
    vehicles: null,
    selectedVehicle: null,
    selectedTripType: TRIP_STATUS_TYPES[0],
    trips: null,
    searchedTrips: null,
    selectedTrip: null,
    allSubtrips: null,
    selectedSubTrip: null,
    tolerance: null,
    map: null,
    selectedRouteDetails: null,
    placesCoordinates: null,
    areaTypeBuffer: null,
    aoiFenceBuffer: null,
    fromDate: null,
    toDate: null,
    tripName: null,
    cursor: null,
    limit: 50,
    currentPage: 0,
    field: null,
    searchTerms: null,
    assignedVehicle: null,
    status: null,
    scheduleToTimestamp: null,
    schedule: null,
    modalMessage: '',
    openModal: false,
    modalReason: '',
    editingActive: false,
    emails: [''],
    numbers: [''],
    dayOfWeek: [
      { status: false, disable: false },
      { status: false, disable: false },
      { status: false, disable: false },
      { status: false, disable: false },
      { status: false, disable: false },
      { status: false, disable: false },
      { status: false, disable: false },
    ],
    areTripDetailsFetched: false,
    // replay states
    multiLine: null,
    sliderValue: 0,
    interval: REPLAY_DURATION,
    replaySpeed: 8,
    isReplayActive: false,
    travelReplayData: {},
    isQueryActive: false,
    // live states
    liveData: {},
    isLiveTracking: false,
    indexOfIntrest: 0,
    instructionModalOpen: false,
    uploadSuccess: false,
    uploadParseError: '',
    isUploading: false,
    keepOldTripsHistory: true,
  }

  componentDidMount = () => {
    this.requestAllVehicles()
    this.requestAllTrips()
  }

  // ** VIEW TRIP/SUBTRIP FUNCTIONS ** //--------------------------------------------------------------
  /**
   * @async
   * @function requestAllVehicles
   * @summary Fetch all the vehicles registered under active client
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

  /**
   * @function handleVehicleChange
   * @param {object} selectedVehicle
   * @summary Handle vehicle selected from list of vehicles
   */
  handleVehicleChange = (selectedVehicle) => {
    this.setState(
      {
        selectedVehicle,
        selectedTrip: null,
        trips: null,
        currentPage: 0,
        cursor: null,
      },
      () => {
        this.requestAllTrips()
      }
    )
  }

  handleCurrentPage = (currentPage) => {
    this.setState({
      currentPage,
    })
  }
  handleDataOnPageChange = (cursorPointer) => {
    this.setState({ cursor: cursorPointer }, () => {
      // console.log('state cursor:', this.state.cursor)
      this.requestAllTrips()
    })
  }

  handleDataOnSearch = (searchKey, category) => {
    this.setState({ field: category, searchTerms: searchKey }, () => {
      this.requestSearchTrips()
    })
  }

  /**
   * @async
   * @function mergeTripObjects
   * @summary concat previously fetch trip data and currently fetched  trip data
   */

  mergeTripObjects = (currentFetchTrips) => {
    // console.log('currentFetchTrips', currentFetchTrips)
    if (this.state.trips !== null) {
      const {
        edges: prev_edges,
        pageInfo: prev_pageInfo,
        totalCount: prev_total,
      } = this.state.trips

      const {
        edges: current_edges,
        pageInfo: current_pageInfo,
        totalCount: current_total,
      } = currentFetchTrips

      const mergedTrips = {
        edges: [],
        pageInfo: {},
        totalCount: 0,
      }

      const edges = prev_edges.concat(current_edges)
      let total = prev_total + current_total
      let pageInfo = { ...prev_pageInfo, ...current_pageInfo }

      mergedTrips.edges = edges
      mergedTrips.pageInfo = pageInfo
      mergedTrips.totalCount = total
      console.log('merged data', mergedTrips)
      return mergedTrips
    } else {
      return currentFetchTrips
    }
  }

  /**
   * @async
   * @function requestAllTrips
   * @summary Fetch all trips for current user and sort based on created time
   */

  requestAllTrips = async () => {
    const fetchedTrips = await this.props.client
      .query({
        query: GET_ALL_TRIPS,
        variables: {
          clientLoginId: getLoginId(),
          status: this.state.selectedTripType.key,
          limit: this.state.limit,
          cursor: this.state.cursor,
          uniqueDeviceId: this.state.selectedVehicle
            ? this.state.selectedVehicle.deviceDetail.uniqueDeviceId
            : null,
        },
        fetchPolicy: 'network-only',
      })
      .catch((error) => {
        console.log('Error:', error.graphQLErrors[0].message)
        this.props.openSnackbar(error.graphQLErrors[0].message)
      })

    if (fetchedTrips) {
      const { getAllTrips } = fetchedTrips.data
      // console.log('debounced data', allTripList)
      const mergedTrips = this.mergeTripObjects(getAllTrips)
      this.setState({ trips: mergedTrips })

      // console.log('filteredTrips: ', filteredTrips)
      // filteredTrips.sort(function(a, b) {
      //   return a.createdAt - b.createdAt
      // })
      // filteredTrips = filteredTrips.reverse()
    }
  }

  requestSearchTrips = async () => {
    const fetchedTrips = await this.props.client.query({
      query: GET_SEARCHED_TRIPS,
      variables: {
        field: this.state.field,
        searchTerms: [this.state.searchTerms],
      },
      fetchPolicy: 'network-only',
    })

    if (fetchedTrips.data && fetchedTrips.data.searchTrips) {
      const {
        data: { searchTrips },
      } = fetchedTrips
      this.setState({ searchedTrips: searchTrips })
    }
  }

  /**
   * @function onSelectedTripChange
   * @param {object} selectedTrip
   * @summary Handle trip selection. Fetch the route and all AOIs associated with the trip and draw on map. Show details for selected trip.
   */
  onSelectedTripChange = (selectedTrip) => {
    if (selectedTrip) {
      this.setState({ areTripDetailsFetched: false })
      // Clear existing routes first
      this.handleClearRoute()
      this.setState({ selectedTrip }, () => {
        // Fetch selected trip details
        this.fetchTripDetails(this.state.selectedTrip.tripId, () => {
          this.setState({ areTripDetailsFetched: true })
          // get days of week from schedule
          if (this.state.schedule) this.parseDaysOfWeek()

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
        // if (this.state.selectedTripType.key !== 0) {
        // Fetch subtrips only for in-progress and completed trips
        this.fetchAllSubTrips(this.state.selectedTrip.tripId)
        // }
      })
    } else {
      this.handleClearRoute()
      if (this.state.isReplayActive) this.handleReplayStop()
      if (this.state.isLiveTracking) {
        this.resetLiveTracking()
        this.stopSubscription()
      }
    }
  }

  /**
   * @async
   * @function fetchTripDetails
   * @param {number} tripId Id of the trip selected
   * @callback proceed Callback when fetching of trip details is done
   * @summary Fetch all the details for selected trip and show it in the card
   */
  fetchTripDetails = async (tripId, proceed) => {
    const fetchedDetails = await this.props.client.query({
      query: GET_TRIP_INFO,
      variables: {
        tripId: tripId,
      },
    })
    // TODO: Handle error
    if (fetchedDetails.data.getTrip) {
      this.setState(
        {
          selectedRouteDetails: JSON.parse(
            fetchedDetails.data.getTrip.route.routeDetail
          ),
          placesCoordinates: JSON.parse(
            fetchedDetails.data.getTrip.route.placeCoordinates
          ),
          places: JSON.parse(fetchedDetails.data.getTrip.route.places),
          areaTypeBuffer: JSON.parse(
            fetchedDetails.data.getTrip.route.areaTypeBuffer
          ),
          aoiFenceBuffer: JSON.parse(
            fetchedDetails.data.getTrip.route.aoiFenceBuffer
          ),
          tripName: fetchedDetails.data.getTrip.tripName,
          fromDate: getFormattedTime(
            fetchedDetails.data.getTrip.fromTimestamp,
            'lll'
          ),
          toDate: getFormattedTime(
            fetchedDetails.data.getTrip.toTimestamp,
            'lll'
          ),
          tolerance: parseInt(fetchedDetails.data.getTrip.tolerance / 60, 10),
          assignedVehicle: fetchedDetails.data.getTrip.vehicle.vehicleNumber,
          status: fetchedDetails.data.getTrip.status,
          scheduleToTimestamp: getFormattedTime(
            fetchedDetails.data.getTrip.scheduleToTimestamp,
            'lll'
          ),
          scheduleFromTimestamp: getFormattedTime(
            fetchedDetails.data.getTrip.scheduleFromTimestamp,
            'lll'
          ),
          schedule: fetchedDetails.data.getTrip.schedule,
          assignedVehicleId: fetchedDetails.data.getTrip.vehicle.uniqueDeviceId,
          emails: fetchedDetails.data.getTrip.tripNotifications.email || [''],
          numbers: fetchedDetails.data.getTrip.tripNotifications.sms || [''],
        },
        () => {
          proceed()
        }
      )
    } else {
      this.props.openSnackbar('Failed to fetch trip details')
    }
  }

  /**
   * @async
   * @function fetchAllSubTrips
   * @param {number} tripId Id of the selected trip
   * @summary Fetch all the subtrips associated with trip if schedules are available
   */
  fetchAllSubTrips = async (tripId) => {
    const fetchedSubTrips = await this.props.client.query({
      query: GET_ALL_SUBTRIPS_ON_STATUS,
      variables: {
        tripId: tripId,
        status: this.state.selectedTripType.key,
        uniqueDeviceId: this.state.selectedVehicle
          ? this.state.selectedVehicle.deviceDetail.uniqueDeviceId
          : null,
      },
    })
    // console.log('All sub trip response', fetchedSubTrips.data.getAllSubTrips)
    if (fetchedSubTrips.data.getAllSubTrips.length > 0) {
      this.setState({ allSubtrips: fetchedSubTrips.data.getAllSubTrips })
    } else this.setState({ allSubtrips: null })
  }

  /**
   * @function handleSelectedSubtrip
   * @param {object} subtrip Selected subtrip
   * @summary Handle selected subtrip
   */
  handleSelectedSubtrip = (subtrip) => {
    this.setState({ selectedSubTrip: subtrip }, () => {
      this.fetchSubtripDetails(subtrip.tripId)
    })
  }

  /**
   * @async
   * @function fetchSubtripDetails
   * @param {number} id Id of selected subtrip
   * @summary Fetch all the details for selected subtrip
   */
  fetchSubtripDetails = async (id) => {
    const fetchedSubTripsDetails = await this.props.client.query({
      query: GET_SUBTRIP_DETAILS,
      variables: {
        id: id,
      },
    })
    if (fetchedSubTripsDetails.data.getSubTrip) {
      this.setState(
        ({ selectedSubTrip }) => ({
          selectedSubTrip: {
            ...selectedSubTrip,
            events: fetchedSubTripsDetails.data.getSubTrip.events,
            aggregations: fetchedSubTripsDetails.data.getSubTrip.aggregations,
          },
        })
        // () => console.log('Selected subtrip', this.state.selectedSubTrip)
      )
    }
  }

  /**
   * @function handleTripTypeChange
   * @param {string} type Type of trip selected
   * @summary Clear all drawings on map and load list of selected trip type
   */
  handleTripTypeChange = (type) => {
    this.clearMapVariable()
    this.clearRoute()
    this.clearMarkers()
    this.clearAoiFences()
    this.setState(
      {
        selectedTrip: null,
        selectedSubTrip: null,
        allSubtrips: null,
        cursor: null,
        trips: null,
        currentPage: 0,
        selectedTripType: type,
      },
      () => {
        this.requestAllTrips()
      }
    )
  }
  // ** VIEW TRIP/SUBTRIP FUNCTIONS ** //--------------------------------------------------------------

  // ** NAVIGATE ON SCREEN FUNCTIONS ** //----------------------------------------------------
  /**
   * @function handleBackPress
   * @summary Handle back press on trip details page
   */
  handleBackPress = () => {
    this.setState({ editingActive: false })
    this.onSelectedTripChange(null)
  }

  /**
   * @function handleSubTripBackPress
   * @summary Handle back press on subtrip details page
   */
  handleSubTripBackPress = () => {
    this.setState({ selectedSubTrip: null }, () => {
      if (this.state.isReplayActive) this.handleCancelTravelReplay()
    })
  }

  /**
   * @function handleModalOkPress
   * @summary Handle modal close once OK is pressed
   */
  handleModalOkPress = () => {
    this.setState({ openModal: false, modalMessage: '' })
  }
  // ** NAVIGATE ON SCREEN FUNCTIONS ** //----------------------------------------------------

  // ** DELETE TRIP FUNCTIONS ** //-----------------------------------------------------------
  /**
   * @async
   * @function handleTripDelete
   * @summary Request trip delete when user chooses and fetch new list of trips
   */
  handleTripDelete = async () => {
    const id = this.state.selectedTrip.tripId
    const response = await this.props.client.mutate({
      mutation: DELETE_TRIP,
      variables: {
        id: id,
      },
      // refetchQueries: [
      //   {
      //     query: GET_ALL_TRIPS,
      //     variables: {
      //       clientLoginId: getLoginId(),
      //       status: null,
      //       uniqueDeviceId: null,
      //     },
      //     fetchPolicy: 'network-only',
      //   },
      // ],
      // awaitRefetchQueries: true,
    })
    if (response.data.deleteTrip) {
      let reason = ''
      if (!response.data.deleteTrip.status) {
        const from = response.data.deleteTrip.reason.fromTimestamp
        const to = response.data.deleteTrip.reason.toTimestamp
        reason =
          'A trip is in progress from ' +
          getFormattedTime(from, 'lll') +
          ' to ' +
          getFormattedTime(to, 'lll') +
          '. All further schedules will be deleted after ongoing trip completes.'
      }
      this.setState(
        {
          selectedTrip: null,
          openModal: true,
          modalMessage: response.data.deleteTrip.message,
          modalReason: reason,
          trips: null,
          cursor: null,
          currentPage: 0,
        },
        () => {
          this.requestAllTrips()
        }
      )
    }
  }
  // ** DELETE TRIP FUNCTIONS ** //-----------------------------------------------------------

  // ** PAUSE/RESUME TRIP FUNCTIONS ** //-----------------------------------------------------------
  /**
   * @async
   * @function handleTripResume
   * @summary Resume trip mutation called on paused trip. Appropriate messages shown to user in case of failure
   */
  handleTripResume = async () => {
    const id = this.state.selectedTrip.tripId
    const response = await this.props.client.mutate({
      mutation: RESUME_TRIP,
      variables: {
        id: id,
      },
      refetchQueries: [
        {
          query: GET_ALL_TRIPS,
          variables: {
            clientLoginId: getLoginId(),
            status: null,
            uniqueDeviceId: null,
          },
        },
      ],
      awaitRefetchQueries: true,
    })
    // console.log('Resume trip response', response.data.resumeTrip)
    if (response.data.resumeTrip) {
      this.setState(
        {
          selectedTrip: null,
          openModal: true,
          modalMessage: response.data.resumeTrip.message,
          modalReason: '',
        },
        () => {
          this.requestAllTrips()
        }
      )
    }
  }

  /**
   * @async
   * @function handleTripPause
   * @summary Pause trip mutation called on active trip. Appropriate messages shown to user in case of failure.
   */
  handleTripPause = async () => {
    const id = this.state.selectedTrip.tripId
    const response = await this.props.client.mutate({
      mutation: PAUSE_TRIP,
      variables: {
        id: id,
      },
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
      awaitRefetchQueries: true,
    })
    // console.log('Pause trip response', response.data.pauseTrip)
    if (response.data.pauseTrip) {
      let reason = ''
      if (!response.data.pauseTrip.status) {
        const from = response.data.pauseTrip.reason.fromTimestamp
        const to = response.data.pauseTrip.reason.toTimestamp
        reason =
          'A trip is in progress from ' +
          getFormattedTime(from, 'lll') +
          ' to ' +
          getFormattedTime(to, 'lll') +
          '. All further schedules will be paused after ongoing trip completes.'
      }
      this.setState(
        {
          selectedTrip: null,
          openModal: true,
          modalMessage: response.data.pauseTrip.message,
          modalReason: reason,
        },
        () => {
          this.requestAllTrips()
        }
      )
    }
  }
  // ** PAUSE/RESUME TRIP FUNCTIONS ** //-----------------------------------------------------------

  // ** EDIT TRIP FUNCTIONS ** //-------------------------------------------------------------------
  /**
   * @function formEditObject
   * @summary Temperorily stores all values during edit
   */
  formEditObject = () => {
    editObject.tripName = this.state.tripName
    editObject.fromDate = this.state.fromDate
    editObject.toDate = this.state.toDate
    editObject.tolerance = this.state.tolerance
    editObject.schedule = this.state.schedule
    editObject.scheduleToTimestamp = this.state.scheduleToTimestamp
    editObject.dayOfWeek = this.state.dayOfWeek
    editObject.emails = this.state.emails
    editObject.numbers = this.state.numbers
  }

  /**
   * @function handleTripEdit
   * @summary View changes to show input fields when user chooses to edit trip.
   */
  handleTripEdit = () => {
    this.setState({ editingActive: true })
  }

  /**
   * @funciton validateTripEditInput
   * @summary Validates all inputs changed during trip edit.
   */
  validateTripEditInput = () => {
    if (
      this.state.tripName === '' ||
      this.state.fromDate === null ||
      this.state.toDate === null ||
      this.state.tolerance === '' ||
      this.state.scheduleToTimestamp === null
    ) {
      this.props.openSnackbar('All fields need to be provided for trip edit')
      return false
    }
    if (this.state.fromDate >= this.state.toDate) {
      this.props.openSnackbar("From date can't be less than to date")
      return false
    }
    if (this.state.tripDuration > 604800) {
      this.props.openSnackbar(
        'Trip duration is too long. Trips longer than a week are not supported yet'
      )
      return false
    } else if (
      moment(this.state.scheduleToTimestamp).unix() <
        moment(this.state.toDate).unix() &&
      this.state.schedule
    ) {
      this.props.openSnackbar(
        'Schedule upto date should be greater than trip end date'
      )
      return false
    } else {
      return true
    }
  }

  /**
   * @async
   * @function handleTripEditConfirmed
   * @param {boolean} confirmation Flag to monitor if editing is still active
   * @summary Write temporarily stored states back if editing is cancelled, mutation to edit called if editing is confirmed.
   */
  handleTripEditConfirmed = async (confirmation) => {
    if (confirmation) {
      const inputValidity = this.validateTripEditInput()
      if (inputValidity) {
        // Get time in unix
        const unixDates = this.getUnix()
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

        const id = this.state.selectedTrip.tripId
        const response = await this.props.client.mutate({
          mutation: EDIT_TRIP,
          variables: {
            id: id,
            tripName: this.state.tripName,
            fromTimestamp: unixDates.fromDate.toString(),
            scheduleFromTimestamp: masterTimestamps.masterFromDate,
            toTimestamp: unixDates.toDate.toString(),
            scheduleToTimestamp: masterTimestamps.masterToDate,
            tolerance: this.state.tolerance * 60,
            sms: numbers,
            email: emails,
            schedule: this.state.schedule ? masterTimestamps.schedule : 0,
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
            {
              query: GET_TRIP_INFO,
              variables: {
                tripId: this.state.selectedTrip.tripId,
              },
            },
          ],
          awaitRefetchQueries: true,
        })

        if (response.data && response.data.editTrip) {
          let reason = ''
          if (!response.data.editTrip.status) {
            const from = response.data.editTrip.reason.fromTimestamp
            const to = response.data.editTrip.reason.toTimestamp
            reason =
              'A trip is in progress from ' +
              getFormattedTime(from, 'lll') +
              ' to ' +
              getFormattedTime(to, 'lll') +
              '. Given fields will be edited after ongoing trip completes.'
          }
          this.setState(
            {
              selectedTrip: null,
              openModal: true,
              editingActive: false,
              modalMessage: response.data.editTrip.message,
              modalReason: reason,
            },
            () => {
              this.requestAllTrips()
            }
          )
        } else {
          this.props.openSnackbar('Failed to save trip', { type: 'error' })
          this.setState({
            openModal: true,
            modalMessage: 'Failed to save trip!',
            modalReason: response.errors[0].message,
          })
        }
      }
    } else {
      // Just close the modal if not confirmed
      this.setState({
        editingActive: false,
        tripName: editObject.tripName,
        tolerance: editObject.tolerance,
        fromDate: editObject.fromDate,
        toDate: editObject.toDate,
        scheduleToTimestamp: editObject.scheduleToTimestamp,
        schedule: editObject.schedule,
        dayOfWeek: editObject.dayOfWeek,
        emails: editObject.emails,
        numbers: editObject.numbers,
      })
    }
  }

  /**
   * @function handleNameChange
   * @param {string} tripName Name input
   * @summary Edited trip name
   */
  handleNameChange = (tripName) => {
    this.setState({ tripName })
  }

  /**
   * @function handleToleranceChange
   * @param {string} tolerance Tolerance input
   * @summary Edited tolerance name
   */
  handleToleranceChange = (tolerance) => {
    this.setState({ tolerance })
  }

  /**
   * @function handleDateChange
   * @param {string} key Key of date to be changed.
   * @param {object} date Changed date object.
   * @summary Edited tolerance name
   */
  handleDateChange = (key, date) => {
    const now = moment()
    if (now > date) {
      this.props.openSnackbar('Selection to past dates not allowed')
    } else {
      if (key === 'scheduleToTimestamp') {
        if (date < this.state.scheduleToTimestamp) {
          this.props.openSnackbar("Schedule needs to be atleast a week's long")
        } else {
          this.setState({ [key]: date })
        }
      } else {
        //this.getMasterTimestamps();
        this.setState({ [key]: date }, () => {
          this.resetDayOfWeek()
        })
      }
    }
  }
  // ** EDIT TRIP FUNCTIONS ** //-------------------------------------------------------------------

  // ** EDIT VALIDATION AND UTILITY FUNCTIONS ** //-------------------------------------------------
  /**
   * @function getMasterTimestamps
   * @return {object} masterTimestamps
   */
  getMasterTimestamps = () => {
    const masterTimestamps = {}
    let schedule = 0
    masterTimestamps.masterFromDate = getUnixString(
      moment(
        moment(this.state.fromDate).subtract(this.state.tolerance, 'minutes')
      )
    )
    if (this.state.scheduleToTimestamp) {
      masterTimestamps.masterToDate = getUnixString(
        moment(moment(this.state.toDate).add(this.state.tolerance, 'minutes'))
      )
      // console.log(masterTimestamps.masterToDate)
    } else {
      masterTimestamps.masterToDate = getUnixString(
        moment(moment(this.state.toDate).add(this.state.tolerance, 'minutes'))
      )
    }
    this.state.dayOfWeek.forEach((day, index) => {
      if (day.status) {
        schedule = schedule + Math.pow(2, 6 - index)
      }
    })
    masterTimestamps.schedule = schedule

    return masterTimestamps
  }

  /**
   * @function validateNumbers
   * @return {string[]} filteredNumbers List of all regex passed numbers
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
   * @return {string[]} validateEmails List of emails of all regex passed numbers
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
   * @function checkInputFields
   * @return Validate input fields during trip edit.
   */
  checkInputFields = () => {
    return (
      !this.state.selectedRoute ||
      !this.state.selectedVehicle ||
      !this.state.fromDate ||
      !this.state.toDate ||
      this.state.tolerance === '' ||
      (!this.state.scheduleToTimestamp && this.state.isSchedulingActive)
    )
  }
  // ** EDIT VALIDATION AND UTILITY FUNCTIONS ** //------------------------------------------------

  // ** SCHEDULING FUNCTIONS ** //-----------------------------------------------------------------
  /**
   * @function handleDayChange
   * @param {object} checkboxState Checkbox state of selected schedule
   * @param {number} index Index at which checkbox is selected/deselected
   */
  handleDayChange = (checkboxState, index) => {
    const response = this.getFormattedDayOfWeek(index, {
      status: checkboxState,
      disableChecked: false,
    })
    this.setState({ dayOfWeek: response })
  }

  /**
   * @function parseDaysOfWeek
   * @summary Calculate appropriate day of week association based on schedule.
   */
  parseDaysOfWeek = () => {
    let value = this.state.schedule
    const dayOfWeekIndex = this.getDayOfWeekIndex(
      moment(this.state.fromDate).format('ddd')
    )
    this.setState(
      {
        tripDuration:
          moment(this.state.toDate).unix() - moment(this.state.fromDate).unix(),
      },
      () => {
        let dayOfWeek = []
        let index = 0
        while (value >= 1) {
          const r = parseInt(value, 10) % 2
          value = value / 2
          if (r) {
            if (index === 6 - dayOfWeekIndex) {
              dayOfWeek = this.getFormattedDayOfWeek(6 - index, {
                status: true,
                disableChecked: true,
              })
            } else {
              dayOfWeek = this.getFormattedDayOfWeek(6 - index, {
                status: true,
                disableChecked: false,
              })
            }
          }
          index++
        }
        this.setState({ dayOfWeek }, () => {
          // form edit object
          this.formEditObject()
        })
      }
    )
  }

  /**
   * @function processDayOfWeek
   * @summary Calculate day of week index based on trip start date
   */
  processDayOfWeek = (options) => {
    // Get day for trip start date and find index
    const dayOfWeekIndex = this.getDayOfWeekIndex(
      moment(this.state.fromDate).format('ddd')
    )
    // Enable that date and disable adjacent dates in case trip is longer than a day
    const response = this.getFormattedDayOfWeek(dayOfWeekIndex, options)
    this.setState({ dayOfWeek: response })
  }

  /**
   * @function resetDayOfWeek
   * @summary Clear all days of week associations
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
        if (this.state.tripDuration < 604800) {
          // Trip needs to be less than a week long
          this.processDayOfWeek({ status: true, disableChecked: false })
        }
      }
    )
  }

  /**
   * @function getFormattedDayOfWeek
   * @param {number} dayOfWeekIndex Index of checkbox selection based on trip start date
   * @param {object} options Contains status of checkbox and flag to monitor if checkbox state
   * @summary Assign states to checkbox according to {@link options} and decides if checkbox should be kept enabled to edit or disabled based in trip duration
   */
  getFormattedDayOfWeek = (dayOfWeekIndex, options) => {
    const dayOfWeek = this.state.dayOfWeek
    // Trip status on day
    dayOfWeek[dayOfWeekIndex].status = options.status
    // Check for multi-day trip
    if (this.state.tripDuration >= 86400) {
      const noOfDays = parseInt(this.state.tripDuration / 86400, 10)
      for (var i = 0 - noOfDays; i <= noOfDays; i++) {
        if (i !== 0 || options.disableChecked) {
          let index = dayOfWeekIndex + i
          if (index < 0) index = 7 + index
          if (index > 6) index = index - 7
          dayOfWeek[index].disable = options.status
        }
      }
      // unchecking existing day in schedule should not change disabled days by other configured days
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
      dayOfWeek[dayOfWeekIndex].disable = false
    }
    return dayOfWeek
    // this.setState({ dayOfWeek })
  }

  /**
   * @function getDayOfWeekIndex
   * @param {string} day Readable day of week
   * @summary Fetch day of week based on week index from readable form
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
   * @summary Add phone number fields as contact information during trip edit
   */
  handleAddNumberField = () => {
    const lastEntry = this.state.numbers.length - 1
    if (this.state.numbers[lastEntry] === '') {
      this.props.openSnackbar('Fill contact number before adding more')
    } else this.setState({ numbers: [...this.state.numbers, ''] })
  }

  /**
   * @function handleAddEmailField
   * @summary Add email fields as contact information during trip edit
   */
  handleAddEmailField = () => {
    const lastEntry = this.state.emails.length - 1
    if (this.state.emails[lastEntry] === '') {
      this.props.openSnackbar('Fill email details before adding more')
    } else this.setState({ emails: [...this.state.emails, ''] })
  }

  /**
   * @function handleDeleteNumberField
   * @summary Remove phone number fields as contact information during trip edit
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
   * @summary Remove email fields as contact information during trip edit
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
   * @param {string} email Email string
   * @param {number} index Index at which email is edited
   */
  handleEmailChange = (email, index) => {
    const storedEmails = this.state.emails
    storedEmails[index] = email
    this.setState({ emails: storedEmails })
  }

  /**
   * @function handleNumberChange
   * @param {string} number Number string
   * @param {number} index Index at which number is edited
   */
  handleNumberChange = (number, index) => {
    const storedNumbers = this.state.numbers
    storedNumbers[index] = number
    this.setState({ numbers: storedNumbers })
  }
  // ** CONTACT DETAILS FUNCTIONS ** //--------------------------------------------------------------

  // ** MAP UTILITY FUNCTIONS ** // -- These functions are common to both view and create -----------
  /**
   * @function setMap
   * @param {object} map Map object
   * @summary Initialize and store map
   */
  setMap = (map) =>
    this.setState({ map }, () => {
      this.setState({ multiLine: new MultiLine(this.state.map) })
    })

  /**
   * @function drawRouteOnView
   * @summary Draw route associated with selected trip
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
   * @summary Draw all markers associated with the selected trip
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
   * @param {object} geoglePathGeo
   * @summary Draws route fence
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
   * @summary Draw fences of all areas associated with selected trip
   */
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

  /**
   * @function drawStaticCircularFence
   * @param {number} radius Radius of circular fence
   * @param {object} center Center LatLng object of circular fence
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
   * @param {object} polyFence Array of all vertex LatLng objects of polygon fence
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
   * @summary Clear all routes and markers associated with selected trip
   */
  handleClearRoute = () => {
    this.clearMapVariable()
    this.clearRoute()
    this.clearMarkers()
    this.clearAoiFences()
    this.clearRouteVariables()
  }

  /**
   * @function clearMapVariable
   * @summary Clear polyline, start/stop flag, popup and vehicle icon
   */
  clearMapVariable = () => {
    if (this.state.multiLine instanceof MultiLine) {
      this.state.multiLine.remove()
    }
    if (markerInstance) markerInstance.setMap(null)
    markerInstance = null
    if (markerStart) markerStart.setMap(null)
    markerStart = null
    if (markerEnd) markerEnd.setMap(null)
    markerEnd = null

    if (this._customPopup) this._customPopup.setMap(null)
  }

  /**
   * @function clearRoute
   * @summary Clear route and route fence
   */
  clearRoute = () => {
    if (isFenceDrawn) {
      routePolygon.setMap(null)
      isFenceDrawn = false
    }
    if (isRouteDrawn) {
      routePolyline.setMap(null)
      isRouteDrawn = false
    }
  }

  /**
   * @function clearRouteVariables
   * @summary Clear all route related variables
   */
  clearRouteVariables = () => {
    this.setState({
      modalField: null,
      selectedVehicle: null,
      selectedRoute: null,
      selectedTrip: null,
      selectedRouteDetails: null,
      placesCoordinates: null,
      areaTypeBuffer: null,
      aoiFenceBuffer: null,
      tolerance: '',
      email: '',
      number: '',
      fromDate: null,
      toDate: null,
      assignedVehicle: null,
      status: null,
      tripName: null,
      createdOn: null,
      travelReplayData: {},
      liveData: {},
      isLiveTracking: false,
    })
  }

  /**
   * @function clearMarkers
   * @summary Clear all area markers associated with selected trip
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
   * @summary Clear all area fences associated with selected trip
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

  // ** REPLAY FUNCTIONS ** //-------------------------------------------------------------------
  /**
   * @function getUnix
   * @summary Get unix string from moment date object
   */
  getUnix = () => ({
    fromDate: getUnixString(this.state.fromDate),
    toDate: getUnixString(this.state.toDate),
  })

  /**
   * @async
   * @function requestTripReplayData
   * @summary Fetch replay data for completed trip. Draw markers and covered path.
   */
  requestTripReplayData = async () => {
    let data = 0

    const unixDates = this.getUnix()
    this.setState({ isQueryActive: true })
    const localResponse = await this.props.client.query({
      query: TRAVEL_REPLAY_PACKETS,
      variables: {
        uniqueId: this.state.assignedVehicleId,
        from: unixDates.fromDate,
        to: unixDates.toDate,
        snapToRoad: false,
      },
    })

    data = localResponse.data.getTravelHistory.points
    const localReplayCount = data.length

    if (localReplayCount < 2) {
      this.setState({ isQueryActive: false })
      this.props.openSnackbar('No data available during defined trip duration.')
      this.setState({
        isReplayActive: false,
        sliderValue: 0,
      })
      if (this.state.multiLine instanceof MultiLine) {
        this.state.multiLine.remove()
      }
    } else {
      const localStep = parseFloat((100 / localReplayCount).toFixed(3))
      this.setState({
        travelReplayData: {
          response: data,
          replayCount: localReplayCount,
          step: localStep,
        },
      })
      count = 0

      // Get vehicle type to choose marker icon
      const response = await this.props.client.query({
        query: GET_VEHICLE_DETAIL,
        variables: {
          id: this.state.assignedVehicleId.toString(),
        },
      })
      let vehicleType = 'car'
      if (response.data) {
        vehicleType = response.data.getVehicleDetail.vehicleType
      }

      // setup custom marker
      markerInstance = new CustomMarker(
        {
          uniqueId: this.state.assignedVehicleId,
          idlingStatus: false,
          haltStatus: false,
          timestamp: data[0].ts,
          speed: data[0].speed,
          latitude: data[0].lat,
          longitude: data[0].lng,
          vehicleType: vehicleType,
        },
        this.state.map,
        this.state.multiLine
      )
      this.state.map.setOptions({
        maxZoom: 20,
        minZoom: 7,
        zoom: 6,
        draggable: true,
        gestureHandling: 'greedy',
        center: markerInstance.getPosition(),
      })

      this.setState({ isQueryActive: false })
    }
    // }

    if (data.length > 1) {
      this.setState({ isReplayActive: true }, () => {
        this.drawMarker()
        this.drawReplayMultiline()
        this.getInterval(this.state.replaySpeed)
        this.replayControls()
      })
    }
  }

  /**
   * @function getInterval
   * @param {number} factor Factor at which replay needs to be played
   * @summary Calculate animation interval based on factor.
   */
  getInterval = (factor) => {
    this.handleIntervalChange(REPLAY_DURATION / factor, factor)
  }

  /**
   * @function handleIntervalChange
   * @param {number} interval Animation interval
   * @param {number} replaySpeed Factor at which replay is played
   */
  handleIntervalChange = (interval, replaySpeed) =>
    this.setState({ interval, replaySpeed })

  /**
   * @function drawMarker
   * @summary Set bounds of map based on travel replay points
   */
  drawMarker = () => {
    const data = this.state.travelReplayData.response

    // Set map bounds around replay route
    const bounds = new this.props.google.maps.LatLngBounds()
    data.forEach((index) => {
      const extendPoints = new this.props.google.maps.LatLng({
        lat: index.lat,
        lng: index.lng,
      })
      bounds.extend(extendPoints)
    })
    this.state.map.fitBounds(bounds)
  }

  /**
   * @function drawReplayMultiline
   * @summary Draw start flag, stop flag and polyline based on replay data
   */
  drawReplayMultiline = () => {
    // Plot multiline on map
    let i = 0

    if (this.state.multiLine instanceof MultiLine) {
      this.state.multiLine.remove()
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
    const startFlag = {
      url: iconStartFlag,
      scaledSize: new this.props.google.maps.Size(40, 40),
      anchor: new this.props.google.maps.Point(0, 40),
    }
    const endFlag = {
      url: iconEndFlag,
      scaledSize: new this.props.google.maps.Size(40, 40),
      anchor: new this.props.google.maps.Point(0, 40),
    }
    while (i < this.state.travelReplayData.replayCount) {
      const point = new this.props.google.maps.LatLng({
        lat: this.state.travelReplayData.response[i].lat,
        lng: this.state.travelReplayData.response[i].lng,
      })
      this.state.multiLine.addPoint(point)
      i++
    }

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

    // markerList.push(markerStart)
    // markerList.push(markerEnd)
  }

  /**
   * @function breakTimeout
   * @summary Break the animation when replay is cancelled
   */
  breakTimeout = () => {
    if (loop) {
      clearTimeout(loop)
      loop = null
    }
  }

  /**
   * @function handleSliderChange
   * @param {number} value Changed slider value
   * @summary Store changed slider value
   */
  handleSliderChange = (value) => this.setState({ sliderValue: value })

  /**
   * @function replayControls
   * @summary Handles animation of marker in travel replay based on chosen speed
   *
   */
  replayControls = () => {
    if (!this.state.isReplayActive) {
      this.setState({ fromDate: null, toDate: null })
      count = 0
      this.breakTimeout()
    } else if (this.state.travelReplayData.replayCount === count) {
      this.setState({ isReplayActive: false, fromDate: null, toDate: null })
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
        })
      }
      // New marker position
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
      count = count + 1
    }
    if (this.state.isReplayActive) {
      loop = setTimeout(this.replayControls, this.state.interval)
    }
  }

  /**
   * @function handleReplayStop
   * @summary Show message and reset replay controls when replay is finished
   */
  handleReplayStop = () => {
    this.setState({ isReplayActive: false, sliderValue: 0 })
    this.props.openSnackbar('Replay Finished')
  }

  /**
   * @function handleCancelTravelReplay
   * @summary Handle states when replay is cancelled by user
   */
  handleCancelTravelReplay = () => {
    this.handleReplayStop()
    this.breakTimeout()
    this.clearMapVariable()
  }

  /**
   * @function onSliderChange
   * @param {object} event Slider change event
   * @param {number} value Changed slider value
   * @summary Change slider value if user seeks the slider
   */
  onSliderChange = (event, value) => {
    if (!this.state.isReplayActive) {
      this.handleSliderChange(value)
    }
  }
  // ** REPLAY FUNCTIONS ** //-------------------------------------------------------------------

  // ** LIVE TRACKING FUNCTIONS ** //------------------------------------------------------------
  /**
   * @function isOffline
   * @param {number} timestamp Epoch timestamp
   * @return {boolean} Flag returns if vehicle is offline. This happens if last received packet is more than half an hour old.
   */
  isOffline = (timestamp) => {
    // timestamp is assumed to be UTC+0
    var d = new Date()
    var currentTime = Math.round(d.getTime() / 1000)
    return currentTime - parseInt(timestamp) > 1800
  }

  /**
   * @function setupSubscription
   * @summary Setup live subscription
   */
  setupSubscription = () => {
    this.deviceSubscription = this.props.client.subscribe({
      query: DEVICE_LOCATION,
      variables: {
        deviceId: this.state.assignedVehicleId,
        snapToRoad: true,
      },
    })
  }

  /**
   * @function resetLiveTracking
   * @summary Resets live tracking
   */
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
    // Stop polling on reset
    // this.stopPolling()
  }

  /**
   * @function animateLive
   * @summary Handles animation during live tracking everytime a new packet is received from subscription.
   */
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

  /**
   * @function startSubscription
   * @summary Start live subscription
   */
  startSubscription = () => {
    // TODO: Request ETA for new location received
    this.setState({ isLiveTracking: true })
    this.unsubHandle = this.deviceSubscription.subscribe({
      next: ({ data }) => {
        // console.log('vehicle data', data)
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

  /**
   * @function stopSubscription
   * @summary Stop live subscription
   */
  stopSubscription = () => {
    this.setState({ isLiveTracking: false })
    if (this.unsubHandle) this.unsubHandle.unsubscribe()
  }

  /**
   * @async
   * @function handleRequestLive
   * @summary Request latest last known location of vehicle before subscription starts
   */
  handleRequestLive = async () => {
    this.setupSubscription()
    // this.setupPolling()

    // Vehicle type for marker icon
    const response = await this.props.client.query({
      query: GET_VEHICLE_DETAIL,
      variables: {
        id: this.state.assignedVehicleId.toString(),
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
        id: this.state.assignedVehicleId.toString(),
      },
    })

    let latitude = null
    let longitude = null

    if (location.data) {
      latitude = location.data.latestLocation.latitude
      longitude = location.data.latestLocation.longitude
    }

    // Live marker
    markerInstance = new CustomMarker(
      {
        uniqueId: this.state.assignedVehicleId,
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
    // Poll to calculate ETA till next waypoint
    // this.startPolling()
  }

  handleCancelLiveTracking = () => {
    this.resetLiveTracking()
    this.stopSubscription()
    this.clearMapVariable()
  }
  // ** LIVE TRACKING FUNCTIONS ** //-------------------------------------------------------------------

  // ** IN-PROGRESS ETA AND POLLING FUNCTIONS ** //-----------------------------------------------------
  /**
   * @function getEtaOSM
   * @param {object} waypoints Start and end coordinates for points within which eta is calculated
   * @summary Request ETA to next waypoint from open source map.
   */
  getEtaOSM = async (waypoints) => {
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
        this.setPopup()
      })
    }
  }

  /**
   * @function requestEta
   * @summary Request ETA to next waypoint while the trip is in progress and user is watching vehicle live.
   */
  requestEta = () => {
    // Latest subscription data
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
      if (this.state.placesCoordinates[this.state.indexOfIntrest]) {
        var destination = {
          lat: parseFloat(
            this.state.placesCoordinates[this.state.indexOfIntrest].lat.toFixed(
              6
            )
          ),
          lon: parseFloat(
            this.state.placesCoordinates[this.state.indexOfIntrest].lng.toFixed(
              6
            )
          ),
          type: 'break',
        }
        this.getLatestWaypoint()
        this.getEtaOSM([origin, destination])
      }

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
      //           { eta: response.rows[0].elements[0].duration.text },
      //           () => {
      //             this.setPopup()
      //           }
      //         )
      //       }
      //     }
      //   }
      // )
    }
  }

  /**
   * @function setupPolling
   * @summary Setup polling to fetch latest waypoint breach during an in progress trip. This is required to know the next point and show ETA.
   */
  setupPolling = () => {
    this.allDevicesQuery = this.props.client.watchQuery({
      query: GET_SUBTRIP_DETAILS_POLL,
      variables: {
        id: this.state.selectedSubTrip.subTripId,
      },
      pollInterval: 10000,
    })
  }

  /**
   * @function startPolling
   * @summary start polling for next waypoint during live tracking of in progress trip
   */
  startPolling = () => {
    this.allDevicesQuery.subscribe({
      next: ({ data }) => {
        if (data) {
          // console.log('live data', data)
          if (
            data.getSubTrip &&
            data.getSubTrip.events &&
            data.getSubTrip.events[1].details.length > 0
          ) {
            // Check if any waypoint alert is generated
            const noOfWaypoints = data.getSubTrip.events[1].details.length
            const indexOfIntrest =
              data.getSubTrip.events[1].details[noOfWaypoints - 1].index
            this.setState({ indexOfIntrest })
          }
        }
      },
    })
  }

  /**
   * @function stopPolling
   * @summary Stop polling for next waypoint during live tracking of in progess trip.
   */
  stopPolling = () => this.allDevicesQuery.stopPolling()

  /**
   * @function getLatestWaypoint
   * @summary fetch latest waypoint and show ETA popup accordingly
   */
  getLatestWaypoint = async () => {
    let response = this.props.client.query({
      query: GET_SUBTRIP_DETAILS_POLL,
      variables: {
        id: this.state.selectedSubTrip.subTripId,
      },
    })
    let data = response.getSubTrip
    if (data) {
      // console.log('live data', data)
      if (
        data.getSubTrip &&
        data.getSubTrip.events &&
        data.getSubTrip.events[1].details.length > 0
      ) {
        // Check if any waypoint alert is generated
        const noOfWaypoints = data.getSubTrip.events[1].details.length
        const indexOfIntrest =
          data.getSubTrip.events[1].details[noOfWaypoints - 1].index
        this.setState({ indexOfIntrest })
      }
    }
  }

  /**
   * @function setPopup
   * @summary Shows ETA popup
   */
  setPopup = () => {
    // index is next waypoint of interest
    this._customPopup.setPopupData({
      eta: `${this.state.eta} min`,
    })
    // Next waypoint coordinate
    if (this.state.placesCoordinates[this.state.indexOfIntrest]) {
      this._customPopup.setPosition(
        new this.props.google.maps.LatLng({
          lat: this.state.placesCoordinates[this.state.indexOfIntrest].lat,
          lng: this.state.placesCoordinates[this.state.indexOfIntrest].lng,
        })
      )
      this._customPopup.setMap(this.state.map)
    }
  }
  // ** IN-PROGRESS ETA AND POLLING FUNCTIONS ** //-----------------------------------------------------

  /**
   * @async
   * @function handleDeleteBulkTrips
   * @summary handle excel upload of trip with wildcard to delete trips
   */
  handleDeleteBulkTrips = async () => {
    this.setState({ instructionModalOpen: true })
  }

  /**
   * @function onOkPress
   * @summary Toggle upload modal state
   */
  onOkPress = () => {
    this.setState({ instructionModalOpen: false })
  }

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
      'Trip Delete Template'
    )
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

  /**
   * @async
   * @function onSubmit
   * @summary Handle success or failure of trip bulk upload.
   */
  onSubmit = async () => {
    const response = await this.props.client.mutate({
      mutation: DELETE_TRIPS_LIST,
      variables: {
        fileInfo: {
          uploadFor: 'DeleteTrips',
          bucketName: this.state.bucketName,
          fileName: this.state.fileName,
        },
        commonInput: {
          clientLoginId: getLoginId(),
          keepOldTripsHistory: this.state.keepOldTripsHistory,
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
        this.props.openSnackbar(`Successfully deleted trip(s).`)
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
          `Failed to delete trips(s). ${failedEntries} error(s) found.`
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
   * @function handleSwitchChange
   * @param {string} name Name of state to be mutated
   * @param {object} event Switch event
   * @summary handle switch toggle
   */
  handleSwitchChange = (name) => (event) => {
    this.setState({ ...this.state, [name]: event.target.checked })
  }

  render() {
    const { classes, selectedLanguage } = this.props

    return (
      <div className={classes.root}>
        {/* Bulk upload instruction */}
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.instructionModalOpen}
          onClose={() => this.onOkPress}
        >
          <div style={getModalStyle()} className={classes.paper}>
            <Typography variant="h6" id="modal-title">
              Trip Delete Bulk Upload
            </Typography>
            <Divider />
            <br />
            {!this.state.uploadSuccess ? (
              <div>
                <Typography variant="body2">
                  A template is made available for you to download. You have to
                  fill the template sheet in format defined and upload to delete
                  trips quickly!
                </Typography>
                <br />
                <Typography variant="body2">
                  If you have downloaded the template before, fill the sheet and
                  upload directly.
                </Typography>
                <br />
                <Typography variant="button" id="modal-title">
                  Instructions
                </Typography>
                {instructions &&
                  instructions.map((message, index) => (
                    <Grid container key={index}>
                      <Grid item xs={2}>
                        <Typography
                          color="textSecondary"
                          align="center"
                          variant="body2"
                        >
                          {index + 1}
                        </Typography>
                      </Grid>
                      <Grid item xs={10}>
                        <Typography
                          color="textSecondary"
                          align="center"
                          variant="body2"
                        >
                          {message}
                        </Typography>
                      </Grid>
                    </Grid>
                  ))}
                <br />
                <Grid container>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={this.state.keepOldTripsHistory}
                          onChange={this.handleSwitchChange(
                            'keepOldTripsHistory'
                          )}
                          value="checkedB"
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body2">
                          Do you want to keep completed trips? If no, then all
                          trip histories will be lost permanentaly.
                        </Typography>
                      }
                    />
                  </Grid>
                </Grid>
              </div>
            ) : (
              <Typography variant="body2">
                List uploaded successfully! Press submit to delete matching
                trips.
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
                            color="default"
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
                    color="default"
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

        <ConfirmationModal
          openModal={this.state.openModal}
          modalMessage={this.state.modalMessage}
          reason={this.state.modalReason}
          handleOkClose={this.handleModalOkPress}
        />

        <EditModal
          openModal={this.state.editingActive}
          handleEditDone={this.handleTripEditConfirmed}
          fromDate={this.state.fromDate}
          toDate={this.state.toDate}
          scheduleToTimestamp={this.state.scheduleToTimestamp}
          isSchedulingActive={!!this.state.schedule}
          tolerance={this.state.tolerance}
          handleTripNameChange={this.handleNameChange}
          tripName={this.state.tripName}
          onToleranceChange={this.handleToleranceChange}
          onEmailChange={this.handleEmailChange}
          onNumberChange={this.handleNumberChange}
          onDateChange={this.handleDateChange}
          dayOfWeek={this.state.dayOfWeek}
          onDayChange={this.handleDayChange}
          emails={this.state.emails}
          handleAddEmailField={this.handleAddEmailField}
          handleDeleteEmailField={this.handleDeleteEmailField}
          numbers={this.state.numbers}
          handleAddNumberField={this.handleAddNumberField}
          handleDeleteNumberField={this.handleDeleteNumberField}
        />

        <Grid
          container
          spacing={2}
          style={{
            height: '100%',
          }}
          alignContent="flex-start"
        >
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid container justify="space-between">
                  <Grid item xs={12} md={3}>
                    <ComboBox
                      items={this.state.vehicles || []}
                      selectedItem={this.state.selectedVehicle}
                      onSelectedItemChange={this.handleVehicleChange}
                      placeholder={
                        languageJson[selectedLanguage].common.chooseVehicle
                      }
                      isLoading={false}
                      itemKey="entityId"
                      itemToStringKey="vehicleNumber"
                      filterSize={50}
                    />
                    <br />
                  </Grid>
                  {/* <Grid item>
                    <Button
                      variant="outlined"
                      color="default"
                      onClick={this.handleDeleteBulkTrips}
                    >
                      DELETE TRIPS
                    </Button>
                  </Grid> */}
                </Grid>
                <Grid container spacing={2}>
                  {TRIP_STATUS_TYPES.map((type, index) => (
                    <Grid item xs={6} sm={4} md={1} key={index}>
                      <AlertCard
                        alertName={type.name}
                        alertDescription={type.description}
                        cardColor={COLOR_RANGE.sunshine}
                        alertCount={type.count}
                        filter={() => this.handleTripTypeChange(type)}
                        clicked={type === this.state.selectedTripType}
                        AlertIcon={type.icon}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
            </Grid>

            <Grid container>
              <Grid item xs={12} md={4}>
                <Paper
                  square
                  elevation={8}
                  style={{ height: '450px', overflow: 'auto', padding: 10 }}
                >
                  {this.state.trips ? (
                    !this.state.selectedTrip ? (
                      <TripList
                        trips={this.state.trips}
                        searchedTrips={this.state.searchedTrips}
                        handleDataOnPageChange={this.handleDataOnPageChange}
                        handleDataOnSearch={this.handleDataOnSearch}
                        currentPage={this.state.currentPage}
                        handleCurrentPage={this.handleCurrentPage}
                        selectedTripType={this.state.selectedTripType}
                        onSelectedTripChange={this.onSelectedTripChange}
                      />
                    ) : this.state.selectedSubTrip ? (
                      <SubtripDetails
                        onSubTripBackPress={this.handleSubTripBackPress}
                        selectedSubTrip={this.state.selectedSubTrip}
                        onRequestLiveTracking={this.handleRequestLive}
                        onCancelLiveTracking={this.handleCancelLiveTracking}
                        isLiveTracking={this.state.isLiveTracking}
                        onRequestTravelHistory={this.requestTripReplayData}
                        onCancelTravelHistory={this.handleCancelTravelReplay}
                        isReplayActive={this.state.isReplayActive}
                        tripWaypoints={this.state.places}
                      />
                    ) : (
                      <TripDetails
                        tripName={this.state.tripName}
                        allSubtrips={this.state.allSubtrips}
                        tolerance={this.state.tolerance}
                        assignedVehicle={this.state.assignedVehicle}
                        status={this.state.selectedTrip.status}
                        selectedTripType={this.state.selectedTripType}
                        areTripDetailsFetched={this.state.areTripDetailsFetched}
                        fromDate={this.state.fromDate}
                        toDate={this.state.toDate}
                        scheduleToTimestamp={this.state.scheduleToTimestamp}
                        schedule={this.state.schedule}
                        createdOn={this.state.createdOn}
                        onBackPress={this.handleBackPress}
                        onSelectedSubtrip={this.handleSelectedSubtrip}
                        onTripDelete={this.handleTripDelete}
                        onTripPause={this.handleTripPause}
                        onTripResume={this.handleTripResume}
                        onTripEdit={this.handleTripEdit}
                        editingActive={this.state.editingActive}
                      />
                    )
                  ) : (
                    <Grid
                      container
                      style={{ height: '100%' }}
                      justify="center"
                      alignItems="center"
                    >
                      <CircularProgress />
                    </Grid>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={8}>
                <Map google={this.props.google} setMap={this.setMap} zoom={6}>
                  {this.state.isReplayActive && (
                    <Grid container className={classes.sliderStyle}>
                      <Grid item xs={12}>
                        <Slider
                          value={this.state.sliderValue}
                          onChange={this.onSliderChange}
                        />
                      </Grid>
                    </Grid>
                  )}
                </Map>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
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
              <TripsDashboard downloadSampleFile={downloadReport} {...props} />
            )}
          </DownloadProgressDialogConsumer>
        ))
      )
    )
  )
)
