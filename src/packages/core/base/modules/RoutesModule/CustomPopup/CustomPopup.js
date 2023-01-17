import './CustomPopup.css'

const container = document.createElement('div')
const header = document.createElement('div')
header.classList.add('popup-header')
const body = document.createElement('div')
container.appendChild(header)
container.appendChild(body)
const saveButton = document.createElement('button')
const cancelButton = document.createElement('button')
saveButton.classList.add('popup-button')
cancelButton.classList.add('popup-button')
saveButton.appendChild(document.createTextNode('Yes'))
cancelButton.appendChild(document.createTextNode('No'))

export default function getCustomPopup(google) {
  return class CustomPopup extends google.maps.OverlayView {
    constructor(position) {
      super()
      this.position = position
      this.header = header
      this.body = body
      container.classList.add('popup-bubble-content')
      // Click listener for save aoi button
      google.maps.event.addDomListener(saveButton, 'click', () => {
        google.maps.event.trigger(this, 'confirm_save')
      })
      google.maps.OverlayView.preventMapHitsFrom(saveButton)
      body.appendChild(saveButton)

      // Click listener for cancel save button
      google.maps.event.addDomListener(cancelButton, 'click', () => {
        google.maps.event.trigger(this, 'cancel_save')
      })
      google.maps.OverlayView.preventMapHitsFrom(cancelButton)
      body.appendChild(cancelButton)

      let pixelOffset = document.createElement('div')
      pixelOffset.classList.add('popup-bubble-anchor')
      pixelOffset.appendChild(container)
      // pixelOffset.style.pointerEvents = 'none'
      // container.style.pointerEvents = 'none'

      this.anchor = document.createElement('div')
      this.anchor.classList.add('popup-tip-anchor')
      this.anchor.appendChild(pixelOffset)
      // this.anchor.style.pointerEvents = 'none'
      // Optionally stop clicks, etc., from bubbling up to the map.
      // this.stopEventPropagation()
    }

    onAdd = () => {
      this.getPanes().floatPane.appendChild(this.anchor)
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

    setPopupData = () => {
      this.header.innerHTML = `<b>Do you want to save this as a new AOI? </b>`
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
      // this.stopEventPropagation()
    }

    /** Stops clicks/drags from bubbling up to the map. */
    stopEventPropagation = () => {
      let anchor = this.anchor
      anchor.style.cursor = 'auto'

      // const events = [
      //   'click',
      //   'dblclick',
      //   'contextmenu',
      //   'wheel',
      //   'mousedown',
      //   'touchstart',
      //   'pointerdown'
      // ]
      // events.forEach(event => {
      //   anchor.addEventListener(event, e => {
      //     console.log(e)
      //     e.stopPropagation()
      //   })
      // })
    }
  }
}
