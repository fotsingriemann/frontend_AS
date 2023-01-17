import React, { Component } from 'react'
import LiveIcon from '@material-ui/icons/MyLocation'
import PersonPinIcon from '@material-ui/icons/PersonPin'
import { Paper, Tabs, Tab, Grid, withStyles } from '@material-ui/core'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

const style = (theme) => ({
  searchClass: {
    marginBottom: '10px',
    overflow: 'visible',
  },
  textLeft: {
    textAlign: 'left',
  },
})

class MapTabView extends Component {
  handleChange = (event, value) => {
    this.props.onTabChange(value)
  }

  handleSelectedVehicleChange = (selectedVehicle) => {
    if (!selectedVehicle) {
      this.props.onTabChange('overview')
    }
    this.props.onSelectedVehicleChange(selectedVehicle)
  }

  render() {
    const {
      selectedVehicle,
      selectedTab,
      isReplayActive,
      selectedLanguage,
    } = this.props

    return (
      <Grid container justify="space-between" alignItems="center">
        <Grid item>
          {selectedVehicle && (
            <Paper square>
              <Tabs
                value={selectedTab}
                onChange={this.handleChange}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab
                  value={'live'}
                  icon={<LiveIcon />}
                  label={
                    languageJson[selectedLanguage].mainDashboardPage
                      .trackingLiveTab.tabBarTitle
                  }
                  disabled={isReplayActive}
                />
                <Tab
                  value={'replay'}
                  icon={<PersonPinIcon />}
                  label={
                    languageJson[selectedLanguage].mainDashboardPage
                      .travelReplayTab.tabBarTitle
                  }
                />
              </Tabs>
            </Paper>
          )}
        </Grid>
      </Grid>
    )
  }
}

export default withLanguage(withStyles(style)(MapTabView))
