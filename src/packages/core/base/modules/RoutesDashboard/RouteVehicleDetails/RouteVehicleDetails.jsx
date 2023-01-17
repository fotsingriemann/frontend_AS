import React, { Component, Fragment } from 'react'
// Icons
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import EditIcon from '@material-ui/icons/Edit'
import LiveIcon from '@material-ui/icons/NearMe'
import StopIcon from '@material-ui/icons/Stop'
import ClearIcon from '@material-ui/icons/Clear'
import AddIcon from '@material-ui/icons/Add'
import CloseIcon from '@material-ui/icons/Close'
import DoneIcon from '@material-ui/icons/Check'
// Utility
import { THEME_MAIN_COLORS } from '@zeliot/common/constants/styles'

import {
  Paper,
  Typography,
  LinearProgress,
  Tooltip,
  Zoom,
  IconButton,
  Grid,
  TextField
} from '@material-ui/core'

class RouteVehicleDetails extends Component {
  onBackPress = () => {
    this.props.onBackPress()
  }

  onEditPress = () => {
    this.props.onvehicleAlertEdit()
  }

  onLiveRequest = () => {
    this.props.onLiveRequest()
  }

  handleEmailChange = index => event => {
    this.props.onEmailChange(event.target.value, index)
  }

  handleNumberChange = index => event => {
    this.props.onNumberChange(event.target.value, index)
  }

  onSelectedAssociatedVehicle = associatedVehicles => {
    this.props.onSelectedAssociatedVehicle(associatedVehicles)
  }

  render() {
    const {
      emails,
      sms,
      selectedAssociatedVehicle,
      isLiveTracking,
      vehicleAlertEditActive
    } = this.props

    return (
      <Fragment>
        <Paper
          elevation={4}
          style={{
            width: '100%',
            padding: 15,
            backgroundColor: THEME_MAIN_COLORS.mainBlue
          }}
        >
          <Typography
            variant="h6"
            align="center"
            style={{ color: THEME_MAIN_COLORS.white }}
          >
            ROUTE DETAILS
          </Typography>
        </Paper>

        {selectedAssociatedVehicle ? (
          <div>
            <Grid
              container
              justify="space-around"
              alignItems="center"
              style={{ margin: '20px 0' }}
              spacing={1}
            >
              <Grid item>
                <Typography color="textSecondary">
                  Hover on markers to see ETA from current location while
                  tracking live.
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Grid container justify="space-between">
                  <Grid item xs={12}>
                    <Typography color="textSecondary">
                      Configured emails
                    </Typography>
                  </Grid>
                  {emails.map((email, index) => (
                    <Grid item xs={12} key={index}>
                      {vehicleAlertEditActive ? (
                        <Grid container>
                          <Grid item xs={8}>
                            <TextField
                              id="standard-bare"
                              placeholder="Enter email"
                              value={email}
                              onChange={this.handleEmailChange(index)}
                            />
                          </Grid>
                          <Grid item xs={2}>
                            {emails.length - 1 === index && (
                              <IconButton
                                color="default"
                                aria-label="Add"
                                onClick={this.props.handleAddEmailField}
                              >
                                <AddIcon />
                              </IconButton>
                            )}
                          </Grid>

                          <Grid item xs={2}>
                            {emails.length > 1 && (
                              <IconButton
                                color="default"
                                aria-label="Delete"
                                onClick={() =>
                                  this.props.handleDeleteEmailField(index)
                                }
                              >
                                <ClearIcon />
                              </IconButton>
                            )}
                          </Grid>
                        </Grid>
                      ) : email === '' ? (
                        <Typography>No email configured</Typography>
                      ) : (
                        <Grid
                          container
                          style={{ flexDirection: 'row', padding: 5 }}
                        >
                          <Grid item xs={4}>
                            <Typography align="center">{index + 1}</Typography>
                          </Grid>
                          <Grid item xs={8}>
                            <Typography>{email}</Typography>
                          </Grid>
                        </Grid>
                      )}
                    </Grid>
                  ))}

                  <Grid item xs={12}>
                    <Typography color="textSecondary">
                      Configured SMS
                    </Typography>
                  </Grid>
                  {sms.map((number, index) => (
                    <Grid item xs={12} key={index}>
                      {vehicleAlertEditActive ? (
                        <Grid container>
                          <Grid item xs={8}>
                            <TextField
                              id="standard-bare"
                              placeholder="Enter mobile number"
                              value={number}
                              onChange={this.handleNumberChange(index)}
                              type="number"
                            />
                          </Grid>
                          <Grid item xs={2}>
                            {sms.length - 1 === index && (
                              <IconButton
                                color="default"
                                aria-label="Add"
                                onClick={this.props.handleAddNumberField}
                              >
                                <AddIcon />
                              </IconButton>
                            )}
                          </Grid>
                          <Grid item xs={2}>
                            {sms.length > 1 && (
                              <IconButton
                                color="default"
                                aria-label="Delete"
                                onClick={() =>
                                  this.props.handleDeleteNumberField(index)
                                }
                              >
                                <ClearIcon />
                              </IconButton>
                            )}
                          </Grid>
                        </Grid>
                      ) : number === '' ? (
                        <Typography>No SMS configured</Typography>
                      ) : (
                        <Grid
                          container
                          style={{ flexDirection: 'row', padding: 5 }}
                        >
                          <Grid item xs={4}>
                            <Typography align="center">{index + 1}</Typography>
                          </Grid>
                          <Grid item xs={8}>
                            <Typography>{number}</Typography>
                          </Grid>
                        </Grid>
                      )}
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>

            <Grid
              container
              justify="space-around"
              alignItems="center"
              style={{ margin: '20px 0' }}
            >
              <Grid item>
                <Tooltip
                  TransitionComponent={Zoom}
                  title={'Previous page'}
                  style={{ cursor: 'pointer' }}
                >
                  <IconButton onClick={this.onBackPress}>
                    <ArrowBackIcon />
                  </IconButton>
                </Tooltip>
              </Grid>

              {!isLiveTracking ? (
                !vehicleAlertEditActive ? (
                  <Grid item>
                    <Tooltip
                      TransitionComponent={Zoom}
                      title={'Edit route alert details'}
                      style={{ cursor: 'pointer' }}
                    >
                      <IconButton onClick={this.onEditPress}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                ) : (
                  <Grid item>
                    <Tooltip
                      TransitionComponent={Zoom}
                      title={'Cancel route alerts edit'}
                      style={{ cursor: 'pointer' }}
                    >
                      <IconButton onClick={this.props.onCancelEditPress}>
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                )
              ) : null}

              {!vehicleAlertEditActive ? (
                !isLiveTracking ? (
                  <Grid item>
                    <Tooltip
                      TransitionComponent={Zoom}
                      title={'Track this vehicle'}
                      style={{ cursor: 'pointer' }}
                    >
                      <IconButton onClick={this.onLiveRequest}>
                        <LiveIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                ) : (
                  <Grid item>
                    <Tooltip
                      TransitionComponent={Zoom}
                      title={'Stop live tracking'}
                      style={{ cursor: 'pointer' }}
                    >
                      <IconButton onClick={this.props.onCancelLiveTracking}>
                        <StopIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                )
              ) : (
                <Grid item>
                  <Tooltip
                    TransitionComponent={Zoom}
                    title={'Save'}
                    style={{ cursor: 'pointer' }}
                  >
                    <IconButton onClick={this.props.onConfirmVehicleEdit}>
                      <DoneIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
              )}
            </Grid>
          </div>
        ) : (
          <LinearProgress color="primary" />
        )}
      </Fragment>
    )
  }
}

export default RouteVehicleDetails
