import React, { Component } from 'react'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
  Paper,
  withStyles,
  Grid,
  Input,
  InputAdornment,
  Typography,
  TablePagination
} from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import TablePaginationActions from './TablePaginationActions'
import Badge from '../../common/Badge'

const HEALTH = {
  GOOD: {
    color: 'black',
    background: '#5eff23'
  },
  MODERATE: {
    color: 'black',
    background: '#f9d02a'
  },
  CRITICAL: {
    color: 'white',
    background: '#fc2a2a'
  }
}

const PaginatedVehicleTableStyles = theme => ({
  SearchBoxPadding: {
    padding: theme.spacing(2)
  },
  TableRow: {
    cursor: 'pointer',
    '&:hover': {
      background:
        theme.mode === 'dark' ? 'rgb(10, 10, 10)' : 'rgb(245, 245, 245)'
    }
  },
  PaperText: {
    padding: theme.spacing(2)
  },
  tableContainer: {
    overflowX: 'auto'
  }
})

class PaginatedVehicleTable extends Component {
  state = {
    searchTerm: '',
    page: 0,
    rowsPerPage: 5
  }

  handleChange = e => {
    const val = e.target.value
    let newState = {}
    if (val === '') {
      newState = {
        searchTerm: val
      }
    } else {
      newState = {
        searchTerm: val,
        page: 0
      }
    }
    this.setState(newState)
  }

  handleChangePage = (event, page) => this.setState({ page })

  handleChangeRowsPerPage = event =>
    this.setState({ page: 0, rowsPerPage: event.target.value })

  render() {
    const { rowsPerPage, page, searchTerm } = this.state
    const { classes, onVehicleChange, vehicles } = this.props

    if (vehicles.length === 0) {
      return (
        <Paper className={classes.PaperText}>
          <Typography align="center" variant="subtitle2">
            No OBD vehicles found
          </Typography>
        </Paper>
      )
    }

    const filteredVehicles = vehicles.filter(vehicle =>
      vehicle.vehicleNumber.includes(searchTerm)
    )

    return (
      <Paper className={classes.tableContainer}>
        <Grid container className={classes.SearchBoxPadding}>
          <Grid item>
            <Input
              value={searchTerm}
              onChange={this.handleChange}
              startAdornment={
                <InputAdornment>
                  <SearchIcon />
                </InputAdornment>
              }
              placeholder="Search Vehicle"
            />
          </Grid>
        </Grid>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vehicle Number</TableCell>
              <TableCell>Vehicle Type</TableCell>
              <TableCell>Vehicle Model</TableCell>
              <TableCell>Total DTCs till date</TableCell>
              <TableCell>Odometer Reading (km)</TableCell>
              <TableCell>Vehicle Score (%)</TableCell>
              <TableCell>Vehicle Health</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVehicles
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map(vehicle => (
                <TableRow
                  className={classes.TableRow}
                  key={vehicle.vehicleNumber}
                  onClick={() => onVehicleChange(vehicle)}
                >
                  <TableCell>{vehicle.vehicleNumber}</TableCell>
                  <TableCell>{vehicle.vehicleType}</TableCell>
                  <TableCell>{vehicle.vehicleModel}</TableCell>
                  <TableCell>{vehicle.totalDTCs}</TableCell>
                  <TableCell>{vehicle.latestOdometerKM}</TableCell>
                  <TableCell>{vehicle.vehicleScore}</TableCell>
                  <TableCell>
                    <Badge
                      color={HEALTH[vehicle.vehicleHealth].color}
                      background={HEALTH[vehicle.vehicleHealth].background}
                    >
                      {vehicle.vehicleHealth}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                colSpan={3}
                count={filteredVehicles.length}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                  native: true
                }}
                onChangePage={this.handleChangePage}
                onChangeRowsPerPage={this.handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </Paper>
    )
  }
}

export default withStyles(PaginatedVehicleTableStyles)(PaginatedVehicleTable)
