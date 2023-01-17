import React, { Component } from 'react'
import PropTypes from 'prop-types'
import getLoginId from '@zeliot/common/utils/getLoginId'
import { Query } from 'react-apollo'
import ComboBox from '@zeliot/common/ui/ComboBox'
import gql from 'graphql-tag'
import {
  LinearProgress,
  Tooltip,
  withStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Grid,
  CircularProgress
} from '@material-ui/core'

const GET_ALL_VEHICLES = gql`
  query($loginId: Int!) {
    vehicles: getAllVehicleDetails(clientLoginId: $loginId, status: [1, 3]) {
      entityId
      vehicleNumber
      deviceDetail {
        uniqueDeviceId
      }
    }
  }
`

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
    overflowX: 'auto'
  },
  table: {
    minWidth: 700
  },
  tableHead: {
    padding: theme.spacing(2)
  },
  progressBar: {
    height: '20px',
    width: '75px',
    borderRadius: '5px'
  }
})

class SummaryDashboard extends Component {
  state = {
    selectedVehicle: null
  }

  handleVehicleChange = selectedVehicle => {
    this.setState({ selectedVehicle })
  }

  render() {
    return (
      <Grid container alignItems="center">
        <Query query={GET_ALL_VEHICLES} variables={{ loginId: getLoginId() }}>
          {({ loading, error, data }) => {
            if (loading) {
              return (
                <Grid item>
                  <CircularProgress />
                </Grid>
              )
            }

            if (error) {
              return this.props.openSnackbar('Failed to fetch vehicles')
            }

            if (data && data.vehicles) {
              return (
                <div>
                  <Grid item sm={12}>
                    <FleetTable
                      classes={this.props.classes}
                      vehicles={data.vehicles}
                      selectedVehicle={this.state.selectedVehicle}
                      handleVehicleChange={this.handleVehicleChange}
                    />
                  </Grid>
                </div>
              )
            } else return null
          }}
        </Query>
      </Grid>
    )
  }
}

export default withStyles(styles)(SummaryDashboard)

function FleetTable(props) {
  const { classes, vehicles, selectedVehicle } = props

  return (
    <Paper className={classes.root}>
      <Table className={classes.table}>
        <TableHead>
          <Grid
            container
            justify="space-between"
            alignItems="center"
            className={classes.tableHead}
          >
            <Grid item>
              <ComboBox
                placeholder="Search Vehicle"
                items={vehicles || []}
                itemKey="uniqueId"
                itemToStringKey="vehicleNumber"
                selectedItem={selectedVehicle}
                onSelectedItemChange={props.handleVehicleChange}
                filterSize={25}
              />
            </Grid>
          </Grid>
          <TableRow>
            <TableCell align="center">Vehicle Number</TableCell>
            <TableCell align="center">Route assigned</TableCell>
            <TableCell align="center">Vehicle status</TableCell>
            <TableCell align="center">Speed (km/h)</TableCell>
            <TableCell align="center">SOC (%)</TableCell>
            <TableCell align="center">Remaining range (km)</TableCell>
            <TableCell align="center">Trip progress(%)</TableCell>
            <TableCell align="center">Distance covered</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell component="th" scope="row">
              KA25MA5654
            </TableCell>
            <TableCell>dsfdas</TableCell>
            <TableCell>sadf</TableCell>
            <TableCell>asdf</TableCell>
            <Tooltip title="40%">
              <TableCell>
                <ProgressTab progress={40} classes={props.classes} />
              </TableCell>
            </Tooltip>
            <TableCell>dsfdas</TableCell>
            <TableCell>sadf</TableCell>
            <TableCell>asdf</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Paper>
  )
}

FleetTable.propTypes = {
  classes: PropTypes.object.isRequired
}

function ProgressTab(props) {
  const { progress, colorScheme, classes } = props

  return (
    <LinearProgress
      color={colorScheme}
      variant="buffer"
      value={progress}
      classes={{
        root: classes.progressBar
      }}
    />
  )
}

ProgressTab.propTypes = {
  classes: PropTypes.object.isRequired,
  progress: PropTypes.number.isRequired
}

ProgressTab.defaultProps = {
  colorScheme: 'primary'
}
