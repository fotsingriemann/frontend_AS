/**
 * Stores mapping between a page's key and it's name, icon, component and path
 * @module pagesConfig
 * @summary Page configurations
 */

import * as pages from './asyncPages.js'
import categories from './drawerCategories.js'
import DashboardIcon from '@material-ui/icons/Dashboard'
import MapIcon from '@material-ui/icons/Map'
import ReportIcon from '@material-ui/icons/MultilineChart'
import EventsIcon from '@material-ui/icons/ScatterPlot'
import VehicleIcon from '@material-ui/icons/AirportShuttle'
import ImmobilizeIcon from '@material-ui/icons/Block'
import DriverIcon from '@material-ui/icons/AirlineSeatReclineNormal'
import UsersIcon from '@material-ui/icons/People'
import AccountIcon from '@material-ui/icons/AccountBox'
import RoutesIcon from '@material-ui/icons/Directions'
import TripsIcon from '@material-ui/icons/SwapCalls'
import ActivityIcon from '@material-ui/icons/NearMe'
import FuelIcon from '@material-ui/icons/LocalGasStation'
import OBDDashboardIcon from '@material-ui/icons/SettingsInputSvideo'
import AOIIcon from '@material-ui/icons/SelectAll'
import Videocam from '@material-ui/icons/Videocam'
import SummaryIcon from '@material-ui/icons/Assessment'
import SchoolIcon from '@material-ui/icons/AccountBalance'

export default {
  ANALYTICS_DASHBOARD: {
    name: 'Analytics',
    icon: MapIcon,
    path: '/home/analytics',
    category: categories.HOME,
    order: 2,
    component: pages.AsyncAnalyticsDashboard,
  },

  SCHOOL_DASHBOARD: {
    name: 'Analytics',
    icon: MapIcon,
    path: '/home/analytics',
    category: categories.HOME,
    order: 2,
    component: pages.AsyncSchoolDashboard,
  },

  GOOGLE_MAPS: {
    name: 'Dashboard',
    icon: DashboardIcon,
    path: '/home/dashboard',
    category: categories.HOME,
    order: 1,
    component: pages.AsyncGoogleMapsDashboard,
  },

  GOOGLE_MAPS1: {
    name: 'Dashboard',
    icon: DashboardIcon,
    path: '/home/dashboard1',
    category: categories.HOME,
    order: 1,
    component: pages.AsyncGoogleMapsDashboard1,
  },

  OPENSTREET_MAPS: {
    name: 'Dashboard',
    icon: DashboardIcon,
    path: '/home/dashboard',
    category: categories.HOME,
    order: 1,
    component: pages.AsyncOSMapsDashboard,
  },

  REPORT: {
    name: 'Reports',
    icon: ReportIcon,
    path: '/home/report',
    category: categories.HOME,
    order: 3,
    component: pages.AsyncReport,
  },

  IMMOBILIZE: {
    name: 'Mobilize/Immobilize',
    icon: ImmobilizeIcon,
    path: '/home/mobilize-immobilize',
    category: categories.ACTIONS,
    order: 1,
    component: pages.AsyncImmobilize,
  },

  ALERTS_CONFIG: {
    name: 'Alerts',
    icon: EventsIcon,
    path: '/home/alerts',
    category: categories.ACTIONS,
    order: 2,
    component: pages.AsyncAlertsDashboard,
  },

  SCHOOL_INSIGHTS: {
    name: 'Insights',
    icon: OBDDashboardIcon,
    path: '/home/insights',
    category: categories.ACTIONS,
    order: 3,
    component: pages.Insights,
  },

  AOI: {
    name: 'AOI',
    icon: AOIIcon,
    path: '/home/AOI',
    category: categories.GEO,
    order: 1,
    component: pages.AsyncAOI,
  },

  SCHOOL_AOI: {
    name: 'Stops',
    icon: AOIIcon,
    path: '/home/AOI',
    category: categories.GEO,
    order: 1,
    component: pages.AsyncSchoolAOI,
  },

  ROUTES: {
    name: 'Routes',
    icon: RoutesIcon,
    path: '/home/routes',
    category: categories.GEO,
    order: 2,
    component: pages.AsyncRoutes,
  },

  SCHOOL_ROUTES: {
    name: 'Auto-Routes',
    icon: RoutesIcon,
    path: '/home/auto-routes',
    category: categories.INTEGRATIONS,
    order: 2,
    component: pages.AsyncSchoolRoutes,
  },

  TRIPS: {
    name: 'Trips',
    icon: TripsIcon,
    path: '/home/trips',
    category: categories.GEO,
    order: 3,
    component: pages.AsyncTrips,
  },

  SCHOOL_TRIPS: {
    name: 'Auto-Trips',
    icon: TripsIcon,
    path: '/home/auto-trips',
    category: categories.INTEGRATIONS,
    order: 3,
    component: pages.AsyncSchoolTrip,
  },

  ACTIVITY: {
    name: 'Activity',
    icon: ActivityIcon,
    path: '/home/activity',
    category: categories.GEO,
    order: 4,
    component: pages.AsyncActivity,
  },

  FUEL_DASHBOARD: {
    name: 'Fuel Dashboard',
    icon: FuelIcon,
    path: '/home/fuel-dashboard',
    category: categories.INTEGRATIONS,
    order: 1,
    component: pages.AsyncFuelDashboard,
  },

  OBD_DASHBOARD: {
    name: 'OBD Dashboard',
    icon: OBDDashboardIcon,
    path: '/home/obd-dashboard',
    category: categories.INTEGRATIONS,
    order: 2,
    component: pages.AsyncOBD,
  },

  SCHOOL: {
    name: 'Schools',
    icon: SchoolIcon,
    path: '/home/manage-school',
    category: categories.MANAGEMENT,
    order: 1,
    component: pages.AsyncSchool,
  },

  SCHOOL_STUDENTS: {
    name: 'Students',
    // icon: UsersIcon,
    path: '/home/manage-students',
    category: categories.MANAGEMENT,
    order: 2,
    component: pages.AsyncSchoolStudents,
  },

  MANAGE_VEHICLES: {
    name: 'Vehicles',
    icon: VehicleIcon,
    path: '/home/manage-vehicles',
    category: categories.MANAGEMENT,
    order: 3,
    component: pages.AsyncVehicles,
  },

  MANAGE_VEHICLES_VIEW: {
    name: 'Vehicles - View',
    icon: VehicleIcon,
    path: '/home/manage-vehicles-view',
    category: categories.MANAGEMENT,
    order: 4,
    component: pages.AsyncVehiclesView,
  },

  MANAGE_DRIVERS: {
    name: 'Drivers',
    icon: DriverIcon,
    path: '/home/manage-drivers',
    category: categories.MANAGEMENT,
    order: 5,
    component: pages.AsyncDrivers,
  },

  MANAGE_DRIVERS_VIEW: {
    name: 'Drivers - View',
    icon: DriverIcon,
    path: '/home/manage-drivers-view',
    category: categories.MANAGEMENT,
    order: 6,
    component: pages.AsyncDriversView,
  },

  VEHICLES_RTO: {
    name: 'Vehicle Activation Status',
    icon: DriverIcon,
    path: '/home/manage-vehicle-registration',
    category: categories.MANAGEMENT,
    order: 4,
    component: pages.VehicleRegistrataionStatus,
  },

  MANAGE_USERS: {
    name: 'Users',
    icon: UsersIcon,
    path: '/home/manage-users',
    category: categories.MANAGEMENT,
    order: 7,
    component: pages.AsyncUsers,
  },

  MANAGE_ACCOUNT: {
    name: 'Account',
    icon: AccountIcon,
    path: '/home/account',
    category: categories.MANAGEMENT,
    order: 8,
    component: pages.AsyncAccount,
  },

  SUMMARY_ELECTRIC: {
    name: 'Summary',
    icon: SummaryIcon,
    path: '/home/summary-electric',
    category: categories.INTEGRATIONS,
    order: 1,
    component: pages.AsyncElectricSummary,
  },

  LIVE_VIDEO: {
    name: 'Live Video',
    icon: Videocam,
    path: '/home/live-video',
    category: categories.INTEGRATIONS,
    order: 4,
    component: pages.AsyncVideoStream,
  },

  KM_REPORT: {
    name: 'KM Report',
    icon: Videocam,
    path: '/home/kmreport',
    category: categories.INTEGRATIONS,
    order: 4,
    component: pages.KmReport,
  },

  REIL_VIDEO: {
    name: 'Live Video',
    icon: Videocam,
    path: '/home/live-video/multi-cam',
    category: categories.INTEGRATIONS,
    order: 4,
    component: pages.AsyncReilVideo,
  },

  CONTINENTAL_DASHBOARD: {
    name: 'TPMS',
    icon: MapIcon,
    path: '/home/tpms',
    category: categories.INTEGRATIONS,
    order: 4,
    component: pages.AsyncContinental,
    // component: pages.AsyncRawDataFiles
  },
}
