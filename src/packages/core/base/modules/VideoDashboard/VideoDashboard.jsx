import React, { Component } from 'react'
import gql from 'graphql-tag'
import { withApollo, Query } from 'react-apollo'
import { Grid, Typography, Paper, Divider } from '@material-ui/core'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import Loader from '@zeliot/common/ui/Loader'
import getLoginId from '@zeliot/common/utils/getLoginId'
import VideoExplorer from './VideoExplorer'
import PlaybackVideo from './PlaybackVideo'
import VideoControlPanel from './VideoControlPanel'

class VideoDashboard extends Component {
  state = {
    selectedVehicle: null,
    selectedIMEI: '',
    playbackFile: null
  }

  handleSelectedVehicleChange = vehicle => {
    let newState
    if (vehicle) {
      newState = {
        selectedIMEI: vehicle.imei
      }
    } else {
      newState = {
        selectedIMEI: ''
      }
    }

    newState['selectedVehicle'] = vehicle

    this.setState(newState)
  }

  handleVideoRequest = file => {
    this.setState({ playbackFile: file })
  }

  handleModalClose = () => {
    this.setState({ playbackFile: null })
  }

  render() {
    const { selectedIMEI, playbackFile } = this.state
    const { vehicles, retry } = this.props

    return (
      <Grid container justify="center">
        <Grid item xs={12}>
          <VideoControlPanel
            onSelectedVehicleChange={this.handleSelectedVehicleChange}
            selectedVehicle={this.state.selectedVehicle}
            imei={selectedIMEI}
            vehicles={vehicles}
            retry={retry}
          />

          {this.state.selectedVehicle && (
            <Grid container>
              <PlaybackVideo
                playbackFile={playbackFile}
                imei={selectedIMEI}
                onClose={this.handleModalClose}
              />

              <Grid item xs={12} style={{ paddingTop: 10 }}>
                <Typography variant="h5">Video Library</Typography>
              </Grid>

              <Grid item xs={12} style={{ padding: '8px 0px 16px 0px' }}>
                <Divider />
              </Grid>

              <Paper style={{ width: '100%' }} elevation={4}>
                <Grid item xs={12}>
                  <VideoExplorer
                    imei={this.state.selectedIMEI}
                    onVideoRequest={this.handleVideoRequest}
                  />
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Grid>
    )
  }
}

const GET_ALL_VEHICLES = gql`
  query($loginId: Int!) {
    vehicles: getAllVehicleDetails(clientLoginId: $loginId, status: [1, 3]) {
      vehicleNumber
      vehicleType
      deviceDetail {
        uniqueDeviceId
        imei_num
      }
    }
  }
`

export default withSharedSnackbar(
  withApollo(props => (
    <Query query={GET_ALL_VEHICLES} variables={{ loginId: getLoginId() }}>
      {({ data, loading, error, refetch }) => {
        if (loading) return <Loader fullscreen />

        if (error) return <Typography align="center">Error</Typography>

        return (
          <VideoDashboard
            {...props}
            vehicles={data.vehicles.map(vehicle => ({
              vehicleNumber: vehicle.vehicleNumber,
              vehicleType: vehicle.vehicleType,
              imei: vehicle.deviceDetail.imei_num,
              uniqueId: vehicle.deviceDetail.uniqueDeviceId
            }))}
            retry={refetch}
          />
        )
      }}
    </Query>
  ))
)
