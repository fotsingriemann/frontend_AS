import React from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import {
  Modal,
  Grid,
  Typography,
  Divider,
  makeStyles,
  colors
} from '@material-ui/core'
import RoundedPaper from '@zeliot/common/ui/RoundedPaper'
import ExtendedTable from './ExtendedTable'
import Loader from '@zeliot/common/ui/Loader/Loader'
import getFormattedDuration from '@zeliot/common/utils/time/getFormattedDuration'

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

function DetailsTable(props) {
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
              fleetAnalyticsDetail: { highlights, details }
            } = data

            return (
              <Grid container>
                {highlights && (
                  <Grid item xs={12}>
                    <Grid container justify="center">
                      <Grid item className={classes.highlightsItem}>
                        <Typography
                          variant="h6"
                          className={classes.bestTitle}
                          align="center"
                        >
                          Best performer
                        </Typography>
                        <Typography variant="subtitle1" align="center">
                          {highlights.best.vehicleNumber}
                        </Typography>
                      </Grid>

                      <Grid item className={classes.verticalDividerContainer}>
                        <div className={classes.verticalDivider} />
                      </Grid>

                      <Grid item className={classes.highlightsItem}>
                        <Typography
                          variant="h6"
                          className={classes.worstTitle}
                          align="center"
                        >
                          Worst performer
                        </Typography>
                        <Typography variant="subtitle1" align="center">
                          {highlights.worst.vehicleNumber}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item xs={12}>
                  <ExtendedTable data={getTableData(metric, details)} />
                </Grid>
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
      highlights: highlight {
        best {
          vehicleNumber
          value
          change {
            percentage
          }
        }

        worst {
          vehicleNumber
          value
          change {
            percentage
          }
        }
      }

      details {
        vehicleNumber
        value
        change {
          percentage
        }
      }
    }
  }
`

function getTableData(metric, data) {
  switch (metric) {
    case 'FLEET_DISTANCE':
      return {
        head: ['Vehicle Number', 'Distance (kms)', 'Change (%)'],
        body: data.map(row => [
          row.vehicleNumber,
          Number(row.value),
          row.change.percentage
        ])
      }

    case 'RUNNING_TIME':
      return {
        head: ['Vehicle Number', 'Running Time', 'Change (%)'],
        body: data.map(row => [
          row.vehicleNumber,
          getFormattedDuration(Number(row.value)),
          row.change.percentage
        ])
      }

    case 'IDLING_TIME':
      return {
        head: ['Vehicle Number', 'Idling Time', 'Change (%)'],
        body: data.map(row => [
          row.vehicleNumber,
          getFormattedDuration(Number(row.value)),
          row.change.percentage
        ])
      }

    case 'HALT_TIME':
      return {
        head: ['Vehicle Number', 'Halt Time', 'Change (%)'],
        body: data.map(row => [
          row.vehicleNumber,
          getFormattedDuration(Number(row.value)),
          row.change.percentage
        ])
      }

    case 'FLEET_UTILIZATION':
      return {
        head: ['Vehicle Number', 'Status'],
        body: data.map(row => [
          row.vehicleNumber,
          row.value ? 'Utilized' : 'Unutilized'
        ])
      }

    case 'FLEET_SCORE':
      return {
        head: ['Vehicle Number', 'Vehicle Score'],
        body: data.map(row => [row.vehicleNumber, Number(row.value)])
      }

    case 'MOST_NO_GPS_VEHICLE':
      return {
        head: ['Vehicle Number', 'No GPS Count'],
        body: data.map(row => [row.vehicleNumber, Number(row.value)])
      }

    case 'MOST_OFFLINE_VEHICLE':
      return {
        head: ['Vehicle Number', 'Offline Count'],
        body: data.map(row => [row.vehicleNumber, Number(row.value)])
      }

    case 'MOST_RUNNING_VEHICLE':
      return {
        head: ['Vehicle Number', 'Running Time', 'Change (%)'],
        body: data.map(row => [
          row.vehicleNumber,
          getFormattedDuration(Number(row.value)),
          row.change.percentage
        ])
      }

    case 'MOST_IDLE_VEHICLE':
      return {
        head: ['Vehicle Number', 'Idling Time', 'Change (%)'],
        body: data.map(row => [
          row.vehicleNumber,
          getFormattedDuration(Number(row.value)),
          row.change.percentage
        ])
      }

    case 'MOST_HALTED_VEHICLE':
      return {
        head: ['Vehicle Number', 'Halt Time', 'Change (%)'],
        body: data.map(row => [
          row.vehicleNumber,
          getFormattedDuration(Number(row.value)),
          row.change.percentage
        ])
      }

    default:
      return {
        head: ['Vehicle Number', 'Value', 'Change (%)'],
        body: data.map(row => [
          row.vehicleNumber,
          row.value,
          row.change.percentage
        ])
      }
  }
}

export default DetailsTable
