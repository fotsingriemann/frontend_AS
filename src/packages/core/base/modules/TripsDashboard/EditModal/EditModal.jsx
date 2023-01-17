/**
 * Trip edit modal component
 * @module EditModal
 */

import React, { Component } from 'react'
import AddIcon from '@material-ui/icons/Add'
import ClearIcon from '@material-ui/icons/Clear'
import { DateTimePicker, DatePicker } from '@material-ui/pickers'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import DateRangeIcon from '@material-ui/icons/DateRange'
import TimeRangeIcon from '@material-ui/icons/AccessTime'
import {
  withStyles,
  Modal,
  Button,
  Grid,
  Typography,
  TextField,
  Checkbox,
  Divider,
  IconButton,
} from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

const styles = (theme) => ({
  paper: {
    position: 'absolute',
    width: theme.spacing(50),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
    height: 500,
    overflow: 'auto',
  },
  buttonContainer: {
    marginTop: 15,
  },
  button: {
    margin: theme.spacing(1),
  },
})

/**
 * Modal style
 * @function getModalStyle
 * @return {Object} Style object to place modal on center of screen
 * @summary Function to return modal style
 */
function getModalStyle() {
  const top = 50
  const left = 50

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  }
}

class EditModal extends Component {
  /**
   * @function handleTripNameChange
   * @param {object} event Trip name string change object
   * @summary Handles trip name change
   */
  handleTripNameChange = (event) => {
    this.props.handleTripNameChange(event.target.value)
  }

  /**
   * @function handleToleranceChange
   * @param {object} event Tolerance string change object
   * @summary Handles tolerance change
   */
  handleToleranceChange = (event) => {
    this.props.onToleranceChange(event.target.value)
  }

  /**
   * @function handleEmailChange
   * @param {number} index Index at which email is changed
   * @param {object} event Email string change object
   * @summary Handles email change
   */
  handleEmailChange = (index) => (event) => {
    this.props.onEmailChange(event.target.value, index)
  }

  /**
   * @function handleNumberChange
   * @param {number} index Index at which phone number is changed
   * @param {object} event Number string change object
   * @summary Handles phone number change
   */
  handleNumberChange = (index) => (event) => {
    this.props.onNumberChange(event.target.value, index)
  }

  /**
   * @function handleDateChange
   * @param {string} key Type of date changed
   * @param {object} date Changed date object
   * @summary Handles trip date change
   */
  handleDateChange = (key) => (date) => {
    this.props.onDateChange(key, date)
  }

  /**
   * @function handleDayChange
   * @param {object} value Day change object
   * @param {object} event Checkbox select/deselect event
   * @summary Day change in checkbox array during trip edit handler
   */
  handleDayChange = (value) => (event) => {
    const checkboxState = event.target.checked
    this.props.onDayChange(checkboxState, value)
  }

  /**
   * @function handleClose
   * @summary Call edit cancelled handler if edit is closed by user
   */
  handleClose = () => {
    this.props.handleEditDone(false)
  }

  render() {
    const {
      classes,
      openModal,
      tolerance,
      tripName,
      emails,
      numbers,
      fromDate,
      toDate,
      dayOfWeek,
      isSchedulingActive,
      scheduleToTimestamp,
    } = this.props

    return (
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={openModal}
        onClose={this.handleClose}
      >
        <div style={getModalStyle()} className={classes.paper}>
          <Grid container spacing={1} style={{ padding: '8px', width: '100%' }}>
            <Grid item sm={12}>
              <Grid container spacing={1} justify="flex-start">
                <Grid item sm={12}>
                  <Grid container>
                    <Grid item xs={12} className={classes.textField}>
                      <TextField
                        id="Name"
                        value={tripName}
                        onChange={this.handleTripNameChange}
                        margin="normal"
                        placeholder="Trip name"
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} sm={9}>
                  <DateTimePicker
                    leftArrowIcon={<ChevronLeftIcon />}
                    rightArrowIcon={<ChevronRightIcon />}
                    dateRangeIcon={<DateRangeIcon />}
                    timeIcon={<TimeRangeIcon />}
                    value={fromDate}
                    onChange={this.handleDateChange('fromDate')}
                    label="Trip start time"
                    disablePast={true}
                  />
                </Grid>
                <Grid item xs={12} sm={9}>
                  <DateTimePicker
                    leftArrowIcon={<ChevronLeftIcon />}
                    rightArrowIcon={<ChevronRightIcon />}
                    dateRangeIcon={<DateRangeIcon />}
                    timeIcon={<TimeRangeIcon />}
                    value={toDate}
                    onChange={this.handleDateChange('toDate')}
                    label="Trip end time"
                    disablePast={true}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item sm={12}>
              <Grid container>
                <Grid item xs={12} className={classes.textField}>
                  <TextField
                    id="tolerance"
                    value={tolerance}
                    onChange={this.handleToleranceChange}
                    type="number"
                    margin="normal"
                    placeholder="Tolerance"
                    helperText="in minutes"
                  />
                </Grid>
              </Grid>
            </Grid>

            {isSchedulingActive && dayOfWeek.length > 0 && (
              <div>
                <Grid item sm={12}>
                  <Grid
                    container
                    className={classes.textField}
                    justify="center"
                    alignItems="center"
                  >
                    <Grid item sm={12}>
                      <Typography color="textSecondary">
                        Days of week
                      </Typography>
                    </Grid>
                    <Grid item sm={12}>
                      <Grid
                        container
                        alignItems="center"
                        justify="space-around"
                      >
                        <Grid item sm={1}>
                          <Grid container justify="center">
                            <Grid item>
                              <Checkbox
                                color="primary"
                                checked={dayOfWeek[0].status}
                                disabled={dayOfWeek[0].disable}
                                onChange={this.handleDayChange(0)}
                                value="0"
                              />
                            </Grid>
                            <Grid item>
                              <Grid container justify="space-around">
                                <Grid item>
                                  <Typography
                                    color={
                                      dayOfWeek[0].disable
                                        ? 'textSecondary'
                                        : 'default'
                                    }
                                  >
                                    Mon
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>

                        <Grid item sm={1}>
                          <Grid container justify="center">
                            <Grid item>
                              <Checkbox
                                color="primary"
                                checked={dayOfWeek[1].status}
                                disabled={dayOfWeek[1].disable}
                                onChange={this.handleDayChange(1)}
                                value="1"
                              />
                            </Grid>
                            <Grid item>
                              <Grid container justify="space-around">
                                <Grid item>
                                  <Typography
                                    color={
                                      dayOfWeek[0].disable
                                        ? 'textSecondary'
                                        : 'default'
                                    }
                                  >
                                    Tue
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>

                        <Grid item sm={1}>
                          <Grid container justify="center">
                            <Grid item>
                              <Checkbox
                                color="primary"
                                checked={dayOfWeek[2].status}
                                disabled={dayOfWeek[2].disable}
                                onChange={this.handleDayChange(2)}
                                value="2"
                              />
                            </Grid>
                            <Grid item>
                              <Grid container justify="space-around">
                                <Grid item>
                                  <Typography
                                    color={
                                      dayOfWeek[0].disable
                                        ? 'textSecondary'
                                        : 'default'
                                    }
                                  >
                                    Wed
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>

                        <Grid item sm={1}>
                          <Grid container justify="center">
                            <Grid item>
                              <Checkbox
                                color="primary"
                                checked={dayOfWeek[3].status}
                                disabled={dayOfWeek[3].disable}
                                onChange={this.handleDayChange(3)}
                                value="3"
                              />
                            </Grid>
                            <Grid item>
                              <Grid container justify="space-around">
                                <Grid item>
                                  <Typography
                                    color={
                                      dayOfWeek[0].disable
                                        ? 'textSecondary'
                                        : 'default'
                                    }
                                  >
                                    Thu
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>

                        <Grid item sm={1}>
                          <Grid container justify="center">
                            <Grid item>
                              <Checkbox
                                color="primary"
                                checked={dayOfWeek[4].status}
                                disabled={dayOfWeek[4].disable}
                                onChange={this.handleDayChange(4)}
                                value="4"
                              />
                            </Grid>
                            <Grid item>
                              <Grid container justify="space-around">
                                <Grid item>
                                  <Typography
                                    color={
                                      dayOfWeek[0].disable
                                        ? 'textSecondary'
                                        : 'default'
                                    }
                                  >
                                    Fri
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>

                        <Grid item sm={1}>
                          <Grid container justify="center">
                            <Grid item>
                              <Checkbox
                                color="primary"
                                checked={dayOfWeek[5].status}
                                disabled={dayOfWeek[5].disable}
                                onChange={this.handleDayChange(5)}
                                value="5"
                              />
                            </Grid>
                            <Grid item>
                              <Grid container justify="space-around">
                                <Grid item>
                                  <Typography
                                    color={
                                      dayOfWeek[0].disable
                                        ? 'textSecondary'
                                        : 'default'
                                    }
                                  >
                                    Sat
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>

                        <Grid item sm={1}>
                          <Grid container justify="center">
                            <Grid item>
                              <Checkbox
                                color="primary"
                                checked={dayOfWeek[6].status}
                                disabled={dayOfWeek[6].disable}
                                onChange={this.handleDayChange(6)}
                                value="6"
                              />
                            </Grid>
                            <Grid item>
                              <Grid container justify="space-around">
                                <Grid item>
                                  <Typography
                                    color={
                                      dayOfWeek[0].disable
                                        ? 'textSecondary'
                                        : 'default'
                                    }
                                  >
                                    Sun
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item sm={12}>
                  <Grid
                    container
                    spacing={1}
                    justify="flex-start"
                    className={classes.textField}
                  >
                    <Grid item xs={12} sm={9}>
                      <DatePicker
                        value={scheduleToTimestamp}
                        leftArrowIcon={<ChevronLeftIcon />}
                        rightArrowIcon={<ChevronRightIcon />}
                        onChange={this.handleDateChange('scheduleToTimestamp')}
                        label="Schedule upto"
                        disablePast={true}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </div>
            )}

            <Grid item xs={12} style={{ marginTop: 10, marginBottom: 10 }}>
              <Divider />
            </Grid>

            <Grid item xs={12}>
              <Grid container justify="space-between">
                <Grid item sm={12}>
                  <Typography color="textSecondary">
                    Alert configuration (Optional)
                  </Typography>
                </Grid>

                {emails &&
                  emails.map((email, index) => (
                    <Grid item xs={12} key={index}>
                      <Grid container>
                        <Grid item xs={8}>
                          <TextField
                            id="email"
                            label="Email"
                            placeholder="Enter email"
                            value={email}
                            onChange={this.handleEmailChange(index)}
                          />
                        </Grid>
                        <Grid item xs={2}>
                          {emails.length - 1 === index && (
                            <IconButton
                              color="default"
                              aria-label="Add"
                              className={classes.fab}
                              onClick={this.props.handleAddEmailField}
                            >
                              <AddIcon />
                            </IconButton>
                          )}
                        </Grid>

                        <Grid item xs={2}>
                          {emails.length > 1 && (
                            <IconButton
                              color="default"
                              aria-label="Delete"
                              className={classes.fab}
                              onClick={() =>
                                this.props.handleDeleteEmailField(index)
                              }
                            >
                              <ClearIcon />
                            </IconButton>
                          )}
                        </Grid>
                      </Grid>
                    </Grid>
                  ))}

                {numbers &&
                  numbers.map((number, index) => (
                    <Grid item xs={12} key={index}>
                      <Grid container>
                        <Grid item xs={8}>
                          <TextField
                            id="number"
                            label="Mobile Number"
                            placeholder="Enter mobile number"
                            value={number}
                            onChange={this.handleNumberChange(index)}
                            type="number"
                          />
                        </Grid>
                        <Grid item xs={2}>
                          {numbers.length - 1 === index && (
                            <IconButton
                              color="default"
                              aria-label="Add"
                              className={classes.fab}
                              onClick={this.props.handleAddNumberField}
                            >
                              <AddIcon />
                            </IconButton>
                          )}
                        </Grid>
                        <Grid item xs={2}>
                          {numbers.length > 1 && (
                            <IconButton
                              color="default"
                              aria-label="Delete"
                              className={classes.fab}
                              onClick={() =>
                                this.props.handleDeleteNumberField(index)
                              }
                            >
                              <ClearIcon />
                            </IconButton>
                          )}
                        </Grid>
                      </Grid>
                    </Grid>
                  ))}
              </Grid>
            </Grid>
          </Grid>

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
                onClick={() => this.props.handleEditDone(false)}
              >
                Cancel
              </ColorButton>
            </Grid>
            <Grid item>
              <ColorButton
                style={styles.button}
                color="primary"
                variant="contained"
                onClick={() => this.props.handleEditDone(true)}
              >
                Save
              </ColorButton>
            </Grid>
          </Grid>
        </div>
      </Modal>
    )
  }
}

export default withStyles(styles)(EditModal)
