import React from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import { Grid, Typography, Divider, withStyles, Paper } from '@material-ui/core'
import getLoginId from '@zeliot/common/utils/getLoginId'
import PaginatedVehicleTable from './PaginatedVehicleTable'
import TroubleCodes from './TroubleCodes'
import FleetStats from './FleetStats'

const styles = theme => ({
  SectionHeader: {
    marginBottom: theme.spacing(2)
  }
})

const GET_FLEET_HEALTH = gql`
  query($loginId: Int!) {
    getOBDFleetHealth(clientLoginId: $loginId) {
      healthDataObj {
        vehicleNumber
        vehicleType
        vehicleModel
        vehicleScore
        vehicleHealth
        totalDTCs
        latestOdometerKM
        uniqueid
      }
      moderate
      good
      critical
    }
  }
`

function Dashboard({ onVehicleChange, classes }) {
  return (
    <Query query={GET_FLEET_HEALTH} variables={{ loginId: getLoginId() }}>
      {({ loading, error, data }) => {
        if (loading) {
          return (
            <Paper className={classes.PaperText}>
              <Typography align="center" variant="subtitle2">
                Loading
              </Typography>
            </Paper>
          )
        }

        if (error) {
          return (
            <Paper className={classes.PaperText}>
              <Typography align="center" variant="subtitle2">
                Error
              </Typography>
            </Paper>
          )
        }

        const {
          healthDataObj: vehicles,
          moderate,
          good,
          critical
        } = data.getOBDFleetHealth

        return (
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant="h6">Vehicles</Typography>
              <Divider className={classes.SectionHeader} />
              <PaginatedVehicleTable
                onVehicleChange={onVehicleChange}
                vehicles={vehicles}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6">Trouble Codes</Typography>
              <Divider className={classes.SectionHeader} />
              <TroubleCodes />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6">Fleet Stats</Typography>
              <Divider className={classes.SectionHeader} />
              <FleetStats
                stats={{
                  good,
                  moderate,
                  critical
                }}
              />
            </Grid>
          </Grid>
        )
      }}
    </Query>
  )
}

export default withStyles(styles)(Dashboard)
