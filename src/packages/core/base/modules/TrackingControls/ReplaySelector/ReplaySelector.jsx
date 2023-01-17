import React from 'react'
import Grid from '@material-ui/core/Grid'
import {
  makeStyles,
  Button,
  CircularProgress,
  Typography,
  Divider,
  Switch,
} from '@material-ui/core'
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  DateRange as DateRangeIcon,
  AccessTime as TimeRangeIcon,
} from '@material-ui/icons'
import { DateTimePicker } from '@material-ui/pickers'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

const useStyles = makeStyles((theme) => ({
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
  container: {
    margin: theme.spacing(2),
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

  const classes = useStyles()

  const {
    fromDate,
    toDate,
    onSnapToRoadChange,
    snapToRoad,
    isReplayActive,
    openSnackbar,
    selectedLanguage,
  } = props

  return (
    <div className={classes.container}>
      <Grid container spacing={1} justify="flex-start">
        <Grid item xs={12}>
          <Grid container justify="space-around" alignItems="center">
            <Grid item sm={8}>
              <Typography className={classes.title} color="textSecondary">
                {snapToRoad
                  ? languageJson[selectedLanguage].mainDashboardPage.snapToRoad
                      .enabled
                  : languageJson[selectedLanguage].mainDashboardPage.snapToRoad
                      .disabled}
              </Typography>
            </Grid>

            <Grid item sm={4}>
              <Switch
                color="primary"
                value={snapToRoad}
                onChange={onSnapToRoadChange}
                disabled={isReplayActive}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Typography className={classes.title} color="textSecondary">
            {
              languageJson[selectedLanguage].mainDashboardPage.travelReplayTab
                .durationLabel
            }
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
              {
                languageJson[selectedLanguage].mainDashboardPage.travelReplayTab
                  .finishReplayButtonTitle
              }
            </ColorButton>
          ) : (
            <ColorButton
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={handleStartStopClick('start', openSnackbar)}
            >
              {
                languageJson[selectedLanguage].mainDashboardPage.travelReplayTab
                  .startReplayButtonTitle
              }
            </ColorButton>
          )}
        </Grid>

        <Grid item sm={12}>
          <Divider />
        </Grid>
      </Grid>
    </div>
  )
}

export default withLanguage(withSharedSnackbar(ReplaySelector))
