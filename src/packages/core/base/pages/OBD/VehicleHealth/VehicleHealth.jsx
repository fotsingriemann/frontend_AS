import React from 'react'
import { Grid } from '@material-ui/core'
import OBDParameters from './OBDParameters'
import TroubleCodes from './TroubleCodes'
import Graphs from './Graphs'

export default function VehicleHealth({ vehicle }) {
  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <OBDParameters vehicle={vehicle} />
      </Grid>
      <Grid item xs={12}>
        <TroubleCodes vehicle={vehicle} />
      </Grid>
      <Grid item xs={12}>
        <Graphs vehicle={vehicle} />
      </Grid>
    </Grid>
  )
}
