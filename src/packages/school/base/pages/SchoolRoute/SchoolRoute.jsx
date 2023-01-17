import React, { Component } from 'react'
import SchoolBusRoutingModule from '@zeliot/school/base/modules/SchoolBusRoutingModule'

import { withStyles, Grid, Typography, Divider } from '@material-ui/core'

const style = theme => ({
  root: {
    padding: theme.spacing(3)
  }
})

class SchoolRoute extends Component {
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
                  Routes
                </Typography>
              </Grid>
            </Grid>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <SchoolBusRoutingModule />
            </Grid>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(style)(SchoolRoute)
