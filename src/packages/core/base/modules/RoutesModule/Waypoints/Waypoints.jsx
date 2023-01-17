import React, { Component } from 'react'
import Places from '../Places'
import ComboBox from '@zeliot/common/ui/ComboBox'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

import {
  withStyles,
  Card,
  CardActions,
  CardContent,
  Button,
  Radio,
  FormGroup,
  FormControlLabel,
  Typography,
  Grid,
  Chip,
  Switch,
  Avatar,
  TextField,
} from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

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
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 100,
  },
  waypointsCard: {
    overflow: 'auto',
    height: 450,
  },
})

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? 'lightgrey' : 'white',
  padding: 10,
  width: '100%',
})

class Waypoints extends Component {
  handleRadioChange = (event) => {
    this.props.onSelectionChanged(event.target.value)
  }

  handlePlaceDelete = (index) => (event) => {
    this.props.onPlaceDelete(index)
  }

  onNewPlace = (selectedPlace) => {
    this.props.defineAoiType('places')
    this.props.onNewPlace(selectedPlace)
  }

  getCoordinates = (newCoordinate) => {
    this.props.getCoordinates(newCoordinate)
  }

  viewRoute = (event) => {
    this.props.onViewRoute()
  }

  onRouteOptimization = (value) => (event) => {
    this.props.onRouteOptimization(value, event.target.checked)
  }

  handleFenceDistanceChange = (event) => {
    this.props.onFenceDistanceChange(event.target.value)
  }

  clearRoute = (event) => {
    this.props.onClearRoute()
  }

  saveRoute = (event) => {
    this.props.onSaveRoute()
  }

  handleAoiChange = (selectedAoi) => {
    this.props.onSelectedAoiChange(selectedAoi)
  }

  // DND functions
  onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return
    }
    this.props.onAoiListDragEnd(result)
  }

  render() {
    // console.log("prospas",this.props.radioSelection)
    const {
      classes,
      radioSelection,
      places,
      showShortestRoute,
      aois,
      selectedAoi,
      distance,
      isRouteDrawn,
      selectedLanguage,
    } = this.props

    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        {this.props.isCardPresent === true ? (
          <React.Fragment>
            {/* <Card square elevation={8} className={classes.waypointsCard}> */}
            <CardContent>
              <Typography color="textSecondary">
                {
                  languageJson[selectedLanguage].routesPage.routeCreation
                    .chooseRouteLabel
                }
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  value="places"
                  control={
                    <Radio
                      color="primary"
                      checked={radioSelection === 'places'}
                      onChange={this.handleRadioChange}
                      value="places"
                      aria-label="places"
                    />
                  }
                  label="Places"
                />
                <FormControlLabel
                  value="aoi"
                  control={
                    <Radio
                      color="primary"
                      checked={radioSelection === 'aoi'}
                      onChange={this.handleRadioChange}
                      value="aoi"
                      aria-label="aoi"
                    />
                  }
                  label="AOI"
                />
              </FormGroup>
              <Typography color="textSecondary">
                {
                  languageJson[selectedLanguage].routesPage.routeCreation
                    .optimizationLabel
                }
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  value="places"
                  control={
                    <Switch
                      color="primary"
                      checked={showShortestRoute}
                      onChange={this.onRouteOptimization('optimalRoute')}
                      value="shortestRoute"
                    />
                  }
                  label={
                    languageJson[selectedLanguage].routesPage.routeCreation
                      .optimalRouteLabel
                  }
                />
              </FormGroup>
              <Typography color="textSecondary">
                {
                  languageJson[selectedLanguage].routesPage.routeCreation
                    .routeFenceLabel
                }
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  value="buffer"
                  control={
                    <TextField
                      id="buffer_in_meters"
                      value={distance}
                      onChange={this.handleFenceDistanceChange}
                      type="number"
                      className={classes.textField}
                      margin="normal"
                    />
                  }
                  label={
                    languageJson[selectedLanguage].routesPage.routeCreation
                      .meterLabel
                  }
                />
              </FormGroup>
              {radioSelection === 'places' ? (
                <Places
                  onNewPlace={this.onNewPlace}
                  getCoordinates={this.getCoordinates}
                  handlePlaceError={this.props.handlePlaceError}
                />
              ) : (
                <div>
                  <Typography color="textSecondary">
                    Search available AOIs
                  </Typography>
                  <ComboBox
                    items={aois || []}
                    selectedItem={selectedAoi}
                    onSelectedItemChange={this.handleAoiChange}
                    placeholder=""
                    isLoading={false}
                    filterSize={25}
                    itemKey="id"
                    itemToStringKey="areaName"
                  />
                </div>
              )}
              <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                  >
                    <Grid container>
                      {places.length > 1 && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="textSecondary">
                            Points can be rearranged by dragging and dropping
                          </Typography>
                        </Grid>
                      )}
                      {places.map((value, index) => (
                        <Draggable
                          key={value}
                          draggableId={value}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Grid item xs={12}>
                              <div
                                key={index}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <Chip
                                  avatar={<Avatar>{index + 1}</Avatar>}
                                  label={value}
                                  color="primary"
                                  onDelete={this.handlePlaceDelete(index)}
                                  className={classes.chip}
                                  classes={{
                                    root: classes.chipRoot,
                                    label: classes.chipLabel,
                                  }}
                                />
                                {/* <ReorderIcon /> */}
                              </div>
                            </Grid>
                          )}
                        </Draggable>
                      ))}
                    </Grid>
                  </div>
                )}
              </Droppable>
            </CardContent>

            <CardActions>
              <Grid container justify="flex-start" spacing={3}>
                <Grid item xs={3}>
                  <ColorButton variant="contained" onClick={this.viewRoute}>
                    {
                      languageJson[selectedLanguage].routesPage.routeCreation
                        .viewButtonTitle
                    }
                  </ColorButton>
                </Grid>
                <Grid item xs={3}>
                  <ColorButton
                    variant="contained"
                    color="primary"
                    disabled={!isRouteDrawn}
                    onClick={this.saveRoute}
                  >
                    {
                      languageJson[selectedLanguage].routesPage.routeCreation
                        .saveButtonTitle
                    }
                  </ColorButton>
                </Grid>
                <Grid item xs={6} style={{ textAlign: 'right' }}>
                  <Button variant="outlined" onClick={this.clearRoute}>
                    {
                      languageJson[selectedLanguage].routesPage.routeCreation
                        .clearButtonTitle
                    }
                  </Button>
                </Grid>
              </Grid>
            </CardActions>
            {/* </Card> */}
          </React.Fragment>
        ) : (
          <Card square elevation={8} className={classes.waypointsCard}>
            <CardContent>
              <Typography color="textSecondary">
                {
                  languageJson[selectedLanguage].routesPage.routeCreation
                    .chooseRouteLabel
                }
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  value="places"
                  control={
                    <Radio
                      color="primary"
                      checked={radioSelection === 'places'}
                      onChange={this.handleRadioChange}
                      value="places"
                      aria-label="places"
                    />
                  }
                  label="Places"
                />
                <FormControlLabel
                  value="aoi"
                  control={
                    <Radio
                      color="primary"
                      checked={radioSelection === 'aoi'}
                      onChange={this.handleRadioChange}
                      value="aoi"
                      aria-label="aoi"
                    />
                  }
                  label="AOI"
                />
              </FormGroup>
              <Typography color="textSecondary">
                {
                  languageJson[selectedLanguage].routesPage.routeCreation
                    .optimizationLabel
                }
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  value="places"
                  control={
                    <Switch
                      color="primary"
                      checked={showShortestRoute}
                      onChange={this.onRouteOptimization('optimalRoute')}
                      value="shortestRoute"
                    />
                  }
                  label={
                    languageJson[selectedLanguage].routesPage.routeCreation
                      .optimalRouteLabel
                  }
                />
              </FormGroup>
              <Typography color="textSecondary">
                {
                  languageJson[selectedLanguage].routesPage.routeCreation
                    .routeFenceLabel
                }
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  value="buffer"
                  control={
                    <TextField
                      id="buffer_in_meters"
                      value={distance}
                      onChange={this.handleFenceDistanceChange}
                      type="number"
                      className={classes.textField}
                      margin="normal"
                    />
                  }
                  label={
                    languageJson[selectedLanguage].routesPage.routeCreation
                      .meterLabel
                  }
                />
              </FormGroup>
              {radioSelection === 'places' ? (
                <Places
                  onNewPlace={this.onNewPlace}
                  getCoordinates={this.getCoordinates}
                  handlePlaceError={this.props.handlePlaceError}
                />
              ) : (
                <div>
                  <Typography color="textSecondary">
                    Search available AOIs
                  </Typography>
                  <ComboBox
                    items={aois || []}
                    selectedItem={selectedAoi}
                    onSelectedItemChange={this.handleAoiChange}
                    placeholder=""
                    isLoading={false}
                    filterSize={25}
                    itemKey="id"
                    itemToStringKey="areaName"
                  />
                </div>
              )}
              <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                  >
                    <Grid container>
                      {places.length > 1 && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="textSecondary">
                            Points can be rearranged by dragging and dropping
                          </Typography>
                        </Grid>
                      )}
                      {places.map((value, index) => (
                        <Draggable
                          key={value}
                          draggableId={value}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Grid item xs={12}>
                              <div
                                key={index}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <Chip
                                  avatar={<Avatar>{index + 1}</Avatar>}
                                  label={value}
                                  color="primary"
                                  onDelete={this.handlePlaceDelete(index)}
                                  className={classes.chip}
                                  classes={{
                                    root: classes.chipRoot,
                                    label: classes.chipLabel,
                                  }}
                                />
                                {/* <ReorderIcon /> */}
                              </div>
                            </Grid>
                          )}
                        </Draggable>
                      ))}
                    </Grid>
                  </div>
                )}
              </Droppable>
            </CardContent>

            <CardActions>
              <Grid container justify="flex-start" spacing={8}>
                <Grid item xs={3}>
                  <ColorButton variant="contained" onClick={this.viewRoute}>
                    {
                      languageJson[selectedLanguage].routesPage.routeCreation
                        .viewButtonTitle
                    }
                  </ColorButton>
                </Grid>
                <Grid item xs={3}>
                  <ColorButton
                    variant="contained"
                    color="primary"
                    disabled={!isRouteDrawn}
                    onClick={this.saveRoute}
                  >
                    {
                      languageJson[selectedLanguage].routesPage.routeCreation
                        .saveButtonTitle
                    }
                  </ColorButton>
                </Grid>
                <Grid item xs={6} style={{ textAlign: 'right' }}>
                  <Button variant="outlined" onClick={this.clearRoute}>
                    {
                      languageJson[selectedLanguage].routesPage.routeCreation
                        .clearButtonTitle
                    }
                  </Button>
                </Grid>
              </Grid>
            </CardActions>
          </Card>
        )}
      </DragDropContext>
    )
  }
}

export default withLanguage(withStyles(styles)(Waypoints))
