import React from 'react'
import gql from 'graphql-tag'
import { Link } from 'react-router-dom'
import { Query, withApollo } from 'react-apollo'
import { Grid, Button, makeStyles, Slider } from '@material-ui/core'
import withGoogleMaps from '@zeliot/common/hoc/withGoogleMaps'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import {
  TRAVEL_REPLAY_PACKETS,
  GET_ALL_DEVICES,
} from '@zeliot/common/graphql/queries'
import { REPLAY_DURATION } from '@zeliot/common/constants/others'
import RoundedPaper from '@zeliot/common/ui/RoundedPaper'
import getLoginId from '@zeliot/common/utils/getLoginId'
import StatCard from '../StatCard'
import MapTabView from '../MapTabView'
import Map from '../Maps/Map'
import ReplayControlPanel from '../ReplayControlPanel'
import PlaceSearcher from '../PlaceSearcher/'
import MapSideBar from '../MapSideBar'
import getCustomMarker from '../Maps/Map/CustomMarker'
import getCustomPopup from '../Maps/Map/CustomPopup'
import getMultiLine from '../Maps/Map/MultiLine'

const initialState = {
  filteredVehicles: {},
  markerFilter: 'TRACKING',
  selectedTab: 'overview',
  vehicles: {},
  selectedVehicle: null,
  fromDate: null,
  toDate: null,
  sliderValue: 0,
  interval: REPLAY_DURATION,
  isPause: false,
  replaySpeed: 8,
  isReplayActive: false,
  travelReplayData: {},
  liveData: {},
  markers: {},
  multiLine: null,
  replayMultiLine: null,
  map: null,
  isTravelReplayDataLoading: false,
  stats: null,
  showTrackingStats: false,
  replayDuration: 0,
  isSpeedGraphAnimationLive: false,
  liveSpeed: 0,
  graphIndex: 0,
  order: 'desc',
  snapToRoad: false,
  snapToRoadToggleScheduled: false,
  selected: [],
}

function reducer(state, action) { }

function VehicleTracker(props) {
  const CustomMarker = React.useRef(getCustomMarker(props.google))
  const CustomPopup = React.useRef(getCustomPopup(props.google))
  const MultiLine = React.useRef(getMultiLine(props.google))

  const customPopup = React.useRef(new CustomPopup.current())

  const [state, disptach] = React.useReducer(reducer, initialState)

  function handleMarkerFilterChange(markerFilter) {
    console.log(markerFilter)
  }

  React.useEffect(() => { }, [])

  const {
    selectedVehicle,
    isPause,
    isTravelReplayDataLoading,
    interval,
    replaySpeed,
    fromDate,
    toDate,
    sliderValue,
    selectedTab,
    isReplayActive,
    markerFilter,
    stats,
    showTrackingStats,
    filteredVehicles,
    vehicles,
    selected,
  } = state

  const classes = useStyles()

  return (
    <Grid container spacing={1}>
      {selectedTab === 'overview' && (
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
          container
          spacing={1}
          direction="column"
        >
          <Grid item>
            {console.log(vehicles)}
            <StatCard
              vehicles={vehicles}
              markerFilter={markerFilter}
              onMarkerFilterChange={handleMarkerFilterChange}
            />
          </Grid>

          {/* <Grid item style={{ display: 'flex', flex: 1 }}>
            {this.props.alertsList}
          </Grid> */}
        </Grid>
      )}

      {/* <Grid
        item
        xs={12}
        md={selectedTab === 'overview' ? 6 : 9}
        container
        direction="column"
        spacing={1}
      >
        <Grid item>
          <MapTabView
            selectedTab={selectedTab}
            isReplayActive={isReplayActive}
            onTabChange={this.handleTabChange}
            selectedVehicle={selectedVehicle}
          />
          <Map google={this.props.google} zoom={5} setMap={this.setMap}>
            {isReplayActive && (
              <Grid
                container
                alignItems="center"
                className={classes.mapReplayControl}
              >
                <Grid item xs={12} md={3}>
                  <ReplayControlPanel
                    togglePlay={!isPause}
                    speed={replaySpeed}
                    onPlayPause={this.togglePlay}
                    speedFactor={this.getInterval}
                  />
                </Grid>

                <Grid item xs={12} md={9} className={classes.playControls}>
                  <Slider
                    value={sliderValue}
                    onChange={this.onSliderChange}
                    className={classes.catchAllEvents}
                  />
                </Grid>
              </Grid>
            )}

            {selectedTab === 'overview' && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 20
                }}
              >
                <PlaceSearcher changeBounds={this.handleBoundsChange} />
              </div>
            )}
          </Map>
        </Grid>

        <Grid item style={{ display: 'flex', flex: 1 }}>
          {this.props.periodSelector}
        </Grid>
      </Grid>

      <Grid item xs={12} md={3} style={{ display: 'flex', flex: 1 }}>
        <RoundedPaper style={{ height: '100%' }}>
          <MapSideBar
            snapToRoad={this.state.snapToRoad}
            onSnapToRoadChange={this.handleSnapToRoadChange}
            vehicles={filteredVehicles}
            selectedVehicleIds={selected}
            order={this.state.order}
            handleRequestSort={this.handleRequestSort}
            selectedVehicle={selectedVehicle}
            onSelectedVehicleChange={this.handleSelectedVehicleChange}
            onTabChange={this.handleTabChange}
            filter={markerFilter}
            stats={stats}
            showStats={showTrackingStats}
            selectedTab={selectedTab}
            interval={interval}
            isPause={!isPause}
            speed={replaySpeed}
            isReplayActive={isReplayActive}
            isTravelReplayDataLoading={isTravelReplayDataLoading}
            fromDate={fromDate}
            toDate={toDate}
            sliderValue={sliderValue}
            onSliderChange={this.handleSliderChange}
            onDateChange={this.handleDateChange}
            onIntervalChange={this.handleIntervalChange}
            onPlayPauseChange={this.handlePlayPauseChange}
            onReplayStatusChange={this.handleReplayStatus}
            onRequestTravelReplayData={this.requestReplayData}
            onSelectionChange={this.handleSelectionChange}
            onSelectionAllChange={this.handleSelectionAllChange}
          />

          {selectedTab === 'overview' && (
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
        </RoundedPaper>
      </Grid> */}
    </Grid>
  )
}

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  mapReplayControl: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    width: '90%',
    pointerEvents: 'none',
  },
  catchAllEvents: {
    pointerEvents: 'all',
  },
  placeSearcher: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  topPadding: {
    paddingTop: theme.spacing(2),
  },
  bottomButtonsContainer: {
    padding: theme.spacing(2),
  },
  bottomButtons: {
    fontSize: 10,
    padding: theme.spacing(1),
  },
}))

const GET_CLIENT_DETAIL = gql`
  query($loginId: Int!) {
    clientDetail(loginId: $loginId) {
      lat
      long
    }
  }
`

const WrappedVehicleTracker = withGoogleMaps(
  withApollo(
    withSharedSnackbar((props) => (
      <Query query={GET_CLIENT_DETAIL} variables={{ loginId: getLoginId() }}>
        {({ data }) => (
          <VehicleTracker
            defaultCenter={{
              lat: data.clientDetail.lat || 7.36,
              lng: data.clientDetail.long || 12.35,
            }}
            {...props}
          />
        )}
      </Query>
    ))
  )
)

export default WrappedVehicleTracker
