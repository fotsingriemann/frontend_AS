import React from 'react'
import { TileLayer } from 'react-leaflet'

const OpenStreetMapLayer = () => (
  <TileLayer
    attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />
)

export default OpenStreetMapLayer
