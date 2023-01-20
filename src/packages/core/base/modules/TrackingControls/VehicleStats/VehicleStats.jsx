import React from 'react'
import PropTypes from 'prop-types'
import { useLocation } from 'react-router-dom';
import { THEME_MAIN_COLORS as COLOR_RANGE } from '@zeliot/common/constants/styles'
import VehicleStatCard from './VehicleStatCard'
import { FaCarSide } from 'react-icons/fa';
import { AiOutlineCar } from 'react-icons/ai';
import { MdOutlineCarRepair, MdGpsOff, MdMobiledataOff } from 'react-icons/md';
import { IoMdBatteryDead } from 'react-icons/io'
import { RiWifiOffLine } from 'react-icons/ri'
import { BiTrip } from 'react-icons/bi'
import { TbCarCrash } from 'react-icons/tb'
import { HiOutlineBan, HiOutlineCursorClick } from 'react-icons/hi'
import Modal from './Modal'
import Items from './components/Items';
import './index.css'
import {
  Typography,
  Tooltip,
  Grid,
  withStyles,
  Paper,
  Zoom,
} from '@material-ui/core'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

const style = (theme) => ({
  statsTitle: {
    fontSize: 16,
    textAlign: 'center',
    verticalAlign: 'middle',
  },
  icon: {
    fontSize: 34,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  textLeft: {
    textAlign: 'left',
  },
  textRight: {
    textAlign: 'right',
  },
  textMiddle: {
    verticalAlign: 'middle',
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: 'left',
    color: theme.palette.text.secondary,
    // backgroundColor: 'rgba(234, 251, 255, 0.5)'
  },
  topCard: {
    textAlign: 'center',
    padding: theme.spacing(2),
    verticalAlign: 'middle',
  },
  textCenter: {
    textAlign: 'center',
  },
  rightBorder: {
    borderRight: '1px',
    borderRightColor: '#000045',
    borderRightStyle: 'solid',
  },
  bottomBorder: {
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderBottomColor: '#c4c4c4',
  },
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
  classes,
  selectedLanguage,
  vehicle,
  parkedIn,
  parked,
  allAreas,
  parkedO,
  parkedOut,
  tripsOn,
  dataTrips,
  allalert,
  all_alerts
}) => useLocation().pathname === "/home/dashboard" ?
    (
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
                  title={
                    languageJson[selectedLanguage].mainDashboardPage
                      .vehicleStatsCard.tracking.trackingTooltipTitle
                  }
                >
                  <Paper
                    style={{
                      textAlign: 'center',
                      borderStyle: 'solid',
                      borderWidth: 2,
                      borderColor: COLOR_RANGE.optimismBlue,
                      // backgroundColor: 'rgba(38,156,204, 0.1)',
                      cursor: 'pointer',
                      padding: 3,
                    }}
                  >
                    <Typography
                      variant="h6"
                      style={{
                        color: COLOR_RANGE.optimismBlue,
                        textAlign: 'center',
                      }}
                    >
                      {
                        languageJson[selectedLanguage].mainDashboardPage
                          .vehicleStatsCard.tracking.trackingCardTitle
                      }
                      : {tracking}

                    </Typography>
                  </Paper>
                </Tooltip>
              </Grid>
              <Grid item xs={6} md={3}>
                <VehicleStatCard
                  cardTitle={
                    languageJson[selectedLanguage].mainDashboardPage
                      .vehicleStatsCard.tracking.running
                  }
                  cardContent={running}
                  headerBackgroundColor={COLOR_RANGE.green}
                  selected={markerFilter === 'RUNNING'}
                  onClick={() => onMarkerFilterChange('RUNNING')}
                  cardDescription={
                    languageJson[selectedLanguage].mainDashboardPage
                      .vehicleStatsCard.tracking.runningTooltipTitle
                  }
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <VehicleStatCard
                  cardTitle={
                    languageJson[selectedLanguage].mainDashboardPage
                      .vehicleStatsCard.tracking.idle
                  }
                  cardContent={idle}
                  headerBackgroundColor={COLOR_RANGE.sunshine}
                  selected={markerFilter === 'IDLE'}
                  onClick={() => onMarkerFilterChange('IDLE')}
                  cardDescription={
                    languageJson[selectedLanguage].mainDashboardPage
                      .vehicleStatsCard.tracking.idleTooltipTitle
                  }
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <VehicleStatCard
                  cardTitle={
                    languageJson[selectedLanguage].mainDashboardPage
                      .vehicleStatsCard.tracking.halt
                  }
                  cardContent={halt}
                  headerBackgroundColor={COLOR_RANGE.red}
                  selected={markerFilter === 'HALT'}
                  onClick={() => onMarkerFilterChange('HALT')}
                  cardDescription={
                    languageJson[selectedLanguage].mainDashboardPage
                      .vehicleStatsCard.tracking.haltTooltipTitle
                  }
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <VehicleStatCard
                  cardTitle={
                    languageJson[selectedLanguage].mainDashboardPage
                      .vehicleStatsCard.tracking.noGps
                  }
                  cardContent={nogps}
                  headerBackgroundColor={COLOR_RANGE.flatGrey}
                  selected={markerFilter === 'NO_GPS'}
                  onClick={() => onMarkerFilterChange('NOGPS')}
                  cardDescription={
                    languageJson[selectedLanguage].mainDashboardPage
                      .vehicleStatsCard.tracking.noGpsTooltipTitle
                  }
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper
            square
            elevation={markerFilter === 'NON_TRACKING' ? 8 : 0}
            className={classes.paper}
            onClick={() => onMarkerFilterChange('NON_TRACKING')}
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
                  title={
                    languageJson[selectedLanguage].mainDashboardPage
                      .vehicleStatsCard.nonTracking.nonTrackingTooltipTitle
                  }
                >
                  <Paper
                    style={{
                      textAlign: 'center',
                      borderStyle: 'solid',
                      borderWidth: 2,
                      borderColor: COLOR_RANGE.gray,
                      padding: 3,
                      cursor: 'pointer',
                    }}
                  >
                    <Typography
                      variant="h6"
                      style={{
                        color: COLOR_RANGE.gray,
                        textAlign: 'center',
                      }}
                    >
                      {
                        languageJson[selectedLanguage].mainDashboardPage
                          .vehicleStatsCard.nonTracking.nonTrackingCardTitle
                      }
                      : {nontracking}
                    </Typography>
                  </Paper>
                </Tooltip>
              </Grid>
              <Grid item xs={6} md={4}>
                <VehicleStatCard
                  cardTitle={
                    languageJson[selectedLanguage].mainDashboardPage
                      .vehicleStatsCard.nonTracking.offline
                  }
                  cardContent={offline}
                  headerBackgroundColor={COLOR_RANGE.gerulean}
                  selected={markerFilter === 'OFFLINE'}
                  onClick={() => onMarkerFilterChange('OFFLINE')}
                  cardDescription={
                    languageJson[selectedLanguage].mainDashboardPage
                      .vehicleStatsCard.nonTracking.offlineTooltipTitle
                  }
                />
              </Grid>
              <Grid item xs={6} md={4}>
                <VehicleStatCard
                  cardTitle={
                    languageJson[selectedLanguage].mainDashboardPage
                      .vehicleStatsCard.nonTracking.noData
                  }
                  cardContent={nodata}
                  headerBackgroundColor={COLOR_RANGE.darkGrey}
                  selected={markerFilter === 'NO_DATA'}
                  onClick={() => onMarkerFilterChange('NO_DATA')}
                  cardDescription={
                    languageJson[selectedLanguage].mainDashboardPage
                      .vehicleStatsCard.nonTracking.noDataTooltipTitle
                  }
                />
              </Grid>
              <Grid item xs={6} md={4}>
                <VehicleStatCard
                  cardTitle={
                    languageJson[selectedLanguage].mainDashboardPage
                      .vehicleStatsCard.nonTracking.deviceDead
                  }
                  cardContent={devicedead}
                  headerBackgroundColor={COLOR_RANGE.darkSlate}
                  selected={markerFilter === 'DEAD'}
                  onClick={() => onMarkerFilterChange('DEAD')}
                  cardDescription={
                    languageJson[selectedLanguage].mainDashboardPage
                      .vehicleStatsCard.nonTracking.deviceDeadTooltipTitle
                  }
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    ) :
    // All about my personalized Dashboard
    (

      <div className="main-content flex-1  mt-12 md:mt-2 pb-5 md:pb-5" style={{ borderBottomLeftRadius: "5px", textAlign: "center", borderBottomRightRadius: "5px", borderTopLeftRadius: "5px", borderTopRightRadius: "5px", borderRight: "1px solid rgb(145,145,145)", borderLeft: "1px solid rgb(145,145,145)", borderBottom: "1px solid rgb(145,145,145)" }}>

        <div class="pt-5 rounded-t-40" style={{ borderBottomRightRadius: "0px", borderBottomLeftRadius: "0px", borderTopLeftRadius: "5px", borderTopRightRadius: "5px", backgroundColor: "rgb(145,145,145)" }}>
          <div class="rounded-tl-3xl bg-gradient-to-r from-blue-900 to-gray-800 p-4 shadow text-2xl text-white">

          </div>
        </div>
        <div className="flex flex-wrap">

          <Items
            icon={FaCarSide}
            top={running}
            take="speed"
            vehicle={vehicle}
            allAOI={allAreas}
            filter="RUNNING"
            fonct={onMarkerFilterChange}
            lang={languageJson[selectedLanguage].mainDashboardPage
              .vehicleStatsCard.tracking.runningTooltipTitle}
            title={languageJson[selectedLanguage].mainDashboardPage
              .vehicleStatsCard.tracking.running}
            style="green-600"
          />

          <Items
            icon={AiOutlineCar}
            top={idle}
            take="idlingStatus"
            vehicle={vehicle}
            allAOI={allAreas}
            filter="IDLE"
            fonct={onMarkerFilterChange}
            lang={languageJson[selectedLanguage].mainDashboardPage
              .vehicleStatsCard.tracking.idleTooltipTitle}
            title={languageJson[selectedLanguage].mainDashboardPage
              .vehicleStatsCard.tracking.idle}
            style="pink-600"
          />
          <Items
            icon={MdOutlineCarRepair}
            top={halt}
            vehicle={vehicle}
            allAOI={allAreas}
            take="haltStatus"
            filter="HALT"
            fonct={onMarkerFilterChange}
            lang={languageJson[selectedLanguage].mainDashboardPage
              .vehicleStatsCard.tracking.haltTooltipTitle}
            title={languageJson[selectedLanguage].mainDashboardPage
              .vehicleStatsCard.tracking.halt}
            style="yellow-600"
          />


          <Items
            icon={MdGpsOff}
            top={nogps}
            vehicle={vehicle}
            allAOI={allAreas}
            take="isNoGps"
            filter="NOGPS"
            fonct={onMarkerFilterChange}
            lang={languageJson[selectedLanguage].mainDashboardPage
              .vehicleStatsCard.tracking.noGpsTooltipTitle}
            title={languageJson[selectedLanguage].mainDashboardPage
              .vehicleStatsCard.tracking.noGps}
            style="gray-600"
          />


          <Items
            icon={RiWifiOffLine}
            top={offline}
            vehicle={vehicle}
            allAOI={allAreas}
            take="isOffline"
            filter="OFFLINE"
            fonct={onMarkerFilterChange}
            lang={languageJson[selectedLanguage].mainDashboardPage
              .vehicleStatsCard.nonTracking.offlineTooltipTitle}
            title={languageJson[selectedLanguage].mainDashboardPage
              .vehicleStatsCard.nonTracking.offline}
            style="blue-600"
          />


          <Items
            icon={MdMobiledataOff}
            top={nodata}
            vehicle={vehicle}
            allAOI={allAreas}
            filter="NO_DATA"
            fonct={onMarkerFilterChange}
            lang={languageJson[selectedLanguage].mainDashboardPage
              .vehicleStatsCard.nonTracking.noDataTooltipTitle}
            title={languageJson[selectedLanguage].mainDashboardPage
              .vehicleStatsCard.nonTracking.noData}
            style="indigo-300"
          />

          <Items
            icon={IoMdBatteryDead}
            top={devicedead}
            vehicle={vehicle}
            allAOI={allAreas}
            filter="DEAD"
            fonct={onMarkerFilterChange}
            lang={languageJson[selectedLanguage].mainDashboardPage
              .vehicleStatsCard.nonTracking.deviceDeadTooltipTitle}
            title={languageJson[selectedLanguage].mainDashboardPage
              .vehicleStatsCard.nonTracking.deviceDead}
            style="red-600"
          />

          <Items
            icon={TbCarCrash}
            top={allalert}
            vehicle={all_alerts}
            viols={true}
            filter="VIOLATION"
            fonct={onMarkerFilterChange}
            lang={languageJson[selectedLanguage].mainDashboardPage
              .vehicleStatsCard.details.violationTooltipTitle}
            title={languageJson[selectedLanguage].mainDashboardPage
              .vehicleStatsCard.details.violation}
            style="orange-600"
          />

          <Items
            icon={BiTrip}
            top={tripsOn}
            vehicle={dataTrips}
            trip={true}
            filter="ON_TRIPS"
            fonct={onMarkerFilterChange}
            lang={languageJson[selectedLanguage].mainDashboardPage
              .vehicleStatsCard.details.tripsTooltipTitle}
            title={languageJson[selectedLanguage].mainDashboardPage
              .vehicleStatsCard.details.trips}
            style="purple-600"
          />

          <Items
            icon={HiOutlineCursorClick}
            top={parkedIn}
            vehicle={parked}
            filter="PARKED_IN"
            allAOI={allAreas}
            decide={true}
            fonct={onMarkerFilterChange}
            lang={languageJson[selectedLanguage].mainDashboardPage
              .vehicleStatsCard.details.parkedInTooltipTitle}
            title={languageJson[selectedLanguage].mainDashboardPage
              .vehicleStatsCard.details.parkedIn}
            style="pink-600"
          />

          <Items
            icon={HiOutlineBan}
            top={parkedOut}
            vehicle={parkedO}
            filter="PARKED_OUT"
            decide={true}
            allAOI={allAreas}
            fonct={onMarkerFilterChange}
            lang={languageJson[selectedLanguage].mainDashboardPage
              .vehicleStatsCard.details.parkedOutTooltipTitle}
            title={languageJson[selectedLanguage].mainDashboardPage
              .vehicleStatsCard.details.parkedOut}
            style="yellow-600"
          />


        </div>

        {/* <Modal /> */}

      </div>
    )


















const isOffline = (timestamp) => {
  // timestamp is assumed to be UTC+0
  var d = new Date()
  var currentTime = Math.round(d.getTime() / 1000)
  return currentTime - parseInt(timestamp) > 43200
}

StatsCards.propTypes = {
  classes: PropTypes.object.isRequired,
  total: PropTypes.number.isRequired,
  halt: PropTypes.number.isRequired,
  running: PropTypes.number.isRequired,
  idle: PropTypes.number.isRequired,
  parked_in: PropTypes.number.isRequired,
  parked_out: PropTypes.number.isRequired,
  nogps: PropTypes.number.isRequired,
  offline: PropTypes.number.isRequired,
  vehicle: PropTypes.object.isRequired,
  allAreas: PropTypes.object.isRequired,
}

const VehicleStats = ({
  classes,
  onMarkerFilterChange,
  markerFilter,
  vehicles,
  allAreas,
  allTrips,
  allAlert,
  selectedLanguage,
}) => {

  function deg2rad(angle) {
    return (Math.PI * angle) / 180;
  }


  function getDistanceFromLatLonInKm(latitude1, longitude1, latitude2, longitude2, units) {
    var earthRadius = 6371; // Radius of the earth in km
    var dLat = deg2rad(latitude2 - latitude1);  // deg2rad below
    var dLon = deg2rad(longitude2 - longitude1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(latitude1)) * Math.cos(deg2rad(latitude2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = earthRadius * c;
    var miles = d / 1.609344;

    if (units == 'km') {
      return d;
    } else {
      return miles;
    }
  }

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
    parked_in: 0,
    parked_out: 0,
    ongoing_trips: 0,
    allalert: 0,
    vehicle: null,
    allAreas: null,
    all_trips: null,
    all_alerts: null,
    parked: [],
    parkedO: []

  }

  if (allAlert) {
    console.log(allAlert)
    stats.allalert = allAlert.length
    stats.all_alerts = allAlert
  }

  if (allTrips) {
    // console.log(allTrips)
    stats.all_trips = allTrips.edges
    stats.ongoing_trips = allTrips.totalCount
  }


  if (vehicles) {
    stats.vehicle = vehicles
    if (allAreas) {
      stats.allAreas = allAreas
      Object.values(allAreas).forEach((area) => {
        let r1 = JSON.parse(area.geoJson)

        Object.values(vehicles).forEach((voiture) => {
          // console.log(voiture)
          // voiture.timestamp >= 1674081713 && 
          if (voiture.timestamp >= 1674081713 && r1.type == "Circle" && getDistanceFromLatLonInKm(r1.coordinates[0], r1.coordinates[1], voiture.latitude, voiture.longitude, 'm') <= r1.radius) {
            if (!stats.parked.includes(voiture)) {
              stats.parked.push(voiture)
              stats.parked_in++
            }
          }
        })
      })

    }

    if (stats.parked_in > 0 && stats.parked.length > 0) {
      Object.values(vehicles).forEach((vehicle) => {
        if (vehicle.timestamp >= 1674081713 && !stats.parked.includes(vehicle)) {
          stats.parkedO.push(vehicle)
          stats.parked_out++
        }
      })
    }


    Object.values(vehicles).forEach((vehicle) => {
      if (vehicle.timestamp === null) {
        stats.nodata++
        stats.nontracking++
      } else if (vehicle.isOffline) {
        if (vehicle.isPrimaryBattery === false) {
          // device switched to secondary battery before going offline, assumed device dead
          stats.devicedead++
        } else {
          stats.offline++
        }
        stats.nontracking++
      } else {
        if (vehicle.idlingStatus) {
          stats.idle++
        } else if (vehicle.haltStatus) {
          stats.halt++
        } else if (vehicle.isNoGps) {
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
      selectedLanguage={selectedLanguage}
      vehicle={stats.vehicle}
      parkedIn={stats.parked_in}
      parked={stats.parked}
      parkedO={stats.parkedO}
      parkedOut={stats.parked_out}
      tripsOn={stats.ongoing_trips}
      allAreas={stats.allAreas}
      allalert={stats.allalert}
      all_alerts={stats.all_alerts}
      dataTrips={stats.all_trips}
    />
  )
}

VehicleStats.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(style)(withLanguage(VehicleStats))

