/**
 * This module re-exports all pages of the app as lazy loaded components
 * @module asyncPages
 * @summary File containing all pages as lazy loaded components
 */

import React from 'react'
import Loadable from 'react-loadable'
import Loader from '@zeliot/common/ui/Loader'

/**
 * @summary Map dashboard page with Google maps
 */
export const AsyncGoogleMapsDashboard = Loadable({
  loader: () => import('@zeliot/core/base/pages/MapDashboard'),
  loading: () => <Loader fullscreen={true} />,
})


//////////////////
export const AsyncGoogleMapsDashboard1 = Loadable({
  loader: () => import('@zeliot/core/base/pages/MapDashboard'),
  loading: () => <Loader fullscreen={true} />,
})

//////////////////

/**
 * @summary Map dashboard page with Openstreet Maps
 */
export const AsyncOSMapsDashboard = Loadable({
  loader: () => import('@zeliot/core/base/pages/OSMap'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary Analytics dashboard page
 */
export const AsyncAnalyticsDashboard = Loadable({
  loader: () => import('@zeliot/core/base/pages/AnalyticsDashboard'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary OBD page
 */
export const AsyncOBD = Loadable({
  loader: () => import('@zeliot/core/base/pages/OBD'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary Report page
 */
export const AsyncReport = Loadable({
  loader: () => import('@zeliot/core/base/pages/Report'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary Immobilization page
 */
export const AsyncImmobilize = Loadable({
  loader: () => import('@zeliot/core/base/pages/Immobilize'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary Alerts dashboard page
 */
export const AsyncAlertsDashboard = Loadable({
  loader: () => import('@zeliot/core/base/pages/AlertsDashboard'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary Routes page
 */
export const AsyncRoutes = Loadable({
  loader: () => import('@zeliot/core/base/pages/Routes'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary AOI page
 */
export const AsyncAOI = Loadable({
  loader: () => import('@zeliot/core/base/pages/Aoi'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary School AOI page
 */
export const AsyncSchoolAOI = Loadable({
  loader: () => import('@zeliot/school/base/pages/SchoolAoi'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary Trips page
 */
export const AsyncTrips = Loadable({
  loader: () => import('@zeliot/core/base/pages/Trips'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary Activity page
 */
export const AsyncActivity = Loadable({
  loader: () => import('@zeliot/core/base/pages/Activity'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary Users page
 */
export const AsyncUsers = Loadable({
  loader: () => import('@zeliot/core/base/pages/Users'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary Vehicles page
 */
export const AsyncVehicles = Loadable({
  loader: () => import('@zeliot/core/base/pages/Vehicles'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary Vehicles View page
 */
export const AsyncVehiclesView = Loadable({
  loader: () => import('@zeliot/core/base/pages/Vehicles View/VehiclesView'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary Drivers page
 */
export const AsyncDrivers = Loadable({
  loader: () => import('@zeliot/core/base/pages/Drivers'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary Drivers View page
 */
export const AsyncDriversView = Loadable({
  loader: () => import('@zeliot/core/base/pages/Drivers View/DriversView'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary Account page
 */
export const AsyncAccount = Loadable({
  loader: () => import('@zeliot/core/base/pages/Account'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary Fuel dashboard page
 */
export const AsyncFuelDashboard = Loadable({
  loader: () => import('@zeliot/core/base/pages/FuelDashboard'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary Vehicle score page
 */
export const AsyncVehicleScore = Loadable({
  loader: () => import('@zeliot/core/base/pages/VehicleScore'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary School dashboard page
 */
export const AsyncSchoolDashboard = Loadable({
  loader: () => import('@zeliot/school/base/pages/SchoolDashboard'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary School Routes page
 */
export const AsyncSchoolRoutes = Loadable({
  loader: () => import('@zeliot/school/base/pages/SchoolRoute'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary School Trips page
 */
export const AsyncSchoolTrip = Loadable({
  loader: () => import('@zeliot/school/base/pages/SchoolTrip'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary Schools management page
 */
export const AsyncSchool = Loadable({
  loader: () => import('@zeliot/school/base/pages/School'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary Students management page
 */
export const AsyncSchoolStudents = Loadable({
  loader: () => import('@zeliot/school/base/pages/Students'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary Electric vehicles summary page
 */
export const AsyncElectricSummary = Loadable({
  loader: () => import('@zeliot/core/base/pages/Summary'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary Video stream page
 */
export const AsyncVideoStream = Loadable({
  loader: () => import('@zeliot/core/base/pages/VideoStream'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary REIL video demo page
 */
export const AsyncReilVideo = Loadable({
  loader: () => import('@zeliot/core/base/pages/ReilVideo'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary Continental TPM integration page
 */
export const AsyncContinental = Loadable({
  loader: () => import('@zeliot/core/base/pages/Continental'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary Raw data files explorer page
 */
export const AsyncRawDataFiles = Loadable({
  loader: () => import('@zeliot/core/base/pages/RawDataFilesExplorer'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary Insight page
 */
export const Insights = Loadable({
  loader: () => import('@zeliot/school/base/pages/Insights'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary Vehicle registration status page
 */
export const VehicleRegistrataionStatus = Loadable({
  loader: () => import('@zeliot/core/base/pages/VehicleRegistrationStatus'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary Fuel dashboard page
 */
export const NewFuelDashboard = Loadable({
  loader: () => import('@zeliot/core/base/pages/NewFuleDashboard'),
  loading: () => <Loader fullscreen={true} />,
})

/**
 * @summary KM Report Page
 */
export const KmReport = Loadable({
  loader: () => import('@zeliot/core/base/pages/KmReport'),
  loading: () => <Loader fullscreen={true} />,
})
