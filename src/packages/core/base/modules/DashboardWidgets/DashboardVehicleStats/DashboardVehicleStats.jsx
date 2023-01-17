import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withApollo } from 'react-apollo'
import PieChart from 'recharts/es6/chart/PieChart'
import Pie from 'recharts/es6/polar/Pie'
import {
  TRACKING_COLOR_RANGE,
  NONTRACKING_COLOR_RANGE
} from '@zeliot/common/constants/styles'
import Cell from 'recharts/es6/component/Cell'
import ResponsiveContainer from 'recharts/es6/component/ResponsiveContainer'
import Tooltip from 'recharts/es6/component/Tooltip'

import { Grid, withStyles, Typography, Paper } from '@material-ui/core'

const style = theme => ({
  statsTitle: {
    fontSize: 16,
    textAlign: 'center',
    verticalAlign: 'middle'
  },
  icon: {
    fontSize: 34,
    textAlign: 'center',
    color: '#FFFFFF'
  },
  textLeft: {
    textAlign: 'left'
  },
  textRight: {
    textAlign: 'right'
  },
  textMiddle: {
    verticalAlign: 'middle'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  topCard: {
    textAlign: 'center',
    padding: theme.spacing(2),
    verticalAlign: 'middle'
  },
  textCenter: {
    textAlign: 'center'
  },
  rightBorder: {
    borderRight: '1px',
    borderRightColor: '#000045',
    borderRightStyle: 'solid'
  },
  bottomBorder: {
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderBottomColor: '#c4c4c4'
  },
  leftBorder: {
    borderLeftStyle: 'solid',
    borderLeftWidth: '1px',
    borderLeftColor: '#c4c4c4'
  },
  cardHeader: {
    padding: theme.spacing(2)
  }
})

const StatsCards = ({
  classes,
  total,
  tracking,
  halt,
  running,
  idle,
  nogps,
  nontracking,
  offline,
  nodata,
  devicedead,
  tracked,
  nontracked
}) => (
  <Paper square elevation={2} className={classes.paper}>
    <Grid container justify="space-between" alignItems="center" spacing={2}>
      <Grid item xs={6} className={classes.cardHeader}>
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie
              dataKey="value"
              data={tracked}
              startAngle={180}
              endAngle={0}
              innerRadius="70%"
              outerRadius="100%"
              fill="#8884d8"
              paddingAngle={3}
            >
              {tracked.map((entry, index) => (
                <Cell
                  key={entry}
                  fill={
                    TRACKING_COLOR_RANGE[index % TRACKING_COLOR_RANGE.length]
                  }
                />
              ))}
            </Pie>
            <Tooltip active={true} />
          </PieChart>
        </ResponsiveContainer>
      </Grid>
      <Grid item xs={6} className={classes.cardHeader}>
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie
              dataKey="value"
              data={nontracked}
              startAngle={180}
              endAngle={0}
              innerRadius="70%"
              outerRadius="100%"
              fill="#8884d8"
              paddingAngle={3}
            >
              {nontracked.map((entry, index) => (
                <Cell
                  key={entry}
                  fill={
                    NONTRACKING_COLOR_RANGE[
                    index % NONTRACKING_COLOR_RANGE.length
                    ]
                  }
                />
              ))}
            </Pie>
            <Tooltip active={true} />
          </PieChart>
        </ResponsiveContainer>
      </Grid>
      <Grid item xs={6}>
        <Grid
          container
          justify="space-between"
          alignItems="center"
          spacing={1}
          className={classes.textCenter}
        >
          <Grid item xs={12} className={classes.bottomBorder}>
            <Typography variant="caption">Tracking</Typography>
            <Typography variant="h6">{tracking}</Typography>
          </Grid>
          <Grid item xs={6} className={classes.bottomBorder}>
            <Typography variant="caption">Running</Typography>
            <Typography variant="h6" style={{ color: TRACKING_COLOR_RANGE[0] }}>
              {running}
            </Typography>
          </Grid>
          <Grid item xs={6} className={classes.bottomBorder}>
            <Typography variant="caption">Idle</Typography>
            <Typography variant="h6" style={{ color: TRACKING_COLOR_RANGE[1] }}>
              {idle}
            </Typography>
          </Grid>
          <Grid item xs={6} className={classes.bottomBorder}>
            <Typography variant="caption">HaltS</Typography>
            <Typography variant="h6" style={{ color: TRACKING_COLOR_RANGE[2] }}>
              {halt}
            </Typography>
          </Grid>
          <Grid item xs={6} className={classes.bottomBorder}>
            <Typography variant="caption">No GPS</Typography>
            <Typography variant="h6" style={{ color: TRACKING_COLOR_RANGE[3] }}>
              {nogps}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={6}>
        <Grid
          container
          justify="space-between"
          alignItems="center"
          spacing={1}
          className={classes.textCenter}
        >
          <Grid item xs={12} className={classes.bottomBorder}>
            <Typography variant="caption">Non Tracking</Typography>
            <Typography variant="h6">{nontracking}</Typography>
          </Grid>
          <Grid item xs={6} className={classes.bottomBorder}>
            <Typography variant="caption">Offline</Typography>
            <Typography
              variant="h6"
              style={{ color: NONTRACKING_COLOR_RANGE[0] }}
            >
              {offline}
            </Typography>
          </Grid>
          <Grid item xs={6} className={classes.bottomBorder}>
            <Typography variant="caption">No Data</Typography>
            <Typography
              variant="h6"
              style={{ color: NONTRACKING_COLOR_RANGE[1] }}
            >
              {nodata}
            </Typography>
          </Grid>
          <Grid item xs={6} className={classes.bottomBorder}>
            <Typography variant="caption">Device Dead</Typography>
            <Typography
              variant="h6"
              style={{ color: NONTRACKING_COLOR_RANGE[2] }}
            >
              {devicedead}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  </Paper>
)

StatsCards.propTypes = {
  classes: PropTypes.object.isRequired,
  total: PropTypes.number.isRequired,
  halt: PropTypes.number.isRequired,
  running: PropTypes.number.isRequired,
  idle: PropTypes.number.isRequired,
  nogps: PropTypes.number.isRequired
}

StatsCards.defaultProps = {
  total: 0,
  tracking: 0,
  idle: 0,
  halt: 0,
  nogps: 0,
  running: 0,
  nontracking: 0,
  offline: 0,
  nodata: 0,
  devicedead: 0
}

class DashboardVehicleStats extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired
  }

  render() {
    const { classes, stats } = this.props
    const trackedData = [
      { name: 'Running', value: stats.running },
      { name: 'Idle', value: stats.idle },
      { name: 'Halt', value: stats.halt },
      { name: 'No GPS', value: stats.nogps }
    ]
    const nonTrackedData = [
      { name: 'Offline', value: stats.offline },
      { name: 'No Data', value: stats.nodata },
      { name: 'Device Dead', value: stats.devicedead }
    ]
    return (
      <StatsCards
        total={stats.total}
        tracking={stats.tracking}
        running={stats.running}
        idle={stats.idle}
        halt={stats.halt}
        nogps={stats.nogps}
        nontracking={stats.nontracking}
        offline={stats.offline}
        nodata={stats.nodata}
        devicedead={stats.devicedead}
        classes={classes}
        tracked={trackedData}
        nontracked={nonTrackedData}
      />
    )
  }
}

export default withStyles(style)(withApollo(DashboardVehicleStats))
