import React from 'react'
import ScatterPlot from '@zeliot/common/ui/Charts/ScatterPlot'
import { Typography, Divider, withStyles, Grid, Paper } from '@material-ui/core'
import { EXTENDED_DISCRETE_COLOR_RANGE as COLOR_RANGE } from '@zeliot/common/constants/styles'
// import Badge from '../../../../common/Badge'

const styles = theme => ({
  graphContainer: {
    padding: theme.spacing(2)
  }
})

export default withStyles(styles)(({ data, classes }) => {
  const filteredData = data
    .filter(
      ({ engineload, coolant }) => engineload !== -99999 && coolant !== -99999
    )
    .map(({ engineload, coolant }) => ({
      x: engineload,
      y: coolant
    }))

  if (filteredData.length === 0) return null

  return (
    <Grid item xs={12} md={6}>
      <Paper className={classes.graphContainer}>
        <Grid container>
          {/* <Grid item xs={12}>
            <Grid container justify="center" alignItems="center">
              <Grid item>
                <Badge color="white" background="#fc2a2a">
                  CRITICAL
                </Badge>
              </Grid>
            </Grid>
          </Grid> */}
          <Grid item xs={12}>
            <ScatterPlot
              data={filteredData}
              xLabel="Engine Load"
              yLabel="Coolant Temperature"
              xUnit="%"
              yUnit=" C"
              scatterSplit={true}
              color1="#25f97a"
              color2="#ea8912"
            />
          </Grid>
          <Grid item xs={12}>
            <div>
              <Typography variant="button" gutterBottom>
                Coolant temperature (degree Celcius) Vs Engine load (%)
              </Typography>
              <Divider />
              <Typography>
                <span style={{ color: COLOR_RANGE.green }}>
                  <strong>Ideal Range (75 to 90)</strong>
                </span>
                {' | '}
                <span style={{ color: COLOR_RANGE.orange }}>
                  <strong>Non Ideal Range </strong>
                </span>
                <br />
                This graph shows the health of vehicle's Engine Coolant. The
                occurence of more points outside the ideal range may signify
                that a coolant change might be required.
              </Typography>
            </div>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  )
})
