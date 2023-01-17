import React from 'react'
import { Grid } from '@material-ui/core'

import FleetAnalytics from './Modules/FleetAnalytics'
// import TripAnalytics from './Modules/TripAnalytics'
// import DiagnosticAnalytics from './Modules/DiagnosticAnalytics'

function AnalyticsCards({ analyticsPeriod }) {
  return (
    <Grid container>
      <FleetAnalytics analyticsPeriod={analyticsPeriod} />

      {/* <TripAnalytics analyticsPeriod={analyticsPeriod} />

      <DiagnosticAnalytics analyticsPeriod={analyticsPeriod} /> */}
    </Grid>
  )
}

export default AnalyticsCards
