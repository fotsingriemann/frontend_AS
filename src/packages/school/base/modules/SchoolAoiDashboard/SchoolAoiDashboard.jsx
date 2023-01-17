import React, { Component } from 'react'
import Map from '@zeliot/core/base/modules/TrackingControls/Maps/Map'
import AoiList from './AoiList'
import AoiDetails from './AoiDetails'
import {
  GET_ALL_AREAS,
  GET_AREA_INFO,
  DELETE_AOI,
} from '@zeliot/common/graphql/queries'
import getLoginId from '@zeliot/common/utils/getLoginId'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import withGoogleMaps from '@zeliot/common/hoc/withGoogleMaps'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import { withApollo } from 'react-apollo'
import gql from 'graphql-tag'
import { DEVICE_LOCATION } from '@zeliot/common/graphql/subscriptions'
import moment from 'moment'
import getCustomMarker from '@zeliot/core/base/modules/TripsModule/MapUtils/CustomMarker'
import getMultiLine from '@zeliot/core/base/modules/TripsModule/MapUtils/MultiLine'
import getCustomPopup from '@zeliot/core/base/modules/TripsModule/MapUtils/CustomPopup'
import ConfirmationModal from '@zeliot/core/base/modules/TripsDashboard/ConfirmationModal'
import {
  Grid,
  Paper,
  Button,
  Modal,
  Typography,
  withStyles,
  CircularProgress,
} from '@material-ui/core'
import { DownloadProgressDialogConsumer } from '@zeliot/common/shared/DownloadProgressDialog/DownloadProgressDialog.context'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

// Fetch all unassinged students
const GET_UNASSIGNED_STUDENTS = gql`
  query($loginId: Int!) {
    vehicles: getUnassignedStudents(clientLoginId: $loginId) {
      studentId
      studentName
    }
  }
`

const ASSIGN_STOP_TO_STUDENTS = gql`
  mutation($studentStops: [StudentStops!]!, $clientLoginId: Int!) {
    assignStopsToStudents(
      studentStops: $studentStops
      clientLoginId: $clientLoginId
    )
  }
`

const GET_STUDENTS_FOR_STOP = gql`
  query($clientLoginId: Int!, $areaId: Int!) {
    getStudentsForStop(clientLoginId: $clientLoginId, areaId: $areaId) {
      studentId
      studentName
    }
  }
`

const DEASSIGN_STOP_TO_STUDENT = gql`
  mutation($clientLoginId: Int!, $studentId: Int!) {
    deassignStopToStudent(clientLoginId: $clientLoginId, studentId: $studentId)
  }
`

const EDIT_AREA = gql`
  mutation($areaId: Int!, $edits: AreaEdit!) {
    editArea(areaId: $areaId, edits: $edits) {
      status
      message
      reason {
        tripName
      }
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

let fence = null
let marker = null
let polygonCoordinates = []
let savedRadius = 0
let savedAreaType = 'Circle'
let savedPolygonCoordinates = null

let count = 0
let markerInstance = null
let loop = null
let isAnimationActive = false
let polygonCenter = null

let CustomMarker
let MultiLine
let CustomPopup

class SchoolAoiDashboard extends Component {
  constructor(props) {
    super(props)
    CustomMarker = getCustomMarker(props.google)
    MultiLine = getMultiLine(props.google)
    CustomPopup = getCustomPopup(props.google)
    this._customPopup = new CustomPopup()
  }

  state = {
    isFence: false,
    map: null,
    aoiCoordinates: null,
    areaType: null,
    allAreas: null,
    selectedArea: null, // Selected area for view
    areaQueryActive: false,
    createdOn: null,
    assignVehicle: false,
    email: [''],
    sms: [''],
    vehicles: null,
    // groups: null,
    selectedVehicle: [],
    selectedEntry: [],
    confirmDelete: false,
    deleteConfirmed: false,
    deletionStatus: null,
    radius: 0,
    associatedVehicles: null,
    selectedAssociatedVehicle: null,
    confirmDeleteVehicle: false,
    isLiveTracking: false,
    eta: '',
    openModal: false,
    vehiclesQueryStatus: 'EMPTY',
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.isOpen !== this.props.isOpen && this.props.isOpen === false) {
      this.fetchAllAreas()
    }
  }

  async componentDidMount() {
    this.setState({ isLoading: true })
    await this.requestAllVehicles() // Requests all students
    // await this.requestAllGroups()
    this.fetchAllAreas()
    this.setState({ isLoading: false })
  }

  requestAllVehicles = async () => {
    const response = await this.props.client.query({
      query: GET_UNASSIGNED_STUDENTS,
      variables: {
        loginId: getLoginId(),
      },
      fetchPolicy: 'network-only',
    })

    if (response.data && response.data.vehicles) {
      const vehiclesList = response.data.vehicles.map(
        ({ studentId, studentName }) => ({
          id: studentId,
          name: studentName,
          // type: 'VEHICLE'
        })
      )
      this._unfilteredVehicles = vehiclesList
      this.setState({ vehicles: vehiclesList, vehiclesQueryStatus: 'LOADED' })
    } else {
      this.setState({ vehiclesQueryStatus: 'ERROR' })
    }
  }

  handleVehicleChange = (selectedVehicle) => {
    const length = selectedVehicle.length
    if (length > 0) {
      const allVehicles = [
        ...this.state.selectedVehicle,
        selectedVehicle[length - 1],
      ]
      this.setState({
        selectedVehicle: allVehicles,
        selectedEntry: selectedVehicle,
      })
    } else {
      this.setState({ selectedVehicle, selectedEntry: [] })
    }
  }

  fetchAllAreas = async () => {
    const fetchedAreas = await this.props.client.query({
      query: GET_ALL_AREAS,
      variables: {
        clientLoginId: getLoginId(),
      },
      fetchPolicy: 'network-only',
    })
    // TODO: Handle error
    if (fetchedAreas.data && fetchedAreas.data.getAllAreaDetails) {
      this.setState({ allAreas: fetchedAreas.data.getAllAreaDetails }, () => {
        this.handleRequestAreaSort('desc')
      })
    }
  }

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
    polygonCenter = JSON.parse(fetchedDetails.data.getAreaDetails.geoPosition)
    this.setState({
      areaType: fetchedDetails.data.getAreaDetails.areaType.areaTypeName,
      createdOn: getFormattedTime(
        fetchedDetails.data.getAreaDetails.createdAt,
        'llll'
      ),
    })

    this.decodeGeoJson(receivedGeoJson, polygonCenter, proceed)
  }

  calculatePolygonRadius = (origin, destination) => {
    var R = 6371000 // metres
    var latOneRadians = (origin.lat * Math.PI) / 180
    var latTwoRadians = (destination.lat * Math.PI) / 180
    var deltaLat = ((destination.lat - origin.lat) * Math.PI) / 180
    var deltaLng = ((destination.lng - origin.lng) * Math.PI) / 180

    var a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(latOneRadians) *
        Math.cos(latTwoRadians) *
        Math.sin(deltaLng / 2) *
        Math.sin(deltaLng / 2)
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    var d = R * c
    return Math.round(d)
  }

  decodeGeoJson = (receivedGeoJson, polygonCenter, proceed) => {
    const geoJson = receivedGeoJson
    if (geoJson.type === 'Circle') {
      this.setState(
        {
          aoiCoordinates: {
            lat: parseFloat(geoJson.coordinates[0]),
            lng: parseFloat(geoJson.coordinates[1]),
          },
          radius: geoJson.radius,
          areaType: geoJson.type,
        },
        proceed
      )
    } else {
      const coordinates = geoJson.coordinates[0]
      polygonCoordinates = []
      coordinates.forEach((point) => {
        polygonCoordinates.push({
          lat: parseFloat(point[0]),
          lng: parseFloat(point[1]),
        })
      })
      const radius = this.calculatePolygonRadius(
        polygonCenter,
        polygonCoordinates[0]
      )
      this.setState(
        {
          areaType: geoJson.type,
          radius: radius,
          aoiCoordinates: polygonCenter,
        },
        proceed
      )
    }
  }

  setMap = (map) =>
    this.setState({ map }, () => {
      this.setState({ multiLine: new MultiLine(this.state.map) })
    })

  drawStaticCircularFence = () => {
    this.clearFence()
    this.clearMarker()
    this.setState({ isFence: true })
    // Draw marker
    const position = this.state.aoiCoordinates
    // Add new marker
    marker = new this.props.google.maps.Marker({
      position: position,
      map: this.state.map,
      animation: this.props.google.maps.Animation.DROP,
    })
    marker.setMap(this.state.map)
    // Draw fence
    const circularFence = new this.props.google.maps.Circle({
      strokeColor: '#000000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#0000FF',
      fillOpacity: 0.35,
      map: this.state.map,
      center: this.state.aoiCoordinates,
      radius: parseFloat(this.state.radius),
    })
    // Record this fence
    fence = circularFence
    // fit bounds
    const bounds = new this.props.google.maps.LatLngBounds()
    const googlePosition = new this.props.google.maps.LatLng(
      this.state.aoiCoordinates.lat,
      this.state.aoiCoordinates.lng
    )
    for (let angle = -90; angle < 270; angle += 60) {
      const coordinate = this.props.google.maps.geometry.spherical.computeOffset(
        googlePosition,
        parseFloat(this.state.radius),
        angle
      )
      bounds.extend(coordinate)
    }
    this.state.map.fitBounds(bounds)
  }

  drawStaticPolygonFence = () => {
    this.clearFence()
    this.clearMarker()
    this.setState({ isFence: true })
    // Draw marker
    const position = this.state.aoiCoordinates
    // Add new marker
    marker = new this.props.google.maps.Marker({
      position: position,
      map: this.state.map,
      animation: this.props.google.maps.Animation.DROP,
    })
    marker.setMap(this.state.map)
    // Draw fence
    const polygonFence = new this.props.google.maps.Polygon({
      paths: polygonCoordinates,
      strokeColor: '#000000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#0000FF',
      fillOpacity: 0.35,
    })
    // Store this fence
    fence = polygonFence
    fence.setMap(this.state.map)
    // Fit bounds
    const bounds = new this.props.google.maps.LatLngBounds()
    polygonCoordinates.forEach((coordinate) => {
      bounds.extend(coordinate)
    })
    this.state.map.fitBounds(bounds)
  }

  clearFence = () => {
    if (fence) {
      fence.setMap(null)
      fence = null
      this.setState({ isFence: false })
    }
  }

  clearMarker = () => {
    if (marker) {
      marker.setMap(null)
      marker = null
    }
  }

  clearVariables = () => {
    this.setState({
      aoiCoordinates: null,
      selectedArea: null,
      areaType: null,
      createdOn: null,
      assignVehicle: false,
      selectedVehicle: [],
    })
    polygonCoordinates = []
  }

  onClearPoint = () => {
    // Clear marker and fence and associated variables
    this.clearFence()
    this.clearMarker()
    this.clearVariables()
  }

  handleAreaChange = (value) => {
    if (value) {
      // Clear existing areas first
      this.onClearPoint()
      this.setState({ selectedArea: value }, () => {
        this.setState({
          areaQueryActive: true,
          areaName: this.state.selectedArea.areaName,
        })
        // Request the route selected by user
        this.fetchAreaDetails(this.state.selectedArea.id, () => {
          this.setState({ areaQueryActive: false })

          // Fetch vehicles associated
          this.getAlertConfiguration()

          // Draw fence
          if (this.state.areaType === 'Circle') {
            this.drawStaticCircularFence()
          } else {
            this.drawStaticPolygonFence()
          }
        })
      })
    } else {
      this.onClearPoint()
    }
  }

  handleBackPress = () => {
    this.handleAreaChange(null)
  }

  deleteAoiById = async () => {
    const response = await this.props.client.mutate({
      mutation: DELETE_AOI,
      variables: {
        id: this.state.selectedArea.id,
      },
      refetchQueries: [
        {
          query: GET_ALL_AREAS,
          variables: {
            clientLoginId: getLoginId(),
          },
        },
      ],
      awaitRefetchQueries: true,
    })
    if (response.data) {
      if (response.data.deleteUnusedAOI) {
        this.setState({ deletionStatus: true, selectedArea: null })
        this.fetchAllAreas()
        this.onClearPoint()
      } else {
        this.setState({ deletionStatus: false, selectedArea: null })
      }
    }
  }

  handleClose = () => this.setState({ confirmDelete: false })

  onOkClose = () => {
    setTimeout(this.setState({ deleteConfirmed: false }), 500)
  }

  handleDeletePress = () => this.setState({ confirmDelete: true })

  confirmDeleteAoi = async () => {
    this.handleClose()
    await this.deleteAoiById()
    this.setState({ deleteConfirmed: true })
  }

  addVehicles = () => {
    this.setState({ assignVehicle: true })
  }

  clearVehicle = () => {
    this.setState({ assignVehicle: false })
  }

  updateAlertConfigs = async () => {
    const isValid = this.validateAlertInputs()

    const studentIds = []
    this.state.selectedVehicle.forEach((vehicle) => studentIds.push(vehicle.id))
    if (isValid) {
      const response = await this.props.client.mutate({
        mutation: ASSIGN_STOP_TO_STUDENTS,
        variables: {
          studentStops: [
            {
              studentIds,
              areaId: this.state.selectedArea.id,
            },
          ],
          clientLoginId: getLoginId(),
        },
        refetchQueries: [
          {
            query: GET_STUDENTS_FOR_STOP,
            variables: {
              clientLoginId: getLoginId(),
              areaId: this.state.selectedArea.id,
            },
          },
        ],
        awaitRefetchQueries: true,
      })
      if (response.data) {
        this.props.openSnackbar('Students assigned')
        this.setState({
          selectedVehicle: [],
          assignVehicle: false,
          selectedEntry: [],
          vehiclesQueryStatus: 'EMPTY',
        })
        this.getAlertConfiguration()
      } else {
        this.props.openSnackbar('Failed to assign students')
        this.setState({
          selectedVehicle: [],
          assignVehicle: false,
          selectedEntry: [],
          vehiclesQueryStatus: 'EMPTY',
        })
      }
    }
  }

  validateAlertInputs = () => {
    if (this.state.selectedVehicle.length < 1) {
      this.props.openSnackbar('Choose atleast one student to aoi')
      return false
    } else {
      return true
    }
  }

  handleAoiEdit = () => {
    this.clearFence()
    savedRadius = this.state.radius
    savedAreaType = this.state.areaType
    savedPolygonCoordinates = polygonCoordinates
    this.setState({ isAoiEditActive: true })
    if (this.state.areaType === 'Circle') {
      this.drawCircularFence()
    } else {
      this.drawPolygonFence(null)
    }
  }

  handleCancelEditPress = () => {
    polygonCoordinates = savedPolygonCoordinates
    this.setState(
      { isAoiEditActive: false, radius: savedRadius, areaType: savedAreaType },
      () => {
        if (this.state.areaType === 'Circle') {
          this.drawStaticCircularFence()
        } else {
          this.drawStaticPolygonFence()
        }
      }
    )
  }

  handleEditedTextChange = (name, value) => {
    this.setState({ [name]: value })
  }

  handleAreaTypeChange = (areaType) => {
    this.setState({ areaType }, () => {
      if (this.state.areaType === 'Circle') {
        this.drawCircularFence()
      } else {
        this.drawPolygonFence(this.state.radius)
      }
    })
  }

  createGeoJson = () => {
    let geoJson = null
    const vertexArray = []

    if (this.state.areaType === 'Circle') {
      geoJson = {
        type: 'Circle',
        radius: parseInt(this.state.radius, 10),
        coordinates: [
          this.state.aoiCoordinates.lat,
          this.state.aoiCoordinates.lng,
        ],
      }
      return geoJson
    } else {
      // Create polygon coordinates
      polygonCoordinates.forEach((index) => {
        vertexArray.push([index.lat, index.lng])
      })
      // First and last point of polygon should be same
      vertexArray.push([polygonCoordinates[0].lat, polygonCoordinates[0].lng])
      // Save in geoJson
      geoJson = {
        type: 'Polygon',
        coordinates: [vertexArray],
      }
      return geoJson
    }
  }

  handleConfirmEditPress = async () => {
    // await this.handleViewEditedFence()
    const geoJson = this.createGeoJson()
    const response = await this.props.client.mutate({
      mutation: EDIT_AREA,
      variables: {
        areaId: this.state.selectedArea.id,
        edits: {
          areaName: this.state.areaName,
          geoJson: JSON.stringify(geoJson),
          areaTypeId: this.state.areaType === 'Circle' ? 2 : 1,
          geoPosition: JSON.stringify(polygonCenter),
        },
      },
      errorPolicy: 'all',
      refetchQueries: [
        {
          query: GET_ALL_AREAS,
          variables: {
            clientLoginId: getLoginId(),
          },
        },
        {
          query: GET_AREA_INFO,
          variables: {
            id: this.state.selectedArea.id,
          },
        },
      ],
      awaitRefetchQueries: true,
    })

    if (response.data && response.data.editArea) {
      let reason = ''
      if (!response.data.editArea.status) {
        const tripName = response.data.editArea.reason.tripName
        reason =
          'A trip by the name of ' +
          tripName +
          ' is using this AOI. Hence the AOI cannot be edited.'
      }
      this.setState(
        {
          selectedArea: null,
          openModal: true,
          isAoiEditActive: false,
          modalMessage: response.data.editArea.message,
          modalReason: reason,
        },
        () => {
          this.fetchAllAreas()
          this.onClearPoint()
        }
      )
    } else if (response.errors.length > 0) {
      this.props.openSnackbar(response.errors[0].message, { type: 'error' })
    }
  }

  handleModalOkPress = () => {
    this.setState({ openModal: false })
  }

  handleViewEditedFence = () => {
    if (this.state.areaType === 'Circle') {
      this.drawCircularFence()
    } else {
      this.drawPolygonFence(this.state.radius)
    }
  }

  handleRadiusChange = (radius) => this.setState({ radius })

  drawCircularFence = () => {
    this.clearFence()
    this.setState({ isFence: true })
    const circularFence = new this.props.google.maps.Circle({
      editable: true,
      strokeColor: '#000000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#0000FF',
      fillOpacity: 0.35,
      map: this.state.map,
      center: this.state.aoiCoordinates,
      radius: parseFloat(this.state.radius),
    })

    // Record this fence
    fence = circularFence

    // Fit bounds
    let coordinate = null
    const bounds = new this.props.google.maps.LatLngBounds()
    const position = new this.props.google.maps.LatLng(
      this.state.aoiCoordinates.lat,
      this.state.aoiCoordinates.lng
    )
    for (let angle = -90; angle < 270; angle += 60) {
      coordinate = this.props.google.maps.geometry.spherical.computeOffset(
        position,
        parseFloat(this.state.radius),
        angle
      )
      bounds.extend(coordinate)
    }
    this.state.map.fitBounds(bounds)

    // Radius change listener
    this.props.google.maps.event.addListener(
      circularFence,
      'radius_changed',
      () => {
        const radius = circularFence.getRadius()
        if (radius >= 25) {
          this.handleRadiusChange(radius)
        } else {
          this.props.openSnackbar(
            "Fence radius can't be shorter than 25 meters"
          )
          circularFence.setRadius(25)
          this.handleRadiusChange(25)
        }
      }
    )
  }

  drawPolygonFence = (radius) => {
    this.clearFence()
    this.setState({ isFence: true })
    const position = new this.props.google.maps.LatLng(
      this.state.aoiCoordinates.lat,
      this.state.aoiCoordinates.lng
    )
    this.getPolygon(position, radius)
    polygonCenter = position
    fence.setMap(this.state.map)
  }

  getPolygon = (position, radius) => {
    if (radius) {
      // This is a hexagon for now
      const coordinates = []
      let pointOffset = null
      const bounds = new this.props.google.maps.LatLngBounds()
      for (let angle = -90; angle < 270; angle += 60) {
        pointOffset = this.props.google.maps.geometry.spherical.computeOffset(
          position,
          radius,
          angle
        )
        // Calculate bounds
        bounds.extend(pointOffset)
        coordinates.push({ lat: pointOffset.lat(), lng: pointOffset.lng() })
      }
      // Get drawn coordinates
      polygonCoordinates = coordinates
      // Fit bounds
      this.state.map.fitBounds(bounds)
    }
    // Construct the polygon.
    const polygonFence = new this.props.google.maps.Polygon({
      editable: true,
      paths: polygonCoordinates,
      strokeColor: '#000000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#0000FF',
      fillOpacity: 0.35,
    })
    // Store this fence
    fence = polygonFence

    // This listener is fired when edge is moved
    this.props.google.maps.event.addListener(
      polygonFence.getPath(),
      'insert_at',
      () => {
        const unformattedCoordinates = polygonFence.getPath().g
        const formattedCoordinates = []
        unformattedCoordinates.forEach((point) => {
          formattedCoordinates.push({ lat: point.lat(), lng: point.lng() })
        })
        polygonCoordinates = formattedCoordinates
        fence.setPath(polygonFence.getPath())
      }
    )

    // This listener is fired when vertex is moved
    this.props.google.maps.event.addListener(
      polygonFence.getPath(),
      'set_at',
      () => {
        const unformattedCoordinates = polygonFence.getPath().g
        const formattedCoordinates = []
        unformattedCoordinates.forEach((point) => {
          formattedCoordinates.push({ lat: point.lat(), lng: point.lng() })
        })
        polygonCoordinates = formattedCoordinates
        fence.setPath(polygonFence.getPath())
      }
    )
  }

  getAlertConfiguration = async () => {
    const associatedVehicles = await this.props.client.query({
      query: GET_STUDENTS_FOR_STOP,
      variables: {
        clientLoginId: getLoginId(),
        // alertType: 'geofence',
        areaId: this.state.selectedArea.id,
        // uniqueDeviceId: null,
        // enableOnly: true
      },
    })
    if (associatedVehicles.data.getStudentsForStop) {
      this.setState(
        {
          associatedVehicles: associatedVehicles.data.getStudentsForStop,
        },
        () => {
          const allVehicles = [...this._unfilteredVehicles]
          const associatedVehicles = this.state.associatedVehicles
          for (var i = allVehicles.length - 1; i >= 0; i--) {
            for (var j = 0; j < associatedVehicles.length; j++) {
              if (
                allVehicles[i] &&
                allVehicles[i].id === associatedVehicles[j].studentId
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

  handleVehicleAssociationDelete = (vehicle) => {
    this.setState({
      confirmDeleteVehicle: true,
      selectedAssociatedVehicle: vehicle,
    })
  }

  handleVehicleDeleteClose = () => {
    this.setState({
      confirmDeleteVehicle: false,
      selectedAssociatedVehicle: null,
    })
  }

  handleConfirmDeleteVehicle = async () => {
    const response = await this.props.client.mutate({
      mutation: DEASSIGN_STOP_TO_STUDENT,
      variables: {
        clientLoginId: getLoginId(),
        studentId: this.state.selectedAssociatedVehicle.studentId,
      },
      refetchQueries: [
        {
          query: GET_STUDENTS_FOR_STOP,
          variables: {
            clientLoginId: getLoginId(),
            // uniqueDeviceId: null,
            // enableOnly: true,
            // alertType: 'geofence',
            areaId: this.state.selectedArea.id,
          },
          // fetchPolicy: 'network-only'
        },
      ],
      awaitRefetchQueries: true,
    })

    if (response.data) {
      this.props.openSnackbar('Student association removed')
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

  onSelectedAssociatedVehicle = (selectedAssociatedVehicle) =>
    this.setState({ selectedAssociatedVehicle }, () => {
      this.getAssociatedVehicleDetails()
    })

  getAssociatedVehicleDetails = async () => {
    const response = await this.props.client.query({
      query: GET_STUDENTS_FOR_STOP,
      variables: {
        clientLoginId: getLoginId(),
        areaId: this.state.selectedArea.id,
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
    this.eta = []
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

  requestEta = () => {
    this.setState({ eta: '' }, () => {
      // Latest subscription data
      if (
        Object.keys(this.state.liveData).length > 0 &&
        this.state.liveData.device.length > 0
      ) {
        // calculated ETA
        const liveFeed = this.state.liveData.device[0]

        if (this.state.aoiCoordinates) {
          // // Latest live packet from subscription
          var origin = {
            lat: parseFloat(liveFeed.latitude.toFixed(6)),
            lon: parseFloat(liveFeed.longitude.toFixed(6)),
            type: 'break',
          }
          // TODO: Next waypoint coordinates
          var destination = {
            lat: parseFloat(this.state.aoiCoordinates.lat.toFixed(6)),
            lon: parseFloat(this.state.aoiCoordinates.lng.toFixed(6)),
            type: 'break',
          }
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
    })
  }

  // Set popup to show ETA
  setPopup = () => {
    this._customPopup.setPopupData({
      eta: `${this.state.eta} min`,
    })
    // Next waypoint coordinate
    this._customPopup.setPosition(
      new this.props.google.maps.LatLng({
        lat: this.state.aoiCoordinates.lat,
        lng: this.state.aoiCoordinates.lng,
      })
    )
    this._customPopup.setMap(this.state.map)
  }

  handleRequestAreaSort = (order) => {
    let aois = this.state.allAreas
    if (order === 'asc') {
      aois.sort(function (a, b) {
        return a.createdAt - b.createdAt
      })
    } else {
      aois.sort(function (a, b) {
        return a.createdAt - b.createdAt
      })
      aois = aois.reverse()
    }
    this.setState({ allAreas: aois })
  }

  render() {
    const { classes } = this.props

    return (
      <Grid container>
        <ConfirmationModal
          openModal={this.state.openModal}
          modalMessage={this.state.modalMessage}
          reason={this.state.modalReason}
          handleOkClose={this.handleModalOkPress}
        />

        {/* Deletion confirmation modal */}
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.deleteConfirmed}
          onClose={this.onOkClose}
        >
          <div style={getModalStyle()} className={classes.paper}>
            <Typography variant="h6" id="modal-title">
              {this.state.deletionStatus
                ? 'Deleted successfully!'
                : 'This Area is associated with a route, and cannot be deleted'}
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
                  onClick={this.onOkClose}
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
              This will delete all the records for this Stop.
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
                  onClick={this.confirmDeleteAoi}
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
              This will delete this student and stop's association.
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
            style={{ height: '450px', padding: 10, overflow: 'auto' }}
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
            {!this.state.selectedArea
              ? this.state.allAreas && (
                  <AoiList
                    aois={this.state.allAreas}
                    onSelectedAoiChange={this.handleAreaChange}
                    onRequestAreaSort={this.handleRequestAreaSort}
                  />
                )
              : (!this.state.selectedAssociatedVehicle ||
                  this.state.confirmDeleteVehicle) && (
                  <AoiDetails
                    aoiName={
                      this.state.selectedArea
                        ? this.state.selectedArea.areaName
                        : null
                    }
                    emails={this.state.email}
                    numbers={this.state.sms}
                    areaQueryActive={this.state.areaQueryActive}
                    aoiType={this.state.areaType}
                    createdOn={this.state.createdOn}
                    onBackPress={this.handleBackPress}
                    saveAlert={this.updateAlertConfigs}
                    addVehicles={this.addVehicles}
                    selectedEntry={this.state.selectedEntry}
                    clearVehicle={this.clearVehicle}
                    assignVehicle={this.state.assignVehicle}
                    vehicles={this.state.vehicles}
                    vehiclesQueryStatus={this.state.vehiclesQueryStatus}
                    selectedVehicle={this.state.selectedVehicle}
                    handleVehicleChange={this.handleVehicleChange}
                    onDeleteAoi={this.handleDeletePress}
                    isAoiEditActive={this.state.isAoiEditActive}
                    onAoiEdit={this.handleAoiEdit}
                    onCancelEditPress={this.handleCancelEditPress}
                    fenceRadius={this.state.radius}
                    onEditedTextChange={this.handleEditedTextChange}
                    onConfirmEditPress={this.handleConfirmEditPress}
                    onViewEditedFence={this.handleViewEditedFence}
                    onAreaTypeChange={this.handleAreaTypeChange}
                    associatedVehicles={this.state.associatedVehicles}
                    onVehicleAssociationDelete={
                      this.handleVehicleAssociationDelete
                    }
                    onSelectedAssociatedVehicle={
                      this.onSelectedAssociatedVehicle
                    }
                  />
                )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Map google={this.props.google} setMap={this.setMap} zoom={6} />
        </Grid>
      </Grid>
    )
  }
}

export default withGoogleMaps(
  withApollo(
    withSharedSnackbar(
      withStyles(styles)((props) => (
        <DownloadProgressDialogConsumer>
          {({ openDialog, closeDialog, isOpen, setDialogTitle }) => (
            <SchoolAoiDashboard
              openDialog={openDialog}
              closeDialog={closeDialog}
              isOpen={isOpen}
              setDialogTitle={setDialogTitle}
              {...props}
            />
          )}
        </DownloadProgressDialogConsumer>
      ))
    )
  )
)
