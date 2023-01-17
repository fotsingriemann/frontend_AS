/**
 * @module Account
 * @summary This module is the Account Page
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Link, Switch } from 'react-router-dom'
import { Query, Mutation, withApollo } from 'react-apollo'
import {
  CircularProgress,
  withStyles,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  InputAdornment,
  FormGroup,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Modal,
  Divider,
  Radio,
  FormControlLabel,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
} from '@material-ui/core'
import {
  AccountCircle as AccountCircleIcon,
  Mail as MailIcon,
  ContactPhone,
  Person,
  LocationOn,
  LocationCity,
  Business,
  VpnKey,
  ViewCompact as TotalIcon,
  GridOn as RegisteredIcon,
  GridOff as UnregisteredIcon,
  Assignment as StudentListIcon,
} from '@material-ui/icons'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import WidgetCard from '@zeliot/common/ui/WidgetCard'
import { THEME_MAIN_COLORS as COLOR_RANGE } from '@zeliot/common/constants/styles'
import getLoginId from '@zeliot/common/utils/getLoginId'
import ComboBox from '@zeliot/common/ui/ComboBox'
import { PrivateRoute } from '@zeliot/common/router'
import SmsHistory from './SmsHistory'
import IconWrapper from './IconWrapper'
import { getItem } from '../../../../../storage.js'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
import { TRIP_STATUS_TYPES } from '@zeliot/common/constants/others'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

const GET_CLIENT = gql`
  query clientDetail($loginId: Int) {
    clientDetail(loginId: $loginId) {
      id
      clientName
      contactPerson
      address
      city
      state {
        name
      }
      country {
        name
      }
      login {
        username
      }
      email
      contactNumber
      totalAssignedVehicle
    }
  }
`

const CHANGE_PASSWORD = gql`
  mutation changeUsernamePassword(
    $newUsername: String!
    $newPassword: String!
  ) {
    changeUsernamePassword(newUsername: $newUsername, newPassword: $newPassword)
  }
`

const CHECK_OLD_PASSWORD = gql`
  query login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
    }
  }
`

const GET_LOGIN_DETAILS = gql`
  query loginDetail($loginId: Int) {
    loginDetail(loginId: $loginId) {
      username
      accountType
    }
  }
`

const GET_ASSIGNED_DEVICES = gql`
  query($clientId: Int!) {
    getClientDeviceStock(clientLoginId: $clientId) {
      totalAssignedDevice
      totalRegisteredDevice
      totalUnRegisteredDevice
    }
  }
`

const GET_SMS_BALANCE = gql`
  query getSMSBalanceDetails($loginId: Int) {
    getSMSBalanceDetails(toLoginId: $loginId) {
      smsBalance
    }
  }
`

const GET_ALL_VEHICLES = gql`
  query($clientLoginId: Int, $status: [Int!]) {
    getAllVehicleDetails(clientLoginId: $clientLoginId, status: $status) {
      entityId
      vehicleNumber
    }
  }
`

// const GET_ALL_TRIPS = gql`
//   query($clientLoginId: Int!) {
//     getAllTrips(clientLoginId: $clientLoginId) {
//       tripid
//       tripName
//     }
//   }
// `


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

//////////////////////////////////////////////////////////

const GET_ALL_STUDENTS = gql`
  query(
    $clientLoginId: Int
    $pickupTripId: [Int]
    $dropTripId: [Int]
    $pickupVehicleId: Int
    $dropVehicleId: Int
  ) {
    getAllStudents(
      clientLoginId: $clientLoginId
      pickupTripId: $pickupTripId
      dropTripId: $dropTripId
      pickupVehicleId: $pickupVehicleId
      dropVehicleId: $dropVehicleId
    ) {
      studentId
      studentName
      contactNumber
      secondaryContactNumber
    }
  }
`

const GET_ASSIGNED_ALERTS = gql`
  query($clientLoginId: Int!) {
    getAllSchoolAlertsAssigned(clientLoginId: $clientLoginId) {
      alerts {
        alertId
        alertType
      }
      sms_status
      email_status
    }
  }
`

const ASSIGN_ALERTS = gql`
  mutation($clientLoginId: Int!, $configAlerts: [configAlerts!]!) {
    assignSchoolAlertsToClient(
      clientLoginId: $clientLoginId
      configAlerts: $configAlerts
    )
  }
`

const SEND_BULK_SMS = gql`
  mutation($parentNumbers: [String]!, $content: String!) {
    sendBreakDownSMStoParents(
      parentNumbers: $parentNumbers
      content: $content
    ) {
      message
    }
  }
`

const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  button: {
    margin: theme.spacing(1),
  },
  input: {
    display: 'none',
  },
  modalPaper: {
    position: 'absolute',
    width: theme.spacing(50),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
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

/**
 * @summary Page component to view account details/settings
 */
class ViewCustomer extends Component {
  /**
   * @property {boolean} open State variable to open/clos changePassword dialog
   * @property {string} newUsername State variable to store new username
   * @property {string} newPassword State variable to store new password
   * @property {string} confirmPassword State variable that stores the password confiramtion field
   * @property {string} oldPassword State variable that stores the old password field
   * @property {string} username State variable storing username field
   * @property {string} accountType Account type field
   * @property {string|number} smsBalance The SMS balance count
   * @property {object} stock The device stock counter object
   * @property {string} plan The user's plan
   * @property {boolean} openModal Track modal's open status
   * @property {string} customMessage The custom message to be displayed
   * @property {string} radioSelection A string describing what can be selected in radios
   * @property {object[]} vehicles The list of vehicles assigned to the client
   * @property {object[]} trips The list of trips
   * @property {object} selectedVehicle The selected vehicle
   * @property {object} selectedRoute The selected route
   * @property {string} tripType The type of the trip
   * @property {object} anchorEl The anchor ref
   * @property {object[]} allStudents List of all students
   * @property {number} pickupTripId Trip id of the pickup trip
   * @property {number} dropTripId Trip id of the drop trip
   * @property {number} pickupVehicleId Vehicle ID of the pickup trip
   * @property {number} dropVehicleId Vehicle ID of the drop trip
   * @property {boolean} openListModal Variable to control visibility of list modal
   * @property {number[]} checked The array containing checked items
   * @property {boolean} openAlertSettingsModal Boolean to control opening of Alert settings modal
   * @property {object[]} smsEnabled Array containing alerts with sms enabled
   * @property {object[]} emailEnabled Array containing alerts with email enabled
   * @property {object[]} configurableAlerts Array of configurable alerts
   * @property {object} selectedTripType
   */
  state = {
    open: false,
    newUsername: '',
    newPassword: '',
    confirmPassword: '',
    oldPassword: '',
    username: '',
    accountType: '',
    smsBalance: '',
    stock: {
      totalAssignedDevice: 0,
      totalRegisteredDevice: 0,
      totalUnRegisteredDevice: 0,
    },
    plan: '',
    openModal: false,
    customMessage: '',
    radioSelection: 'all',
    vehicles: null,
    trips: null,
    selectedVehicle: null,
    selectedRoute: null,
    tripType: 'Pickup',
    anchorEl: null,
    allStudents: null,
    pickupTripId: null,
    dropTripId: null,
    pickupVehicleId: null,
    dropVehicleId: null,
    openListModal: false,
    checked: [],
    openAlertSettingsModal: false,
    smsEnabled: [],
    emailEnabled: [],
    configurableAlerts: [],
    selectedTripType: TRIP_STATUS_TYPES[0],
  }

  /**
   * @function
   * @summary Fetches configurable alerts for the client
   */
  getAlertConfigurations = async () => {
    const alertConfigurations = await this.props.client.query({
      query: GET_ASSIGNED_ALERTS,
      variables: {
        clientLoginId: getLoginId(),
      },
    })
    if (
      alertConfigurations.data &&
      alertConfigurations.data.getAllSchoolAlertsAssigned
    ) {
      this.setState({
        configurableAlerts: alertConfigurations.data.getAllSchoolAlertsAssigned,
      })
    }
  }

  /**
   * @callback
   * @summary Callback called on click of menu
   */
  handleMenuClick = (event) => {
    this.setState({ anchorEl: event.currentTarget })
  }

  /**
   * @callback
   * @summary Callback called on close of menu
   */
  handleMenuClose = () => {
    this.setState({ anchorEl: null })
  }

  /**
   * @callback
   * @summary Callback called for opening modal
   */
  handleOpen = () => this.setState({ open: true })

  /**
   * @callback
   * @summary Redirects to support.aquilatrack.com
   */

  //  process.env.REACT_APP_SUPPORT_URL
  // 'https://data.africtrack.com/web/login?redirect=%2Frequests'
  handleSupport = () => {
    window.open(process.env.REACT_APP_SUPPORT_URL)
  }

  /**
   * @callback
   * @summary Callback called for closing modal
   */
  handleClose = () => this.setState({ open: false })

  /**
   * @function
   * @summary Redirect to edit page
   */
  editCustomer = (e) => {
    this.props.history.push({
      pathname: '/home/customers/edit',
      state: {
        clientId: this.clientId,
      },
    })
  }

  /**
   * @function
   * @summary Fetches students list
   */
  getAllStudents = async () => {
    const fetchedStudents = await this.props.client.query({
      query: GET_ALL_STUDENTS,
      variables: {
        clientLoginId: getLoginId(),
        pickupVehicleId: this.state.pickupVehicleId,
        dropVehicleId: this.state.dropVehicleId,
        pickupTripId: this.state.pickupTripId
          ? [this.state.pickupTripId]
          : null,
        dropTripId: this.state.dropTripId ? [this.state.dropTripId] : null,
      },
    })

    if (fetchedStudents.data && fetchedStudents.data.getAllStudents) {
      const allStudents = fetchedStudents.data.getAllStudents
      const checked = allStudents.map((student) => student.studentId)
      const contactList = allStudents.map((student) => student.contactNumber)
      if (allStudents.length > 0) {
        this.setState({ allStudents, checked, contactList })
      } else this.setState({ openListModal: false })
    } else {
      this.setState({ openListModal: false })
    }
  }

  /**
   * @function
   * @summary Navigates to vehicle registration page
   */
  handleRegistration = (e) => {
    this.props.history.push({
      pathname: '/home/customer/vehicle/register',
      state: { clientId: this.clientId },
    })
  }

  /**
   * @function
   * @summary Fetches login details
   */
  getLoginDetails = async () => {
    const fetchLoginDetails = await this.props.client.query({
      query: GET_LOGIN_DETAILS,
      variables: {
        loginId: getLoginId(),
      },
    })

    this.setState({
      username: fetchLoginDetails.data.loginDetail.username,
      accountType: fetchLoginDetails.data.loginDetail.accountType,
    })
  }

  /**
   * @function
   * @summary Fetches all vehicles assigned to the client
   */
  getAllVehicles = async () => {
    const fetchedVehicles = await this.props.client.query({
      query: GET_ALL_VEHICLES,
      variables: {
        clientLoginId: getLoginId(),
        status: [1],
      },
    })
    if (fetchedVehicles.data && fetchedVehicles.data.getAllVehicleDetails) {
      this.setState({ vehicles: fetchedVehicles.data.getAllVehicleDetails })
    }
  }

  /**
   * @function
   * @summary Fetches all routes
   */
  getAllRoutes = async () => {
    const fetchedRoutes = await this.props.client.query({
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

    if (fetchedRoutes.data && fetchedRoutes.data.getAllTrips) {
      this.setState({ trips: fetchedRoutes.data.getAllTrips })
    }
  }

  /**
   * @callback
   * @summary Callback called on changing vehicle selection
   */
  handleVehicleChange = (selectedVehicle) => {
    this.setState({ selectedVehicle })
  }

  /**
   * @callback
   * @summary Callback called on changing route selection
   */
  handleRouteChange = (selectedRoute) => {
    this.setState({ selectedRoute })
  }

  /**
   * @callback
   * @summary Callback called on changing trip selection
   */
  handleTripChange = (selectedTrip) => {
    this.setState({ selectedTrip })
  }

  /**
   * @function
   * @summary Fetches client's SMS balance details
   */
  getSmsBalance = async () => {
    const fetchSmsDetails = await this.props.client.query({
      query: GET_SMS_BALANCE,
      variables: {
        loginId: getLoginId(),
        accountType: this.state.accountType,
      },
    })

    if (fetchSmsDetails.data.getSMSBalanceDetails === null) {
      this.setState({ smsBalance: 0 })
    } else {
      this.setState({
        smsBalance: fetchSmsDetails.data.getSMSBalanceDetails.smsBalance,
      })
    }
  }

  /**
   * Compares new password with the new password confirmation and calls password change mutation
   * @callback
   * @summary Handles saving new password
   */
  handleSave = (changePassword) => async (e) => {
    if (this.state.newPassword !== this.state.confirmPassword) {
      this.props.openSnackbar('Passwords are not matching!', {
        duration: 10000,
        verticalPosition: 'bottom',
        horizontalPosition: 'left',
        autoHide: true,
      })
    } else {
      const { data } = await this.props.client.query({
        query: CHECK_OLD_PASSWORD,
        variables: {
          password: this.state.oldPassword,
          username: this.state.username,
        },
        errorPolicy: 'all',
      })

      if (data.login !== null) {
        e.preventDefault()
        await changePassword({
          variables: {
            newUsername: this.state.username,
            newPassword: this.state.newPassword,
          },
        })

        this.handleClose()
        this.props.openSnackbar('Password changed Sucessfuly!', {
          duration: 10000,
          verticalPosition: 'bottom',
          horizontalPosition: 'left',
          autoHide: true,
        })
      } else {
        this.props.openSnackbar('You are not Authorized!', {
          duration: 10000,
          verticalPosition: 'bottom',
          horizontalPosition: 'left',
          autoHide: true,
        })
      }
    }
  }

  /**
   * @callback
   * @param {object} e React.SyntheticEvent object
   * @summary Handles change of any form field
   */
  handleFormChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    })
  }

  /**
   * @function
   * @summary Fetches client's device stock details
   */
  getClientStockDetails = async () => {
    const fetchStockDetails = await this.props.client.query({
      query: GET_ASSIGNED_DEVICES,
      variables: {
        clientId: getLoginId(),
      },
    })

    this.setState({ stock: fetchStockDetails.data.getClientDeviceStock })
  }

  /**
   * After the component mounts, calls methods to fetch Plan, Login Details,
   * Client device stock details, SMS balance & alert configurations
   * @function
   * @summary Function called after the component mounts
   */
  componentDidMount() {
    this.getPlan()
    this.getLoginDetails()
    this.getClientStockDetails()
    this.getSmsBalance()
    this.getAlertConfigurations()
  }

  /**
   * @function
   * @summary Fetches user's plan
   */
  getPlan = () => {
    const plan = getItem('plan', 'PERSISTENT')
    const accountType = getItem('accountType', 'PERSISTENT')
    this.setState({ plan, accountType })
  }

  /**
   * @callback
   * @summary Callback called on clicking `Bulk SMS` button which fetches all routes & vehicles
   */
  handleSMS = () => {
    this.getAllRoutes()
    this.getAllVehicles()
    this.setState({ openModal: true })
  }

  /**
   * @callback
   * @summary Callback called on clicking on student list submit button
   */
  onOkPress = () => {
    this.setState({
      openModal: false,
      selectedRoute: null,
      selectedVehicle: null,
      tripType: 'PICKUP',
    })
  }

  /**
   * @callback
   * @summary Callback called on Bulk message input change
   */
  handleBulkMessageChange = (event) => {
    this.setState({ customMessage: event.target.value })
  }

  /**
   * @callback
   * @summary Callback called on radio input change
   */
  handleRadioChange = (event) => {
    this.setState({
      radioSelection: event.target.value,
      allStudents: null,
      selectedTrip: null,
      selectedVehicle: null,
    })
  }

  /**
   * @callback
   * @summary Callback called to show students list
   */
  handleStudentListing = () => {
    if (this.state.radioSelection === 'few') {
      if (this.state.selectedTrip && this.state.selectedVehicle) {
        if (this.state.customMessage !== '') {
          let pickupTripId = null
          let dropTripId = null
          let pickupVehicleId = null
          let dropVehicleId = null
          if (this.state.tripType === 'Pickup') {
            pickupTripId = this.state.selectedTrip.tripId
            pickupVehicleId = this.state.selectedVehicle.entityId
          } else {
            dropTripId = this.state.selectedTrip.tripId
            dropVehicleId = this.state.selectedVehicle.entityId
          }
          this.setState(
            { pickupTripId, dropTripId, pickupVehicleId, dropVehicleId },
            () => {
              this.getAllStudents()
              this.openListModal()
            }
          )
        } else {
          this.props.openSnackbar('Please provide a message')
        }
      } else {
        this.props.openSnackbar("Choose all fields to view student's list")
      }
    } else {
      this.getAllStudents()
      this.openListModal()
    }
  }

  /**
   * @function
   * @summary Opens student list modal
   */
  openListModal = () => {
    this.setState({ openListModal: true })
  }

  /**
   * @function
   * @summary Closes student list modal
   */
  closeListModal = () => {
    this.setState({ openListModal: false })
  }

  /**
   * @callback
   * @summary Calls a mutation to send an SMS alert
   */
  handleSMSAlert = async () => {
    const response = await this.props.client.mutate({
      mutation: SEND_BULK_SMS,
      variables: {
        parentNumbers: this.state.contactList,
        content: this.state.customMessage,
      },
    })

    if (response.data) {
      this.closeListModal()
      this.props.openSnackbar('SMS sent!')
      this.setState({
        customMessage: '',
        radioSelection: 'all',
        selectedTrip: null,
        selectedVehicle: null,
      })
    } else {
      this.closeListModal()
      this.props.openSnackbar('Failed to send SMS')
      this.setState({
        customMessage: '',
        radioSelection: 'all',
        selectedTrip: null,
        selectedVehicle: null,
      })
    }
  }

  /**
   * @callback
   * @summary Callback to handle toggling of students' list
   */
  handleToggle = (value) => () => {
    const checked = this.state.checked
    const contactList = this.state.contactList
    const currentIndex = checked.indexOf(value.studentId)
    const newChecked = [...checked]
    const newContactList = [...contactList]

    if (currentIndex === -1) {
      newChecked.push(value.studentId)
      newContactList.push(value.contactNumber)
    } else {
      newChecked.splice(currentIndex, 1)
      newContactList.splice(currentIndex, 1)
    }

    this.setState({ checked: newChecked, contactList: newContactList })
  }

  /**
   * @function
   * @summary Opens the alert settings modal
   */
  openAlertSettings = () => {
    const smsEnabled = []
    const emailEnabled = []
    this.state.configurableAlerts.forEach((alert, index) => {
      smsEnabled[index] = { value: alert.sms_status, id: alert.alerts.alertId }
      emailEnabled[index] = {
        value: alert.email_status,
        id: alert.alerts.alertId,
      }
    })
    this.setState({ smsEnabled, emailEnabled, openAlertSettingsModal: true })
  }

  /**
   * @function
   * @summary Closes the alert settings modal
   */
  closeAlertSettings = () => {
    this.setState({ openAlertSettingsModal: false })
  }

  /**
   * @function
   * @summary Calls a mutation to save alert configurations
   */
  configureAlerts = async () => {
    const alertConfigs = []
    this.state.smsEnabled.forEach((item, index) => {
      alertConfigs.push({
        alertId: item.id,
        smsAlert: item.value,
        emailAlert: this.state.emailEnabled[index].value,
      })
    })

    const isAlertConfigured = await this.props.client.mutate({
      mutation: ASSIGN_ALERTS,
      variables: {
        clientLoginId: getLoginId(),
        configAlerts: alertConfigs,
      },
      refetchQueries: [
        {
          query: GET_ASSIGNED_ALERTS,
          variables: {
            clientLoginId: getLoginId(),
          },
        },
      ],
      awaitRefetchQueries: true,
    })

    if (isAlertConfigured) {
      this.props.openSnackbar('Configurations saved successfully.')
      this.getAlertConfigurations()
      this.closeAlertSettings()
    } else {
      this.props.openSnackbar('Failed to save configurations.')
      this.closeAlertSettings()
    }
  }

  /**
   * @callback
   * @summary Callback called on SMS enable/disable checkbox
   */
  handleSMSChange = (index, id) => (e) => {
    const smsEnabled = this.state.smsEnabled
    smsEnabled[index] = { id: id, value: e.target.checked }
    this.setState({ smsEnabled })
  }

  /**
   * @callback
   * @summary Callback called on Email enable/disable checkbox
   */
  handleEmailChange = (index, id) => (e) => {
    const emailEnabled = this.state.emailEnabled
    emailEnabled[index] = { id: id, value: e.target.checked }
    this.setState({ emailEnabled })
  }

  render() {
    const { classes, selectedLanguage } = this.props
    const {
      radioSelection,
      vehicles,
      selectedVehicle,
      trips,
      selectedTrip,
      allStudents,
      checked,
    } = this.state

    return (
      <div>
        {/* Student list modal */}
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.openAlertSettingsModal}
          onClose={() => this.closeAlertSettings}
        >
          <div style={getModalStyle()} className={classes.modalPaper}>
            <Typography variant="h6" id="modal-title">
              Alert Settings
            </Typography>
            <Divider />
            <Grid
              container
              style={{ padding: 10, maxHeight: 400, overflow: 'auto' }}
            >
              <Grid item xs={12} lg={12}>
                <Typography color="secondary" align="center">
                  Choose how to want to be notified for following alerts
                </Typography>
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={6}>
                <Typography variant="button">Alert type</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="button">SMS</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="button">Email</Typography>
              </Grid>
            </Grid>
            {this.state.configurableAlerts.length > 0 &&
              this.state.configurableAlerts.map((alert, index) => (
                <Grid container key={index}>
                  <Grid item xs={6}>
                    <Typography color="textSecondary" gutterBottom>
                      {alert.alerts.alertType}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Checkbox
                      color="primary"
                      checked={
                        this.state.smsEnabled.length > 0
                          ? this.state.smsEnabled[index].value
                          : false
                      }
                      onChange={this.handleSMSChange(
                        index,
                        alert.alerts.alertId
                      )}
                      inputProps={{
                        'aria-label': 'primary checkbox',
                      }}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <Checkbox
                      color="primary"
                      checked={
                        this.state.emailEnabled.length > 0
                          ? this.state.emailEnabled[index].value
                          : false
                      }
                      onChange={this.handleEmailChange(
                        index,
                        alert.alerts.alertId
                      )}
                      inputProps={{
                        'aria-label': 'primary checkbox',
                      }}
                    />
                  </Grid>
                </Grid>
              ))}
            <Grid container>
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
                      onClick={this.closeAlertSettings}
                    >
                      Cancel
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      color="secondary"
                      variant="outlined"
                      onClick={this.configureAlerts}
                    >
                      Configure
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
        </Modal>

        {/* Student list modal */}
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.openListModal}
          onClose={() => this.closeListModal}
        >
          <div style={getModalStyle()} className={classes.modalPaper}>
            <Typography variant="h6" id="modal-title">
              Selected students
            </Typography>
            <Divider />
            <Grid
              container
              style={{ padding: 10, maxHeight: 400, overflow: 'auto' }}
            >
              <Grid item xs={12} lg={12}>
                <List className={classes.root}>
                  <ListItem key={'header'} role={undefined} dense>
                    <ListItemIcon>
                      <StudentListIcon />
                    </ListItemIcon>
                    <ListItemText id={'id'} primary={'Student ID'} />
                    <ListItemText id={'name'} primary={'Student Name'} />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} lg={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} lg={12}>
                <List className={classes.root}>
                  {checked.length > 0 ? (
                    allStudents &&
                    allStudents.map((student) => {
                      const labelId = `checkbox-list-label-${student.studentId}`

                      return (
                        <ListItem
                          key={student.studentId}
                          role={undefined}
                          dense
                          button
                          onClick={this.handleToggle(student)}
                        >
                          <ListItemIcon>
                            <Checkbox
                              color="primary"
                              edge="start"
                              checked={
                                checked.indexOf(student.studentId) !== -1
                              }
                              tabIndex={-1}
                              disableRipple
                              inputProps={{ 'aria-labelledby': labelId }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            id={labelId}
                            primary={`${student.studentId}`}
                          />
                          <ListItemText
                            id={labelId}
                            primary={`${student.studentName}`}
                          />
                        </ListItem>
                      )
                    })
                  ) : (
                    <Grid item>
                      <CircularProgress />
                    </Grid>
                  )}
                </List>
              </Grid>
            </Grid>
            <Grid container style={{ margin: 10 }}>
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
                      onClick={this.closeListModal}
                    >
                      Cancel
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      color="secondary"
                      variant="outlined"
                      onClick={this.handleSMSAlert}
                    >
                      Send SMS
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
        </Modal>

        {/* Bulk SMS modal */}
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.openModal}
          onClose={() => this.onOkPress}
        >
          <div style={getModalStyle()} className={classes.modalPaper}>
            <Typography variant="h6" id="modal-title">
              Send bulk SMS
            </Typography>
            <Divider />

            <Grid
              container
              spacing={2}
              style={{ padding: 10, maxHeight: 400, overflow: 'auto' }}
            >
              <Grid item xs={12} lg={12}>
                <TextField
                  fullWidth
                  multiline
                  onChange={this.handleBulkMessageChange}
                  placeholder="Enter custom message"
                  rows={2}
                  rowsMax={4}
                  value={this.state.customMessage}
                />
              </Grid>

              <Grid item xs={12} lg={12}>
                <Typography color="textSecondary">Send SMS to</Typography>
                <FormGroup row>
                  <FormControlLabel
                    value="all"
                    control={
                      <Radio
                        checked={radioSelection === 'all'}
                        onChange={this.handleRadioChange}
                        value="all"
                        aria-label="all"
                        color="secondary"
                      />
                    }
                    label="All students"
                  />
                  <FormControlLabel
                    value="few"
                    control={
                      <Radio
                        checked={radioSelection === 'few'}
                        onChange={this.handleRadioChange}
                        value="few"
                        aria-label="few"
                        color="secondary"
                      />
                    }
                    label="Selective students"
                  />
                </FormGroup>
              </Grid>

              {radioSelection === 'few' && (
                <Grid item xs={12} lg={12}>
                  <Grid container alignItems="center" spacing={1}>
                    <Grid item xs={12} lg={12}>
                      <Typography color="secondary" align="center">
                        Choose information below to filter targeted students
                      </Typography>
                    </Grid>
                    <Grid item xs={12} lg={12}>
                      <Grid container>
                        <Grid item xs={12} sm={12} lg={3}>
                          <Typography color="textSecondary">Vehicle</Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} lg={9}>
                          <ComboBox
                            items={vehicles || []}
                            selectedItem={selectedVehicle}
                            onSelectedItemChange={this.handleVehicleChange}
                            placeholder={
                              languageJson[selectedLanguage].common
                                .chooseVehicle
                            }
                            isLoading={false}
                            itemKey="entityId"
                            itemToStringKey="vehicleNumber"
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} lg={12}>
                      <Grid container>
                        <Grid item xs={12} sm={12} lg={3}>
                          <Typography color="textSecondary">Trip</Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} lg={9}>
                          <ComboBox
                            items={trips || []}
                            selectedItem={selectedTrip}
                            onSelectedItemChange={this.handleTripChange}
                            placeholder="Choose Trip"
                            isLoading={false}
                            itemKey="tripId"
                            itemToStringKey="tripName"
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} lg={12}>
                      <Grid container>
                        <Grid item xs={12} sm={12} lg={3}>
                          <Typography color="textSecondary">
                            Trip type
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} lg={9}>
                          <Button
                            aria-owns={
                              this.state.anchorEl ? 'simple-menu' : undefined
                            }
                            aria-haspopup="true"
                            onClick={this.handleMenuClick}
                            variant="outlined"
                            style={{ width: '100%' }}
                          >
                            {this.state.tripType}
                          </Button>
                          <Menu
                            id="simple-menu"
                            anchorEl={this.state.anchorEl}
                            open={Boolean(this.state.anchorEl)}
                            onClose={this.handleMenuClose}
                          >
                            <MenuItem
                              onClick={() =>
                                this.setState({
                                  tripType: 'Pickup',
                                  anchorEl: null,
                                })
                              }
                            >
                              Pickup
                            </MenuItem>
                            <MenuItem
                              onClick={() =>
                                this.setState({
                                  tripType: 'Drop',
                                  anchorEl: null,
                                })
                              }
                            >
                              Drop
                            </MenuItem>
                          </Menu>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </Grid>

            <Grid container style={{ margin: 10 }}>
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
                      onClick={this.handleStudentListing}
                    >
                      View Students
                    </Button>
                  </Grid>
                </Grid>

                {allStudents && allStudents.length < 1 && (
                  <Grid item xs={12} lg={12}>
                    <Typography align="center" color="error">
                      No students match given parameters.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </div>
        </Modal>

        <Query
          query={GET_CLIENT}
          variables={{
            loginId: getLoginId(),
          }}
        >
          {({ loading, error, data }) => {
            if (loading) return null
            if (error) return `Error!: ${error}`

            const { clientDetail } = data

            const showAlertSettings =
              this.state.plan === 'School Plan' &&
              this.state.accountType === 'CLT'

            return (
              <div className={classes.root} style={{ padding: 15 }}>
                <div>
                  <Mutation mutation={CHANGE_PASSWORD}>
                    {(changePassword, { data, error }) => (
                      <div style={{ float: 'right' }}>
                        {showAlertSettings && (
                          <ColorButton
                            variant="contained"
                            color="primary"
                            className={classes.button}
                            onClick={this.openAlertSettings}
                          >
                            ALERT SETTINGS
                          </ColorButton>
                        )}

                        {this.state.plan === 'School Plan' && (
                          <ColorButton
                            variant="contained"
                            color="primary"
                            className={classes.button}
                            onClick={this.handleSMS}
                          >
                            Bulk SMS
                          </ColorButton>
                        )}
                        <ColorButton
                          variant="contained"
                          color="primary"
                          className={classes.button}
                          onClick={this.handleSupport}
                        >
                          {
                            languageJson[selectedLanguage].accountPage
                              .supportButtonTitle
                          }
                        </ColorButton>
                        <ColorButton
                          variant="contained"
                          color="primary"
                          className={classes.button}
                          onClick={this.handleOpen}
                        >
                          {
                            languageJson[selectedLanguage].accountPage
                              .changePasswordButtonTitle
                          }
                        </ColorButton>
                        <Dialog
                          open={this.state.open}
                          onClose={this.handleClose}
                          aria-labelledby="form-dialog-title"
                        >
                          <DialogTitle id="form-dialog-title">
                            Change Password!
                          </DialogTitle>
                          <DialogContent>
                            <TextField
                              margin="dense"
                              id="Old Password"
                              label="Old Password"
                              name="oldPassword"
                              value={this.state.oldPassword}
                              onChange={this.handleFormChange}
                              type="email"
                              fullWidth
                            />
                            <TextField
                              margin="dense"
                              id="New Password"
                              label="New Password"
                              name="newPassword"
                              type="email"
                              value={this.state.newPassword}
                              onChange={this.handleFormChange}
                              fullWidth
                            />
                            <TextField
                              margin="dense"
                              id="Confirm Password"
                              label="Confirm Password"
                              name="confirmPassword"
                              type="email"
                              value={this.state.confirmPassword}
                              onChange={this.handleFormChange}
                              fullWidth
                            />
                          </DialogContent>
                          <DialogActions>
                            <Button onClick={this.handleClose} color="primary">
                              Cancel
                            </Button>
                            <Button
                              onClick={this.handleSave(changePassword)}
                              color="primary"
                            >
                              Change
                            </Button>
                          </DialogActions>
                        </Dialog>
                      </div>
                    )}
                  </Mutation>
                </div>
                <div />
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={12} md={8}>
                    <Card className={classes.card}>
                      <CardContent>
                        <Typography variant="h5" component="h2">
                          <IconWrapper>
                            <Business color="primary" />
                          </IconWrapper>
                          {clientDetail && clientDetail.clientName}
                        </Typography>
                        <Typography component="p">
                          <IconWrapper>
                            <Person color="primary" />
                          </IconWrapper>
                          {clientDetail && clientDetail.contactPerson}
                        </Typography>
                        <Typography component="p">
                          <IconWrapper>
                            <LocationOn color="primary" />
                          </IconWrapper>
                          {clientDetail && clientDetail.address}
                        </Typography>
                        <Typography component="p">
                          <IconWrapper>
                            <LocationCity color="primary" />
                          </IconWrapper>
                          {clientDetail && clientDetail.city},{' '}
                          {clientDetail && clientDetail.state.name},{' '}
                          {clientDetail && clientDetail.country.name}
                        </Typography>
                        <Typography component="p">
                          <IconWrapper>
                            <MailIcon color="primary" />
                          </IconWrapper>
                          {clientDetail && clientDetail.email}
                        </Typography>
                        <Typography component="p">
                          <IconWrapper>
                            <ContactPhone color="primary" />
                          </IconWrapper>
                          {clientDetail && clientDetail.contactNumber}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Card className={classes.card}>
                      <CardContent>
                        <FormGroup className="form-input">
                          <TextField
                            autoComplete="username"
                            name="username"
                            type="text"
                            value={clientDetail && clientDetail.login.username}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <AccountCircleIcon />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </FormGroup>
                        <br />
                        <FormGroup className="form-input">
                          <TextField
                            autoComplete="current-password"
                            name="password"
                            type="password"
                            placeholder="Password"
                            value="12345678"
                            disabled
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <VpnKey />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </FormGroup>
                      </CardContent>
                    </Card>
                    &nbsp;{' '}
                    {this.state.accountType === 'CLT' && (
                      <Grid item xs={12}>
                        <ColorButton
                          component={Link}
                          variant="contained"
                          color="primary"
                          to="/home/account/sms-history"
                        >
                          {
                            languageJson[selectedLanguage].accountPage
                              .smsHistoryButtonTitle
                          }
                        </ColorButton>
                        &nbsp;&nbsp;
                        <WidgetCard
                          widgetTitle={
                            languageJson[selectedLanguage].accountPage
                              .cardTitles.smsBalance
                          }
                          widgetValue={this.state.smsBalance.toString()}
                          WidgetIcon={RegisteredIcon}
                          widgetIconColor={COLOR_RANGE.green}
                        />
                      </Grid>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <WidgetCard
                      widgetTitle={
                        languageJson[selectedLanguage].accountPage.cardTitles
                          .totalDevices
                      }
                      widgetValue={this.state.stock.totalAssignedDevice.toString()}
                      WidgetIcon={TotalIcon}
                      widgetIconColor={COLOR_RANGE.blue}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <WidgetCard
                      widgetTitle={
                        languageJson[selectedLanguage].accountPage.cardTitles
                          .registeredDevices
                      }
                      widgetValue={this.state.stock.totalRegisteredDevice.toString()}
                      WidgetIcon={RegisteredIcon}
                      widgetIconColor={COLOR_RANGE.green}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <WidgetCard
                      widgetTitle={
                        languageJson[selectedLanguage].accountPage.cardTitles
                          .unregisteredDevices
                      }
                      widgetValue={this.state.stock.totalUnRegisteredDevice.toString()}
                      WidgetIcon={UnregisteredIcon}
                      widgetIconColor={COLOR_RANGE.flatGrey}
                    />
                  </Grid>
                </Grid>
              </div>
            )
          }}
        </Query>
      </div>
    )
  }
}

ViewCustomer.propTypes = {
  classes: PropTypes.object.isRequired,
}

const AccountPage = withStyles(styles)(
  withLanguage(withSharedSnackbar(withApollo(ViewCustomer)))
)

const SmsHistoryPage = withApollo(SmsHistory)

export default () => (
  <Switch>
    <PrivateRoute
      exact
      path="/home/account"
      render={(props) => <AccountPage {...props} />}
    />
    <PrivateRoute
      exact
      path="/home/account/sms-history"
      render={(props) => <SmsHistoryPage {...props} />}
    />
  </Switch>
)
