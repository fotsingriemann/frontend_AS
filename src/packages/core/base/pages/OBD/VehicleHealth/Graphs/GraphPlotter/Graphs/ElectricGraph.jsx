import React, { Component } from 'react'
import {
  Typography,
  Divider,
  withStyles,
  Grid,
  Paper,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Checkbox
} from '@material-ui/core'
import MultiLineChart from '../../../../common/MultiLineChart'

const styles = theme => ({
  graphContainer: {
    padding: theme.spacing(2)
  }
})

class ElectricGraph extends Component {
  constructor(props) {
    super(props)
    const initialState = {}

    if (props.pidList.includes('obddistance')) {
      initialState.Distance = true
    }
    if (props.pidList.includes('vehiclespeed')) {
      initialState.Speed = true
    }
    if (props.pidList.includes('state_of_charge')) {
      initialState.Charge = true
    }

    this.state = {
      isChecked: initialState
    }
  }

  handleChange = name => (e, checked) => {
    this.setState(({ isChecked }) => {
      const obj = {
        ...isChecked,
        [name]: checked
      }

      if (Object.values(obj).some(v => v)) {
        return { isChecked: obj }
      }
      return { isChecked }
    })
  }

  render() {
    const { data, classes, pidList } = this.props
    const { isChecked } = this.state

    /* eslint-disable camelcase */

    let DistanceMin = Number.POSITIVE_INFINITY
    let DistanceMax = Number.NEGATIVE_INFINITY
    let SpeedMax = Number.NEGATIVE_INFINITY

    console.log('raw data', data)
    const filteredData = data
      .filter(item => Object.values(item).every(val => val !== -99999))
      .map(({ obddistance, state_of_charge, vehiclespeed, ts }) => {
        const obj = {
          Time: ts
        }

        if (obddistance !== undefined) {
          const distance = parseInt(obddistance / 1000, 10)

          if (distance < DistanceMin) {
            DistanceMin = distance
          }

          if (distance > DistanceMax) {
            DistanceMax = distance
          }

          obj.Distance = distance
        }

        if (state_of_charge !== undefined) {
          obj.Charge = state_of_charge
        }

        if (vehiclespeed !== undefined) {
          if (vehiclespeed > SpeedMax) {
            SpeedMax = vehiclespeed
          }

          obj.Speed = vehiclespeed
        }

        return obj
      })

    /* eslint-enable camelcase */

    if (filteredData.length === 0) return null
    console.log('filter', filteredData)
    const yAxes = []

    if (pidList.includes('state_of_charge') && isChecked.Charge) {
      yAxes.push({
        key: 'Charge',
        label: 'SOC',
        color: '#e5e100',
        unit: '%',
        min: 0,
        max: 100
      })
    }

    if (pidList.includes('obddistance') && isChecked.Distance) {
      yAxes.push({
        key: 'Distance',
        label: 'Distance',
        color: '#24c600',
        unit: ' km',
        min: DistanceMin,
        max: DistanceMax
      })
    }

    if (pidList.includes('vehiclespeed') && isChecked.Speed) {
      yAxes.push({
        key: 'Speed',
        label: 'Speed',
        color: '#00afe5',
        unit: ' km/h',
        min: 0,
        max: SpeedMax
      })
    }

    return (
      <Grid item xs={12} md={12}>
        <Paper className={classes.graphContainer}>
          <Grid container>
            <Grid item xs={12}>
              <FormControl>
                <FormLabel>Filter parameters</FormLabel>
                <FormGroup row>
                  {pidList.includes('state_of_charge') && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          color="primary"
                          checked={isChecked.Charge}
                          onChange={this.handleChange('Charge')}
                          value="Charge"
                        />
                      }
                      label="State of Charge"
                    />
                  )}

                  {pidList.includes('vehiclespeed') && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          color="primary"
                          checked={isChecked.Speed}
                          onChange={this.handleChange('Speed')}
                          value="Speed"
                        />
                      }
                      label="Speed"
                    />
                  )}

                  {pidList.includes('obddistance') && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          color="primary"
                          checked={isChecked.Distance}
                          onChange={this.handleChange('Distance')}
                          value="Distance"
                        />
                      }
                      label="Distance"
                    />
                  )}
                </FormGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <MultiLineChart
                data={filteredData}
                xLabel="Time"
                xKey="Time"
                yAxes={yAxes}
              />
            </Grid>

            <Grid item xs={12}>
              <div>
                <Typography variant="button" gutterBottom>
                  State of Charge(%) Vs Distance
                </Typography>
                <Divider />
                <Typography>
                  This graph shows the variation of State of Charge and Vehicle
                  distance over time
                </Typography>
              </div>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    )
  }
}

export default withStyles(styles)(ElectricGraph)
