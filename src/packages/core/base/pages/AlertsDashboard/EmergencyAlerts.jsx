/**
 * @module AlertsDashboard/EmergencyAlerts
 * @summary This module exports the Emergency Alerts component
 */

import React, { Fragment, Component } from 'react'
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'
import { Link } from 'react-router-dom'
import {
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Typography,
  Divider,
  IconButton,
  withStyles
} from '@material-ui/core'
import BackIcon from '@material-ui/icons/ArrowBack'
import getLoginId from '@zeliot/common/utils/getLoginId'
import PasswordDialog from './PasswordDialog'

const GET_AIS_ALERTS = gql`
  query($loginId: Int!) {
    alerts: getAllAisPanicAlertDevicesByClientLogin(clientLoginId: $loginId) {
      vehicleNumber
      uniqueId
      status
      panic_ts
    }
  }
`

const CLEAR_EMERGENCY_ALERTS = gql`
  mutation($uniqueId: String!, $password: String!) {
    clearEmergencyMode(uniqueId: $uniqueId, device_password: $password) {
      message
    }
  }
`

/**
 * @summary AlertsTable renders the list of alerts in a table
 */
class AlertsTable extends Component {
  /**
   * @property {string} selectedUniqueId The unique ID of the selected vehicle
   * @property {boolean} showPasswordDialog A boolean to determine if password dialog needs to shown
   */
  state = {
    selectedUniqueId: '',
    showPasswordDialog: false
  }

  /**
   * @callback
   * @param {string} selectedUniqueId The unique id of the selected vehicle
   * @summary Action to clear emergency alert by opening the Password input dialog
   */
  handleClearButtonClick = selectedUniqueId =>
    this.setState({
      selectedUniqueId,
      showPasswordDialog: true
    })

  /**
   * @callback
   * @summary Closes the password dialog
   */
  handleModalClose = () => this.setState({ showPasswordDialog: false })

  /**
   * @callback
   * @summary Callback called after clear mutation executes successfully executes
   */
  handleSuccess = () =>
    this.setState({
      showPasswordDialog: false,
      selectedUniqueId: ''
    })

  render() {
    const { alerts } = this.props

    if (alerts.length) {
      return (
        <Fragment>
          <Mutation
            mutation={CLEAR_EMERGENCY_ALERTS}
            onCompleted={this.handleSuccess}
            refetchQueries={[
              {
                query: GET_AIS_ALERTS,
                variables: {
                  loginId: getLoginId()
                }
              }
            ]}
          >
            {(clearEmergencyAlerts, { loading, error }) => {
              return (
                <PasswordDialog
                  onClose={this.handleModalClose}
                  onSubmit={password =>
                    clearEmergencyAlerts({
                      variables: {
                        uniqueId: this.state.selectedUniqueId,
                        password
                      }
                    })
                  }
                  open={this.state.showPasswordDialog}
                  isLoading={loading}
                  error={error}
                />
              )
            }}
          </Mutation>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vehicle Number</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {alerts.map(({ vehicleNumber, uniqueId, status }) => (
                <TableRow key={uniqueId}>
                  <TableCell>{vehicleNumber}</TableCell>
                  <TableCell>
                    {status === 'NOT_YET_TRIGGERED' || status === 'TIMEOUT' ? (
                      <Button
                        variant="outlined"
                        onClick={() => this.handleClearButtonClick(uniqueId)}
                      >
                        Clear
                      </Button>
                    ) : (
                      status
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Fragment>
      )
    } else {
      return (
        <Typography align="center" variant="subtitle1">
          No active emergency alerts
        </Typography>
      )
    }
  }
}

const style = theme => ({
  text: {
    padding: theme.spacing(2)
  }
})

/**
 * @param {object} props React component props
 * @summary EmergencyAlerts component shows emergency alerts and adds provision to clear them
 */
function EmergencyAlerts(props) {
  const { classes } = props

  return (
    <Grid container>
      <Grid item xs={12}>
        <Grid
          container
          justify="space-between"
          alignItems="center"
          className={classes.text}
        >
          <Grid item>
            <Typography variant="h5">Emergency Alerts</Typography>
          </Grid>
          <Grid item>
            <Link to="/home/alerts">
              <IconButton>
                <BackIcon />
              </IconButton>
            </Link>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Divider />
      </Grid>

      <Query
        query={GET_AIS_ALERTS}
        variables={{
          loginId: getLoginId()
        }}
      >
        {({ loading, error, data }) => {
          if (loading) {
            return (
              <Grid item xs={12}>
                <Typography
                  align="center"
                  variant="subtitle1"
                  className={classes.text}
                >
                  Loading...
                </Typography>
              </Grid>
            )
          }

          if (error) {
            return (
              <Grid item xs={12}>
                <Typography
                  align="center"
                  variant="subtitle1"
                  className={classes.text}
                >
                  Error fetching emergency alerts
                </Typography>
              </Grid>
            )
          }

          return (
            <Grid item xs={12}>
              <AlertsTable alerts={data.alerts} />
            </Grid>
          )
        }}
      </Query>
    </Grid>
  )
}

export default withStyles(style)(EmergencyAlerts)
