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
	Button
} from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

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
  mutation updateVehicleDetail(
    $entityId: Int!
    $vehicleNumber: String!
    $engineNumber: String
    $chassisNumber: String
    $clientLoginId: Int!
    $speedSensorType: String!
    $speedLimit: Int!
    $vehicleType: String!
    $vehcleModel: String!
    $vehicleCapacity: Int
    $isActivated: Boolean
    $status: Int!
  ) {
    updateVehicleDetail(
      entityId: $entityId
      vehicleNumber: $vehicleNumber
      engineNumber: $engineNumber
      chassisNumber: $chassisNumber
      clientLoginId: $clientLoginId
      speedSensorType: $speedSensorType
      speedLimit: $speedLimit
      vehicleType: $vehicleType
      vehicleModel: $vehcleModel
      vehicleCapacity: $vehicleCapacity
      isActivated: $isActivated
      status: $status
    )
  }
`

const styles = theme => ({
	root: {
		padding: theme.spacing(2),
		flexGrow: 1
	},
	button: {
		display: 'block',
		marginTop: theme.spacing(2),
		marginRight: theme.spacing(2)
	},
	formControl: {
		margin: theme.spacing(1),
		minWidth: 120
	}
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
		message: ''
	}

	/**
	 * @function
	 * @param {string} entityId The entity ID of the vehicle
	 * @summary Fethces details of vehicle for the given entity ID
	 */
	getVehicleDetails = entityId => async () => {
		const { data: vehicleDetail } = await this.props.client.query({
			query: GET_VEHICLE_DETAILS,
			variables: {
				entityid: parseInt(entityId, 10)
			},
			fetchPolicy: 'network-only'
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
				chassisNumber: vehicleDetail.getVehicleDetail.chassisNumber
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
	handleChange = event =>
		this.setState({ [event.target.name]: event.target.value })

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
	handleSave = async event => {
		if (this.state.seatLimit === '') {
			this.setState({ seatLimit: null })
		}

		event.preventDefault()

		const { data, errors } = await this.props.client.mutate({
			mutation: UPDATE_VEHICLE,
			variables: {
				vehicleNumber: this.state.vlpn,
				entityId: parseInt(this.state.entityId, 10),
				clientLoginId: parseInt(this.state.clientLoginId, 10),
				speedSensorType: this.state.speedSensor,
				speedLimit: parseInt(this.state.speedLimit, 10),
				vehicleType: this.state.vehicleType,
				vehcleModel: this.state.vehicleModel,
				vehicleCapacity: parseInt(this.state.seatLimit, 10),
				isActivated: this.state.installStatus,
				status: parseInt(this.state.status, 10),
				engineNumber: this.state.engineNumber,
				chassisNumber: this.state.chassisNumber
			},
			errorPolicy: 'all',
			refetchQueries: ['getAllVehicleDetails']
		})

		if (data && data.updateVehicleDetail) {
			this.setState({ message: 'Vehicle Number Updated successfully!' }, () => {
				this.handleClickOpen()
			})
		}
		else {
			this.setState({ message: errors[0].message }, () => {
				this.handleClickOpen()
			})
		}
	}

	render() {
		const { classes } = this.props

		return (
			<div>
				<DialogTitle id="form-dialog-title">Vehicle Number Edit</DialogTitle>

				<DialogContent>
					<FormControl
						className={classes.formControl}
						style={{ minWidth: '60%' }}
					>
						<TextField
							required
							id="standard-required"
							label="Vehicle Number"
							name="vlpn"
							value={this.state.vlpn}
							className={classes.textField}
							margin="normal"
							onChange={this.handleChange}
							helperText="Should be Unique"
						/>
					</FormControl>
				</DialogContent>

				<DialogActions>
					<Grid item>
						<Button
							color="primary"
							variant="contained"
							onClick={this.handleSave}
							className={classes.button}
							disabled={this.state.vlpn === ''}
							size="medium"
						>
							Update
            </Button>
					</Grid>

					{'   '}

					<Grid item>
						<Button
							color="default"
							variant="contained"
							onClick={this.props.closeModal}
							className={classes.button}
							size="medium"
						>
							Close
            </Button>
					</Grid>
				</DialogActions>

				<Grid item>
					<Typography color="textSecondary" variant="subtitle1">
						{this.state.isGroupNameValid === 'NOT_AVAILABLE' &&
							this.state.groupName.length > 4 &&
							this.state.groupName.length < 33
							? 'A Vehicle Number with same name exists'
							: ''}
					</Typography>
				</Grid>

				<Dialog
					open={this.state.open}
					keepMounted
					onClose={this.handleClose}
					aria-labelledby="alert-dialog-slide-title"
					aria-describedby="alert-dialog-slide-description"
				>
					<DialogTitle id="alert-dialog-slide-title">Status</DialogTitle>

					<DialogContent>
						<DialogContentText id="alert-dialog-slide-description">
							{this.state.message}
						</DialogContentText>
					</DialogContent>

					<DialogActions>
						<Button onClick={this.props.closeModal} color="primary">
							Close
            </Button>
					</DialogActions>
				</Dialog>
			</div>
		)
	}
}

export default withStyles(styles)(withApollo(VehicleEdit))
