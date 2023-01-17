import React from 'react'
import { Grid, Typography, Divider, makeStyles } from '@material-ui/core'
import { ArrowUpward } from '@material-ui/icons'

import Trips from '@zeliot/common/static/svg/analytics/trip-analytics/trips.svg'
import PopularStoppages from '@zeliot/common/static/svg/analytics/trip-analytics/popular-stoppages.svg'
import HighestPenalties from '@zeliot/common/static/svg/analytics/trip-analytics/highest-penalties.svg'

import RoundedPaper from '@zeliot/common/ui/RoundedPaper/RoundedPaper'
import PieChart from '@zeliot/common/ui/Charts/PieChart/PieChart'

import AnalyticCard from '@zeliot/core/base/modules/AnalyticsCards/AnalyticCard'
import AnalyticGroupHeader from '@zeliot/core/base/modules/AnalyticsCards/AnalyticGroupHeader'

const Footer = (
  <>
    <ArrowUpward style={{ color: '#6ad074' }} />
    <Typography>50% increase since last day</Typography>
  </>
)

const useStyles = makeStyles(theme => ({
  cardsContainer: {
    margin: `${theme.spacing(2)}px 0`
  },
  paperContainer: {
    padding: theme.spacing(2)
  }
}))

function TripAnalytics() {
  const [isHidden, setIsHidden] = React.useState(true)

  const classes = useStyles()

  return (
    <Grid item xs={12} container>
      <Grid item xs={12}>
        <AnalyticGroupHeader
          onToggle={() => setIsHidden(isHidden => !isHidden)}
          open={!isHidden}
        >
          Trip Analytics
        </AnalyticGroupHeader>
      </Grid>

      <Grid item xs={12}>
        <Divider />
      </Grid>

      {!isHidden && (
        <Grid
          item
          xs={12}
          container
          spacing={2}
          className={classes.cardsContainer}
        >
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticCard
              header="Trips"
              image={Trips}
              value="264"
              footer={Footer}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <RoundedPaper className={classes.paperContainer}>
              <Grid container>
                <Grid item xs={12} sm={6}>
                  <img
                    src={PopularStoppages}
                    alt="Popular Stoppages"
                    height={150}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" color="primary">
                    Most Popular Stoppages
                  </Typography>

                  <ul>
                    <li>Place 1</li>
                    <li>Place 2</li>
                    <li>Place 3</li>
                    <li>Place 4</li>
                    <li>Place 5</li>
                  </ul>
                </Grid>
              </Grid>
            </RoundedPaper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <RoundedPaper className={classes.paperContainer}>
              <Grid container justify="center">
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" align="center">
                    Terrain Profile
                  </Typography>
                </Grid>

                <Grid item>
                  <PieChart
                    data={[
                      {
                        id: 1,
                        value: 1,
                        label: 'City'
                      },
                      {
                        id: 2,
                        value: 1,
                        label: 'Sub-urban'
                      },
                      {
                        id: 3,
                        value: 2,
                        label: 'Highways'
                      }
                    ]}
                    height={100}
                  />
                </Grid>
              </Grid>
            </RoundedPaper>
          </Grid>

          <Grid item xs={12} sm={6}>
            <RoundedPaper className={classes.paperContainer}>
              <Grid container>
                <Grid item xs={12} sm={6}>
                  <img
                    src={HighestPenalties}
                    alt="Highest Penalties"
                    height={150}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" color="primary">
                    Vehicles with highest Penalties
                  </Typography>

                  <ul>
                    <li>KA-03-TU-7291</li>
                    <li>KA-04-NI-2849</li>
                    <li>KA-18-MS-473O</li>
                    <li>KA-20-UA-9236</li>
                    <li>KA-32-HS-1738</li>
                  </ul>
                </Grid>
              </Grid>
            </RoundedPaper>
          </Grid>
        </Grid>
      )}
    </Grid>
  )
}

export default TripAnalytics
