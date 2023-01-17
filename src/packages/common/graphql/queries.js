/**
 * @module graphql/queries
 * @summary Module containing common graphql queries used throughout the app
 */

import gql from 'graphql-tag'

/**
 * @summary Fetches all devices with their latest locations
 */
export const GET_ALL_DEVICES = gql`
  query getDevices {
    devices: getAllDeviceLocations {
      isNoGps
      isOffline
      speed
      uniqueId
      vehicleNumber
      vehicleType
      vehicleModel
      model_name
      timestamp
      latitude
      longitude
      haltStatus
      idlingStatus
      isOverspeed
      isPrimaryBattery
      extBatVol
      vehicleGroups
      address
    }
  }
`

/**
 * @summary Fetches count of all devices assigned to a client
 */
export const GET_ASSIGNED_DEVICES = gql`
  query($clientId: Int!) {
    getClientDeviceStock(clientLoginId: $clientId) {
      totalAssignedDevice
      totalRegisteredDevice
      totalUnRegisteredDevice
    }
  }
`

/**
 * @summary Get statuses of all devices
 */
export const GET_ALL_DEVICES_STATUS = gql`
  query getDevices {
    devices: getAllDeviceLocations {
      isNoGps
      uniqueId
      latitude
      longitude
      haltStatus
      idlingStatus
      timestamp
      isPrimaryBattery
    }
  }
`

/**
 * @summary Get all points of a vehicle between two timestamps
 */
export const TRAVEL_REPLAY_PACKETS = gql`
  query(
    $uniqueId: String!
    $from: String!
    $to: String!
    $snapToRoad: Boolean
  ) {
    getTravelHistory(
      uniqueId: $uniqueId
      from: $from
      to: $to
      snapToRoad: $snapToRoad
    ) {
      distanceTravelledKms
      points {
        ts
        lat
        lng
        speed
        isHA
        isHB
        address
      }
    }
  }
`

/**
 * @summary Get list of all available reports for a client with fields available for each report
 */
export const GET_REPORTS_LIST_WITH_FIELDS = gql`
  fragment Default on DefaultReportBuilder {
    category
    reportName
    reportType
    fields {
      fieldId
      fieldName
    }
  }

  fragment Custom on ReportBuilder {
    category
    reportName
    reportType
    fields {
      fieldId
      fieldName
    }
  }

  query($clientId: Int!) {
    defaultReports: getAllDefaultReportBuilder {
      ...Default
    }
    customReports: getAllReportBuilder(clientLoginId: $clientId) {
      ...Custom
    }
  }
`

/**
 * @summary Get all routes for a client
 */
export const GET_ALL_ROUTES = gql`
  query($clientLoginId: Int!) {
    getAllRoutes(clientLoginId: $clientLoginId) {
      id
      areaName
      createdAt
    }
  }
`

/**
 * @summary Delete a route by its ID
 */
export const DELETE_ROUTE = gql`
  mutation($id: Int!) {
    deleteUnusedRoute(routeId: $id)
  }
`

/**
 * @summary Get all fuel tank levels for a vehicle between 2 timestamps
 */
export const GET_OBD_FUEL_POINTS = gql`
  query($uniqueId: String!, $from: String!, $to: String!) {
    getObdDataPoints(uniqueId: $uniqueId, from: $from, to: $to) {
      tankLevel
    }
  }
`

/**
 * @summary Get detailed information about a route
 */
export const GET_ROUTE_INFO = gql`
  query($id: Int!) {
    getRoute(id: $id) {
      routeDetail
      placeCoordinates
      places
      areaTypeBuffer
      aoiFenceBuffer
      createdAt
    }
  }
`

/**
 * @summary Creates a new route
 */
export const ADD_ROUTE = gql`
  mutation(
    $areaTypeId: Int!
    $areaName: String!
    $clientLoginId: Int!
    $routeDetail: String!
    $places: String!
    $placeCoordinates: String!
    $areaTypeBuffer: String!
    $aoiFenceBuffer: String!
    $geoJson: String!
    $areaIds: [Int]!
  ) {
    addRoute(
      areaTypeId: $areaTypeId
      areaName: $areaName
      clientLoginId: $clientLoginId
      routeDetail: $routeDetail
      places: $places
      placeCoordinates: $placeCoordinates
      areaTypeBuffer: $areaTypeBuffer
      aoiFenceBuffer: $aoiFenceBuffer
      geoJson: $geoJson
      areaIds: $areaIds
    )
  }
`

/**
 * @summary Creates a new route for trips and returns all the values back
 */
export const ADD_ROUTE_FOR_TRIPS = gql`
  mutation(
    $areaTypeId: Int!
    $areaName: String!
    $clientLoginId: Int!
    $routeDetail: String!
    $places: String!
    $placeCoordinates: String!
    $areaTypeBuffer: String!
    $aoiFenceBuffer: String!
    $geoJson: String!
    $areaIds: [Int]!
  ) {
    addRouteForTrips(
      areaTypeId: $areaTypeId
      areaName: $areaName
      clientLoginId: $clientLoginId
      routeDetail: $routeDetail
      places: $places
      placeCoordinates: $placeCoordinates
      areaTypeBuffer: $areaTypeBuffer
      aoiFenceBuffer: $aoiFenceBuffer
      geoJson: $geoJson
      areaIds: $areaIds
    ) {
      id
      areaName
      createdAt
      routeDetail
    }
  }
`

/**
 * @summary Get all areas for a client
 */
export const GET_ALL_AREAS = gql`
  query($clientLoginId: Int!) {
    getAllAreaDetails(clientLoginId: $clientLoginId) {
      id
      areaName
      createdAt
    }
  }
`

/**
 * @summary Delete an AOI by ID
 */
export const DELETE_AOI = gql`
  mutation($id: Int!) {
    deleteUnusedAOI(id: $id)
  }
`

/**
 * @summary Get details about an AOI by ID
 */
export const GET_AREA_INFO = gql`
  query($id: Int!) {
    getAreaDetails(id: $id) {
      areaType {
        areaTypeName
      }
      geoJson
      geoPosition
      createdAt
    }
  }
`

/**
 * @summary Create a new area
 */
export const ADD_AREA = gql`
  mutation(
    $areaTypeId: Int!
    $areaName: String!
    $clientLoginId: Int!
    $geoJson: String!
    $geoPosition: String
  ) {
    addArea(
      areaTypeId: $areaTypeId
      areaName: $areaName
      clientLoginId: $clientLoginId
      geoJson: $geoJson
      geoPosition: $geoPosition
    ) {
      id
    }
  }
`

/**
 * @summary Create a new trip
 */
export const ADD_TRIP = gql`
  mutation(
    $geoJson: [GeoJsonInput!]
    $tripName: String!
    $clientLoginId: Int!
    $routeId: Int!
    $fromTimestamp: String!
    $scheduleFromTimestamp: String!
    $toTimestamp: String!
    $scheduleToTimestamp: String!
    $tolerance: Int!
    $sms: [String]
    $email: [String]
    $uniqueDeviceId: String!
    $schedule: Int!
    $tripType: TripType
    $typeOfTrip: String
  ) {
    addTrip(
      geoJson: $geoJson
      tripName: $tripName
      clientLoginId: $clientLoginId
      routeId: $routeId
      fromTimestamp: $fromTimestamp
      scheduleFromTimestamp: $scheduleFromTimestamp
      toTimestamp: $toTimestamp
      scheduleToTimestamp: $scheduleToTimestamp
      tolerance: $tolerance
      sms: $sms
      email: $email
      uniqueDeviceId: $uniqueDeviceId
      schedule: $schedule
      tripType: $tripType
      typeOfTrip: $typeOfTrip
    )
  }
`

/**
 * @summary Get all trips for a client
 */
export const GET_ALL_TRIPS = gql`
  query($clientLoginId: Int!, $status: Int, $uniqueDeviceId: String) {
    getAllTrips(
      clientLoginId: $clientLoginId
      status: $status
      uniqueDeviceId: $uniqueDeviceId
    ) {
      edges {
        node {
          tripId
          tripName
          scheduledSubTrip {
            fromTimestamp
          }
          status
          createdAt
        }
      }
    }
  }
`

/**
 * @summary Get details about a trip
 */
export const GET_TRIP_INFO = gql`
  query($tripId: Int!) {
    getTrip(tripId: $tripId) {
      tripId
      tripName
      route {
        routeDetail
        places
        placeCoordinates
        areaTypeBuffer
        aoiFenceBuffer
      }
      fromTimestamp
      toTimestamp
      scheduleFromTimestamp
      scheduleToTimestamp
      schedule
      tolerance
      tripNotifications {
        email
        sms
      }
      vehicle {
        vehicleNumber
        uniqueDeviceId
      }
      status
    }
  }
`

/**
 * @summary Delete a trip by ID
 */
export const DELETE_TRIP = gql`
  mutation($clientLoginId: Int!, $id: Int) {
    deleteScheduledTrips(clientLoginId: $clientLoginId, id: $id)
  }
`

/**
 * @summary Get all vehicles of a client
 */
export const GET_ALL_VEHICLES = gql`
  query($loginId: Int!) {
    vehicles: getAllVehicleDetails(clientLoginId: $loginId, status: [1, 3]) {
      entityId
      vehicleNumber
      vehicleType
      deviceDetail {
        uniqueDeviceId
      }
    }
  }
`

/**
 * @summary Get fleet usage data
 */
export const GET_FLEET_USAGE = gql`
  query($loginId: Int!, $period: String!) {
    getAggregatedCounts(clientLoginId: $loginId, period: $period) {
      distance
      run_time
      idling_time
      halt_time
      fuel_consumed
      dist_change
      run_time_change
      idling_time_change
      fuel_consumed_change
    }
  }
`

/**
 * @summary Get fleet performance data
 */
export const GET_FLEET_PERFORMANCE = gql`
  query($loginId: Int!, $period: String!) {
    getAggregatedCounts(clientLoginId: $loginId, period: $period) {
      run_time
      idling_time
      fleet_utilization
    }
  }
`

/**
 * @summary Get OBD data for a vehicle between a time range
 */
export const GET_OBD_DATA = gql`
  query(
    $clientLoginId: Int!
    $uniqueId: String!
    $startTs: String!
    $stopTs: String!
  ) {
    getOBDReport(
      clientLoginId: $clientLoginId
      uniqueId: $uniqueId
      start_ts: $startTs
      end_ts: $stopTs
    ) {
      uniqueid
      dateTime
      coolant
      engine
      milege
      engine_load
      engine_rpm
      vehicle_speed
      maf_air_flow
      distance_travelled
      vin
      intake_pressure
      throttle_pos
      runtime_p
      engine_oil_temp
      soc
    }
  }
`

/**
 * @summary Create a new driver
 */
export const ADD_DRIVER = gql`
  mutation(
    $driverName: String!
    $license: String!
    $contactNumber: String!
    $userLoginId: Int!
    $vehicleId: Int!
    $driverImage: String
    $otherDocument: String
  ) {
    addDriver(
      driverName: $driverName
      license: $license
      contactNumber: $contactNumber
      userLoginId: $userLoginId
      vehicleId: $vehicleId
      driverImage: $driverImage
      otherDocument: $otherDocument
    )
  }
`
