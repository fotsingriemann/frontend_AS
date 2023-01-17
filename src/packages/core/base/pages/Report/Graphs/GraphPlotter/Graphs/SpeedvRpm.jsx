import React from 'react'
import { Typography, Divider, Grid, Paper, withStyles } from '@material-ui/core'
import ScatterPlot from '@zeliot/common/ui/Charts/ScatterPlot'
// import Badge from '../../../../common/Badge'

const styles = theme => ({
  graphContainer: {
    padding: theme.spacing(2)
  }
})

export default withStyles(styles)(({ data, classes }) => {
  const filteredData = data
    .filter(
      ({ vehiclespeed, rpm }) => rpm !== -99999 && vehiclespeed !== -99999
    )
    .map(({ vehiclespeed, rpm }) => ({
      x: vehiclespeed,
      y: rpm
    }))

  if (filteredData.length === 0) return null

  return (
    <Grid item xs={12} md={6}>
      <Paper className={classes.graphContainer}>
        <Grid container>
          {/* <Grid item xs={12}>
            <Grid container justify="center" alignItems="center">
              <Grid item>
                <Badge color="black" background="#f9d02a">
                  MODERATE
                </Badge>
              </Grid>
            </Grid>
          </Grid> */}
          <Grid item xs={12}>
            <ScatterPlot
              data={filteredData}
              xLabel="Vehicle Speed"
              yLabel="Engine RPM"
              xUnit=" kmph"
              yUnit=" rpm"
              scatterSplit={false}
              color1="#aae874"
            />
          </Grid>
          <Grid item xs={12}>
            <div>
              <Typography variant="button" gutterBottom>
                Vehicle Speed(kmph) Vs Engine RPM
              </Typography>
              <Divider />
              <Typography>
                In this graph, you can see up to 6 clusters which show the gear
                of the vehicle when driven. The lower clusters mark lower gears.
                The number of points in cluster give an estimate of time the
                vehicle was driven in that gear.
              </Typography>
            </div>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  )
})
