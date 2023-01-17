/**
 * VideoControlPanel component
 */

import React, { Component } from 'react'
import moment from 'moment'
import {
  MenuItem,
  FormControl,
  InputLabel,
  withStyles,
  Grid,
  Typography,
  Button,
  Select,
  Paper,
  Slider,
} from '@material-ui/core'
import gql from 'graphql-tag'
import memoizeOne from 'memoize-one'
import { DateTimePicker } from '@material-ui/pickers'
import ComboBox from '@zeliot/common/ui/ComboBox'
import Video from './Video'
import LiveTracking from './LiveTracking'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import getUnixString from '@zeliot/common/utils/time/getUnixString'
import { withApollo } from 'react-apollo'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

const TRAVEL_REPLAY_PACKETS = gql`
  query(
    $uniqueId: String!
    $from: String!
    $to: String!
    $snapToRoad: Boolean
  ) {
    getTravelHistory(
      uniqueId: $uniqueId
      from: $from
      to: $to
      snapToRoad: $snapToRoad
    ) {
      distanceTravelledKms
      points {
        ts
        lat
        lng
        speed
        isHA
        isHB
        address
        satellites
      }
    }
  }
`

const GET_VIDEO_TIMELINE = gql`
  query getAvailableVideos($imei: String!, $filters: Filters!) {
    videos: getAvailableVideos(imei: $imei, filters: $filters) {
      cameraId
      timestamp
    }
  }
`

const styles = (theme) => ({
  '@keyframes flash': {
    from: {
      opacity: 0,
      background: 'black',
    },
    to: {
      opacity: 1,
      background: 'red',
    },
  },

  liveButtonBlinker: {
    display: 'block',
    height: 10,
    width: 10,
    borderRadius: '50%',
    background: 'red',
    marginLeft: 10,
    animation: '1s flash infinite alternate both',
  },

  liveButton: {
    minWidth: theme.spacing(10),
  },

  emptyButton: {
    display: 'block',
    height: 10,
    width: 10,
    margin: 10,
  },

  formControl: {
    margin: 8,
    minWidth: 300,
    position: 'relative',
    zIndex: 150,
  },

  searchDropdown: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
    top: theme.spacing(7),
    maxHeight: theme.spacing(25),
    overflowY: 'auto',
  },

  videoContainer: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },

  container: {
    justify: 'center',
  },

  videoPlayer: {
    width: '100%',
  },

  scrubberContainer: {
    flex: 1,
  },

  scrubberText: {
    marginBottom: theme.spacing(2),
  },
})

/**
 * Filters an array of video objects by cameraId
 * @param {Array} videoArray An array of video objects to be filtered
 * @param {Number} camId CameraId that needs to filtered
 * @return {Array} Array of video objects filtered by given cameraId
 */
const videoArrayFilter = (videoArray, camId) =>
  videoArray.filter(({ cameraId }) => cameraId === camId)

const memoizedVideoArrayFilter = memoizeOne(videoArrayFilter)

let loginId = null

/**
 * VideoControl component
 */
class VideoControlPanel extends Component {
  /**
   * @property {string} mode The mode of the players & components
   * @property {number} scrubberValue The value of the slider component
   * @property {number} sliderRange The range of the slider component
   * @property {?object} scrubberTime The moment time represented by the slider's value
   * @property {number|string} timelineRange The range of the timeline represented in hours
   * @property {?object} fromTime The startTime of custom timerange query
   * @property {object} toTime The endTime of custom timerange query
   * @property {array} videoTimeline An array of all video objects in the given timerange
   * @property {?number} tickTock The epoch timestamp of the clock running in 'TIMELINE' mode
   * @property {string} clockStatus A string representing the status of the clock
   * @property {?object} travelReplayData An object containing travel replay data
   */
  state = {
    mode: 'STABLE',
    scrubberValue: 60,
    sliderRange: 60,
    scrubberTime: null,
    timelineRange: 1,
    fromTime: moment().subtract(1, 'hour'),
    toTime: moment(),
    videoTimeline: [],
    tickTock: null,
    clockStatus: 'PAUSE',
    travelReplayData: null,
  }

  /**
   * Stores time of initial mount of component for using as currentTime in Timeline mode
   * to prevent unnecessaryre-render using actual current time
   * @summary Stores reference currentTime
   */
  currentTime = moment()

  /**
   * Stores the time when `tickTock` was last paused
   * @summary Stores lastTickTock before pause
   */
  pauseTickTock = null

  /**
   * Sets the clockStatus and stops/starts the clock
   * @function
   * @param {string} clockStatus New clockStatus to be set
   * @return {undefined}
   * @summary Sets the clockStatus state
   */
  setClockStatus = (clockStatus) => {
    this.setState({ clockStatus }, () => {
      if (clockStatus === 'PAUSE') {
        clearInterval(this.clock)
        this.pauseTickTock = this.state.tickTock
      } else {
        this.startClock(this.pauseTickTock + 1)
      }
    })
  }

  /**
   * This callback sets the scrubberTime based on sliderValue, and changes to TIMELINE mode
   * and also resets tickTock to new scrubberTime and initiates timeline mode
   * @callback
   * @summary Callback called on change commit
   */
  handleChangeCommit = () => {
    let timeOffset = loginId === '1962' ? moment().utcOffset() * 60 : 0
    const rangeStartTime =
      this.state.timelineRange === 'CUSTOM'
        ? this.state.fromTime
        : moment(this.currentTime).subtract(this.state.sliderRange, 'minutes')

    const scrubberTime = moment.unix(
      rangeStartTime.unix() + this.state.scrubberValue * 60 + timeOffset
    )

    this.setState(
      { scrubberTime, mode: 'TIMELINE', tickTock: scrubberTime.unix() },
      () => {
        if (!this.state.travelReplayData) {
          this.goToTimelineMode()
        } else {
          this.startClock()
        }
      }
    )
  }

  /**
   * This callback stops the running clock, and moves the component to STABLE mode
   * @callback
   * @summary Callback called on slider mouse down
   */
  handleMouseDown = () => {
    clearInterval(this.clock)
    this.setState({
      mode: 'STABLE',
      scrubberTime: null,
      clockStatus: 'PAUSE',
    })
  }

  /**
   * This callback handles changing the value of the relevant time/date selector
   * @callback
   * @summary Sets the relevant time selector value and also stops the clock & moves to STABLE mode
   */
  handleCustomTimeRangeChange = (timeRange) => (time) => {
    clearInterval(this.clock)

    this.setState({
      [timeRange]: time,
      mode: 'STABLE',
      clockStatus: 'PAUSE',
    })
  }

  /**
   * On clicking submit(of time-range selector), this callback validates the selected time range,
   * and sets the sliderRange to the selected range, and calls the
   * {@link onTimelineRangeChange} callback
   * @callback
   * @summary Callback called on custom timerange submit
   */
  handleCustomTimeRangeSubmit = () => {
    // let timeOffset = loginId === 1962 ? moment().utcOffset() * 60 : 0
    const from = this.state.fromTime.unix()
    const to = this.state.toTime.unix()

    if (from >= to) {
      this.props.openSnackbar('Date range provided is wrong')
    } else if (to - from > 86400) {
      this.props.openSnackbar('Date range cannot exceed 24 hours')
    } else if (
      from > getUnixString(moment.now()) ||
      to > getUnixString(moment.now())
    ) {
      this.props.openSnackbar('Future dates are not allowed')
    } else {
      this.setState(({ fromTime, toTime }) => {
        const range = moment.duration(toTime.diff(fromTime)).as('minutes')

        return {
          scrubberTime: null,
          sliderRange: range,
          scrubberValue: 0,
        }
      }, this.onTimelineRangeChange)
    }
  }

  /**
   * Handles changing the value of time range selection dropdown menu. Sets the releavnt variables &
   * stops the clock and then moves into STABLE mode, before moving to TIMELINE mode
   * @callback
   * @summary Callback called on selecting a value from timeline range menu
   */
  handleTimelineRangeChange = (e) => {
    const newTimelineRange = e.target.value

    if (newTimelineRange === 'CUSTOM') {
      clearInterval(this.clock)

      this.setState({
        mode: 'STABLE',
        timelineRange: newTimelineRange,
        clockStatus: 'PAUSE',
        travelReplayData: null,
      })
    } else {
      clearInterval(this.clock)

      this.setState(
        {
          mode: 'STABLE',
          timelineRange: newTimelineRange,
          scrubberTime: null,
          sliderRange: newTimelineRange * 60,
          scrubberValue: 0,
          travelReplayData: null,
        },
        this.onTimelineRangeChange
      )
    }
  }

  /**
   * Changes the video & map mode to LIVE, and starts live video streaming with live tracking
   * @callback
   * @summary Callback called on clicking LIVE button
   */
  goLive = () => {
    clearInterval(this.clock)

    this.setState(({ sliderRange }) => ({
      mode: 'LIVE',
      scrubberValue: sliderRange,
      scrubberTime: null,
      clockStatus: 'PAUSE',
    }))
  }

  /**
   * Sets the scrubberTime to the start of timeline, and then calls {@link goToTimelineMode}
   * @function
   * @summary Changes scrubberTime based on timeline
   */
  onTimelineRangeChange = () => {
    let timeOffset = loginId === '1962' ? moment().utcOffset() * 60 : 0
    const rangeStartTime =
      this.state.timelineRange === 'CUSTOM'
        ? this.state.fromTime
        : moment(this.currentTime).subtract(this.state.sliderRange, 'minutes')

    const scrubberTime = moment.unix(rangeStartTime.unix() + timeOffset)

    this.setState(
      {
        scrubberTime,
        mode: 'TIMELINE',
        scrubberValue: 0,
        tickTock: scrubberTime.unix(),
      },
      this.goToTimelineMode
    )
  }

  /**
   * Sets the scrubberValue to the new value
   * @callback
   * @param {SyntheticEvent} e Slider change event
   * @param {number} value The slider's new value
   * @summary Callback called on change of scrubberValue
   */
  handleScrubberChange = (e, value) => {
    this.setState({ scrubberValue: value })
  }

  formatSliderValue = () => {
    let timeOffset = loginId === '1962' ? moment().utcOffset() * 60 : 0
    const rangeStartTime =
      this.state.timelineRange === 'CUSTOM'
        ? this.state.fromTime
        : moment(this.currentTime).subtract(this.state.sliderRange, 'minutes')

    const scrubberTime = moment.unix(
      rangeStartTime.unix() + this.state.scrubberValue * 60 + timeOffset
    )

    if (this.state.mode === 'STABLE') {
      return loginId !== '1962'
        ? getFormattedTime(scrubberTime.unix(), 'lll')
        : moment.unix(scrubberTime.unix()).utc().format('lll')

      // return getFormattedTime(scrubberTime.unix(), 'lll')
    } else {
      return loginId !== '1962'
        ? getFormattedTime(
            this.state.tickTock ? this.state.tickTock : scrubberTime.unix(),
            'Do MMM YYYY h:mm:ss A'
          )
        : moment
            .unix(
              this.state.tickTock ? this.state.tickTock : scrubberTime.unix()
            )
            .utc()
            .format('Do MMM YYYY h:mm:ss A')

      // return getFormattedTime(
      //   this.state.tickTock ? this.state.tickTock : scrubberTime.unix(),
      //   'Do MMM YYYY h:mm:ss A'
      // )
    }
  }

  handleSelectedVehicleChange = (vehicle) => {
    this.props.onSelectedVehicleChange(vehicle)

    if (vehicle) {
      this.setState({
        mode: 'LIVE',
        scrubberValue: 60,
        sliderRange: 60,
        scrubberTime: null,
        timelineRange: 1,
      })
    } else {
      clearInterval(this.clock)

      this.setState({
        mode: 'STABLE',
        scrubberValue: 60,
        sliderRange: 60,
        scrubberTime: null,
        timelineRange: 1,
        clockStatus: 'PAUSE',
      })
    }
  }

  getVideoTimeline = () => {
    let timeOffset = loginId === '1962' ? moment().utcOffset() * 60 : 0

    console.log('timeOffset', timeOffset)
    return this.props.client.query({
      query: GET_VIDEO_TIMELINE,
      variables: {
        imei: this.props.imei,
        filters: {
          cameraIds: [1, 2],
          fromTimestamp: String(
            moment(
              this.state.timelineRange === 'CUSTOM'
                ? this.state.toTime
                : this.currentTime
            )
              .subtract(this.state.sliderRange, 'minutes')
              .unix() + timeOffset
          ),
          toTimestamp: String(
            moment(
              this.state.timelineRange === 'CUSTOM'
                ? this.state.toTime
                : this.currentTime
            ).unix() + timeOffset
          ),
        },
      },
    })
  }

  handleVideoTimelineData = ({ data }) => {
    return new Promise((resolve) => {
      if (data && data.videos) {
        this.setState(
          {
            videoTimeline: data.videos.reverse(),
          },
          resolve
        )
      } else {
        resolve()
      }
    })
  }

  getTravelReplayData = () => {
    let timeOffset = loginId === '1962' ? moment().utcOffset() * 60 : 0
    return this.props.client.query({
      query: TRAVEL_REPLAY_PACKETS,
      variables: {
        uniqueId: this.props.selectedVehicle.uniqueId,
        from: String(
          moment(
            this.state.timelineRange === 'CUSTOM'
              ? this.state.toTime
              : this.currentTime
          )
            .subtract(this.state.sliderRange, 'minutes')
            .unix() + timeOffset
        ),
        to: String(
          moment(
            this.state.timelineRange === 'CUSTOM'
              ? this.state.toTime
              : this.currentTime
          ).unix() + timeOffset
        ),
        snapToRoad: false,
      },
      errorPolicy: 'all',
    })
  }

  handleTravelReplayData = ({ data }) => {
    return new Promise((resolve) => {
      if (data && data.getTravelHistory) {
        const points = data.getTravelHistory.points
        const distanceCovered = data.getTravelHistory.distanceTravelledKms

        const localReplayCount = points.length

        if (localReplayCount < 2) {
          this.props.openSnackbar(
            'No tracking data available for selected duration'
          )

          this.setState(
            {
              travelReplayData: null,
            },
            resolve
          )
        } else {
          const localStep = parseFloat((100 / localReplayCount).toFixed(3))

          this.setState(
            {
              travelReplayData: {
                response: points,
                distanceTravelled: distanceCovered,
                replayCount: localReplayCount,
                step: localStep,
              },
            },
            resolve
          )
        }
      } else {
        this.props.openSnackbar(
          'No tracking data available for selected duration'
        )

        this.setState(
          {
            travelReplayData: null,
          },
          resolve
        )
      }
    })
  }

  resetTravelReplayData = () => {
    this.setState({ travelReplayData: null })
  }

  goToTimelineMode = async () => {
    const travelReplayPromise = this.getTravelReplayData()
    const videoTimelinePromise = this.getVideoTimeline()

    Promise.all([travelReplayPromise, videoTimelinePromise]).then(
      async ([travelReplayData, videoTimelineData]) => {
        await this.handleTravelReplayData(travelReplayData)
        await this.handleVideoTimelineData(videoTimelineData)

        this.startClock()
      }
    )
  }

  clock = null

  startClock = (prevTickTock) => {
    let timeOffset = loginId === '1962' ? moment().utcOffset() * 60 : 0
    clearInterval(this.clock)
    this.setState(
      {
        clockStatus: 'RUNNING',
      },
      () => {
        const initialTs =
          prevTickTock ||
          moment(
            this.state.timelineRange === 'CUSTOM'
              ? this.state.toTime
              : this.currentTime
          )
            .subtract(this.state.sliderRange, 'minutes')
            .unix() +
            this.state.scrubberValue * 60 +
            timeOffset

        const startTs =
          moment(
            this.state.timelineRange === 'CUSTOM'
              ? this.state.toTime
              : this.currentTime
          )
            .subtract(this.state.sliderRange, 'minutes')
            .unix() + timeOffset

        const endTs =
          moment(
            this.state.timelineRange === 'CUSTOM'
              ? this.state.toTime
              : this.currentTime
          ).unix() + timeOffset

        this.clock = setInterval(() => {
          this.setState(({ tickTock }) => {
            if (tickTock < endTs) {
              const newTickTock = tickTock ? tickTock + 1 : Number(initialTs)
              const newScrubberValue = Math.floor((newTickTock - startTs) / 60)
              console.log('tickTock', newTickTock)
              return {
                tickTock: newTickTock,
                scrubberValue: newScrubberValue,
              }
            } else {
              clearInterval(this.clock)

              return {
                tickTock: tickTock,
                scrubberValue: Math.floor((tickTock - startTs) / 60),
              }
            }
          })
        }, 1000)
      }
    )
  }

  componentDidMount = () => {
    loginId = localStorage.getItem('loginId')
  }

  componentWillUnmount() {
    if (this.clock) {
      clearInterval(this.clock)
    }
  }

  render() {
    const { classes, imei, selectedVehicle, vehicles, retry } = this.props
    const {
      mode,
      scrubberValue,
      scrubberTime,
      videoTimeline,
      timelineRange,
      toTime,
      fromTime,
      clockStatus,
      tickTock,
      sliderRange,
      travelReplayData,
    } = this.state

    const camera1VideoTimes = memoizedVideoArrayFilter(videoTimeline, 1)
    const camera2VideoTimes = memoizedVideoArrayFilter(videoTimeline, 2)

    const disableComponents =
      !selectedVehicle || (mode === 'TIMELINE' && clockStatus === 'PAUSE')

    return (
      <React.Fragment>
        <Paper elevation={4}>
          <Grid container>
            <Grid item xs={12}>
              <FormControl className={classes.formControl}>
                <ComboBox
                  items={vehicles}
                  placeholder="Search vehicle"
                  itemKey="uniqueId"
                  itemToStringKey="vehicleNumber"
                  isLoading={false}
                  selectedItem={selectedVehicle}
                  onSelectedItemChange={this.handleSelectedVehicleChange}
                  errorComponent={
                    <Grid container>
                      <Grid item xs={12}>
                        Error fetching vehicles list
                      </Grid>
                      <Grid item xs={12}>
                        <Button onClick={retry}>Retry</Button>
                      </Grid>
                    </Grid>
                  }
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={1} style={{ padding: 16 }}>
                <Grid item xs={12} md={4} className={classes.videoContainer}>
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography align="center" variant="h6">
                        Camera 1
                      </Typography>

                      <Video
                        imei={imei}
                        cameraId={2}
                        mode={mode}
                        endTime={
                          timelineRange === 'CUSTOM' ? toTime : this.currentTime
                        }
                        scrubberTime={scrubberTime}
                        videoTimeline={camera2VideoTimes}
                        tickTock={tickTock}
                        clockStatus={clockStatus}
                        setClockStatus={this.setClockStatus}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography align="center" variant="h6">
                        Camera 2
                      </Typography>

                      <Video
                        imei={imei}
                        cameraId={1}
                        mode={mode}
                        endTime={
                          timelineRange === 'CUSTOM' ? toTime : this.currentTime
                        }
                        scrubberTime={scrubberTime}
                        videoTimeline={camera1VideoTimes}
                        tickTock={tickTock}
                        clockStatus={clockStatus}
                        setClockStatus={this.setClockStatus}
                        setTickTock={(t) =>
                          this.setState({ tickTock: t }, () => {
                            this.pauseTickTock = t
                          })
                        }
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} md={8}>
                  {selectedVehicle && (
                    <LiveTracking
                      mode={mode}
                      vehicle={selectedVehicle}
                      clockStatus={clockStatus}
                      tickTock={tickTock}
                      travelReplayData={travelReplayData}
                      resetTravelReplayData={this.resetTravelReplayData}
                    />
                  )}
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Grid
                container
                spacing={2}
                alignItems="center"
                style={{ padding: 16 }}
              >
                <Grid item>
                  <FormControl>
                    <InputLabel htmlFor="range-selector">Time Range</InputLabel>
                    <Select
                      disabled={disableComponents}
                      value={timelineRange}
                      onChange={this.handleTimelineRangeChange}
                      inputProps={{
                        id: 'age-simple',
                      }}
                    >
                      <MenuItem value={1}>Last 1 hour</MenuItem>
                      <MenuItem value={4}>Last 4 hours</MenuItem>
                      <MenuItem value={8}>Last 8 hours</MenuItem>
                      <MenuItem value={24}>Last 24 hours</MenuItem>
                      <MenuItem value={48}>Last 48 hours</MenuItem>
                      <MenuItem value="CUSTOM">Custom</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item className={classes.scrubberContainer}>
                  <Grid container>
                    {selectedVehicle && (
                      <Grid item xs={12} className={classes.scrubberText}>
                        <Typography align="center">
                          {mode === 'LIVE'
                            ? 'Playing Live'
                            : `Playing video from: ${this.formatSliderValue()}`}
                        </Typography>
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <Slider
                        disabled={disableComponents}
                        value={scrubberValue}
                        onChange={this.handleScrubberChange}
                        min={0}
                        max={sliderRange}
                        step={1}
                        onMouseDown={this.handleMouseDown}
                        onChangeCommitted={this.handleChangeCommit}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item>
                  <Button
                    variant="outlined"
                    color={mode === 'LIVE' ? 'primary' : 'default'}
                    onClick={this.goLive}
                    disabled={!selectedVehicle}
                    className={classes.liveButton}
                  >
                    Live
                    {mode === 'LIVE' && (
                      <span className={classes.liveButtonBlinker} />
                    )}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        {this.state.timelineRange === 'CUSTOM' && (
          <Paper style={{ marginTop: 8 }}>
            <Grid
              container
              justify="space-between"
              alignItems="center"
              style={{ padding: 16 }}
            >
              <Grid item>
                <Grid container spacing={4}>
                  <Grid item style={{ paddingRight: 10 }}>
                    <DateTimePicker
                      label="From"
                      value={fromTime}
                      onChange={this.handleCustomTimeRangeChange('fromTime')}
                      disableFuture={true}
                    />
                  </Grid>

                  <Grid item style={{ paddingRight: 10 }}>
                    <DateTimePicker
                      label="To"
                      value={toTime}
                      onChange={this.handleCustomTimeRangeChange('toTime')}
                      disableFuture={true}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item>
                <ColorButton
                  onClick={this.handleCustomTimeRangeSubmit}
                  variant="contained"
                  color="primary"
                >
                  Submit
                </ColorButton>
              </Grid>
            </Grid>
          </Paper>
        )}
      </React.Fragment>
    )
  }
}

export default withSharedSnackbar(
  withApollo(withStyles(styles)(VideoControlPanel))
)
