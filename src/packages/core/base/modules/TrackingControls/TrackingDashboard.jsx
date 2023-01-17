import React from 'react'
import { Switch } from 'react-router-dom'
import { PrivateRoute } from '@zeliot/common/router'
import CurrentTrackinfo from './CurrentTrackinfo'
import CurrentSummary from './CurrentSummary'
import VehicleTracker from './VehicleTracker'

function TrackingDashboardRouter() {
  return (
    <Switch>
      <PrivateRoute
        exact
        path="/home/dashboard"
        render={props => <VehicleTracker {...props} />}
      />
      <PrivateRoute
        exact
        path="/home/dashboard1"
        render={props => <VehicleTracker {...props} />}
      />
      <PrivateRoute
        exact
        path="/home/dashboard/current-trackinfo"
        render={props => <CurrentTrackinfo {...props} />}
      />
      <PrivateRoute
        exact
        path="/home/dashboard/current-summary"
        render={props => <CurrentSummary {...props} />}
      />
    </Switch>
  )
}

export default TrackingDashboardRouter
