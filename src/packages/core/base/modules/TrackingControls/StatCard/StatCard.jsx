import React from 'react'
import clsx from 'clsx'
import { Grid, Typography, makeStyles } from '@material-ui/core'
import RoundedPaper from '@zeliot/common/ui/RoundedPaper'

function isOffline(timestamp) {
  const d = new Date()
  const currentTime = Math.round(d.getTime() / 1000)
  return currentTime - parseInt(timestamp) > 1800
}

function getStats(devices) {
  const stats = {
    total: 0,
    tracking: 0,
    idle: 0,
    halt: 0,
    nogps: 0,
    running: 0,
    nontracking: 0,
    offline: 0,
    nodata: 0,
    devicedead: 0,
  }
  if (devices) {
    devices.forEach((device) => {
      if (device.timestamp === null) {
        stats.nodata++
        stats.nontracking++
      } else if (device.isOffline) {
        if (device.isPrimaryBattery === false) {
          // device switched to secondary battery before going offline, assumed device dead
          stats.devicedead++
        } else {
          stats.offline++
        }
        stats.nontracking++
      } else {
        if (device.isNoGps) {
          stats.nogps++
        } else if (device.haltStatus) {
          stats.halt++
        } else if (device.idlingStatus) {
          stats.idle++
        } else {
          stats.running++
        }
        stats.tracking++
      }
    })
  }

  stats.total = stats.tracking + stats.nontracking

  return stats
}

const useStatItemStyles = makeStyles((theme) => ({
  statItem: {
    cursor: 'pointer',
    margin: '2px 0px',
    padding: '0px 8px',
    userSelect: 'none',

    '&:hover': {
      boxShadow: theme.shadows[1],
    },
  },
  selectedStatItem: {},
  selectedStatItemText: {
    '&::after': {
      content: "''",
      verticalAlign: 'middle',
      display: 'inline-block',
      width: 10,
      height: 10,
      borderRadius: '50%',
      background:
        theme.mode === 'dark' ? 'rgb(230, 230, 230)' : 'rgb(65, 80, 119)',
      marginLeft: 10,
    },
  },

  countLineHeight: {
    lineHeight: 1.25,
  },
}))

function StatItem({
  title,
  type,
  value,
  color,
  variant,
  markerFilter,
  onMarkerFilterChange,
}) {
  const classes = useStatItemStyles()

  return (
    <Grid
      container
      alignItems="center"
      justify="space-between"
      className={clsx(
        classes.statItem,
        markerFilter === type && classes.selectedStatItem
      )}
      onClick={() => onMarkerFilterChange(type)}
    >
      <Grid item>
        <Typography
          variant={variant}
          align="left"
          className={markerFilter === type ? classes.selectedStatItemText : ''}
        >
          {title}
        </Typography>
      </Grid>

      <Grid item className={color}>
        <Typography
          variant={variant}
          align="right"
          className={classes.countLineHeight}
        >
          <b>{value}</b>
        </Typography>
      </Grid>
    </Grid>
  )
}

const useStyles = makeStyles((theme) => ({
  card: {
    padding: theme.spacing(2),
  },
  statCount: {
    borderRadius: 5,
    color: 'white',
    padding: '0px 8px',
  },
  green: {
    background: '#6AD074',
  },
  red: {
    background: '#F94B65',
  },
  yellow: {
    background: '#FDDA37',
  },
  grey: {
    background: '#6F6F70',
  },
  brown: {
    background: '#CD853F',
  },
  tracking: {
    color: 'blue',
  },
  nonTracking: {
    color: '#F94B65',
  },
}))

function StatCard(props) {
  const classes = useStyles()
  const { vehicles, ...otherProps } = props
  const stats = getStats(Object.values(vehicles))

  return (
    <RoundedPaper className={classes.card}>
      <Grid container>
        <Grid item xs={12}>
          <StatItem
            title="Tracking Vehicles"
            type="TRACKING"
            value={stats.tracking}
            variant="h6"
            color={classes.tracking}
            {...otherProps}
          />
        </Grid>

        <Grid item xs={12}>
          <StatItem
            title="Running"
            type="RUNNING"
            value={stats.running}
            variant="subtitle1"
            color={clsx(classes.green, classes.statCount)}
            {...otherProps}
          />
        </Grid>

        <Grid item xs={12}>
          <StatItem
            title="Idle"
            type="IDLE"
            value={stats.idle}
            variant="subtitle1"
            color={clsx(classes.yellow, classes.statCount)}
            {...otherProps}
          />
        </Grid>

        <Grid item xs={12}>
          <StatItem
            title="Halt"
            type="HALT"
            value={stats.halt}
            variant="subtitle1"
            color={clsx(classes.red, classes.statCount)}
            {...otherProps}
          />
        </Grid>

        <Grid item xs={12}>
          <StatItem
            title="No GPS"
            type="NO_GPS"
            value={stats.nogps}
            variant="subtitle1"
            color={clsx(classes.grey, classes.statCount)}
            {...otherProps}
          />
        </Grid>

        <Grid item xs={12}>
          <StatItem
            title="Non Tracking"
            type="NON_TRACKING"
            value={stats.nontracking}
            variant="h6"
            color={classes.nonTracking}
            {...otherProps}
          />
        </Grid>

        <Grid item xs={12}>
          <StatItem
            title="Offline"
            type="OFFLINE"
            value={stats.offline}
            variant="subtitle1"
            color={clsx(classes.grey, classes.statCount)}
            {...otherProps}
          />
        </Grid>

        <Grid item xs={12}>
          <StatItem
            title="No Data"
            type="NO_DATA"
            value={stats.nodata}
            variant="subtitle1"
            color={clsx(classes.brown, classes.statCount)}
            {...otherProps}
          />
        </Grid>

        <Grid item xs={12}>
          <StatItem
            title="Dead"
            type="DEAD"
            value={stats.devicedead}
            variant="subtitle1"
            {...otherProps}
          />
        </Grid>
      </Grid>
    </RoundedPaper>
  )
}

export default StatCard
