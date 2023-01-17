import React, { Component } from 'react'
import { Polyline } from 'react-leaflet'
import { getAngleDifference } from '../utils'
import CustomMarker from '../CustomMarker'

class LiveVehicle extends Component {
  state = {
    position: this.props.liveData.position,
    _position: this.props.liveData.position,
    rotation: 0,
    line: []
  }

  _animateRotation(newPosition, duration, cb) {
    const startLat = this.state.position[0]
    const startLng = this.state.position[1]
    const endLat = newPosition[0]
    const endLng = newPosition[1]

    let prevRotation =
      this.state.rotation < 360
        ? this.state.rotation
        : this.state.rotation - 360
    let nextRotation =
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

        this.setState({ rotation }, () => {
          this.animateHandler = window.requestAnimationFrame(() => {
            animateStep(startDate)
          })
        })
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
      this.props.handleMapCenterChange(newPosition)
    }

    const animateStep = startDate => {
      const elapsedTime = new Date() - startDate

      const durationRatio = elapsedTime / duration
      const easingDurationRatio = 0.5 - Math.cos(durationRatio * Math.PI) / 2
      if (durationRatio < 1 && this._isMounted) {
        const deltaLat = startLat + (endLat - startLat) * easingDurationRatio
        const deltaLng = startLng + (endLng - startLng) * easingDurationRatio

        this.setState(
          ({ line }) => ({
            _position: [deltaLat, deltaLng],
            line: [...line, [deltaLat, deltaLng]]
          }),
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
    if (prevProps.liveData !== this.props.liveData) {
      if (this._movedSignificantly(this.props.liveData.position)) {
        this._animateRotation(
          this.props.liveData.position,
          0.33 * this.props.liveData.duration,
          () => {
            this._animateTo(
              this.props.liveData.position,
              0.66 * this.props.liveData.duration,
              () => {}
            )
          }
        )
      }
    }
  }

  componentDidMount() {
    this._isMounted = true
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  render() {
    return (
      <React.Fragment>
        <Polyline positions={this.state.line} />
        <CustomMarker
          position={this.state._position}
          rotation={this.state.rotation}
          device={this.props.liveData.device}
        />
      </React.Fragment>
    )
  }
}

export default LiveVehicle
