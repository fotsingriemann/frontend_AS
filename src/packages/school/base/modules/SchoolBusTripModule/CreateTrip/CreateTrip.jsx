import React, { Component } from 'react'
import moment from 'moment'
import { TimePicker } from '@material-ui/pickers'
import ComboBox from '@zeliot/common/ui/ComboBox'

import {
  Typography,
  Radio,
  FormGroup,
  FormControlLabel,
  Card,
  withStyles,
  CardContent,
  Grid,
  TextField,
  Button,
  Checkbox,
} from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

// import RouteDetailExpansion from '../RouteDetailExpansion/RouteDetailExpansion'

const styles = (theme) => ({
  waypointsCard: {
    overflow: 'auto',
    height: 450,
  },
  textField: {
    marginTop: theme.spacing(1),
    marginButtom: theme.spacing(1),
  },
  button: {
    margin: theme.spacing(1),
  },
})

const weekdayNames = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

class CreateTrip extends Component {
  handleSchoolStartTimeChange = (value) => {
    this.props.onSchoolStartTimeChange(value)
  }

  handleSchoolEndTimeChange = (value) => {
    this.props.onSchoolEndTimeChange(value)
  }

  handleStopTimeChange = (event) => {
    this.props.onStopTimeChange(event.target.value)
  }

  onGetEta = () => {
    this.props.onGetEta()
  }

  handleToleranceChange = (event) => {
    this.props.onToleranceChange(event.target.value)
  }

  handleRadioChange = (event) => {
    this.props.handleRadioChange(event.target.value)
  }

  autoAssignBuses = () => {
    this.props.onAutoAssignBuses()
  }

  handleDayChange = (value) => (event) => {
    const checkboxState = event.target.checked
    this.props.onDayChange(checkboxState, value)
  }

  getConfiguredWeekdays = () => {
    const configuredDays = []
    this.props.dayOfWeek.forEach((day, index) => {
      if (day) {
        configuredDays.push(weekdayNames[index])
      }
    })
    return configuredDays
  }

  saveTrip = () => {
    this.props.saveTrip()
  }

  clearTrip = () => {
    this.props.clearTrip()
  }

  handleSchedulingFrequencyChange = (event) => {
    this.props.onSchedulingFrequencyChange(event.target.value)
  }

  getFrequency = (frequency) => {
    switch (frequency) {
      case 'Weekly':
        return 'For next week'
      case 'Monthly':
        return 'For next month'
      case 'Quarterly':
        return 'For next 4 months'
      case 'Half Yearly':
        return 'For half year'
      case 'Yearly':
        return 'For next year'
      default:
        return 'For sometime'
    }
  }

  render() {
    const {
      classes,
      radioSelection,
      routes,
      selectedRoute,
      schoolTime,
      stopTime,
      tolerance,
      allEtaConfigured,
      isScheduled,
      dayOfWeek,
      schedulingFrequency,
    } = this.props
    return (
      <Card square elevation={8} className={classes.waypointsCard}>
        <CardContent>
          <Typography color="textSecondary">Trip type</Typography>
          <FormGroup row>
            <FormControlLabel
              value="pickup"
              control={
                <Radio
                  color="primary"
                  checked={radioSelection === 'pickup'}
                  onChange={this.handleRadioChange}
                  value="pickup"
                  aria-label="pickup"
                />
              }
              label="Pickup"
            />
            <FormControlLabel
              value="drop"
              control={
                <Radio
                  color="primary"
                  checked={radioSelection === 'drop'}
                  onChange={this.handleRadioChange}
                  value="drop"
                  aria-label="drop"
                />
              }
              label="Drop"
            />
          </FormGroup>
          <Grid container>
            <Grid item sm={12} className={classes.textField}>
              <Typography color="textSecondary">Assign route</Typography>
              <ComboBox
                items={routes || []}
                selectedItem={selectedRoute}
                onSelectedItemChange={this.props.handleRouteChange}
                placeholder="Choose oute"
                isLoading={false}
                itemKey="id"
                itemToStringKey="routeName"
              />
            </Grid>
          </Grid>
          <Grid container className={classes.textField}>
            <Grid item sm={12} className={classes.textField}>
              {selectedRoute && (
                <div>
                  {radioSelection === 'pickup' ? (
                    <div>
                      <Grid
                        container
                        className={classes.textField}
                        justify="center"
                        alignItems="center"
                      >
                        <Grid item sm={6}>
                          <Typography color="textSecondary">
                            School Start Time
                          </Typography>
                        </Grid>
                        <Grid item sm={6}>
                          {!allEtaConfigured ? (
                            <div className="picker">
                              {
                                <TimePicker
                                  value={schoolTime}
                                  onChange={this.handleSchoolStartTimeChange}
                                />
                              }
                            </div>
                          ) : (
                            <Typography align="center">
                              {moment(schoolTime).format('hh:mm:ss a')}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    </div>
                  ) : (
                    <div>
                      <Grid
                        container
                        className={classes.textField}
                        justify="center"
                        alignItems="center"
                      >
                        <Grid item sm={6}>
                          <Typography color="textSecondary">
                            School End Time
                          </Typography>
                        </Grid>
                        <Grid item sm={6}>
                          {!allEtaConfigured ? (
                            <div className="picker">
                              <TimePicker
                                value={schoolTime}
                                onChange={this.handleSchoolEndTimeChange}
                              />
                            </div>
                          ) : (
                            <Typography align="center">
                              {moment(schoolTime).format('hh:mm:ss a')}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    </div>
                  )}
                  <Grid
                    container
                    className={classes.textField}
                    justify="center"
                    alignItems="center"
                  >
                    <Grid item sm={6}>
                      <Typography color="textSecondary">
                        Wait time on each stop (in minutes)
                      </Typography>
                    </Grid>
                    <Grid item sm={6}>
                      {!allEtaConfigured ? (
                        <TextField
                          id="standard-number"
                          value={stopTime}
                          onChange={this.handleStopTimeChange}
                          type="number"
                          margin="normal"
                        />
                      ) : (
                        <Typography align="center">{stopTime}</Typography>
                      )}
                    </Grid>
                  </Grid>
                  <Grid
                    container
                    className={classes.textField}
                    justify="center"
                    alignItems="center"
                  >
                    <Grid item sm={6}>
                      <Typography color="textSecondary">
                        Tolerance duration (in minutes)
                      </Typography>
                    </Grid>
                    <Grid item sm={6}>
                      {!allEtaConfigured ? (
                        <TextField
                          id="standard-number"
                          value={tolerance}
                          onChange={this.handleToleranceChange}
                          type="number"
                          margin="normal"
                        />
                      ) : (
                        <Typography align="center">{tolerance}</Typography>
                      )}
                    </Grid>
                  </Grid>
                  {!allEtaConfigured ? (
                    <Grid
                      container
                      className={classes.textField}
                      justify="flex-end"
                      alignItems="center"
                    >
                      <Grid item>
                        <ColorButton
                          variant="contained"
                          color="primary"
                          className={classes.button}
                          onClick={this.onGetEta}
                        >
                          Get ETA
                        </ColorButton>
                      </Grid>
                    </Grid>
                  ) : !isScheduled ? (
                    <div>
                      <Grid
                        container
                        className={classes.textField}
                        justify="center"
                        alignItems="center"
                      >
                        <Grid item sm={12}>
                          <Typography variant="button">Schedule</Typography>
                        </Grid>
                        <Grid item sm={12}>
                          <Typography color="textSecondary">
                            Days of week
                          </Typography>
                        </Grid>
                        <Grid item sm={12}>
                          <Grid
                            container
                            alignItems="center"
                            justify="space-between"
                          >
                            <Grid item sm={1}>
                              <Grid container>
                                <Grid item sm={12}>
                                  <Checkbox
                                    color="primary"
                                    checked={dayOfWeek[0]}
                                    onChange={this.handleDayChange(0)}
                                    value="0"
                                  />
                                </Grid>
                                <Grid item sm={12}>
                                  <Grid container justify="space-around">
                                    <Grid item sm={12}>
                                      <Typography>Mon</Typography>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Grid>

                            <Grid item sm={1}>
                              <Grid container>
                                <Grid item sm={12}>
                                  <Checkbox
                                    color="primary"
                                    checked={dayOfWeek[1]}
                                    onChange={this.handleDayChange(1)}
                                    value="1"
                                  />
                                </Grid>
                                <Grid item sm={12}>
                                  <Grid container justify="space-around">
                                    <Grid item sm={12}>
                                      <Typography>Tue</Typography>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Grid>

                            <Grid item sm={1}>
                              <Grid container>
                                <Grid item sm={12}>
                                  <Checkbox
                                    color="primary"
                                    checked={dayOfWeek[2]}
                                    onChange={this.handleDayChange(2)}
                                    value="2"
                                  />
                                </Grid>
                                <Grid item sm={12}>
                                  <Grid container justify="space-around">
                                    <Grid item sm={12}>
                                      <Typography>Wed</Typography>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Grid>

                            <Grid item sm={1}>
                              <Grid container>
                                <Grid item sm={12}>
                                  <Checkbox
                                    color="primary"
                                    checked={dayOfWeek[3]}
                                    onChange={this.handleDayChange(3)}
                                    value="3"
                                  />
                                </Grid>
                                <Grid item sm={12}>
                                  <Grid container justify="space-around">
                                    <Grid item sm={12}>
                                      <Typography>Thu</Typography>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Grid>

                            <Grid item sm={1}>
                              <Grid container>
                                <Grid item sm={12}>
                                  <Checkbox
                                    color="primary"
                                    checked={dayOfWeek[4]}
                                    onChange={this.handleDayChange(4)}
                                    value="4"
                                  />
                                </Grid>
                                <Grid item sm={12}>
                                  <Grid container justify="space-around">
                                    <Grid item sm={12}>
                                      <Typography>Fri</Typography>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Grid>

                            <Grid item sm={1}>
                              <Grid container>
                                <Grid item sm={12}>
                                  <Checkbox
                                    color="primary"
                                    checked={dayOfWeek[5]}
                                    onChange={this.handleDayChange(5)}
                                    value="5"
                                  />
                                </Grid>
                                <Grid item sm={12}>
                                  <Grid container justify="space-around">
                                    <Grid item sm={12}>
                                      <Typography>Sat</Typography>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Grid>

                            <Grid item sm={1}>
                              <Grid container>
                                <Grid item sm={12}>
                                  <Checkbox
                                    color="primary"
                                    checked={dayOfWeek[6]}
                                    onChange={this.handleDayChange(6)}
                                    value="6"
                                  />
                                </Grid>
                                <Grid item sm={12}>
                                  <Grid container justify="space-around">
                                    <Grid item sm={12}>
                                      <Typography>Sun</Typography>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid item sm={12}>
                            <Typography color="textSecondary">
                              Frequency
                            </Typography>
                          </Grid>
                          <Grid item sm={12}>
                            <Grid
                              container
                              justify="space-between"
                              className={classes.textField}
                            >
                              <Grid item sm={2}>
                                <Grid container>
                                  <Grid item sm={12}>
                                    <Radio
                                      color="primary"
                                      checked={schedulingFrequency === 'Weekly'}
                                      onChange={
                                        this.handleSchedulingFrequencyChange
                                      }
                                      value="Weekly"
                                      aria-label="A"
                                    />
                                  </Grid>
                                  <Grid item sm={12}>
                                    <Typography>Week</Typography>
                                  </Grid>
                                </Grid>
                              </Grid>

                              <Grid item sm={2}>
                                <Grid container>
                                  <Grid item sm={12}>
                                    <Radio
                                      color="primary"
                                      checked={
                                        schedulingFrequency === 'Monthly'
                                      }
                                      onChange={
                                        this.handleSchedulingFrequencyChange
                                      }
                                      value="Monthly"
                                      aria-label="A"
                                    />
                                  </Grid>
                                  <Grid item sm={12}>
                                    <Typography>Month</Typography>
                                  </Grid>
                                </Grid>
                              </Grid>

                              <Grid item sm={2}>
                                <Grid container>
                                  <Grid item sm={12}>
                                    <Radio
                                      color="primary"
                                      checked={
                                        schedulingFrequency === 'Quarterly'
                                      }
                                      onChange={
                                        this.handleSchedulingFrequencyChange
                                      }
                                      value="Quarterly"
                                      aria-label="A"
                                    />
                                  </Grid>

                                  <Grid item sm={12}>
                                    <Typography>Quarter</Typography>
                                  </Grid>
                                </Grid>
                              </Grid>

                              <Grid item sm={2}>
                                <Grid container>
                                  <Grid item sm={12}>
                                    <Radio
                                      color="primary"
                                      checked={
                                        schedulingFrequency === 'Half Yearly'
                                      }
                                      onChange={
                                        this.handleSchedulingFrequencyChange
                                      }
                                      value="Half Yearly"
                                      aria-label="A"
                                    />
                                  </Grid>
                                  <Grid item sm={12}>
                                    <Typography>Half Year</Typography>
                                  </Grid>
                                </Grid>
                              </Grid>

                              <Grid item sm={2}>
                                <Grid container>
                                  <Grid item sm={12}>
                                    <Radio
                                      color="primary"
                                      checked={schedulingFrequency === 'Yearly'}
                                      onChange={
                                        this.handleSchedulingFrequencyChange
                                      }
                                      value="Yearly"
                                      aria-label="A"
                                    />
                                  </Grid>
                                  <Grid item sm={12}>
                                    <Typography>Year</Typography>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>

                        <Grid
                          container
                          className={classes.textField}
                          justify="flex-end"
                        >
                          <Grid item>
                            <ColorButton
                              variant="contained"
                              color="primary"
                              className={classes.button}
                              onClick={this.autoAssignBuses}
                            >
                              Schedule and Auto-Assign Buses
                            </ColorButton>
                          </Grid>
                        </Grid>
                      </Grid>
                    </div>
                  ) : (
                    <div>
                      <Grid
                        container
                        className={classes.textField}
                        justify="center"
                        alignItems="center"
                      >
                        <Grid item sm={6}>
                          <Typography color="textSecondary">
                            Scheduled for
                          </Typography>
                        </Grid>
                        <Grid item sm={6}>
                          <Typography align="center">
                            {this.getConfiguredWeekdays().join(', ')}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid
                        container
                        className={classes.textField}
                        justify="center"
                        alignItems="center"
                      >
                        <Grid item sm={6}>
                          <Typography color="textSecondary">
                            Frequency
                          </Typography>
                        </Grid>
                        <Grid item sm={6}>
                          <Typography align="center">
                            {this.getFrequency(schedulingFrequency)}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid
                        container
                        justify="flex-end"
                        className={classes.textField}
                      >
                        <Grid item>
                          <ColorButton
                            variant="contained"
                            color="default"
                            className={classes.button}
                            onClick={this.clearTrip}
                          >
                            Clear
                          </ColorButton>
                        </Grid>
                        <Grid item>
                          <ColorButton
                            variant="contained"
                            color="primary"
                            className={classes.button}
                            onClick={this.saveTrip}
                          >
                            Save
                          </ColorButton>
                        </Grid>
                      </Grid>
                    </div>
                  )}
                </div>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    )
  }
}

export default withStyles(styles)(CreateTrip)
