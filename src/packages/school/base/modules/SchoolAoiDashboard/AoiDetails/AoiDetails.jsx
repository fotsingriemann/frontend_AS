import React, { Component, Fragment } from 'react'
import BookIcon from '@material-ui/icons/Book'
import CenterFocusWeak from '@material-ui/icons/CenterFocusWeak'
import CalendarIcon from '@material-ui/icons/CalendarToday'
// Icons
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import EditIcon from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import ClearIcon from '@material-ui/icons/Clear'
import CloseIcon from '@material-ui/icons/Close'
import DoneIcon from '@material-ui/icons/Check'
import VisibilityIcon from '@material-ui/icons/Visibility'
// Utility functions
import { THEME_MAIN_COLORS } from '@zeliot/common/constants/styles'
import MultiSelectComboBox from '@zeliot/common/ui/MultiSelectComboBox'

import {
  withStyles,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Grid,
  Paper,
  Tooltip,
  Zoom,
  IconButton,
  LinearProgress,
  TextField,
  Button,
  Menu,
  MenuItem,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
} from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

// import ComboBox from '@zeliot/common/ui/ComboBox'

const styles = (theme) => ({
  textField: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  listClass: {
    padding: theme.spacing(2),
  },
})

class AoiDetails extends Component {
  state = {
    anchorEl: null,
  }

  onSelectedAssociatedVehicle = (associatedVehicles) => {
    this.props.onSelectedAssociatedVehicle(associatedVehicles)
  }

  handleVehicleAssociationDelete = (vehicle) => {
    this.props.onVehicleAssociationDelete(vehicle)
  }

  handleAreaTypeChange = (areaType) => {
    this.handleClose()
    this.props.onAreaTypeChange(areaType)
  }

  handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget })
  }

  handleClose = () => {
    this.setState({ anchorEl: null })
  }

  onConfirmEditPress = () => {
    this.props.onConfirmEditPress()
  }

  onCancelEditPress = () => {
    this.props.onCancelEditPress()
  }

  onViewAoiFencePress = () => {
    this.props.onViewEditedFence()
  }

  handleTextChange = (name) => (event) => {
    this.props.onEditedTextChange(name, event.target.value)
  }

  onEditPress = () => {
    this.props.onAoiEdit()
  }

  onDeletePress = () => {
    this.props.onDeleteAoi()
  }

  onBackPress = () => {
    this.props.onBackPress()
  }

  saveAlert = () => {
    this.props.saveAlert()
  }

  onAddVehiclePress = () => {
    this.props.addVehicles()
  }

  onClearVehiclePress = () => {
    this.props.clearVehicle()
  }

  handleEmailChange = (index) => (event) => {
    this.props.onEmailChange(event.target.value, index)
  }

  handleNumberChange = (index) => (event) => {
    this.props.onNumberChange(event.target.value, index)
  }

  render() {
    const {
      classes,
      aoiName,
      aoiType,
      createdOn,
      areaQueryActive,
      vehicles,
      selectedEntry,
      // groups,
      assignVehicle,
      // emails,
      // numbers,
      isAoiEditActive,
      fenceRadius,
      associatedVehicles,
      vehiclesQueryStatus,
    } = this.props

    const { anchorEl } = this.state

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
            STOP DETAILS
          </Typography>
        </Paper>
        {!areaQueryActive ? (
          <List component="nav" className={classes.listClass}>
            <ListItem>
              <ListItemIcon>
                <BookIcon />
              </ListItemIcon>
              <Grid container className={classes.textField}>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Area name 1</Typography>
                </Grid>
                <Grid item xs={6}>
                  {!isAoiEditActive ? (
                    <Typography gutterBottom>{aoiName}</Typography>
                  ) : (
                    <TextField
                      id="standard-bare"
                      onChange={this.handleTextChange('areaName')}
                      defaultValue={aoiName}
                    />
                  )}
                </Grid>
              </Grid>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <CenterFocusWeak />
              </ListItemIcon>
              <Grid container className={classes.textField}>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Area type</Typography>
                </Grid>
                <Grid item xs={6}>
                  {!isAoiEditActive ? (
                    <Typography>{aoiType}</Typography>
                  ) : (
                    <div>
                      <Button
                        aria-owns={anchorEl ? 'simple-menu' : undefined}
                        aria-haspopup="true"
                        onClick={this.handleClick}
                        variant="outlined"
                      >
                        {aoiType}
                      </Button>
                      <Menu
                        id="simple-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={this.handleClose}
                      >
                        <MenuItem
                          onClick={() => this.handleAreaTypeChange('Circle')}
                        >
                          Circle
                        </MenuItem>
                        <MenuItem
                          onClick={() => this.handleAreaTypeChange('Polygon')}
                        >
                          Polygon
                        </MenuItem>
                      </Menu>
                    </div>
                  )}
                </Grid>
              </Grid>
            </ListItem>
            <Divider />
            {!isAoiEditActive ? (
              <ListItem>
                <ListItemIcon>
                  <CalendarIcon />
                </ListItemIcon>
                <Grid container className={classes.textField}>
                  <Grid item xs={6}>
                    <Typography color="textSecondary">Created on</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>{createdOn}</Typography>
                  </Grid>
                </Grid>
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
                        onChange={this.handleTextChange('radius')}
                        value={fenceRadius}
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
          {!isAoiEditActive ? (
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
          {!isAoiEditActive ? (
            <Grid item>
              <Tooltip
                TransitionComponent={Zoom}
                title={'Delete this Aoi'}
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

          {!isAoiEditActive ? (
            <Grid item>
              <Tooltip
                TransitionComponent={Zoom}
                title={'Edit this AOI'}
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

          {!isAoiEditActive ? (
            !assignVehicle ? (
              <Grid item>
                <Tooltip
                  TransitionComponent={Zoom}
                  title={'Assign student(s) to this Aoi'}
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
                  title={'Close student(s) assignment'}
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
                title={'View AOI fence'}
                style={{ cursor: 'pointer' }}
              >
                <IconButton onClick={this.onViewAoiFencePress}>
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          )}
        </Grid>

        {assignVehicle && (
          <Grid container spacing={2} style={{ padding: 10 }}>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Typography color="textSecondary">
                Assign student(s) to this AOI
              </Typography>
            </Grid>
            <Grid item xs={12} md={9}>
              <MultiSelectComboBox
                items={vehicles || []}
                itemKey="id"
                itemToStringKey="name"
                // itemToLabelKey="type"
                placeholder={
                  selectedEntry.length > 0
                    ? selectedEntry.map((entry) => entry.name).join(', ')
                    : 'Choose student(s)'
                }
                isLoading={vehiclesQueryStatus === 'LOADING'}
                filterSize={100}
                selectedItems={selectedEntry}
                onSelectedItemsChange={this.props.handleVehicleChange}
                searchByFields={['name']}
              />
              <br />
            </Grid>

            {/* <Grid item xs={12}>
              <Grid container justify="space-between">
                <Grid item xs={12}>
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
                            className={classes.fab}
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
                            className={classes.fab}
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
                    <Grid container alignItems="center">
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
                            className={classes.fab}
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
                            className={classes.fab}
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
            </Grid> */}

            <Grid item sm={12}>
              <ColorButton
                color="default"
                variant="contained"
                onClick={() => this.saveAlert()}
              >
                Save
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
                ASSIGNED STUDENTS
              </Typography>
            </Paper>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="default">Sr no</TableCell>
                  <TableCell padding="default">Student Name</TableCell>
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
      </Fragment>
    )
  }
}

export default withStyles(styles)(AoiDetails)

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
        <TableCell padding="default">{vehicle.studentName}</TableCell>
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
