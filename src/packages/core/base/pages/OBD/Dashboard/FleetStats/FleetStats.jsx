import React from 'react'
import { Grid, Paper, Typography } from '@material-ui/core'
import DoughnutChart from '@zeliot/common/ui/Charts/DoughnutChart'

function FleetStats({ stats: { good, moderate, critical } }) {
  return (
    <Grid container>
      <Grid item>
        <Paper style={{ padding: '16px' }}>
          <DoughnutChart
            data={[
              { id: 1, value: moderate, label: 'Moderate' },
              { id: 2, value: critical, label: 'Critical' },
              { id: 3, value: good, label: 'Good' }
            ]}
            unit="%"
          />

          <Typography variant="subtitle2" align="center">
            Fleet health distribution
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  )
}

export default FleetStats
