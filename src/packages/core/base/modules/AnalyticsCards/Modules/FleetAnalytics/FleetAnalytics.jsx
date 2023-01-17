import React from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import { Grid, Typography, Divider, makeStyles } from '@material-ui/core'

import Loader from '@zeliot/common/ui/Loader/Loader'

import AnalyticCard from '@zeliot/core/base/modules/AnalyticsCards/AnalyticCard'
import AnalyticGroupHeader from '@zeliot/core/base/modules/AnalyticsCards/AnalyticGroupHeader'

import DetailsTable from './DetailsTable'
import TimeGraph from './TimeGraph'
import fleetAnalyticsConfig from './fleetAnalyticsConfig'
import DescriptionFooter from './DescriptionFooter'
import ChangeFooter from './ChangeFooter'

import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

const useStyles = makeStyles((theme) => ({
  cardsContainer: {
    margin: `${theme.spacing(2)}px 0`,
  },
}))

function FleetAnalytics(props) {
  const [isHidden, setIsHidden] = React.useState(false)

  const [metricsId, setMetricsId] = React.useState(null)

  const classes = useStyles()

  const { analyticsPeriod, selectedLanguage } = props

  return (
    <Grid item xs={12} container>
      <Grid item xs={12}>
        <AnalyticGroupHeader
          onToggle={() => setIsHidden((isHidden) => !isHidden)}
          open={!isHidden}
        >
          {languageJson[selectedLanguage].analyticsPage.fleetAnalyticsUsage}
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
          <Query
            query={GET_FLEET_ANALYTICS}
            variables={{ period: analyticsPeriod }}
          >
            {({ loading, error, data }) => {
              if (loading) return <Loader />
              if (error) {
                return (
                  <Typography variant="h4" color="error" align="center">
                    Error loading Fleet Analytics
                  </Typography>
                )
              }

              if (data && data.fleetAnalytics == null) {
                return (
                  <Typography variant="h4" align="center">
                    No Data Available !!!
                  </Typography>
                )
              } else {
                const Cards = Object.values(fleetAnalyticsConfig)
                  .filter(
                    ({ hideInTimePeriod }) =>
                      !hideInTimePeriod.includes(analyticsPeriod)
                  )
                  .map((analytic, index) => {
                    const value = data.fleetAnalytics[analytic.value].value
                    let footer

                    if (analytic.showChange) {
                      const changePercentage =
                        data.fleetAnalytics[analytic.value].change.percentage

                      footer = (
                        <ChangeFooter
                          changePercentage={changePercentage}
                          analyticsPeriod={analyticsPeriod}
                        />
                      )
                    } else {
                      footer = (
                        <DescriptionFooter description={analytic.description} />
                      )
                    }

                    /* eslint-disable indent */

                    const cardValue = analytic.formatValue
                      ? analytic.formatValue(Number(value))
                      : value === null
                      ? 'N/A'
                      : value

                    /* eslint-enable indent */

                    return (
                      <Grid key={index} item xs={12} sm={6} md={3}>
                        <AnalyticCard
                          header={analytic.header}
                          footer={footer}
                          image={analytic.image}
                          value={cardValue}
                          isClickable={Boolean(analytic.details)}
                          onClick={() => setMetricsId(analytic.id)}
                        />
                        {console.log(cardValue)}
                      </Grid>
                    )
                  })

                const modalTitle = metricsId
                  ? fleetAnalyticsConfig[metricsId].header
                  : null

                const openDetails = metricsId
                  ? fleetAnalyticsConfig[metricsId].details
                  : null

                const modalDescription = metricsId
                  ? fleetAnalyticsConfig[metricsId].detailsDescription
                  : null

                return (
                  <React.Fragment>
                    {Cards}

                    <DetailsTable
                      open={openDetails === 'TABLE'}
                      onClose={() => setMetricsId(null)}
                      metric={metricsId}
                      timeRange={analyticsPeriod}
                      title={modalTitle}
                      description={modalDescription}
                    />

                    <TimeGraph
                      open={openDetails === 'TIME_GRAPH'}
                      onClose={() => setMetricsId(null)}
                      metric={metricsId}
                      timeRange={analyticsPeriod}
                      title={modalTitle}
                      description={modalDescription}
                    />
                  </React.Fragment>
                )
              }
            }}
          </Query>
        </Grid>
      )}
    </Grid>
  )
}

const GET_FLEET_ANALYTICS = gql`
  query getFleetAnalytics($period: TimeRange!) {
    fleetAnalytics: getFleetAnalytics(timeRange: $period) {
      fleetDistance {
        value
        change {
          percentage
        }
      }

      runningTime {
        value
        change {
          percentage
        }
      }

      idlingTime {
        value
        change {
          percentage
        }
      }

      haltTime {
        value
        change {
          percentage
        }
      }

      idleToRunRatio {
        value
      }

      haltToRunRatio {
        value
      }

      fleetUtilization {
        value
      }

      averageFleetScore {
        value
      }

      penalties {
        value
      }

      mostNoGPSVehicle {
        value
      }

      mostOfflineVehicle {
        value
      }

      mostRunningVehicle {
        value
      }

      mostIdleVehicle {
        value
      }

      mostHaltedVehicle {
        value
      }

      mostIdlingTime {
        value
      }

      mostHaltedTime {
        value
      }

      mostRunningTime {
        value
      }

      totalNumberOfGroups {
        value
      }
    }
  }
`

export default withLanguage(FleetAnalytics)
