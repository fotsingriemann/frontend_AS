/**
 * An object storing the configuration for categories in the menu drawer
 * @module drawerCategories
 * @summary Drawer categories configuration
 */
import DashboardIcon from '@material-ui/icons/Dashboard'
import ActionsIcon from '@material-ui/icons/Block'
import GeoIcon from '@material-ui/icons/Directions'
import IntegrationsIcon from '@material-ui/icons/SettingsInputSvideo'
import ManagementIcon from '@material-ui/icons/AccountBox'

export default {
  HOME: {
    name: 'Home',
    key: 'HOME',
    icon:DashboardIcon,
    order:1
  },
  ACTIONS: {
    name: 'Actions & Events',
    key: 'ACTIONS',
    icon: ActionsIcon,
    order: 2
  },
  GEO: {
    name: 'Geo Services',
    key: 'GEO',
    icon: GeoIcon,
    order: 3
  },
  INTEGRATIONS: {
    name: 'Integrations',
    key: 'INTEGRATIONS',
    icon: IntegrationsIcon,
    order: 4
  },
  MANAGEMENT: {
    name: 'Management',
    key: 'MANAGEMENT',
    icon: ManagementIcon,
    order: 5
  }
}
