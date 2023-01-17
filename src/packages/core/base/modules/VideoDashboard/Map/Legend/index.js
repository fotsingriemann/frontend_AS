import './Legend.css'
import GreenCar from '@zeliot/common/static/png/green_car.png'
import YellowCar from '@zeliot/common/static/png/yellow_car.png'
import RedCar from '@zeliot/common/static/png/red_car.png'

export default class Legend {
  constructor(google, map, items) {
    this._google = google
    // this._controlDiv = controlDiv
    this._map = map
    this._items = [
      {
        image: GreenCar,
        text: 'Running'
      },
      {
        image: YellowCar,
        text: 'Idle'
      },
      {
        image: RedCar,
        text: 'Halt'
      }
    ]
    this._createLegendControl()
  }

  _createLegendControl() {
    const legendContainer = document.createElement('div')
    legendContainer.id = 'legend-container'
    const legendTitle = document.createElement('div')
    legendTitle.classList.add('legend-title')
    legendTitle.textContent = 'LEGEND'
    legendContainer.appendChild(legendTitle)
    for (let i = 0; i < this._items.length; i++) {
      const legendItem = document.createElement('div')
      legendItem.classList.add('legend-item')
      const legendItemImage = document.createElement('img')
      legendItemImage.classList.add('legend-item-image')
      legendItemImage.src = this._items[i].image
      const legendItemText = document.createElement('span')
      legendItemText.classList.add('legend-item-text')
      legendItemText.textContent = this._items[i].text
      legendItem.appendChild(legendItemImage)
      legendItem.appendChild(legendItemText)
      legendContainer.appendChild(legendItem)
    }
    this._map.controls[this._google.maps.ControlPosition.LEFT_CENTER].push(
      legendContainer
    )
  }
}
