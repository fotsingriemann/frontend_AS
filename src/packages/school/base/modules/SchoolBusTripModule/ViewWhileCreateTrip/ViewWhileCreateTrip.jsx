import React, { Component } from 'react'
import RouteDetailExpansion from '../RouteDetailExpansion'
import { Grid, Typography, withStyles, Paper } from '@material-ui/core'

const styles = theme => ({
  waypointsCard: {
    overflow: 'auto',
    height: 450
  },
  textField: {
    marginTop: theme.spacing(1),
    marginButtom: theme.spacing(1)
  },
  item: {
    margin: 2 * theme.spacing(1)
  }
})

class ViewWhileCreateTrip extends Component {
  render() {
    const {
      classes,
      routeDetails,
      allEta,
      radioSelection,
      autoAssignVehicle
    } = this.props
    return (
      <Paper elevation={8} className={classes.waypointsCard}>
        {routeDetails && (
          <Grid container className={classes.textField}>
            <Grid item sm={12} className={classes.item}>
              <Typography variant="button">Detailed Route Map</Typography>
            </Grid>
            <Grid item sm={12}>
              {routeDetails.map((route, index) => (
                <RouteDetailExpansion
                  radioSelection={radioSelection}
                  etas={allEta ? allEta[index] : null}
                  route={route}
                  key={index}
                  index={index}
                  routeOnViewHovered={this.props.routeOnViewHovered}
                  autoAssignVehicle={autoAssignVehicle}
                />
              ))}
            </Grid>
          </Grid>
        )}
      </Paper>
    )
  }
}

export default withStyles(styles)(ViewWhileCreateTrip)
