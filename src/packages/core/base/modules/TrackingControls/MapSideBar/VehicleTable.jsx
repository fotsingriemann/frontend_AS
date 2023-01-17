import React from 'react'
import classNames from 'classnames'
import {
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  TablePagination,
  TableSortLabel,
  Typography,
  makeStyles,
  Tooltip
} from '@material-ui/core'
import getDuration from '@zeliot/common/utils/time/getDuration'
import getFromNow from '@zeliot/common/utils/time/getFromNow'

const useStyles = makeStyles({
  customFooter: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center'
  },
  clickableTableRow: {
    cursor: 'pointer'
  },
  cellRoot: {
    width: '33%'
  },
  clipCell: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  tableRoot: {
    tableLayout: 'fixed'
  },
  paginationItem: {
    margin: 0,
    padding: 0
  }
})

function VehicleTable(props) {
  const classes = useStyles()

  const {
    vehicles,
    onSelectedVehicleChange,
    filter,
    order,
    handleRequestSort,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage
  } = props

  const count = vehicles.length

  React.useEffect(() => {
    if (currentPage > parseInt(count / rowsPerPage, 10)) {
      setCurrentPage(parseInt(count / rowsPerPage, 10))
    }
  })

  return (
    <React.Fragment>
      <Table className={classes.tableRoot} stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell className={classes.cellRoot} size="small">
              Vehicle Number
            </TableCell>

            <TableCell
              sortDirection={order}
              align="center"
              className={classes.cellRoot}
              size="small"
            >
              <TableSortLabel
                active={true}
                direction={order}
                onClick={handleRequestSort}
              >
                {/* eslint-disable indent  */}
                {filter === 'ONLINE' ||
                filter === 'NOGPS' ||
                filter === 'RUNNING' ||
                filter === 'ALL'
                  ? 'Last Tracked'
                  : filter === 'IDLE'
                  ? 'Idle since'
                  : filter === 'OFFLINE'
                  ? 'Offline since'
                  : filter === 'HALT'
                  ? 'Halted since'
                  : 'Last Tracked'}
                {/* eslint-enable indent  */}
              </TableSortLabel>
            </TableCell>

            <TableCell align="center" className={classes.cellRoot} size="small">
              Group
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {vehicles
            .slice(
              currentPage * rowsPerPage,
              currentPage * rowsPerPage + rowsPerPage
            )
            .map(vehicle => (
              <TableRow
                hover
                className={classes.clickableTableRow}
                key={vehicle.vehicleNumber}
                onClick={() => {
                  if (vehicle.timestamp !== null) {
                    onSelectedVehicleChange(vehicle)
                  }
                }}
              >
                <Tooltip
                  title={vehicle.vehicleNumber ? vehicle.vehicleNumber : ''}
                >
                  <TableCell
                    className={classNames(classes.cellRoot, classes.clipCell)}
                  >
                    <Typography
                      variant="body2"
                      classes={{
                        root: classes.cellRoot
                      }}
                    >
                      {vehicle.vehicleNumber}
                    </Typography>
                  </TableCell>
                </Tooltip>

                <TableCell align="center" className={classes.cellRoot}>
                  {/* eslint-disable new-cap, indent */
                  filter === 'ONLINE' ||
                  filter === 'NOGPS' ||
                  filter === 'RUNNING'
                    ? getFromNow(vehicle.timestamp)
                    : vehicle.timestamp === null
                    ? 'No Data'
                    : getDuration(vehicle.timestamp)
                  /* eslint-enable new-cap, indent */
                  }
                </TableCell>

                <Tooltip
                  title={
                    vehicle.vehicleGroups.length > 0
                      ? vehicle.vehicleGroups.join(', ')
                      : 'No groups assigned'
                  }
                  disableHoverListener={!vehicle.vehicleGroups}
                >
                  <TableCell
                    align="center"
                    className={classNames(classes.cellRoot, classes.clipCell)}
                  >
                    {vehicle.vehicleGroups.length > 0
                      ? vehicle.vehicleGroups.join(', ')
                      : 'No Groups'}
                  </TableCell>
                </Tooltip>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <div className={classes.customFooter}>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 100, 200, 300, 400, 500]}
          component="div"
          page={currentPage}
          count={count}
          onChangeRowsPerPage={e => setRowsPerPage(e.target.value)}
          onChangePage={(e, page) => setCurrentPage(page)}
          backIconButtonProps={{
            'aria-label': 'Previous Page'
          }}
          rowsPerPage={rowsPerPage}
          nextIconButtonProps={{
            'aria-label': 'Next Page'
          }}
          classes={{
            toolbar: classes.paginationItem,
            caption: classes.paginationItem,
            input: classes.paginationItem,
            actions: classes.paginationItem
          }}
        />
      </div>
    </React.Fragment>
  )
}

export default VehicleTable
