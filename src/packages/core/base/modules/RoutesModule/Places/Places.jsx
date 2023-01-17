import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete'

import {
  withStyles,
  Input,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Typography,
  Paper,
  Grid,
} from '@material-ui/core'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

const styles = (theme) => ({
  flexStyle: {
    flexGrow: 1,
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    display: 'flex',
    flexGrow: 1,
  },
  searchDropdown: {
    // position: 'absolute',
    zIndex: 10,
    marginTop: theme.spacing(1),
    maxHeight: theme.spacing(25),
    overflowY: 'auto',
  },
})

class Places extends Component {
  state = {
    anchorEl: null,
    pointsCount: 0,
    autocompletePlace: '',
  }

  static propTypes = {
    placeholder: PropTypes.string,
    clearOnSelect: PropTypes.bool,
  }

  static defaultProps = {
    placeholder: 'Choose Places',
    clearOnSelect: true,
  }

  handlePlaceSelect = (address) => {
    geocodeByAddress(address)
      .then((results) => getLatLng(results[0]))
      .then((latLng) => {
        this.props.onNewPlace(address)
        this.props.getCoordinates(latLng)
      })
      .catch((error) => {
        // this.props.handlePlaceError()
        console.log('Error', error)
      })
    this.setState({ anchorEl: null })

    this.setState({
      autocompletePlace: this.props.clearOnSelect ? '' : address,
      pointsCount: this.state.pointsCount + 1,
    })
  }

  handlePlaceChange = (autocompletePlace) => {
    this.setState({ autocompletePlace })
  }

  render() {
    const { classes, placeholder, selectedLanguage } = this.props

    return (
      <PlacesAutocomplete
        value={this.state.autocompletePlace}
        highlightFirstSuggestion={true}
        onChange={this.handlePlaceChange}
        onSelect={this.handlePlaceSelect}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div>
            <Typography color="textSecondary">
              {
                languageJson[selectedLanguage].routesPage.routeCreation
                  .choosePlacesLabel
              }
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <div className={classes.flexStyle}>
                    <Input
                      id="places-input"
                      className={classes.textField}
                      inputProps={{
                        ...getInputProps({
                          className: 'location-search-input',
                        }),
                      }}
                    />
                    <div className="autocomplete-dropdown-container">
                      {loading && <div>Loading...</div>}
                      <Paper className={classes.searchDropdown} square>
                        {suggestions.map((suggestion) => {
                          return (
                            <div {...getSuggestionItemProps(suggestion)}>
                              <MenuItem key={suggestion.placeId}>
                                {suggestion.description}
                              </MenuItem>
                            </div>
                          )
                        })}
                      </Paper>
                    </div>
                  </div>
                }
              />
            </FormGroup>
          </div>
        )}
      </PlacesAutocomplete>
    )
  }
}

export default withLanguage(withStyles(styles)(Places))
