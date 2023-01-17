import React from 'react'
import PropTypes from 'prop-types'
import { THEME_MAIN_COLORS as COLOR_RANGE } from '@zeliot/common/constants/styles'
import VehicleStatCard from './VehicleStatCard'
import {
  Typography,
  Tooltip,
  Grid,
  withStyles,
  Paper,
  Zoom
} from '@material-ui/core'

const style = theme => ({
  statsTitle: {
    fontSize: 16,
    textAlign: 'center',
    verticalAlign: 'middle'
  },
  icon: {
    fontSize: 34,
    textAlign: 'center',
    color: '#FFFFFF'
  },
  textLeft: {
    textAlign: 'left'
  },
  textRight: {
    textAlign: 'right'
  },
  textMiddle: {
    verticalAlign: 'middle'
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: 'left',
    color: theme.palette.text.secondary
    // backgroundColor: 'rgba(234, 251, 255, 0.5)'
  },
  topCard: {
    textAlign: 'center',
    padding: theme.spacing(2),
    verticalAlign: 'middle'
  },
  textCenter: {
    textAlign: 'center'
  },
  rightBorder: {
    borderRight: '1px',
    borderRightColor: '#000045',
    borderRightStyle: 'solid'
  },
  bottomBorder: {
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderBottomColor: '#c4c4c4'
  }
})

const StatsCards = ({
  total,
  tracking,
  halt,
  running,
  idle,
  nogps,
  nontracking,
  offline,
  nodata,
  devicedead,
  onMarkerFilterChange,
  markerFilter,
  classes
}) => (
  <Grid container spacing={1}>
    <Grid item xs={12} md={7}>
      <Paper
        square
        elevation={markerFilter === 'TRACKING' ? 8 : 0}
        className={classes.paper}
        onClick={() => onMarkerFilterChange('TRACKING')}
      >
        <Grid
          container
          spacing={1}
          alignItems="flex-start"
          justify="space-between"
        >
          <Grid item xs={12}>
            <Tooltip
              TransitionComponent={Zoom}
              title="Vehicles which have communicated in last 30 minutes"
            >
              <Paper
                style={{
                  textAlign: 'center',
                  borderStyle: 'solid',
                  borderWidth: 2,
                  borderColor: COLOR_RANGE.optimismBlue,
                  cursor: 'pointer',
                  padding: 3
                }}
              >
                <Typography
                  variant="h6"
                  style={{
                    color: COLOR_RANGE.optimismBlue,
                    textAlign: 'center'
                  }}
                >
                  Tracking: {tracking}
                </Typography>
              </Paper>
            </Tooltip>
            <br />
          </Grid>
          <Grid item xs={6} md={3}>
            <VehicleStatCard
              cardTitle="RUNNING"
              cardContent={running}
              headerBackgroundColor={COLOR_RANGE.green}
              selected={markerFilter === 'RUNNING'}
              onClick={() => onMarkerFilterChange('RUNNING')}
              cardDescription="Vehicles running at more than 3 kmph"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <VehicleStatCard
              cardTitle="IDLE"
              cardContent={idle}
              headerBackgroundColor={COLOR_RANGE.sunshine}
              selected={markerFilter === 'IDLE'}
              onClick={() => onMarkerFilterChange('IDLE')}
              cardDescription="Vehicles with ignition ON and not moving"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <VehicleStatCard
              cardTitle="HALT"
              cardContent={halt}
              headerBackgroundColor={COLOR_RANGE.red}
              selected={markerFilter === 'HALT'}
              onClick={() => onMarkerFilterChange('HALT')}
              cardDescription="Vehicles with ignition OFF and sent data in last 30 minutes"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <VehicleStatCard
              cardTitle="NO GPS"
              cardContent={nogps}
              headerBackgroundColor={COLOR_RANGE.flatGrey}
              selected={markerFilter === 'NOGPS'}
              onClick={() => onMarkerFilterChange('NOGPS')}
              cardDescription="Vehicles that have sent data in last 30 minutes without a valid GPS data"
            />
          </Grid>
        </Grid>
      </Paper>
    </Grid>
    <Grid item xs={12} md={5}>
      <Paper
        square
        elevation={markerFilter === 'NONTRACKING' ? 8 : 0}
        className={classes.paper}
        onClick={() => onMarkerFilterChange('NONTRACKING')}
      >
        <Grid
          container
          spacing={1}
          alignItems="flex-start"
          justify="space-between"
        >
          <Grid item xs={12}>
            <Tooltip
              TransitionComponent={Zoom}
              title="Vehicles which have NOT communicated in last 30 minutes"
            >
              <Paper
                style={{
                  textAlign: 'center',
                  borderStyle: 'solid',
                  borderWidth: 2,
                  borderColor: COLOR_RANGE.gray,
                  padding: 3,
                  cursor: 'pointer'
                }}
              >
                <Typography
                  variant="h6"
                  style={{
                    color: COLOR_RANGE.gray,
                    textAlign: 'center'
                  }}
                >
                  Non Tracking: {nontracking}
                </Typography>
              </Paper>
            </Tooltip>
            <br />
          </Grid>
          <Grid item xs={6} md={4}>
            <VehicleStatCard
              cardTitle="OFFLINE"
              cardContent={offline}
              headerBackgroundColor={COLOR_RANGE.gerulean}
              selected={markerFilter === 'OFFLINE'}
              onClick={() => onMarkerFilterChange('OFFLINE')}
              cardDescription="Vehicles which haven't sent data in last 30 minutes"
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <VehicleStatCard
              cardTitle="NO DATA"
              cardContent={nodata}
              headerBackgroundColor={COLOR_RANGE.darkGrey}
              selected={markerFilter === 'NODATA'}
              onClick={() => onMarkerFilterChange('NODATA')}
              cardDescription="Vehicles which haven't sent valid data since installation"
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <VehicleStatCard
              cardTitle="DEAD"
              cardContent={devicedead}
              headerBackgroundColor={COLOR_RANGE.darkSlate}
              selected={markerFilter === 'DEAD'}
              onClick={() => onMarkerFilterChange('DEAD')}
              cardDescription="Offline vehicles which sent the last packet on the device secondary battery"
            />
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  </Grid>
)

StatsCards.propTypes = {
  classes: PropTypes.object.isRequired,
  total: PropTypes.number.isRequired,
  halt: PropTypes.number.isRequired,
  running: PropTypes.number.isRequired,
  idle: PropTypes.number.isRequired,
  nogps: PropTypes.number.isRequired,
  offline: PropTypes.number.isRequired
}

const isOffline = timestamp => {
  // timestamp is assumed to be UTC+0
  const d = new Date()
  const currentTime = Math.round(d.getTime() / 1000)
  return currentTime - parseInt(timestamp) > 1800
}

const VehicleStats = ({
  classes,
  onMarkerFilterChange,
  markerFilter,
  devices
}) => {
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
    devicedead: 0
  }

  if (devices) {
    devices.forEach(device => {
      if (device.timestamp === null) {
        stats.nodata++
        stats.nontracking++
      } else if (isOffline(device.timestamp)) {
        if (device.isPrimaryBattery === false) {
          // device switched to secondary battery before going offline, assumed device dead
          stats.devicedead++
        } else {
          stats.offline++
        }
        stats.nontracking++
      } else {
        if (device.idlingStatus) {
          stats.idle++
        } else if (device.haltStatus) {
          stats.halt++
        } else if (device.isNoGps) {
          stats.nogps++
        } else {
          stats.running++
        }
        stats.tracking++
      }
    })
  }

  stats.total = stats.tracking + stats.nontracking

  return (
    <StatsCards
      total={stats.total}
      tracking={stats.tracking}
      running={stats.running}
      idle={stats.idle}
      halt={stats.halt}
      nogps={stats.nogps}
      nontracking={stats.nontracking}
      offline={stats.offline}
      nodata={stats.nodata}
      devicedead={stats.devicedead}
      classes={classes}
      onMarkerFilterChange={onMarkerFilterChange}
      markerFilter={markerFilter}
    />
  )
}

VehicleStats.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(style)(VehicleStats)
