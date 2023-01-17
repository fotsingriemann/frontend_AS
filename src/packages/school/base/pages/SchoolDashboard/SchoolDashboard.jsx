import React, { Component } from 'react'
import { withApollo } from 'react-apollo'
import withGoogleMaps from '@zeliot/common/hoc/withGoogleMaps'
import DashSchoolDetails from '@zeliot/school/base/modules/DashboardWidgets/DashboardSchoolDetails'
import DashSchoolUpcomingTrips from '@zeliot/school/base/modules/DashboardWidgets/DashboardSchoolUpcomingTrips'
import DashSchoolTodayStats from '@zeliot/school/base/modules/DashboardWidgets/DashboardSchoolTodayStats'

import {
  withStyles,
  Grid,
  Typography,
  Divider,
  Button
} from '@material-ui/core'

const style = theme => ({
  root: {
    padding: theme.spacing(2)
  },
  textCenter: {
    textAlign: 'center'
  },
  textRight: {
    textAlign: 'right'
  },
  textleft: {
    textAlign: 'left'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  rightIcon: {
    marginLeft: theme.spacing(1)
  },
  widgetIcon: {
    fontSize: 60
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
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
  }
})

class SchoolDashboard extends Component {
  state = {
    filter: 1,
    vehicles: {},
    markers: {},
    map: null,
    selectedStatus: 'running',
    stats: {
      total: 0,
      running: 0,
      idle: 0,
      halt: 0,
      noGps: 0
    }
  }

  componentDidMount = () => {
    this._isMounted = true
  }

  componentWillUnmount = () => {
    this._isMounted = false
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  handleStatusChange = event => {
    const status = event.target.value
    this.setState({ selectedStatus: status.toString() }, () => {
      this.updateData(this.state.vehicles)
    })
  }

  render() {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container justify="flex-start" alignItems="center">
              <Grid item>
                <Typography variant="h5" className={classes.textLeft}>
                  Dashboard
                </Typography>
              </Grid>
            </Grid>

            <Divider />
          </Grid>
          <Grid item xs={7}>
            <DashSchoolTodayStats />
          </Grid>
          <Grid item xs={5}>
            <DashSchoolDetails />
          </Grid>
          <Grid item xs={12}>
            <DashSchoolUpcomingTrips />
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withGoogleMaps(withApollo(withStyles(style)(SchoolDashboard)))
