import React, { Component } from 'react'
import SummaryDashboard from '@zeliot/core/base/modules/SummaryDashboard'

import { withStyles, Grid, Typography, Divider } from '@material-ui/core'

const style = theme => ({
  root: {
    padding: theme.spacing(3)
  }
})

export default withStyles(style)(
  class Summary extends Component {
    render() {
      const { classes } = this.props
      return (
        <div className={classes.root}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Grid container justify="space-between" alignItems="center">
                <Grid item>
                  <Typography variant="h5" gutterBottom>
                    Fleet Summary
                  </Typography>
                </Grid>
              </Grid>
              <br />
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <SummaryDashboard />
              </Grid>
            </Grid>
          </Grid>
        </div>
      )
    }
  }
)
