import React, { Component } from 'react'
import Places from '@zeliot/core/base/modules/RoutesModule/Places'

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
  TextField,
  Chip,
} from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

let placeName = null

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
  flexStyle: {
    flexGrow: 1,
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    display: 'flex',
    flexGrow: 1,
  },
})

class ConfigurationPanel extends Component {
  handleGeometryRadioChange = (event) => {
    this.props.onGeometrySelectionChanged(event.target.value)
  }

  handleAoitypeRadioChange = (event) => {
    this.props.handleAoitypeSelectionChange(event.target.value)
  }

  handleLatChange = (event) => {
    this.props.handleCoordinatesChange('lat', event.target.value)
  }

  handleLngChange = (event) => {
    this.props.handleCoordinatesChange('lng', event.target.value)
  }

  handlePlaceDelete = (index) => (event) => {
    this.props.onPlaceDelete(index)
  }

  onNewPlace = (selectedPlace) => {
    this.props.onNewPlace(selectedPlace)
    placeName = selectedPlace
  }

  getCoordinates = (newCoordinate) => {
    this.props.getCoordinates(newCoordinate)
  }

  handleRadiusChange = (event) => {
    this.props.handleRadiusChange(event.target.value)
  }

  handleChipDelete = () => {
    placeName = null
    this.props.clearPlaceOnChipDelete()
  }

  viewPoint = (event) => {
    this.props.onViewPoint()
  }

  clearPoint = (event) => {
    this.props.onClearPoint()
  }

  savePoint = (event) => {
    this.props.onSavePoint()
  }

  render() {
    const {
      classes,
      geometrySelection,
      aoiTypeSelection,
      lat,
      lng,
      radius,
      placeClear,
      isFence,
      selectedLanguage,
    } = this.props
    return (
      <Card square elevation={8} style={{ height: '450px' }}>
        <CardContent>
          <br />
          <Typography color="textSecondary">
            {
              languageJson[selectedLanguage].aoiPage.aoiCreation
                .chooseGeometryLabel
            }
          </Typography>
          <FormGroup row>
            <FormControlLabel
              value="circle"
              control={
                <Radio
                  color="primary"
                  checked={geometrySelection === 'circle'}
                  onChange={this.handleGeometryRadioChange}
                  value="circle"
                  aria-label="circle"
                />
              }
              label="Circle"
            />
            <FormControlLabel
              value="polygon"
              control={
                <Radio
                  color="primary"
                  checked={geometrySelection === 'polygon'}
                  onChange={this.handleGeometryRadioChange}
                  value="polygon"
                  aria-label="polygon"
                />
              }
              label="Polygon"
            />
          </FormGroup>
          <Typography color="textSecondary">
            {languageJson[selectedLanguage].aoiPage.aoiCreation.markAoiLabel}
          </Typography>
          <FormGroup row>
            <FormControlLabel
              value="places"
              control={
                <Radio
                  color="primary"
                  checked={aoiTypeSelection === 'places'}
                  onChange={this.handleAoitypeRadioChange}
                  value="places"
                  aria-label="places"
                />
              }
              label="Places"
            />
            <FormControlLabel
              value="coordinates"
              control={
                <Radio
                  color="primary"
                  checked={aoiTypeSelection === 'coordinates'}
                  onChange={this.handleAoitypeRadioChange}
                  value="coordinates"
                  aria-label="coordinates"
                />
              }
              label="Coordinates"
            />
          </FormGroup>

          {aoiTypeSelection === 'places' ? (
            !placeClear ? (
              <Places
                placeholder={
                  languageJson[selectedLanguage].aoiPage.aoiCreation.searchPlace
                }
                clearOnSelect={false}
                onNewPlace={this.onNewPlace}
                getCoordinates={this.getCoordinates}
              />
            ) : (
              <Grid container>
                <Grid item xs={12}>
                  <Chip
                    label={placeName}
                    color="primary"
                    onDelete={this.handleChipDelete}
                    className={classes.chip}
                    classes={{
                      root: classes.chipRoot,
                      label: classes.chipLabel,
                    }}
                  />
                </Grid>
              </Grid>
            )
          ) : (
            <div className={classes.flexStyle}>
              {/* <Typography color="textSecondary">Latitude</Typography> */}
              <FormGroup row>
                <FormControlLabel
                  value="lat"
                  control={
                    <TextField
                      id="latitude"
                      type="number"
                      value={lat}
                      onChange={this.handleLatChange}
                      className={classes.textField}
                      margin="normal"
                      placeholder="Latitude"
                    />
                  }
                />
              </FormGroup>
              {/* <Typography color="textSecondary">Longitude</Typography> */}
              <FormGroup row>
                <FormControlLabel
                  value="lng"
                  control={
                    <TextField
                      id="longitude"
                      type="number"
                      value={lng}
                      onChange={this.handleLngChange}
                      className={classes.textField}
                      margin="normal"
                      placeholder="Longitude"
                    />
                  }
                />
              </FormGroup>
            </div>
          )}
          {/* <Typography color="textSecondary">AOI radius</Typography> */}
          <FormGroup row>
            <FormControlLabel
              value="radius"
              control={
                <TextField
                  id="radius_in_meters"
                  value={radius}
                  onChange={this.handleRadiusChange}
                  type="number"
                  className={classes.textField}
                  margin="normal"
                  placeholder={
                    languageJson[selectedLanguage].aoiPage.aoiCreation
                      .aoiRadiusLabel
                  }
                />
              }
              label={
                languageJson[selectedLanguage].aoiPage.aoiCreation.meterLabel
              }
            />
          </FormGroup>
        </CardContent>

        <CardActions>
          <Grid container justify="flex-start" spacing={8}>
            <Grid item xs={3}>
              <ColorButton variant="contained" onClick={this.viewPoint}>
                {
                  languageJson[selectedLanguage].aoiPage.aoiCreation
                    .viewButtonTitle
                }
              </ColorButton>
            </Grid>
            <Grid item xs={3}>
              <ColorButton
                variant="contained"
                color="primary"
                disabled={!isFence}
                onClick={this.savePoint}
              >
                {
                  languageJson[selectedLanguage].aoiPage.aoiCreation
                    .saveButtonTitle
                }
              </ColorButton>
            </Grid>
            <Grid item xs={6} style={{ textAlign: 'right' }}>
              <Button variant="outlined" onClick={this.clearPoint}>
                {
                  languageJson[selectedLanguage].aoiPage.aoiCreation
                    .clearButtonTitle
                }
              </Button>
            </Grid>
          </Grid>
        </CardActions>
      </Card>
    )
  }
}

export default withLanguage(withStyles(styles)(ConfigurationPanel))
