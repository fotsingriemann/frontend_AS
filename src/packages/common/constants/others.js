/**
 * Stores some constants including Icons, URLs, Arrays & objects
 * @module constants/others
 * @summary Stores some constants used throughout the app
 */
import PanicIcon from '@material-ui/icons/NotificationsActive'
import OverspeedIcon from '@material-ui/icons/NetworkCheck'
import TowIcon from '@material-ui/icons/RvHookup'
import FallIcon from '@material-ui/icons/TrendingDown'
import NoresponseIcon from '@material-ui/icons/SyncProblem'
import ExtBatLowIcon from '@material-ui/icons/BatteryAlert'
import IntBatLowIcon from '@material-ui/icons/Battery20'
import PulloutIcon from '@material-ui/icons/PowerOff'
import GeofenceIcon from '@material-ui/icons/TabUnselected'
import RoutefenceIcon from '@material-ui/icons/CallSplit'
import HaltIcon from '@material-ui/icons/Error'
import IdleIcon from '@material-ui/icons/Schedule'
import TripCompleteIcon from '@material-ui/icons/DoneAll'
import TripLiveIcon from '@material-ui/icons/NearMe'
import TripScheduledIcon from '@material-ui/icons/Alarm'
import AllTripsIcon from '@material-ui/icons/Star'

import ConsolidatedReportIcon from '@zeliot/common/static/svg/reports/consolidated.svg'
import AOIReportIcon from '@zeliot/common/static/svg/reports/aoi.svg'
import SummaryReportIcon from '@zeliot/common/static/svg/reports/summary.svg'
import DayWiseReportIcon from '@zeliot/common/static/svg/reports/day-wise.svg'
import HaltReportIcon from '@zeliot/common/static/svg/reports/halt.svg'
import IdlingReportIcon from '@zeliot/common/static/svg/reports/idling.svg'
import IgnitionReportIcon from '@zeliot/common/static/svg/reports/ignition.svg'
import J1939ReportIcon from '@zeliot/common/static/svg/reports/J1939.svg'
import OverspeedReportIcon from '@zeliot/common/static/svg/reports/overspeed.svg'
import OBDReportIcon from '@zeliot/common/static/svg/reports/obd.svg'
import PanicReportIcon from '@zeliot/common/static/svg/reports/panic.svg'
import TrackingReportIcon from '@zeliot/common/static/svg/reports/tracking.svg'
import TripReportIcon from '@zeliot/common/static/svg/reports/trip.svg'

import GreenCar from '@zeliot/common/static/png/green_car.png'
import YellowCar from '@zeliot/common/static/png/yellow_car.png'
import RedCar from '@zeliot/common/static/png/red_car.png'
import GrayCar from '@zeliot/common/static/png/gray_car.png'
import BlackCar from '@zeliot/common/static/png/black_car.png'
import BlueCar from '@zeliot/common/static/png/blue_car.png'

import GreenBike from '@zeliot/common/static/png/green_bike.png'
import YellowBike from '@zeliot/common/static/png/yellow_bike.png'
import RedBike from '@zeliot/common/static/png/red_bike.png'
import GrayBike from '@zeliot/common/static/png/gray_bike.png'
import BlackBike from '@zeliot/common/static/png/black_bike.png'
import BlueBike from '@zeliot/common/static/png/blue_bike.png'

import GreenTruck from '@zeliot/common/static/png/green_truck.png'
import YellowTruck from '@zeliot/common/static/png/yellow_truck.png'
import RedTruck from '@zeliot/common/static/png/red_truck.png'
import GrayTruck from '@zeliot/common/static/png/gray_truck.png'
import BlackTruck from '@zeliot/common/static/png/black_truck.png'
import BlueTruck from '@zeliot/common/static/png/blue_truck.png'

import GreenRoller from '@zeliot/common/static/png/green_roller.png'
import YellowRoller from '@zeliot/common/static/png/yellow_roller.png'
import RedRoller from '@zeliot/common/static/png/red_roller.png'
import GrayRoller from '@zeliot/common/static/png/gray_roller.png'
import BlackRoller from '@zeliot/common/static/png/black_roller.png'

import GreenBus from '@zeliot/common/static/png/green_bus.png'
import YellowBus from '@zeliot/common/static/png/yellow_bus.png'
import RedBus from '@zeliot/common/static/png/red_bus.png'
import GrayBus from '@zeliot/common/static/png/gray_bus.png'
import BlackBus from '@zeliot/common/static/png/black_bus.png'

import GreenDot from '@zeliot/common/static/png/green_dot.png'
import YellowDot from '@zeliot/common/static/png/yellow_dot.png'
import RedDot from '@zeliot/common/static/png/red_dot.png'
import GrayDot from '@zeliot/common/static/png/grey_dot.png'
import BlackDot from '@zeliot/common/static/png/brown_dot.png'

import GreenSixSeater from '@zeliot/common/static/png/green_sixseater.png'
import YellowSixSeater from '@zeliot/common/static/png/yellow_sixseater.png'
import RedSixSeater from '@zeliot/common/static/png/red_sixseater.png'
import GraySixSeater from '@zeliot/common/static/png/grey_sixseater.png'
import BlackSixSeater from '@zeliot/common/static/png/black_sixseater.png'

import GreenStacker from '@zeliot/common/static/png/green_stacker.png'
import YellowStacker from '@zeliot/common/static/png/yellow_stacker.png'
import RedStacker from '@zeliot/common/static/png/red_stacker.png'
import GrayStacker from '@zeliot/common/static/png/grey_stacker.png'
import BlackStacker from '@zeliot/common/static/png/black_stacker.png'

import GreenTow from '@zeliot/common/static/png/green_tow.png'
import YellowTow from '@zeliot/common/static/png/yellow_tow.png'
import RedTow from '@zeliot/common/static/png/red_tow.png'
import GrayTow from '@zeliot/common/static/png/grey_tow.png'
import BlackTow from '@zeliot/common/static/png/black_tow.png'

import GreenTug from '@zeliot/common/static/png/green_tug.png'
import YellowTug from '@zeliot/common/static/png/yellow_tug.png'
import RedTug from '@zeliot/common/static/png/red_tug.png'
import GrayTug from '@zeliot/common/static/png/grey_tug.png'
import BlackTug from '@zeliot/common/static/png/black_tug.png'

const GreenAmb = GreenTruck
const YellowAmb = YellowTruck
const RedAmb = RedTruck
const GrayAmb = GrayTruck
const BlackAmb = BlackTruck
const BlueAmb = BlueTruck

/**
 * @summary Short form of day names stored as an array
 */
export const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * @summary 24 hour marks stored in an array in readable 12 hour formats
 */
export const time = [
  '12 AM',
  '1 AM',
  '2 AM',
  '3 AM',
  '4 AM',
  '5 AM',
  '6 AM',
  '7 AM',
  '8 AM',
  '9 AM',
  '10 AM',
  '11 AM',
  '12 PM',
  '1 PM',
  '2 PM',
  '3 PM',
  '4 PM',
  '5 PM',
  '6 PM',
  '7 PM',
  '8 PM',
  '9PM',
  '10 PM',
  '11 PM',
]

/**
 * @summary The URL for Google Maps API library using the API_KEY from the `env`
 */
export const GOOGLE_MAPS_URL = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=geometry,places`

/**
 * @summary Travel replay duration between each packet
 */
export const REPLAY_DURATION = 2500

/**
 * @summary Difference between UTC & IST in minutes
 */
export const MINUTES = 330

/**
 * @summary The link to the user manual
 */
export const USER_MANUAL_DOWNLOAD_LINK =
  // 'https://storage.googleapis.com/aquilatrack-prod-static-assets/assets/user-manual/User_Manual.pdf'
  ' https://storage.googleapis.com/aquilatrack-prod-static-assets/assets/user-manual/User%20Manual_WebApp.pdf'

/**
 * @summary The link to the app in App Store
 */
export const APP_STORE_LINK =
  'https://itunes.apple.com/us/app/aquilatrack/id1454762649?ls=1&mt=8'

/**
 * @summary The link to the app in Play Store
 */
export const PLAY_STORE_LINK =
  'https://play.google.com/store/apps/details?id=com.zeliot.aquilatrack'

/**
 * @summary An array of gender objects
 */
export const GENDERS = [
  {
    value: 'F',
    label: 'Female',
  },
  {
    value: 'M',
    label: 'Male',
  },
  {
    value: 'T',
    label: 'Transgender',
  },
  {
    value: 'O',
    label: 'Other',
  },
]

/**
 * @summary Array of Alert Icon objects
 */
export const ALERT_ICONS = [
  {
    type: 'panic',
    icon: PanicIcon,
  },
  {
    type: 'overspeed',
    icon: OverspeedIcon,
  },
  {
    type: 'tow',
    icon: TowIcon,
  },
  {
    type: 'fall',
    icon: FallIcon,
  },
  {
    type: 'noResponse',
    icon: NoresponseIcon,
  },
  {
    type: 'ExtBatLow',
    icon: ExtBatLowIcon,
  },
  {
    type: 'IntBatLow',
    icon: IntBatLowIcon,
  },
  {
    type: 'pullout',
    icon: PulloutIcon,
  },
  {
    type: 'aoi',
    icon: GeofenceIcon,
  },
  {
    type: 'routefence',
    icon: RoutefenceIcon,
  },
  {
    type: 'halt',
    icon: HaltIcon,
  },
  {
    type: 'idle',
    icon: IdleIcon,
  },
  {
    type: 'scheduleMaintenance',
    icon: HaltIcon,
  },
  {
    type: 'conditionalMaintenance',
    icon: HaltIcon,
  },
]

/**
 * @summary Array of vehicle icon objects
 */
export const VEHICLE_ICONS = [
  {
    vehicleType: 'Car',
    icons: {
      running: GreenCar,
      idle: YellowCar,
      halt: RedCar,
      nogps: GrayCar,
      offline: BlackCar,
      default: BlueCar,
    },
  },
  {
    vehicleType: 'Bike',
    icons: {
      running: GreenBike,
      idle: YellowBike,
      halt: RedBike,
      nogps: GrayBike,
      offline: BlackBike,
      default: BlueBike,
    },
  },
  {
    vehicleType: 'Ambulance',
    icons: {
      running: GreenAmb,
      idle: YellowAmb,
      halt: RedAmb,
      nogps: GrayAmb,
      offline: BlackAmb,
      default: BlueAmb,
    },
  },
  {
    vehicleType: 'Truck',
    icons: {
      running: GreenTruck,
      idle: YellowTruck,
      halt: RedTruck,
      nogps: GrayTruck,
      offline: BlackTruck,
      default: BlueTruck,
    },
  },
  {
    vehicleType: 'Roller',
    icons: {
      running: GreenRoller,
      idle: YellowRoller,
      halt: RedRoller,
      nogps: GrayRoller,
      offline: BlackRoller,
      default: GreenRoller,
    },
  },
  {
    vehicleType: 'School Bus',
    icons: {
      running: GreenBus,
      idle: YellowBus,
      halt: RedBus,
      nogps: GrayBus,
      offline: BlackBus,
      default: GreenBus,
    },
  },
  {
    vehicleType: 'Bus',
    icons: {
      running: GreenBus,
      idle: YellowBus,
      halt: RedBus,
      nogps: GrayBus,
      offline: BlackBus,
      default: GreenBus,
    },
  },
  {
    vehicleType: 'Marker',
    icons: {
      running: GreenDot,
      idle: YellowDot,
      halt: RedDot,
      nogps: GrayDot,
      offline: BlackDot,
      default: GreenDot,
    },
  },
  {
    vehicleType: 'Sixseater',
    icons: {
      running: GreenSixSeater,
      idle: YellowSixSeater,
      halt: RedSixSeater,
      nogps: GraySixSeater,
      offline: BlackSixSeater,
      default: GreenSixSeater,
    },
  },
  {
    vehicleType: 'Stacker',
    icons: {
      running: GreenStacker,
      idle: YellowStacker,
      halt: RedStacker,
      nogps: GrayStacker,
      offline: BlackStacker,
      default: GreenStacker,
    },
  },
  {
    vehicleType: 'Tow',
    icons: {
      running: GreenTow,
      idle: YellowTow,
      halt: RedTow,
      nogps: GrayTow,
      offline: BlackTow,
      default: GreenTow,
    },
  },
  {
    vehicleType: 'Tug',
    icons: {
      running: GreenTug,
      idle: YellowTug,
      halt: RedTug,
      nogps: GrayTug,
      offline: BlackTug,
      default: GreenTug,
    },
  },
]

/**
 * @summary Array of Trip status objects
 */
export const TRIP_STATUS_TYPES = [
  {
    name: 'All',
    description: 'All trips',
    count: 0,
    icon: AllTripsIcon,
    key: null,
  },
  {
    name: 'Completed',
    description: 'Trips with completed schedules',
    count: 0,
    icon: TripCompleteIcon,
    key: 5,
  },
  {
    name: 'In progress',
    description: 'Trip with active schedules',
    count: 0,
    icon: TripLiveIcon,
    key: 4,
  },
  // {
  //   name: 'Active',
  //   description: 'All Active trips',
  //   count: 0,
  //   icon: TripScheduledIcon,
  //   key: 0
  // },
  {
    name: 'Paused',
    description: 'Trips with paused schedules',
    count: 0,
    icon: TripScheduledIcon,
    key: 2,
  },
  {
    name: 'Deleted',
    description: 'Trips deleted',
    count: 0,
    icon: TripScheduledIcon,
    key: 3,
  },
]

export const REPORT_ICONS = {
  'AOI IN/OUT Report': AOIReportIcon,
  'Consolidated Report': ConsolidatedReportIcon,
  'Current Summary Report': SummaryReportIcon,
  'Day Wise Report': DayWiseReportIcon,
  'Halt Report': HaltReportIcon,
  'Idling Report': IdlingReportIcon,
  'Ignition ON/OFF Report': IgnitionReportIcon,
  'J1939 Report': J1939ReportIcon,
  'OBD II Report': OBDReportIcon,
  'Overspeed Report': OverspeedReportIcon,
  'Panic Report': PanicReportIcon,
  'Tracking Report': TrackingReportIcon,
  'Trip Report': TripReportIcon,
}
