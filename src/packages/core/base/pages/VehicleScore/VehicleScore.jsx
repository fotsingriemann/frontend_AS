import React from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import OverspeedIcon from '@material-ui/icons/NetworkCheck'
import MUIDataTable from 'mui-datatables'
import WidgetCard from '@zeliot/common/ui/WidgetCard'
import { THEME_MAIN_COLORS as COLOR_RANGE } from '@zeliot/common/constants/styles'
import getLoginId from '@zeliot/common/utils/getLoginId'

import { withStyles, Grid, Typography } from '@material-ui/core'

const GET_ALL_VEHICLE_SCORES = gql`
  query getAllScoresByClientLogin($clientLoginId: Int!, $period: String!) {
    getAllScoresByClientLogin(clientLoginId: $clientLoginId, period: $period) {
      vehicleNumber
      score
      overSpeedCount
    }
  }
`

const styles = theme => ({
  root: {
    padding: theme.spacing(2),
    flexGrow: 1
  }
})

class VehicleScore extends React.Component {
  state = {
    selectedVehicle: null
  }

  clientId = []

  columns = [
    {
      name: 'Vehicle Number'
    },
    {
      name: 'Current Score (100)'
    },
    {
      name: 'Highest Score'
    },
    {
      name: 'OverSpeeds',
      options: {
        display: false
      }
    }
  ]

  options = {
    selectableRows: 'none',
    responsive: 'stacked',
    rowsPerPage: 25,
    onRowClick: rowData => {
      this.setState({ selectedVehicle: rowData })
    }
  }

  mapToArr(devices) {
    var rowData = []
    var fullData = []
    devices.forEach(element => {
      rowData = []
      rowData.push(element.vehicleNumber)
      rowData.push(element.score)
      rowData.push(element.score)
      rowData.push(element.overSpeedCount)
      fullData.push(rowData)
    })
    return fullData
  }

  handleClick = e => {
    this.props.history.push({
      pathname: '/home/manage-vehicles/groups'
    })
  }

  render() {
    const { classes } = this.props
    return (
      <Query
        query={GET_ALL_VEHICLE_SCORES}
        variables={{
          clientLoginId: getLoginId(),
          period: 'all'
        }}
      >
        {({ loading, error, data }) => {
          if (loading) return null
          if (error) return `Error!: ${error}`

          const vehicleScores = this.mapToArr(data.getAllScoresByClientLogin)

          return (
            <div className={classes.root}>
              <Grid container spacing={2}>
                <Grid
                  item
                  container
                  spacing={2}
                  justify="space-between"
                  alignItems="flex-start"
                >
                  <Grid item>
                    <Typography variant="h5">Vehicle Scores</Typography>
                  </Grid>
                </Grid>

                <Grid item xs={6}>
                  <MUIDataTable
                    data={vehicleScores}
                    columns={this.columns}
                    options={this.options}
                  />
                </Grid>

                <Grid item container xs={6}>
                  {this.state.selectedVehicle && (
                    <Grid item xs={6} sm={6} md={6}>
                      <WidgetCard
                        widgetTitle="Overspeed Counts"
                        widgetValue={this.state.selectedVehicle[3]}
                        WidgetIcon={OverspeedIcon}
                        widgetIconColor={COLOR_RANGE.red}
                      />
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </div>
          )
        }}
      </Query>
    )
  }
}

VehicleScore.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(VehicleScore)
