import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  Divider,
  Grid,
  Paper,
  withStyles,
  Typography,
  Table,
  TableCell,
  TableRow,
  TableBody,
  TableHead,
  Button
} from '@material-ui/core'

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
  cardHeader: {
    padding: theme.spacing(2)
  }
})

let id = 0
function createData(busnumber, triptype, routenumber, start, end) {
  id += 1
  return { id, busnumber, triptype, routenumber, start, end }
}

const rows = [
  createData(
    'KA 01 FB 1546',
    'Pickup',
    'A',
    'September 28, 07:15 am',
    'September 28, 08:45 pm'
  ),
  createData(
    'KA 03 M 2795',
    'Pickup',
    'B',
    'September 28, 07:45 am',
    'September 28, 08:45 pm'
  ),
  createData(
    'KA 53 FA 8791',
    'Pickup',
    'C',
    'September 28, 07:30 am',
    'September 28, 08:45 pm'
  ),
  createData(
    'KA 02 PA 1358',
    'Drop',
    'P',
    'September 28, 03:30 pm',
    'September 28, 05:10 pm'
  ),
  createData(
    'KA 04 G 6874',
    'Drop',
    'Q',
    'September 28, 03:30 pm',
    'September 28, 05:25 pm'
  )
]

class DashboardSchoolUpcomingTrips extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired
  }

  render() {
    const { classes } = this.props

    return (
      <Paper square elevation={6} className={classes.paper}>
        <Grid container justify="space-between" alignItems="center" spacing={1}>
          <Grid item xs={12}>
            <Grid container justify="space-between" alignItems="center">
              <Grid item>
                <Typography
                  variant="h5"
                  className={classes.textLeft}
                  gutterBottom
                >
                  Upcoming Trips
                </Typography>
              </Grid>
              <Grid item>
                <Button>Edit</Button>
              </Grid>
            </Grid>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bus Number</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Route Number</TableCell>
                  <TableCell>Scheduled Start</TableCell>
                  <TableCell>Scheduled End</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(row => {
                  return (
                    <TableRow key={row.id}>
                      <TableCell>{row.busnumber}</TableCell>
                      <TableCell>{row.triptype}</TableCell>
                      <TableCell>{row.routenumber}</TableCell>
                      <TableCell>{row.start}</TableCell>
                      <TableCell>{row.end}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Grid>
        </Grid>
      </Paper>
    )
  }
}

export default withStyles(style)(DashboardSchoolUpcomingTrips)
