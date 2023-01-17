import React from 'react'
import { Typography, Divider, withStyles, Grid, Paper } from '@material-ui/core'
import DualLineChart from '../../../../common/DualLineChart'

const styles = theme => ({
  graphContainer: {
    padding: theme.spacing(2)
  }
})

function SocvSpeed({ data, classes }) {
  /* eslint-disable camelcase */

  const filteredData = data
    .filter(
      ({ state_of_charge, vehiclespeed }) =>
        state_of_charge !== -99999 && vehiclespeed !== -99999
    )
    .map(({ state_of_charge, vehiclespeed, ts }) => ({
      Time: ts,
      Speed: vehiclespeed,
      Charge: state_of_charge
    }))

  /* eslint-enable camelcase */

  if (filteredData.length === 0) return null

  return (
    <Grid item xs={12} md={12}>
      <Paper className={classes.graphContainer}>
        <Grid container>
          <Grid item xs={12}>
            <DualLineChart
              data={filteredData}
              xLabel="Time"
              y1Label="State of Charge"
              y2Label="Speed"
              y1Unit="%"
              y2Unit=" km/h"
              y1Color="#e5e100"
              y2Color="#00afe5"
              xKey="Time"
              y1Key="Charge"
              y2Key="Speed"
            />
          </Grid>

          <Grid item xs={12}>
            <div>
              <Typography variant="button" gutterBottom>
                State of Charge Vs Speed
              </Typography>
              <Divider />
              <Typography>
                This graph shows the change in vehicle's speed and state of
                charge over time
              </Typography>
            </div>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  )
}

export default withStyles(styles)(SocvSpeed)
