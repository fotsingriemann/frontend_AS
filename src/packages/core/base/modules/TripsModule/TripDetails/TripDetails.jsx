/**
 * Trip details component
 * @module TripsDetails
 */

import React, { Component } from 'react'
import moment from 'moment'
import BookIcon from '@material-ui/icons/Book'
import AssignedVehicleIcon from '@material-ui/icons/DepartureBoard'
import CalendarIcon from '@material-ui/icons/CalendarToday'
import History from '@material-ui/icons/AvTimer'
import AlarmIcon from '@material-ui/icons/Alarm'
import DeleteIcon from '@material-ui/icons/Delete'
import PauseIcon from '@material-ui/icons/Pause'
import PlayIcon from '@material-ui/icons/PlayArrow'
import EditIcon from '@material-ui/icons/Edit'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import StatusIcon from '@material-ui/icons/LocalActivity'
import TimeIcon from '@material-ui/icons/AccessTime'
import { THEME_MAIN_COLORS } from '@zeliot/common/constants/styles'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import getFormattedDuration from '@zeliot/common/utils/time/getFormattedDuration'
import {
  withStyles,
  List,
  ListItem,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  Paper,
  Divider,
  Typography,
  Grid,
  ListItemText,
  IconButton,
  Tooltip,
  Zoom,
  Modal,
  Button,
  LinearProgress,
  ListItemIcon,
} from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

const styles = (theme) => ({
  textField: {
    marginTop: theme.spacing(1),
    marginButton: theme.spacing(1),
  },
  listClass: {
    padding: theme.spacing(2),
  },
  fab: {
    margin: theme.spacing(1),
  },
  clickableTableRow: {
    cursor: 'pointer',
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
  button: {
    margin: theme.spacing(1),
  },
})

/**
 * @summary Names of days of week
 */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

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

/**
 * @function getStatus
 * @param {number} status Status id of trip
 * @return {string} Readable status for status id
 * @summary Converts status id into readable status of trip
 */
function getStatus(status) {
  switch (status) {
    case 0:
      return 'Active'
    case 1:
      return 'Completed'
    case 2:
      return 'Paused'
    case 3:
      return 'Deleted'
    default:
      return 'Active'
  }
}

class TripDetails extends Component {
  /**
   * @property {boolean} confirmDelete Confirm delete flag
   * @property {boolean} deleteConfirmed Trip delete confirmed
   * @property {boolean} confirmPause Confirm pause flag
   * @property {boolean} pauseConfirmed Trip pause confirmed
   * @property {boolean} confirmResume Confirm resume flag
   * @property {boolean} resumeConfirmed Trip resume confirmed
   */
  state = {
    confirmDelete: false,
    deleteConfirmed: false,
    confirmPause: false,
    pauseConfirmed: false,
    confirmResume: false,
    resumeConfirmed: false,
  }

  /**
   * @function onBackPress
   * @summary Handle back press on trip dashboard screen
   */
  onBackPress = () => {
    this.props.onBackPress()
  }

  /**
   * @function parseDaysOfWeek
   * @return {string[]} Returns scheduled days of week marked as 1 or 0 based on schedule value
   */
  parseDaysOfWeek = () => {
    let value = this.props.schedule
    const daysOfWeek = []
    while (value >= 1) {
      const r = parseInt(value, 10) % 2
      value = value / 2
      daysOfWeek.push(r)
    }
    // console.log('Days of week', daysOfWeek)
    return this.getDaysString(daysOfWeek)
  }

  /**
   * @function getDaysString
   * @param {number[]} daysOfWeek Array of scheduled days of week
   * @return {string[]} Array of scheduled days of week in readable string format
   */
  getDaysString = (daysOfWeek) => {
    const days = []
    daysOfWeek.forEach((value, index) => {
      if (value) {
        days.push(DAYS[6 - index])
      }
    })
    // console.log('Days', days)
    return days
  }

  /**
   * @function onSelectedSubtrip
   * @param {object} subTrip Selected subtrip object
   * @summary Passes selected subtrip to subtrip change handler
   */
  onSelectedSubtrip = (subTrip) => {
    // console.log(subTrip)
    this.props.onSelectedSubtrip(subTrip)
  }

  /**
   * @function onDeletePress
   * @summary Dialogue presented to user to confirm deletion
   */
  onDeletePress = () => {
    this.setState({ confirmDelete: true })
  }

  /**
   * @function confirmDeleteTrip
   * @summary Trip deletion confirmed by user. Trip deletion handler called.
   */
  confirmDeleteTrip = () => {
    this.handleDeleteClose()
    this.setState({ deleteConfirmed: true })
    this.props.onTripDelete()
  }

  /**
   * @function handleDeleteClose
   * @summary Set delete confirmation state
   */
  handleDeleteClose = () => this.setState({ confirmDelete: false })

  /**
   * @function onPausePress
   * @summary Dialogue presented to user to confirm trip pause
   */
  onPausePress = () => {
    this.setState({ confirmPause: true })
  }

  /**
   * @function confirmPauseTrip
   * @summary Trip pause confirmed by user. Trip pause handler called.
   */
  confirmPauseTrip = () => {
    this.handlePauseClose()
    this.setState({ pauseConfirmed: true })
    this.props.onTripPause()
  }

  /**
   * @function handlePauseClose
   * @summary Set pause confirmation state
   */
  handlePauseClose = () => this.setState({ confirmPause: false })

  /**
   * @function onResumePress
   * @summary Dialogue presented to user to confirm trip resume
   */
  onResumePress = () => {
    this.setState({ confirmResume: true })
  }

  /**
   * @function confirmResumeTrip
   * @summary Trip resume confirmed by user. Trip resume handler called.
   */
  confirmResumeTrip = () => {
    this.handleResumeClose()
    this.setState({ resumeConfirmed: true })
    this.props.onTripResume()
  }

  /**
   * @function handleResumeClose
   * @summary Set resume confirmation state
   */
  handleResumeClose = () => this.setState({ confirmResume: false })

  /**
   * @function onEditPress
   * @summary Edit trip handler called
   */
  onEditPress = () => {
    this.props.onTripEdit()
  }

  render() {
    const {
      classes,
      tripName,
      tolerance,
      assignedVehicle,
      status,
      selectedTripType,
      scheduleToTimestamp,
      fromDate,
      toDate,
      schedule,
      allSubtrips,
      editingActive,
      areTripDetailsFetched,
      selectedLanguage,
    } = this.props
    console.log('allSubtrips', allSubtrips)
    return (
      <div>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.confirmDelete}
          onClose={this.handleDeleteClose}
        >
          <div style={getModalStyle()} className={classes.paper}>
            <Typography variant="h6" id="modal-title">
              Are you sure?
            </Typography>
            <Typography variant="subtitle1" id="simple-modal-description">
              This will delete all schedules for this trip.
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
                  onClick={this.handleDeleteClose}
                >
                  Cancel
                </ColorButton>
              </Grid>
              <Grid item>
                <ColorButton
                  style={styles.button}
                  color="primary"
                  variant="contained"
                  onClick={this.confirmDeleteTrip}
                >
                  Confirm
                </ColorButton>
              </Grid>
            </Grid>
          </div>
        </Modal>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.confirmPause}
          onClose={this.handlePauseClose}
        >
          <div style={getModalStyle()} className={classes.paper}>
            <Typography variant="h6" id="modal-title">
              Are you sure?
            </Typography>
            <Typography variant="subtitle1" id="simple-modal-description">
              This will pause all schedules for this trip.
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
                  onClick={this.handlePauseClose}
                >
                  Cancel
                </ColorButton>
              </Grid>
              <Grid item>
                <ColorButton
                  style={styles.button}
                  color="primary"
                  variant="contained"
                  onClick={this.confirmPauseTrip}
                >
                  Confirm
                </ColorButton>
              </Grid>
            </Grid>
          </div>
        </Modal>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.confirmResume}
          onClose={this.handleResumeClose}
        >
          <div style={getModalStyle()} className={classes.paper}>
            <Typography variant="h6" id="modal-title">
              Are you sure?
            </Typography>
            <Typography variant="subtitle1" id="simple-modal-description">
              This will resume all schedules for this trip.
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
                  onClick={this.handleResumeClose}
                >
                  Cancel
                </ColorButton>
              </Grid>
              <Grid item>
                <ColorButton
                  style={styles.button}
                  color="primary"
                  variant="contained"
                  onClick={this.confirmResumeTrip}
                >
                  Confirm
                </ColorButton>
              </Grid>
            </Grid>
          </div>
        </Modal>
        <Grid container justify="space-between" alignItems="center" spacing={2}>
          <Grid item xs={12}>
            <Paper
              elevation={4}
              style={{
                width: '100%',
                padding: 15,
                backgroundColor: THEME_MAIN_COLORS.mainBlue,
              }}
            >
              <Typography
                variant="h6"
                align="center"
                style={{ color: THEME_MAIN_COLORS.white }}
              >
                {languageJson[selectedLanguage].tripsPage.tripDetails.cardTitle}
              </Typography>
            </Paper>
            {areTripDetailsFetched ? (
              <List component="nav" className={classes.listClass}>
                <ListItem>
                  <ListItemIcon>
                    <BookIcon />
                  </ListItemIcon>
                  <ListItemText>
                    <Grid
                      container
                      className={classes.textField}
                      alignItems="center"
                    >
                      <Grid item xs={6}>
                        <Typography color="textSecondary">
                          {
                            languageJson[selectedLanguage].tripsPage.tripDetails
                              .tripNameLabel
                          }
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography gutterBottom>{tripName}</Typography>
                      </Grid>
                    </Grid>
                  </ListItemText>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <AssignedVehicleIcon />
                  </ListItemIcon>
                  <ListItemText>
                    <Grid
                      container
                      className={classes.textField}
                      alignItems="center"
                    >
                      <Grid item xs={6}>
                        <Typography color="textSecondary">
                          {
                            languageJson[selectedLanguage].tripsPage.tripDetails
                              .vehicleAssignedLabel
                          }
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography>{assignedVehicle}</Typography>
                      </Grid>
                    </Grid>
                  </ListItemText>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <History />
                  </ListItemIcon>
                  <ListItemText>
                    <Grid
                      container
                      className={classes.textField}
                      alignItems="center"
                    >
                      <Grid item xs={6}>
                        <Typography color="textSecondary">
                          {
                            languageJson[selectedLanguage].tripsPage.tripDetails
                              .toleranceLabel
                          }
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography>
                          {tolerance ? `${tolerance} minutes` : ''}
                        </Typography>
                      </Grid>
                    </Grid>
                  </ListItemText>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText>
                    <Grid
                      container
                      className={classes.textField}
                      alignItems="center"
                    >
                      <Grid item xs={6}>
                        <Typography color="textSecondary">
                          {
                            languageJson[selectedLanguage].tripsPage.tripDetails
                              .startTimeLabel
                          }
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography>
                          {editingActive
                            ? moment(fromDate).format('lll')
                            : fromDate}
                        </Typography>
                      </Grid>
                    </Grid>
                  </ListItemText>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <TimeIcon />
                  </ListItemIcon>
                  <ListItemText>
                    <Grid
                      container
                      className={classes.textField}
                      alignItems="center"
                    >
                      <Grid item xs={6}>
                        <Typography color="textSecondary">
                          {
                            languageJson[selectedLanguage].tripsPage.tripDetails
                              .tripDurationLabel
                          }
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography>
                          {getFormattedDuration(
                            moment(toDate).diff(moment(fromDate)) / 1000
                          )}
                        </Typography>
                      </Grid>
                    </Grid>
                  </ListItemText>
                </ListItem>
                <Divider />
                {schedule ? (
                  <div>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon />
                      </ListItemIcon>
                      <ListItemText>
                        <Grid
                          container
                          className={classes.textField}
                          alignItems="center"
                        >
                          <Grid item xs={6}>
                            <Typography color="textSecondary">
                              Scheduled upto
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography>
                              {editingActive
                                ? moment(scheduleToTimestamp).format('lll')
                                : scheduleToTimestamp}
                            </Typography>
                          </Grid>
                        </Grid>
                      </ListItemText>
                    </ListItem>
                    <Divider />
                  </div>
                ) : null}
                <ListItem>
                  <ListItemIcon>
                    <AlarmIcon />
                  </ListItemIcon>
                  <ListItemText>
                    <Grid
                      container
                      className={classes.textField}
                      alignItems="center"
                    >
                      <Grid item xs={6}>
                        <Typography color="textSecondary">
                          {
                            languageJson[selectedLanguage].tripsPage.tripDetails
                              .frequencyLabel
                          }
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography>
                          {schedule
                            ? this.parseDaysOfWeek(schedule).join(', ')
                            : 'No Schedule'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </ListItemText>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <StatusIcon />
                  </ListItemIcon>
                  <ListItemText>
                    <Grid
                      container
                      className={classes.textField}
                      alignItems="center"
                    >
                      <Grid item xs={6}>
                        <Typography color="textSecondary">
                          {
                            languageJson[selectedLanguage].tripsPage.tripDetails
                              .statusLabel
                          }
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography>{getStatus(status)}</Typography>
                      </Grid>
                    </Grid>
                  </ListItemText>
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText>
                    <Grid
                      container
                      className={classes.textField}
                      alignItems="center"
                    >
                      <Grid item xs={6}>
                        <Typography color="textSecondary">
                          {
                            languageJson[selectedLanguage].tripsPage.tripDetails
                              .endTimeLabel
                          }
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography>
                          {editingActive
                            ? moment(toDate).format('lll')
                            : toDate}
                        </Typography>
                      </Grid>
                    </Grid>
                  </ListItemText>
                </ListItem>
              </List>
            ) : (
              <LinearProgress color="primary" />
            )}
          </Grid>
        </Grid>

        <Grid
          container
          justify="space-around"
          alignItems="center"
          style={{ marginBottom: 20 }}
        >
          <Grid item>
            <Tooltip
              TransitionComponent={Zoom}
              title={'Previous page'}
              style={{ cursor: 'pointer' }}
            >
              <IconButton onClick={this.onBackPress}>
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          {/*{status == 1 ? null : null} */}
          {status !== 5 && status !== 3 ? (
            status !== 2 ? (
              <Grid item>
                <Tooltip
                  TransitionComponent={Zoom}
                  title={'Pause upcoming schedules'}
                  style={{ cursor: 'pointer' }}
                >
                  {status === 1 ? (
                    <IconButton onClick={this.onPausePress} disabled>
                      <PauseIcon />
                    </IconButton>
                  ) : (
                    <IconButton onClick={this.onPausePress}>
                      <PauseIcon />
                    </IconButton>
                  )}
                </Tooltip>
              </Grid>
            ) : (
              <Grid item>
                <Tooltip
                  TransitionComponent={Zoom}
                  title={'Resume upcoming schedules'}
                  style={{ cursor: 'pointer' }}
                >
                  {status === 1 ? (
                    <IconButton onClick={this.onResumePress} disabled>
                      <PlayIcon />
                    </IconButton>
                  ) : (
                    <IconButton onClick={this.onResumePress}>
                      <PlayIcon />
                    </IconButton>
                  )}
                </Tooltip>
              </Grid>
            )
          ) : null}
          {status !== 3 && (
            <Grid item>
              <Tooltip
                TransitionComponent={Zoom}
                title={'Delete all upcoming schedules'}
                style={{ cursor: 'pointer' }}
              >
                {status === 1 || status === 0 ? (
                  <IconButton onClick={this.onDeletePress} disabled>
                    <DeleteIcon />
                  </IconButton>
                ) : (
                  <IconButton onClick={this.onDeletePress}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </Tooltip>
            </Grid>
          )}
          {status !== 3 && (
            <Grid item>
              <Tooltip
                TransitionComponent={Zoom}
                title={'Edit trip details'}
                style={{ cursor: 'pointer' }}
              >
                {status === 0 ? (
                  <IconButton onClick={this.onEditPress}>
                    <EditIcon />
                  </IconButton>
                ) : (
                  <IconButton onClick={this.onEditPress} disabled>
                    <EditIcon />
                  </IconButton>
                )}
              </Tooltip>
            </Grid>
          )}
        </Grid>
        {allSubtrips && (
          <Grid
            container
            justify="space-around"
            alignItems="center"
            spacing={2}
            style={{ marginBottom: 15 }}
          >
            <Grid item xs={12}>
              <Paper
                elevation={4}
                style={{
                  width: '100%',
                  padding: 15,
                  backgroundColor: THEME_MAIN_COLORS.mainBlue,
                }}
              >
                <Typography
                  variant="h6"
                  align="center"
                  style={{ color: THEME_MAIN_COLORS.white }}
                >
                  {selectedTripType.key === 4
                    ? 'CURRENT SCHEDULE'
                    : 'PREVIOUS SCHEDULES'}
                </Typography>
              </Paper>
            </Grid>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell size="small">Sr no</TableCell>
                  <TableCell size="small">Started on</TableCell>
                  <TableCell size="small">
                    {selectedTripType.key === 4 ? 'Expected End' : 'Ended on'}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allSubtrips.map((subtrip, index) => (
                  <TableRow
                    hover
                    className={classes.clickableTableRow}
                    key={index}
                    onClick={() => {
                      if (subtrip.status === 4 || subtrip.status === 5) {
                        this.onSelectedSubtrip(subtrip)
                      }
                    }}
                  >
                    <TableCell size="small">{index + 1}</TableCell>
                    <TableCell size="small">
                      {subtrip.fromTimestamp
                        ? getFormattedTime(subtrip.fromTimestamp, 'llll')
                        : 'Not available'}
                    </TableCell>
                    <TableCell size="small">
                      {subtrip.fromTimestamp
                        ? getFormattedTime(subtrip.toTimestamp, 'llll')
                        : 'Not available'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Grid>
        )}
      </div>
    )
  }
}

export default withLanguage(withStyles(styles)(TripDetails))
