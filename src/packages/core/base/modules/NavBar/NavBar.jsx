/**
 * @module NavBar
 * @summary This module exports the NavBar component
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import { Link } from 'react-router-dom'
import {
  withStyles,
  Grid,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
  Tooltip,
  Hidden,
  Switch,
  Menu,
  MenuItem,
  FormControlLabel,
} from '@material-ui/core'
import {
  Menu as MenuIcon,
  Help as HelpIcon,
  Mail as MailIcon,
  ContactPhone,
  AccountCircle as AccountCircleIcon,
  Translate as TranslateIcon,
} from '@material-ui/icons'
import IconWrapper from '../../pages/Account/IconWrapper.jsx'
import GooglePlayStore from '@zeliot/common/static/png/google-play-badge.png'
import AppleAppStore from '@zeliot/common/static/png/app-store-badge.svg'
import {
  USER_MANUAL_DOWNLOAD_LINK,
  PLAY_STORE_LINK,
  APP_STORE_LINK,
} from '@zeliot/common/constants/others'
import { getItem } from '../../../../../storage.js'
import AccountMenu from './AccountMenu/AccountMenu'
import LiveAlerts from './LiveAlerts'
import withLanguage from 'packages/common/language/withLanguage.js'
import languageJson from 'packages/common/language/language.json'

/**
 * @param {object} props React component props
 * @summary Transition component redners the Slide Up animation
 */
function Transition(props) {
  return <Slide direction="up" {...props} />
}

const GET_DOMAIN_CONFIG = gql`
  query($domain: String!) {
    domainConfiguration(domain: $domain) {
      header {
        title
      }
      page {
        logo
        navbarConfig {
          logo
          title
        }
      }
    }
  }
`

/**
 * @param {object} props React component props
 * @summary CustomToolbar component renders a Toolbar
 */
function CustomToolbar(props) {
  const { children } = props

  return (
    <React.Fragment>
      <Hidden smDown>
        <Toolbar variant="dense">{children}</Toolbar>
      </Hidden>

      <Hidden mdUp>
        <Toolbar variant="dense" disableGutters={true}>
          {children}
        </Toolbar>
      </Hidden>
    </React.Fragment>
  )
}

/**
 * @param {object} props React component props
 * @summary Component to display linksto mobile apps in a dialog
 */
function AppStoreDialog(props) {
  const { isAppDialogOpen, closeAppDialog } = props

  return (
    <Dialog
      open={isAppDialogOpen}
      TransitionComponent={Transition}
      keepMounted
      onClose={closeAppDialog}
      aria-labelledby="app-dialog-slide-title"
      aria-describedby="app-dialog-slide-description"
    >
      <DialogTitle id="app-dialog-slide-title">
        Download Mobile Apps
      </DialogTitle>

      <DialogContent>
        <DialogContentText id="app-dialog-slide-description">
          To download the latest version of AquilaTrack mobile app, click on the
          links below
        </DialogContentText>

        <Grid container justify="space-around" spacing={2}>
          <Grid item xs={6}>
            <a href={PLAY_STORE_LINK} target="_blank" rel="noopener noreferrer">
              <img
                src={GooglePlayStore}
                alt="google-play-badge"
                height="auto"
                width="100%"
              />
            </a>
          </Grid>

          <Grid item xs={6}>
            <a href={APP_STORE_LINK} target="_blank" rel="noopener noreferrer">
              <img
                alt="app-store-badge"
                src={AppleAppStore}
                height="auto"
                width="100%"
              />
            </a>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={closeAppDialog} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const styles = (theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  flex: {
    flex: 1,
    alignItems: 'center',
  },
  alphaTag: {
    fontSize: 10,
    fontWeight: 400,
    verticalAlign: 'middle',
    paddingLeft: 10,
    opacity: 0.5,
  },
  noStyleLink: {
    '&:link': {
      textDecoration: 'inherit',
      color: 'inherit',
      cursor: 'pointer',
    },

    '&:visited': {
      textDecoration: 'inherit',
      color: 'inherit',
      cursor: 'pointer',
    },
  },
  appBarWithBanner: {
    top: 32,
  },
})

/**
 * @summary NavBar component renders the application navigation bar
 */
class NavBar extends Component {
  /**
   * @property {boolean} isAccountMenuOpen Boolean to determine if the account menu is open
   * @property {object} anchorEl The reference to the anchor of the menu
   * @property {boolean} isAppDialogOpen Whether the dialog for mobile app links is open
   */
  state = {
    isAccountMenuOpen: false,
    anchorEl: null,
    isAppDialogOpen: false,
    languageAnchorEl: null,
  }

  /**
   * @function
   * @summary Opens the account menu
   */
  openAccountMenu = (e) =>
    this.setState({
      isAccountMenuOpen: true,
      anchorEl: e.currentTarget,
    })

  /**
   * @function
   * @summary Opens the mobile app links dialog
   */
  openAppDialog = () => this.setState({ isAppDialogOpen: true })

  /**
   * @function
   * @summary Closes the mobile app links dialog
   */
  closeAppDialog = () => this.setState({ isAppDialogOpen: false })

  /**
   * @function
   * @summary Closes the account menu
   */
  closeAccountMenu = (e) =>
    this.setState({
      isAccountMenuOpen: false,
      anchorEl: null,
    })

  openLanguageMenu = (e) => (isOpen) =>
    isOpen
      ? this.setState({ languageAnchorEl: e.currentTarget })
      : this.setState({ languageAnchorEl: null })

  handleLanguageChange = (language) => {
    this.props.updateLanguage(language)
    localStorage.setItem('language', language)
    this.setState({ languageAnchorEl: null })
  }

  render() {
    const { classes, isBannerOpen, selectedLanguage, allLanguages } = this.props

    const loginType = getItem('loginType', 'TEMPORARY')

    const isDemoLogin = loginType === 'TOKEN'

    const showLinks =
      window.location.host === 'web.aquilatrack.com' && !isDemoLogin

    return (
      <div>
        <AppBar
          position="fixed"
          color="secondary"
          className={classNames(
            classes.appBar,
            isBannerOpen && classes.appBarWithBanner
          )}
        >
          <CustomToolbar variant="dense">
            <Grid container className={classes.flex}>
              <IconButton
                className={classes.menuButton}
                color="inherit"
                aria-label="Menu"
                onClick={this.props.handleMenuDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
              <Grid item>
                <Query
                  query={GET_DOMAIN_CONFIG}
                  variables={{ domain: window.location.host }}
                >
                  {({ loading, error, data }) => {
                    if (loading) return 'Loading'
                    if (error) return 'Error'

                    const navbarConfig =
                      data.domainConfiguration.page.navbarConfig

                    if (navbarConfig) {
                      if (navbarConfig.logo) {
                        return (
                          <Link
                            to={{
                              pathname: '/',
                            }}
                            className={classes.noStyleLink}
                            style={{
                              display: 'block',
                              backgroundImage: `url("${navbarConfig.logo}")`,
                              height: 40,
                              width: 100,
                              backgroundPosition: 'center',
                              backgroundSize: 'contain',
                              backgroundRepeat: 'no-repeat',
                            }}
                          />
                        )
                      }

                      return (
                        <Link
                          to={{
                            pathname: '/',
                          }}
                          className={classes.noStyleLink}
                        >
                          <Typography variant="h6" color="inherit">
                            {navbarConfig.title}
                          </Typography>
                        </Link>
                      )
                    } else {
                      return (
                        <Link
                          to={{
                            pathname: '/',
                          }}
                          className={classes.noStyleLink}
                        >
                          <Typography variant="h6" color="inherit">
                            {data.domainConfiguration.header.title}
                          </Typography>
                        </Link>
                      )
                    }
                  }}
                </Query>
              </Grid>
              <Grid
                item
                style={{
                  marginLeft: '30px',
                  justify: 'center',
                  alignItems: 'center',
                }}
              >
                <marquee
                  width="600px"
                  style={{
                    color: 'white',
                    opacity: '0.8',
                    fontSize: '17px',
                  }}
                >
                  <Grid container direction="row">
                    <Grid item style={{ paddingRight: '25px' }}>
                      <Typography>
                        <IconWrapper>
                          <MailIcon color="white" />
                        </IconWrapper>
                        support@africasystems.com{' '}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography>
                        <IconWrapper>
                          <ContactPhone color="white" />
                        </IconWrapper>
                        {/* +237 693 830 206 */}
                        +237 656 697 017
                      </Typography>
                    </Grid>
                  </Grid>
                </marquee>
              </Grid>
            </Grid>

            <Button
              variant="text"
              color="inherit"
              size="small"
              aria-controls="language-menu"
              startIcon={<TranslateIcon />}
              onClick={(e) => this.openLanguageMenu(e)(true)}
            >
              {selectedLanguage}
            </Button>

            <Menu
              id="language-menu"
              anchorEl={this.state.languageAnchorEl}
              open={Boolean(this.state.languageAnchorEl)}
              onClose={(e) => this.openLanguageMenu(e)(false)}
            >
              {allLanguages.map((item, index) => (
                <MenuItem
                  key={index}
                  onClick={() => this.handleLanguageChange(item)}
                >
                  {item}
                </MenuItem>
              ))}
            </Menu>

            <FormControlLabel
              // value={this.props.isDarkTheme}
              onChange={(e) => this.props.onThemeChange(e.target.checked)}
              control={
                <Switch color="primary" checked={this.props.isDarkTheme} />
              }
              label={languageJson[selectedLanguage].common.darkModeLabel}
              labelPlacement="start"
            />

            {showLinks && (
              <Button size="small" color="inherit" onClick={this.openAppDialog}>
                Mobile Apps
              </Button>
            )}

            {/* <Button
              size="small"
              color="inherit"
              onClick={this.props.handleAlertsDrawerToggle}
            >
              Live Alerts
            </Button>  */}

            <LiveAlerts
              buttonTitle={
                languageJson[selectedLanguage].common.liveAlertsButtonTitle
              }
              handleAlertsDrawerToggle={this.props.handleAlertsDrawerToggle}
              isAlertsDrawerOpen={this.props.isAlertsDrawerOpen}
              handleButtonClicked={this.props.handleButtonClicked}
              isButtonClicked={this.props.isButtonClicked}
              alertsViewed={this.props.alertsViewed}
              alertsViewedTrue={this.props.alertsViewedTrue}
              alertsViewedFalse={this.props.alertsViewedFalse}
              handleAlertsDrawerToggleFalse={
                this.props.handleAlertsDrawerToggleFalse
              }
              alertsCount={this.props.alertsCount}
              updateAlertsCount={this.props.updateAlertsCount}
              alerts={this.props.alerts}
              setAlerts={this.props.setAlerts}
            ></LiveAlerts>

            {showLinks && (
              <Tooltip title="Download User Manual">
                <IconButton
                  color="inherit"
                  component="a"
                  href={USER_MANUAL_DOWNLOAD_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <HelpIcon />
                </IconButton>
              </Tooltip>
            )}

            {!isDemoLogin && (
              <React.Fragment>
                <Tooltip title="Account">
                  <IconButton onClick={this.openAccountMenu} color="inherit">
                    <AccountCircleIcon />
                  </IconButton>
                </Tooltip>

                <AccountMenu
                  popoverOptions={
                    languageJson[selectedLanguage].common.accountMenu
                  }
                  isAccountMenuOpen={this.state.isAccountMenuOpen}
                  anchorEl={this.state.anchorEl}
                  onClose={this.closeAccountMenu}
                />
              </React.Fragment>
            )}
          </CustomToolbar>
        </AppBar>

        {showLinks && (
          <AppStoreDialog
            isAppDialogOpen={this.state.isAppDialogOpen}
            closeAppDialog={this.closeAppDialog}
          />
        )}
      </div>
    )
  }
}

NavBar.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(withLanguage(NavBar))
