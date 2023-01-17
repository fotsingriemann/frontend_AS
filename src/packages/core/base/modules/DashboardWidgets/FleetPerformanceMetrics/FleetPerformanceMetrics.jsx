import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import UtilIcon from '@material-ui/icons/Functions'
import RatioIcon from '@material-ui/icons/DonutLarge'
import PenaltyIcon from '@material-ui/icons/Warning'
import { GET_FLEET_PERFORMANCE } from '@zeliot/common/graphql/queries'
import WidgetCard from '@zeliot/common/ui/WidgetCard'
import { THEME_MAIN_COLORS as COLOR_RANGE } from '@zeliot/common/constants/styles'
import getLoginId from '@zeliot/common/utils/getLoginId'

import {
  Grid,
  withStyles,
  Typography,
  MenuItem,
  FormControl,
  Select
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

  utilizationToString(util) {
    if (util) {
      return '' + util.toString() + ' %'
    }
    return '--'
  }

  idleToRun(idleTime, runTime) {
    if (runTime && idleTime && runTime !== 0) {
      const result = (idleTime / runTime).toFixed(2)
      return isNaN(result) ? '--' : result
    } else return '--'
  }

  render() {
    const { classes } = this.props
    return (
      <Query
        query={GET_FLEET_PERFORMANCE}
        variables={{
          loginId: getLoginId(),
          period: this.periodForQuery(this.state.period)
        }}
      >
        {({ data }) => {
          let runTime = 0
          let idlingTime = 0
          let fleetUtilization = 0
          if (data && data.getAggregatedCounts) {
            runTime = data.getAggregatedCounts.run_time
            idlingTime = data.getAggregatedCounts.idling_time
            fleetUtilization = data.getAggregatedCounts.fleet_utilization
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
                    Fleet Performance Metrics
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
              <Grid
                container
                justify="flex-start"
                alignItems="flex-start"
                spacing={1}
              >
                <Grid item xs={12} sm={6} md={3}>
                  <WidgetCard
                    widgetTitle="Fleet Utilization"
                    widgetValue={this.utilizationToString(fleetUtilization)}
                    WidgetIcon={UtilIcon}
                    widgetIconColor={COLOR_RANGE.red}
                    isDescriptionAvailable={true}
                    widgetDescription="A vehicle is considered utilized if vehicle runs for more than 30 minutes in a day"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <WidgetCard
                    widgetTitle="Idle to Run Ratio"
                    widgetValue={this.idleToRun(idlingTime, runTime)}
                    WidgetIcon={RatioIcon}
                    widgetIconColor={COLOR_RANGE.mainBlue}
                    isDescriptionAvailable={true}
                    widgetDescription="Ratio of how long the vehicles were idle compared to running"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <WidgetCard
                    widgetTitle="Penalties"
                    widgetValue={this.props.penalties.toString()}
                    WidgetIcon={PenaltyIcon}
                    widgetIconColor={COLOR_RANGE.red}
                    isDescriptionAvailable={true}
                    widgetDescription="Number of critical alerts generated over the selected duration"
                    onCardClick={() =>
                      this.props.handleCardClick(
                        'alerts',
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
