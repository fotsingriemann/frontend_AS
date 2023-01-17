import React, { Component } from 'react'
import LiveIcon from '@material-ui/icons/MyLocation'
import PersonPinIcon from '@material-ui/icons/PersonPin'
import { Paper, Tabs, Tab, Grid, withStyles } from '@material-ui/core'

const style = theme => ({
  searchClass: {
    marginBottom: '10px',
    overflow: 'visible'
  },
  textLeft: {
    textAlign: 'left'
  }
})

class MapTabView extends Component {
  handleChange = (event, value) => {
    this.props.onTabChange(value)
  }

  handleSelectedVehicleChange = selectedVehicle => {
    if (!selectedVehicle) {
      this.props.onTabChange('overview')
    }
    this.props.onSelectedVehicleChange(selectedVehicle)
  }

  get showTabs() {
    return (
      this.props.selectedVehicle &&
      (this.props.selectedTab === 'live' || this.props.selectedTab === 'replay')
    )
  }

  render() {
    const { selectedTab, isReplayActive } = this.props

    return (
      <Grid container justify="space-between" alignItems="center">
        <Grid item>
          {this.showTabs && (
            <Paper square>
              <Tabs
                value={selectedTab}
                onChange={this.handleChange}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab
                  value="live"
                  icon={<LiveIcon />}
                  label="Tracking Live"
                  disabled={isReplayActive}
                />
                <Tab
                  value="replay"
                  icon={<PersonPinIcon />}
                  label="Travel Replay"
                />
              </Tabs>
            </Paper>
          )}
        </Grid>
      </Grid>
    )
  }
}

export default withStyles(style)(MapTabView)
