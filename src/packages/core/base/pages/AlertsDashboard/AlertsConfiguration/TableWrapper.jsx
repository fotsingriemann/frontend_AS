/**
 * @module AlertsDashboard/AlertsConfiguration/TableWrapper
 * @summary TableWrapper renders the Table for enabling/disabling/editing alert configurations
 */

import React, { Component, useEffect, useState } from 'react'
import { Query, useQuery, withApollo } from 'react-apollo'
import { Grid, Typography } from '@material-ui/core'
import getLoginId from '@zeliot/common/utils/getLoginId'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import EnabledAlertTable from './EnabledAlertTable/EnabledAlertTable.jsx'
import DisabledAlertTable from './DisabledAlertTable/DisabledAlertTable.jsx'
import {
  GET_ALERT_CONFIGURATIONS,
  UPDATE_ALERT_CONFIGURATIONS,
  alertConfigs,
  GET_ALL_PARAMETERS,
} from './queries'
import moment from 'moment'
import VehicleStats from '../../OSMap/VehicleStats/VehicleStats.jsx'

/**
 * @param {string} alertType The type of the alert
 * @returns {string} The value name for the alert type
 * @summary Returns the value key for the given alert type
 */
function getValueKey(alertType) {
  // console.log('alerttype', alertType)
  switch (alertType) {
    case 'overspeed':
      return 'osLimit'
    case 'ExtBatLow':
      return 'voltage'
    case 'geofence':
      return 'areaId'
    case 'routefence':
      return 'routeId'
    case 'halt':
      return 'haltTime'
    case 'idle':
      return 'idleTime'
    case 'conditionalMaintenance':
      return 'conditional'
    case 'scheduleMaintenance':
      return 'schedule'
    default:
      return ''
  }
}

const mapParametersData = (parametersData) => {
  console.log('param data', parametersData)
  const data = JSON.parse(JSON.stringify(parametersData))
  const mappedData = data.map((param) => {
    let obj = {}
    if (
      (param.minValue !== null && param.maxValue !== null) ||
      (param.minValue !== '' && param.minValue !== '')
    ) {
      obj = {
        ...param,
        minValue: Number(param.minValue),
        maxValue: Number(param.maxValue),
      }
    }
    if (param.minValue === null && param.maxValue === null) {
      obj = { ...param }
    }

    return obj
  })

  console.log('mapped param data', mappedData)
  return mappedData
}

/**
 * @param {object} item The alert configuration object
 * @param {*} value The value field for the alert configuration
 * @returns {object} The alert configuration object in a proper format
 * @summary Converts an alert configuration object to a payload object
 */
function getPayload(item, value) {
  // console.log('item and alertType', item, value)
  if (value === 'conditional') {
    const mappedParametersData = mapParametersData(item.parametersData)
    const payloadObj = {
      isAlertEnable: item.isAlertEnabled,
      uniqueDeviceId: item.uniqueId,
      email: item.email || null,
      sms: item.phone || null,
      parametersData: mappedParametersData,
    }
    return payloadObj
  }

  if (value === 'schedule') {
    const payloadObject = {
      isAlertEnable: item.isAlertEnabled,
      uniqueDeviceId: item.uniqueId,
      email: item.email || null,
      sms: item.phone || null,
      runningHrs: Number(item.runningHours) || null,
      noOfDays: Number(item.numberOfDays) || null,
      recurring: item.isRecurring,
    }
    return payloadObject
  }
  const obj = {
    isAlertEnable: item.isAlertEnabled,
    uniqueDeviceId: item.uniqueId,
    email: item.email || null,
    sms: item.phone || null,
    fromTimestamp: '0',
    toTimestamp: '0',
    fromTime: item.from,
    toTime: item.to,
  }

  if (Array.isArray(item.value)) {
    obj[value] = item.value
  } else if (value) {
    obj[value] = parseInt(item.value, 10)
  }
  return obj
}

/**
 * @summary TableWrapper component wraps the table of alert configuration within enabled/disabled tabs
 */
class TableWrapper extends Component {
  setInitalSearchTermValues = () => {
    const { alertConfigurations } = this.props
    const mappedData = alertConfigurations.reduce((acc, item) => {
      if (!acc.hasOwnProperty(item.uniqueId)) {
        acc[item.uniqueId] = ''
      }
      return acc
    }, {})
    return { ...mappedData }
  }

  /**
   * @property {object[]} alertConfigurations The list of alert configurations
   * @property {object[]} uneditedAlertConfigurations The list of unedited alert configurations
   */
  state = {
    alertConfigurations: this.props.alertConfigurations,
    uneditedAlertConfigurations: this.props.alertConfigurations,
    searchTerm: this.setInitalSearchTermValues(),
  }

  /**
   * @callback
   * @summary Generic change event handler
   */
  handleChange = (e) => this.setState({ [e.target.name]: e.target.value })

  convertToEpoch = (date) => {
    // console.log('date', typeof moment(date).unix())
    return moment(date).unix()
  }

  /**
   * @callback
   * @param {string} uniqueId The unique device ID of the vehicle
   * @param {string} field The field of the alert configuration to be edited
   * @summary Handles change in value field of the alert configuration object
   */
  handleValueChange = (uniqueId, field) => (e) => {
    console.log(
      ' on change value',
      e.target.value,
      field,
      this.state.alertConfigurations
    )
    const data = this.state.alertConfigurations.map((alertConfiguration) => {
      if (alertConfiguration.uniqueId === uniqueId) {
        return {
          ...alertConfiguration,
          [field]: field === 'date' ? this.convertToEpoch(e) : e.target.value,
        }
      } else {
        return alertConfiguration
      }
    })

    this.setState({ alertConfigurations: data })
  }

  handleParamMinMaxValueChange = (id, vehicelId) => (e) => {
    const { value, name } = e.target
    console.log('minmax values', name, value)
    const { alertConfigurations } = this.state
    const updatedAlertConfigurations = alertConfigurations.map((vehicle) => {
      if (vehicle.uniqueId === vehicelId) {
        vehicle.parametersData.forEach((param) => {
          if (param.pid === id) {
            if (name === 'minValue') {
              param.minValue = value
            }
            if (name === 'maxValue') {
              param.maxValue = value
            }
          }
        })
      }
      return vehicle
    })
    // console.log('updatedVehicles: minmax:', updatedVehicles)
    this.setState({ alertConfigurations: updatedAlertConfigurations })
  }

  handleParamCheck = (paramId, VId) => (e) => {
    const { checked } = e.target
    const { alertConfigurations: vehicles } = this.state
    // console.log('vehcle ids', vehicles, paramId, VId)
    const indexOfVehicle = vehicles.findIndex(({ uniqueId: id }) => id === VId)
    // console.log('index of vehicle', indexOfVehicle, vehicles[indexOfVehicle])
    const { parametersData: params } = vehicles[indexOfVehicle]
    // console.log('param dat', params)
    const indexOfParam = params.findIndex(({ pid: id }) => id === paramId)
    // console.log('param', indexOfParam)

    const newParams = [
      ...params.slice(0, indexOfParam),
      { ...params[indexOfParam], isEnable: checked },
      ...params.slice(indexOfParam + 1),
    ]
    // newParams.forEach((item) => console.log(item.isEnable))

    const newVehicle = [
      ...vehicles.slice(0, indexOfVehicle),
      { ...vehicles[indexOfVehicle], parametersData: newParams },
      ...vehicles.slice(indexOfVehicle + 1),
    ]

    // newVehicle.forEach(({ parametersData }) =>
    //   parametersData.forEach((item) => console.log(item.isEnable))
    // )

    this.setState({ alertConfigurations: newVehicle })
  }

  handleSearchInputChange = (uniqueId) => (e) => {
    // console.log(e.target.value, uniqueId)
    const temp = {}
    temp[uniqueId] = e.target.value
    this.setState((prevState) => ({
      searchTerm: { ...prevState.searchTerm, ...temp },
    }))

    // setSearchTerm((prev) => ({ ...prev, ...temp }))
  }

  setInitalSearchTermValues = () => {
    const { alertConfigurations } = this.state
    const mappedData = alertConfigurations.reduce((acc, item) => {
      if (!acc.hasOwnProperty(item.uniqueId)) {
        acc[item.uniqueId] = ''
      }
      return acc
    }, {})
    // this.setState({ searchTerm: { ...mappedData } }, () => {
    //   console.log('search term', this.state.searchTerm)
    // })
    return { ...mappedData }
  }

  /**
   * @function
   * @param {*} emails and phones The value to be validated
   * @summary Validates the emails, phones array according to the alert type whether the all email id phone number are unique or not
   */
  hasUniqEmailPhone = (itemsep) => {
    var valuesSoFar = Object.create(null)
    for (var i = 0; i < itemsep.length; ++i) {
      var value = itemsep[i]
      if (value in valuesSoFar) {
        return false
      }
      valuesSoFar[value] = false
    }
    return true
  }

  /**
   * @function
   * @param {*} value The value to be validated
   * @summary Validates the value according to the alert type
   */
  validateValue = (value) => {
    switch (this.props.selectedAlert) {
      case 'overspeed':
        return !value || /\D/.test(value)
      case 'ExtBatLow':
        return !value || /\D/.test(value)
      case 'halt':
        return !value || /\D/.test(value)
      case 'idle':
        return !value || /\D/.test(value)
      case 'geofence':
      case 'routefence':
        if (Array.isArray(value)) {
          return !value.length
        } else return true
      default:
        return false
    }
  }

  validateConditionalParams = (paramsData) => {
    console.log('validate params data', paramsData)
    const filteredParams = paramsData.filter(({ isEnable }) => isEnable)
    // console.log('filteredParams', filteredParams)
    let isMinLessThanMax = true
    if (filteredParams.length > 0) {
      const validationArray = filteredParams.reduce((acc, item) => {
        const { isEnable, minValue, maxValue } = item
        if (Number(minValue) > Number(maxValue)) {
          isMinLessThanMax = false
        }
        if (
          isEnable &&
          minValue !== null &&
          minValue !== '' &&
          maxValue !== null &&
          maxValue !== '' &&
          Number(maxValue) > Number(minValue)
        ) {
          acc.push(true)
        } else {
          acc.push(false)
        }
        return acc
      }, [])

      if (!isMinLessThanMax) {
        this.props.openSnackbar('Min value should be less than Max value')
        return false
      }
      // console.log('validation array', validationArray)
      for (const item of validationArray) {
        if (!item) {
          this.props.openSnackbar('Invalid value', {
            type: 'warning',
          })
          return false
        }
      }
      return true
    } else {
      this.props.openSnackbar('Invalid value', {
        type: 'warning',
      })
      return false
    }
  }

  /**
   * @function
   * @param {object} item The alert configuration object
   * @summary Edits the alert configuration for a vehicle using GraphQL mutation
   */
  editItem = async (item) => {
    // console.log('edited item', item)
    const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    const phoneRegex = /^[0-9]{10,16}$/
    // /\+?\d{10,15}$/ old one

    const emails = item.email.replace(/\s/g, '').split(',')
    const phones = item.phone.replace(/\s/g, '').split(',')

    // extra condition added for multiple same email entry function at line 109
    if (!this.hasUniqEmailPhone(emails)) {
      this.props.openSnackbar('The Same email id entry is not Allowed', {
        type: 'warning',
      })
      return false
    }
    // the condition ended

    if (
      emails.length > 0 &&
      emails.some((email) => email !== '' && !emailRegex.test(email))
    ) {
      this.props.openSnackbar('Invalid email', { type: 'warning' })
      return false
    }

    // extra condition added for multiple same email entry function at line 109
    if (!this.hasUniqEmailPhone(phones)) {
      this.props.openSnackbar('The Same Phone Number entry is not Allowed', {
        type: 'warning',
      })
      return false
    }
    // the condition ended

    if (
      phones.length > 0 &&
      phones.some((phone) => phone !== '' && !phoneRegex.test(phone))
    ) {
      this.props.openSnackbar('Invalid phone', { type: 'warning' })
      return false
    }

    if (this.validateValue(item.value)) {
      this.props.openSnackbar('Invalid value', { type: 'warning' })
      return false
    }

    if (
      this.props.selectedAlert === 'halt' ||
      this.props.selectedAlert === 'idle'
    ) {
      if (item.from > item.to) {
        this.props.openSnackbar('From time cannot be more than To time', {
          type: 'warning',
        })
        return false
      }

      if (item.from === item.to) {
        this.props.openSnackbar('From time cannot be same as To time', {
          type: 'warning',
        })
        return false
      }
    }

    if (this.props.selectedAlert === 'scheduleMaintenance') {
      if (
        (!item.numberOfDays || item.numberOfDays === '') &&
        (!item.runningHours || item.runningHours === '')
      ) {
        this.props.openSnackbar('Invalid value', { type: 'warning' })
        return false
      } else if (
        Number(item.numberOfDays) < 0 ||
        Number(item.runningHours) < 0
      ) {
        this.props.openSnackbar(
          'Value can not be negative. It should be greater than 0',
          {
            type: 'warning',
          }
        )
        return false
      }
    }

    if (this.props.selectedAlert === 'conditionalMaintenance') {
      if (!this.validateConditionalParams(item.parametersData)) {
        return false
      }
    }

    const payload = getPayload(item, getValueKey(this.props.selectedAlert))
    // console.log('payload', payload)

    const status = await this.updateAlertConfigs([payload])
    if (status) {
      this.handleValueChange(
        item.uniqueId,
        'isAlertEnabled'
      )({
        target: {
          value: true,
        },
      })
      this.props.openSnackbar(
        `Updated configuration for ${item.vehicleNumber}`,
        { type: 'success' }
      )
      return true
    } else {
      this.props.openSnackbar(
        `Failed to update configuration for ${item.vehicleNumber}`,
        { type: 'error' }
      )
      return false
    }
  }

  /**
   * @function
   * @param {object} item The alert configuration object to be deleted
   * @summary Deletes(disables) the alert configuration for a vehicle using GraphQL mutation
   */
  deleteItem = async (item) => {
    const payload = getPayload(
      { ...item, isAlertEnabled: false },
      getValueKey(this.props.selectedAlert)
    )

    if (await this.updateAlertConfigs([payload])) {
      this.setState(({ alertConfigurations }) => ({
        alertConfigurations: alertConfigurations.filter(
          (alertConfig) => alertConfig.uniqueId !== item.uniqueId
        ),
      }))
      this.props.openSnackbar(
        `Deleted configuration for ${item.vehicleNumber}`,
        { type: 'success' }
      )
    } else {
      this.props.openSnackbar(
        `Failed to delete configuration for ${item.vehicleNumber}`,
        { type: 'error' }
      )
    }
  }

  /**
   * @function
   * @param {object[]} items The alert configuration objects
   * @param {object} itemsValue The object containing the values to be set for given configurations
   * @summary Edits the alert configuration for multiple vehicles using GraphQL mutation
   */
  editMultiple = async (items, itemsValue) => {
    // console.log('edited values', items, itemsValue)
    let flag = false
    const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    const phoneRegex = /\+?\d{9,11}$/

    if (this.props.mode === 'DISABLED') {
      if (this.validateValue(itemsValue.value)) {
        this.props.openSnackbar('Please provide a value to configure', {
          type: 'warning',
        })
        return false
      }
      flag = true
    } else if ('value' in itemsValue) {
      if (this.validateValue(itemsValue.value)) {
        this.props.openSnackbar('Invalid value', { type: 'warning' })
        return false
      }
      flag = true
    }

    if (
      this.props.selectedAlert === 'halt' ||
      this.props.selectedAlert === 'idle'
    ) {
      if (itemsValue.from === undefined || itemsValue.to === undefined) {
        this.props.openSnackbar('From time & To time are required', {
          type: 'warning',
        })
        return false
      }

      flag = true

      if (itemsValue.from > itemsValue.to) {
        this.props.openSnackbar('From time cannot be more than To time', {
          type: 'warning',
        })
        return false
      }

      if (itemsValue.from === itemsValue.to) {
        this.props.openSnackbar('From time cannot be same as To time', {
          type: 'warning',
        })
        return false
      }
    }

    if (this.props.selectedAlert === 'scheduleMaintenance') {
      if (
        Number(itemsValue.numberOfDays) < 0 ||
        Number(itemsValue.runningHours) < 0
      ) {
        this.props.openSnackbar(
          'Value can not be negative. It should be greater than 0',
          {
            type: 'warning',
          }
        )
        return false
      }
    }

    if (this.props.selectedAlert === 'conditionalMaintenance') {
      if (!this.validateConditionalParams(itemsValue.parametersData)) {
        this.props.openSnackbar('Invalid value', { type: 'warning' })
        return false
      }
    }

    if ('email' in itemsValue) {
      const emails = itemsValue.email.replace(/\s/g, '').split(',')

      if (
        emails.length > 0 &&
        emails.some((email) => email !== '' && !emailRegex.test(email))
      ) {
        this.props.openSnackbar('Invalid email', { type: 'warning' })
        return false
      }

      // new for multiple same email id validation
      if (!this.hasUniqEmailPhone(emails)) {
        this.props.openSnackbar('The Same email id entry is not Allowed', {
          type: 'warning',
        })
        return false
      }

      flag = true
    }

    if ('phone' in itemsValue) {
      const phones = itemsValue.phone.replace(/\s/g, '').split(',')

      if (
        phones.length > 0 &&
        phones.some((phone) => phone !== '' && !phoneRegex.test(phone))
      ) {
        this.props.openSnackbar('Invalid phone', { type: 'warning' })
        return false
      }

      // new for multiple same phone number validation
      if (!this.hasUniqEmailPhone(phones)) {
        this.props.openSnackbar('The Same Phone Number entry is not Allowed', {
          type: 'warning',
        })
        return false
      }

      flag = true
    }

    // if (!flag) {
    //   this.props.openSnackbar('Select atleast one field to be edited', {
    //     type: 'warning',
    //   })
    //   return false
    // }

    const payload = items.map((item) => {
      console.log('item-----', item)
      return getPayload(item, getValueKey(this.props.selectedAlert))
    })

    console.log('payload', payload)

    const status = await this.updateAlertConfigs(payload)
    if (status) {
      this.handleSelectedItemsValueChange(
        items.map((item) => item.uniqueId),
        itemsValue
      )
      this.props.openSnackbar('Updated configurations for selected vehicles', {
        type: 'success',
      })
    } else {
      this.props.openSnackbar(
        'Failed to update configurations for selected vehicles',
        { type: 'error' }
      )
    }
  }

  /**
   * @function
   * @param {object[]} items The alert configuration objects to be deleted
   * @summary Deletes(disables) the alert configuration for multiple vehicles using GraphQL mutation
   */
  deleteMultiple = async (items) => {
    const payload = items.map((item) =>
      getPayload(
        {
          ...item,
          isAlertEnabled: false,
        },
        getValueKey(this.props.selectedAlert)
      )
    )

    const status = await this.updateAlertConfigs(payload)
    if (status) {
      this.handleSelectedItemsValueChange(
        items.map((item) => item.uniqueId),
        {
          isAlertEnabled: false,
        }
      )
      this.props.openSnackbar('Deleted configurations for selected vehicles', {
        type: 'success',
      })
    } else {
      this.props.openSnackbar(
        'Failed to delete configurations for selected vehicles',
        { type: 'error' }
      )
    }
  }

  /**
   * @param {object[]} configs The configurations to be split
   * @summary Creates duplicate configuration object where values are arrays,
   * with each copy containing just one value
   */
  splitConfigs = (configs) => {
    const newConfigs = []
    let key

    if (this.props.selectedAlert === 'geofence') {
      key = 'areaId'
    } else if (this.props.selectedAlert === 'routefence') {
      key = 'routeId'
    }

    configs.forEach((config) => {
      const val = config[key]
      if (val && val.length) {
        val.forEach((v) => {
          newConfigs.push({ ...config, [key]: v })
        })
      } else {
        newConfigs.push({ ...config, [key]: [] })
      }
    })

    return newConfigs
  }

  /**
   * @param {object[]} newConfigs The new alert configurations
   * @summary Calls the GraphQL mutation to update alert configurations
   */
  updateAlertConfigs = async (newConfigs) => {
    const response = await this.props.client.mutate({
      mutation: UPDATE_ALERT_CONFIGURATIONS,
      variables: {
        loginId: getLoginId(),
        alertType: this.props.selectedAlert,
        alertConfigs:
          this.props.selectedAlert === 'geofence' ||
          this.props.selectedAlert === 'routefence'
            ? this.splitConfigs(newConfigs)
            : newConfigs,
      },
    })

    if (response.data && response.data.setMultiDeviceAlertConfigs) {
      return true
    }

    this.setState(({ uneditedAlertConfigurations }) => ({
      alertConfigurations: uneditedAlertConfigurations,
    }))

    return false
  }

  /**
   * @returns {boolean} Whether to show enabled alerts table
   * @summary Determines if alert configurations table should be shown for enabled alerts
   */
  showEnabledAlertsTable = () => {
    return (
      this.props.selectedAlert &&
      this.props.mode === 'ENABLED' &&
      this.state.alertConfigurations.filter(
        (alertConfig) => alertConfig.isAlertEnabled
      ).length > 0
    )
  }

  /**
   * @returns {boolean} Whether to show disabled alerts table
   * @summary Determines if alert configurations table should be shown for disabled alerts
   */
  showDisabledAlertsTable = () => {
    return (
      this.props.selectedAlert &&
      this.props.mode === 'DISABLED' &&
      this.state.alertConfigurations.filter(
        (alertConfig) => !alertConfig.isAlertEnabled
      ).length > 0
    )
  }

  /**
   * @callback
   * @param {string[]} selectedItems The vehicles selected to be changed
   * @param {string} value The value to be set for the selected vehicles
   * @summary Updates the alert configurations for the selected vehicles with the given value
   */
  handleSelectedItemsValueChange = async (selectedItems, value) => {
    const updatedConfigurations = this.state.alertConfigurations.map(
      (alertConfiguration) => {
        if (selectedItems.includes(alertConfiguration.uniqueId)) {
          return {
            ...alertConfiguration,
            ...value,
          }
        } else {
          return alertConfiguration
        }
      }
    )

    this.setState({
      alertConfigurations: updatedConfigurations,
    })
  }

  componentDidMount() {
    // this.setInitalSearchTermValues()
  }

  /**
   * @summary Renders the placeholder for the table
   */
  renderTablePlaceholder = (text) => (
    <Grid
      container
      className={this.props.classes.fullHeight}
      alignItems="center"
      justify="flex-start"
    >
      <Grid item>
        <Typography variant="subtitle1">{text}</Typography>
      </Grid>
    </Grid>
  )

  render() {
    if (!this.showEnabledAlertsTable() && this.props.mode === 'ENABLED') {
      return this.renderTablePlaceholder(
        'No vehicles have this alert enabled, Go to DISABLED VEHICLES tab to add vehicles here '
      )
    }

    if (!this.showDisabledAlertsTable() && this.props.mode === 'DISABLED') {
      return this.renderTablePlaceholder(
        'No vehicles have this alert disabled, Go to ENABLED VEHICLES tab to modify/remove alert '
      )
    }

    // console.log('slected alerts', this.props.alertConfigurations)

    if (this.showEnabledAlertsTable()) {
      // console.log('selected alert', this.props.selectedAlert)
      return (
        <EnabledAlertTable
          alert={this.props.alerts.find(
            (alert) => alert.type === this.props.selectedAlert
          )}
          selectedAlert={this.props.selectedAlert}
          allParameters={this.props.allParameters}
          data={this.state.alertConfigurations.filter(
            (alertConfig) => alertConfig.isAlertEnabled
          )}
          handleValueChange={this.handleValueChange}
          openSnackbar={this.props.openSnackbar}
          handleEdit={this.editItem}
          handleDelete={this.deleteItem}
          editMultiple={this.editMultiple}
          deleteMultiple={this.deleteMultiple}
          searchTerm={this.state.searchTerm}
          handleParamCheck={this.handleParamCheck}
          handleSearchInputChange={this.handleSearchInputChange}
          handleParamMinMaxValueChange={this.handleParamMinMaxValueChange}
        />
      )
    }

    if (this.showDisabledAlertsTable()) {
      return (
        <DisabledAlertTable
          alert={this.props.alerts.find(
            (alert) => alert.type === this.props.selectedAlert
          )}
          selectedAlert={this.props.selectedAlert}
          data={this.state.alertConfigurations.filter(
            (alertConfig) => !alertConfig.isAlertEnabled
          )}
          allParameters={this.props.allParameters}
          handleValueChange={this.handleValueChange}
          handleEdit={this.editItem}
          editMultiple={this.editMultiple}
          openSnackbar={this.props.openSnackbar}
          searchTerm={this.state.searchTerm}
          handleParamCheck={this.handleParamCheck}
          handleSearchInputChange={this.handleSearchInputChange}
          handleParamMinMaxValueChange={this.handleParamMinMaxValueChange}
        />
      )
    }
  }
}

const TableWrapperWithSnackbar = withSharedSnackbar(TableWrapper)

/**
 * @param {object} props React component props
 * @summary TableWrapperWithConfig component wraps the TableWrapper component by passing
 * configurations as prop
 */
function TableWrapperWithConfig(props) {
  const [allParameters, setAllParameters] = useState()
  const [allEnabledParameter, setAllEnabledParameters] = useState()

  const mapParameters = (params) => {
    const mappedParams = params.reduce((acc, item) => {
      const obj = {
        pid: item.pid,
        parameter: item.parameter,
        minValue: null,
        maxValue: null,
        isEnable: false,
      }
      acc.push(obj)
      return acc
    }, [])
    // console.log('params', mappedParams)
    setAllParameters(mappedParams)
  }

  const getAllParameters = async () => {
    const { data, loading, error } = await props.client.query({
      query: GET_ALL_PARAMETERS,
      variables: {
        clientLoginId: parseInt(getLoginId(), 10),
      },
      fetchPolicy: 'network-only',
    })

    if (data) {
      // console.log('getClientPids', data.getClientPids)
      mapParameters(data.getClientPids)
      // setAllParameters(data.getClientPids)
    }
  }

  const prefillParams = (enabledParams, allParams) => {
    let result = [...allParams]
    enabledParams.forEach((param) => {
      const { isEnable, minValue, maxValue } = param
      const index = result.findIndex(({ pid }) => pid === param.pid)
      result = [
        ...result.slice(0, index),
        { ...result[index], isEnable, minValue, maxValue },
        ...result.slice(index + 1),
      ]
    })
    return result
  }

  // const prefillParams = (enabledData, allParameters) => {
  //   console.log('onload alertconfigs', enabledData, allParameters)
  //   // const data = [...allParameters]
  //   const data = JSON.parse(JSON.stringify(allParameters))
  //   let updatedParameters = []

  //   enabledData.forEach((param) => {
  //     updatedParameters = data.map((item) => {
  //       if (param.pid === item.pid) {
  //         item.isEnable = param.isEnable
  //         item.minValue = param.minValue
  //         item.maxValue = param.maxValue
  //         item.pid = param.pid
  //         item.parameter = param.parameter
  //         return item
  //       } else {
  //         return item
  //       }
  //     })
  //   })

  //   console.log('updatedParameters', allParameters, updatedParameters)

  //   return updatedParameters
  // }

  useEffect(() => {
    getAllParameters()
  }, [])

  function renderTablePlaceholder(text) {
    return (
      <Grid
        container
        className={props.classes.fullHeight}
        alignItems="center"
        justify="flex-start"
      >
        <Grid item>
          <Typography variant="subtitle1">{text}</Typography>
        </Grid>
      </Grid>
    )
  }

  if (!props.selectedAlert) {
    return renderTablePlaceholder('Select an alert to view list of vehicles')
  }

  return (
    <Query
      query={GET_ALERT_CONFIGURATIONS(props.selectedAlert)}
      variables={{
        loginId: getLoginId(),
        alertType: props.selectedAlert,
        enabled: props.mode === 'ENABLED',
      }}
      fetchPolicy={'network-only'}
    >
      {({ loading, error, data }) => {
        if (loading) return 'Loading...'
        if (error) return 'Error'
        console.log('data', data)
        const alertConfigurations = data.devices.map((alertConfiguration) => {
          const obj = {
            uniqueId: alertConfiguration.vehicle.uniqueDeviceId,
            vehicleNumber: alertConfiguration.vehicle.vehicleNumber,
            email: alertConfiguration.email || '',
            phone: alertConfiguration.phone || '',
            isAlertEnabled: alertConfiguration.isAlertEnabled,
          }
          if (
            props.selectedAlert === 'overspeed' ||
            props.selectedAlert === 'ExtBatLow' ||
            props.selectedAlert === 'halt' ||
            props.selectedAlert === 'idle'
          ) {
            obj.value = alertConfiguration.value || ''
          } else if (
            props.selectedAlert === 'geofence' ||
            props.selectedAlert === 'routefence'
          ) {
            obj.value = alertConfiguration.value || []
          }

          if (
            props.selectedAlert === 'halt' ||
            props.selectedAlert === 'idle'
          ) {
            obj.from = alertConfiguration.fromTime
            obj.to = alertConfiguration.toTime
          }
          if (props.selectedAlert === 'conditionalMaintenance') {
            obj.parametersData =
              props.mode === 'ENABLED'
                ? prefillParams(
                    alertConfiguration.parametersData,
                    allParameters
                  )
                : allParameters
          }
          if (props.selectedAlert === 'scheduleMaintenance') {
            obj.runningHours = alertConfiguration.runningHrs
            obj.numberOfDays = alertConfiguration.noOfDays
            obj.isRecurring = alertConfiguration.recurring
          }

          return obj
        })
        // console.log('alert config', alertConfigurations)
        return (
          <TableWrapperWithSnackbar
            {...props}
            alertConfigurations={alertConfigurations}
            allParameters={allParameters}
          />
        )
      }}
    </Query>
  )
}

export default withApollo(TableWrapperWithConfig)
