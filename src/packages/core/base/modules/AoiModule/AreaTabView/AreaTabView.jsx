import React, { Component } from 'react'
import Paper from '@material-ui/core/Paper'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import MapIcon from '@material-ui/icons/Map'
import EditLocation from '@material-ui/icons/EditLocation'
import Grid from '@material-ui/core/Grid'
import withStyles from '@material-ui/core/styles/withStyles'

const style = theme => ({
  searchClass: {
    marginBottom: '10px',
    overflow: 'visible'
  }
})

class AreaTabView extends Component {
  handleChange = (event, value) => {
    this.props.onTabChange(value)
  }

  handleAreaChange = selectedArea => {
    this.props.onSelectedAreaChange(selectedArea)
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
        {/* {selectedTab === 'view' ? (
          <Grid item xs={3} className={classes.searchClass}>
            <ComboBox
              items={areas || []}
              selectedItem={selectedArea}
              onSelectedItemChange={this.handleAreaChange}
              placeholder="Search created AOIs"
              isLoading={false}
              itemKey="id"
              itemToStringKey="areaName"
            />
          </Grid>
        ) : (
          <div />
        )} */}
        <Grid item xs={4}>
          <Paper elevation={8}>
            <Tabs
              value={selectedTab}
              onChange={this.handleChange}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab value={'view'} icon={<MapIcon />} label="View Area" />
              <Tab
                value={'create'}
                icon={<EditLocation />}
                label="Create Area"
              />
            </Tabs>
          </Paper>
        </Grid>
      </Grid>
    )
  }
}

export default withStyles(style)(AreaTabView)
