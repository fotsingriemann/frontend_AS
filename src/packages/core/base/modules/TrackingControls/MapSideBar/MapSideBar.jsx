import React from 'react'
import {
  Grid,
  Input,
  IconButton,
  Typography,
  InputAdornment,
  Tooltip,
} from '@material-ui/core'
import {
  Close as CloseIcon,
  Search as SearchIcon,
  AllOut as GroupSearchIcon,
  DirectionsCar as VehicleSearchIcon,
} from '@material-ui/icons'
import ReplaySelector from '../ReplaySelector'
import TrackingStats from './TrackingStats'
import VehicleList from './VehicleList'
// import VehicleTable from './VehicleTable'
import GroupTable from './GroupTable'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

function MapSideBar(props) {
  const [searchValue, setSearchValue] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(5)

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
    onSnapToRoadChange,
    snapToRoad,
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
    onSelectionAllChange,
    order,
    handleRequestSort,
    isGroupSearchActive,
    allGroups,
    selectedGroup,
    selectedLanguage,
    driverName,
    driverContactNo,
    driverImage,
  } = props

  function handleSelectedVehicleChange(selectedVehicle) {
    if (!selectedVehicle) {
      props.onTabChange('overview')
    }

    props.onSelectedVehicleChange(selectedVehicle)
  }

  function handleSelectedGroupChange(selectedGroup) {
    props.onSelectedGroupChange(selectedGroup)
  }

  function handleSearchChangeToGroup(toggleToGroupSearch) {
    setCurrentPage(0)
    props.onSearchChangeToGroup(toggleToGroupSearch)
  }

  // Reset to first change when a filter changes
  React.useEffect(() => {
    setCurrentPage(0)
  }, [filter])

  return (
    <Grid
      container
      spacing={1}
      style={{
        height: 530,
        overflowY: 'auto',
        overflowX: 'hidden',
        marginBottom: 10,
        alignContent: 'flex-start',
      }}
    >
      <Grid item xs={10}>
        {selectedVehicle && selectedVehicle.vehicleNumber && (
          <Typography variant="body2" color="textSecondary" align="center">
            {languageJson[selectedLanguage].common.vehicleNumber}
          </Typography>
        )}
      </Grid>

      <Grid item xs={10} container justify="center">
        <Input
          style={{ marginLeft: '8px' }}
          fullWidth
          value={
            (selectedVehicle && selectedVehicle.vehicleNumber) || searchValue
          }
          disabled={isReplayActive}
          placeholder={
            /* eslint-disable indent  */

            isGroupSearchActive
              ? `${languageJson[selectedLanguage].mainDashboardPage.inputFieldPlaceholder.searchGroups}`
              : filter === 'ONLINE'
              ? `${languageJson[selectedLanguage].mainDashboardPage.inputFieldPlaceholder.searchOnlineVehicles}`
              : filter === 'NOGPS'
              ? `${languageJson[selectedLanguage].mainDashboardPage.inputFieldPlaceholder.searchNoGpsVehicles}`
              : filter === 'RUNNING'
              ? `${languageJson[selectedLanguage].mainDashboardPage.inputFieldPlaceholder.searchRunningVehicles}`
              : filter === 'IDLE'
              ? `${languageJson[selectedLanguage].mainDashboardPage.inputFieldPlaceholder.searchIdleVehicles}`
              : filter === 'OFFLINE'
              ? `${languageJson[selectedLanguage].mainDashboardPage.inputFieldPlaceholder.searchOfflineVehicles}`
              : filter === 'HALT'
              ? `${languageJson[selectedLanguage].mainDashboardPage.inputFieldPlaceholder.searchHaltedVehicles}`
              : filter === 'ALL'
              ? `${languageJson[selectedLanguage].mainDashboardPage.inputFieldPlaceholder.searchAllVehicles}`
              : filter === 'DEAD'
              ? `${languageJson[selectedLanguage].mainDashboardPage.inputFieldPlaceholder.searchDeviceDeadVehicles}`
              : filter === 'TRACKING'
              ? `${languageJson[selectedLanguage].mainDashboardPage.inputFieldPlaceholder.searchTrackingVehicles}`
              : filter === 'NODATA'
              ? `${languageJson[selectedLanguage].mainDashboardPage.inputFieldPlaceholder.searchNoDataVehicles}`
              : filter === 'NONTRACKING'
              ? `${languageJson[selectedLanguage].mainDashboardPage.inputFieldPlaceholder.searchNonTrackingVehicles}`
              : `${languageJson[selectedLanguage].mainDashboardPage.inputFieldPlaceholder.searchVehicles}`

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
      {selectedTab === 'overview' && (
        <Grid item xs={2}>
          <Tooltip
            title={
              isGroupSearchActive
                ? languageJson[selectedLanguage].mainDashboardPage
                    .toggleVehicleSearch
                : languageJson[selectedLanguage].mainDashboardPage
                    .toggleGroupSearch
            }
          >
            <IconButton
              onClick={() => {
                handleSearchChangeToGroup(isGroupSearchActive ? false : true)
              }}
            >
              {!isGroupSearchActive ? (
                <GroupSearchIcon />
              ) : (
                <VehicleSearchIcon />
              )}
            </IconButton>
          </Tooltip>
        </Grid>
      )}

      {
        /* eslint-disable indent */
        selectedVehicle && selectedTab === 'replay' && (
          <Grid item xs={12}>
            <ReplaySelector
              snapToRoad={snapToRoad}
              onSnapToRoadChange={onSnapToRoadChange}
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
            driverName={driverName}
            driverContactNo={driverContactNo}
            driverImage={driverImage}
            snapToRoad={snapToRoad}
            onSnapToRoadChange={onSnapToRoadChange}
            isReplayActive={isReplayActive}
            vehicleNumber={
              (selectedVehicle && selectedVehicle.vehicleNumber) || searchValue
            }
          />
        ) : (
          !selectedVehicle &&
          (!isGroupSearchActive ? (
            <VehicleList
              selectedVehicleIds={selectedVehicleIds}
              onSelectionAllChange={onSelectionAllChange}
              vehicles={vehicles}
              searchValue={searchValue}
              order={props.order}
              handleRequestSort={props.handleRequestSort}
              onSelectedVehicleChange={handleSelectedVehicleChange}
              filter={filter}
              selectedLanguage={selectedLanguage}
              languageJson={languageJson}
              onSelectionChange={props.onSelectionChange}
            />
          ) : (
            <GroupTable
              groups={allGroups.filter((group) =>
                group.groupName
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              )}
              // order={'asc'}
              onSelectedGroupChange={handleSelectedGroupChange}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              rowsPerPage={rowsPerPage}
              selectedLanguage={selectedLanguage}
              languageJson={languageJson}
              setRowsPerPage={setRowsPerPage}
            />
          ))
        )}
      </Grid>
    </Grid>
  )
}

export default withLanguage(MapSideBar)
