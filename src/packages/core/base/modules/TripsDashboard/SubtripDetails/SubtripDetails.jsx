import React, { Component } from 'react'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import LiveTrackingIcon from '@material-ui/icons/NearMe'
import ReplayIcon from '@material-ui/icons/History'
import StopIcon from '@material-ui/icons/Stop'
import { THEME_MAIN_COLORS } from '@zeliot/common/constants/styles'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import EventsStepper from '../EventsStepper'

import {
  Grid,
  Paper,
  Divider,
  LinearProgress,
  Typography,
  IconButton,
  Tooltip,
  Zoom
} from '@material-ui/core'

class SubtripDetails extends Component {
  /**
   * @function onBackPress
   * @summary handle back pressed on subtrip details view
   */
  onBackPress = () => {
    this.props.onSubTripBackPress()
  }

  /**
   * @function onRequestLiveTracking
   * @summary Start live tracking for in progress trips
   */
  onRequestLiveTracking = () => {
    this.props.onRequestLiveTracking()
  }

  /**
   * @function onCancelLiveTracking
   * @summary Stop live tracking if user cancels live tracking
   */
  onCancelLiveTracking = () => {
    this.props.onCancelLiveTracking()
  }

  /**
   * @function onRequestTravelHistory
   * @summary Start travel replay for a completed trip
   */
  onRequestTravelHistory = () => {
    this.props.onRequestTravelHistory()
  }

  /**
   * @function onCancelTravelHistory
   * @summary Stop replay when user cancels replay
   */
  onCancelTravelHistory = () => {
    this.props.onCancelTravelHistory()
  }

  render() {
    const {
      selectedSubTrip,
      isReplayActive,
      isLiveTracking,
      tripWaypoints
    } = this.props
    return (
      <div>
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
                backgroundColor: THEME_MAIN_COLORS.mainBlue
              }}
            >
              <Typography
                variant="h6"
                align="center"
                style={{ color: THEME_MAIN_COLORS.white }}
              >
                SCHEDULE DETAILS
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {selectedSubTrip && (
          <Grid container spacing={2} justify="center" alignItems="center">
            <Grid item xs={12}>
              <Paper elevation={4}>
                <Grid
                  container
                  justify="center"
                  alignItems="center"
                  style={{
                    padding: 10
                    // backgroundColor: 'rgba(247, 183, 51, 0.75)'
                  }}
                >
                  <Grid item style={{ marginBottom: 10 }}>
                    <Typography variant="button" color="primary">
                      CONFIGURATIONS
                    </Typography>
                  </Grid>
                  <Grid item xs={12} style={{ padding: 5 }}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container>
                      <Grid item xs={12}>
                        <Typography color="textSecondary">
                          Scheduled start on
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography>
                          {getFormattedTime(
                            selectedSubTrip.fromTimestamp,
                            'llll'
                          )}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={12}>
                        <Typography color="textSecondary">from</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography>{tripWaypoints[0]}</Typography>
                      </Grid>
                    </Grid>

                    <Grid container style={{ marginTop: 10, marginBottom: 10 }}>
                      <Grid item xs={12}>
                        <Divider />
                      </Grid>
                    </Grid>

                    <Grid container>
                      <Grid item xs={12}>
                        <Typography color="textSecondary">
                          Scheduled end on
                        </Typography>
                      </Grid>
                      <Grid>
                        <Typography>
                          {getFormattedTime(
                            selectedSubTrip.toTimestamp,
                            'llll'
                          )}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={12}>
                        <Typography color="textSecondary">at</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography>
                          {tripWaypoints[tripWaypoints.length - 1]}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {selectedSubTrip.status === 5 ? (
              selectedSubTrip.events ? (
                <Grid item xs={12}>
                  <Paper elevation={4}>
                    <Grid
                      container
                      justify="center"
                      alignItems="center"
                      style={{
                        padding: 10
                      }}
                    >
                      <Grid item style={{ marginBottom: 10 }}>
                        <Typography variant="button" color="primary">
                          RECORDED EVENTS
                        </Typography>
                      </Grid>
                      <Grid item xs={12} style={{ padding: 5 }}>
                        <Divider />
                      </Grid>
                      <Grid item xs={12}>
                        <EventsStepper
                          selectedSubTrip={selectedSubTrip.events}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ) : (
                <Grid item xs={12}>
                  <LinearProgress color="primary" />
                </Grid>
              )
            ) : null}
          </Grid>
        )}

        <Grid
          container
          justify="space-around"
          alignItems="center"
          style={{ marginBottom: 20, marginTop: 20 }}
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
          {selectedSubTrip.status === 4 ? (
            !isLiveTracking ? (
              <Grid item>
                <Tooltip
                  TransitionComponent={Zoom}
                  title={'Track this vehicle live'}
                  style={{ cursor: 'pointer' }}
                >
                  <IconButton onClick={this.onRequestLiveTracking}>
                    <LiveTrackingIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            ) : (
              <Grid item>
                <Tooltip
                  TransitionComponent={Zoom}
                  title={'Stop live tracking'}
                  style={{ cursor: 'pointer' }}
                >
                  <IconButton onClick={this.onCancelLiveTracking}>
                    <StopIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            )
          ) : null}

          {selectedSubTrip.status === 5 ? (
            !isReplayActive ? (
              <Grid item>
                <Tooltip
                  TransitionComponent={Zoom}
                  title={'Travel history of this vehicle during trip'}
                  style={{ cursor: 'pointer' }}
                >
                  <IconButton onClick={this.onRequestTravelHistory}>
                    <ReplayIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            ) : (
              <Grid item>
                <Tooltip
                  TransitionComponent={Zoom}
                  title={'Stop travel history'}
                  style={{ cursor: 'pointer' }}
                >
                  <IconButton onClick={this.onCancelTravelHistory}>
                    <StopIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            )
          ) : null}
        </Grid>
      </div>
    )
  }
}

export default SubtripDetails
