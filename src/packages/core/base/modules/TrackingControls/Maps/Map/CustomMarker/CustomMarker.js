import { getIconSizeFromZoom } from '../utils'
import getMultiLine from '../MultiLine'
import { VEHICLE_ICONS } from '@zeliot/common/constants/others'

export default function getCustomMarker(google) {
  // Get Multiline class
  const MultiLine = getMultiLine(google)
  return class CustomMarker extends google.maps.OverlayView {
    constructor(vehicle, map, popup, onMarkerClick, multiLine) {
      super()
      this.vehicle = vehicle
      this._id = vehicle.uniqueId
      this.onMarkerClick = onMarkerClick
      /* eslint-disable indent */
      this._status = vehicle.isOffline
        ? 'offline'
        : vehicle.isNoGps
        ? 'nogps'
        : vehicle.haltStatus
        ? 'halt'
        : vehicle.idlingStatus === true
        ? 'idle'
        : vehicle.idlingStatus === false && vehicle.haltStatus === false
        ? 'running'
        : 'default'
      /* eslint-enable indent */
      this._prevMode = 'overview'
      this._mapMode = 'overview'
      this._ignoreEvents = false
      this._isOverspeed = vehicle.isOverspeed
      this._timestamp = Number(vehicle.timestamp)
      this._speed = Number(vehicle.speed)
      this.popup = popup
      this._id = vehicle.uniqueId
      this._position = new google.maps.LatLng(
        parseFloat(vehicle.latitude.toFixed(6)),
        parseFloat(vehicle.longitude.toFixed(6))
      )
      this._map = map
      // this._animationQueue = new Queue()
      this._rotation = this._getInitialRandomRotation()
      this._div = null
      this._img = null
      this._size = null
      this._multiLine = multiLine
      this._drawLine = true
      this.setMap(map)
    }

    // Private methods

    /**
     * Sets the initial rotation of the marker to a random value
     */
    _getInitialRandomRotation() {
      return Math.round(Math.random() * 360)
    }

    /**
     * Sets the size of the div and img to the specified sizes
     */
    _setDimensions() {
      this._div.style.width = `${this._size.width}px`
      this._div.style.height = `${this._size.height}px`
      this._img.style.width = `${this._size.width}px`
      this._img.style.height = `${this._size.height}px`
    }

    /**
     * Creates and sets the style of a div
     */
    _setDiv() {
      this._div = document.createElement('div')
      this._div.className = 'custom-marker'
      this._div.style.position = 'absolute'
      this._div.style.cursor = 'pointer'
      this._div.style.transform = `rotate(${this._rotation}deg)`
      this._setDivSize()
    }

    /**
     * Sets a given element's size as specified
     * @param {HTMLElement} element An element whose size needs to be set
     * @param {Object} size An object with width and height of the element
     */
    _setElementSize(element, size) {
      element.style.width = `${size.width}px`
      element.style.height = `${size.height}px`
    }

    /**
     * Sets the div's size
     */
    _setDivSize() {
      this._setElementSize(this._div, this._size)
    }

    /**
     * Sets the image element's size
     */
    _setImageSize() {
      this._setElementSize(this._img, this._size)
    }

    /**
     * Sets the image element's source depending on the status of the marker
     * @param {String} status The status of the marker
     */
    _getImageSrc(status = this._status) {
      let vType = VEHICLE_ICONS.find(element => {
        return (
          element.vehicleType.toLowerCase() ===
          this.vehicle.vehicleType.toLowerCase()
        )
      })

      if (!vType) {
        vType = VEHICLE_ICONS[0]
      }

      switch (status) {
        case 'running': {
          this._img.src = vType.icons.running
          break
        }
        case 'idle': {
          this._img.src = vType.icons.idle
          break
        }
        case 'nogps': {
          this._img.src = vType.icons.nogps
          break
        }
        case 'offline': {
          this._img.src = vType.icons.offline
          break
        }
        case 'halt': {
          this._img.src = vType.icons.halt
          break
        }
        default: {
          this._img.src = vType.icons.default
        }
      }
    }

    /**
     * Creates and sets the style of an image element
     */
    _setImage() {
      this._img = document.createElement('img')
      this._getImageSrc()
      this._setImageSize()
      this._img.style.position = 'absolute'
      this._img.style.top = 0
      this._img.style.left = 0
      this._div.appendChild(this._img)
    }

    /**
     * Sets the div's data-marker_id to the specified marker ID
     */
    _setMarkerId() {
      this._div.dataset.marker_id = this._id
    }

    /**
     * Adds an event listener on the div element
     * @param {String} eventType The type of event to be listened
     */
    _addEventListener(eventType, cb) {
      google.maps.event.addDomListener(this._div, eventType, cb)
    }

    /**
     * Adds the div to the map's overlayImage pane
     */
    _addDivToOverlay() {
      const panes = this.getPanes()
      if (panes) {
        panes.overlayImage.appendChild(this._div)
      }
      // panes.markerLayer.appendChild(this._div)
    }

    /**
     * Sets the div's absolute position from it's LatLng position
     */
    _setDivPositionFromLatLng() {
      const projection = this.getProjection()
      if (projection) {
        const point = projection.fromLatLngToDivPixel(this._position)
        if (point) {
          this._div.style.left = `${point.x - this._size.width / 2}px`
          this._div.style.top = `${point.y - this._size.height / 2}px`
        }
      }
    }

    /**
     * Sets the div's rotation using CSS transform
     */
    _setRotation() {
      this._div.style.transform = `rotate(${this._rotation}deg)`
    }

    /**
     * Resizes the marker size depending on the zoom level
     */
    _rescaleIcons() {
      const currentZoom = this._map.getZoom()
      let options = {}

      if (this.vehicle.vehicleType.toLowerCase() === 'marker') {
        options = {
          square: true,
          sizeFactor: 0.5
        }
      }

      this._size = getIconSizeFromZoom(currentZoom, options)
    }

    _movedSignificantly(position, precision = 4) {
      const latDiff = parseFloat(position.lat() - this._position.lat()).toFixed(
        precision
      )
      const lngDiff = parseFloat(position.lng() - this._position.lng()).toFixed(
        precision
      )
      return !(parseFloat(latDiff) === 0 && parseFloat(lngDiff) === 0)
    }

    _updatePosition(position, options) {
      this._position = position
      if (this.map) {
        this.draw()
      }
    }

    _updateMap(location) {
      if (this._mapMode === 'live') {
        if (this.map) {
          this.map.panTo(location)
        }
      }
    }

    calcAngleDegrees(x, y) {
      return (Math.atan2(y, x) * 180) / Math.PI
    }

    getAngleDifference(fromLat, fromLng, toLat, toLng) {
      return this.calcAngleDegrees(toLat - fromLat, toLng - fromLng)
    }

    /**
     * Animate the marker to the new position
     * @param {google.maps.LatLng} newPosition The new position to which the marker should be animated
     * @param {Number} duration The duration of the animation in ms(default: 10000)
     * @param {Function} completeCallback The callback function to be called on finishing the animation
     */
    _animateTo(newPosition, duration, completeCallback) {
      const startLat = this.getPosition().lat()
      const startLng = this.getPosition().lng()
      const endLat = newPosition.lat()
      const endLng = newPosition.lng()

      if (
        this.map &&
        !this.map.getBounds().contains({
          lat: endLat,
          lng: endLng
        })
      ) {
        this._updateMap(newPosition)
      }

      const animateStep = startDate => {
        const elapsedTime = new Date() - startDate
        const durationRatio = elapsedTime / duration
        const easingDurationRatio = 0.5 - Math.cos(durationRatio * Math.PI) / 2
        if (durationRatio < 1) {
          const deltaLat = startLat + (endLat - startLat) * easingDurationRatio
          const deltaLng = startLng + (endLng - startLng) * easingDurationRatio
          const deltaPosition = new google.maps.LatLng(deltaLat, deltaLng)
          this._position = deltaPosition

          if (this.map) {
            this.draw()
            this.animateHandler = window.requestAnimationFrame(() => {
              animateStep(startDate)
            })
          }
        } else {
          this._position = newPosition
          this.draw()
          if (typeof completeCallback === 'function') {
            completeCallback()
          }
        }
      }

      window.cancelAnimationFrame(this.animateHandler)
      animateStep(new Date())
    }

    _animateRotation(newPosition, duration, completeCallback) {
      const startLat = this.getPosition().lat()
      const startLng = this.getPosition().lng()
      const endLat = newPosition.lat()
      const endLng = newPosition.lng()

      const prevRotation =
        this._rotation < 360 ? this._rotation : this._rotation - 360
      const nextRotation =
        this.getAngleDifference(startLat, startLng, endLat, endLng) - 90

      const animateStep = startDate => {
        const elapsedTime = new Date() - startDate
        const durationRatio = elapsedTime / duration
        const easingDurationRatio = 0.5 - Math.cos(durationRatio * Math.PI) / 2
        if (durationRatio < 1) {
          if (prevRotation > 0 && nextRotation < prevRotation - 180) {
            this._rotation =
              prevRotation +
              (nextRotation - prevRotation + 360) * easingDurationRatio
          } else {
            this._rotation =
              prevRotation + (nextRotation - prevRotation) * easingDurationRatio
          }

          if (this.map) {
            this.draw()
            this.animateHandler = window.requestAnimationFrame(() => {
              animateStep(startDate)
            })
          }
        } else {
          if (typeof completeCallback === 'function') {
            completeCallback()
          }
        }
      }

      window.cancelAnimationFrame(this.animateHandler)
      animateStep(new Date())
    }

    // Public methods

    drawInMapBounds() {
      this._rescaleIcons()
      if (this._div && this._img) {
        this._setDimensions()
      }

      if (!this._div) {
        this._setDiv()
        this._setImage()

        if (typeof this._id !== 'undefined') {
          this._setMarkerId()
        }

        this._addEventListener('mouseover', e => {
          if (!this._ignoreEvents) {
            google.maps.event.trigger(this, 'mouseover')
            this.popup.setPopupData({
              vehicleNumber: this.vehicle.vehicleNumber,
              vehicleType: this.vehicle.vehicleType,
              vehicleModel: this.vehicle.vehicleModel,
              timestamp: this._timestamp,
              speed: this._speed
            })
            this.popup.setPosition(this._position)
            this.popup.setMap(this.map)
          }
        })

        this._addEventListener('mouseout', e => {
          if (!this._ignoreEvents) {
            google.maps.event.trigger(this, 'mouseout')
            this.popup.setPopupData({
              vehicleNumber: '',
              vehicleType: '',
              vehicleModel: '',
              timestamp: '',
              speed: this._speed
            })
            this.popup.setPosition(undefined)
            this.popup.setMap(null)
          }
        })

        this._addEventListener('click', e => {
          if (!this._ignoreEvents) {
            google.maps.event.trigger(this, 'click')
            this.onMarkerClick(this.markerId)
            this.popup.setPopupData({
              vehicleNumber: '',
              vehicleType: '',
              vehicleModel: ''
            })
            this.popup.setPosition(undefined)
            this.popup.setMap(null)
          }
        })

        this._addDivToOverlay()
      }

      this._getImageSrc(this._status)
      this._setRotation()
      this._setDivPositionFromLatLng()

      if (
        this._mapMode === 'live' &&
        this._prevMode === 'live' &&
        this._drawLine
      ) {
        this._multiLine.addPoint(this._position, this._isOverspeed)
      }

      if (this._mapMode === 'replay' && this._drawLine) {
        this._multiLine.addPoint(this._position)
      }
    }

    /**
     * Draws a marker on the map
     * Adds image within a div onto the overlay of the map
     */
    draw() {
      this._map.getBounds().contains(this.getPosition())
        ? this.drawInMapBounds()
        : this.remove()
    }

    /**
     * Removes the marker from the map
     */
    remove() {
      if (this._div && this._div.parentNode) {
        this._div.parentNode.removeChild(this._div)
        this._div = null
      }
    }

    /**
     * Returns the current position of the marker
     * @returns {google.maps.LatLng} The current position of the custom marker
     */
    getPosition() {
      return this._position
    }

    setPosition(position) {
      this._updatePosition(position)
    }

    /**
     * Updates the position of the marker to a new position
     * @param {Object} position Next position of the marker after animation in {lat: , lng: } format
     * @param {Object} options Miscellaneous options like status
     * @param {Number} duration Duration of animation in ms
     */
    updateMarker(position, options, interval) {
      const newPosition = new google.maps.LatLng(position.lat, position.lng)
      if (options.timestamp) {
        this._timestamp = options.timestamp
      }
      if (options.speed) {
        this._speed = options.speed
      }
      let oldStatus = ''
      if (options.status !== 'default') {
        // update the marker
        oldStatus = this._status
        this._status = options.status
      } else {
        oldStatus = ''
      }

      /* If marker moved significantly from previous position, update/animate to new position,
        else don't bother moving
        */
      if (this._movedSignificantly(newPosition)) {
        this._prevMode = this._mapMode
        this._mapMode = options.mode
        if (this._mapMode === 'overview') {
          if (this._multiLine instanceof MultiLine) {
            this._multiLine.remove()
          }
          this._updatePosition(newPosition, options)
        } else if (this._mapMode === 'live') {
          this._isOverspeed = options.isOverspeed
          this._animateRotation(newPosition, 0.33 * interval, () => {
            this._animateTo(newPosition, 0.66 * interval, () => {})
          })
        } else if (this._mapMode === 'replay') {
          this._animateRotation(newPosition, 0.33 * interval, () => {
            this._animateTo(newPosition, 0.66 * interval, () => {})
          })
        }
      } else if (oldStatus !== this._status) {
        this.draw()
      }
    }

    /**
     * Returns the marker's ID
     */
    get markerId() {
      return this._id
    }

    /**
     * Sets the map mode of the marker
     */
    set ignoreEvents(ignoreEvents) {
      this._ignoreEvents = ignoreEvents
    }

    set drawLine(shouldDrawLine) {
      this._drawLine = shouldDrawLine
    }
  }
}
