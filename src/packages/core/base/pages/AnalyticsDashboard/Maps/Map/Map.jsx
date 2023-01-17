import React, { Component } from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import getLoginId from '@zeliot/common/utils/getLoginId'
import { darkMapStyles } from '@zeliot/common/constants/mapStyles'
import './Map.css'

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
        gestureHandling: 'cooperative',
        zoomControl: false,
        mapTypeId: 'satellite',
        mapTypeControl: true,
      })

      this.props.setMap(this.map)
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
    return <div className="google-map" ref={this.mapRef} />
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
  zoom: 5,
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

export default (props) => (
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
)
