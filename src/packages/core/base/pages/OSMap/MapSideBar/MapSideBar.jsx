import React from 'react'
import {
  Grid,
  Input,
  IconButton,
  Typography,
  InputAdornment
} from '@material-ui/core'

import { Close as CloseIcon, Search as SearchIcon } from '@material-ui/icons'

import TrackingStats from './TrackingStats'
import ReplaySelector from '../ReplaySelector'
import VehicleList from './VehicleList'

function MapSideBar(props) {
  const [searchValue, setSearchValue] = React.useState('')

  function handleSearchValueChange(e) {
    setSearchValue(e.target.value)
  }

  function handleSelectedVehicleChange(selectedVehicle) {
    if (!selectedVehicle) {
      props.onTabChange('overview')
    }
    props.onSelectedVehicleChange(selectedVehicle)
  }

  const {
    selectedTab,
    vehicles,
    selectedVehicle,
    filter,
    stats,
    showStats,
    fromDate,
    toDate,
    sliderValue,
    onRequestTravelReplayData,
    onReplayStatusChange,
    onSliderChange,
    onDateChange,
    onPlayPauseChange,
    interval,
    isPause,
    speed,
    isReplayActive,
    isTravelReplayDataLoading,
    onIntervalChange,
    selectedVehicleIds,
    onSelectionAllChange
  } = props

  return (
    <Grid container spacing={1} justify="center">
      <Grid item xs={12}>
        {selectedVehicle && selectedVehicle.vehicleNumber && (
          <Typography variant="body2" color="textSecondary" align="center">
            Vehicle Number
          </Typography>
        )}
      </Grid>

      <Grid item xs={12} container justify="center">
        <Grid item>
          <Input
            fullWidth
            value={
              (selectedVehicle && selectedVehicle.vehicleNumber) || searchValue
            }
            disabled={isReplayActive}
            placeholder={
              /* eslint-disable indent  */

              filter === 'ONLINE'
                ? 'Search Online Vehicles'
                : filter === 'NOGPS'
                ? 'Search NoGPS Vehicles'
                : filter === 'RUNNING'
                ? 'Search Running Vehicles'
                : filter === 'IDLE'
                ? 'Search Idle Vehicles'
                : filter === 'OFFLINE'
                ? 'Search Offline Vehicles'
                : filter === 'HALT'
                ? 'Search Halted Vehicles'
                : filter === 'ALL'
                ? 'Search All Vehicles'
                : filter === 'DEAD'
                ? 'Search Device Dead Vehicles'
                : filter === 'TRACKING'
                ? 'Search Tracking Vehicles'
                : filter === 'NODATA'
                ? 'Search NoData Vehicles'
                : filter === 'NONTRACKING'
                ? 'Search Non Tracking Vehicles'
                : 'Search Vehicles'

              /* eslint-enable indent  */
            }
            onChange={handleSearchValueChange}
            startAdornment={
              <InputAdornment>
                <SearchIcon />
              </InputAdornment>
            }
            endAdornment={
              selectedVehicle && (
                <InputAdornment>
                  <IconButton
                    onClick={() => {
                      setSearchValue('')
                      handleSelectedVehicleChange(null)
                    }}
                    disabled={isReplayActive}
                  >
                    <CloseIcon />
                  </IconButton>
                </InputAdornment>
              )
            }
          />
        </Grid>
      </Grid>

      {/* eslint-disable indent */
      selectedVehicle && selectedTab === 'replay' && (
        <Grid item xs={12}>
          <ReplaySelector
            fromDate={fromDate}
            toDate={toDate}
            sliderValue={sliderValue}
            onRequestTravelReplayData={onRequestTravelReplayData}
            onReplayStatusChange={onReplayStatusChange}
            onSliderChange={onSliderChange}
            onDateChange={onDateChange}
            onPlayPauseChange={onPlayPauseChange}
            interval={interval}
            isPause={isPause}
            speed={speed}
            isReplayActive={isReplayActive}
            isTravelReplayDataLoading={isTravelReplayDataLoading}
            onIntervalChange={onIntervalChange}
          />
        </Grid>
      )
      /* eslint-disable indent */
      }

      <Grid item xs={12}>
        {selectedVehicle && showStats ? (
          <TrackingStats
            stats={stats}
            isReplayActive={isReplayActive}
            vehicleNumber={
              (selectedVehicle && selectedVehicle.vehicleNumber) || searchValue
            }
          />
        ) : (
          !selectedVehicle && (
            <VehicleList
              selectedVehicleIds={selectedVehicleIds}
              onSelectionAllChange={onSelectionAllChange}
              vehicles={vehicles}
              searchValue={searchValue}
              order={props.order}
              handleRequestSort={props.handleRequestSort}
              onSelectedVehicleChange={handleSelectedVehicleChange}
              filter={filter}
              onSelectionChange={props.onSelectionChange}
            />
          )
        )}
      </Grid>
    </Grid>
  )
}

export default MapSideBar
