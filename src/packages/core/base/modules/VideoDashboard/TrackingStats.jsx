import React, { Fragment } from 'react'
import { Typography, Paper, Grid, makeStyles } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  trackingStatsCard: {
    textAlign: 'center',
    margin: theme.spacing(2)
  }
}))

function TrackingStats(props) {
  const { stats, vehicleNumber } = props
  const classes = useStyles()

  return (
    <div className={classes.trackingStatsCard}>
      <Paper square elevation={0}>
        <Typography
          variant="button"
          style={{ marginBottom: 10 }}
          color="secondary"
        >
          {vehicleNumber} Snapshot
        </Typography>
        {stats && (
          <Grid container spacing={2} justify="center">
            {stats.items.map(item => (
              <Fragment key={item.title}>
                {item.data != null ? (
                  <Grid item>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      {item.title}
                    </Typography>

                    <Typography variant="subtitle1" color="textPrimary">
                      {item.data}
                    </Typography>
                  </Grid>
                ) : null}
              </Fragment>
            ))}
          </Grid>
        )}
      </Paper>
    </div>
  )
}

export default TrackingStats
