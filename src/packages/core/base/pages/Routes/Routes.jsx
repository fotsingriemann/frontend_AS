import React, { Component } from 'react'
import { Link, Switch } from 'react-router-dom'
import { PrivateRoute } from '@zeliot/common/router'
import RoutesModule from '@zeliot/core/base/modules/RoutesModule'
import RoutesDashboard from '@zeliot/core/base/modules/RoutesDashboard'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'
import {
  withStyles,
  Grid,
  Typography,
  Divider,
  Button,
} from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

const style = (theme) => ({
  root: {
    padding: theme.spacing(3),
  },
})

class Routes extends Component {
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
                  {languageJson[selectedLanguage].routesPage.pageTitle}
                </Typography>
              </Grid>
              <Grid>
                <ColorButton
                  component={Link}
                  variant="contained"
                  color="primary"
                  to="/home/routes/create"
                >
                  {
                    languageJson[selectedLanguage].routesPage
                      .createRoutesButtonTitle
                  }
                </ColorButton>
              </Grid>
            </Grid>
            <br />
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <RoutesDashboard />
            </Grid>
          </Grid>
        </Grid>
      </div>
    )
  }
}

const WrappedRoutes = withStyles(style)(withLanguage(Routes))

export default () => (
  <Switch>
    <PrivateRoute
      exact
      path="/home/routes"
      render={(props) => <WrappedRoutes {...props} />}
    />
    <PrivateRoute
      exact
      path="/home/routes/create"
      render={(props) => <RoutesModule {...props} />}
    />
  </Switch>
)
