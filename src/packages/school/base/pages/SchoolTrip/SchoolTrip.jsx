import React, { Component } from 'react'
import SchoolBusTripModule from '@zeliot/school/base/modules/SchoolBusTripModule'

import { withStyles, Grid, Typography, Divider } from '@material-ui/core'

const style = theme => ({
  root: {
    padding: theme.spacing(3)
  }
})

class SchoolTrip extends Component {
  render() {
    const { classes } = this.props

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
                  Trips
                </Typography>
              </Grid>
            </Grid>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <SchoolBusTripModule />
            </Grid>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(style)(SchoolTrip)
