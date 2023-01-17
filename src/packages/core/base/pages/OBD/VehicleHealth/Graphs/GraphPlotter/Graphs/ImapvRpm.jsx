import React from 'react'
import ScatterPlot from '@zeliot/common/ui/Charts/ScatterPlot'
import { Typography, Divider, withStyles, Grid, Paper } from '@material-ui/core'
// import Badge from '../../../../common/Badge'

const styles = theme => ({
  graphContainer: {
    padding: theme.spacing(2)
  }
})

export default withStyles(styles)(({ data, classes }) => {
  const filteredData = data
    .filter(({ imap, rpm }) => imap !== -99999 && rpm !== -99999)
    .map(({ imap, rpm }) => ({
      x: rpm,
      y: imap
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
            <ScatterPlot
              data={filteredData}
              xLabel="Engine RPM"
              yLabel="IMAP"
              xUnit="rpm"
              yUnit=" Pa"
              scatterSplit={false}
              color1="#25f97a"
            />
          </Grid>
          <Grid item xs={12}>
            <div>
              <Typography variant="button" gutterBottom>
                Intake Manifold Absolute Pressure (kPA) Vs Engine RPM
              </Typography>
              <Divider />
              <Typography>
                Think of the engine as an air pump. The faster it rotates, the
                more air it can remove from the inlet manifold, reducing the
                MAP. If the engine slows down, air can get in quicker than it
                gets sucked out, causing the MAP to increase.
              </Typography>
            </div>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  )
})
