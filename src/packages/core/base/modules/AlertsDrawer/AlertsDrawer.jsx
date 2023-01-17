/**
 * @module AlertsDrawer
 * @summary This module exports the AlertsDrawer component
 */
import React from 'react'
import { withApollo } from 'react-apollo'
import {
  Drawer,
  Card,
  Grid,
  Typography,
  withStyles,
  CardHeader,
  CardContent,
  Avatar,
} from '@material-ui/core'
import { red } from '@material-ui/core/colors'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import { LIVE_ALERTS } from '@zeliot/common/graphql/subscriptions'
import getLoginId from '@zeliot/common/utils/getLoginId'
import getAlertName from '@zeliot/common/utils/getAlertName'
import gql from 'graphql-tag'

const GET_LATEST_ALERTS = gql`
  query($clientLogin: Int!) {
    getlastestAlertsByClientLogin(clientLogin: $clientLogin) {
      vehicleNumber
      alerttype
      from_ts
      to_ts
      lat
      lng
      driverName
      contactNumber
    }
  }
`
const style = {
  alertsDrawerPaper: {
    width: 250,
    background: 'rgba(230, 230, 230, 0.95)',
  },
  fullHeight: {
    height: '100%',
    padding: '0 0.25rem',
  },
  alertCard: {
    margin: 8,
    padding: 2,
    textAlign: 'left',
  },
  avatar: {
    backgroundColor: red[500],
  },
  alertCardHeader: {
    padding: '8px',
  },
  alertCardContent: {
    padding: '8px',
  },
}

/**
 * @param {number} lat The latitude of the location
 * @param {number} lng The longitude of the location
 * @returns {string} The google maps link for the given lat, lng
 * @summary Returns a Google map link for the location
 */
function getMapLink(lat, lng) {
  return `https://www.google.com/maps/?q=${lat},${lng}`
}

/**
 * @param {object} props React component props
 * @summary A banner component when there are no alerts
 */
function NoAlertsBanner(props) {
  const { classes } = props

  return (
    <Grid
      container
      justify="center"
      alignItems="center"
      className={classes.fullHeight}
    >
      <Grid item>
        <Typography variant="subtitle1" align="center">
          No Alerts
        </Typography>
      </Grid>
    </Grid>
  )
}

/**
 * @param {object} alertItem The alert location item
 * @summary Wraps a googlemap link on a string
 */
function getListItem(alertItem) {
  const link = (
    <a
      href={getMapLink(alertItem.lat, alertItem.lng)}
      target="_blank"
      rel="noopener noreferrer"
    >
      here
    </a>
  )

  return (
    <span>
      <Typography variant="body1">
        Vehicle ID: {alertItem.vehicleNumber} <br />
        Driver Name:{alertItem.driverName} <br />
        Driver Contact No:{alertItem.contactNumber} <br />
        Map Link: {link}
      </Typography>
    </span>
  )
}

/**
 * @param {object} props React component props
 * @summary Renders a list of alerts as cards
 */
function AlertsList(props) {
  const { items, classes } = props

  return (
    <Grid container spacing={1}>
      {items.map((alertItem, i) => (
        <Grid item xs={12} key={i}>
          <Card className={classes.alertCard}>
            <CardHeader
              avatar={
                <Avatar aria-label="Alert" className={classes.avatar}>
                  {alertItem.alerttype.charAt(0).toUpperCase()}
                </Avatar>
              }
              title={
                <Typography variant="subtitle1">
                  {getAlertName(alertItem.alerttype)}
                </Typography>
              }
              className={classes.alertCardHeader}
            />

            <CardContent className={classes.alertCardContent}>
              {getListItem(alertItem)}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

/**
 * @param {object} props React component props
 * @summary AlertsDrawer component renders a side drawer to show alerts by
 * subscribing to live alerts
 */
function AlertsDrawer(props) {
  const [alerts, setAlerts] = React.useState([])

  const _isMounted = React.useRef(false)
  const alertsSubscription = React.useRef(null)
  const unsubHandle = React.useRef(null)

  const { classes, isAlertsDrawerOpen, onClose, openSnackbar, client } = props

  React.useEffect(() => {
    _isMounted.current = true

    async function latestAlerts() {
      let responce = await client.query({
        query: GET_LATEST_ALERTS,
        variables: {
          clientLogin: getLoginId(),
        },
      })
      let data = responce.data.getlastestAlertsByClientLogin
      for (let i = 0; i < data.length; i++) {
        let lastAlert = data[i]
        setAlerts((alerts) => [...alerts, lastAlert])
      }
    }

    function setupSubscription() {
      alertsSubscription.current = client.subscribe({
        query: LIVE_ALERTS,
        variables: {
          loginId: getLoginId(),
        },
      })
    }

    function startSubscription() {
      unsubHandle.current = alertsSubscription.current.subscribe({
        next: ({ data: { allAlertsForClient: alert } }) => {
          if (_isMounted.current) {
            setAlerts((alerts) => {
              if (alerts.length > 49) {
                return [alert, ...alerts.pop()]
              } else {
                return [alert, ...alerts]
              }
            })
            openSnackbar(`New ${getAlertName(alert.alerttype)} alert`, {
              duration: 10000,
              verticalPosition: 'bottom',
              horizontalPosition: 'left',
              autoHide: true,
            })
          }
        },
      })
    }

    latestAlerts()
    setupSubscription()
    startSubscription()

    return () => {
      function stopSubscription() {
        if (unsubHandle.current) unsubHandle.current.unsubscribe()
      }

      _isMounted.current = false
      stopSubscription()
    }
  }, [client, openSnackbar])

  return (
    <Drawer
      open={isAlertsDrawerOpen}
      onClose={onClose}
      anchor="right"
      classes={{
        paper: `appbar-top-margin drawer-height-with-appbar ${classes.alertsDrawerPaper}`,
      }}
    >
      <div className={classes.fullHeight}>
        {alerts.length ? (
          <AlertsList items={alerts} classes={classes} />
        ) : (
          <NoAlertsBanner classes={classes} />
        )}
      </div>
    </Drawer>
  )
}

export default withStyles(style)(withSharedSnackbar(withApollo(AlertsDrawer)))
