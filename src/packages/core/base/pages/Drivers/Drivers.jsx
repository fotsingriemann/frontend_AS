/**
 * @module Drivers
 * @summary This module exports the component for Drivers page
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import MUIDataTable from 'mui-datatables'
import { Link, Switch } from 'react-router-dom'
import { Query, withApollo } from 'react-apollo'
import {
  withStyles,
  Button,
  Grid,
  Typography,
  Paper,
  Divider,
  Slider,
  Tooltip,
  Modal,
} from '@material-ui/core'
import { CloudUpload as UploadIcon } from '@material-ui/icons'
import getLoginId from '@zeliot/common/utils/getLoginId'
import AddEditDriver from './AddEditDriver'
import DriverBulkUpload from './DriverBulkUpload'
import { PrivateRoute } from '@zeliot/common/router'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'
import FullScreenLoader from 'packages/common/ui/Loader/FullScreenLoader'

const GET_ALL_DRIVERS = gql`
  query allDrivers($userLoginId: Int, $clientLoginId: Int) {
    allDrivers(userLoginId: $userLoginId, clientLoginId: $clientLoginId) {
      id
      driverName
      license
      contactNumber
      rfid
      vehicleNumber
      createdAt
      status
      score
      vehicleObject {
        vehicleNumber
      }
    }
  }
`

const UPDATE_SCORING_WEIGHTS = gql`
  mutation($clientLoginId: Int!, $weights: JSON!) {
    updateDriverWeightsForClient(
      clientLoginId: $clientLoginId
      weights: $weights
    )
  }
`

const GET_SCORING_WEIGHTS = gql`
  query($loginId: Int!) {
    clientDetail(loginId: $loginId) {
      weights
    }
  }
`

const GET_ACC_TYPE = gql`
  query loginDetail($loginId: Int) {
    loginDetail(loginId: $loginId) {
      accountType
    }
  }
`

const GET_CLIENT_ID = gql`
  query userDetail($loginId: Int) {
    userDetail(loginId: $loginId) {
      client {
        loginId
      }
    }
  }
`

const DEACTIVATE_DRIVER = gql`
  mutation deactivateDriver($driverId: Int!) {
    deactivateDriver(driverId: $driverId)
  }
`

const ACTIVATE_DRIVER = gql`
  mutation activateDriver($driverId: Int!) {
    activateDriver(driverId: $driverId)
  }
`

const styles = (theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  slider: {
    width: '100%',
  },
  paperOne: {
    padding: theme.spacing(1),
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

//sets the driver index for each row
let index = null

/**
 * @summary Drivers component renders the page for driver management
 */
class Drivers extends Component {
  driverId = []

  /**
   * @property {number} overSpeedWt The weightage of Overpeed for driver score computation
   * @property {number} harshAccelWt The weightage of Harsh Acceleration for driver score computation
   * @property {number} harshBrakeWt The weightage of Harsh braking for driver score computation
   * @property {number} idlingWt The weightage of Idling for driver score computation
   * @property {boolean} wtEditMode Whether edit mode is on for weightage
   * @property {boolean} wtAvailable Whether weightage is available
   * @property {number?} userLoginId The user's login ID
   * @property {number?} clientLoginId The client login ID of the user
   * @property {boolean} deactivateModal deactivate prompt modal open
   *  @property {boolean} deactivateConfirmed deactivate confirm modal open
   * @property {boolean} deactivateStatus deactivate api status check
   *  @property {boolean} activateModal activate prompt modal open
   *  @property {boolean} activateConfirmed activate confirm modal open
   * @property {boolean} activateStatus activate api status check
   * @property {boolean} editModal edit modal open
   */
  state = {
    overSpeedWt: 1.0,
    harshAccelWt: 1.0,
    harshBrakeWt: 1.0,
    idlingWt: 1.0,
    wtEditMode: false,
    wtAvailable: false,
    userLoginId: null,
    clientLoginId: null,
    deactivateModal: false,
    deactivateConfirmed: false,
    deactivateStatus: false,
    activateModal: false,
    activateConfirmed: false,
    activateStatus: false,
    editModal: false,
    isLoading: true,
    fetchedDriverData: [],
  }

  /**
   * @callback
   * @summary Change the value of sliders
   */
  handleChange = (name) => (event, value) => {
    this.setState({ [name]: Number(value.toFixed(1)) })
  }

  /**
   * @callback
   * @summary Enables/Disables edit mode for driver score weightage
   */
  handleModeChange = (client) => async (event) => {
    if (this.state.wtEditMode === true) {
      // create JSON object of weights
      event.preventDefault()
      await client.mutate({
        mutation: UPDATE_SCORING_WEIGHTS,
        variables: {
          clientLoginId: getLoginId(),
          weights: {
            overSpeedWt: this.state.overSpeedWt,
            harshAccelWt: this.state.harshAccelWt,
            harshBrakeWt: this.state.harshBrakeWt,
            idlingWt: this.state.idlingWt,
          },
        },
      })
      this.setState({ wtEditMode: false })
    } else {
      this.setState({ wtEditMode: true })
    }
  }

  /**
   * @function
   * @summary Fetches the account type
   */
  getAccountType = async () => {
    const accTypeResult = await this.props.client.query({
      query: GET_ACC_TYPE,
      variables: {
        loginId: getLoginId(),
      },
    })
    this.setState(
      { accType: accTypeResult.data.loginDetail.accountType },
      () => {
        if (this.state.accType === 'UL') {
          this.setState({ userLoginId: getLoginId() })
          this.getClientLoginId()
        } else {
          this.setState({ clientLoginId: getLoginId() })
        }
      }
    )
  }

  /**
   * @function
   * @summary Fetches the client login ID
   */
  getClientLoginId = async () => {
    const getClientId = await this.props.client.query({
      query: GET_CLIENT_ID,
      variables: {
        loginId: getLoginId(),
      },
    })
    this.setState({ clientLoginId: getClientId.data.userDetail.client.loginId })
  }

  /**
   * @function
   * @summary Cancels the edit mode
   */
  cancelEditMode = () => {
    this.setState({ wtEditMode: false })
  }

  /**
   * @summary The columns of the table of drivers
   */
  columns = [
    'Driver Name',
    'License Number',
    'Contact Number',
    'RFID Number',
    'Current Vehicle Driven',
    'Assigned Vehicles',
    'Driver Score (100)',
    'Status',
    {
      options: {
        customBodyRender: (e, tableData) => {
          if (tableData.rowData[7] == 'ACTIVE') {
            return (
              <Button
                onClick={this.handleDeactivateDriver}
                variant="contained"
                color="primary"
              >
                DEACTIVATE
              </Button>
            )
          } else {
            return (
              <Button
                onClick={this.handleActivateDriver}
                variant="contained"
                color="primary"
              >
                ACTIVATE
              </Button>
            )
          }
        },
      },
    },
    {
      options: {
        customBodyRender: (e, tableData) => {
          if (tableData.rowData[7] == 'ACTIVE') {
            return (
              <Button
                onClick={this.handleEditDriver}
                variant="contained"
                color="primary"
              >
                EDIT
              </Button>
            )
          } else {
            return 'N/A'
          }
        },
      },
    },
  ]

  /**
   * @summary The options for the table of drivers
   */
  options = {
    selectableRows: 'none',
    responsive: 'scrollMaxHeight',
    rowsPerPage: 5,
    onRowClick: (rowData, { dataIndex }) => {
      // console.log('dataIndex', dataIndex)
      index = dataIndex
      // this.props.history.push({
      //   pathname: '/home/manage-drivers/' + this.driverId[dataIndex],
      // })
    },
    sort: false,
    print: false,
    download: true,
    filter: false,
    viewColumns: false,
  }

  /**
   * @summary Fetches the scoring weights
   */
  requestScoringWeights = async () => {
    const fetchedWeights = await this.props.client.query({
      query: GET_SCORING_WEIGHTS,
      variables: {
        loginId: getLoginId(),
      },
    })

    if (fetchedWeights.data.clientDetail.weights) {
      this.setState({
        wtAvailable: true,
        overSpeedWt: fetchedWeights.data.clientDetail.weights.overSpeedWt,
        harshAccelWt: fetchedWeights.data.clientDetail.weights.harshAccelWt,
        harshBrakeWt: fetchedWeights.data.clientDetail.weights.harshBrakeWt,
        idlingWt: fetchedWeights.data.clientDetail.weights.idlingWt,
      })
    }
  }

  /**
   * @function
   * @summary handles deactivate modal open
   */

  handleDeactivateDriver = () => {
    // console.log('handleDeactivateDriver')
    this.setState({
      deactivateModal: true,
    })
  }

  /**
   * @function
   * @summary handles deactivate modal close
   */

  handleDeactivateModalClose = () => {
    this.setState({
      deactivateModal: false,
    })
  }

  /**
   * @function
   * @summary calls the deactivate api
   */
  confirmDeleteDriver = async () => {
    this.handleDeactivateModalClose()
    await this.deactivateDriverById()
  }

  /**
   * @function
   * @summary deactivates the driver by driver id
   */

  deactivateDriverById = async () => {
    // console.log('driverId is', this.driverId[index])
    const deactivateResult = await this.props.client.mutate({
      mutation: DEACTIVATE_DRIVER,
      variables: {
        driverId: this.driverId[index],
        // driverId: 465,
      },
    })
    // console.log('deactivateResult', deactivateResult)
    if (deactivateResult && deactivateResult.data) {
      this.setState({
        deactivateConfirmed: true,
        deactivateStatus: true,
      })
    }
  }

  /**
   * @function
   * @summary handles confirm modal close
   */

  handleOkClose = () => {
    this.setState({ deactivateConfirmed: false })
    window.location.reload()
  }
  ////////////////////////////////////////////////////////////////////////

  /**
   * @function
   * @summary handles activate modal open
   */

  handleActivateDriver = () => {
    // console.log('handleActivateDriver')
    this.setState({
      activateModal: true,
    })
  }

  /**
   * @function
   * @summary handles activate modal close
   */

  handleActivateModalClose = () => {
    this.setState({
      activateModal: false,
    })
  }

  /**
   * @function
   * @summary calls the activate api
   */

  confirmActivateDriver = async () => {
    this.handleActivateModalClose()
    await this.activateDriverById()
  }

  /**
   * @function
   * @summary activates the driver by driver id
   */

  activateDriverById = async () => {
    // console.log('driverId is', this.driverId[index])
    const deactivateResult = await this.props.client.mutate({
      mutation: ACTIVATE_DRIVER,
      variables: {
        driverId: this.driverId[index],
        // driverId: 465,
      },
    })
    // console.log('deactivateResult', deactivateResult)
    if (deactivateResult && deactivateResult.data) {
      this.setState({
        activateConfirmed: true,
        activateStatus: true,
      })
    }
  }

  /**
   * @function
   * @summary handles confirm modal close
   */

  handleOkActivateClose = () => {
    this.setState({ activateConfirmed: false })
    window.location.reload()
  }
  ////////////////////////////////////////////////////

  /**
   * @function
   * @summary handles edit modal open
   */
  handleEditDriver = () => {
    // console.log('handleEditDriver')
    this.setState({
      editModal: true,
    })
  }

  /**
   * @function
   * @summary handles edit modal close
   */
  handleEditModalClose = () => {
    this.setState({
      editModal: false,
    })
  }

  /**
   * @function
   * @summary handles edit cofirm  modal open and call the edit driver fn
   */

  confirmEditDriver = async () => {
    this.handleEditModalClose()
    await this.editDriverOpenById()
  }

  /**
   * @function
   * @summary redirects to edit
   */

  editDriverOpenById = async () => {
    // console.log(' index is', index)
    // console.log(' driverId is', this.driverId)
    // console.log('edit driverId is', this.driverId[index])
    this.props.history.push({
      pathname: '/home/manage-drivers/' + this.driverId[index],
    })
  }

  /**
   * @param {object[]} drivers The array of driver objects
   * @summary Converts array of driver objects to an array of arrays
   */
  mapToArr(drivers) {
    let rowData = []
    const fullData = []
    this.driverId = []
    drivers.forEach((element) => {
      rowData = []
      let vehicles = element.vehicleObject
      let vehicleNumbers

      if (vehicles.length > 0) {
        let vehicleArray = vehicles.flatMap((obj) => obj.vehicleNumber)
        vehicleNumbers = vehicleArray.toString()
      } else {
        vehicleNumbers = 'N/A'
      }
      // console.log('status is')
      // let statusButton
      // let editButton
      // if (element.status === 1) {
      //   statusButton = (
      //     <ColorButton
      //       variant="contained"
      //       color="primary"
      //       onClick={this.handleDeactivateDriver}
      //     >
      //       Deactivate
      //     </ColorButton>
      //   )

      //   editButton = (
      //     <ColorButton
      //       variant="contained"
      //       color="primary"
      //       onClick={this.handleEditDriver}
      //     >
      //       Edit
      //     </ColorButton>
      //   )
      // } else {
      //   statusButton = (
      //     <ColorButton
      //       // component={Link}
      //       variant="contained"
      //       color="primary"
      //       // to="/home/manage-drivers/add"
      //       onClick={this.handleActivateDriver}
      //     >
      //       Activate
      //     </ColorButton>
      //   )

      //   editButton = 'N/A'
      // }

      this.driverId.push(element.id)
      rowData.push(element.driverName)
      rowData.push(element.license)
      rowData.push(element.contactNumber)
      rowData.push(element.rfid ? element.rfid : 'N/A')
      rowData.push(element.vehicleNumber ? element.vehicleNumber : 'N/A')
      rowData.push(vehicleNumbers)
      rowData.push(element.score ? element.score.toFixed(2) : 'N/A')
      // rowData.push(statusButton)
      // rowData.push(editButton)
      if (element.status == 1) {
        rowData.push('ACTIVE')
      } else {
        rowData.push('INACTIVE')
      }
      fullData.push(rowData)
    })

    return fullData
  }

  getAllDrivers = async () => {
    const { loading, errors, data } = await this.props.client.query({
      query: GET_ALL_DRIVERS,
      variables: {
        userLoginId: this.state.userLoginId,
        clientLoginId: this.state.clientLoginId,
      },
      fetchPolicy: 'network-only',
    })

    if (errors) return `Error!: ${errors}`

    if (data) {
      this.setState({
        fetchedDriverData: this.mapToArr(data.allDrivers),
        isLoading: false,
      })
    }
  }

  /**
   * @summary React component lifecycle method called after the component mounts
   */
  async componentDidMount() {
    await this.requestScoringWeights()
    await this.getAccountType()
    await this.getAllDrivers()
  }

  render() {
    const { classes, selectedLanguage } = this.props
    const {
      overSpeedWt,
      harshAccelWt,
      harshBrakeWt,
      idlingWt,
      wtEditMode,
      wtAvailable,
      clientLoginId,
      isLoading,
      fetchedDriverData,
    } = this.state
    return isLoading ? (
      <FullScreenLoader />
    ) : (
      <div className={classes.root}>
        {/* Deactivation confirmation modal */}
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.deactivateConfirmed}
          onClose={this.handleOkClose}
        >
          <div style={getModalStyle()} className={classes.paper}>
            <Typography variant="h6" id="modal-title">
              {this.state.deactivateStatus
                ? 'Driver Deactivated successfully!'
                : 'Some Error Occured'}
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

        {/* Deactivate prompt modal */}
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.deactivateModal}
          onClose={this.handleDeactivateModalClose}
        >
          <div style={getModalStyle()} className={classes.paper}>
            <Typography variant="h6" id="modal-title">
              Are you sure want to deactivate the driver?
            </Typography>
            <Typography variant="subtitle1" id="simple-modal-description">
              This will deassign all your vehicles
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
                  onClick={this.handleDeactivateModalClose}
                >
                  Cancel
                </ColorButton>
              </Grid>
              <Grid item>
                <ColorButton
                  style={styles.button}
                  color="primary"
                  variant="contained"
                  onClick={this.confirmDeleteDriver}
                >
                  Confirm
                </ColorButton>
              </Grid>
            </Grid>
          </div>
        </Modal>

        {/* Activation confirmation modal */}
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.activateConfirmed}
          onClose={this.handleOkActivateClose}
        >
          <div style={getModalStyle()} className={classes.paper}>
            <Typography variant="h6" id="modal-title">
              {this.state.activateStatus
                ? 'Driver Activated successfully!'
                : 'Some Error Occured'}
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
                  onClick={this.handleOkActivateClose}
                >
                  Ok
                </ColorButton>
              </Grid>
            </Grid>
          </div>
        </Modal>

        {/* Activate prompt modal */}
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.activateModal}
          onClose={this.handleActivateModalClose}
        >
          <div style={getModalStyle()} className={classes.paper}>
            <Typography variant="h6" id="modal-title">
              Are you sure want to activate the driver?
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
                  onClick={this.handleActivateModalClose}
                >
                  Cancel
                </ColorButton>
              </Grid>
              <Grid item>
                <ColorButton
                  style={styles.button}
                  color="primary"
                  variant="contained"
                  onClick={this.confirmActivateDriver}
                >
                  Confirm
                </ColorButton>
              </Grid>
            </Grid>
          </div>
        </Modal>

        {/* edit prompt modal */}
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.editModal}
          onClose={this.handleEditModalClose}
        >
          <div style={getModalStyle()} className={classes.paper}>
            <Typography variant="h6" id="modal-title">
              Are you sure want to edit the driver?
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
                  onClick={this.handleEditModalClose}
                >
                  No
                </ColorButton>
              </Grid>
              <Grid item>
                <ColorButton
                  style={styles.button}
                  color="primary"
                  variant="contained"
                  onClick={this.confirmEditDriver}
                >
                  Yes
                </ColorButton>
              </Grid>
            </Grid>
          </div>
        </Modal>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid
              container
              spacing={2}
              justify="space-between"
              alignItems="center"
            >
              <Grid item>
                <Typography variant="h5">
                  {languageJson[selectedLanguage].driversPage.pageTitle}
                </Typography>
              </Grid>

              <Grid item>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item>
                    <ColorButton
                      component={Link}
                      variant="contained"
                      color="primary"
                      to="/home/manage-drivers/add"
                    >
                      {
                        languageJson[selectedLanguage].driversPage
                          .addDriverButtonTitle
                      }
                    </ColorButton>
                  </Grid>

                  <Grid item>
                    <ColorButton
                      component={Link}
                      variant="contained"
                      size="small"
                      to="/home/manage-drivers/upload"
                    >
                      <UploadIcon />
                    </ColorButton>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <MUIDataTable
                  data={fetchedDriverData}
                  // columns={
                  //   languageJson[selectedLanguage].driversPage
                  //     .driversTableColumn
                  // }
                  columns={this.columns}
                  options={this.options}
                />
              </Grid>

              <Grid item xs={12}>
                <Grid container spacing={3} justify="space-between">
                  <Grid item xs={12}>
                    <Typography variant="h5">Scoring Matrix</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Paper className={classes.paperOne}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        The following weights are used for calculation of driver
                        scores. Each parameter can be weighed between 0 and 1. A
                        weight of 0 means, the event won't be considered for
                        scoring
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography id="label1">
                        Overspeeding - {overSpeedWt}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Slider
                        classes={{ root: classes.slider }}
                        value={overSpeedWt}
                        min={0}
                        max={1}
                        step={0.1}
                        onChange={this.handleChange('overSpeedWt')}
                        aria-labelledby="label1"
                        disabled={!wtEditMode}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography id="label2">
                        Harsh Acceleration - {harshAccelWt}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Slider
                        classes={{ root: classes.slider }}
                        value={harshAccelWt}
                        min={0}
                        max={1}
                        step={0.1}
                        onChange={this.handleChange('harshAccelWt')}
                        aria-labelledby="label2"
                        disabled={!wtEditMode}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography id="label3">
                        Harsh Braking - {harshBrakeWt}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Slider
                        classes={{ root: classes.slider }}
                        value={harshBrakeWt}
                        min={0}
                        max={1}
                        step={0.1}
                        onChange={this.handleChange('harshBrakeWt')}
                        aria-labelledby="label3"
                        disabled={!wtEditMode}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography id="label4">Idling - {idlingWt}</Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Slider
                        classes={{ root: classes.slider }}
                        value={idlingWt}
                        min={0}
                        max={1}
                        step={0.1}
                        onChange={this.handleChange('idlingWt')}
                        aria-labelledby="label4"
                        disabled={!wtEditMode}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      {wtAvailable ? (
                        <div>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={this.handleModeChange(this.props.client)}
                          >
                            {wtEditMode ? 'Apply' : 'Edit'}
                          </Button>

                          {wtEditMode ? (
                            <Button size="small" onClick={this.cancelEditMode}>
                              Cancel
                            </Button>
                          ) : null}
                        </div>
                      ) : null}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    )
  }
}

Drivers.propTypes = {
  classes: PropTypes.object.isRequired,
}

const WrappedDrivers = withLanguage(withStyles(styles)(withApollo(Drivers)))

export default () => (
  <Switch>
    <PrivateRoute
      exact
      path="/home/manage-drivers"
      render={(props) => <WrappedDrivers {...props} />}
    />
    <PrivateRoute
      exact
      path="/home/manage-drivers/upload"
      render={(props) => <DriverBulkUpload {...props} />}
    />
    <PrivateRoute
      exact
      path="/home/manage-drivers/:driverId"
      render={(props) => <AddEditDriver {...props} />}
    />
  </Switch>
)
