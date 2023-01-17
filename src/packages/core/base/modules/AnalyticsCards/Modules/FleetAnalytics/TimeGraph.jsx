import React from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import { Modal, Grid, Typography, makeStyles, colors } from '@material-ui/core'
import RoundedPaper from '@zeliot/common/ui/RoundedPaper'
import Loader from '@zeliot/common/ui/Loader/Loader'
import LineChart from '@zeliot/common/ui/Charts/LineChart'

const useModalStyles = makeStyles(theme => ({
  paper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'auto',
    maxWidth: '100%',
    maxHeight: 600,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2),
    outline: 'none'
  },
  bestTitle: {
    color: colors.green[500]
  },
  worstTitle: {
    color: colors.red[500]
  },
  highlightsItem: {
    padding: theme.spacing(2)
  },
  verticalDivider: {
    height: '50%',
    width: 1,
    background: 'black',
    margin: 'auto'
  },
  verticalDividerContainer: {
    display: 'flex'
  }
}))

function TimeGraph(props) {
  const { open, onClose, timeRange, metric, title, description } = props

  const classes = useModalStyles()

  return (
    <Modal open={open} onBackdropClick={onClose} onEscapeKeyDown={onClose}>
      <RoundedPaper className={classes.paper}>
        <Typography variant="h5" color="primary" align="center">
          {title}
        </Typography>

        <Typography align="center">{description}</Typography>

        <Query
          query={GET_FLEET_ANALYTICS_DETAIL}
          variables={{ timeRange, metric }}
        >
          {({ loading, error, data }) => {
            if (loading) return <Loader />

            if (error) {
              return <Typography variant="h6">Error Loading</Typography>
            }

            const {
              fleetAnalyticsDetail: { timeGraph }
            } = data

            return (
              <Grid container justify="center">
                {timeGraph && (
                  <Grid item>
                    <LineChart
                      data={timeGraph.map(({ value }, index) => ({
                        id: index,
                        x: index,
                        y: value
                      }))}
                      axes={{
                        xAxis: {
                          title: 'Time of Day',
                          tickFormat: get12HourTime
                        },
                        yAxis: {
                          title: 'No. of Vehicles'
                        }
                      }}
                      hint={{
                        formatter: (x, y) =>
                          `${y} vehicles at ${get12HourTime(x)}`
                      }}
                    />
                  </Grid>
                )}
              </Grid>
            )
          }}
        </Query>
      </RoundedPaper>
    </Modal>
  )
}

const GET_FLEET_ANALYTICS_DETAIL = gql`
  query($metric: Metric!, $timeRange: TimeRange!) {
    fleetAnalyticsDetail: getFleetAnalyticsDetail(
      metric: $metric
      timeRange: $timeRange
    ) {
      timeGraph {
        value
      }
    }
  }
`

function getTimeSuffix(value) {
  return value >= 12 ? 'PM' : 'AM'
}

function get12HourTime(value) {
  return value > 12
    ? `${value - 12}${getTimeSuffix(value)}`
    : `${value === 0 ? 12 : value}${getTimeSuffix(value)}`
}

export default TimeGraph
