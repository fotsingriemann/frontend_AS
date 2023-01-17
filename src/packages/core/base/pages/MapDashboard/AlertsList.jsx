import React from 'react'
import gql from 'graphql-tag'
import { useLazyQuery } from 'react-apollo'
import { useHistory } from 'react-router-dom'
import {
  Grid,
  List,
  ListItemText,
  Typography,
  ListItem,
  Button,
  CircularProgress
} from '@material-ui/core'

import RoundedPaper from '@zeliot/common/ui/RoundedPaper'
import getLoginId from '@zeliot/common/utils/getLoginId'
import getAlertName from '@zeliot/common/utils/getAlertName'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'

const GET_RECENT_ALERTS = gql`
  query getAllAlertsByClientLogin($clientId: Int!, $from: String, $to: String) {
    alerts: getAllAlertsByClientLogin(
      clientLogin: $clientId
      from: $from
      to: $to
    ) {
      alerttype
      vehicleNumber
      from_ts
      lat
      lng
    }
  }
`

function AlertDescription({ alert }) {
  return (
    <span>
      {getAlertName(alert.alerttype)} on{' '}
      {getFormattedTime(alert.from_ts, 'LLL')}{' '}
      <a
        href={`https://www.google.com/maps/?q=${alert.lat},${alert.lng}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        here
      </a>
    </span>
  )
}

function AlertsList() {
  const [fetchRecentAlerts, { called, loading, error, data }] = useLazyQuery(
    GET_RECENT_ALERTS
  )

  React.useEffect(() => {
    const time = Math.round(new Date().getTime() / 1000)
    fetchRecentAlerts({
      variables: {
        clientId: getLoginId(),
        from: String(time - 86400),
        to: String(time)
      }
    })
  }, [fetchRecentAlerts])

  const history = useHistory()

  return (
    <RoundedPaper
      style={{
        height: '100%',
        width: '100%',
        padding: 8
      }}
    >
      <Grid container justify="center" spacing={1}>
        <Grid item xs={12}>
          <Typography variant="h6" align="center">
            Recent Alerts
          </Typography>
        </Grid>

        <Grid
          item
          xs={12}
          container
          justify="center"
          alignItems="center"
          style={{ height: 300, overflowY: 'auto' }}
        >
          {!called || loading ? (
            <Grid item>
              <CircularProgress color="primary" />
            </Grid>
          ) : error ? (
            <Grid item>
              <Typography color="error" align="center">
                Error fetching recent alerts
              </Typography>
            </Grid>
          ) : (
            <Grid item>
              <List dense disablePadding>
                {/* eslint-disable indent */
                data && data.alerts && data.alerts.length
                  ? data.alerts.slice(0, 5).map((alert, index) => (
                      <ListItem key={index} dense>
                        <ListItemText
                          primary={alert.vehicleNumber}
                          secondary={<AlertDescription alert={alert} />}
                        />
                      </ListItem>
                    ))
                  : 'No recent alerts'
                /* eslint-enable indent */
                }
              </List>
            </Grid>
          )}
        </Grid>

        <Grid item>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => history.push('/home/alerts')}
          >
            View all alerts
          </Button>
        </Grid>
      </Grid>
    </RoundedPaper>
  )
}

export default AlertsList
