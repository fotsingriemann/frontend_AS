import './CustomPopup.css'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import moment from 'moment'

const container = document.createElement('div')
const header = document.createElement('div')
header.classList.add('popup-header')
const body = document.createElement('div')
container.appendChild(header)
container.appendChild(body)

export default function getCustomPopup(google) {
  return class CustomPopup extends google.maps.OverlayView {
    constructor(position) {
      super()
      this.position = position
      this.header = header
      this.body = body
      container.classList.add('popup-bubble-content')

      let pixelOffset = document.createElement('div')
      pixelOffset.classList.add('popup-bubble-anchor')
      pixelOffset.appendChild(container)
      pixelOffset.style.pointerEvents = 'none'
      container.style.pointerEvents = 'none'

      this.anchor = document.createElement('div')
      this.anchor.classList.add('popup-tip-anchor')
      this.anchor.appendChild(pixelOffset)
      this.anchor.style.pointerEvents = 'none'

      this.loginId = localStorage.getItem('loginId')
      // Optionally stop clicks, etc., from bubbling up to the map.
      // this.stopEventPropagation()
    }

    onAdd = () => {
      this.getPanes().overlayImage.appendChild(this.anchor)
      // this.stopEventPropagation()
    }

    onRemove = () => {
      if (this.anchor.parentElement) {
        this.anchor.parentElement.removeChild(this.anchor)
      }
    }

    setPosition = position => {
      this.position = position
    }

    setPopupData = ({
      vehicleNumber,
      vehicleModel,
      vehicleType,
      speed,
      timestamp
    }) => {
      this.header.innerHTML = `<b>${vehicleNumber}</b>`
      this.body.innerHTML = `Speed: ${speed}
      <br />
      Last tracked : ${
        this.loginId === '1962'
          ? getFormattedTime(timestamp, 'MMMM Do YYYY, h:mm:ss a')
          : moment
              .unix(timestamp)
              .utc()
              .format('MMMM Do YYYY, h:mm:ss a')
      }
      `
    }

    /** Called when the popup needs to draw itself. */
    draw = () => {
      const divPosition = this.getProjection().fromLatLngToDivPixel(
        this.position
      )
      // Hide the popup when it is far out of view.
      const display =
        Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000
          ? 'block'
          : 'none'

      if (display === 'block') {
        this.anchor.style.left = divPosition.x + 'px'
        this.anchor.style.top = divPosition.y + 'px'
      }
      if (this.anchor.style.display !== display) {
        this.anchor.style.display = display
      }
    }

    /** Stops clicks/drags from bubbling up to the map. */
    stopEventPropagation = () => {
      let anchor = this.anchor
      anchor.style.cursor = 'auto'
    }
  }
}
