/**
 * @module Report/ReportCard
 */

import React from 'react'
import { Card, CardContent, Grid, Typography } from '@material-ui/core'
import getFormattedDuration from '@zeliot/common/utils/time/getFormattedDuration'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'

/**
 * @function
 * @param {object|string|number} data The data element of the report data
 * @param {string} columnType The type of data in the column
 */
const processData = (data, columnType) => {
  if (data !== null && data !== undefined) {
    switch (columnType) {
      case 'dateOnly':
        return getFormattedTime(data, 'll')
      case 'datetime':
        return getFormattedTime(data, 'Do MMM YYYY, h:mm:ss A')
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
        return `${data} km/h`
      case 'km':
        return `${data} km`
      default:
        if (data.toString() === '-99999' || data.toString === 'None') {
          return 'N/A'
        }
        return data
    }
  } else {
    return 'N/A'
  }
}

/**
 * Renders the report data in a card with key-value style, heading-value
 * @param {object} props React component props
 * @summary ReportCard component renders report data(single row) in a car
 */
function ReportCard(props) {
  const { data, columns, columnTypes, reportName } = props

  // const {reportName} = props
  return data.length ? (
    <Card>
      <CardContent>
        <Grid container>
          {columns.map((column, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Typography variant="body1" color="textSecondary">
                {column}
              </Typography>

              <Typography variant="body2" gutterBottom>
                {processData(data[0][index], columnTypes[index])}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  ) : (
    <Card>
      <CardContent>
        <Grid container>
          {columns.map((column, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Typography variant="body1" color="textSecondary">
                {column}
              </Typography>

              <Typography variant="body2" gutterBottom>
                -
              </Typography>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ReportCard
