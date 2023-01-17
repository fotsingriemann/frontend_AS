import React, { Component } from 'react'
import MapIcon from '@material-ui/icons/Map'
import EditLocation from '@material-ui/icons/EditLocation'
import { Paper, Tabs, Tab, Grid } from '@material-ui/core'

class RouteTabView extends Component {
  handleChange = (event, value) => {
    this.props.onTabChange(value)
  }

  render() {
    const { selectedTab } = this.props

    return (
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="center"
      >
        <Grid item xs={4}>
          <Paper elevation={8}>
            <Tabs
              value={selectedTab}
              onChange={this.handleChange}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab value={'view'} icon={<MapIcon />} label="View Route" />
              <Tab
                value={'create'}
                icon={<EditLocation />}
                label="Create Route"
              />
            </Tabs>
          </Paper>
        </Grid>
      </Grid>
    )
  }
}

export default RouteTabView
