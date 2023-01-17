import React, { Component } from 'react'
import ActivityDashboard from '@zeliot/core/base/modules/ActivityDashboard'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'
import { withStyles, Grid, Typography, Divider } from '@material-ui/core'

const style = (theme) => ({
  root: {
    padding: theme.spacing(3),
  },
})

class Activity extends Component {
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
                  {languageJson[selectedLanguage].activityPage.pageTitle}
                </Typography>
              </Grid>
            </Grid>
            <br />
            <Divider />
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={2}>
              <ActivityDashboard />
            </Grid>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(style)(withLanguage(Activity))
