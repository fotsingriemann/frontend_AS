import React from 'react'
import { withApollo } from 'react-apollo'
import {
  Drawer,
  Button,
  Card,
  Grid,
  Typography,
  withStyles,
  CardHeader,
  CardContent,
  Avatar,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Badge from '@material-ui/core/Badge'
import { red } from '@material-ui/core/colors'
import { LIVE_ALERTS } from '@zeliot/common/graphql/subscriptions'
import getLoginId from '@zeliot/common/utils/getLoginId'

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  font3: {
    fontSize: '3.5rem',
  },
}))

function LiveAlerts(props) {
  const classes = useStyles()

  const _isMounted = React.useRef(false)
  const alertsSubscription = React.useRef(null)
  const unsubHandle = React.useRef(null)

  const {
    setAlerts,
    buttonTitle,
    alerts,
    handleAlertsDrawerToggle,
    client,
    isAlertsDrawerOpen,
    handleButtonClicked,
    isButtonClicked,
    alertsViewed,
    alertsViewedTrue,
    alertsViewedFalse,
    handleAlertsDrawerToggleFalse,
    alertsCount,
    updateAlertsCount,
  } = props

  function clickHandler() {
    //opens the toggle
    handleAlertsDrawerToggle()
    //this fn is called to make the alertcount length same as alerts.length so that it will go in else condition and notification goes
    updateAlertsCount(alerts.length)
  }

  React.useEffect(() => {
    _isMounted.current = true

    function setupSubscription() {
      alertsSubscription.current = client.subscribe({
        query: LIVE_ALERTS,
        variables: {
          loginId: getLoginId(),
        },
      })
    }

    function startSubscription(props) {
      unsubHandle.current = alertsSubscription.current.subscribe({
        next: ({ data: { allAlertsForClient: alert } }) => {
          if (_isMounted.current) {
            //alerts comes from susbscription and set alerts function is called where it will set the state of alerts
            props.setAlerts(alert)
          }
        },
      })
    }

    setupSubscription()
    startSubscription(props)

    return () => {
      function stopSubscription() {
        if (unsubHandle.current) unsubHandle.current.unsubscribe()
      }

      _isMounted.current = false
      stopSubscription()
    }
  }, [client])

  if (alerts.length !== alertsCount && isAlertsDrawerOpen == false) {
    return (
      <div className={classes.root}>
        <Badge color="error" variant="dot" classes={{ badge: classes.font3 }}>
          <Button
            size="small"
            color="inherit"
            onClick={clickHandler}
            // onClick={() => setisButtonClicked(!isButtonClicked) }  //at the same time i need to call the alertDrawer props.handleAlertsDrawerToggle
          >
            {buttonTitle}
          </Button>
        </Badge>
      </div>
    )
  } else {
    return (
      <Button
        size="small"
        color="inherit"
        onClick={clickHandler}
        // onClick={props.handleAlertsDrawerToggle} //at the same time i need to call the alertDrawer props.handleAlertsDrawerToggle
      >
        {buttonTitle}
      </Button>
    )
  }
}

export default withApollo(LiveAlerts)
