/**
 * Trip subtrip details stepper component
 * @module EventStepper
 */

import React, { Component } from 'react'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'

import {
  withStyles,
  MobileStepper,
  Paper,
  Grid,
  Typography,
  Button,
  Divider,
  CircularProgress
} from '@material-ui/core'

const styles = theme => ({
  root: {
    width: '100%',
    flexGrow: 1
  },
  header: {
    display: 'flex',
    alignItems: 'center'
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular
  }
})

/**
 * @summary Stepper template default view values
 */
const eventSteps = [
  {
    label: 'TRIP',
    name: 'Trip',
    key: 0,
    startMessage: 'Actual start on',
    endMessage: 'Actual end on',
    expansionHeader: ''
  },
  {
    label: 'WAYPOINTS',
    name: 'Waypoint',
    key: 1,
    startMessage: 'Breached in on',
    endMessage: 'Breached out on',
    expansionHeader: 'Some header'
  },
  {
    label: 'ROUTE',
    name: 'Route',
    key: 2,
    startMessage: 'Breached in on',
    endMessage: 'Breached out on',
    expansionHeader: 'Some header'
  }
]

class EventsStepper extends Component {
  /**
   * @property {number} activeStep Highlighted step
   */
  state = {
    activeStep: 0
  }

  /**
   * @function handleNext
   * @summary handle next press on stepper
   */
  handleNext = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep + 1
    }))
  }

  /**
   * @function handleBack
   * @summary handle back press on stepper
   */
  handleBack = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep - 1
    }))
  }

  /**
   * @function handleStepChange
   * @param {number} activeStep Highlighted step
   * @summary Sets clicked step
   */
  handleStepChange = activeStep => {
    this.setState({ activeStep })
  }

  render() {
    const { classes, theme, selectedSubTrip } = this.props
    const { activeStep } = this.state
    // console.log('events', selectedSubTrip)
    const maxSteps = eventSteps.length

    return (
      <div className={classes.root}>
        <Paper square elevation={0} className={classes.header}>
          <Grid
            container
            justify="center"
            alignItems="center"
            direction="column"
          >
            <Grid item>
              <Typography variant="button" color="primary">
                {eventSteps[activeStep].label}
              </Typography>
            </Grid>

            <Grid item sm={12} style={{ marginTop: 10, marginBottom: 10 }}>
              {selectedSubTrip ? (
                selectedSubTrip[activeStep].details.map((detail, index) => (
                  <div key={index}>
                    {eventSteps[activeStep].name !== 'TRIP' && (
                      <Grid container>
                        <Grid item sm={12}>
                          <Typography color="textSecondary" fontWeight="bold">
                            {eventSteps[activeStep].name}
                          </Typography>
                        </Grid>
                        <Grid item sm={12}>
                          <Typography color="primary">
                            {detail.areaName}
                          </Typography>
                        </Grid>
                      </Grid>
                    )}

                    <Grid container>
                      <Grid item sm={12}>
                        <Typography color="textSecondary">
                          {eventSteps[activeStep].startMessage}
                        </Typography>
                      </Grid>
                      <Grid item sm={12}>
                        <Typography>
                          {getFormattedTime(detail.startTimestamp, 'llll')}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item sm={12}>
                        <Typography color="textSecondary">at</Typography>
                      </Grid>
                      <Grid item sm={12}>
                        <Typography>{detail.startLocation.address}</Typography>
                      </Grid>
                    </Grid>

                    <Grid container style={{ marginTop: 10, marginBottom: 10 }}>
                      <Grid item sm={12}>
                        <Divider />
                      </Grid>
                    </Grid>

                    <Grid container>
                      <Grid item sm={12}>
                        <Typography color="textSecondary">
                          {eventSteps[activeStep].endMessage}
                        </Typography>
                      </Grid>
                      <Grid>
                        <Typography>
                          {getFormattedTime(detail.endTimestamp, 'llll')}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item sm={12}>
                        <Typography color="textSecondary">at</Typography>
                      </Grid>
                      <Grid item sm={12}>
                        <Typography>{detail.endLocation.address}</Typography>
                      </Grid>
                    </Grid>

                    <Grid container style={{ marginTop: 10, marginBottom: 10 }}>
                      <Grid item sm={12}>
                        <Divider />
                      </Grid>
                    </Grid>
                  </div>
                ))
              ) : (
                <Grid container alignItems="center" direction="column">
                  <Grid item>
                    <CircularProgress />
                  </Grid>
                  <Grid item>
                    <Typography>Fetching events...</Typography>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Paper>

        <MobileStepper
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          className={classes.mobileStepper}
          nextButton={
            <Button
              size="small"
              onClick={this.handleNext}
              disabled={activeStep === maxSteps - 1}
            >
              Next
              {theme.direction === 'rtl' ? (
                <KeyboardArrowLeft />
              ) : (
                <KeyboardArrowRight />
              )}
            </Button>
          }
          backButton={
            <Button
              size="small"
              onClick={this.handleBack}
              disabled={activeStep === 0}
            >
              {theme.direction === 'rtl' ? (
                <KeyboardArrowRight />
              ) : (
                <KeyboardArrowLeft />
              )}
              Back
            </Button>
          }
        />
      </div>
    )
  }
}

export default withStyles(styles, { withTheme: true })(EventsStepper)
