/**
 * @module graphql/subscriptions
 * @summary Module containing common graphql subscriptions
 */

import gql from 'graphql-tag'

/**
 * @summary Subscription used to get live location data for a vehicle
 */
export const DEVICE_LOCATION = gql`
  subscription liveTrackingData($deviceId: String!, $snapToRoad: Boolean!) {
    deviceLiveTracking(deviceId: $deviceId, snapToRoad: $snapToRoad) {
      timestamp
      latitude
      longitude
      haltStatus
      idlingStatus
      isOverspeed
      speed
      extBatVol
      isPrimaryBattery
      isNoGps
      address
    }
  }
`

/**
 * @summary Subscription used to get live alerts for a client
 */
export const LIVE_ALERTS = gql`
  subscription($loginId: Int!) {
    allAlertsForClient(clientId: $loginId) {
      vehicleNumber
      alerttype
      alertvalue
      from_ts
      to_ts
      lat
      lng
      driverName
      contactNumber
    }
  }
`
