import React from 'react'

function BrushContainer({ height, width, children }) {
  return (
    <div
      style={{
        height,
        width,
        background: 'rgba(150, 200, 250, 0.5)',
        position: 'relative'
      }}
    >
      {children}
    </div>
  )
}

function Brush({ brushMin, brushMax, min, max }) {
  function computeStyle(min, max) {
    return {
      left: '100px',
      right: '600px'
    }
  }
  return (
    <div
      style={{
        background: 'rgba(200, 200, 200)',
        position: 'absolute',
        height: '100%',
        // left: 0,
        // width: '100px'
        ...computeStyle(brushMin, brushMax)
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          height: '100%',
          width: '3px',
          background: 'black'
        }}
        draggable={true}
        onDragStart={e => console.log(e, 'Drag Start')}
        onDragEnd={e => console.log(e, 'Drag End')}
      />
      <div
        style={{
          position: 'absolute',
          right: 0,
          height: '100%',
          width: '3px',
          background: 'black'
        }}
      />
    </div>
  )
}

function CustomBrush({
  min,
  max,
  brushMin,
  brushMax,
  onBrushMinChange,
  onBrushMaxChange,
  onBrushValChange
}) {
  return (
    <div>
      <BrushContainer height={40} width="100%">
        <Brush />
      </BrushContainer>
    </div>
  )
}

export default CustomBrush
