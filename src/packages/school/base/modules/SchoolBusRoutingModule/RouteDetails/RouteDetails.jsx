import React, { Component, Fragment } from 'react'
import BookIcon from '@material-ui/icons/Book'
import ListIcon from '@material-ui/icons/List'
import CalendarIcon from '@material-ui/icons/CalendarToday'
import AssignedVehicleIcon from '@material-ui/icons/DepartureBoard'
import RouteDetailExpansion from '../RouteDetailExpansion'

import {
  withStyles,
  List,
  ListItem,
  ListItemIcon,
  Divider,
  Typography,
  Grid
} from '@material-ui/core'

const styles = theme => ({
  chip: {
    margin: theme.spacing(1)
  },
  textField: {
    marginTop: theme.spacing(1),
    marginButtom: theme.spacing(1)
  },
  listClass: {
    padding: theme.spacing(2)
  }
})

class RouteDetails extends Component {
  render() {
    const { classes, routeName, createdOn, routes, type } = this.props
    return (
      <Fragment>
        <List component="nav" className={classes.listClass}>
          <ListItem>
            <ListItemIcon>
              <BookIcon />
            </ListItemIcon>
            <Grid container className={classes.textField}>
              <Grid item sm={6}>
                <Typography color="textSecondary">Route name</Typography>
              </Grid>
              <Grid item sm={6}>
                <Typography gutterBottom>{routeName}</Typography>
              </Grid>
            </Grid>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <ListIcon />
            </ListItemIcon>
            <Grid container className={classes.textField}>
              <Grid item sm={6}>
                <Typography color="textSecondary">Route type</Typography>
              </Grid>
              <Grid item sm={6}>
                <Typography gutterBottom>
                  {type
                    ? type === 'PICKUP'
                      ? 'Pickup Route'
                      : 'Drop Route'
                    : null}
                </Typography>
              </Grid>
            </Grid>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <AssignedVehicleIcon />
            </ListItemIcon>
            <Grid container className={classes.textField}>
              <Grid item sm={6}>
                <Typography color="textSecondary">
                  Subroutes involved
                </Typography>
              </Grid>
            </Grid>
          </ListItem>
          {routes &&
            routes.map((route, index) => (
              // console.log(route)
              <RouteDetailExpansion
                route={route}
                key={index}
                index={index}
                routeOnViewHovered={this.props.routeOnViewHovered}
              />
            ))}
          <Divider />
          <ListItem>
            <ListItemIcon>
              <CalendarIcon />
            </ListItemIcon>
            <Grid container className={classes.textField}>
              <Grid item sm={6}>
                <Typography color="textSecondary">Created on</Typography>
              </Grid>
              <Grid item sm={6}>
                <Typography>{createdOn}</Typography>
              </Grid>
            </Grid>
          </ListItem>
        </List>
      </Fragment>
    )
  }
}

export default withStyles(styles)(RouteDetails)
