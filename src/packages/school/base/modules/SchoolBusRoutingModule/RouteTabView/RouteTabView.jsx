import React, { Component } from 'react'
import MapIcon from '@material-ui/icons/Map'
import EditLocation from '@material-ui/icons/EditLocation'
import ComboBox from '@zeliot/common/ui/ComboBox'

import { Paper, Tabs, Tab, Grid, withStyles } from '@material-ui/core'

const style = theme => ({
  searchClass: {
    marginBottom: '10px',
    overflow: 'visible'
  }
})

class RouteTabView extends Component {
  handleChange = (event, value) => {
    this.props.onTabChange(value)
  }

  handleRouteChange = selectedRoute => {
    this.props.onSelectedRouteChange(selectedRoute)
  }

  render() {
    const { classes, routes, selectedRoute, selectedTab } = this.props

    return (
      <Grid
        container
        direction="row-reverse"
        justify="space-between"
        alignItems="center"
      >
        {selectedTab === 'view' ? (
          <Grid item xs={3} className={classes.searchClass}>
            <ComboBox
              items={routes || []}
              selectedItem={selectedRoute}
              onSelectedItemChange={this.handleRouteChange}
              placeholder="Search created routes"
              isLoading={false}
              itemKey="id"
              itemToStringKey="routeName"
            />
          </Grid>
        ) : (
          <div />
        )}
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

export default withStyles(style)(RouteTabView)
