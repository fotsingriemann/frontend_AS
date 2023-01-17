import React, { Component } from 'react'

const SVGContainer = React.createRef()
const SVG = React.createRef()
const BrushContainer = React.createRef()
const Brush = React.createRef()
const BrushStart = React.createRef()
const BrushEnd = React.createRef()

function getMousePosition(evt) {
  let CTM = SVG.current.getScreenCTM()

  return {
    x: (evt.clientX - CTM.e) / CTM.a,
    y: (evt.clientY - CTM.f) / CTM.d
  }
}

class CustomSvgBrush extends Component {
  state = {
    start: 0,
    end: 0,
    width: 0
  }

  element = {}
  considerDrag = false
  offset
  ContainerStart
  ContainerEnd
  mouseUpListener

  startDrag = e => {
    this.offset = getMousePosition(e)

    switch (e.target) {
      case BrushEnd.current:
        this.element['type'] = 'BRUSHEND'
        this.offset.x -= this.state.end
        this.considerDrag = true
        this.mouseUpListener = document.addEventListener(
          'mouseup',
          this.endDrag
        )
        break
      case BrushStart.current:
        this.element['type'] = 'BRUSHSTART'
        this.offset.x -= this.state.start
        this.considerDrag = true
        this.mouseUpListener = document.addEventListener(
          'mouseup',
          this.endDrag
        )
        break
      case Brush.current:
        this.element['type'] = 'BRUSH'
        this.offset.x -= this.state.start
        this.considerDrag = true
        this.mouseUpListener = document.addEventListener(
          'mouseup',
          this.endDrag
        )
        break
      default:
        this.considerDrag = false
    }

    this.element['ref'] = e.target
    this.setState(({ start, end }) => ({
      width: end - start
    }))
  }

  drag = e => {
    if (this.considerDrag) {
      const position = getMousePosition(e)
      let positionWithOffset = position.x - this.offset.x

      if (this.element['type'] === 'BRUSH') {
        if (positionWithOffset <= this.ContainerStart) {
          positionWithOffset = this.ContainerStart + 1
        }
        if (positionWithOffset + this.state.width >= this.ContainerEnd) {
          positionWithOffset = this.ContainerEnd - this.state.width - 1
        }

        this.setState(
          ({ width }) => ({
            start: positionWithOffset,
            end: positionWithOffset + width
          }),
          () => {
            this.props.onChange({
              min: Math.floor((this.state.start * 100) / this.fullWidth),
              max: Math.ceil((this.state.end * 100) / this.fullWidth)
            })
          }
        )
      } else if (this.element['type'] === 'BRUSHSTART') {
        if (positionWithOffset <= this.ContainerStart) {
          positionWithOffset = this.ContainerStart + 1
        }

        if (positionWithOffset >= this.state.end) {
          positionWithOffset = this.state.end - 1
        }

        this.setState(
          ({ end }) => ({
            start: positionWithOffset,
            width: end - positionWithOffset
          }),
          () => {
            this.props.onChange({
              min: Math.floor((this.state.start * 100) / this.fullWidth)
            })
          }
        )
      } else {
        if (positionWithOffset >= this.ContainerEnd) {
          positionWithOffset = this.ContainerEnd - 1
        }

        if (positionWithOffset <= this.state.start) {
          positionWithOffset = this.state.start + 1
        }

        this.setState(
          ({ start }) => ({
            end: positionWithOffset,
            width: positionWithOffset - start
          }),
          () => {
            this.props.onChange({
              max: Math.ceil((this.state.end * 100) / this.fullWidth)
            })
          }
        )
      }
    }
  }

  endDrag = e => {
    this.considerDrag = false
    document.removeEventListener('mouseup', this.mouseUpListener)
  }

  componentDidMount() {
    this.ContainerStart = 0
    this.ContainerEnd = parseInt(SVGContainer.current.offsetWidth, 10)

    this.fullWidth = this.ContainerEnd - this.ContainerStart

    this.setState(
      {
        start: this.ContainerStart,
        end: this.ContainerEnd,
        width: this.fullWidth
      },
      () => {
        this.props.onChange({
          min: Math.floor((this.ContainerStart * 100) / this.fullWidth),
          max: Math.ceil((this.ContainerEnd * 100) / this.fullWidth)
        })

        SVG.current.addEventListener('mousedown', this.startDrag)
        SVG.current.addEventListener('mousemove', this.drag)
      }
    )
  }

  render() {
    const { start, end, width } = this.state

    return (
      <div ref={SVGContainer}>
        <svg
          width="100%"
          height="40"
          xmlns="http://www.w3.org/2000/svg"
          ref={SVG}
        >
          <rect
            ref={BrushContainer}
            x="0"
            y="0"
            width="100%"
            height="100%"
            strokeWidth="1"
            stroke="black"
            fill="#fcfcfc"
          />
          <rect
            ref={Brush}
            x={start}
            y="0"
            width={width}
            height="100%"
            fill="#00aaff"
            style={{ cursor: 'pointer' }}
          />
          <line
            ref={BrushStart}
            x1={start}
            x2={start}
            y1="0"
            y2="100%"
            stroke="red"
            strokeWidth="5"
            style={{ cursor: 'ew-resize' }}
          />
          <line
            ref={BrushEnd}
            x1={end}
            x2={end}
            y1="0"
            y2="100%"
            stroke="red"
            strokeWidth="5"
            style={{ cursor: 'ew-resize' }}
          />
        </svg>
      </div>
    )
  }
}

export default CustomSvgBrush
