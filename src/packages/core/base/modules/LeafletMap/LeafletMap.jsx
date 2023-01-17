import React from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import { Map, withLeaflet } from 'react-leaflet'
import OpenStreetMapLayer from './OpenStreetMapLayer'
import OverviewVehicles from './OverviewVehicles'
import LiveVehicle from './LiveVehicle'
import ReplayVehicle from './ReplayVehicle'
import FullscreenControl from './FullScreenControl'
import getLoginId from '@zeliot/common/utils/getLoginId'

import 'leaflet/dist/leaflet.css'

const MAP_STYLE = { width: '100%', height: '100%', borderRadius: 16 }

function LeafletMap(props) {
  const {
    devices,
    onMarkerClick,
    selectedTab,
    liveData,
    replayData,
    zoom,
    center,
    flags,
    handleMapCenterChange,
    handleMapZoomChange,
    defaultCenter,
  } = props

  return (
    <Map
      style={MAP_STYLE}
      zoom={zoom}
      center={center || defaultCenter}
      maxZoom={18}
    >
      <FullscreenControl />

      <OpenStreetMapLayer />

      {selectedTab === 'overview' && (
        <OverviewVehicles devices={devices} onMarkerClick={onMarkerClick} />
      )}

      {selectedTab === 'live' && liveData && (
        <LiveVehicle
          liveData={liveData}
          mapCenter={center || defaultCenter}
          mapZoom={zoom}
          handleMapCenterChange={handleMapCenterChange}
          handleMapZoomChange={handleMapZoomChange}
        />
      )}

      {selectedTab === 'replay' && replayData && replayData.points && (
        <ReplayVehicle
          replayData={replayData}
          flags={flags}
          handleMapCenterChange={handleMapCenterChange}
          handleMapZoomChange={handleMapZoomChange}
        />
      )}

      {props.children}
    </Map>
  )
}

LeafletMap.propTypes = {
  zoom: PropTypes.number,
  center: PropTypes.arrayOf(PropTypes.number),
}

LeafletMap.defaultProps = {
  zoom: 6,
}

const GET_CLIENT_DETAIL = gql`
  query($loginId: Int!) {
    clientDetail(loginId: $loginId) {
      lat
      long
    }
  }
`

export default withLeaflet((props) => (
  <Query query={GET_CLIENT_DETAIL} variables={{ loginId: getLoginId() }}>
    {({ data }) => (
      <LeafletMap
        defaultCenter={{
          lat: data.clientDetail.lat || 7.36,
          lng: data.clientDetail.long || 12.35,
        }}
        {...props}
      />
    )}
  </Query>
))
