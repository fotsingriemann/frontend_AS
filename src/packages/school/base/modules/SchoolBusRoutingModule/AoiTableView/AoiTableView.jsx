import React, { Component, Fragment } from 'react'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import DoneIcon from '@material-ui/icons/Done'

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  withStyles,
  IconButton,
  Input,
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

const aoiNameValidation = []
const routeNameValidation = []

const styles = (theme) => ({
  paper: {
    padding: 2 * theme.spacing(1),
  },
  gridContainer: {
    marginTop: theme.spacing(1),
    marginBottom: 2 * theme.spacing(1),
  },
  gridItem: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  divItem: {
    marginBottom: 3 * theme.spacing(1),
  },
})

class AoiTableView extends Component {
  state = {
    open: false,
  }

  routeTableHovered = (index, flag) => {
    this.props.onRouteTableRowHovered(index, flag)
  }

  handleClickOpen = () => {
    this.setState({ open: true })
  }

  handleClose = () => {
    this.setState({ open: false })
  }

  handleEdit = (value, name) => {
    if (name === '') {
      this.props.openSnackbar("Name can't be empty")
    } else {
      this.props.handleAoiNameEdit(value, name)
    }
  }

  handleRouteEdit = (value, name) => {
    if (name === '') {
      this.props.openSnackbar("Name can't be empty")
    } else {
      this.props.handleRouteNameEdit(value, name)
    }
  }

  handleDelete = (value, index) => {
    aoiNameValidation.splice(index, 1)
    this.props.handleDeleteAoi(value, index)
  }

  addAnotherPoint = () => {
    aoiNameValidation.push(false)
    this.props.onAddAnotherPoint()
  }

  saveConfiguredPoints = () => {
    if (aoiNameValidation.length < 1) {
      this.props.openSnackbar('Provide names to all points before saving')
    } else {
      let i
      for (i = 0; i < aoiNameValidation.length; i++) {
        if (aoiNameValidation[i] === false) {
          this.props.openSnackbar('Provide names to all points before saving')
          break
        }
      }
      if (i === aoiNameValidation.length) {
        this.setState({ open: true })
      }
    }
  }

  initAoiNameValidation = () => {
    let i = 0
    for (i = 0; i < this.props.predictedAois.length; i++) {
      aoiNameValidation[i] = true
    }
  }

  initRouteNameValidation = () => {
    let i = 0
    for (i = 0; i < this.props.optimalRoutes.length; i++) {
      routeNameValidation[i] = true
    }
  }

  handleSavePoints = () => {
    this.setState({ open: false })
    this.props.onSaveConfiguredPoints()
  }

  saveConfiguredRoutes = () => {
    if (routeNameValidation.length < 1) {
      this.props.openSnackbar('Provide names to all routes before saving')
    } else {
      let i
      for (i = 0; i < routeNameValidation.length; i++) {
        if (routeNameValidation[i] === false) {
          this.props.openSnackbar('Provide names to all routes before saving')
          break
        }
      }
      if (i === routeNameValidation.length) {
        this.props.saveConfiguredRoutes()
      }
    }
  }

  handleSavePoints = () => {
    this.setState({ open: false })
    this.props.onSaveConfiguredPoints()
  }

  saveConfiguredRoutes = () => {
    if (routeNameValidation.length < 1) {
      this.props.openSnackbar('Provide names to all routes before saving')
    } else {
      let i
      for (i = 0; i < routeNameValidation.length; i++) {
        if (routeNameValidation[i] === false) {
          this.props.openSnackbar('Provide names to all routes before saving')
          break
        }
      }
      if (i === routeNameValidation.length) {
        this.props.saveConfiguredRoutes()
      }
    }
  }

  handleSavePoints = () => {
    this.setState({ open: false })
    this.props.onSaveConfiguredPoints()
  }

  saveConfiguredRoutes = () => {
    this.props.saveConfiguredRoutes()
  }

  render() {
    const {
      classes,
      predictedAois,
      aoisPredictedFlag,
      isSamePickupDrop,
      radioSelection,
      pointsSaved,
      optimalRoutes,
    } = this.props
    return (
      <Paper elevation={8}>
        {aoisPredictedFlag && (
          <div className={classes.paper}>
            <Grid
              container
              justify="flex-start"
              className={classes.gridContainer}
            >
              <Grid item sm={6} className={classes.gridItem}>
                {!pointsSaved ? (
                  <ColorButton
                    variant="contained"
                    color="default"
                    onClick={this.addAnotherPoint}
                  >
                    Add another point
                  </ColorButton>
                ) : (
                  <div />
                )}
              </Grid>

              <Grid
                item
                sm={6}
                className={classes.gridItem}
                style={{ textAlign: 'right' }}
              >
                {!pointsSaved ? (
                  <ColorButton
                    variant="contained"
                    color="primary"
                    onClick={this.saveConfiguredPoints}
                  >
                    Save points
                  </ColorButton>
                ) : (
                  <ColorButton
                    variant="contained"
                    color="primary"
                    onClick={this.saveConfiguredRoutes}
                  >
                    Save routes
                  </ColorButton>
                )}
                <Dialog
                  open={this.state.open}
                  onClose={this.handleClose}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                >
                  <DialogTitle id="alert-dialog-title">
                    {'Save these points?'}
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText id="alert-dialog-description" />
                    These points will be used to calculate most optimal route.
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.handleClose} color="default">
                      Reconfigure points
                    </Button>
                    <Button
                      onClick={this.handleSavePoints}
                      color="primary"
                      autoFocus
                    >
                      View route
                    </Button>
                  </DialogActions>
                </Dialog>
              </Grid>
            </Grid>

            {pointsSaved && optimalRoutes ? (
              <div className={classes.divItem}>
                <Typography variant="button">Routing Details</Typography>
                <Typography color="textSecondary">
                  Rename individual routes
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sr No</TableCell>
                      <TableCell>Route Name</TableCell>
                      <TableCell align="right">Points Covered</TableCell>
                      <TableCell align="right">Bus Allotted</TableCell>
                      <TableCell align="right">Bus Capacity</TableCell>
                      <TableCell align="right">
                        # Students{' '}
                        {radioSelection === 'pickup' ? 'picked' : 'dropped'}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {optimalRoutes.map((value, index) => {
                      if (routeNameValidation.length < 1) {
                        this.initRouteNameValidation()
                      }
                      return (
                        <RouteTableRow
                          key={index}
                          value={value}
                          index={index}
                          handleRouteEdit={this.handleRouteEdit}
                          pointsSaved={pointsSaved}
                          routeTableHovered={this.routeTableHovered}
                        />
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div />
            )}
            {!pointsSaved ? (
              <div>
                <Typography variant="button">
                  Possible
                  {/* eslint-disable indent */}
                  {isSamePickupDrop
                    ? 'Pickup/Drop'
                    : radioSelection === 'pickup'
                    ? 'Pickup'
                    : 'Drop'}{' '}
                  {/* eslint-enable indent */}
                  points
                </Typography>
                <Typography color="textSecondary">
                  Rename points and drag markers to readjust position
                </Typography>
              </div>
            ) : (
              <Typography variant="button">
                {/* eslint-disable indent */}
                {isSamePickupDrop
                  ? 'Pickup/Drop'
                  : radioSelection === 'pickup'
                  ? 'Pickup'
                  : 'Drop'}{' '}
                {/* eslint-enable indent */}
                points details
              </Typography>
            )}
            {predictedAois && (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sr No</TableCell>
                    <TableCell>
                      {/* eslint-disable indent */}
                      {isSamePickupDrop
                        ? 'Pickup/Drop'
                        : radioSelection === 'pickup'
                        ? 'Pickup'
                        : 'Drop'}{' '}
                      {/* eslint-enable indent */}
                      Name
                    </TableCell>
                    <TableCell align="right">Latitude</TableCell>
                    <TableCell align="right">Longitude</TableCell>
                    <TableCell align="right"># Students alotted</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {predictedAois.map((value, index) => {
                    if (aoiNameValidation.length < 1) {
                      this.initAoiNameValidation()
                    }
                    return (
                      <PointTableRow
                        key={index}
                        value={value}
                        index={index}
                        handleEdit={this.handleEdit}
                        handleDelete={this.handleDelete}
                        pointsSaved={pointsSaved}
                      />
                    )
                  })}
                </TableBody>
              </Table>
            )}
            <Grid
              container
              justify="flex-start"
              className={classes.gridContainer}
            >
              <Grid item sm={6} className={classes.gridItem}>
                {!pointsSaved ? (
                  <ColorButton
                    variant="contained"
                    color="default"
                    onClick={this.addAnotherPoint}
                  >
                    Add another point
                  </ColorButton>
                ) : (
                  <div />
                )}
              </Grid>

              <Grid
                item
                sm={6}
                className={classes.gridItem}
                style={{ textAlign: 'right' }}
              >
                {!pointsSaved ? (
                  <ColorButton
                    variant="contained"
                    color="primary"
                    onClick={this.saveConfiguredPoints}
                  >
                    Save points
                  </ColorButton>
                ) : (
                  <ColorButton
                    variant="contained"
                    color="primary"
                    onClick={this.saveConfiguredRoutes}
                  >
                    Save routes
                  </ColorButton>
                )}
                <Dialog
                  open={this.state.open}
                  onClose={this.handleClose}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                >
                  <DialogTitle id="alert-dialog-title">
                    {'Save these points?'}
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText id="alert-dialog-description" />
                    These points will be used to calculate most optimal route.
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.handleClose} color="default">
                      Reconfigure points
                    </Button>
                    <Button
                      onClick={this.handleSavePoints}
                      color="primary"
                      autoFocus
                    >
                      Save and view route
                    </Button>
                  </DialogActions>
                </Dialog>
              </Grid>
            </Grid>

            {pointsSaved && optimalRoutes ? (
              <div className={classes.divItem}>
                <Typography variant="button">Routing Details</Typography>
                <Typography color="textSecondary">
                  Rename individual routes
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sr No</TableCell>
                      <TableCell>Route Name</TableCell>
                      <TableCell align="right">Points Covered</TableCell>
                      <TableCell align="right">Bus Allotted</TableCell>
                      <TableCell align="right">Bus Capacity</TableCell>
                      <TableCell align="right">
                        # Students{' '}
                        {radioSelection === 'pickup' ? 'picked' : 'dropped'}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {optimalRoutes.map((value, index) => {
                      if (routeNameValidation.length < 1) {
                        this.initRouteNameValidation()
                      }
                      return (
                        <RouteTableRow
                          key={index}
                          value={value}
                          index={index}
                          handleRouteEdit={this.handleRouteEdit}
                          pointsSaved={pointsSaved}
                          routeTableHovered={this.routeTableHovered}
                        />
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div />
            )}
            {!pointsSaved ? (
              <div>
                <Typography variant="button">
                  Possible {/* eslint-disable indent */}
                  {isSamePickupDrop
                    ? 'Pickup/Drop'
                    : radioSelection === 'pickup'
                    ? 'Pickup'
                    : 'Drop'}{' '}
                  {/* eslint-enable indent */}
                  points
                </Typography>
                <Typography color="textSecondary">
                  Rename points and drag markers to readjust position
                </Typography>
              </div>
            ) : (
              <Typography variant="button">
                {/* eslint-disable indent */}
                {isSamePickupDrop
                  ? 'Pickup/Drop'
                  : radioSelection === 'pickup'
                  ? 'Pickup'
                  : 'Drop'}{' '}
                {/* eslint-enable indent */}
                points details
              </Typography>
            )}
            {predictedAois && (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sr No</TableCell>
                    <TableCell>
                      {/* eslint-disable indent */}
                      {isSamePickupDrop
                        ? 'Pickup/Drop'
                        : radioSelection === 'pickup'
                        ? 'Pickup'
                        : 'Drop'}{' '}
                      {/* eslint-enable indent */}
                      Name
                    </TableCell>
                    <TableCell align="right">Latitude</TableCell>
                    <TableCell align="right">Longitude</TableCell>
                    <TableCell align="right"># Students alotted</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {predictedAois.map((value, index) => {
                    if (aoiNameValidation.length < 1) {
                      this.initAoiNameValidation()
                    }
                    return (
                      <PointTableRow
                        key={index}
                        value={value}
                        index={index}
                        handleEdit={this.handleEdit}
                        handleDelete={this.handleDelete}
                        pointsSaved={pointsSaved}
                      />
                    )
                  })}
                </TableBody>
              </Table>
            )}
            <Grid
              container
              justify="flex-start"
              className={classes.gridContainer}
            >
              {!pointsSaved ? (
                <Grid item sm={12}>
                  <Typography color="textSecondary">
                    Add more points and drag to desired place if suggested ones
                    aren't enough
                  </Typography>
                </Grid>
              ) : (
                <div />
              )}
              <Grid item sm={6} className={classes.gridItem}>
                {!pointsSaved ? (
                  <ColorButton
                    variant="contained"
                    color="default"
                    onClick={this.addAnotherPoint}
                  >
                    Add another point
                  </ColorButton>
                ) : (
                  <div />
                )}
              </Grid>

              <Grid
                item
                sm={6}
                className={classes.gridItem}
                style={{ textAlign: 'right' }}
              >
                {!pointsSaved ? (
                  <ColorButton
                    variant="contained"
                    color="primary"
                    onClick={this.saveConfiguredPoints}
                  >
                    Save points
                  </ColorButton>
                ) : (
                  <ColorButton
                    variant="contained"
                    color="primary"
                    onClick={this.saveConfiguredRoutes}
                  >
                    Save routes
                  </ColorButton>
                )}
                <Dialog
                  open={this.state.open}
                  onClose={this.handleClose}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                >
                  <DialogTitle id="alert-dialog-title">
                    {'Save these points?'}
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText id="alert-dialog-description" />
                    These points will be used to calculate most optimal route.
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.handleClose} color="default">
                      Reconfigure points
                    </Button>
                    <Button
                      onClick={this.handleSavePoints}
                      color="primary"
                      autoFocus
                    >
                      Save and view route
                    </Button>
                  </DialogActions>
                </Dialog>
              </Grid>
            </Grid>

            {pointsSaved && optimalRoutes ? (
              <div className={classes.divItem}>
                <Typography variant="button">Routing Details</Typography>
                <Typography color="textSecondary">
                  Rename individual routes
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sr No</TableCell>
                      <TableCell>Route Name</TableCell>
                      <TableCell align="right">Points Covered</TableCell>
                      <TableCell align="right">Bus Allotted</TableCell>
                      <TableCell align="right">
                        # Students{' '}
                        {radioSelection === 'pickup' ? 'picked' : 'dropped'}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {optimalRoutes.map((value, index) => {
                      if (routeNameValidation.length < 1) {
                        this.initRouteNameValidation()
                      }
                      return (
                        <RouteTableRow
                          key={index}
                          value={value}
                          index={index}
                          handleRouteEdit={this.handleRouteEdit}
                          pointsSaved={pointsSaved}
                          routeTableHovered={this.routeTableHovered}
                        />
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div />
            )}
            {/* eslint-disable indent */}
            {!pointsSaved ? (
              <div>
                <Typography variant="button">
                  Possible{' '}
                  {isSamePickupDrop
                    ? 'Pickup/Drop'
                    : radioSelection === 'pickup'
                    ? 'Pickup'
                    : 'Drop'}{' '}
                  points
                </Typography>
                <Typography color="textSecondary">
                  Rename points and drag markers to readjust position
                </Typography>
              </div>
            ) : (
              <Typography variant="button">
                {isSamePickupDrop
                  ? 'Pickup/Drop'
                  : radioSelection === 'pickup'
                  ? 'Pickup'
                  : 'Drop'}{' '}
                points details
              </Typography>
            )}
            {/* eslint-enable indent */}
            {predictedAois && (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sr No</TableCell>
                    <TableCell>
                      {/* eslint-disable indent */}
                      {isSamePickupDrop
                        ? 'Pickup/Drop'
                        : radioSelection === 'pickup'
                        ? 'Pickup'
                        : 'Drop'}{' '}
                      Name
                      {/* eslint-enable indent */}
                    </TableCell>
                    <TableCell align="right">Latitude</TableCell>
                    <TableCell align="right">Longitude</TableCell>
                    <TableCell align="right"># Students alotted</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {predictedAois.map((value, index) => {
                    if (aoiNameValidation.length < 1) {
                      this.initAoiNameValidation()
                    }
                    return (
                      <PointTableRow
                        key={index}
                        value={value}
                        index={index}
                        handleEdit={this.handleEdit}
                        handleDelete={this.handleDelete}
                        pointsSaved={pointsSaved}
                      />
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </Paper>
    )
  }
}

export default withSharedSnackbar(withStyles(styles)(AoiTableView))

class RouteTableRow extends Component {
  state = {
    rowHovered: false,
    editMode: false,
    name: '',
  }

  handleEdit = (index) => (event) => {
    this.setState(
      {
        editMode: true,
      },
      () => {
        routeNameValidation[index] = !this.state.editMode
      }
    )
  }

  handleValueChange = (event) => {
    this.setState({ name: event.target.value })
  }

  render() {
    const { value, index, pointsSaved } = this.props

    return (
      <TableRow
        hover
        tabIndex={-1}
        key={index}
        onMouseEnter={() => {
          if (pointsSaved) {
            this.setState({ rowHovered: true }, () => {
              this.props.routeTableHovered(index, this.state.rowHovered)
            })
          }
        }}
        onMouseLeave={() => {
          if (pointsSaved) {
            this.setState({ rowHovered: false }, () => {
              this.props.routeTableHovered(index, this.state.rowHovered)
            })
          }
        }}
      >
        <TableCell>{index + 1}</TableCell>
        <TableCell>
          {this.state.editMode ? (
            <Input value={this.state.name} onChange={this.handleValueChange} />
          ) : (
            value.name
          )}
        </TableCell>
        <TableCell align="right">{value.aoiOrder.join(', ')}</TableCell>
        <TableCell align="right">{value.vehicle}</TableCell>
        <TableCell align="right">{value.capacity}</TableCell>
        <TableCell align="right">{value.load}</TableCell>
        <TableCell align="right" padding="none">
          {this.state.rowHovered ? (
            <Fragment>
              {this.state.editMode ? (
                <IconButton
                  color="primary"
                  onClick={() => {
                    if (!(this.state.name === '')) {
                      this.setState({ editMode: false }, () => {
                        routeNameValidation[index] = !this.state.editMode
                      })
                    }
                    this.props.handleRouteEdit(value, this.state.name)
                  }}
                >
                  <DoneIcon />
                </IconButton>
              ) : (
                <Tooltip title="Edit names">
                  <IconButton onClick={this.handleEdit(index)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Fragment>
          ) : (
            <div
              style={{
                padding: '0 48px',
              }}
            />
          )}
        </TableCell>
      </TableRow>
    )
  }
}

class PointTableRow extends Component {
  state = {
    rowHovered: false,
    editMode: false,
    name: '',
  }

  handleEdit = (index) => (event) => {
    this.setState(
      {
        editMode: true,
      },
      () => {
        aoiNameValidation[index] = !this.state.editMode
      }
    )
  }

  handleValueChange = (event) => {
    this.setState({ name: event.target.value })
  }

  render() {
    const { value, index, pointsSaved } = this.props

    return (
      <TableRow
        hover
        tabIndex={-1}
        key={index}
        onMouseEnter={() => {
          if (!pointsSaved) {
            this.setState({ rowHovered: true })
          }
        }}
        onMouseLeave={() => {
          if (!pointsSaved) {
            this.setState({ rowHovered: false })
          }
        }}
      >
        <TableCell>{index + 1}</TableCell>
        <TableCell>
          {this.state.editMode ? (
            <Input value={this.state.name} onChange={this.handleValueChange} />
          ) : (
            value.name
          )}
        </TableCell>
        <TableCell align="right">{value.coordinates.lat.toFixed(7)}</TableCell>
        <TableCell align="right">{value.coordinates.lng.toFixed(7)}</TableCell>
        <TableCell align="right">{value.students.length}</TableCell>
        <TableCell align="right" padding="none">
          {this.state.rowHovered ? (
            <Fragment>
              {this.state.editMode ? (
                <IconButton
                  color="primary"
                  onClick={() => {
                    if (!(this.state.name === '')) {
                      this.setState({ editMode: false }, () => {
                        aoiNameValidation[index] = !this.state.editMode
                      })
                    }
                    this.props.handleEdit(value, this.state.name)
                  }}
                >
                  <DoneIcon />
                </IconButton>
              ) : (
                <Tooltip title="Edit names">
                  <IconButton onClick={this.handleEdit(index)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Delete">
                <IconButton
                  onClick={() => {
                    this.props.handleDelete(value, index)
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Fragment>
          ) : (
            <div
              style={{
                padding: '0 48px',
              }}
            />
          )}
        </TableCell>
      </TableRow>
    )
  }
}
