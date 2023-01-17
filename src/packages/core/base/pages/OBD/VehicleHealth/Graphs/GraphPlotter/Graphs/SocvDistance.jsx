import React from 'react'
import { Typography, Divider, withStyles, Grid, Paper } from '@material-ui/core'
import DualLineChart from '../../../../common/DualLineChart'

const styles = theme => ({
  graphContainer: {
    padding: theme.spacing(2)
  }
})

function SocvDistance({ data, classes }) {
  /* eslint-disable camelcase */

  const filteredData = data
    .filter(
      ({ obddistance, state_of_charge }) =>
        obddistance !== -99999 && state_of_charge !== -99999
    )
    .map(({ obddistance, state_of_charge, ts }) => ({
      Time: ts,
      Distance: parseInt(obddistance / 1000, 10),
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
              y2Label="Distance"
              y1Unit="%"
              y2Unit=" km"
              y1Color="#e5e100"
              y2Color="#24c600"
              xKey="Time"
              y1Key="Charge"
              y2Key="Distance"
            />
          </Grid>

          <Grid item xs={12}>
            <div>
              <Typography variant="button" gutterBottom>
                State of Charge(%) Vs Distance
              </Typography>
              <Divider />
              <Typography>
                This graph shows the variation of State of Charge and Vehicle
                distance over time
              </Typography>
            </div>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  )
}

export default withStyles(styles)(SocvDistance)
