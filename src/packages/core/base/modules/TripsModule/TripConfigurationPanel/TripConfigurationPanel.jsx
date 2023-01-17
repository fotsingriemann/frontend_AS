/**
 * Trip configuration component
 * @module TripConfigurationPanel
 */

import React, { Component } from 'react'
import ComboBox from '@zeliot/common/ui/ComboBox'
import AddIcon from '@material-ui/icons/Add'
import ClearIcon from '@material-ui/icons/Clear'
import { DateTimePicker, DatePicker } from '@material-ui/pickers'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import DateRangeIcon from '@material-ui/icons/DateRange'
import TimeRangeIcon from '@material-ui/icons/AccessTime'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
import {
  withStyles,
  Card,
  CardActions,
  CardContent,
  Button,
  Grid,
  Typography,
  TextField,
  Checkbox,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Radio,
  FormGroup,
  Modal,
  CircularProgress,
} from '@material-ui/core'

//create route component dependencies
// import buffer from '@turf/buffer'
// import { Link } from 'react-router-dom'
import { withApollo } from 'react-apollo'
import SimpleModal from '@zeliot/common/ui/SimpleModal'
import withGoogleMaps from '@zeliot/common/hoc/withGoogleMaps'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
// import Map from '@zeliot/core/base/modules/TrackingControls/Maps/Map'
import Waypoints from '../../RoutesModule/Waypoints/Waypoints.jsx'
//  import {
//   GET_ALL_ROUTES,
//   ADD_ROUTE,
//   GET_ALL_AREAS,
//   GET_AREA_INFO,
//   ADD_AREA,
// } from '@zeliot/common/graphql/queries'
// import getLoginId from '@zeliot/common/utils/getLoginId'
// import getCustomPopup from '../../RoutesModule/CustomPopup/CustomPopup'
// import axios from 'axios'
// import gql from 'graphql-tag'
// import { DownloadProgressDialogConsumer } from '@zeliot/common/shared/DownloadProgressDialog/DownloadProgressDialog.context'
// import { getItem } from '../../../../../../storage'

import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

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
  chip: {
    margin: theme.spacing(1),
  },
  textField: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  textFieldSide: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    width: 100,
  },
  fab: {
    margin: theme.spacing(1),
  },
})

class TripConfigurationPanel extends Component {
  /**
   * @function saveTrip
   * @summary Call save trip handler when trip is saved by user
   */
  saveTrip = () => {
    this.props.onSaveTrip()
  }

  /**
   * @function handleVehicleChange
   * @param {object} selectedVehicle Vehicle selected for trip
   * @summary Call selected vehicle change handler
   */
  handleVehicleChange = (selectedVehicle) => {
    this.props.handleVehicleChange(selectedVehicle)
  }

  /**
   * @function handleRouteChange
   * @param {object} selectedRouteNew Route selected for trip
   * @summary Call selected route change handler
   */
  handleRouteChange = (selectedRouteNew) => {
    this.props.handleRouteChange(selectedRouteNew)
  }

  handleTripType = (selectedTripType) => {
    this.props.handleTripType(selectedTripType)
  }

  /**
   * @function handleToleranceChange
   * @param {object} event Tolerance text change event
   * @summary Call tolerance change handler
   */
  handleToleranceChange = (event) => {
    this.props.onToleranceChange(event.target.value)
  }

  /**
   * @function handleEmailChange
   * @param {number} index Index of email changed amongst list of emails
   * @param {object} event Email text change event
   * @summary Call email change handler
   */
  handleEmailChange = (index) => (event) => {
    this.props.onEmailChange(event.target.value, index)
  }

  /**
   * @function handleNumberChange
   * @param {number} index Index of phone number changed amongst list of numbers
   * @param {object} event Number text change event
   * @summary Call Number change handler
   */
  handleNumberChange = (index) => (event) => {
    this.props.onNumberChange(event.target.value, index)
  }

  /**
   * @function handleDateChange
   * @param {string} key Key signifies the date which is changed. ex. It can be from date or to date
   * @param {object} date Changed date object
   * @summary Call date change handler
   */
  handleDateChange = (key) => (date) => {
    this.props.onDateChange(key, date)
  }

  /**
   * @function handleDayChange
   * @param {string} value Value of day changed
   * @param {object} event Day change event
   * @summary Change checkbox state and call day change handler
   */
  handleDayChange = (value) => (event) => {
    const checkboxState = event.target.checked
    this.props.onDayChange(checkboxState, value)
  }

  /**
   * @function handleRadioChange
   * @param {object} event Radio button event
   * @summary Call radio button changed handler
   */
  handleRadioChangeOld = (event) => {
    this.props.onSelectionChangedOld(event.target.value)
  }

  handleRadioChangeNew = (event) => {
    this.props.onSelectionChangedNew(event.target.value)
    this.props.onClearRouteOfRadioChange()
  }

  render() {
    const {
      classes,
      vehicles,
      selectedVehicle,
      tripTypes,
      selectedTripType,
      routes,
      selectedRouteNew,
      tolerance,
      emails,
      numbers,
      fromDate,
      toDate,
      dayOfWeek,
      isSchedulingActive,
      scheduledUpto,
      radioSelectionOld,
      plan,
      radioSelectionNew,
      google,
      isRouteDrawn, //routes props states waypoints start
      aois,
      selectedAoi,
      distance,
      radioSelection,
      places,
      placesCoordinates,
      showShortestRoute,
      onSelectedAoiChange, //routes props functions waypoints start
      onFenceDistanceChange,
      onSelectionChanged,
      getCoordinates,
      onNewPlace,
      handlePlaceError,
      onPlaceDelete,
      defineAoiType,
      onRouteOptimization,
      onViewRoute,
      onClearRoute,
      onSaveRoute,
      onAoiListDragEnd,
      modalOpen, //routes props functions SimpleModal
      handleModalClose,
      saveAs,
      handleModalFieldNameChange,
      isWaypointsOpen, //waypoints open
      isCardPresent, //for removal of card
      selectedLanguage,
    } = this.props

    return (
      <Card square elevation={8} style={{ height: '450px', overflow: 'auto' }}>
        <CardContent>
          <Grid container spacing={1} style={{ padding: '8px', width: '100%' }}>
            {plan === 'School Plan' && (
              <Grid item sm={12} className={classes.textField}>
                <Typography color="textSecondary">Choose trip type</Typography>
                <FormGroup row>
                  <FormControlLabel
                    value="pickup"
                    control={
                      <Radio
                        color="primary"
                        checked={radioSelectionOld === 'PICKUP'}
                        onChange={this.handleRadioChangeOld}
                        value="PICKUP"
                        aria-label="PICKUP"
                      />
                    }
                    label="Pickup"
                  />
                  <FormControlLabel
                    value="aoi"
                    control={
                      <Radio
                        color="primary"
                        checked={radioSelectionOld === 'DROP'}
                        onChange={this.handleRadioChangeOld}
                        value="DROP"
                        aria-label="DROP"
                      />
                    }
                    label="Drop"
                  />
                </FormGroup>
              </Grid>
            )}

            <Grid item sm={12} className={classes.textField}>
              <Typography color="textSecondary">
                {
                  languageJson[selectedLanguage].tripsPage.tripCreation
                    .assignVehicleLabel
                }
              </Typography>
              <ComboBox
                items={vehicles || []}
                selectedItem={selectedVehicle}
                onSelectedItemChange={this.handleVehicleChange}
                placeholder={
                  languageJson[selectedLanguage].common.chooseVehicle
                }
                isLoading={false}
                itemKey="entityId"
                itemToStringKey="vehicleNumber"
                filterSize={25}
              />
            </Grid>

            <FormGroup row>
              <FormControlLabel
                value="assign"
                control={
                  <Radio
                    color="primary"
                    checked={radioSelectionNew === 'assign'}
                    onChange={this.handleRadioChangeNew}
                    value="assign"
                    aria-label="assign"
                  />
                }
                label={
                  languageJson[selectedLanguage].tripsPage.tripCreation
                    .assignLabel
                }
              />
              <FormControlLabel
                value="create"
                control={
                  <Radio
                    color="primary"
                    checked={radioSelectionNew === 'create'}
                    onChange={this.handleRadioChangeNew}
                    value="create"
                    aria-label="create"
                  />
                }
                label={
                  languageJson[selectedLanguage].tripsPage.tripCreation
                    .assignAndCreateLabel
                }
              />
            </FormGroup>

            {radioSelectionNew === 'assign' ? (
              <Grid item sm={12} className={classes.textField}>
                <Typography color="textSecondary">
                  {
                    languageJson[selectedLanguage].tripsPage.tripCreation
                      .assignRouteLabel
                  }
                </Typography>
                <ComboBox
                  items={routes || []}
                  selectedItem={selectedRouteNew}
                  onSelectedItemChange={this.handleRouteChange}
                  placeholder="Choose Route"
                  isLoading={false}
                  itemKey="id"
                  itemToStringKey="areaName"
                  filterSize={25}
                />
              </Grid>
            ) : isWaypointsOpen === true ? (
              <Grid
                item
                sm={12}
                className={classes.textField}
                style={{ backgroundColor: 'transparent' }}
              >
                <Grid container>
                  <SimpleModal
                    placeholder="Route Name"
                    label="Save route as"
                    modalOpen={modalOpen}
                    handleModalClose={handleModalClose}
                    saveAs={saveAs}
                    handleModalFieldNameChange={handleModalFieldNameChange}
                  />

                  <Grid item sm={12} className={classes.textField}>
                    <Waypoints
                      isRouteDrawn={isRouteDrawn}
                      aois={aois}
                      selectedAoi={selectedAoi}
                      onSelectedAoiChange={onSelectedAoiChange}
                      distance={distance}
                      onFenceDistanceChange={onFenceDistanceChange}
                      radioSelection={radioSelection}
                      places={places}
                      placesCoordinates={placesCoordinates}
                      showShortestRoute={showShortestRoute}
                      onSelectionChanged={onSelectionChanged}
                      getCoordinates={getCoordinates}
                      onNewPlace={onNewPlace}
                      handlePlaceError={handlePlaceError}
                      onPlaceDelete={onPlaceDelete}
                      defineAoiType={defineAoiType}
                      onRouteOptimization={onRouteOptimization}
                      onViewRoute={onViewRoute}
                      onClearRoute={onClearRoute}
                      onSaveRoute={onSaveRoute}
                      onAoiListDragEnd={onAoiListDragEnd}
                      isCardPresent={isCardPresent}
                    />
                  </Grid>
                </Grid>
              </Grid>
            ) : (
              <Grid item></Grid>
            )}

            <Grid item sm={12}>
              <Grid container spacing={1} justify="flex-start">
                <Grid item xs={12} sm={9}>
                  <DateTimePicker
                    leftArrowIcon={<ChevronLeftIcon />}
                    rightArrowIcon={<ChevronRightIcon />}
                    dateRangeIcon={<DateRangeIcon />}
                    timeIcon={<TimeRangeIcon />}
                    value={fromDate}
                    onChange={this.handleDateChange('fromDate')}
                    label={
                      languageJson[selectedLanguage].tripsPage.tripCreation
                        .tripStartTimeLabel
                    }
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
                    label={
                      languageJson[selectedLanguage].tripsPage.tripCreation
                        .tripEndTimeLabel
                    }
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
                    placeholder={
                      languageJson[selectedLanguage].tripsPage.tripCreation
                        .toleranceLabel
                    }
                    helperText={
                      languageJson[selectedLanguage].tripsPage.tripCreation
                        .minutesLabel
                    }
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item sm={12} className={classes.textField}>
              <Typography color="textSecondary">
                {
                  languageJson[selectedLanguage].tripsPage.tripCreation
                    .typeOfTripLabel
                }
              </Typography>
              <ComboBox
                items={tripTypes || []}
                selectedItem={selectedTripType}
                onSelectedItemChange={this.handleTripType}
                placeholder={
                  languageJson[selectedLanguage].tripsPage.tripCreation
                    .typeOfTripLabel
                }
                isLoading={false}
                itemKey="id"
                itemToStringKey="typeOfTrip"
                filterSize={25}
              />
            </Grid>

            <Grid item xs={12} style={{ marginTop: 10, marginBottom: 10 }}>
              <Divider />
            </Grid>

            <Grid item sm={12}>
              <FormControlLabel
                control={
                  <Switch
                    color="primary"
                    checked={isSchedulingActive}
                    onChange={this.props.onSwitchChange}
                    value="schedule"
                  />
                }
                label={
                  isSchedulingActive
                    ? 'Scheduling this trip'
                    : languageJson[selectedLanguage].tripsPage.tripCreation
                        .scheduleTripLabel
                }
              />
            </Grid>

            {isSchedulingActive && (
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
                        value={scheduledUpto}
                        leftArrowIcon={<ChevronLeftIcon />}
                        rightArrowIcon={<ChevronRightIcon />}
                        onChange={this.handleDateChange('scheduledUpto')}
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
                    {
                      languageJson[selectedLanguage].tripsPage.tripCreation
                        .receiveTripLabel
                    }
                  </Typography>
                </Grid>

                {emails.map((email, index) => (
                  <Grid item xs={12} key={index}>
                    <Grid container>
                      <Grid item xs={8}>
                        <TextField
                          id="email"
                          label={
                            languageJson[selectedLanguage].tripsPage
                              .tripCreation.emailLabel
                          }
                          placeholder={
                            languageJson[selectedLanguage].tripsPage
                              .tripCreation.emailLabel
                          }
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

                {numbers.map((number, index) => (
                  <Grid item xs={12} key={index}>
                    <Grid container>
                      <Grid item xs={8}>
                        <TextField
                          id="number"
                          label={
                            languageJson[selectedLanguage].tripsPage
                              .tripCreation.mobileNumberLabel
                          }
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
        </CardContent>
        <CardActions>
          <Grid container spacing={1} style={{ padding: '8px' }}>
            <Grid item xs={6}>
              <ColorButton
                variant="contained"
                color="primary"
                onClick={this.saveTrip}
              >
                {
                  languageJson[selectedLanguage].tripsPage.tripCreation
                    .createTripButtonTitle
                }
              </ColorButton>
            </Grid>
          </Grid>
        </CardActions>
      </Card>
    )
  }
}

export default withGoogleMaps(
  withApollo(
    withSharedSnackbar(withLanguage(withStyles(styles)(TripConfigurationPanel)))
  )
)
