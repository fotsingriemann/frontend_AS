import React, { Component } from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import { withTheme } from '@material-ui/core'
import getLoginId from '@zeliot/common/utils/getLoginId'
import { darkMapStyles } from '@zeliot/common/constants/mapStyles'
import './Map.css'
import TrafficControl from './TrafficControl'

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
        zoomControl: true,
        fullscreenControl: true,
        scaleControl: true,
        mapTypeControl: true,
        mapTypeControlOptions: {
          position: this.props.google.maps.ControlPosition.TOP_CENTER,
        },
        maxZoom: 18,
      })

      this.props.setMap(this.map)

      const trafficLayerControlDiv = document.createElement('div')

      /* eslint-disable no-new */

      new TrafficControl(this.props.google, trafficLayerControlDiv, this.map)

      /* eslint-enable no-new */

      this.map.controls[this.props.google.maps.ControlPosition.RIGHT_TOP].push(
        trafficLayerControlDiv
      )
    }
  }

  componentDidMount() {
    this._setMap()
    if (this.props.theme.mode === 'dark') {
      this.map.setOptions({
        styles: darkMapStyles,
      })
    } else {
      this.map.setOptions({
        styles: [],
      })
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.theme !== this.props.theme) {
      if (this.props.theme.mode === 'dark') {
        this.map.setOptions({
          styles: darkMapStyles,
        })
      } else {
        this.map.setOptions({
          styles: [],
        })
      }
    }
  }

  render() {
    return (
      <div className="google-map">
        <div ref={this.mapRef} className="stretch" />
        {this.props.children}
      </div>
    )
  }
}

Map.propTypes = {
  zoom: PropTypes.number,
  center: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  google: PropTypes.object,
}

Map.defaultProps = {
  zoom: 4,
  google: null,
}

const GET_CLIENT_DETAIL = gql`
  query($loginId: Int!) {
    clientDetail(loginId: $loginId) {
      lat
      long
    }
  }
`

export default withTheme((props) => (
  <Query query={GET_CLIENT_DETAIL} variables={{ loginId: getLoginId() }}>
    {({ data }) => (
      <Map
        center={{
          lat: data.clientDetail.lat || 7.36,
          lng: data.clientDetail.long || 12.35,
        }}
        {...props}
      />
    )}
  </Query>
))
