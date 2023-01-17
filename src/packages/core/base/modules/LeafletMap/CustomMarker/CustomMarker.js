import PropTypes from 'prop-types'
import { Marker as LeafletMarker, DivIcon } from 'leaflet'
import { withLeaflet, MapLayer } from 'react-leaflet'
import './CustomMarker.css'
import getRandomAngle from './utils/getRandomAngle'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import { VEHICLE_ICONS } from '@zeliot/common/constants/others'

class CustomMarker extends MapLayer {
  el

  _getStyle() {
    const style = `transform: rotate(${this.props.rotation ||
      getRandomAngle()}deg)`
    return style
  }

  _getImageSrc() {
    /* eslint-disable indent */

    const status = this.props.device.isOffline
      ? 'offline'
      : this.props.device.isNoGps
        ? 'nogps'
        : this.props.device.haltStatus
          ? 'halt'
          : this.props.device.idlingStatus === true
            ? 'idle'
            : this.props.device.idlingStatus === false &&
              this.props.device.haltStatus === false
              ? 'running'
              : 'default'

    let vType = VEHICLE_ICONS.find(element => {
      return (
        element.vehicleType.toLowerCase() ===
        this.props.device.vehicleType.toLowerCase()
      )
    })

    if (!vType) {
      vType = VEHICLE_ICONS[0]
    }

    switch (status) {
      case 'running':
        return vType.icons.running

      case 'idle':
        return vType.icons.idle

      case 'nogps':
        return vType.icons.nogps

      case 'offline':
        return vType.icons.offline

      case 'halt':
        return vType.icons.halt

      default:
        return vType.icons.default
    }
    /* eslint-enable indent */
  }

  _getIcon() {
    const style = this._getStyle()
    const customIcon = new DivIcon({
      html: `
    <div style="${style}" class="custom-animated-marker">
      <img src="${this._getImageSrc()}" alt="Icon" height="100%" width="100%"/>
    </div>
  `,
      iconSize: [40, 20],
      className: 'custom-marker'
    })
    return customIcon
  }

  _setMarker() {
    this.el = new LeafletMarker(this.props.position)
    this.contextValue = { ...this.props.leaflet, popupContainer: this.el }
    this.el.setIcon(this._getIcon())
  }

  _setPopupContent() {
    /* eslint-disable indent */
    return `
      <div>
        <div class="custom-popup-header">${
          this.props.device.vehicleNumber
        }</div>
        <div>Type: ${this.props.device.vehicleType}</div>
        <div>Model: ${this.props.device.vehicleModel}</div>
        <div>Speed: ${this.props.device.speed}</div>
        <div>Last tracked time: ${getFormattedTime(
          this.props.device.timestamp,
          'Do MMM YYYY, h:mm:ss A'
        )}</div>

      </div>
    `
    /* eslint-enable indent */
  }

  _setPopup() {
    this.el.bindPopup(this._setPopupContent(), {
      className: 'custom-popup',
      closeButton: false,
      maxWidth: 200
    })
    this.el.on('mouseover', e => this.el.openPopup())
    this.el.on('mouseout', e => this.el.closePopup())
  }

  createLeafletElement(props) {
    this._setMarker()
    if (props.attachPopup) {
      this._setPopup()
    }
    return this.el
  }

  updateLeafletElement(fromProps, toProps) {
    if (toProps.position !== fromProps.position) {
      this.leafletElement.setLatLng(toProps.position)
    }
    if (toProps.icon !== fromProps.icon) {
      this.leafletElement.setIcon(toProps.icon)
    }
    if (toProps.zIndexOffset !== fromProps.zIndexOffset) {
      this.leafletElement.setZIndexOffset(toProps.zIndexOffset)
    }
    if (toProps.opacity !== fromProps.opacity) {
      this.leafletElement.setOpacity(toProps.opacity)
    }
    if (toProps.draggable !== fromProps.draggable) {
      if (toProps.draggable === true) {
        this.leafletElement.dragging.enable()
      } else {
        this.leafletElement.dragging.disable()
      }
    }

    if (toProps.rotation !== fromProps.rotation) {
      const style = `transform: rotate(${toProps.rotation}deg)`
      this.leafletElement.setIcon(
        new DivIcon({
          html: `
    <div style="${style}" class="custom-animated-marker">
      <img src="${this._getImageSrc()}" alt="Icon" height="20" width="40"/>
    </div>
  `,
          iconSize: [40, 20],
          className: 'custom-marker'
        })
      )
    }

    if (toProps.device !== fromProps.device) {
      this.el.setPopupContent(this._setPopupContent())
    }
  }

  render() {
    return null
  }
}

CustomMarker.propTypes = {
  rotation: PropTypes.number,
  position: PropTypes.arrayOf(PropTypes.number).isRequired
}

export default withLeaflet(CustomMarker)
