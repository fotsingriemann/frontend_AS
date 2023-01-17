import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import {
  withStyles,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Grid
} from '@material-ui/core'

const styles = theme => ({
  root: {
    width: '100%'
  },
  expansionPanel: {
    paddingBottom: '4px'
  }
})

class RouteDetailExpansion extends Component {
  state = {
    rowHovered: false
  }

  getStepContent = (step, eta) => {
    const distance = JSON.parse(this.props.route.distance)
    const duration = JSON.parse(this.props.route.duration)
    return (
      <div>
        {eta && (
          <Grid container className={this.props.classes.expansionPanel}>
            <Grid item sm={6}>
              {this.props.radioSelection === 'pickup' ? (
                <Typography color="textSecondary">Depart at</Typography>
              ) : (
                <Typography color="textSecondary">Arrive at</Typography>
              )}
            </Grid>
            <Grid item sm={6}>
              <Typography>{eta}</Typography>
            </Grid>
          </Grid>
        )}
        <Grid container className={this.props.classes.expansionPanel}>
          <Grid item sm={6}>
            <Typography color="textSecondary">Distance</Typography>
          </Grid>
          <Grid item sm={6}>
            <Typography>{distance[step].text}</Typography>
          </Grid>
        </Grid>
        <Grid container className={this.props.classes.expansionPanel}>
          <Grid item sm={6}>
            <Typography color="textSecondary">Expected Duration</Typography>
          </Grid>
          <Grid item sm={6}>
            <Typography>{duration[step].text}</Typography>
          </Grid>
        </Grid>
      </div>
    )
  }

  render() {
    const { classes, route, index, etas, autoAssignVehicle } = this.props
    return (
      <div className={classes.root}>
        <ExpansionPanel
          onMouseEnter={() => {
            this.setState({ rowHovered: true }, () => {
              this.props.routeOnViewHovered(index, this.state.rowHovered)
            })
          }}
          onMouseLeave={() => {
            this.setState({ rowHovered: false }, () => {
              this.props.routeOnViewHovered(index, this.state.rowHovered)
            })
          }}
          defaultExpanded={true}
        >
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Grid container>
              <Grid item sm={6}>
                <Typography color="textSecondary">Name</Typography>
              </Grid>
              <Grid item sm={6}>
                <Typography>{route.name}</Typography>
              </Grid>
            </Grid>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Grid container>
              {autoAssignVehicle && (
                <Grid item sm={12}>
                  <Grid container className={classes.expansionPanel}>
                    <Grid item sm={6}>
                      <Typography color="textSecondary">
                        Vehicle Assigned
                      </Typography>
                    </Grid>
                    <Grid item sm={6}>
                      <Typography>{route.vehicleNumber}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              )}
              <Grid item sm={12}>
                <Grid container className={classes.expansionPanel}>
                  <Grid item sm={6}>
                    <Typography color="textSecondary">
                      Route Capacity
                    </Typography>
                  </Grid>
                  <Grid item sm={6}>
                    <Typography>{route.capacity}</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item sm={12}>
                <Grid container className={classes.expansionPanel}>
                  <Grid item sm={6}>
                    <Typography color="textSecondary">
                      Seats Required
                    </Typography>
                  </Grid>
                  <Grid item sm={6}>
                    <Typography>{route.load}</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item sm={12} />
              <Grid container className={classes.expansionPanel}>
                <Grid item sm={12}>
                  <Typography color="textSecondary">Points Covered</Typography>
                </Grid>
                <Grid item sm={12}>
                  <Stepper orientation="vertical" nonLinear={true}>
                    <Step active={true}>
                      <StepLabel>School</StepLabel>
                      <StepContent>
                        {this.getStepContent(0, etas ? etas[0] : null)}
                      </StepContent>
                    </Step>
                    {route.aoiOrderObject.map((aoi, index) => (
                      <Step key={index} active={true}>
                        <StepLabel>{aoi.name}</StepLabel>
                        <StepContent>
                          {this.getStepContent(
                            index + 1,
                            etas ? etas[index + 1] : null
                          )}
                        </StepContent>
                      </Step>
                    ))}
                    <Step active={true}>
                      <StepLabel>School</StepLabel>
                      <StepContent>
                        {etas && (
                          <Grid
                            container
                            className={this.props.classes.expansionPanel}
                          >
                            <Grid item sm={6}>
                              <Typography color="textSecondary">
                                Finish at
                              </Typography>
                            </Grid>
                            <Grid item sm={6}>
                              <Typography>{etas[etas.length - 1]}</Typography>
                            </Grid>
                          </Grid>
                        )}
                      </StepContent>
                    </Step>
                  </Stepper>
                </Grid>
              </Grid>
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    )
  }
}

RouteDetailExpansion.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(RouteDetailExpansion)
