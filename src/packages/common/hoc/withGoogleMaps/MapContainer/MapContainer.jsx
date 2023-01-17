/**
 * @module hoc/withGoogleMaps/MapContainer/MapContainer
 * @summary MapContainer loads Google maps JS API
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'

/**
 * @summary MapContainer component loads Google maps JS API on demand
 */
class MapContainer extends Component {
  constructor(props) {
    super(props)
    if (!window.google) {
      this._loadGoogle()
    }
  }

  /**
   * @property {boolean} isGoogleReady State variable to check if google is available on window object
   * @property {object} google The google object exposed by Google Maps JS API
   */
  state = {
    isGoogleReady: false,
    google: null
  }

  /**
   * @function
   * @summary Creates a script tag to download Google Maps JS API
   */
  _loadGoogle = () => {
    const scriptElement = document.createElement('script')

    scriptElement.src = `https://maps.googleapis.com/maps/api/js?key=${this.props.apiKey}&libraries=geometry,places,visualization`
    scriptElement.type = 'text/javascript'
    scriptElement.defer = true
    scriptElement.async = true
    scriptElement.onload = this._setGoogle
    document.body.appendChild(scriptElement)
  }

  /**
   * @function
   * @summary Checks if google is available on the window object and sets the state
   */
  _setGoogle = () => {
    if (window.google) {
      this.setState({
        google: window.google,
        isGoogleReady: true
      })
    }
  }

  componentDidMount() {
    this._setGoogle()
  }

  render() {
    return this.state.isGoogleReady
      ? this.props.children(this.state.google)
      : this.props.loadingComponent
  }
}

MapContainer.propTypes = {
  loadingComponent: PropTypes.element,
  apiKey: PropTypes.string
}

MapContainer.defaultProps = {
  loadingComponent: <div>Loading ...</div>,
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  clientId: process.env.REACT_APP_GOOGLE_MAPS_CLIENT
}

export default MapContainer
