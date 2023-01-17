/**
 * @module Report/ReportTable
 * @summary This module exports the ReportTable component to render report data
 * as rows and columns
 */

import React, { Fragment } from 'react'
import gql from 'graphql-tag'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import getFormattedDuration from '@zeliot/common/utils/time/getFormattedDuration'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import Graphs from '../Graphs'
import {
  withStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Paper,
  Tooltip,
  Button,
  Grid,
  CircularProgress,
  Modal,
} from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

/**
 * Sorts data in the given order by comparing values of the given column
 * @param {'asc'|'desc'} order The order for sorting the data
 * @param {number} orderByColumnIndex The index of the column by which the data should be sorted
 */
function getSorting(order, orderByColumnIndex) {
  /* eslint-disable indent */
  return order === 'desc'
    ? (a, b) =>
        b[orderByColumnIndex] > a[orderByColumnIndex]
          ? 1
          : b[orderByColumnIndex] < a[orderByColumnIndex]
          ? -1
          : 0
    : (a, b) =>
        a[orderByColumnIndex] > b[orderByColumnIndex]
          ? 1
          : a[orderByColumnIndex] < b[orderByColumnIndex]
          ? -1
          : 0
  /* eslint-enable indent */
}

const GET_OVERSPEED_LOGS = gql`
  query($tripId: Int!) {
    getOverspeedInstancesByTripId(tripId: $tripId) {
      ts
      location
      speed
      speedLimit
    }
  }
`

/**
 * Renders the table header with column names & sorting buttons
 * @param {object} props React component props
 * @summary ReportTableHead component is the table header for the ReportTable component
 */
function ReportTableHead(props) {
  const createSortHandler = (columnIndex) => (event) => {
    props.onRequestSort(event, columnIndex)
  }

  const { order, orderBy, columns, classes } = props

  return (
    <TableHead>
      <TableRow>
        {columns.map((column, columnIndex) => (
          <TableCell
            size="small"
            key={column}
            sortDirection={orderBy === columnIndex ? order : false}
            className={classes.head}
          >
            <Tooltip title="Sort" enterDelay={300} disableFocusListener>
              <div style={{ textAlign: 'center' }}>
                <TableSortLabel
                  active={orderBy === columnIndex}
                  direction={order}
                  onClick={createSortHandler(columnIndex)}
                >
                  {column}
                </TableSortLabel>
              </div>
            </Tooltip>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

ReportTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.number.isRequired,
}

const styles = (theme) => ({
  root: {
    maxWidth: '100%',
    marginTop: theme.spacing(3),
    maxHeight: '80vh',
    overflow: 'auto',
  },
  rowLoaderButtonContainer: {
    padding: theme.spacing(3),
  },
  errorMsg: {
    padding: theme.spacing(2),
  },
  head: {
    backgroundColor: theme.palette.background.paper,
    position: 'sticky',
    top: 0,
    textAlign: 'center',
  },
})

/**
 * @summary ReportTable component renders the report data in a table with rows and columns
 */
class ReportTable extends React.Component {
  state = {
    order: 'asc',
    orderBy: 0,
    showOsModal: false,
    tripId: null,
  }

  /**
   * @callback
   * @summary Callback called to sort the table data based on a column
   */
  handleRequestSort = (event, columnIndex) => {
    const orderBy = columnIndex
    let order = 'desc'

    if (this.state.orderBy === columnIndex && this.state.order === 'desc') {
      order = 'asc'
    }

    this.setState({ order, orderBy })
  }

  /**
   * @callback
   * @summary Callback called on clicking a row in the Report data table
   */
  handleRowClick = (row) => {
    if (
      this.props.report.reportType &&
      JSON.parse(this.props.report.reportType)[0] === 'tripReport' &&
      !isNaN(parseInt(row[0], 10))
    ) {
      this.setState({ tripId: row[0], showOsModal: true })
    }
  }

  /**
   * @function
   * @param {string|object} data The individual data element in the report table cell
   * @param {number} columnIndex The index of the column
   */
  _processData = (data, columnIndex) => {
    if (data !== null && data !== undefined) {
      switch (this.props.columnTypes[columnIndex]) {
        case 'dateOnly':
          return getFormattedTime(data, 'll')
        case 'datetime':
          return getFormattedTime(data, 'Do MMM YYYY, h:mm:ss A')
        case 'Object':
          return (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://www.google.com/maps/?q=${data.value}`}
            >
              {data.label}
            </a>
          )
        case 'LatLng':
          return (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://www.google.com/maps/?q=${data}`}
            >
              {data}
            </a>
          )
        case 'seconds':
          return getFormattedDuration(data)

        case 'kmph':
          if (data >= 0) return `${data} km/h`
          else return 'N/A'
        case 'km':
          if (data >= 0) return `${data} km`
          else return 'N/A'
        default:
          if (data.toString() === '-99999' || data.toString() === 'None') {
            return 'N/A'
          }
          return data
      }
    } else {
      return 'N/A'
    }
  }

  render() {
    const { classes, data, columns, vehicleNumber, uniqueId } = this.props
    const { order, orderBy } = this.state

    return (
      <Fragment>
        <Modal
          open={this.state.showOsModal}
          onClose={() => this.setState({ showOsModal: false })}
        >
          <Paper
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              padding: 32,
              maxHeight: 600,
              overflowY: 'auto',
            }}
          >
            <Typography variant="h5">Overspeed log</Typography>

            <Query
              query={GET_OVERSPEED_LOGS}
              variables={{ tripId: this.state.tripId }}
            >
              {({ data, loading, error }) => {
                if (loading) return 'Loading...'

                if (error) return 'Error fetching overspeed log'

                return (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Speed</TableCell>
                        <TableCell>Speed Limit</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {data.getOverspeedInstancesByTripId.map((row) => (
                        <TableRow>
                          <TableCell>
                            {getFormattedTime(row.ts, 'lll')}
                          </TableCell>
                          <TableCell>
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              href={`https://www.google.com/maps/?q=${row.location}`}
                            >
                              {row.location}
                            </a>
                          </TableCell>
                          <TableCell>{row.speed}</TableCell>
                          <TableCell>{row.speedLimit}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )
              }}
            </Query>
          </Paper>
        </Modal>

        <Paper className={classes.root}>
          <Table aria-labelledby="tableTitle">
            <ReportTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={this.handleRequestSort}
              columns={columns}
              classes={classes}
            />

            <TableBody>
              {data.sort(getSorting(order, orderBy)).map((row, rowIndex) => (
                <TableRow
                  hover
                  tabIndex={-1}
                  key={rowIndex}
                  // onClick={() => this.handleRowClick(row)}
                >
                  {row.map((rowColumn, columnIndex) => (
                    <TableCell
                      align="center"
                      key={`${rowIndex}-${columnIndex}`}
                      padding="default"
                      style={{ verticalAlign: 'top' }}
                    >
                      {this._processData(rowColumn, columnIndex)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {this.props.loadMore && (
            <Grid
              container
              justify="center"
              className={classes.rowLoaderButtonContainer}
            >
              {this.props.isMoreRowsLoading ? (
                <CircularProgress />
              ) : (
                <ColorButton
                  variant="contained"
                  onClick={this.props.onClickLoadMore}
                >
                  Load More
                </ColorButton>
              )}
            </Grid>
          )}

          {this.props.error && (
            <Grid container justify="center" className={classes.errorMsg}>
              {this.props.error}
            </Grid>
          )}
        </Paper>
      </Fragment>
    )
  }
}

ReportTable.propTypes = {
  classes: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  columnTypes: PropTypes.array.isRequired,
  loadMore: PropTypes.bool.isRequired,
  onClickLoadMore: PropTypes.func.isRequired,
  isMoreRowsLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
}

export default withStyles(styles)(ReportTable)
