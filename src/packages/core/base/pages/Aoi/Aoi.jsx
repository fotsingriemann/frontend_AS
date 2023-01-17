import React, { Component } from 'react'
import { Link, Switch } from 'react-router-dom'
import { PrivateRoute } from '@zeliot/common/router'
import AoiModule from '@zeliot/core/base/modules/AoiModule'
import AoiDashboard from '@zeliot/core/base/modules/AoiDashboard'
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

class Aoi extends Component {
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
                  {languageJson[selectedLanguage].aoiPage.pageTitle}
                </Typography>
              </Grid>
              <Grid>
                <ColorButton
                  component={Link}
                  variant="contained"
                  color="primary"
                  to="/home/AOI/create"
                >
                  {languageJson[selectedLanguage].aoiPage.createAoiButtonTitle}
                </ColorButton>
              </Grid>
            </Grid>
            <br />
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <AoiDashboard />
            </Grid>
          </Grid>
        </Grid>
      </div>
    )
  }
}

const WrappedAoi = withStyles(style)(withLanguage(Aoi))

const WrappedAoiModule = withStyles(style)(AoiModule)

export default () => (
  <Switch>
    <PrivateRoute
      exact
      path="/home/AOI"
      render={(props) => <WrappedAoi {...props} />}
    />
    <PrivateRoute
      exact
      path="/home/AOI/create"
      render={(props) => <WrappedAoiModule {...props} />}
    />
  </Switch>
)
