import React, { Fragment } from 'react'
import {
  Typography,
  Divider,
  Grid,
  Switch,
  makeStyles,
} from '@material-ui/core'
import RoundedPaper from '@zeliot/common/ui/RoundedPaper'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

const useStyles = makeStyles({
  trackingStatsCard: {
    textAlign: 'left',
    margin: 15,
    // backgroundColor:'red',
    // height:1000
  },
})

function TrackingStats(props) {
  const {
    stats,
    snapToRoad,
    onSnapToRoadChange,
    isReplayActive,
    vehicleNumber,
    selectedLanguage,
    driverName,
    driverContactNo,
    driverImage,
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
                    {snapToRoad
                      ? languageJson[selectedLanguage].mainDashboardPage
                          .snapToRoad.enabled
                      : languageJson[selectedLanguage].mainDashboardPage
                          .snapToRoad.disabled}
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
          stats.items.map((item) => (
            <Fragment key={item.title}>
              {item.title === 'Driver Name' ? (
                <div>
                  {item.data != null ? (
                    <Grid item xs={12} style={{ marginTop: 10 }}>
                      <Typography
                        variant="button"
                        // style={{ paddingBottom: 100 }}
                        color="primary"
                      >
                        Driver Information
                      </Typography>
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

                      <Divider />
                    </Grid>
                  ) : null}
                </div>
              ) : (
                <div>
                  {item.data != null ? (
                    <Grid item xs={12}>
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

                      <Divider />
                    </Grid>
                  ) : null}
                </div>
              )}
            </Fragment>
          ))}
      </RoundedPaper>

      {driverName && driverContactNo && driverImage && (
        <Grid item xs={12} style={{ marginTop: 10 }}>
          <Typography
            variant="button"
            // style={{ paddingBottom: 100 }}
            color="primary"
          >
            Driver Information
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Name: <Typography color="textPrimary">{driverName}</Typography>
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Contact No.:{' '}
            <Typography color="textPrimary">{driverContactNo}</Typography>
          </Typography>
          <img
            style={{
              height: '180px',
              backgroundImage: 'cover',
            }}
            src={`data:image/png;base64,${driverImage.slice(2, -1)}`}
          />
        </Grid>
      )}
    </div>
  )
}

export default withLanguage(TrackingStats)
