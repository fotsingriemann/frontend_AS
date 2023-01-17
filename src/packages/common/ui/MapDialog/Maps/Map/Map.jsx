/**
 * @module Map
 * @summary This module exports a google map component
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { darkMapStyles } from '@zeliot/common/constants/mapStyles'

import './Map.css'

/**
 * @summary Map component renders an interactive google map
 */
class Map extends Component {
  constructor(props) {
    super(props)
    this.mapRef = React.createRef()
  }

  map = null

  _setMap() {
    if (this.props.google) {
      this.map = new this.props.google.maps.Map(this.mapRef.current, {
        center: this.props.center,
        zoom: this.props.zoom,
        clickableIcons: false,
        disableDefaultUI: true,
        fullscreenControl: false,
        scaleControl: false,
        zoomControl: true,
        styles: darkMapStyles
      })

      this.props.setMap(this.map)
    }
  }

  componentDidMount() {
    this._setMap()
    if (this.props.theme.mode === 'dark') {
      this.map.setOptions({
        styles: darkMapStyles
      })
    } else {
      this.map.setOptions({
        styles: []
      })
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.theme !== this.props.theme) {
      if (this.props.theme.mode === 'dark') {
        this.map.setOptions({
          styles: darkMapStyles
        })
      } else {
        this.map.setOptions({
          styles: []
        })
      }
    }
  }

  render() {
    return <div className="dialog-google-map" ref={this.mapRef} />
  }
}

Map.propTypes = {
  zoom: PropTypes.number,
  center: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number
  }),
  google: PropTypes.object
}

Map.defaultProps = {
  zoom: 5,
  center: { lat: 20.5937, lng: 78.9629 },
  google: null
}

export default Map
