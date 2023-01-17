/**
 * @module ImmobilizeModule
 * @summary This module exports the component to control Immobilization
 */

import React, { Component } from 'react'
import moment from 'moment'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import {
  Grid,
  Card,
  Typography,
  Switch,
  withStyles,
  Button,
  FormControlLabel,
} from '@material-ui/core'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import ComboBox from '@zeliot/common/ui/ComboBox'
import getLoginId from '@zeliot/common/utils/getLoginId'
import PasswordDialog from './PasswordDialog'
import CommandStatus from './CommandStatus'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

const GET_ALL_VEHICLES = gql`
  query($loginId: Int!) {
    vehicles: getAllVehicleDetails(clientLoginId: $loginId, status: [1, 3]) {
      vehicleNumber
      deviceDetail {
        uniqueDeviceId
      }
    }
  }
`
const GET_DEVICE_MODEL = gql`
  query deviceDetail($uniqueDeviceId: String) {
    deviceDetail(uniqueDeviceId: $uniqueDeviceId) {
      deviceModelId {
        model_name
      }
    }
  }
`

const SEND_COMMAND = gql`
  mutation(
    $uniqueId: String!
    $command: String!
    $password: String!
    $username: String!
  ) {
    updateDeviceCommandsTable(
      uniqueId: $uniqueId
      command: $command
      device_password: $password
      username: $username
    ) {
      message
    }
  }
`

const styles = (theme) => ({
  card: {
    height: 250,
    overflow: 'visible',
  },
  cardContent: {
    padding: 3 * theme.spacing(1),
  },
  fields: {
    padding: theme.spacing(1),
  },
})

/**
 * @summary ImmobilizeModule handles the functionality for Mobilizing/Immobilizing vehicles
 */
class ImmobilizeModule extends Component {
  /**
   * @property {object?} mobilizedSelectedVehicle The selected vehicle to be mobilized
   * @property {object?} immobilizedSelectedVehicle The selected vehicle to be immobilized
   * @property {boolean} forceMobilize Boolean flag to indicate whether vehicle is to be mobilized forcefully
   * @property {boolean} forceImmobilize Boolean flag to indicate whether vehicle is to be immobilized forcefully
   * @property {boolean} isPasswordDialogOpen Boolean to indicate whether password dialog is open
   * @property {string} action The action for the dialog
   * @property {object} currentTime The current time to consider as now
   */
  state = {
    mobilizedSelectedVehicle: null,
    immobilizedSelectedVehicle: null,
    forceMobilize: false,
    forceImmobilize: false,
    isPasswordDialogOpen: false,
    action: '',
    currentTime: moment().unix(),
  }

  /**
   * @callback
   * @param {object} selectedVehicle The vehicle to be mobilized
   * @summary Changes the selected vehicle for mobilization
   */
  handleMobilizeVehicleChange = (selectedVehicle) => {
    this.setState({ mobilizedSelectedVehicle: selectedVehicle })
  }

  /**
   * @callback
   * @param {object} selectedVehicle The vehicle to be immobilized
   * @summary Changes the selected vehicle for immobilization
   */
  handleImmobilizeVehicleChange = (selectedVehicle) => {
    this.setState({ immobilizedSelectedVehicle: selectedVehicle })
  }

  /**
   * @callback
   * @summary Generic change event handler
   */
  handleSwitchChange = (name) => (event) => {
    this.setState({ [name]: event.target.checked })
  }

  /**
   * @function
   * @param {string} password The password to use for sending commands
   * @summary Sends the command for mobilization/immobilization
   */
  sendCommand = async (password) => {
    /* eslint-disable indent */
    let username = localStorage.getItem('username')
    const command =
      this.state.action === 'MOBILIZE'
        ? this.state.forceMobilize
          ? 'MOBILIZE'
          : 'CHECK_SPEED_MOBILIZE'
        : this.state.forceImmobilize
        ? 'IMMOBILIZE'
        : 'CHECK_SPEED_IMMOBILIZE'

    const uniqueId =
      this.state.action === 'MOBILIZE'
        ? this.state.mobilizedSelectedVehicle.uniqueId.toString()
        : this.state.immobilizedSelectedVehicle.uniqueId.toString()

    /* eslint-enable indent */

    const response = await this.props.client.mutate({
      mutation: SEND_COMMAND,
      variables: {
        uniqueId,
        password,
        command,
        username,
      },
      errorPolicy: 'all',
    })

    if (response.data && response.data.updateDeviceCommandsTable) {
      this.setState({ currentTime: moment().unix() + 1 })
      let sendCommand = await this.sendRfidCommand(password)

      this.props.openSnackbar('Command executed successfully!', {
        duration: 10000,
        verticalPosition: 'bottom',
        horizontalPosition: 'left',
        autoHide: true,
      })
    } else {
      console.log('erirwe', response.errors[0].message)
      let error = response.errors[0].message
      // let errorSplit=error.substring(35);
      // errorSplit=errorSplit.trim()
      if (
        error ===
        'Unexpected error value: { message: "Please input correct device password!!", locations: [[Object]], path: ["updateDeviceCommandsTable"], extensions: { code: "INTERNAL_SERVER_ERROR", exception: [Object] } }'
      ) {
        this.props.openSnackbar('Please input correct device password!!', {
          duration: 10000,
          verticalPosition: 'bottom',
          horizontalPosition: 'left',
          autoHide: true,
        })
      } else if (
        error ===
        'Unexpected error value: { message: "Command already exists in DB! Please wait until it completes executing.", locations: [[Object]], path: ["updateDeviceCommandsTable"], extensions: { code: "INTERNAL_SERVER_ERROR", exception: [Object] } }'
      ) {
        this.props.openSnackbar(
          'Command already exists in DB! Please wait until it completes executing.',
          {
            duration: 10000,
            verticalPosition: 'bottom',
            horizontalPosition: 'left',
            autoHide: true,
          }
        )
      } else {
        this.props.openSnackbar('Command not executed successfully', {
          duration: 10000,
          verticalPosition: 'bottom',
          horizontalPosition: 'left',
          autoHide: true,
        })
      }
    }
  }

  modelName = async (uniqueId) => {
    const response = await this.props.client.query({
      query: GET_DEVICE_MODEL,
      variables: {
        uniqueDeviceId: uniqueId,
      },
      errorPolicy: 'all',
    })
    return response.data.deviceDetail.deviceModelId.model_name
  }

  sendRfidCommand = async (password) => {
    /* eslint-disable indent */
    let command
    const uniqueId =
      this.state.action === 'MOBILIZE'
        ? this.state.mobilizedSelectedVehicle.uniqueId.toString()
        : this.state.immobilizedSelectedVehicle.uniqueId.toString()

    let deviceModelName = await this.modelName(uniqueId)

    const uniqueNumber = uniqueId.slice(3)

    if (deviceModelName && deviceModelName !== 'TS101_Advance') {
      command =
        this.state.action === 'MOBILIZE'
          ? this.state.forceMobilize
            ? `1,$1234@${uniqueNumber}%aquila123#SET RFID:1`
            : `1,$1234@${uniqueNumber}%aquila123#SET RFID:1`
          : this.state.forceImmobilize
          ? `1,$1234@${uniqueNumber}%aquila123#SET RFID:0`
          : `1,$1234@${uniqueNumber}%aquila123#SET RFID:0`

      /* eslint-enable indent */

      const response = await this.props.client.mutate({
        mutation: SEND_COMMAND,
        variables: {
          uniqueId,
          password,
          command,
        },
        errorPolicy: 'all',
      })
      if (response.data && response.data.updateDeviceCommandsTable) {
        console.log('Internal Api Suceess')
      } else {
        console.log('Interanl Api Failed', response.errors[0].message)
      }
    }
  }

  /**
   * @callback
   * @summary Handles submitting command
   */
  handleSubmit = async (password) => {
    await this.sendCommand(password)
    this.setState({ isPasswordDialogOpen: false, action: '' })
  }

  render() {
    const {
      classes,
      vehicles,
      uniqueIds,
      languageJson,
      selectedLanguage,
    } = this.props

    return (
      <Grid container spacing={3}>
        <Grid item sm={6}>
          <Card className={classes.card}>
            <Grid container className={classes.cardContent}>
              <Grid item sm={12} className={classes.fields}>
                <Typography color="textSecondary">
                  {
                    languageJson[selectedLanguage].mobilizePage
                      .immobilizeCardTitle
                  }
                </Typography>
              </Grid>
              <Grid item sm={12} className={classes.fields}>
                <ComboBox
                  items={vehicles}
                  selectedItem={this.state.immobilizedSelectedVehicle}
                  onSelectedItemChange={this.handleImmobilizeVehicleChange}
                  placeholder={
                    languageJson[selectedLanguage].common.chooseVehicle
                  }
                  isLoading={false}
                  itemKey="uniqueId"
                  itemToStringKey="vehicleNumber"
                />
              </Grid>
            </Grid>
            <Grid container spacing={1} className={classes.cardContent}>
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  disabled={!this.state.immobilizedSelectedVehicle}
                  onClick={() => {
                    this.setState({
                      isPasswordDialogOpen: true,
                      action: 'IMMOBILIZE',
                    })
                  }}
                >
                  {
                    languageJson[selectedLanguage].mobilizePage
                      .immobilizeButtonTitle
                  }
                </Button>
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      color="primary"
                      checked={this.state.forceImmobilize}
                      onChange={this.handleSwitchChange('forceImmobilize')}
                    />
                  }
                  label={
                    languageJson[selectedLanguage].mobilizePage
                      .forceImmobilizeSwitch
                  }
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>
        <Grid item sm={6}>
          <Card className={classes.card}>
            <Grid container className={classes.cardContent}>
              <Grid item sm={12} className={classes.fields}>
                <Typography color="textSecondary">
                  {
                    languageJson[selectedLanguage].mobilizePage
                      .mobilizeCardTitle
                  }
                </Typography>
              </Grid>
              <Grid item sm={12} className={classes.fields}>
                <ComboBox
                  items={vehicles || []}
                  selectedItem={this.state.mobilizedSelectedVehicle}
                  onSelectedItemChange={this.handleMobilizeVehicleChange}
                  placeholder={
                    languageJson[selectedLanguage].common.chooseVehicle
                  }
                  isLoading={false}
                  itemKey="uniqueId"
                  itemToStringKey="vehicleNumber"
                />
              </Grid>
            </Grid>
            <Grid container spacing={1} className={classes.cardContent}>
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  disabled={!this.state.mobilizedSelectedVehicle}
                  onClick={() => {
                    this.setState({
                      isPasswordDialogOpen: true,
                      action: 'MOBILIZE',
                    })
                  }}
                >
                  {
                    languageJson[selectedLanguage].mobilizePage
                      .mobilizeButtonTitle
                  }
                </Button>
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      color="primary"
                      checked={this.state.forceMobilize}
                      onChange={this.handleSwitchChange('forceMobilize')}
                    />
                  }
                  label={
                    languageJson[selectedLanguage].mobilizePage
                      .forceMobilizeSwitch
                  }
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>
        <PasswordDialog
          open={this.state.isPasswordDialogOpen}
          onClose={() => this.setState({ isPasswordDialogOpen: false })}
          onSubmit={this.handleSubmit}
        />
        <CommandStatus
          currentTime={this.state.currentTime}
          uniqueIds={uniqueIds}
          vehicles={vehicles}
          languageJson={languageJson}
          selectedLanguage={selectedLanguage}
        />
      </Grid>
    )
  }
}

const ImmobilizeWithVehicles = (props) => (
  <Query
    query={GET_ALL_VEHICLES}
    variables={{
      loginId: getLoginId(),
    }}
  >
    {({ loading, data, error, refetch }) => {
      if (loading) {
        return 'Loading ...'
      }
      if (error) {
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Grid container justify="center">
                <Grid item>Failed to fetch this page</Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container justify="center">
                <Grid item>
                  <ColorButton variant="contained" onClick={() => refetch()}>
                    Retry
                  </ColorButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )
      }

      const vehicleObjects = data.vehicles.map((vehicle) => ({
        vehicleNumber: vehicle.vehicleNumber,
        uniqueId: vehicle.deviceDetail.uniqueDeviceId,
      }))

      const uniqueIds = vehicleObjects.map(({ uniqueId }) => uniqueId)

      return (
        <ImmobilizeModule
          {...props}
          vehicles={vehicleObjects}
          uniqueIds={uniqueIds}
        />
      )
    }}
  </Query>
)

export default withStyles(styles)(
  withApollo(withSharedSnackbar(ImmobilizeWithVehicles))
)
