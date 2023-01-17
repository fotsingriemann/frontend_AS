/** @todo Refactor and simplify data flow and component organisation */
/**
 * @module AlertsDashboard/AlertsConfiguration
 * @summary AlertsConfiguration module sets up the AlertsConfiguration component
 */

import React, { Component } from 'react'
import { withApollo } from 'react-apollo'
import {
  Grid,
  Typography,
  withStyles,
  Select,
  MenuItem,
  Tabs,
  Tab,
  InputLabel,
  AppBar,
  FormControl,
} from '@material-ui/core'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import getLoginId from '@zeliot/common/utils/getLoginId'
import { GET_ALERTS_LIST } from './queries'
import TableWrapper from './TableWrapper'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

const style = (theme) => ({
  root: {
    width: '100%',
    padding: theme.spacing(2),
    flexGrow: 1,
  },
  selectMenuPaper: {
    maxHeight: theme.spacing(40),
  },
  tablePlaceholderPaper: {
    minHeight: theme.spacing(20),
  },
  fullHeight: {
    height: '100%',
    padding: theme.spacing(4),
  },
  formControl: {
    minWidth: 120,
  },
  tabDiv: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
})

/**
 * @summary AlertsConfiguration component renders the page for configuring alerts
 */
class AlertsConfiguration extends Component {
  /**
   * @property {string} selectedAlert The selected alert
   * @property {object[]} alerts The list of alerts
   * @property {'ENABLED'|'DISABLED'} mode The mode of the configurations
   */
  state = {
    selectedAlert: '',
    alerts: [],
    mode: 'ENABLED',
  }

  /**
   * @param {object} e The React.SyntheticEvent object
   * @summary Generic input event handler
   */
  handleChange = (e) => this.setState({ [e.target.name]: e.target.value })

  /**
   * @callback
   * @summary Handles tab change, and changes the mode
   */
  handleTabChange = async (event, value) => this.setState({ mode: value })

  /**
   * @function
   * @summary Fetches the list of alerts for a client
   */
  getAlertsList = async () => {
    const response = await this.props.client.query({
      query: GET_ALERTS_LIST,
      variables: {
        loginId: getLoginId(),
      },
    })

    if (response.data && response.data.alerts) {
      // console.log('alerts list', response.data.alerts)

      const alerts = response.data.alerts.map((alert) => ({
        name: alert.alert.name,
        type: alert.alert.type,
        description: alert.alert.description,
        hasValue: alert.alert.hasValue,
        valueType: alert.alert.valueType,
      }))

      this.setState({ alerts })
    }
  }

  /**
   * @summary React lifecycle method that executes after a component mounts
   */
  componentDidMount() {
    this.getAlertsList()
  }

  render() {
    const { classes, selectedLanguage } = this.props

    return (
      <div className={classes.root}>
        <Grid container className="pageGrid" spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5">
              {
                languageJson[selectedLanguage].alertsPage.configureAlertsPage
                  .pageTitle
              }
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} md={3} sm={12}>
                <FormControl required fullWidth className={classes.formControl}>
                  <InputLabel htmlFor="alert-select">Select Alert</InputLabel>

                  <Select
                    value={this.state.selectedAlert}
                    onChange={this.handleChange}
                    inputProps={{
                      name: 'selectedAlert',
                      id: 'alert-select',
                    }}
                    MenuProps={{
                      classes: {
                        paper: classes.selectMenuPaper,
                      },
                    }}
                    autoWidth
                  >
                    {this.state.alerts.map((alert) => (
                      <MenuItem value={alert.type} key={alert.type}>
                        {alert.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item md={3} />

              <Grid item xs={12} md={6}>
                <Typography variant="body2" gutterBottom>
                  {
                    /* eslint-disable indent */
                    this.state.selectedAlert
                      ? this.state.alerts.find(
                          (alert) => alert.type === this.state.selectedAlert
                        ).description
                      : ''
                    /* eslint-enable-indent */
                  }
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <div className={this.props.classes.tabDiv}>
              <AppBar position="static" color="secondary">
                <Tabs
                  value={this.state.mode}
                  onChange={this.handleTabChange}
                  indicatorColor="primary"
                  textColor="inherit"
                  variant="fullWidth"
                >
                  <Tab
                    label={
                      languageJson[selectedLanguage].alertsPage
                        .configureAlertsPage.enabledVehicleTabTitle
                    }
                    value="ENABLED"
                  />
                  <Tab
                    label={
                      languageJson[selectedLanguage].alertsPage
                        .configureAlertsPage.disabledVehicleTabTitle
                    }
                    value="DISABLED"
                  />
                </Tabs>
              </AppBar>

              <TableWrapper
                {...this.props}
                selectedAlert={this.state.selectedAlert}
                mode={this.state.mode}
                alerts={this.state.alerts}
              />
            </div>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withApollo(
  withLanguage(withSharedSnackbar(withStyles(style)(AlertsConfiguration)))
)
