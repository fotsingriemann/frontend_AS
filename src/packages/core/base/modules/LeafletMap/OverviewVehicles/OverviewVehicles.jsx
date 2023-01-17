import React from 'react'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import CustomMarker from '../CustomMarker'
import 'react-leaflet-markercluster/dist/styles.min.css'

const OverviewVehicles = ({ devices, onMarkerClick }) => (
  <MarkerClusterGroup disableClusteringAtZoom={15} spiderfyOnMaxZoom={false}>
    {devices.map(device => (
      <CustomMarker
        key={device.uniqueId}
        position={[device.latitude, device.longitude]}
        device={device}
        attachPopup={true}
        onClick={() => onMarkerClick(device)}
      />
    ))}
  </MarkerClusterGroup>
)

export default OverviewVehicles
