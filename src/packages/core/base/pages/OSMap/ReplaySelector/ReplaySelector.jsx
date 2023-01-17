import React from 'react'
import {
  Grid,
  Button,
  CircularProgress,
  Typography,
  makeStyles,
} from '@material-ui/core'

import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  DateRange as DateRangeIcon,
  AccessTime as TimeRangeIcon,
} from '@material-ui/icons'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
import { DateTimePicker } from '@material-ui/pickers'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'

const useStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(2),
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
}))

function ReplaySelector(props) {
  const handleDateChange = (key, openSnackbar) => (date) => {
    if (props.isReplayActive) {
      openSnackbar("Dates can't be changed while replay is in progress.")
    } else {
      props.onDateChange(key, date)
    }
  }

  const handleStartStopClick = (key, openSnackbar) => (event) => {
    if (key === 'stop') {
      props.onSliderChange(0)
      props.onDateChange('fromDate', null)
      props.onDateChange('toDate', null)
      props.onReplayStatusChange(false)
      openSnackbar('Replay finished!')
    } else if (props.fromDate === null || props.toDate === null) {
      openSnackbar('Provide date range to view replay.')
    } else {
      props.onSliderChange(0)
      props.onReplayStatusChange(true)
      props.onRequestTravelReplayData()
    }
  }

  const { fromDate, toDate, openSnackbar } = props

  const classes = useStyles()

  return (
    <Grid
      container
      spacing={1}
      justify="flex-start"
      className={classes.container}
    >
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
          onChange={handleDateChange('fromDate', openSnackbar)}
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
          onChange={handleDateChange('toDate', openSnackbar)}
          disableFuture
          label="To"
        />
      </Grid>

      <Grid item xs={12}>
        {props.isTravelReplayDataLoading ? (
          <Button
            variant="text"
            className={classes.loadingButton}
            onClick={handleStartStopClick('stop', openSnackbar)}
          >
            <CircularProgress color="primary" />
          </Button>
        ) : props.isReplayActive ? (
          <ColorButton
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={handleStartStopClick('stop', openSnackbar)}
          >
            FINISH REPLAY
          </ColorButton>
        ) : (
          <ColorButton
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={handleStartStopClick('start', openSnackbar)}
          >
            START REPLAY
          </ColorButton>
        )}
      </Grid>
    </Grid>
  )
}

export default withSharedSnackbar(ReplaySelector)
