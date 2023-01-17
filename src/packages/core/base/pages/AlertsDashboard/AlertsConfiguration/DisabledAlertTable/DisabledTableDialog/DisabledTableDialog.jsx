/**
 * @module AlertsDashboard/AlertsConfiguration/DisabledAlertTable/DisabledTableDialog
 * @summary This module exports the DisabledTableDialog component
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Select,
  MenuItem,
  InputLabel,
  Dialog,
  Button,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  Grid,
  Checkbox,
  FormControl,
  Typography,
  Input,
  InputAdornment,
} from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
import SearchIcon from '@material-ui/icons/Search'

/**
 * @param {number} timeInput The time duration in seconds
 * @summary Converts time duration in seconds to hh:mm string
 */
function getTimeString(timeInput) {
  return (
    parseInt(timeInput / 60, 10)
      .toString()
      .padStart(2, '0') +
    ':' +
    (timeInput % 60).toString().padStart(2, '0')
  )
}

/**
 * @param {string} time Time as a string in hh:mm format
 * @summary Converts time string to an array of hours & minutes
 */
function getTimeFromString(time) {
  let [hour, minute] = time.split(':')
  hour = hour || 0
  minute = minute || 0

  return [hour, minute]
}

/**
 * @summary Renders a dialog to set configuration for multiple vehicles
 */
class DisabledTableDialog extends Component {
  /**
   * @property {string} email The email for alerts
   * @property {string} phone The phone number for alerts
   * @property {object[]|string} value The value to be set for alerts
   * @property {string} from The from time for alerts
   * @property {string} to The totime for alerts
   * @property {boolean} emailActive Boolean to determine if email should be set
   * @property {boolean} phoneActive Boolean to determine if phone number should be set
   * @property {boolean} fromActive Boolean to determine if from time should be set
   * @property {boolean} toActive Boolean to determine if to time should be set
   */
  state = {
    email: '',
    phone: '',
    value: this.props.options ? [] : '',
    from: '',
    to: '',
    runningHours: '',
    numberOfDays: '',
    isRecurring: null,
    parametersData: this.props.allParameters,
    emailActive: false,
    phoneActive: false,
    valueActive: false,
    fromActive: false,
    toActive: false,
    runningHoursActive: false,
    numberOfDaysActive: false,
    isRecurringActive: false,
    parametersDataActive: false,
    searchTerm: '',
  }

  /**
   * @callback
   * @summary Close the dialog
   */
  handleClose = () => {
    this.props.onClose()
    this.resetState()
  }

  /**
   * @callback
   * @summary Generic change event handler
   */
  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    })
  }

  /**
   * @callback
   * @summary handle search inputaa
   */
  handleSearchInputChange = (e) => {
    const { name, value } = e.target
    this.setState({ [name]: value })
  }

  /**
   * @handleParamCheck
   * @summary sets respective parameters checked value.
   */

  handleParamCheck = (id) => (e) => {
    const { checked } = e.target
    console.log('on param check', id, e.target.checked)
    const data = [...this.state.parametersData]
    const updatedParameters = data.reduce((acc, param) => {
      let temp = {}
      if (param.pid === id) {
        temp = { ...param, isEnable: checked }
        acc.push(temp)
      } else {
        acc.push(param)
      }
      return acc
    }, [])

    this.setState(
      {
        parametersData: updatedParameters,
      },
      () => {
        console.log(this.state.parametersData)
      }
    )
  }

  /**
   * @handleMinMaxChange min max value handler
   * @summary sets min and max values to parameter
   */

  handleMinMaxChange = (paramId, name) => (e) => {
    console.log('min max', paramId, name, e.target.value)
    const data = [...this.state.parametersData]
    data.forEach((item, index) => {
      if (item.pid === paramId) {
        if (name === 'minValue') {
          data[index].minValue = Number(e.target.value)
        }
        if (name === 'maxValue') {
          data[index].maxValue = Number(e.target.value)
        }
      }
    })

    console.log('min max value update', data)

    this.setState({
      parametersData: data,
    })
  }

  /**
   * @callback
   * @summary Toggle the value of checkbox
   */
  toggleCheckbox = (name) => () => {
    this.setState({
      [name]: !this.state[name],
    })
  }

  resetState = () => {
    this.setState({
      email: '',
      phone: '',
      value: this.props.options ? [] : '',
      from: '',
      to: '',
      runningHours: '',
      numberOfDays: '',
      isRecurring: '',
      parametersData: this.props.allParameters,
      emailActive: false,
      phoneActive: false,
      valueActive: false,
      fromActive: false,
      toActive: false,
      runningHoursActive: false,
      numberOfDaysActive: false,
      isRecurringActive: false,
      parametersDataActive: false,
      searchTerm: '',
    })
  }

  render() {
    const {
      title,
      options,
      open,
      onSubmit,
      dialogMode,
      content,
      hasValue,
      dialogSubmitButtonTitle,
      dialogCancelButtonTitle,
      selectedAlert,
    } = this.props

    const { parametersData, searchTerm } = this.state

    /* eslint-disable indent */
    let fields = []

    if (dialogMode === 'EDIT_MULTIPLE') {
      if (hasValue) {
        if (selectedAlert === 'halt' || selectedAlert === 'idle') {
          fields.push({
            label: 'Value',
            name: 'value',
            type: 'options',
          })
        } else {
          fields.push({
            label: 'Value',
            name: 'value',
            type: options ? 'multioptions' : 'text',
          })
        }
      }

      if (selectedAlert === 'halt' || selectedAlert === 'idle') {
        fields = fields.concat([
          {
            label: 'From',
            name: 'from',
            type: 'time',
          },
          {
            label: 'To',
            name: 'to',
            type: 'time',
          },
        ])
      }
    }

    if (selectedAlert === 'scheduleMaintenance') {
      fields = fields.concat([
        {
          label: 'Running Hours',
          name: 'runningHours',
          type: 'Number',
        },
        {
          label: 'Number of Days',
          name: 'numberOfDays',
          type: 'Number',
        },
        {
          label: 'Recurring ?',
          name: 'isRecurring',
          type: 'bool',
        },
      ])
    }

    if (selectedAlert === 'conditionalMaintenance') {
      fields = fields.concat([
        {
          label: 'Parameters',
          labelValue: ' Parameters Value',
          name: 'parametersData',
          type: 'parameters',
        },
      ])
    }

    fields = fields.concat([
      { label: 'Email', name: 'email', type: 'text' },
      { label: 'Phone', name: 'phone', type: 'text' },
    ])
    /* eslint-enable indent */

    return (
      <Dialog open={open} onClose={this.handleClose}>
        <DialogTitle>{title}</DialogTitle>

        <DialogContent>
          {dialogMode === 'EDIT_MULTIPLE' ? (
            <Grid container>
              {fields.map((field) => (
                <Grid item xs={12} key={field.name}>
                  <Grid container>
                    <Grid
                      item
                      xs={2}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                      }}
                    >
                      <Checkbox
                        color="primary"
                        value={field.name + 'Active'}
                        onChange={this.toggleCheckbox(field.name + 'Active')}
                        checked={this.state[field.name + 'Active']}
                      />
                    </Grid>

                    <Grid item xs={10}>
                      {field.type === 'Number' ? (
                        <Input
                          id={field.name}
                          label={field.label}
                          placeholder={field.label}
                          type="number"
                          value={this.state[field.name]}
                          onChange={this.handleChange(field.name)}
                          margin="dense"
                          fullWidth
                          disabled={!this.state[field.name + 'Active']}
                        />
                      ) : field.type === 'bool' ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            margin: '0.5rem',
                          }}
                        >
                          <Typography>{field.label}</Typography>
                          <Checkbox
                            color="primary"
                            value={field.name}
                            onChange={this.toggleCheckbox(field.name)}
                            // checked={this.state[field.name + 'Active']}
                            disabled={!this.state[field.name + 'Active']}
                          />
                        </div>
                      ) : field.type === 'parameters' ? (
                        <Grid container spacing={1}>
                          <Grid item container md={6}>
                            <Grid item md={12}>
                              <Typography variant="h6" component="h1">
                                {field.label}
                              </Typography>
                            </Grid>
                            <Grid item md={12}>
                              <Input
                                // className={classes.inputStyle}
                                name="searchTerm"
                                v
                                startAdornment={
                                  <InputAdornment position="start">
                                    <SearchIcon />
                                  </InputAdornment>
                                }
                                value={searchTerm}
                                onChange={this.handleSearchInputChange}
                              />
                            </Grid>
                            <Grid
                              item
                              md={12}
                              style={{ height: '10vh', overflowY: 'scroll' }}
                            >
                              {parametersData
                                .filter(
                                  ({ parameter }) =>
                                    parameter
                                      .toLowerCase()
                                      .indexOf(searchTerm.toLowerCase()) !== -1
                                )
                                .map((param) => {
                                  return (
                                    <Grid
                                      item
                                      container
                                      alignItems="center"
                                      spacing={1}
                                      wrap
                                      md={12}
                                    >
                                      <Grid item md={2}>
                                        <Checkbox
                                          color="primary"
                                          value={param.isEnable}
                                          onChange={this.handleParamCheck(
                                            param.pid
                                          )}
                                        />
                                      </Grid>
                                      <Grid item md={10}>
                                        {param.parameter}
                                      </Grid>
                                    </Grid>
                                  )
                                })}
                            </Grid>
                          </Grid>
                          <Grid item container md={6}>
                            <Grid item md={12}>
                              <Typography variant="h6" component="h1">
                                {field.labelValue}
                              </Typography>
                            </Grid>
                            <Grid
                              item
                              md={12}
                              style={{ height: '10vh', overflowY: 'scroll' }}
                            >
                              {parametersData
                                .filter(({ isEnable }) => isEnable)
                                .map((param) => {
                                  return (
                                    <Grid
                                      item
                                      container
                                      alignItems="center"
                                      spacing={1}
                                      wrap
                                      md={12}
                                    >
                                      <Grid item md={6}>
                                        <Typography>
                                          {param.parameter}
                                        </Typography>
                                      </Grid>
                                      <Grid item md={3}>
                                        <Input
                                          placeholder="Min Value"
                                          type="number"
                                          name="minValue"
                                          value={param.minValue}
                                          onChange={this.handleMinMaxChange(
                                            param.pid,
                                            'minValue'
                                          )}
                                        />
                                      </Grid>
                                      <Grid item md={3}>
                                        <Input
                                          placeholder="Max Value"
                                          type="number"
                                          name="maxValue"
                                          value={param.maxValue}
                                          onChange={this.handleMinMaxChange(
                                            param.pid,
                                            'maxValue'
                                          )}
                                        />
                                      </Grid>
                                    </Grid>
                                  )
                                })}
                            </Grid>
                          </Grid>
                        </Grid>
                      ) : field.type === 'text' ? (
                        <TextField
                          id={field.name}
                          label={field.label}
                          value={this.state[field.name]}
                          onChange={this.handleChange(field.name)}
                          margin="dense"
                          fullWidth
                          disabled={!this.state[field.name + 'Active']}
                        />
                      ) : field.type === 'time' ? (
                        <div
                          style={{
                            display: 'flex',
                            height: '100%',
                            alignItems: 'center',
                          }}
                        >
                          <InputLabel style={{ marginRight: 16 }}>
                            {field.label}
                          </InputLabel>

                          <input
                            required
                            type="time"
                            step="300"
                            value={getTimeString(this.state[field.name])}
                            disabled={!this.state[field.name + 'Active']}
                            onBlur={(e) => {
                              const [hour, minute] = getTimeFromString(
                                e.target.value
                              )

                              this.handleChange(field.name)({
                                target: {
                                  value:
                                    parseInt(hour * 60, 10) +
                                    parseInt(minute / 5, 10) * 5,
                                },
                              })
                            }}
                            onChange={(e) => {
                              const [hour, minute] = getTimeFromString(
                                e.target.value
                              )

                              this.handleChange(field.name)({
                                target: {
                                  value:
                                    parseInt(hour * 60, 10) +
                                    parseInt(minute, 10),
                                },
                              })
                            }}
                          />
                        </div>
                      ) : field.type === 'options' ? (
                        <FormControl>
                          <InputLabel htmlFor="value-selector">
                            Value
                          </InputLabel>

                          <Select
                            style={{ width: 100 }}
                            value={this.state[field.name]}
                            onChange={this.handleChange(field.name)}
                            disabled={!this.state[field.name + 'Active']}
                            inputProps={{
                              name: 'value',
                              id: 'value-selector',
                            }}
                          >
                            {options.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        <FormControl>
                          <InputLabel htmlFor="value-selector">
                            Value
                          </InputLabel>
                          <Select
                            style={{ width: 250 }}
                            multiple
                            value={this.state[field.name]}
                            disabled={!this.state[field.name + 'Active']}
                            inputProps={{
                              name: 'value',
                              id: 'value-selector',
                            }}
                            onChange={(e) => {
                              if (e.target.value.includes('SELECT_ALL')) {
                                if (
                                  parseInt(e.target.value.length, 10) ===
                                  parseInt(options.length, 10) + 1
                                ) {
                                  this.setState({ value: [] })
                                } else {
                                  this.setState({
                                    value: options.map((option) => option.id),
                                  })
                                }
                              } else {
                                this.setState({ value: e.target.value })
                              }
                            }}
                          >
                            <MenuItem key="SELECT_ALL" value="SELECT_ALL">
                              {parseInt(this.state[field.name].length, 10) ===
                              parseInt(options.length, 10)
                                ? 'Select None'
                                : 'Select All'}
                            </MenuItem>
                            {options.map((option) => (
                              <MenuItem key={option.id} value={option.id}>
                                {option.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          ) : (
            <DialogContentText>{content}</DialogContentText>
          )}
        </DialogContent>

        <DialogActions>
          <Button size="small" onClick={this.handleClose}>
            {dialogCancelButtonTitle}
          </Button>

          <ColorButton
            onClick={() => {
              const value = {
                ...(this.state.emailActive && { email: this.state.email }),
                ...(this.state.phoneActive && { phone: this.state.phone }),
                ...(this.state.fromActive && { from: this.state.from }),
                ...(this.state.toActive && { to: this.state.to }),
                ...(this.state.runningHoursActive && {
                  runningHours: this.state.runningHours,
                }),
                ...(this.state.numberOfDaysActive && {
                  numberOfDays: this.state.numberOfDays,
                }),
                ...(this.state.isRecurringActive && {
                  isRecurring: this.state.isRecurring,
                }),
                ...(this.state.parametersDataActive && {
                  parametersData: this.state.parametersData,
                }),
                ...(hasValue &&
                  this.state.valueActive && { value: this.state.value }),
              }
              onSubmit(value)
              this.resetState()
              this.handleClose()
            }}
            size="small"
            color="primary"
            variant="contained"
          >
            {dialogSubmitButtonTitle}
          </ColorButton>
        </DialogActions>
      </Dialog>
    )
  }
}

DisabledTableDialog.propTypes = {
  dialogMode: PropTypes.oneOf(['EDIT_MULTIPLE', 'CONFIRMATION']).isRequired,
  title: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  content: PropTypes.string,
}

export default DisabledTableDialog
