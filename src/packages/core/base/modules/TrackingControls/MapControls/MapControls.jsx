import React, { Component, Fragment } from 'react'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import RadioGroup from '@material-ui/core/RadioGroup'
import Radio from '@material-ui/core/Radio'
import { DateTimePicker } from 'material-ui-pickers'
import withStyles from '@material-ui/core/styles/withStyles'
import Query from 'react-apollo/Query'
import graphql from 'react-apollo/graphql'
import gql from 'graphql-tag'
import ComboBox from '@zeliot/common/ui/Combobox'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import DateRangeIcon from '@material-ui/icons/DateRange'
import TimeRangeIcon from '@material-ui/icons/AccessTime'

const GET_ALL_DEVICES = gql`
  query getAllDevices($clientId: String!) {
    devices: getAllDeviceLocationsByClientLogin(clientLogin: $clientId) {
      uniqueId
      timestamp
      latitude
      longitude
      idlingStatus
      haltStatus
      # isOverspeed
    }
  }
`

const GET_MAP_CONTROL_PROPS = gql`
  query mapControlProps {
    selectedVehicle @client {
      uniqueId
      timestamp
      latitude
      longitude
      # isOverspeed
    }
  }
`

const style = theme => ({
  cardClass: {
    marginBottom: '10px',
    overflow: 'visible'
  },
  gridItem: {
    margin: '0 20px'
  },
  cardContent: {
    '&:last-child': {
      padding: '8px 16px',
      minHeight: '64px'
    },
    display: 'flex',
    alignItems: 'center'
  },
  cssUnderline: {
    '&:after': {
      borderBottomColor: '#96ED1E'
    }
  },
  radioButtonGroup: {
    flexDirection: 'row',
    padding: '0 20px'
  },
  checkedRadioButton: {
    color: '#96ED1E !important'
  },
  dateTimePicker: {
    margin: '0px 20px'
  }
})

class MapControls extends Component {
  state = {
    trackingMode: 'live',
    fromDate: null,
    toDate: null,
    menuAnchor: React.createRef()
  }

  handleInputChange = key => e => {
    this.setState({ [key]: e.target.value })
  }

  handleDateChange = key => date => {
    this.setState({ [key]: date })
  }

  setMenuAnchor = set => e => {
    if (set) {
      this.setState({ menuAnchor: e.currentTarget })
    } else {
      this.setState({ menuAnchor: undefined })
    }
  }

  render() {
    const {
      classes,
      mapControlProps: { selectedVehicle }
    } = this.props

    return (
      <Query query={GET_ALL_DEVICES} variables={{ clientId: 'default-client' }}>
        {({ loading, error, data, client }) => {
          return (
            <Grid item xs={12}>
              <Card className={classes.cardClass}>
                <CardContent className={classes.cardContent}>
                  <Grid container alignItems="center" justify="flex-start">
                    <Grid item>
                      <ComboBox
                        items={(data && data.devices) || []}
                        client={client}
                        isLoading={loading}
                        error={error}
                      />
                    </Grid>
                    {selectedVehicle && (
                      <Grid item>
                        <RadioGroup
                          aria-label="Tracking Mode"
                          name="tracking-mode"
                          className={classes.radioButtonGroup}
                          value={this.state.trackingMode}
                          onChange={this.handleInputChange('trackingMode')}
                        >
                          <FormControlLabel
                            value="live"
                            control={
                              <Radio
                                classes={{ root: classes.checkedRadioButton }}
                              />
                            }
                            label="Live Tracking"
                          />
                          <FormControlLabel
                            value="replay"
                            control={
                              <Radio
                                classes={{ root: classes.checkedRadioButton }}
                              />
                            }
                            label="Travel Replay"
                          />
                        </RadioGroup>
                      </Grid>
                    )}
                    {selectedVehicle && this.state.trackingMode === 'replay' && (
                      <Fragment>
                        <Grid item className={classes.gridItem}>
                          <DateTimePicker
                            leftArrowIcon={<ChevronLeftIcon />}
                            rightArrowIcon={<ChevronRightIcon />}
                            dateRangeIcon={<DateRangeIcon />}
                            timeIcon={<TimeRangeIcon />}
                            value={this.state.fromDate}
                            onChange={this.handleDateChange}
                            disableFuture
                            placeholder="From"
                          />
                        </Grid>
                        <Grid item className={classes.gridItem}>
                          <DateTimePicker
                            leftArrowIcon={<ChevronLeftIcon />}
                            rightArrowIcon={<ChevronRightIcon />}
                            dateRangeIcon={<DateRangeIcon />}
                            timeIcon={<TimeRangeIcon />}
                            value={this.state.toDate}
                            onChange={this.handleDateChange}
                            disableFuture
                            placeholder="To"
                          />
                        </Grid>
                      </Fragment>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )
        }}
      </Query>
    )
  }
}

export default compose(
  withStyles(style),
  graphql(GET_MAP_CONTROL_PROPS, { name: 'mapControlProps' })
)(MapControls)
