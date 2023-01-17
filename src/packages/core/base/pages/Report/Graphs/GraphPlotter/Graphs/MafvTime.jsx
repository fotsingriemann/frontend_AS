import React from 'react'
import { Typography, Divider, withStyles, Grid, Paper } from '@material-ui/core'
import LineSeriesChart from '@zeliot/common/ui/Charts/LineSeriesChart/LineSeriesChart'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
// import Badge from '../../../../common/Badge'

const styles = theme => ({
  graphContainer: {
    padding: theme.spacing(2)
  }
})

export default withStyles(styles)(({ data, classes }) => {
  const filteredData = data
    .filter(({ ts, maf }) => ts !== -99999 && maf !== -99999)
    .map(({ ts, maf }) => ({
      x: getFormattedTime(ts, 'llll'),
      y: maf
    }))

  if (filteredData.length === 0) return null

  return (
    <Grid item xs={12} md={6}>
      <Paper className={classes.graphContainer}>
        <Grid container>
          {/* <Grid item xs={12}>
            <Grid container justify="center" alignItems="center">
              <Grid item>
                <Badge color="black" background="#5eff23">
                  GOOD
                </Badge>
              </Grid>
            </Grid>
          </Grid> */}
          <Grid item xs={12}>
            <LineSeriesChart data={filteredData} xLabel="Time" yLabel="MAF" />
          </Grid>
          <Grid item xs={12}>
            <div>
              <Typography variant="button" gutterBottom>
                Mass Air Flow (grams/sec) Vs Time
              </Typography>
              <Divider />
              <Typography>
                A MAF value of less than 5 indicates the engine idling. Between
                5 and 100 is the expected MAF when the vehicle is running. A
                value above 100 might indicate open throttle.
              </Typography>
            </div>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  )
})
