import React, { Component, Fragment } from 'react'
import BookIcon from '@material-ui/icons/Book'
import AssignedVehicleIcon from '@material-ui/icons/DepartureBoard'
import CalendarIcon from '@material-ui/icons/CalendarToday'
// Icons
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import EditIcon from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import ClearIcon from '@material-ui/icons/Clear'
import AddIcon from '@material-ui/icons/Add'
import CloseIcon from '@material-ui/icons/Close'
import DoneIcon from '@material-ui/icons/Check'
import VisibilityIcon from '@material-ui/icons/Visibility'
// Utility functions
import { THEME_MAIN_COLORS } from '@zeliot/common/constants/styles'
import MultiSelectComboBox from '@zeliot/common/ui/MultiSelectComboBox'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

import {
  withStyles,
  List,
  ListItem,
  ListItemIcon,
  Divider,
  Typography,
  Grid,
  Chip,
  Avatar,
  ListItemText,
  Paper,
  LinearProgress,
  Tooltip,
  Zoom,
  IconButton,
  TextField,
  Button,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
} from '@material-ui/core'

// import ComboBox from '@zeliot/common/ui/ComboBox'

const styles = (theme) => ({
  chip: {
    marginTop: theme.spacing(1),
  },
  chipRoot: {
    maxWidth: '100%',
  },
  chipLabel: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'inline-block',
  },
  textField: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  listClass: {
    padding: theme.spacing(2),
  },
  noPadding: {
    padding: 0,
  },
})

class RouteDetails extends Component {
  onViewRouteFencePress = () => {
    this.props.onViewFencePress()
  }

  onEditPress = () => {
    this.props.onEditPress()
  }

  onCancelEditPress = () => {
    this.props.onCancelEditPress()
  }

  onConfirmEditPress = () => {
    this.props.onConfirmEditPress()
  }

  onDeletePress = () => {
    this.props.onDeletePress()
  }

  onAddVehiclePress = () => {
    this.props.addVehicles()
  }

  onClearVehiclePress = () => {
    this.props.clearVehicle()
  }

  onBackPress = () => {
    this.props.onBackPress()
  }

  saveAlert = () => {
    this.props.saveAlert()
  }

  handleEmailChange = (index) => (event) => {
    this.props.onEmailChange(event.target.value, index)
  }

  handleNumberChange = (index) => (event) => {
    this.props.onNumberChange(event.target.value, index)
  }

  onSelectedAssociatedVehicle = (associatedVehicles) => {
    this.props.onSelectedAssociatedVehicle(associatedVehicles)
  }

  handleVehicleAssociationDelete = (vehicle) => {
    this.props.onVehicleAssociationDelete(vehicle)
  }

  handleTextChange = (name) => (event) => {
    this.props.onEditedTextChange(name, event.target.value)
  }

  render() {
    const {
      classes,
      routeName,
      createdOn,
      waypoints,
      routeQueryActive,
      vehicles,
      selectedVehicle,
      assignVehicle,
      emails,
      numbers,
      associatedVehicles,
      routeEditActive,
      fenceRadius,
      selectedLanguage,
    } = this.props

    return (
      <Fragment>
        <Paper
          elevation={4}
          style={{
            width: '100%',
            padding: 15,
            backgroundColor: THEME_MAIN_COLORS.mainBlue,
          }}
        >
          <Typography
            variant="h6"
            align="center"
            style={{ color: THEME_MAIN_COLORS.white }}
          >
            {languageJson[selectedLanguage].routesPage.routeDetails.cardTitle}
          </Typography>
        </Paper>
        {!routeQueryActive ? (
          <List component="nav" className={classes.listClass}>
            <ListItem>
              <ListItemIcon>
                <BookIcon />
              </ListItemIcon>
              <ListItemText>
                <Grid
                  container
                  className={classes.textField}
                  alignItems="center"
                >
                  <Grid item xs={6}>
                    <Typography color="textSecondary">
                      {
                        languageJson[selectedLanguage].routesPage.routeDetails
                          .routeNameLabel
                      }
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    {!routeEditActive ? (
                      <Typography gutterBottom>{routeName}</Typography>
                    ) : (
                      <TextField
                        id="standard-bare"
                        onChange={this.handleTextChange('areaName')}
                        defaultValue={routeName}
                      />
                    )}
                  </Grid>
                </Grid>
              </ListItemText>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <AssignedVehicleIcon />
              </ListItemIcon>
              <ListItemText className={classes.noPadding}>
                <Grid
                  container
                  className={classes.textField}
                  alignItems="center"
                >
                  <Grid item xs={12}>
                    <Typography color="textSecondary">
                      {
                        languageJson[selectedLanguage].routesPage.routeDetails
                          .waypointsRegisteredLabel
                      }
                    </Typography>
                  </Grid>
                  {waypoints &&
                    waypoints.map((place, index) => (
                      <Grid item xs={12} key={index}>
                        <Chip
                          avatar={<Avatar>{index + 1}</Avatar>}
                          label={place}
                          color="primary"
                          className={classes.chip}
                          classes={{
                            root: classes.chipRoot,
                            label: classes.chipLabel,
                          }}
                        />
                      </Grid>
                    ))}
                </Grid>
              </ListItemText>
            </ListItem>
            <Divider />
            {!routeEditActive ? (
              <ListItem>
                <ListItemIcon>
                  <CalendarIcon />
                </ListItemIcon>
                <ListItemText>
                  <Grid
                    container
                    className={classes.textField}
                    alignItems="center"
                  >
                    <Grid item xs={6}>
                      <Typography color="textSecondary">
                        {
                          languageJson[selectedLanguage].routesPage.routeDetails
                            .createdOnLabel
                        }
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>{createdOn}</Typography>
                    </Grid>
                  </Grid>
                </ListItemText>
              </ListItem>
            ) : (
              <ListItem>
                <ListItemIcon>
                  <CalendarIcon />
                </ListItemIcon>
                <ListItemText>
                  <Grid
                    container
                    className={classes.textField}
                    alignItems="center"
                  >
                    <Grid item xs={6}>
                      <Typography color="textSecondary">
                        Fence buffer (in meters)
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        id="standard-bare"
                        type="number"
                        onChange={this.handleTextChange('distance')}
                        defaultValue={fenceRadius}
                      />
                    </Grid>
                  </Grid>
                </ListItemText>
              </ListItem>
            )}
          </List>
        ) : (
          <LinearProgress color="primary" />
        )}

        <Grid
          container
          justify="space-around"
          alignItems="center"
          style={{ marginBottom: 20 }}
        >
          {!routeEditActive ? (
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
          ) : (
            <Grid item style={{ width: 48, height: 48 }} />
          )}

          {!routeEditActive ? (
            <Grid item>
              <Tooltip
                TransitionComponent={Zoom}
                title={'Delete this route'}
                style={{ cursor: 'pointer' }}
              >
                <IconButton onClick={this.onDeletePress}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          ) : (
            <Grid item>
              <Tooltip
                TransitionComponent={Zoom}
                title={'Cancel edit'}
                style={{ cursor: 'pointer' }}
              >
                <IconButton onClick={this.onCancelEditPress}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          )}
          {!routeEditActive ? (
            <Grid item>
              <Tooltip
                TransitionComponent={Zoom}
                title={'Edit route details'}
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
                title={'Confirm edit'}
                style={{ cursor: 'pointer' }}
              >
                <IconButton onClick={this.onConfirmEditPress}>
                  <DoneIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          )}

          {!routeEditActive ? (
            !assignVehicle ? (
              <Grid item>
                <Tooltip
                  TransitionComponent={Zoom}
                  title={'Assign vehicle to this route'}
                  style={{ cursor: 'pointer' }}
                >
                  <IconButton onClick={this.onAddVehiclePress}>
                    <AddCircleIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            ) : (
              <Grid item>
                <Tooltip
                  TransitionComponent={Zoom}
                  title={'Close vehicle assignment'}
                  style={{ cursor: 'pointer' }}
                >
                  <IconButton onClick={this.onClearVehiclePress}>
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            )
          ) : (
            <Grid item>
              <Tooltip
                TransitionComponent={Zoom}
                title={'View route fence'}
                style={{ cursor: 'pointer' }}
              >
                <IconButton onClick={this.onViewRouteFencePress}>
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          )}

          {assignVehicle && (
            <Grid container spacing={2} style={{ padding: 10 }}>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Typography color="textSecondary">
                  Assign vehicle to this route
                </Typography>
              </Grid>
              <Grid item xs={12} md={9}>
                <MultiSelectComboBox
                  items={vehicles || []}
                  itemKey="entityId"
                  itemToStringKey="vehicleNumber"
                  placeholder={
                    selectedVehicle.length > 0
                      ? selectedVehicle
                          .map((vehicle) => vehicle.vehicleNumber)
                          .join(', ')
                      : 'Choose Vehicle(s)'
                  }
                  isLoading={false}
                  filterSize={100}
                  selectedItems={selectedVehicle}
                  onSelectedItemsChange={this.props.handleVehicleChange}
                  searchByFields={['vehicleNumber']}
                />
                <br />
              </Grid>

              <Grid item xs={12}>
                <Grid container justify="space-between">
                  <Grid item sm={12}>
                    <Typography color="textSecondary">
                      How do you want to receive alerts? (Optional)
                    </Typography>
                  </Grid>

                  {emails.map((email, index) => (
                    <Grid item xs={12} key={index}>
                      <Grid container>
                        <Grid item xs={8}>
                          <TextField
                            id="email"
                            label="Email"
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
                    </Grid>
                  ))}

                  {numbers.map((number, index) => (
                    <Grid item xs={12} key={index}>
                      <Grid container>
                        <Grid item xs={8}>
                          <TextField
                            id="number"
                            label="Mobile Number"
                            placeholder="Enter mobile number"
                            value={number}
                            onChange={this.handleNumberChange(index)}
                            type="number"
                          />
                        </Grid>
                        <Grid item xs={2}>
                          {numbers.length - 1 === index && (
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
                          {numbers.length > 1 && (
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
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              <Grid item>
                <ColorButton
                  color="default"
                  variant="contained"
                  onClick={() => this.saveAlert()}
                >
                  Save Alerts
                </ColorButton>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
            </Grid>
          )}

          {associatedVehicles && associatedVehicles.length > 0 && (
            <Grid item xs={12}>
              <Paper
                elevation={4}
                style={{
                  width: '100%',
                  padding: 15,
                  marginTop: 15,
                  backgroundColor: THEME_MAIN_COLORS.mainBlue,
                }}
              >
                <Typography
                  variant="h6"
                  align="center"
                  style={{ color: THEME_MAIN_COLORS.white }}
                >
                  ASSIGNED VEHICLES
                </Typography>
              </Paper>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="default">Sr no</TableCell>
                    <TableCell padding="default">Vehicle number</TableCell>
                    <TableCell padding="none" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {associatedVehicles.map((vehicle, index) => (
                    <VehicleTable
                      key={index}
                      vehicle={vehicle}
                      index={index}
                      handleDelete={this.handleVehicleAssociationDelete}
                      onSelectedAssociatedVehicle={
                        this.onSelectedAssociatedVehicle
                      }
                    />
                  ))}
                </TableBody>
              </Table>
            </Grid>
          )}
        </Grid>
      </Fragment>
    )
  }
}

export default withLanguage(withStyles(styles)(RouteDetails))

export class VehicleTable extends Component {
  state = {
    rowHovered: false,
  }

  render() {
    const { vehicle, index } = this.props
    return (
      <TableRow
        hover
        key={index}
        onMouseEnter={() => {
          this.setState({ rowHovered: true })
        }}
        onMouseLeave={() => {
          this.setState({ rowHovered: false })
        }}
        onClick={() => {
          this.props.onSelectedAssociatedVehicle(vehicle)
        }}
      >
        <TableCell padding="default">{index + 1}</TableCell>
        <TableCell padding="default">{vehicle.vehicleNumber}</TableCell>
        <TableCell padding="none" align="right">
          {this.state.rowHovered ? (
            <Fragment>
              <Tooltip title="Delete">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation()
                    this.props.handleDelete(vehicle)
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Fragment>
          ) : (
            <div
              style={{
                paddingLeft: 48,
                height: 48,
              }}
            />
          )}
        </TableCell>
      </TableRow>
    )
  }
}
