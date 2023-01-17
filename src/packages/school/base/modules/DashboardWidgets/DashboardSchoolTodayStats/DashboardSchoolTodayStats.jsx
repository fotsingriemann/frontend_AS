import React, { Component } from 'react'
import PropTypes from 'prop-types'
import BusAttnIcon from '@material-ui/icons/Gradient'
import IdleTimeIcon from '@material-ui/icons/Timer'
import DistanceIcon from '@material-ui/icons/Straighten'
import AlertIcon from '@material-ui/icons/Warning'
import WidgetCard from '@zeliot/common/ui/WidgetCard'
import { THEME_MAIN_COLORS as COLOR_RANGE } from '@zeliot/common/constants/styles'

import {
  Grid,
  withStyles,
  Typography,
  MenuItem,
  FormControl,
  Select,
  Paper,
  Divider
} from '@material-ui/core'

const style = theme => ({
  statsTitle: {
    fontSize: 16,
    textAlign: 'center',
    verticalAlign: 'middle'
  },
  widgetIcon: {
    fontSize: 60
  },
  textLeft: {
    textAlign: 'left'
  },
  textRight: {
    textAlign: 'right'
  },
  textCenter: {
    textAlign: 'center'
  },
  textMiddle: {
    verticalAlign: 'middle'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    minHeight: '320px'
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  }
})

class DashboardSchoolTodayStats extends Component {
  state = {
    period: -1,
    fleetDistance: '',
    fleetRunTime: '',
    fleetIdleTime: '',
    fleetFuelUsed: ''
  }

  static propTypes = {
    requestPeriod: PropTypes.number
  }

  static defaultProps = {
    requestPeriod: 1
  }

  periodChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  periodForQuery(period) {
    switch (period) {
      case -1:
        return 'day' // change this later
      case 1:
        return 'day'
      case 7:
        return 'week'
      case 30:
        return 'month'
      case 0:
        return 'all'
      default:
        return 'day'
    }
  }

  timeToString(time) {
    let strTime = ''
    if (time < 10000) {
      strTime += time + ' sec'
      return strTime.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    } else {
      const min = Math.floor(time / 60)
      if (min < 10000) {
        strTime += min + ' min'
        return strTime.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      } else {
        const hrs = Math.floor(min / 60)
        strTime += hrs + ' hrs'
        return strTime.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      }
    }
  }

  distanceToString(dist) {
    let strDist = ''
    if (dist < 10000) {
      strDist += dist + ' km'
      return strDist.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    } else {
      let lDist = dist / 100000
      lDist = lDist.toFixed(2)
      strDist = lDist + ' lakh km'
      return strDist
    }
  }

  fuelToString(fuel) {
    let strFuel = ''
    if (fuel === '0') return ' --'
    if (fuel < 10000) {
      strFuel += fuel + ' ltr'
      return strFuel.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    } else {
      let lFuel = fuel / 100000
      lFuel = lFuel.toFixed(2)
      strFuel = lFuel + ' lakh ltr'
      return strFuel
    }
  }

  render() {
    const { classes } = this.props
    return (
      <Paper square elevation={6} className={classes.paper}>
        <Grid container justify="space-between" alignItems="center" spacing={1}>
          <Grid item xs={6} className={classes.textLeft}>
            <Typography variant="h5" color="textSecondary" gutterBottom>
              Statistics
            </Typography>
          </Grid>
          <Grid item xs={6} className={classes.textRight}>
            <FormControl className={classes.formControl}>
              <Select
                value={this.state.period}
                onChange={this.periodChange}
                inputProps={{
                  name: 'period',
                  id: 'filter-simple'
                }}
              >
                <MenuItem value={-1}>Today</MenuItem>
                <MenuItem value={1}>Yesterday</MenuItem>
                <MenuItem value={7}>Last Week</MenuItem>
                <MenuItem value={30}>Last 30 Days</MenuItem>
                <MenuItem value={0}>All Time</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <WidgetCard
              widgetTitle="Trips Completed"
              widgetValue="15"
              WidgetIcon={DistanceIcon}
              widgetIconColor={COLOR_RANGE.green}
              cardElevation={0}
            />
            <Divider />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <WidgetCard
              widgetTitle="Bus Attendance"
              widgetValue="85%"
              WidgetIcon={BusAttnIcon}
              widgetIconColor={COLOR_RANGE.mainBlue}
              cardElevation={0}
            />
            <Divider />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <WidgetCard
              widgetTitle="Alerts"
              widgetValue="7"
              WidgetIcon={AlertIcon}
              widgetIconColor={COLOR_RANGE.red}
              cardElevation={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <WidgetCard
              widgetTitle="Delays"
              widgetValue=""
              WidgetIcon={IdleTimeIcon}
              widgetIconColor={COLOR_RANGE.orange}
              cardElevation={0}
            />
          </Grid>
        </Grid>
      </Paper>
    )
  }
}

export default withStyles(style)(DashboardSchoolTodayStats)
