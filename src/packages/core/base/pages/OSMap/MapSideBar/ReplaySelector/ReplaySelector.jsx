import React, { Component } from 'react'
import { DateTimePicker } from '@material-ui/pickers'
import { SharedSnackbarConsumer } from '@zeliot/common/shared/SharedSnackbar/SharedSnackbar.context'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import DateRangeIcon from '@material-ui/icons/DateRange'
import TimeRangeIcon from '@material-ui/icons/AccessTime'

import {
  Grid,
  CardContent,
  withStyles,
  Card,
  Button,
  CircularProgress,
  Typography,
} from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

const styles = (theme) => ({
  card: {
    display: 'flex',
    marginTop: '3px',
    marginBottom: '3px',
  },
  button: {
    margin: theme.spacing(1),
  },
  loadingButton: {
    margin: theme.spacing(1),
    backgroundColor: 'white',
  },
  title: {
    fontSize: 14,
  },
})

class ReplaySelector extends Component {
  handleDateChange = (key, openSnackbar) => (date) => {
    if (this.props.isReplayActive) {
      openSnackbar("Dates can't be changed while replay is in progress.")
    } else {
      this.props.onDateChange(key, date)
    }
  }

  handleStartStopClick = (key, openSnackbar) => (event) => {
    if (key === 'stop') {
      this.props.onSliderChange(0)
      this.props.onDateChange('fromDate', null)
      this.props.onDateChange('toDate', null)
      this.props.onReplayStatusChange(false)
      openSnackbar('Replay finished!')
    } else if (this.props.fromDate === null || this.props.toDate === null) {
      openSnackbar('Provide date range to view replay.')
    } else {
      this.props.onSliderChange(0)
      this.props.onReplayStatusChange(true)
      this.props.onRequestTravelReplayData()
    }
  }

  render() {
    const { classes, fromDate, toDate } = this.props

    return (
      <Card className={classes.card}>
        <CardContent>
          <SharedSnackbarConsumer>
            {({ openSnackbar }) => (
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography className={classes.title} color="textSecondary">
                    Choose 24 hours duration to see replay
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <DateTimePicker
                    leftArrowIcon={<ChevronLeftIcon />}
                    rightArrowIcon={<ChevronRightIcon />}
                    dateRangeIcon={<DateRangeIcon />}
                    timeIcon={<TimeRangeIcon />}
                    value={fromDate}
                    onChange={this.handleDateChange('fromDate', openSnackbar)}
                    disableFuture
                    label="From"
                  />
                </Grid>
                <Grid item xs={12}>
                  <DateTimePicker
                    leftArrowIcon={<ChevronLeftIcon />}
                    rightArrowIcon={<ChevronRightIcon />}
                    dateRangeIcon={<DateRangeIcon />}
                    timeIcon={<TimeRangeIcon />}
                    value={toDate}
                    onChange={this.handleDateChange('toDate', openSnackbar)}
                    disableFuture
                    label="To"
                  />
                </Grid>

                <Grid item xs={12}>
                  {this.props.isTravelReplayDataLoading ? (
                    <Button
                      variant="text"
                      className={classes.loadingButton}
                      onClick={this.handleStartStopClick('stop', openSnackbar)}
                    >
                      <CircularProgress color="primary" />
                    </Button>
                  ) : this.props.isReplayActive ? (
                    <ColorButton
                      variant="contained"
                      color="primary"
                      className={classes.button}
                      onClick={this.handleStartStopClick('stop', openSnackbar)}
                    >
                      FINISH REPLAY
                    </ColorButton>
                  ) : (
                    <ColorButton
                      variant="contained"
                      color="primary"
                      className={classes.button}
                      onClick={this.handleStartStopClick('start', openSnackbar)}
                    >
                      START REPLAY
                    </ColorButton>
                  )}
                </Grid>
              </Grid>
            )}
          </SharedSnackbarConsumer>
        </CardContent>
      </Card>
    )
  }
}

export default withStyles(styles)(ReplaySelector)
