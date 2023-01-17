import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import RunTimeIcon from '@material-ui/icons/Timelapse'
import IdleTimeIcon from '@material-ui/icons/Timer'
import DistanceIcon from '@material-ui/icons/Straighten'
import FuelIcon from '@material-ui/icons/LocalGasStation'
import { GET_FLEET_USAGE } from '@zeliot/common/graphql/queries'
import { THEME_MAIN_COLORS as COLOR_RANGE } from '@zeliot/common/constants/styles'
import WidgetCard from '@zeliot/common/ui/WidgetCard'
import getLoginId from '@zeliot/common/utils/getLoginId'

import {
  Grid,
  Typography,
  MenuItem,
  FormControl,
  Select,
  withStyles
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
    color: theme.palette.text.secondary
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  }
})

class FleetUsageMetrics extends Component {
  state = {
    period: 1,
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
    if (time < 61) {
      strTime += time + ' sec'
      return strTime.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    } else {
      const min = Math.floor(time / 60)
      if (min < 601) {
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
      <Query
        query={GET_FLEET_USAGE}
        variables={{
          loginId: getLoginId(),
          period: this.periodForQuery(this.state.period)
        }}
      >
        {({ loading, error, data }) => {
          let distance = 0
          let runTime = 0
          let idlingTime = 0
          let fuelConsumed = 0
          let distanceTrend = 0
          let runningTrend = 0
          let idlingTrend = 0
          let fuelTrend = 0
          const period = this.periodForQuery(this.state.period)
          if (data && data.getAggregatedCounts) {
            distance = data.getAggregatedCounts.distance
            runTime = data.getAggregatedCounts.run_time
            idlingTime = data.getAggregatedCounts.idling_time
            fuelConsumed = data.getAggregatedCounts.fuel_consumed
            distanceTrend = data.getAggregatedCounts.dist_change
            runningTrend = data.getAggregatedCounts.run_time_change
            idlingTrend = data.getAggregatedCounts.idling_time_change
            fuelTrend = data.getAggregatedCounts.fuel_consumed_change
          }

          return (
            <div>
              <Grid
                container
                justify="space-between"
                alignItems="center"
                spacing={1}
              >
                <Grid item xs={6} className={classes.textLeft}>
                  <Typography variant="button" color="textSecondary">
                    Fleet Usage Metrics
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
                      <MenuItem value={1}>Last Day</MenuItem>
                      <MenuItem value={7}>Last Week</MenuItem>
                      <MenuItem value={30}>Last 30 Days</MenuItem>
                      <MenuItem value={0}>All Time</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container justify="center" alignItems="center" spacing={1}>
                <Grid item xs={12} sm={6} md={3}>
                  <WidgetCard
                    widgetTitle="Fleet Distance"
                    widgetValue={this.distanceToString(distance)}
                    WidgetIcon={DistanceIcon}
                    widgetIconColor={COLOR_RANGE.red}
                    widgetTrend={distanceTrend}
                    trendPeriod={period}
                    onCardClick={() =>
                      this.props.handleCardClick(
                        'distance',
                        this.periodForQuery(this.state.period)
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <WidgetCard
                    widgetTitle="Running Time"
                    widgetValue={this.timeToString(runTime)}
                    WidgetIcon={RunTimeIcon}
                    widgetIconColor={COLOR_RANGE.green}
                    widgetTrend={runningTrend}
                    trendPeriod={period}
                    onCardClick={() =>
                      this.props.handleCardClick(
                        'running',
                        this.periodForQuery(this.state.period)
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <WidgetCard
                    widgetTitle="Idling Time"
                    widgetValue={this.timeToString(idlingTime)}
                    WidgetIcon={IdleTimeIcon}
                    widgetIconColor={COLOR_RANGE.orange}
                    widgetTrend={idlingTrend}
                    trendPeriod={period}
                    onCardClick={() =>
                      this.props.handleCardClick(
                        'idling',
                        this.periodForQuery(this.state.period)
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <WidgetCard
                    widgetTitle="Fuel Consumed"
                    widgetValue={this.fuelToString(fuelConsumed)}
                    WidgetIcon={FuelIcon}
                    widgetIconColor={COLOR_RANGE.blue}
                    widgetTrend={fuelTrend}
                    trendPeriod={period}
                    onCardClick={() =>
                      this.props.handleCardClick(
                        'fuel',
                        this.periodForQuery(this.state.period)
                      )
                    }
                  />
                </Grid>
              </Grid>
            </div>
          )
        }}
      </Query>
    )
  }
}

export default withStyles(style)(FleetUsageMetrics)
