import React, { Component } from 'react'
import classNames from 'classnames'
import { Switch, Redirect, withRouter } from 'react-router-dom'
import { Grid, Typography, withStyles } from '@material-ui/core'
import AlertsDrawer from '@zeliot/core/base/modules/AlertsDrawer'
import NavBar from '@zeliot/core/base/modules/NavBar'
import { PrivateRoute } from '@zeliot/common/router/index.js'
// import HorizontalMenu from '@zeliot/core/base/modules/HorizontalMenu/HorizontalMenu'
import MenuDrawer from 'packages/core/base/modules/MenuDrawer/MenuDrawer.jsx'
import { MENU_DRAWER_WIDTH } from '@zeliot/common/constants/styles'
import withWidth, { isWidthUp } from '@material-ui/core/withWidth'
import { getItem } from '../../../../storage.js'

/**
 * @summary A Material UI styling function
 * @param {object} theme The material UI theme
 * @returns {object} A styles object for styling the component
 */
const style = theme => ({
  AppContainer: {
    maxWidth: '100vw',
    overflowX: 'hidden'
  },

  mainContent: {
    minHeight: 'calc(100vh - 48px)',
    width: '100%',
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.complex
    })
  },

  mainContentOpenedDrawer: {
    [theme.breakpoints.up('md')]: {
      marginLeft: MENU_DRAWER_WIDTH
    },
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0
    }
  },

  mainContentClosedDrawer: {
    [theme.breakpoints.up('md')]: {
      marginLeft: theme.spacing(7)
    },
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0
    }
  },

  banner: {
    zIndex: 100,
    position: 'fixed',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    top: 0,
    width: '100%',
    height: 32,
    background:
      'linear-gradient(90deg, rgb(161, 255, 127), rgb(84, 193, 44), rgb(161, 255, 127))'
  },

  bannerMargin: {
    marginTop: 80,
    minHeight: 'calc(100vh - 80px)'
  }
})

/**
 * AppShell implements the Navigation Bar, Menu Drawer, Alerts Drawer and the main app with router
 * @summary AppShell component that implements the bare shell of the app
 */
class AppShell extends Component {
  /**
   * @property {boolean} isMenuDrawerOpen State variable that stores the state of the Menu Drawer
   * @property {boolean} isAlertsDrawerOpen State variable that stores the state of the Alerts Drawer
   */
  state = {
    isMenuDrawerOpen: this.isMenuDrawerOpen,
    isAlertsDrawerOpen: false,
    isButtonClicked: false,
    alertsViewed: false,
    alertsCount: 0,
    alerts: []
  }

  setAlerts = (newAlerts) => {
    //alerts comes here and get appends to alerts state
    this.setState({ alerts: [...this.state.alerts, newAlerts] })

    //then it will check the condition is alerts drawer is open or no if open then it will update the count and makes alerts.length and alertcount as equal
    if (this.state.isAlertsDrawerOpen == true) {
      this.updateAlertsCount(this.state.alerts.length)
    }
    //if it doesnt go to this above condition then it will not update the alertsCount and hence alets length wilk not be equal to alertsCount and hence red notification pops up
  }

  updateAlertsCount = (alertsLength) => {
    this.setState({ alertsCount: alertsLength })
  }

  handleAlertsDrawerToggle = () => {
    this.setState({ isAlertsDrawerOpen: true })
  }

  handleAlertsDrawerToggleFalse = () => {
    this.setState({ isAlertsDrawerOpen: false })
  }

  handleButtonClicked = () => {
    let isButtonClicked = this.state.isButtonClicked
    let isAlertsDrawerOpen = this.state.isAlertsDrawerOpen
    this.setState({
      isButtonClicked: !isButtonClicked
    })
  }

  alertsViewedTrue = () => {
    this.setState({
      alertsViewed: true
    })
  }

  alertsViewedFalse = () => {
    this.setState({
      alertsViewed: false
    })
  }

  /**
   * @summary Check if viewport width is more than medium screen and set the initial status of MenuDrawer
   * @returns {boolean} Returns true if viewport width is more than medium screen
   */
  get isMenuDrawerOpen() {
    return isWidthUp('md', this.props.width)
  }

  /**
   * @function
   * @summary Toggles the status of menu drawer
   */
  handleMenuDrawerToggle = () =>
    this.setState(({ isMenuDrawerOpen }) => ({
      isMenuDrawerOpen: !isMenuDrawerOpen
    }))

  handleAlertsDrawerToggle = () =>
    this.setState(({ isAlertsDrawerOpen }) => ({
      isAlertsDrawerOpen: !isAlertsDrawerOpen
    }))

  /**
   * @summary Check if viewport width updated, and update the status of MenuDrawer automatically
   * @param {object} prevProps Previous props before the component updated
   */
  componentDidUpdate(prevProps) {
    if (prevProps.width !== this.props.width) {
      this.setState({ isMenuDrawerOpen: this.isMenuDrawerOpen })
    }
  }

  render() {
    const { classes, pages, isDarkTheme, onThemeChange, width } = this.props
    const { isAlertsDrawerOpen, isMenuDrawerOpen } = this.state
    const isBannerOpen = getItem('loginType', 'TEMPORARY') === 'TOKEN'
    const mainClasses = classNames(
      isBannerOpen ? classes.bannerMargin : 'appbar-top-margin',
      classes.mainContent,
      { [classes.mainContentOpenedDrawer]: isMenuDrawerOpen },
      { [classes.mainContentClosedDrawer]: !isMenuDrawerOpen }
    )

    const isDesktop = isWidthUp('md', width)

    return (
      <div className={classes.AppContainer}>
        {isBannerOpen && (
          <div className={classes.banner}>
            <Typography
              variant="subtitle1"
              style={{ color: 'white', fontWeight: '500' }}
            >
              Login preview for: {getItem('username', 'TEMPORARY')}
            </Typography>
          </div>
        )}

        <MenuDrawer
          isMenuDrawerOpen={isMenuDrawerOpen}
          variant={isDesktop ? 'permanent' : 'temporary'}
          isBannerOpen={isBannerOpen}
          miniMode={isDesktop}
          onClose={() => this.setState({ isMenuDrawerOpen: false })}
        />

        <AlertsDrawer
          isAlertsDrawerOpen={isAlertsDrawerOpen}
          handleMenuDrawerToggle={this.handleMenuDrawerToggle}
          onClose={() => this.setState({ isAlertsDrawerOpen: false })}
        />

        <Grid container>
          <NavBar
            handleMenuDrawerToggle={this.handleMenuDrawerToggle}
            handleAlertsDrawerToggle={this.handleAlertsDrawerToggle}
            handleAlertsDrawerToggleFalse={this.handleAlertsDrawerToggleFalse}
            isBannerOpen={isBannerOpen}
            isDarkTheme={isDarkTheme}
            onThemeChange={onThemeChange}
            isAlertsDrawerOpen={this.state.isAlertsDrawerOpen}
            isButtonClicked={this.state.isButtonClicked}
            handleButtonClicked={this.handleButtonClicked}
            alertsViewed={this.state.alertsViewed}
            alertsViewedTrue={this.alertsViewedTrue}
            alertsViewedFalse={this.alertsViewedFalse}
            alertsCount={this.state.alertsCount}
            updateAlertsCount={this.updateAlertsCount}
            alerts={this.state.alerts}
            setAlerts={this.setAlerts}
          />

          <main className={mainClasses}>
            {/* <HorizontalMenu pages={pages} /> */}
            <MainApp pages={pages} />
          </main>
        </Grid>
      </div>
    )
  }
}

/* All components inside <main> separated into a PureComponent to
  prevent re-rendering entire tree when any of the drawer toggles
*/

const MainApp = withRouter(props => {
  const component = props.pages[7].component
  const icon = props.pages[7].icon
  const cathegorie = props.pages[7].cathegorie
  const dashboard2 = {
    name: 'Dashboard2',
    icon,
    path: '/home/dashboard1',
    cathegorie,
    order: 1,
    component,
  }

  props.pages.push(dashboard2)
  return (
    <Switch>
      {props.pages.map(({ path, component: Component }, index) => (
        <PrivateRoute
          key={index}
          path={path}
          render={props => <Component {...props} />}
        />
      ))}
      <Redirect
        to={{
          pathname: props.pages[0].path
        }}
      />
    </Switch>
  )
})

export default withStyles(style)(withWidth()(AppShell))




