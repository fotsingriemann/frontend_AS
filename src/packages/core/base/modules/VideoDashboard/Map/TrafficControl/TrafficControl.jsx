import './TrafficControl.css'
import TrafficIcon from '@zeliot/common/static/svg/traffic.svg'

export default class TrafficControl {
  constructor(google, controlDiv, map) {
    this._trafficLayer = new google.maps.TrafficLayer()
    this._map = map
    this._active = false

    this._layerControlDiv = document.createElement('button')
    this._layerControlDiv.id = 'traffic-layer-control'
    this._layerControlDiv.addEventListener('click', this.toggleTrafficLayer)
    this._layerControlDiv.title = 'Show traffic'

    const image = document.createElement('img')
    image.src = TrafficIcon

    this._layerControlDiv.appendChild(image)

    controlDiv.appendChild(this._layerControlDiv)
  }

  toggleTrafficLayer = () => {
    if (this._active) {
      this._trafficLayer.setMap(null)
      this._active = false
      this._layerControlDiv.classList.remove('traffic-layer-active')
      this._layerControlDiv.title = 'Show traffic'
    } else {
      this._trafficLayer.setMap(this._map)
      this._active = true
      this._layerControlDiv.classList.add('traffic-layer-active')
      this._layerControlDiv.title = 'Hide traffic'
    }
  }
}
