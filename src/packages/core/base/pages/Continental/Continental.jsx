import React, { Component } from 'react'
import { Typography, withStyles, Grid, Divider } from '@material-ui/core'
import ContinentalDashboard from '@zeliot/core/base/modules/ContinentalDashboard'

const styles = theme => ({
  root: {
    padding: theme.spacing(3)
  },
  textLeft: {
    textAlign: 'left'
  }
})

class Continental extends Component {
  render() {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item>
                <Typography
                  variant="h5"
                  className={classes.textLeft}
                  gutterBottom
                >
                  TPMS
                </Typography>
              </Grid>
            </Grid>
            <br />
            <Divider />
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={2}>
              <ContinentalDashboard />
            </Grid>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(styles)(Continental)
