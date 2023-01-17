import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './Map.css'

class Map extends Component {
  constructor(props) {
    super(props)
    this.mapRef = React.createRef()
  }

  static propTypes = {
    zoom: PropTypes.number,
    center: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number
    }),
    google: PropTypes.object
  }

  static defaultProps = {
    zoom: 5,
    center: { lat: 23, lng: 77 },
    google: null
  }

  _setMap() {
    if (this.props.google) {
      const map = new this.props.google.maps.Map(this.mapRef.current, {
        center: this.props.center,
        zoom: this.props.zoom,
        // maxZoom: this.props.zoom,
        // minZoom: this.props.zoom - 1,
        clickableIcons: false,
        disableDefaultUI: true,
        fullscreenControl: false,
        scaleControl: false,
        gestureHandling: 'cooperative',
        zoomControl: false,
        mapTypeId: 'satellite'
      })
      this.props.setMap(map)
    }
  }

  componentDidMount() {
    this._setMap()
  }

  render() {
    return <div className="school-dashboard-google-map" ref={this.mapRef} />
  }
}

export default Map
