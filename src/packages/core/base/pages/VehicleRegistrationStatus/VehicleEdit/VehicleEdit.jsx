/**
 * @module Vehicles/VehicleEdit
 * @summary This module exports the VehicleEdit component
 */
import React from 'react'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import {
  withStyles,
  Grid,
  Typography,
  TextField,
  Dialog,
  DialogContentText,
  DialogActions,
  DialogContent,
  FormControl,
  DialogTitle,
  Button,
  Select,
  MenuItem,
} from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'

const GET_VEHICLE_DETAILS = gql`
  query getVehicleDetail($entityid: Int) {
    getVehicleDetail(entityId: $entityid) {
      vehicleNumber
      speedSensorType
      speedLimit
      vehicleType
      vehicleModel
      vehicleCapacity
      engineNumber
      chassisNumber
      status
      client {
        loginId
      }
    }
  }
`

const UPDATE_VEHICLE = gql`
  mutation updateApproveStatus(
    $deviceUniqueId_fk: String!
    $vehicleStatus: vehicleStatus
  ) {
    updateApproveStatus(
      deviceUniqueId_fk: $deviceUniqueId_fk
      vehicleStatus: $vehicleStatus
    )
  }
`

const styles = (theme) => ({
  root: {
    padding: theme.spacing(2),
    flexGrow: 1,
  },
  button: {
    display: 'block',
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
})

/**
 * @summary VehicleEdit component renders a modal to edit vehicle details
 */
class VehicleEdit extends React.Component {
  /**
   * @property {string} entityId The entity ID of the vehicle
   * @property {boolean} open Boolean flag to open/close the modal
   * @property {string} vlpn The vehicle number of the vehicle to be edited
   * @property {string} speedSensor The speed sensor type of the vehicle
   * @property {string} speedLimit The speed limit of the vehicle
   * @property {string} vehicleType The type of the vehicle
   * @property {string} vehicleModel The model of the vehicle
   * @property {string} vehicleCapacity The capacity of the vehicle
   * @property {string} status The status of the vehicle
   * @property {string} clientLoginId The login ID of the client
   * @property {string} engineNumber The engine-number of the vehicle
   * @property {string} chassisNumber The chassis-number of the vehicle
   * @property {boolean} installStatus The installation status of the vehicle
   */
  state = {
    entityId: '',
    open: false,
    vlpn: '',
    speedSensor: '',
    speedLimit: '',
    vehicleType: '',
    vehicleModel: '',
    vehicleCapacity: '',
    status: '',
    clientLoginId: '',
    engineNumber: '',
    chassisNumber: '',
    installStatus: false,
    password: '',
    registrationStatus: this.props.vehicleStatus
      ? this.props.vehicleStatus
      : 'PENDING',
  }

  /**
   * @function
   * @param {string} entityId The entity ID of the vehicle
   * @summary Fethces details of vehicle for the given entity ID
   */
  getVehicleDetails = (entityId) => async () => {
    const { data: vehicleDetail } = await this.props.client.query({
      query: GET_VEHICLE_DETAILS,
      variables: {
        entityid: parseInt(entityId, 10),
      },
      fetchPolicy: 'network-only',
    })

    if (vehicleDetail) {
      this.setState({
        entityId: parseInt(entityId, 10),
        vlpn: vehicleDetail.getVehicleDetail.vehicleNumber,
        speedSensor: vehicleDetail.getVehicleDetail.speedSensorType,
        speedLimit: vehicleDetail.getVehicleDetail.speedLimit,
        vehicleType: vehicleDetail.getVehicleDetail.vehicleType,
        vehicleModel: vehicleDetail.getVehicleDetail.vehicleModel,
        vehicleCapacity: vehicleDetail.getVehicleDetail.vehicleCapacity,
        status: vehicleDetail.getVehicleDetail.status,
        clientLoginId: vehicleDetail.getVehicleDetail.client.loginId,
        engineNumber: vehicleDetail.getVehicleDetail.engineNumber,
        chassisNumber: vehicleDetail.getVehicleDetail.chassisNumber,
      })

      if (vehicleDetail.status === 1) {
        this.setState({ installStatus: true })
      }
    }
  }

  /**
   * @function
   * @summary React lifecycle hook called after the component mounts
   */
  componentDidMount() {
    this.getVehicleDetails(this.props.entityId)()
  }

  /**
   * @callback
   * @summary Generic change event handler
   */
  handleChange = (event) => {
    this.setState({ registrationStatus: event.target.value })
  }

  /**
   * @callback
   * @summary Changes the value of the form fields
   */
  handleTextChange = (e) => this.setState({ [e.target.name]: e.target.value })

  /**
   * @callback
   * @summary Opens the modal
   */
  handleClickOpen = () => {
    this.setState({ open: true })
  }

  /**
   * @callback
   * @summary Closes the modal
   */
  handleClose = () => {
    this.setState({ open: false })
  }

  /**
   * @callback
   * @summary Saves the vehicle details
   */
  handleSave = async (event) => {
    if (!this.state.password) {
      this.props.openSnackbar('Please enter the password')
    } else if (this.state.password != 'rto!@#$%') {
      this.props.openSnackbar('Wrong password !', { type: 'error' })
    } else {
      event.preventDefault()

      const response = await this.props.client.mutate({
        mutation: UPDATE_VEHICLE,
        variables: {
          deviceUniqueId_fk: 'it_' + this.props.deviceUniqueId_fk,
          vehicleStatus: this.state.registrationStatus,
        },
        errorPolicy: 'all',
        refetchQueries: ['getAllVehicleDetails'],
      })

      if (response.data === null && response.errors[0].message) {
        this.props.openSnackbar(
          'Something went wrong. Please try again later',
          { type: 'error' }
        )
        this.props.closeModal()
      } else {
        this.props.openSnackbar('Status updated successfully')
        this.props.closeModal()
      }
    }
  }

  render() {
    const { classes } = this.props

    return (
      <div>
        <DialogTitle id="form-dialog-title">
          Vehicle Registration Status
        </DialogTitle>

        <DialogContent>
          <Grid item xs={6}>
            <FormControl
              className={classes.formControl}
              style={{ minWidth: '60%' }}
              fullWidth
            >
              <Select
                value={this.state.registrationStatus}
                onChange={this.handleChange}
              >
                <MenuItem value="PENDING">Pending</MenuItem>

                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="REJECT">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              type="password"
              name="password"
              label="Password"
              required
              style={{
                marginLeft: '7px',
                marginTop: '5px',
              }}
              onChange={this.handleTextChange}
              fullWidth
            />
          </Grid>
        </DialogContent>

        <DialogActions>
          <Grid item>
            <ColorButton
              color="primary"
              variant="contained"
              onClick={this.props.closeModal}
              className={classes.button}
              size="medium"
            >
              Close
            </ColorButton>
          </Grid>
          <Grid item>
            <ColorButton
              color="primary"
              variant="contained"
              onClick={this.handleSave}
              className={classes.button}
              disabled={this.state.vlpn === ''}
              size="medium"
            >
              Update
            </ColorButton>
          </Grid>

          {'   '}
        </DialogActions>
      </div>
    )
  }
}

export default withStyles(styles)(withApollo(withSharedSnackbar(VehicleEdit)))
