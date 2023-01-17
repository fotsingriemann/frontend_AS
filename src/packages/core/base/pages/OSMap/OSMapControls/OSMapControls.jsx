import React from 'react'
import { Link } from 'react-router-dom'
import { Grid, Button, Slider, Typography, withStyles } from '@material-ui/core'
import RoundedPaper from '@zeliot/common/ui/RoundedPaper'
import MapSideBar from '../MapSideBar'
import StatCard from '../StatCard/StatCard'
import MapTabView from '../MapTabView'
import ReplayControlPanel from '../ReplayControlPanel'
import WrappedMap from '../WrappedMap'

const styles = theme => ({
  statsRow: {
    marginTop: theme.spacing(2)
  },
  dividerRow: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  mapPaper: {
    padding: theme.spacing(1),
    textAlign: 'center'
  },
  mapReplayControl: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    width: '90%',
    pointerEvents: 'none',
    zIndex: 1000
  },
  catchAllEvents: {
    pointerEvents: 'all'
  },
  bottomButtonsContainer: {
    padding: theme.spacing(2)
  },
  bottomButtons: {
    fontSize: 10,
    padding: theme.spacing(1)
  }
})

const OSMapControls = ({
  classes,
  vehicles,
  markerFilter,
  filteredVehicles,
  onMarkerFilterChange,
  ...rest
}) => (
  <Grid container spacing={1}>
    <Grid item xs={12}>
      <Typography variant="h5" className={classes.textLeft}>
        Dashboard
      </Typography>
    </Grid>

    {rest.selectedTab === 'overview' && (
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          vehicles={vehicles}
          markerFilter={markerFilter}
          onMarkerFilterChange={onMarkerFilterChange}
        />
      </Grid>
    )}

    <Grid item xs={12} md={rest.selectedTab === 'overview' ? 6 : 9}>
      <MapTabView
        selectedTab={rest.selectedTab}
        isReplayActive={rest.isReplayActive}
        onTabChange={rest.onTabChange}
        selectedVehicle={rest.selectedVehicle}
      />

      <WrappedMap
        devices={
          /* eslint-disable indent */
          rest.selectedVehicleIds.length > 0
            ? rest.selectedVehicleIds.map(
                uniqueId => filteredVehicles[uniqueId]
              )
            : Object.values(filteredVehicles).filter(
                vehicle => vehicle.timestamp
              )
          /* eslint-enable indent */
        }
        selectedVehicle={rest.selectedVehicle}
        selectedTab={rest.selectedTab}
        liveData={rest.liveData}
        replayData={rest.replayData}
        zoom={rest.zoom}
        center={rest.center}
        handleMapCenterChange={rest.handleMapCenterChange}
        handleMapZoomChange={rest.handleMapZoomChange}
        onMarkerClick={rest.onMarkerClick}
        flags={rest.flags}
      >
        {rest.isReplayActive && (
          <Grid
            container
            alignItems="center"
            className={classes.mapReplayControl}
          >
            <Grid item xs={12} md={3}>
              <ReplayControlPanel
                togglePlay={!rest.isPause}
                speed={rest.speed}
                onPlayPause={rest.onPlayPauseChange}
                speedFactor={rest.getInterval}
              />
            </Grid>

            <Grid item xs={12} md={9} className={classes.playControls}>
              <Slider
                value={rest.sliderValue}
                onChange={rest.onSliderChange}
                className={classes.catchAllEvents}
              />
            </Grid>
          </Grid>
        )}
      </WrappedMap>
    </Grid>

    <Grid item xs={12} md={3}>
      <RoundedPaper>
        <MapSideBar vehicles={filteredVehicles} {...rest} />

        <Grid container spacing={1}>
          {rest.selectedTab === 'overview' && (
            <Grid
              container
              alignItems="center"
              className={classes.bottomButtonsContainer}
            >
              <Grid item sm={6} container justify="center">
                <Grid item>
                  <Button
                    component={Link}
                    color="primary"
                    variant="outlined"
                    to="/home/dashboard/current-trackinfo"
                    className={classes.bottomButtons}
                  >
                    Current Trackinfo
                  </Button>
                </Grid>
              </Grid>

              <Grid item sm={6} container justify="center">
                <Grid item>
                  <Button
                    component={Link}
                    color="primary"
                    variant="outlined"
                    to="/home/dashboard/current-summary"
                    className={classes.bottomButtons}
                  >
                    Current Summary
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
      </RoundedPaper>
    </Grid>
  </Grid>
)

export default withStyles(styles)(OSMapControls)
