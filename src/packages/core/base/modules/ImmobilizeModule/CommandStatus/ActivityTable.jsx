/**
 * @module ImmobilizeModule/CommandStatus/ActivityTable
 * @summary This module exports the ActivityTable component
 */

import React from 'react'
import PropTypes from 'prop-types'
import {
  withStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from '@material-ui/core'
import getFromNow from '@zeliot/common/utils/time/getFromNow'

const styles = (theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
})

/**
 * Activity Table displays a table of recent Immobilization commands status
 * @param {object} props React component props
 * @summary A simple table that displays recent Immobilization status
 */
function ActivityTable(props) {
  const { classes, rows, columns } = props

  return (
    <Paper className={classes.root}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            {columns.map((column, index) => {
              return <TableCell key={index}>{column}</TableCell>
            })}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row, index) => {
            return (
              <TableRow key={row.id}>
                <TableCell component="th" scope="row">
                  {index + 1}
                </TableCell>
                <TableCell>{row.vehicleNumber}</TableCell>
                <TableCell>{row.command_display}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{getFromNow(row.modified_ts)}</TableCell>
                <TableCell>{row.username}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Paper>
  )
}

ActivityTable.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(ActivityTable)
