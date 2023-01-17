/**
 * Trips page
 * @module Trips
 */

import React, { Component } from 'react'
import { Link, Switch } from 'react-router-dom'
import { PrivateRoute } from '@zeliot/common/router'
import TripsConfigurationModule from '@zeliot/core/base/modules/TripsModule'
import TripsDashboard from '@zeliot/core/base/modules/TripsDashboard'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'
import {
  withStyles,
  ThemeProvider,
  Grid,
  Typography,
  Divider,
  Button,
} from '@material-ui/core'

const style = (theme) => ({
  root: {
    padding: theme.spacing(3),
  },
})

/**
 * Trips page component
 */
class Trips extends Component {
  render() {
    const { classes, selectedLanguage } = this.props

    return (
      <div className={classes.root}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container justify="space-between" alignItems="center">
              <Grid item>
                <Typography
                  variant="h5"
                  className={classes.textLeft}
                  gutterBottom
                >
                  {languageJson[selectedLanguage].tripsPage.pageTitle}
                </Typography>
              </Grid>

              <Grid>
                <ColorButton
                  component={Link}
                  variant="contained"
                  color="primary"
                  to="/home/trips/create"
                >
                  {
                    languageJson[selectedLanguage].tripsPage
                      .createTripsButtonTitle
                  }
                </ColorButton>
              </Grid>
            </Grid>
            <br />
            <Divider />
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={2}>
              <TripsDashboard />
            </Grid>
          </Grid>
        </Grid>
      </div>
    )
  }
}

const WrappedTrips = withStyles(style)(withLanguage(Trips))

export default () => (
  <Switch>
    <PrivateRoute
      exact
      path="/home/trips"
      render={(props) => <WrappedTrips {...props} />}
    />
    <PrivateRoute
      exact
      path="/home/trips/create"
      render={(props) => <TripsConfigurationModule {...props} />}
    />
  </Switch>
)
