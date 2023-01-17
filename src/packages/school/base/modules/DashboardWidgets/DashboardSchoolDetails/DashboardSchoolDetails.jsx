import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withApollo } from 'react-apollo'
import { Search } from '@material-ui/icons'
import withGoogleMaps from '@zeliot/common/hoc/withGoogleMaps'
import MapDialog from '@zeliot/common/ui/MapDialog'
import gql from 'graphql-tag'
import getLoginId from '@zeliot/common/utils/getLoginId'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import EditIcon from '@material-ui/icons/EditLocation'
import AdminEdit from '@material-ui/icons/Edit'
import LocationIcon from '@material-ui/icons/LocationCity'
import AdminIcon from '@material-ui/icons/Person'
import ComboBox from '@zeliot/common/ui/ComboBox'
import { getItem } from '../../../../../../storage.js'
import {
  Grid,
  CircularProgress,
  Paper,
  withStyles,
  Menu,
  MenuItem,
  Typography,
  TextField,
  Button,
  // TablePagination,
  // Table,
  // TableHead,
  // TableBody,
  // TableRow,
  // TableCell,
  InputAdornment,
  Input,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Modal
} from '@material-ui/core'

const GET_ALL_SCHOOLS = gql`
  query getAllSchools($id: Int!) {
    getAllSchools(clientLoginId: $id) {
      address
      schoolId
      schoolName
      schoolArea {
        areaType {
          areaTypeName
        }
        geoJson
        geoPosition
      }
      userDetails {
        id
        userName
        login {
          loginId
        }
      }
    }
  }
`

const CREATE_SCHOOL = gql`
  mutation createEditSchool(
    $clientLoginId: Int!
    $schoolName: String!
    $areaTypeId: Int!
    $geoJson: String
    $geoPosition: String
    $schoolId: Int
    $userLoginId: Int
    $address: String
  ) {
    createEditSchool(
      schoolId: $schoolId
      clientLoginId: $clientLoginId
      schoolName: $schoolName
      areaTypeId: $areaTypeId
      geoJson: $geoJson
      geoPosition: $geoPosition
      userLoginId: $userLoginId
      address: $address
    )
  }
`

const SUBLOGINS = gql`
  query allUserDetails($clientLoginId: Int) {
    allUserDetails(clientLoginId: $clientLoginId) {
      login {
        loginId
      }
      userName
    }
  }
`

const style = theme => ({
  statsTitle: {
    fontSize: 16,
    textAlign: 'center',
    verticalAlign: 'middle'
  },
  icon: {
    fontSize: 34,
    textAlign: 'center',
    color: '#FFFFFF'
  },
  textLeft: {
    textAlign: 'left'
  },
  textRight: {
    textAlign: 'right'
  },
  textMiddle: {
    verticalAlign: 'middle'
  },
  paper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    borderRadius: 10
    // minHeight: '320px'
  },
  modalPaper: {
    position: 'absolute',
    width: theme.spacing(50),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4)
  },
  topCard: {
    textAlign: 'center',
    padding: theme.spacing(2),
    verticalAlign: 'middle'
  },
  textCenter: {
    textAlign: 'center'
  },
  cardHeader: {
    padding: theme.spacing(2)
  },
  mapDialogButtonsContainer: {
    paddingTop: theme.spacing(2)
  },
  button: {
    margin: theme.spacing(1)
  },
  tableSearch: {
    padding: theme.spacing(1),
    justifyContent: 'space-between'
  }
})

let fence = null
let polygonCoordinates = null

function getModalStyle() {
  const top = 50
  const left = 50

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`
  }
}

class DashboardSchoolDetails extends Component {
  state = {
    students: null,
    vehicles: null,
    clientDetail: null,
    isMapOpen: false,
    map: null,
    center: {
      lat: 12.9716,
      lng: 77.5946
    },
    zoom: 15,

    allSchools: [],
    selectedSchoolIndex: null,
    savedSchoolsCount: 0,
    schoolAddress: '',
    schoolName: '',

    aoiCoordinates: { lat: 12.9716, lng: 77.5946 },
    areaType: 'Circle',
    radius: 100,
    isFence: false,
    anchorEl: null,
    schoolId: null,
    searchText: '',
    accountType: 'CLT', // Assuming the account type to be main login by default
    openModal: false,
    admins: null,
    selectedAdmin: null
  }

  static propTypes = {
    classes: PropTypes.object.isRequired
  }

  markerPosition = null

  componentDidMount = () => {
    this.getAccountType()
    this.geocoder = new this.props.google.maps.Geocoder()
    this.marker = new this.props.google.maps.Marker({
      position: this.state.center,
      draggable: true
    })
    // get initial location
    this.markerPosition = this.marker.getPosition()
    // Get marker location everytime marker is dragged
    this.marker.addListener('dragend', () => {
      this.markerPosition = this.marker.getPosition()
      this.clearFence()
    })
    this.getAllSchools()
    this.getSublogins()
  }

  getSublogins = async () => {
    const allUsers = await this.props.client.query({
      query: SUBLOGINS,
      variables: {
        clientLoginId: getLoginId()
      }
    })
    if (allUsers.data && allUsers.data.allUserDetails) {
      this.setState({ admins: allUsers.data.allUserDetails })
    }
  }

  getAccountType = async () => {
    const accountType = getItem('accountType', 'PERSISTENT')
    this.setState({ accountType })
  }

  getAllSchools = async () => {
    this.setState({ isLoading: true })
    const fetchedDetails = await this.props.client.query({
      query: GET_ALL_SCHOOLS,
      variables: {
        id: getLoginId()
      }
    })

    if (fetchedDetails.data && fetchedDetails.data.getAllSchools.length > 0) {
      this.setState({
        savedSchoolsCount: fetchedDetails.data.getAllSchools.length,
        allSchools: fetchedDetails.data.getAllSchools,
        isLoading: false
      })
    } else {
      this.props.openSnackbar('No schools registered yet')
      this.setState({
        savedSchoolsCount: 0,
        isLoading: false,
        allSchools: [
          {
            schoolName: 'School Name',
            address:
              'Set the location of school by tapping the icon on the right'
          }
        ]
      })
    }
  }

  handleMapOpen = id => {
    let index = 0
    this.state.allSchools.forEach((school, i) => {
      if (school.schoolId === id) {
        index = i
      }
    })
    this.setState({ selectedSchoolIndex: index, isMapOpen: true })
  }

  handleMapClose = () => this.setState({ isMapOpen: false })

  handleLocationChange = () => {
    if (this.state.schoolName === '') {
      this.props.openSnackbar('Please fill all mandatory fields.')
    } else {
      this.handleMapClose()
      this.saveSchoolToDb()
    }
  }

  setMap = map => {
    let receivedGeoJson = null
    let polygonCenter = null
    let areaType = null
    this.setState({ map }, () => {
      if (
        this.state.savedSchoolsCount > 0 &&
        this.state.selectedSchoolIndex < this.state.savedSchoolsCount
      ) {
        console.log(
          'in existing school',
          this.state.savedSchoolsCount,
          this.state.selectedSchoolIndex
        )
        if (!this.state.allSchools[this.state.selectedSchoolIndex].schoolArea) {
          this.props.openSnackbar('Address not provided for this school')
        } else {
          receivedGeoJson = JSON.parse(
            this.state.allSchools[this.state.selectedSchoolIndex].schoolArea
              .geoJson
          )
          polygonCenter = JSON.parse(
            this.state.allSchools[this.state.selectedSchoolIndex].schoolArea
              .geoPosition
          )
          areaType =
            this.state.allSchools[this.state.selectedSchoolIndex].schoolArea
              .areaType.areaTypeName === 'Circular'
              ? 'Circle'
              : 'Polygon'
        }
        const schoolName = this.state.allSchools[this.state.selectedSchoolIndex]
          .schoolName
        const schoolAddress = this.state.allSchools[
          this.state.selectedSchoolIndex
        ].address
        const schoolId = this.state.allSchools[this.state.selectedSchoolIndex]
          .schoolId

        this.setState(
          {
            areaType,
            schoolName,
            schoolId,
            schoolAddress
          },
          () => {
            if (this.state.areaType) {
              this.decodeGeoJson(receivedGeoJson, polygonCenter)
              this.drawMarker()
              this.drawAllFences()
            }
          }
        )
      } else {
        console.log('in new school')
        // Draw marker on default center
        this.markerPosition = new this.props.google.maps.LatLng({
          lat: this.state.center.lat,
          lng: this.state.center.lng
        })

        this.setState({ areaType: 'Circle', schoolName: '' }, () => {
          this.drawMarker()
        })
      }
    })
  }

  drawMarker = () => {
    this.marker.setMap(null)
    this.marker.setOptions({
      position: this.markerPosition,
      draggable: true
    })
    this.marker.setMap(this.state.map)
  }

  addNewSchool = () => {
    this.setState({
      allSchools: [
        {
          schoolId: 'New',
          schoolName: 'School Name',
          address:
            'Set the location of school by tapping the icon on the right',
          default: true
        },
        ...this.state.allSchools
      ]
    })
  }

  handleNameChange = name => event => {
    this.setState({
      [name]: event.target.value
    })
  }

  decodeGeoJson = (receivedGeoJson, polygonCenter) => {
    const geoJson = receivedGeoJson
    if (geoJson.type === 'Circle') {
      this.markerPosition = new this.props.google.maps.LatLng({
        lat: geoJson.coordinates[0],
        lng: geoJson.coordinates[1]
      })
      this.setState({
        aoiCoordinates: {
          lat: geoJson.coordinates[0],
          lng: geoJson.coordinates[1]
        },
        radius: geoJson.radius
      })
    } else {
      const coordinates = geoJson.coordinates[0]
      const formattedcoordinates = []
      this.markerPosition = new this.props.google.maps.LatLng(polygonCenter)
      coordinates.forEach(point => {
        formattedcoordinates.push({
          lat: point[0],
          lng: point[1]
        })
      })
      const radius = this.calculatePolygonRadius(
        polygonCenter,
        formattedcoordinates[0]
      )
      polygonCoordinates = formattedcoordinates
      this.setState({
        radius: radius,
        aoiCoordinates: polygonCenter
      })
    }
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

  saveSchoolToDb = async () => {
    let createdGeoJson = null
    // Create geoJson
    createdGeoJson = this.createGeoJson()

    // Mutation to send data to backend
    /* eslint-disable indent */
    const success = await this.props.client.mutate({
      mutation: CREATE_SCHOOL,
      variables: {
        schoolId: this.state.schoolId,
        areaTypeId: this.state.areaType === 'Circle' ? 2 : 1,
        schoolName: this.state.schoolName,
        address: this.state.schoolAddress,
        clientLoginId: getLoginId(),
        geoJson: JSON.stringify(createdGeoJson),
        geoPosition:
          this.state.areaType === 'Polygon'
            ? JSON.stringify({
                lat: this.markerPosition.lat(),
                lng: this.markerPosition.lng()
              })
            : null
      },
      refetchQueries: [
        {
          query: GET_ALL_SCHOOLS,
          variables: {
            id: getLoginId()
          }
        }
      ],
      awaitRefetchQueries: true
    })

    /* eslint-enable indent */

    if (!success.data.createEditSchool) {
      this.props.openSnackbar(
        'Failed to communicate to server. Please try again'
      )
      this.setState({ schoolAddress: '', schoolName: '', radius: 100 })
    } else {
      this.props.openSnackbar('Details saved!')
      this.setState({ schoolAddress: '', schoolName: '', radius: 100 })
      this.getAllSchools()
    }
  }

  createGeoJson = () => {
    let geoJson = null
    const vertexArray = []

    if (this.state.areaType === 'Circle') {
      geoJson = {
        type: 'Circle',
        radius: this.state.radius,
        coordinates: [this.markerPosition.lat(), this.markerPosition.lng()]
      }
      return geoJson
    } else {
      // Create polygon coordinates
      polygonCoordinates.forEach(index => {
        vertexArray.push([index.lat, index.lng])
      })
      // First and last point of polygon should be same
      vertexArray.push([polygonCoordinates[0].lat, polygonCoordinates[0].lng])
      // Save in geoJson
      geoJson = {
        type: 'Polygon',
        coordinates: [vertexArray]
      }
      return geoJson
    }
  }

  handleRadiusChange = radius => {
    this.setState({ radius })
  }

  drawAllFences = () => {
    if (this.state.areaType === 'Circle') {
      this.drawCircularFence()
    } else {
      this.drawPolygonFence(this.state.radius)
    }
  }

  handleAreaTypeChange = areaType => {
    this.handleClose()
    this.setState({ areaType }, () => {
      if (this.state.areaType === 'Circle') {
        this.drawCircularFence()
      } else {
        this.drawPolygonFence(this.state.radius)
      }
    })
  }

  clearFence = () => {
    if (fence) {
      fence.setMap(null)
      fence = null
      this.setState({ isFence: false })
    }
  }

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
      center: this.markerPosition,
      radius: parseFloat(this.state.radius)
    })

    // Record this fence
    fence = circularFence

    // Fit bounds
    let coordinate = null
    const bounds = new this.props.google.maps.LatLngBounds()
    const position = new this.props.google.maps.LatLng(
      this.markerPosition.lat(),
      this.markerPosition.lng()
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
          this.handleRadiusChange(parseFloat(radius).toFixed(3))
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

  drawPolygonFence = radius => {
    this.clearFence()

    this.setState({ isFence: true })
    const position = new this.props.google.maps.LatLng({
      lat: this.markerPosition.lat(),
      lng: this.markerPosition.lng()
    })
    this.getPolygon(position, radius)
    fence.setMap(this.state.map)
  }

  getPolygon = (position, radius) => {
    const bounds = new this.props.google.maps.LatLngBounds()
    if (radius && this.state.schoolId) {
      // This is a hexagon for now
      const coordinates = []
      let pointOffset = null
      for (let angle = -90; angle < 270; angle += 60) {
        pointOffset = this.props.google.maps.geometry.spherical.computeOffset(
          position,
          radius,
          angle
        )
        coordinates.push({ lat: pointOffset.lat(), lng: pointOffset.lng() })
      }
      // Get drawn coordinates
      polygonCoordinates = coordinates
    }

    // Construct the polygon.
    const polygonFence = new this.props.google.maps.Polygon({
      editable: true,
      paths: polygonCoordinates,
      strokeColor: '#000000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#0000FF',
      fillOpacity: 0.35
    })

    // Store this fence
    fence = polygonFence

    // Calculate bounds
    polygonCoordinates.forEach(points => {
      bounds.extend(points)
    })
    this.state.map.fitBounds(bounds)

    // This listener is fired when edge is moved
    this.props.google.maps.event.addListener(
      polygonFence.getPath(),
      'insert_at',
      () => {
        const unformattedCoordinates = polygonFence.getPath().j
        const formattedCoordinates = []
        unformattedCoordinates.forEach(point => {
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
        const unformattedCoordinates = polygonFence.getPath().j
        const formattedCoordinates = []
        unformattedCoordinates.forEach(point => {
          formattedCoordinates.push({ lat: point.lat(), lng: point.lng() })
        })
        polygonCoordinates = formattedCoordinates
        fence.setPath(polygonFence.getPath())
      }
    )
  }

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget })
  }

  handleClose = () => {
    this.setState({ anchorEl: null })
  }

  handleSearchTextChange = e =>
    this.setState({ searchText: e.target.value, page: 0 })

  handleModalOpen = id => {
    let index = 0
    this.state.allSchools.forEach((school, i) => {
      if (school.schoolId === id) {
        index = i
      }
    })
    this.setState({ openModal: true, selectedSchoolIndex: index })
    if (this.state.allSchools[index].userDetails) {
      this.setState({
        selectedAdmin: {
          id: this.state.allSchools[index].userDetails.login.loginId,
          userName: this.state.allSchools[index].userDetails.userName
        }
      })
    } else {
      this.setState({ selectedAdmin: null })
    }
  }

  onOkPress = () => {
    this.setState({ openModal: false, selectedAdmin: null })
  }

  onAdminChange = async () => {
    /* eslint-disable indent */

    const areaType = this.state.allSchools[this.state.selectedSchoolIndex]
      .schoolArea
      ? this.state.allSchools[this.state.selectedSchoolIndex].schoolArea
          .areaType.areaTypeName === 'Circular'
        ? 'Circle'
        : 'Polygon'
      : 'Circle'
    // Mutation to send data to backend
    const success = await this.props.client.mutate({
      mutation: CREATE_SCHOOL,
      variables: {
        schoolId: this.state.allSchools[this.state.selectedSchoolIndex]
          .schoolId,
        areaTypeId: areaType === 'Circle' ? 2 : 1,
        schoolName: this.state.allSchools[this.state.selectedSchoolIndex]
          .schoolName,
        address: this.state.schoolAddress,
        clientLoginId: getLoginId(),
        geoJson: this.state.allSchools[this.state.selectedSchoolIndex]
          .schoolArea
          ? this.state.allSchools[this.state.selectedSchoolIndex].schoolArea
              .geoJson
          : null,
        geoPosition: this.state.allSchools[this.state.selectedSchoolIndex]
          .schoolArea
          ? this.state.allSchools[this.state.selectedSchoolIndex].schoolArea
              .geoPosition
          : null,
        userLoginId: this.state.selectedAdmin
          ? this.state.selectedAdmin.id
          : null
      },
      refetchQueries: [
        {
          query: GET_ALL_SCHOOLS,
          variables: {
            id: getLoginId()
          }
        }
      ],
      awaitRefetchQueries: true
    })

    /* eslint-enable indent */

    if (!success.data.createEditSchool) {
      this.props.openSnackbar(
        'Failed to communicate to server. Please try again'
      )
      this.setState({ schoolAddress: '', schoolName: '', radius: 100 })
    } else {
      this.props.openSnackbar('Details saved!')
      this.setState({ schoolAddress: '', schoolName: '', radius: 100 })
      this.getAllSchools()
    }
    this.onOkPress()
  }

  handleSelectedAdminChange = admin => {
    if (admin) {
      this.setState({
        selectedAdmin: { id: admin.login.loginId, userName: admin.userName }
      })
    } else this.setState({ selectedAdmin: admin })
  }

  render() {
    const { classes } = this.props
    const { searchText, isLoading, allSchools } = this.state

    const filteredSchools = allSchools.filter(allSchools =>
      allSchools.schoolName.toLowerCase().includes(searchText.toLowerCase())
    )

    return (
      <Grid container>
        {/* Admin edit modal */}
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.openModal}
          onClose={() => this.onOkPress}
        >
          <div style={getModalStyle()} className={classes.modalPaper}>
            <Typography variant="h6" id="modal-title">
              Change admin for this school?
            </Typography>
            <Divider />

            <Grid container spacing={2} style={{ padding: 10 }}>
              <Grid item xs={12} lg={12}>
                <ComboBox
                  items={this.state.admins}
                  selectedItem={this.state.selectedAdmin}
                  onSelectedItemChange={this.handleSelectedAdminChange}
                  placeholder="Choose Admin"
                  isLoading={false}
                  itemKey="id"
                  itemToStringKey="userName"
                />
              </Grid>

              <Grid item xs={12} lg={12}>
                <Grid
                  container
                  justify="space-between"
                  className={classes.buttonContainer}
                >
                  <Grid item>
                    <Button
                      color="default"
                      variant="outlined"
                      onClick={this.onOkPress}
                    >
                      Cancel
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      color="secondary"
                      variant="outlined"
                      onClick={this.onAdminChange}
                    >
                      Done
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
        </Modal>

        <Grid item xs={12} sm={12} lg={12}>
          {isLoading && <CircularProgress />}

          <Grid container className={classes.tableSearch}>
            {!isLoading && (
              <Grid item>
                <Input
                  value={searchText}
                  onChange={this.handleSearchTextChange}
                  placeholder="Search schools"
                  startAdornment={
                    <InputAdornment>
                      <Search />
                    </InputAdornment>
                  }
                />
              </Grid>
            )}
            {/* eslint-disable indent */
            this.state.accountType === 'CLT' &&
              this.state.allSchools.length > 0 &&
              !this.state.allSchools[this.state.allSchools.length - 1]
                .default && (
                <Grid item>
                  <Button
                    onClick={this.addNewSchool}
                    variant="outlined"
                    color="secondary"
                  >
                    Add another school
                  </Button>
                </Grid>
              )
            /* eslint-enable indent */
            }
          </Grid>

          <Grid container>
            {filteredSchools.length > 0 &&
              filteredSchools.map((school, index) => (
                <Grid item sm={4} style={{ padding: 10 }} key={index}>
                  <Paper
                    square
                    elevation={6}
                    className={classes.paper}
                    key={index}
                  >
                    <Grid
                      container
                      justify="space-between"
                      alignItems="center"
                      spacing={1}
                    >
                      <Grid item xs={12}>
                        <Grid
                          container
                          justify="space-between"
                          alignItems="center"
                        >
                          <Grid item>
                            <Typography
                              variant="h5"
                              className={classes.textLeft}
                              gutterBottom
                              color="textSecondary"
                            >
                              {school.schoolName}
                            </Typography>
                          </Grid>
                        </Grid>
                        <Divider />
                      </Grid>
                      <Grid item xs={12}>
                        <List dense>
                          <ListItem>
                            <ListItemIcon>
                              <LocationIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary="Location"
                              secondary={school.address ? school.address : 'NA'}
                            />

                            <ListItemSecondaryAction>
                              <IconButton
                                aria-label="Edit"
                                onClick={() =>
                                  this.handleMapOpen(school.schoolId)
                                }
                              >
                                <EditIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        </List>
                      </Grid>
                      <Grid item xs={12}>
                        <List dense>
                          <ListItem>
                            <ListItemIcon>
                              <AdminIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary="Operator"
                              secondary={
                                school.userDetails
                                  ? school.userDetails.userName
                                  : 'Not assigned'
                              }
                            />

                            <ListItemSecondaryAction>
                              <IconButton
                                aria-label="Edit"
                                onClick={() =>
                                  this.handleModalOpen(school.schoolId)
                                }
                              >
                                <AdminEdit />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        </List>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            <MapDialog
              open={this.state.isMapOpen}
              onClose={this.handleMapClose}
              setMap={this.setMap}
              map={this.state.map}
              zoom={this.state.zoom}
              center={this.state.center}
            >
              <Grid
                container
                justify="space-between"
                alignItems="center"
                spacing={3}
                className={classes.mapDialogButtonsContainer}
              >
                <Grid item>
                  <Grid container alignItems="center" spacing={3}>
                    <Grid item>
                      <Typography color="textSecondary">Area type</Typography>
                      <Button
                        aria-owns={
                          this.state.anchorEl ? 'simple-menu' : undefined
                        }
                        aria-haspopup="true"
                        onClick={this.handleClick}
                        variant="outlined"
                      >
                        {this.state.areaType}
                      </Button>
                      <Menu
                        id="simple-menu"
                        anchorEl={this.state.anchorEl}
                        open={Boolean(this.state.anchorEl)}
                        onClose={this.handleClose}
                      >
                        <MenuItem
                          onClick={() => this.handleAreaTypeChange('Circle')}
                        >
                          Circle
                        </MenuItem>
                        <MenuItem
                          onClick={() => this.handleAreaTypeChange('Polygon')}
                        >
                          Polygon
                        </MenuItem>
                      </Menu>
                    </Grid>

                    <Grid item>
                      <TextField
                        id="radius_in_meters"
                        label="Radius of fence (m)"
                        value={this.state.radius}
                        onChange={event =>
                          this.handleRadiusChange(event.target.value)
                        }
                        type="number"
                        className={classes.textField}
                        margin="normal"
                        placeholder="School Radius"
                      />
                    </Grid>
                    <Grid item>
                      <TextField
                        id="School name"
                        label="School Name"
                        required
                        className={classes.textField}
                        value={this.state.schoolName}
                        onChange={this.handleNameChange('schoolName')}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item>
                      <TextField
                        id="School address"
                        label="School Address"
                        // required
                        className={classes.textField}
                        value={this.state.schoolAddress}
                        onChange={this.handleNameChange('schoolAddress')}
                        margin="normal"
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <Grid container alignItems="center" spacing={3}>
                    <Grid item>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => this.drawAllFences()}
                      >
                        View
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button onClick={this.handleMapClose}>Cancel</Button>
                    </Grid>
                    <Grid item>
                      <Button
                        variant="outlined"
                        color="primary"
                        disabled={!this.state.isFence}
                        onClick={() => this.handleLocationChange()}
                      >
                        Save
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </MapDialog>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

export default withGoogleMaps(
  withSharedSnackbar(withApollo(withStyles(style)(DashboardSchoolDetails)))
)
