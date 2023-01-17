import React from 'react'
import {
  Grid,
  Typography,
  Divider,
  Button,
  makeStyles,
} from '@material-ui/core'

import RoundedPaper from '@zeliot/common/ui/RoundedPaper/RoundedPaper'
import PieChart from '@zeliot/common/ui/Charts/PieChart/PieChart'

import CheckEngine from '@zeliot/common/static/svg/analytics/diagnostic-analytics/check-engine-light.svg'
import FleetHealth from '@zeliot/common/static/svg/analytics/diagnostic-analytics/fleet-health.svg'

import AnalyticCard from '@zeliot/core/base/modules/AnalyticsCards/AnalyticCard'
import AnalyticGroupHeader from '@zeliot/core/base/modules/AnalyticsCards/AnalyticGroupHeader'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

const useStyles = makeStyles((theme) => ({
  cardsContainer: {
    margin: `${theme.spacing(2)}px 0`,
  },
  paperContainer: {
    padding: theme.spacing(2),
  },
  stretch: {
    flex: 1,
  },
  table: {
    width: '100%',
    padding: `${theme.spacing(2)}px 0`,
  },
  tableData: {
    textAlign: 'center',
  },
}))

function TripAnalytics() {
  const [isHidden, setIsHidden] = React.useState(true)

  const classes = useStyles()

  return (
    <Grid item xs={12} container>
      <Grid item xs={12}>
        <AnalyticGroupHeader
          onToggle={() => setIsHidden((isHidden) => !isHidden)}
          open={!isHidden}
        >
          Diagnostic Analytics
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
          <Grid item xs={12} md={6}>
            <RoundedPaper className={classes.paperContainer}>
              <Grid container>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" align="center">
                    Diagnostic Trouble Codes
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <table className={classes.table}>
                    <tbody>
                      {Array(5)
                        .fill(0)
                        .map((_, index) => (
                          <tr key={index}>
                            <td className={classes.tableData}>KA-01-TY-7492</td>
                            <td className={classes.tableData}>Critical</td>
                            <td className={classes.tableData}>
                              July 4th 2019, 01:45 PM
                            </td>
                            <td className={classes.tableData}>
                              Engine Failure
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </Grid>

                <Grid item xs={12} container justify="center">
                  <Grid item>
                    <ColorButton variant="contained" color="primary">
                      Live OBD Feed
                    </ColorButton>
                  </Grid>
                </Grid>
              </Grid>
            </RoundedPaper>
          </Grid>

          <Grid item xs={12} md={6} container spacing={2}>
            <Grid item xs={12} md={6}>
              <RoundedPaper className={classes.paperContainer}>
                <Grid container justify="center">
                  <Grid item xs={12}>
                    <Typography variant="h6" color="primary" align="center">
                      Gear Distribution
                    </Typography>
                  </Grid>

                  <Grid item>
                    <PieChart
                      data={[
                        {
                          id: 1,
                          label: '1st Gear',
                          value: 7,
                        },
                        {
                          id: 2,
                          label: '2nd Gear',
                          value: 8,
                        },
                        {
                          id: 3,
                          label: '3rd Gear',
                          value: 17,
                        },
                        {
                          id: 4,
                          label: '4th Gear',
                          value: 38,
                        },
                        {
                          id: 5,
                          label: '5th Gear',
                          value: 29,
                        },
                        {
                          id: 6,
                          label: 'Reverse Gear',
                          value: 1,
                        },
                      ]}
                    />
                  </Grid>
                </Grid>
              </RoundedPaper>
            </Grid>

            <Grid item xs={12} md={6}>
              <AnalyticCard
                header="Fleet Health"
                image={FleetHealth}
                value="12"
                footer="This is calculated based on average health of fleet"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <AnalyticCard
                header="Check Engine Light(MIL)"
                image={CheckEngine}
                value="59"
                footer="Number of Vehicles with Check Engine Light(ON)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <RoundedPaper className={classes.paperContainer}>
                <Grid container>
                  <Grid item xs={12}>
                    <Typography variant="h6" color="primary" align="center">
                      Service Reminder
                    </Typography>
                  </Grid>

                  <Grid item xs={12} container>
                    <Grid item xs={12}>
                      Due Soon
                    </Grid>

                    <Grid item xs={12}>
                      Overdue
                    </Grid>
                  </Grid>
                </Grid>
              </RoundedPaper>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Grid>
  )
}

export default TripAnalytics
