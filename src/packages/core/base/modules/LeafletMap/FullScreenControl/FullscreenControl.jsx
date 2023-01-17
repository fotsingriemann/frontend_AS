import React from 'react'
import ReactDOM from 'react-dom'
import { withLeaflet, MapControl } from 'react-leaflet'
import { DomUtil, Control, DomEvent } from 'leaflet'
import './FullscreenControl.css'

class FullScreenControl extends MapControl {
  constructor(props, context) {
    super(props)
    this.div = DomUtil.create('div', 'leaflet-fullscreen-wrap')
    DomEvent.disableClickPropagation(this.div)
    DomEvent.disableScrollPropagation(this.div)
    this.map = context.map || props.leaflet.map
    this.mapContainer = this.map.getContainer()

    this.state = {
      isFullscreen: false,
      title: 'Fullscreen'
    }
  }

  createLeafletElement(props) {
    const ReactLeafletFullScreen = Control.extend({
      onAdd: map => this.div,
      onRemove: map => {}
    })
    return new ReactLeafletFullScreen(props)
  }

  handleClick = () => {
    if (this.state.isFullscreen) {
      document.exitFullscreen()
    } else {
      this.mapContainer.requestFullscreen()
    }
  }

  componentDidMount() {
    super.componentDidMount()
    ReactDOM.render(
      <button
        {...this.props}
        className={
          'fullscreen-control ' +
          (this.state.isFullscreen
            ? 'fullscreen-active'
            : 'fullscreen-inactive')
        }
        map={this.map}
        onClick={this.handleClick}
        title={this.state.title}
      />,
      this.div
    )

    document.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement) {
        this.setState({
          isFullscreen: true,
          title: 'Exit Fullscreen'
        })
      } else {
        this.setState({
          isFullscreen: false,
          title: 'Fullscreen'
        })
      }
    })
  }

  componentDidUpdate() {
    ReactDOM.render(
      <button
        {...this.props}
        className={
          'fullscreen-control ' +
          (this.state.isFullscreen
            ? 'fullscreen-active'
            : 'fullscreen-inactive')
        }
        map={this.map}
        onClick={this.handleClick}
        title={this.state.title}
      />,
      this.div
    )
  }

  render() {
    return <div />
  }
}

export default withLeaflet(FullScreenControl)
