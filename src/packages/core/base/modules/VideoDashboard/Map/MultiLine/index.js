export default function getMultiLine(google) {
  return class MultiLine {
    constructor(map) {
      this._google = google
      this._map = map
      this._lines = []
      this._isOverspeed = null
      this._currentLine = []
      this._lineColor = 'green'
    }

    _getLineColorFromisOverspeed(isOverspeed) {
      // console.log('line color', this._lineColor)
      return isOverspeed ? 'red' : this._lineColor
    }

    _addNewLine(isOverspeed) {
      this._currentLine = new google.maps.Polyline({
        path: [],
        geodesic: true,
        strokeColor: this._getLineColorFromisOverspeed(isOverspeed),
        strokeOpacity: 0.7,
        strokeWeight: 5
      })
      this._currentLine.setMap(this._map)
      this._lines.push(this._currentLine)
      this._isOverspeed = isOverspeed
    }

    /**
     * Append a new point on the multi-line
     * @param {google.maps.LatLng} point A google map LatLng object
     * @param {String} isOverspeed The isOverspeed of the vehicle ('running', 'idle', 'halt)
     */
    addPoint(point, isOverspeed = false, color = null) {
      if (color) this._lineColor = color
      // If isOverspeed has changed, add a new line of the corresponding color
      if (
        isOverspeed !== this._isOverspeed ||
        !(this._currentLine instanceof google.maps.Polyline)
      ) {
        this._addNewLine(isOverspeed)
        this._currentLine.getPath().push(point)
      } else {
        this._currentLine.getPath().push(point)
      }
    }

    remove() {
      this._lines.forEach(line => {
        line.setMap(undefined)
      })
      this._lineColor = 'green'
      this._lines = []
      this._currentLine = null
    }
  }
}
