import React, { Component } from 'react'
import PlacesAutoComplete, { geocodeByPlaceId } from 'react-places-autocomplete'
import { Input, Paper, MenuItem, withStyles } from '@material-ui/core'

const styles = theme => ({
  container: {
    width: 300,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  fullWidth: {
    width: '100%'
  },
  trimItemText: {
    width: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
})

class PlaceSearcher extends Component {
  constructor(props) {
    super(props)
    this.inputRef = React.createRef()
  }

  state = {
    autocompletePlace: '',
    selectedPlace: null
  }

  handlePlaceChange = place => this.setState({ autocompletePlace: place })

  handlePlaceSelect = (address, placeId) => {
    geocodeByPlaceId(placeId)
      .then(results => {
        const bounds = results[0].geometry.viewport
        this.props.changeBounds(bounds)
        this.setState({ autocompletePlace: '' })
      })
      .catch(error => {
        this.setState({ autocompletePlace: '' })
        console.error(error)
      })
  }

  render() {
    const { classes } = this.props

    return (
      <PlacesAutoComplete
        value={this.state.autocompletePlace}
        highlightFirstSuggestion={true}
        onChange={this.handlePlaceChange}
        onSelect={this.handlePlaceSelect}
        searchOptions={{
          types: ['geocode']
        }}
        debounce={500}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div className={classes.container}>
            <Input
              id="places-input"
              placeholder="Search Place"
              ref={this.inputRef}
              inputProps={{ ...getInputProps() }}
            />
            <div className={classes.fullWidth}>
              <Paper square>
                {loading && <div>Loading...</div>}
                {suggestions.map(suggestion => {
                  return (
                    <div {...getSuggestionItemProps(suggestion)}>
                      <MenuItem
                        key={suggestion.description}
                        title={suggestion.description}
                      >
                        <div className={classes.trimItemText}>
                          {suggestion.description}
                        </div>
                      </MenuItem>
                    </div>
                  )
                })}
              </Paper>
            </div>
          </div>
        )}
      </PlacesAutoComplete>
    )
  }
}

export default withStyles(styles)(PlaceSearcher)
