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

class TempPressureGraph extends Component {
  constructor(props) {
    super(props)
    const initialState = {}

    if (props.pidList.includes('tire_pressure')) {
      initialState.Pressure = true
    }
    if (props.pidList.includes('tire_temperature')) {
      initialState.Temperature = true
    }

    this.state = {
      isChecked: initialState
    }
  }

  handleChange = name => (e, checked) => {
    this.setState(({ isChecked }) => {
      let obj
      obj = {
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

    let TemperatureMin = Number.POSITIVE_INFINITY
    let TemperatureMax = Number.NEGATIVE_INFINITY
    let PressureMin = Number.POSITIVE_INFINITY
    let PressureMax = Number.NEGATIVE_INFINITY

    const filteredData = data
      .filter(item => Object.values(item).every(val => val !== -99999))
      .map(({ tire_temperature, tire_pressure, dateTime }) => {
        const obj = {
          Time: dateTime
        }

        if (tire_temperature !== undefined) {
          const temp = parseInt(tire_temperature, 10)

          if (temp < TemperatureMin) {
            TemperatureMin = temp
          }

          if (temp > TemperatureMax) {
            TemperatureMax = temp
          }

          obj.Temperature = temp
        }

        if (tire_pressure !== undefined) {
          const pressure = parseInt(tire_pressure, 10)

          if (pressure < PressureMin) {
            PressureMin = pressure
          }

          if (pressure > PressureMax) {
            PressureMax = pressure
          }

          obj.Pressure = pressure
        }
        return obj
      })

    // console.log('filtered data', filteredData)
    /* eslint-enable camelcase */

    if (filteredData.length === 0) return null

    const yAxes = []

    if (pidList.includes('tire_temperature') && isChecked.Temperature) {
      yAxes.push({
        key: 'Temperature',
        label: 'Temperature',
        color: '#e5e100',
        unit: ' deg C',
        min: TemperatureMin,
        max: TemperatureMax
      })
    }

    if (pidList.includes('tire_pressure') && isChecked.Pressure) {
      yAxes.push({
        key: 'Pressure',
        label: 'Pressure',
        color: '#24c600',
        unit: ' kPa',
        min: PressureMin,
        max: PressureMax
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
                  {pidList.includes('tire_temperature') && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          color="primary"
                          checked={isChecked.Temperature}
                          onChange={this.handleChange('Temperature')}
                          value="Temperature"
                        />
                      }
                      label="Temperature"
                    />
                  )}

                  {pidList.includes('tire_pressure') && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          color="primary"
                          checked={isChecked.Pressure}
                          onChange={this.handleChange('Pressure')}
                          value="Pressure"
                        />
                      }
                      label="Pressure"
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
                isMultiSecond={this.props.isMultiSecond}
              />
            </Grid>

            <Grid item xs={12}>
              <div>
                <Typography variant="button" gutterBottom>
                  Tire temperature/ pressure Vs Time
                </Typography>
                <Divider />
                <Typography>
                  This graph shows the variation of tire pressure and tire
                  temperature over time
                </Typography>
              </div>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    )
  }
}

export default withStyles(styles)(TempPressureGraph)
