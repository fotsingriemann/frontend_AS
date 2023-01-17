import React from 'react'
import LeafletMap from '@zeliot/core/base/modules/LeafletMap'

const WrappedMap = props => (
  <div
    style={{
      height: 500,
      width: '100%'
    }}
  >
    <LeafletMap {...props} />
  </div>
)

export default WrappedMap
