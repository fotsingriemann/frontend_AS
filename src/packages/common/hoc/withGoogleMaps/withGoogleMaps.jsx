/**
 * @module hoc/withGoogleMaps/withGoogleMaps
 * @summary HOC to provide google object as a prop
 */
import React from 'react'
import MapContainer from './MapContainer/MapContainer'

export default Component => props => (
  <MapContainer>
    {google => <Component google={google} {...props} />}
  </MapContainer>
)
