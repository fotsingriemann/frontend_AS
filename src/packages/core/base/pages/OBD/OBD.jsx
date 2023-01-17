import React, { Component } from 'react'
import { Grid, IconButton, Divider, withStyles } from '@material-ui/core'
import BackIcon from '@material-ui/icons/ArrowBack'
import PageHeader from './PageHeader'
import VehicleHealth from './VehicleHealth'
import Dashboard from './Dashboard'

const PageStyles = theme => ({
  ExternalPadding: {
    padding: theme.spacing(2)
  },
  HeaderPadding: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  }
})

class OBDPage extends Component {
  state = {
    selectedVehicle: null
  }

  handleSelectedVehicleChange = selectedVehicle =>
    this.setState({ selectedVehicle })

  render() {
    const { classes } = this.props
    const { selectedVehicle } = this.state

    return (
      <Grid container>
        <Grid item xs={12}>
          <Grid
            container
            justify="space-between"
            alignItems="center"
            className={classes.HeaderPadding}
          >
            <Grid item>
              <PageHeader>OBD Dashboard</PageHeader>
            </Grid>

            {selectedVehicle && (
              <Grid item>
                <IconButton
                  onClick={() => this.handleSelectedVehicleChange(null)}
                >
                  <BackIcon />
                </IconButton>
              </Grid>
            )}
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        <Grid item xs={12} className={classes.ExternalPadding}>
          {selectedVehicle ? (
            <VehicleHealth
              vehicle={{
                vehicleNumber: selectedVehicle.vehicleNumber,
                uniqueId: selectedVehicle.uniqueid
              }}
            />
          ) : (
            <Dashboard onVehicleChange={this.handleSelectedVehicleChange} />
          )}
        </Grid>
      </Grid>
    )
  }
}

export default withStyles(PageStyles)(OBDPage)
