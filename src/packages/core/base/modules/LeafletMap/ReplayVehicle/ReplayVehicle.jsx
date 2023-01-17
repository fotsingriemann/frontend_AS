import React, { Component } from 'react'
import { Polyline, Marker, withLeaflet } from 'react-leaflet'
import L from 'leaflet'
import { getAngleDifference } from '../utils'
import CustomMarker from '../CustomMarker'
import startFlag from '@zeliot/common/static/png/start.png'
import stopFlag from '@zeliot/common/static/png/stop.png'
import haFlagIcon from '@zeliot/common/static/png/HA.png'
import hbFlagIcon from '@zeliot/common/static/png/HB.png'

class ReplayVehicle extends Component {
  state = {
    position: this.props.replayData.position,
    _position: this.props.replayData.position,
    rotation: 0,
    line: [this.props.replayData.points.map(point => [point.lat, point.lng])]
  }

  _animateRotation(newPosition, duration, cb) {
    const startLat = this.state.position[0]
    const startLng = this.state.position[1]
    const endLat = newPosition[0]
    const endLng = newPosition[1]

    const prevRotation =
      this.state.rotation < 360
        ? this.state.rotation
        : this.state.rotation - 360
    const nextRotation =
      getAngleDifference(startLat, startLng, endLat, endLng) - 90

    const animateStep = startDate => {
      const elapsedTime = new Date() - startDate
      const durationRatio = elapsedTime / duration
      const easingDurationRatio = 0.5 - Math.cos(durationRatio * Math.PI) / 2
      let rotation
      if (durationRatio < 1) {
        if (prevRotation > 0 && nextRotation < prevRotation - 180) {
          rotation =
            prevRotation +
            (nextRotation - prevRotation + 360) * easingDurationRatio
        } else {
          rotation =
            prevRotation + (nextRotation - prevRotation) * easingDurationRatio
        }

        if (this._isMounted) {
          this.setState({ rotation }, () => {
            this.animateHandler = window.requestAnimationFrame(() => {
              animateStep(startDate)
            })
          })
        }
      } else {
        cb()
      }
    }

    window.cancelAnimationFrame(this.animateHandler)
    animateStep(new Date())
  }

  _animateTo(newPosition, duration, cb) {
    const startLat = this.state.position[0]
    const startLng = this.state.position[1]
    const endLat = newPosition[0]
    const endLng = newPosition[1]

    if (this._isMounted) {
      this.setState({
        position: newPosition
      })
    }

    const animateStep = startDate => {
      const elapsedTime = new Date() - startDate

      const durationRatio = elapsedTime / duration
      const easingDurationRatio = 0.5 - Math.cos(durationRatio * Math.PI) / 2
      if (durationRatio < 1 && this._isMounted) {
        const deltaLat = startLat + (endLat - startLat) * easingDurationRatio
        const deltaLng = startLng + (endLng - startLng) * easingDurationRatio

        this.setState(
          {
            _position: [deltaLat, deltaLng]
          },
          () =>
            (this.animateHandler = window.requestAnimationFrame(() => {
              animateStep(startDate)
            }))
        )
      } else if (this._isMounted) {
        this.setState(
          {
            _position: newPosition,
            position: newPosition
          },
          cb
        )
      }
    }

    window.cancelAnimationFrame(this.animateHandler)
    animateStep(new Date())
  }

  _movedSignificantly = (position, precision = 4) => {
    const latDiff = parseFloat(position[0] - this.state.position[0]).toFixed(
      precision
    )
    const lngDiff = parseFloat(position[1] - this.state.position[1]).toFixed(
      precision
    )
    return !(parseFloat(latDiff) === 0 && parseFloat(lngDiff) === 0)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.replayData !== this.props.replayData) {
      if (this._movedSignificantly(this.props.replayData.position)) {
        this._animateRotation(
          this.props.replayData.position,
          0.33 * this.props.replayData.duration,
          () => {
            this._animateTo(
              this.props.replayData.position,
              0.66 * this.props.replayData.duration,
              () => {}
            )
          }
        )
      }
    }
  }

  componentDidMount() {
    this._isMounted = true
    this.props.leaflet.map.fitBounds(this.state.line)
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  render() {
    return (
      <React.Fragment>
        <Polyline positions={this.state.line} />

        <Marker
          icon={
            new L.Icon({
              iconUrl: startFlag,
              iconSize: [30, 30],
              iconAnchor: [0, 30]
            })
          }
          position={this.props.flags.startPosition}
        />

        <Marker
          icon={
            new L.Icon({
              iconUrl: stopFlag,
              iconSize: [30, 30],
              iconAnchor: [0, 30]
            })
          }
          position={this.props.flags.stopPosition}
        />

        {this.props.flags.haFlags.map((haFlag, index) => (
          <Marker
            key={index}
            icon={
              new L.Icon({
                iconUrl: haFlagIcon,
                iconSize: [30, 30],
                iconAnchor: [15, 30]
              })
            }
            position={haFlag}
          />
        ))}

        {this.props.flags.hbFlags.map((hbFlag, index) => (
          <Marker
            key={index}
            icon={
              new L.Icon({
                iconUrl: hbFlagIcon,
                iconSize: [30, 30],
                iconAnchor: [15, 30]
              })
            }
            position={hbFlag}
          />
        ))}

        <CustomMarker
          position={this.state._position}
          rotation={this.state.rotation}
          device={this.props.replayData}
        />
      </React.Fragment>
    )
  }
}

export default withLeaflet(ReplayVehicle)
