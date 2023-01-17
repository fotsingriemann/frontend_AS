import React, { Component } from 'react'
import { withApollo } from 'react-apollo'
import { Link } from 'react-router-dom'
import withGoogleMaps from '@zeliot/common/hoc/withGoogleMaps'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import SimpleModal from '@zeliot/common/ui/SimpleModal'
import { GET_ALL_AREAS, ADD_AREA } from '@zeliot/common/graphql/queries'
import Map from '@zeliot/core/base/modules/TrackingControls/Maps/Map'
import ConfigurationPanel from './ConfigurationPanel'
import getLoginId from '@zeliot/common/utils/getLoginId'
import gql from 'graphql-tag'
import axios from 'axios'
import { DownloadProgressDialogConsumer } from '@zeliot/common/shared/DownloadProgressDialog/DownloadProgressDialog.context'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'
import {
  Button,
  Grid,
  Divider,
  Typography,
  Modal,
  CircularProgress,
  withStyles,
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

const SUBMIT_AOI_LIST = gql`
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

// Bucket name and file name are static for aoi template
const bucketName = 'excel-templates'
const fileName = 'aoiBulkUploadTemplate.xlsx'

let fence = null
let marker = null
let polygonCoordinates = []

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
  buttonContainer: {
    marginTop: 15,
  },
  rowSpacing: {
    margin: theme.spacing(1),
  },
})

class AoiModule extends Component {
  state = {
    isFence: false,
    modalOpen: false,
    modalField: null,
    map: null,
    radioGeometrySelection: 'circle',
    radioAoiTypeSelection: 'places',
    radius: '',
    latitude: '',
    longitude: '',
    aoiPlace: null,
    aoiCoordinates: null,
    areaName: null,
    allAreas: null,
    placeClear: false,
    instructionModalOpen: false,
    isUploading: false,
    fileName: null,
    bucketName: null,
    publicUploadURL: null,
    uploadSuccess: false,
    openErrorModal: false,
    uploadErrors: null,
  }

  componentDidMount() {
    this.fetchAllAreas()
  }

  fetchAllAreas = async () => {
    const fetchedAreas = await this.props.client.query({
      query: GET_ALL_AREAS,
      variables: {
        clientLoginId: getLoginId(),
      },
    })
    // TODO: Handle error
    // console.log('Get all areas: ', fetchedAreas.data.getAllAreaDetails)
    this.setState({ allAreas: fetchedAreas.data.getAllAreaDetails })
  }

  saveAoiToDb = async () => {
    let createdGeoJson = null

    // Create geoJson
    createdGeoJson = this.createGeoJson()
    // console.log('createdGeoJson', createdGeoJson)

    // // Mutation to send data to backend
    const success = await this.props.client.mutate({
      mutation: ADD_AREA,
      variables: {
        areaTypeId: this.state.radioGeometrySelection === 'circle' ? 2 : 1,
        areaName: this.state.areaName,
        clientLoginId: getLoginId(),
        geoJson: JSON.stringify(createdGeoJson),
        geoPosition:
          this.state.radioGeometrySelection === 'polygon'
            ? JSON.stringify(this.state.aoiCoordinates)
            : null,
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
    if (!success.data.addArea) {
      this.props.openSnackbar(
        'Failed to communicate to server. Please try again'
      )
    } else {
      this.props.openSnackbar('AOI saved!')
    }
  }

  createGeoJson = () => {
    let geoJson = null
    const vertexArray = []
    // console.log('polygon coordinates', polygonCoordinates)
    if (this.state.radioGeometrySelection === 'circle') {
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
        vertexArray.push([index.lat(), index.lng()])
      })
      // First and last point of polygon should be same
      vertexArray.push([
        polygonCoordinates[0].lat(),
        polygonCoordinates[0].lng(),
      ])
      // Save in geoJson
      geoJson = {
        type: 'Polygon',
        coordinates: [vertexArray],
      }
      return geoJson
    }
  }

  setMap = (map) => this.setState({ map })

  onGeometrySelectionChanged = (value) => {
    this.setState({ radioGeometrySelection: value }, () => {
      if (this.state.isFence) {
        if (this.state.radioGeometrySelection === 'circle') {
          this.drawCircularFence()
        } else {
          this.drawPolygonFence()
        }
      }
    })
  }

  handleAoitypeSelectionChange = (value) => {
    this.setState({ radioAoiTypeSelection: value })
    this.onClearPoint()
  }

  onNewPlace = (selectedPlace) =>
    this.setState({ aoiPlace: selectedPlace, placeClear: true })

  getCoordinates = (coordinates) =>
    this.setState({ aoiCoordinates: coordinates }, this.addMarker)

  handleCoordinatesChange = (identifier, value) => {
    if (identifier === 'lat') {
      this.setState({ latitude: value })
    } else {
      this.setState({ longitude: value })
    }
  }

  handleRadiusChange = (radius) => this.setState({ radius })

  addMarker = () => {
    // Clear if marker exists
    this.clearMarker()

    const position = this.state.aoiCoordinates
    // Add new marker
    marker = new this.props.google.maps.Marker({
      position: position,
      map: this.state.map,
      draggable: true,
      animation: this.props.google.maps.Animation.DROP,
    })
    marker.setMap(this.state.map)

    // Set marker drag listener
    marker.addListener('dragstart', this.handleMarkerDragStartEvent)
    marker.addListener('dragend', this.handleMarkerDragEndEvent)

    // Fit bounds
    const bounds = new this.props.google.maps.LatLngBounds()
    bounds.extend(position)
    this.state.map.fitBounds(bounds)
  }

  handleMarkerDragStartEvent = () =>
    // Clear drawn fences
    this.clearFence()

  handleMarkerDragEndEvent = () => {
    const newPosition = marker.getPosition()
    this.setState(
      {
        aoiCoordinates: {
          lat: newPosition.lat(),
          lng: newPosition.lng(),
        },
        latitude: newPosition.lat(),
        longitude: newPosition.lng(),
      },
      () => {
        if (this.state.radioGeometrySelection === 'circle') {
          this.drawCircularFence()
        } else {
          this.drawPolygonFence()
        }
      }
    )
  }

  onViewPoint = () => {
    if (this.state.radioAoiTypeSelection === 'coordinates') {
      this.setState(
        {
          aoiCoordinates: {
            lat: parseFloat(this.state.latitude),
            lng: parseFloat(this.state.longitude),
          },
        },
        () => {
          this.ValidateFenceAndDraw()
        }
      )
    } else {
      this.ValidateFenceAndDraw()
    }
  }

  ValidateFenceAndDraw = () => {
    if (!this.state.radius) {
      this.props.openSnackbar('Provide radius to view fence')
    } else if (this.state.radius < 25) {
      this.props.openSnackbar("Fence can't be shorter than 25 meters")
    } else if (!this.state.aoiCoordinates) {
      this.props.openSnackbar('Provide AOI to view fence')
    } else if (
      !this.state.aoiCoordinates.lat ||
      !this.state.aoiCoordinates.lng
    ) {
      this.props.openSnackbar('Provided coordinates are incomplete')
    } else if (
      this.state.aoiCoordinates.lat < -90 ||
      this.state.aoiCoordinates.lat > 90
    ) {
      this.props.openSnackbar("Provided latitude doesn't seem right")
    } else if (
      this.state.aoiCoordinates.lng < -180 ||
      this.state.aoiCoordinates.lng > 180
    ) {
      this.props.openSnackbar("Provided longitude doesn't seem right")
    } else {
      // Determine kind of fence and plot accordingly
      if (this.state.radioGeometrySelection === 'circle') {
        this.addMarker()
        this.drawCircularFence()
      } else {
        this.addMarker()
        this.drawPolygonFence()
      }
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

  drawPolygonFence = () => {
    this.clearFence()
    this.setState({ isFence: true })
    const position = new this.props.google.maps.LatLng(
      this.state.aoiCoordinates.lat,
      this.state.aoiCoordinates.lng
    )
    this.getPolygon(position, this.state.radius)
    fence.setMap(this.state.map)
  }

  getPolygon = (position, radius) => {
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
      coordinates.push(pointOffset)
    }
    // Get drawn coordinates
    polygonCoordinates = coordinates
    // Fit bounds
    this.state.map.fitBounds(bounds)

    // Construct the polygon.
    const polygonFence = new this.props.google.maps.Polygon({
      editable: true,
      paths: coordinates,
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
        // updated coordinates
        // console.log(
        //   'Edge moved',
        //   polygonFence.getPath(),
        //   polygonFence.getPath().j
        // )
        polygonCoordinates = polygonFence.getPath().g
        fence.setPath(polygonFence.getPath())
      }
    )

    // This listener is fired when vertex is moved
    this.props.google.maps.event.addListener(
      polygonFence.getPath(),
      'set_at',
      () => {
        // updated coordinates
        // console.log(
        //   'Vertex moved',
        //   polygonFence.getPath(),
        //   polygonFence.getPath().j
        // )
        polygonCoordinates = polygonFence.getPath().g
        fence.setPath(polygonFence.getPath())
      }
    )
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
      radius: '',
      aoiPlace: null,
      aoiCoordinates: null,
      latitude: '',
      longitude: '',
      placeClear: false,
    })
    polygonCoordinates = []
  }

  onClearPoint = () => {
    // Clear marker and fence and associated variables
    this.clearFence()
    this.clearMarker()
    this.clearVariables()
  }

  onSavePoint = () => {
    // Call modal for confirmation
    if (!this.state.radius) {
      this.props.openSnackbar('Provide radius to view fence')
    } else if (this.state.radius < 25) {
      this.props.openSnackbar("Fence can't be shorter than 25 meters")
    } else if (!this.state.aoiCoordinates) {
      this.props.openSnackbar('Provide AOI to view fence')
    } else if (
      !this.state.aoiCoordinates.lat ||
      !this.state.aoiCoordinates.lng
    ) {
      this.props.openSnackbar("Provided coordinates doesn't seem right")
    } else {
      this.setState({ modalOpen: true })
    }
  }

  handleModalClose = () => {
    this.setState({ modalOpen: false })
  }

  handleModalFieldNameChange = (name) => {
    this.setState({ modalField: name })
  }

  saveAoiName = () => {
    if (!this.state.modalField || this.state.modalField === '') {
      this.props.openSnackbar('Please enter a name to save')
    } else {
      let nameExists = false
      let i = 0
      for (i = 0; i < this.state.allAreas.length; i++) {
        if (this.state.allAreas[i].areaName === this.state.modalField) {
          nameExists = true
          break
        }
      }
      if (nameExists) {
        this.props.openSnackbar(
          'You already have area configured with this name. Try another one.'
        )
      } else {
        this.setState({ areaName: this.state.modalField }, () => {
          // mutation to server
          this.saveAoiToDb()
          this.handleModalClose()
          this.onClearPoint()
        })
      }
    }
  }

  clearPlaceOnChipDelete = () => {
    this.setState({ placeClear: false, aoiPlace: null })
    this.clearMarker()
  }

  handlebulkUploadAois = () => {
    this.setState({ instructionModalOpen: true })
  }

  handleDownloadTemplate = () => {
    this.props.downloadSampleFile(
      GET_TEMPLATE,
      {
        bucketName: bucketName,
        name: fileName,
        fileType: 'EXCEL',
      },
      ['getPublicDownloadURL'],
      'AOI Template'
    )
  }

  handleUploadAoi = async ({
    target: {
      validity,
      files: [file],
    },
  }) => {
    // TODO: Handle upload errors
    this.setState({ isUploading: true })
    if (validity.valid) {
      const fileExtension = file.name.substring(file.name.lastIndexOf('.') + 1)
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
    // Call adminDB
    const response = await this.props.client.mutate({
      mutation: SUBMIT_AOI_LIST,
      variables: {
        fileInfo: {
          uploadFor: 'AddAreas',
          bucketName: this.state.bucketName,
          fileName: this.state.fileName,
        },
        commonInput: {
          clientLoginId: getLoginId(),
        },
      },
    })
    // console.log('Excel upload response', response)
    if (response.data && response.data.excelFileUpload) {
      const sucessfulEntries =
        response.data.excelFileUpload.successfullyUploaded
      const failedEntries = response.data.excelFileUpload.failedToUpload
      if (response.data.excelFileUpload.failedToUpload === 0) {
        this.props.openSnackbar(
          `Successfully added ${sucessfulEntries} AOI(s).`
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
          `Failed to add AOI(s). ${failedEntries} errors found.`
        )
        this.setState({
          uploadErrors: JSON.parse(
            response.data.excelFileUpload.failedUploadList
          ),
          openErrorModal: true,
          isUploading: false,
          uploadSuccess: false,
          fileName: null,
          bucketName: null,
          publicUploadURL: null,
        })
        // Show error list to users
        this.onOkPress()
      }
    }
  }

  onOkPress = () => {
    this.setState({ instructionModalOpen: false })
  }

  onErrorOkPress = () => {
    this.setState({ openErrorModal: false })
  }

  render() {
    const { classes, selectedLanguage } = this.props

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
              AOI Bulk Failed
            </Typography>
            <Divider />
            <Typography variant="body2" id="modal-title">
              Upload failed due to following reasons.
            </Typography>
            {this.state.uploadErrors &&
              this.state.uploadErrors.map((errors) => {
                const reason = errors.reason
                const failedAt = errors.list
                return (
                  <ul style={{ padding: 5 }}>
                    <li style={{ padding: 5 }}>{reason}</li>
                    {failedAt &&
                      failedAt.map((name) => (
                        <ul style={{ padding: 5 }}>
                          <li>
                            <Typography color="textSecondary">
                              {name}
                            </Typography>
                          </li>
                        </ul>
                      ))}
                  </ul>
                )
              })}
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
              AOI Bulk Upload
            </Typography>
            <Divider />
            <br />
            {!this.state.uploadSuccess ? (
              <div>
                <Typography variant="body2">
                  A template is made available for you to download. You have to
                  fill the template sheet in format defined and upload to
                  generate new AOIs quickly!
                </Typography>
                <br />
                <Typography variant="body2">
                  If you have downloaded the template before, fill the sheet and
                  upload directly.
                </Typography>
              </div>
            ) : (
              <Typography variant="body2">
                List uploaded successfully! Press submit to save these AOIs.
              </Typography>
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
                        onChange={this.handleUploadAoi}
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
              <Grid alignItems="flex-end">
                <Grid item>
                  <Button
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

        <Grid item xs={12}>
          <Typography variant="h5" className={classes.textLeft} gutterBottom>
            {languageJson[selectedLanguage].aoiPage.aoiCreation.pageTitle}
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
                to="/home/AOI"
              >
                {
                  languageJson[selectedLanguage].aoiPage.aoiCreation
                    .goBackButtonTitle
                }
              </Button>
            </Grid>

            <Grid item>
              <Button
                variant="outlined"
                color="primary"
                onClick={this.handlebulkUploadAois}
              >
                {
                  languageJson[selectedLanguage].aoiPage.aoiCreation
                    .bulkCreationButtonTitle
                }
              </Button>
            </Grid>
          </Grid>
        </Grid>

        <Grid item />

        <Grid item xs={12}>
          <Grid container>
            <SimpleModal
              placeholder="Name"
              label="Save AOI as"
              modalOpen={this.state.modalOpen}
              handleModalClose={this.handleModalClose}
              saveAs={this.saveAoiName}
              handleModalFieldNameChange={this.handleModalFieldNameChange}
            />
            <Grid item xs={12} md={4}>
              <ConfigurationPanel
                isFence={this.state.isFence}
                placeClear={this.state.placeClear}
                geometrySelection={this.state.radioGeometrySelection}
                aoiTypeSelection={this.state.radioAoiTypeSelection}
                lat={this.state.latitude}
                lng={this.state.longitude}
                radius={this.state.radius}
                onGeometrySelectionChanged={this.onGeometrySelectionChanged}
                handleAoitypeSelectionChange={this.handleAoitypeSelectionChange}
                onNewPlace={this.onNewPlace}
                getCoordinates={this.getCoordinates}
                handleCoordinatesChange={this.handleCoordinatesChange}
                handleRadiusChange={this.handleRadiusChange}
                clearPlaceOnChipDelete={this.clearPlaceOnChipDelete}
                onViewPoint={this.onViewPoint}
                onClearPoint={this.onClearPoint}
                onSavePoint={this.onSavePoint}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Map google={this.props.google} setMap={this.setMap} zoom={6} />
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
              <AoiModule downloadSampleFile={downloadReport} {...props} />
            )}
          </DownloadProgressDialogConsumer>
        ))
      )
    )
  )
)
