/**
 * Trips list component
 * @module TripList
 */

import React, { Component, Fragment } from 'react'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import SearchIcon from '@material-ui/icons/Search'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'
import ComboBox from '@zeliot/common/ui/ComboBox'
import {
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  Typography,
  Input,
  InputAdornment,
  withStyles,
  IconButton,
} from '@material-ui/core'
import { debounce } from 'throttle-debounce'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

const styles = (theme) => ({
  customFooter: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clickableTableRow: {
    cursor: 'pointer',
  },
  button: {
    margin: theme.spacing(1),
  },
  paper: {
    position: 'absolute',
    width: theme.spacing(50),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
  },
  buttonContainer: {
    marginTop: 15,
  },
})

/**
 * @summary Rows of table to be rendered per page
 */
const ROWS_PER_PAGE = 5

/**
 * @function getStatus
 * @param {number} status Status id of trip
 * @return {string} Readable status for status id
 * @summary Converts status id into readable status of trip
 */
function getStatus(status) {
  switch (status) {
    case 1:
      return 'Active'
    case 2:
      return 'Paused'
    case 3:
      return 'Deleted'
    case 4:
      return 'Inprogress'
    case 5:
      return 'Completed'
    default:
      return 'Active'
  }
}

class TripList extends Component {
  /**
   * @property {number} currentPage Active page of the table
   * @property {string} searchValue Search value based on which the table contents are filtered
   */
  state = {
    searchValue: ' ',
    radioButton: 'TRIP_NAME',
    searchedTripList: [],
  }

  handleSearchDebounce = debounce(300, this.props.handleDataOnSearch)

  /**
   * @function componentDidUpdate
   * @summary React lifecycle method
   */
  componentDidUpdate = (prevProps) => {
    if (this.props.selectedTripType !== prevProps.selectedTripType) {
      // this.setState({ currentPage: 0 })
      this.props.handleCurrentPage(0)
    }
  }

  /**
   * @function handlePageChange
   * @param {number} pageNumber Changed page number
   * @summary Set page number when page change is requested
   */
  handlePageChange = (pageNumber, cursor, isLoadData) => {
    const { trips, handleDataOnPageChange, handleCurrentPage } = this.props
    const { edges: tripList } = trips
    const count = tripList.length
    const endPage = Math.ceil(count / ROWS_PER_PAGE) - 2

    if (isLoadData) {
      if (endPage == pageNumber) {
        handleDataOnPageChange(cursor)
        handleCurrentPage(pageNumber)
      } else {
        handleCurrentPage(pageNumber)
      }
    } else {
      handleCurrentPage(pageNumber)
    }
  }

  /**
   * @function onSelectedTrip
   * @param {object} trip Selected trip
   * @summary Stores selected trip state on selection
   */
  onSelectedTrip = (trip) => {
    this.props.onSelectedTripChange(trip)
  }

  /**
   * @function   handleRadioChange
   * @param {object} e radio button change event
   * @summary Capture button value change in state
   */

  handleRadioChange = (e) => {
    const { value } = e.target
    // console.log('button changed', value)
    this.setState({
      radioButton: value,
      searchValue: '',
    })
  }

  /**
   * @function handleSearchValueChange
   * @param {object} e Search box text change event
   * @summary Capture seach value change in state
   */

  handleSearchValueChange = (searchKeyword) => {
    // console.log('search value', searchKeyword.length)
    const { radioButton: searchByCategory } = this.state
    if (searchKeyword.length >= 3) {
      this.handleSearchDebounce(searchKeyword, searchByCategory)
    }
  }

  getSearchedTripList = (searchedTrips) => {
    if (searchedTrips != null) {
      const { edges } = searchedTrips
      const searchedTripList = edges.reduce((acc, item) => {
        const { node } = item
        acc = [...acc, node]
        return acc
      }, [])
      return searchedTripList
    }
  }

  render() {
    const { classes, trips, searchedTrips, selectedLanguage } = this.props
    const { currentPage } = this.props
    const { edges: tripList, pageInfo } = trips
    const count = tripList.length
    const from = count === 0 ? 0 : currentPage * ROWS_PER_PAGE + 1
    const to = Math.min(count, (currentPage + 1) * ROWS_PER_PAGE)

    const filteredTrips = tripList.slice(
      currentPage * ROWS_PER_PAGE,
      currentPage * ROWS_PER_PAGE + ROWS_PER_PAGE
    )

    const searchedTripsList = this.getSearchedTripList(searchedTrips)
    // console.log(searchedTripsList)
    return (
      <Fragment>
        {/* <FormControl>
          <FormLabel> Search By</FormLabel>
          <RadioGroup
            value={this.state.radioButton}
            onChange={this.handleRadioChange}
            row
          >
            <FormControlLabel
              value="TRIP_NAME"
              control={<Radio color="primary" />}
              label="Trip Name"
              labelPlacement="end"
            />
            <FormControlLabel
              value="TRIP_NUMBER"
              control={<Radio color="primary" />}
              label="Trip Number"
              labelPlacement="end"
            />
          </RadioGroup>
        </FormControl> */}
        <ComboBox
          items={searchedTripsList || []}
          selectedItem={this.state.selectedVehicle}
          onSelectedItemChange={this.onSelectedTrip}
          onSearchValueChange={this.handleSearchValueChange}
          placeholder={languageJson[selectedLanguage].tripsPage.searchTrips}
          isLoading={false}
          itemKey="tripId"
          itemToStringKey="tripName"
          filterSize={50}
        />
        <Table padding="default">
          <TableHead>
            <TableRow>
              <TableCell size="small">
                {
                  languageJson[selectedLanguage].tripsPage.tripDetails
                    .tripNameLabel
                }
              </TableCell>
              {/* <TableCell size="small">Trip Id</TableCell> */}
              <TableCell size="small">
                {
                  languageJson[selectedLanguage].tripsPage.tripDetails
                    .statusLabel
                }
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTrips.map((item) => {
              const { node: trip, cursor } = item
              return (
                <TableRow
                  hover
                  className={classes.clickableTableRow}
                  key={trip.tripId}
                  onClick={() => {
                    this.onSelectedTrip(trip)
                  }}
                >
                  <TableCell size="small">{trip.tripName}</TableCell>
                  {/* <TableCell size="small">{trip.tripId}</TableCell> */}
                  <TableCell size="small">{getStatus(trip.status)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <div className={classes.customFooter}>
          <IconButton
            onClick={() => {
              this.handlePageChange(currentPage - 1, null, false)
            }}
            disabled={currentPage === 0}
          >
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="caption">{`${from} - ${to} of ${count}`}</Typography>
          <IconButton
            onClick={() => {
              this.handlePageChange(currentPage + 1, pageInfo.endCursor, true)
            }}
            disabled={currentPage >= Math.ceil(count / ROWS_PER_PAGE) - 1}
          >
            <ChevronRightIcon />
          </IconButton>
        </div>
      </Fragment>
    )
  }
}

export default withLanguage(withStyles(styles)(TripList))
