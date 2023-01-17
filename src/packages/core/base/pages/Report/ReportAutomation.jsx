/**
 * @module Report/ReportAutomation
 * @summary This module exports the Report automation settings
 */

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@material-ui/core'

/**
 * @summary Renders a Table showing the report automation settings
 */
function ReportAutomation() {
  return (
    <div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>REPORT NAME</TableCell>
            <TableCell>REPORT DESCRIPTION</TableCell>
            <TableCell>FREQUENCY</TableCell>
            <TableCell>NO OF VEHICLES</TableCell>
            <TableCell>EMAIL(S)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* eslint-disable jsx-a11y/anchor-is-valid */}
          <TableRow>
            <TableCell scope="row">Overspeed Report</TableCell>
            <TableCell>This is a short report description.</TableCell>
            <TableCell>
              Daily
              <br />
              9:00 AM
            </TableCell>
            <TableCell>25</TableCell>
            <TableCell>
              <a href="#">Edit</a> | <a href="#">Delete</a>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell scope="row">Fall Report</TableCell>
            <TableCell>This is a short report description.</TableCell>
            <TableCell>
              Weekly
              <br />
              10:00 AM
            </TableCell>
            <TableCell>74</TableCell>
            <TableCell>
              <a href="">Edit</a> | <a href="">Delete</a>
            </TableCell>
          </TableRow>
          {/* eslint-enable jsx-a11y/anchor-is-valid */}
        </TableBody>
      </Table>
    </div>
  )
}

export default ReportAutomation
