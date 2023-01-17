import React, { Component } from 'react'
import BookIcon from '@material-ui/icons/Book'
import Bookmark from '@material-ui/icons/Bookmark'
import Schedule from '@material-ui/icons/Schedule'
import History from '@material-ui/icons/History'
import DateRange from '@material-ui/icons/DateRange'
import Watch from '@material-ui/icons/Watch'
import CalendarToday from '@material-ui/icons/CalendarToday'
import SettingsEthernet from '@material-ui/icons/SettingsEthernet'

import {
  Paper,
  withStyles,
  List,
  ListItem,
  ListItemIcon,
  Divider,
  Typography,
  Grid,
  ListItemText
} from '@material-ui/core'

const styles = theme => ({
  textField: {
    marginTop: theme.spacing(1),
    marginButton: theme.spacing(1)
  },
  listClass: {
    padding: theme.spacing(2)
  }
})

class SchoolTripView extends Component {
  render() {
    const { classes, selectedTrip } = this.props
    return (
      <Paper square elevation={8} style={{ height: '450px', overflow: 'auto' }}>
        <List component="nav" className={classes.listClass}>
          <ListItem>
            <ListItemIcon>
              <Bookmark />
            </ListItemIcon>
            <ListItemText>
              <Grid container className={classes.textField} alignItems="center">
                <Grid item sm={6}>
                  <Typography color="textSecondary">Trip name</Typography>
                </Grid>
                <Grid item sm={6}>
                  <Typography gutterBottom align="center">
                    {selectedTrip ? selectedTrip.tripName : ''}
                  </Typography>
                </Grid>
              </Grid>
            </ListItemText>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <BookIcon />
            </ListItemIcon>
            <ListItemText>
              <Grid container className={classes.textField} alignItems="center">
                <Grid item sm={6}>
                  <Typography color="textSecondary">Trip type</Typography>
                </Grid>
                <Grid item sm={6}>
                  <Typography gutterBottom align="center">
                    {selectedTrip
                      ? selectedTrip.tripType === 'PICKUP'
                        ? 'Pickup'
                        : 'Drop'
                      : ''}
                  </Typography>
                </Grid>
              </Grid>
            </ListItemText>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <DateRange />
            </ListItemIcon>
            <ListItemText>
              <Grid container className={classes.textField} alignItems="center">
                <Grid item sm={6}>
                  <Typography color="textSecondary">Scheduled for</Typography>
                </Grid>
                <Grid item sm={6}>
                  <Typography gutterBottom align="center">
                    {selectedTrip
                      ? selectedTrip.scheduledDays.scheduledDays.join(', ')
                      : ''}
                  </Typography>
                </Grid>
              </Grid>
            </ListItemText>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <History />
            </ListItemIcon>
            <ListItemText>
              <Grid container className={classes.textField} alignItems="center">
                <Grid item sm={6}>
                  <Typography color="textSecondary">
                    Scheduled frequency
                  </Typography>
                </Grid>
                <Grid item sm={6}>
                  <Typography gutterBottom align="center">
                    {selectedTrip ? selectedTrip.schedulingFrequency : ''}
                  </Typography>
                </Grid>
              </Grid>
            </ListItemText>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <Schedule />
            </ListItemIcon>
            <ListItemText>
              <Grid container className={classes.textField} alignItems="center">
                <Grid item sm={6}>
                  <Typography color="textSecondary">
                    {selectedTrip
                      ? selectedTrip.tripType === 'PICKUP'
                        ? 'School start time'
                        : 'School end time'
                      : 'School Time'}
                  </Typography>
                </Grid>
                <Grid item sm={6}>
                  <Typography gutterBottom align="center">
                    {selectedTrip ? selectedTrip.schoolTime : ''}
                  </Typography>
                </Grid>
              </Grid>
            </ListItemText>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <Watch />
            </ListItemIcon>
            <ListItemText>
              <Grid container className={classes.textField} alignItems="center">
                <Grid item sm={6}>
                  <Typography color="textSecondary">
                    Time at each stop
                  </Typography>
                </Grid>
                <Grid item sm={6}>
                  <Typography gutterBottom align="center">
                    {selectedTrip ? selectedTrip.stoppageTime : ''}
                  </Typography>
                </Grid>
              </Grid>
            </ListItemText>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <SettingsEthernet />
            </ListItemIcon>
            <ListItemText>
              <Grid container className={classes.textField} alignItems="center">
                <Grid item sm={6}>
                  <Typography color="textSecondary">
                    Tolerance duration
                  </Typography>
                </Grid>
                <Grid item sm={6}>
                  <Typography gutterBottom align="center">
                    {selectedTrip ? selectedTrip.tolerance : ''}
                  </Typography>
                </Grid>
              </Grid>
            </ListItemText>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <CalendarToday />
            </ListItemIcon>
            <ListItemText>
              <Grid container className={classes.textField} alignItems="center">
                <Grid item sm={6}>
                  <Typography color="textSecondary">Created on</Typography>
                </Grid>
                <Grid item sm={6}>
                  <Typography gutterBottom align="center">
                    {selectedTrip ? selectedTrip.createdAt : ''}
                  </Typography>
                </Grid>
              </Grid>
            </ListItemText>
          </ListItem>
          <Divider />
        </List>
      </Paper>
    )
  }
}

export default withStyles(styles)(SchoolTripView)
