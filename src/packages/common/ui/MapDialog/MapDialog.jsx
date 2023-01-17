/**
 * @module MapDialog
 * @summary This module exports the MapDialog component
 */
import React, { Component } from 'react'
import withGoogleMaps from '@zeliot/common/hoc/withGoogleMaps/withGoogleMaps'
import Map from './Maps/Map'

import { Dialog, DialogContent } from '@material-ui/core'

/**
 * @summary MapDialog displays a Map inside a Dialog
 */
class MapDialog extends Component {
  render() {
    const { open, onClose, google, zoom, center, setMap, children } = this.props

    return (
      <Dialog open={open} onClose={onClose} maxWidth={false}>
        <DialogContent>
          <Map google={google} setMap={setMap} zoom={zoom} center={center} />
          {children}
        </DialogContent>
      </Dialog>
    )
  }
}

export default withGoogleMaps(MapDialog)
