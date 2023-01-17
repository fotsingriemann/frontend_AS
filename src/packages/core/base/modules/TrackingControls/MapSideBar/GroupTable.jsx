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
  Tooltip,
} from '@material-ui/core'
import getDuration from '@zeliot/common/utils/time/getDuration'
import getFromNow from '@zeliot/common/utils/time/getFromNow'

const useStyles = makeStyles({
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
  cellRoot: {
    width: '33%',
  },
  clipCell: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tableRoot: {
    tableLayout: 'fixed',
  },
  paginationItem: {
    margin: 0,
    padding: 0,
  },
})

function GroupTable(props) {
  const classes = useStyles()

  const {
    groups,
    onSelectedGroupChange,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
    languageJson,
    selectedLanguage,
  } = props

  const count = groups.length

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
              {languageJson[selectedLanguage].mainDashboardPage.groupName}
            </TableCell>

            {/* <TableCell
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
                
              </TableSortLabel>
            </TableCell> */}

            <TableCell align="center" className={classes.cellRoot} size="small">
              {languageJson[selectedLanguage].mainDashboardPage.vehicleAssigned}
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {groups
            .slice(
              currentPage * rowsPerPage,
              currentPage * rowsPerPage + rowsPerPage
            )
            .map((group) => (
              <TableRow
                hover
                className={classes.clickableTableRow}
                key={group.groupName}
                onClick={() => {
                  // if (vehicle.timestamp !== null) {
                  onSelectedGroupChange(group)
                  // }
                }}
              >
                <Tooltip title={group.groupName ? group.groupName : ''}>
                  <TableCell
                    className={classNames(classes.cellRoot, classes.clipCell)}
                  >
                    <Typography
                      variant="body2"
                      classes={{
                        root: classes.cellRoot,
                      }}
                    >
                      {group.groupName}
                    </Typography>
                  </TableCell>
                </Tooltip>

                {/* <TableCell align="center" className={classes.cellRoot}>
                  
                  filter === 'ONLINE' ||
                  filter === 'NOGPS' ||
                  filter === 'RUNNING'
                    ? getFromNow(vehicle.timestamp)
                    : vehicle.timestamp === null
                    ? 'No Data'
                    : getDuration(vehicle.timestamp)
                  
                  }
                </TableCell> */}

                <Tooltip
                  title={
                    group.assignedVehicles.length > 0
                      ? group.assignedVehicles
                          .map((v) => v.vehicleNumber)
                          .join(', ')
                      : 'No vehicles assigned'
                  }
                  disableHoverListener={!group.assignedVehicles}
                >
                  <TableCell
                    align="center"
                    className={classNames(classes.cellRoot, classes.clipCell)}
                  >
                    {group.assignedVehicles.length > 0
                      ? group.assignedVehicles
                          .map((v) => v.vehicleNumber)
                          .join(', ')
                      : 'No vehicles assigned'}
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
          onChangeRowsPerPage={(e) => setRowsPerPage(e.target.value)}
          onChangePage={(e, page) => setCurrentPage(page)}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
          }}
          rowsPerPage={rowsPerPage}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
          }}
          classes={{
            toolbar: classes.paginationItem,
            caption: classes.paginationItem,
            input: classes.paginationItem,
            actions: classes.paginationItem,
          }}
        />
      </div>
    </React.Fragment>
  )
}

export default GroupTable
