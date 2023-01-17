import React from 'react'
import {
  Typography,
  Divider,
  Grid,
  Switch,
  makeStyles
} from '@material-ui/core'
import RoundedPaper from '@zeliot/common/ui/RoundedPaper'

const useStyles = makeStyles({
  trackingStatsCard: {
    textAlign: 'left',
    margin: 15
  }
})

function TrackingStats(props) {
  const {
    stats,
    snapToRoad,
    onSnapToRoadChange,
    isReplayActive,
    vehicleNumber
  } = props

  const classes = useStyles()

  return (
    <div className={classes.trackingStatsCard}>
      <RoundedPaper elevation={0}>
        {!isReplayActive && (
          <Grid container spacing={1} justify="flex-start">
            <Grid item xs={12}>
              <Grid container justify="space-around" alignItems="center">
                <Grid item sm={8}>
                  <Typography className={classes.title} color="textSecondary">
                    {'Snap to road is '}
                    {snapToRoad ? 'enabled' : 'disabled'}
                  </Typography>
                </Grid>

                <Grid item sm={4}>
                  <Switch
                    color="primary"
                    value={snapToRoad}
                    onChange={onSnapToRoadChange}
                    disabled={isReplayActive}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}

        <Typography
          variant="button"
          style={{ marginBottom: 10 }}
          color="primary"
        >
          Vehicle {vehicleNumber}
        </Typography>

        {stats &&
          stats.items.map(item => {
            return item.data != null ? (
              <Grid item xs={12} key={item.title}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {item.title}
                </Typography>

                <Typography variant="subtitle1" color="textPrimary">
                  {item.data}
                </Typography>
                <Divider />
              </Grid>
            ) : null
          })}
      </RoundedPaper>
    </div>
  )
}

export default TrackingStats
