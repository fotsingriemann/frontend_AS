/**
 * @module Charts/LineChart
 * @summary This module exports the LineChart component
 */

import React from 'react'
import PropTypes from 'prop-types'
import 'react-vis/dist/style.css'
import XYPlot from 'react-vis/es/plot/xy-plot'
import XAxis from 'react-vis/es/plot/axis/x-axis'
import YAxis from 'react-vis/es/plot/axis/y-axis'
import LineSeries from 'react-vis/es/plot/series/line-series'
import Hint from 'react-vis/es/plot/hint'
import { withTheme } from '@material-ui/core'

function LineChart(props) {
  const [hoveredValue, setHoveredValue] = React.useState(null)

  function getChartData() {
    return props.data.map(item => ({
      x: item.x,
      y: item.y
    }))
  }

  const { hint, axes, width, height, margin, theme } = props

  const axisColors =
    theme.mode === 'light' ? { color: '#000' } : { color: '#fff' }

  return (
    <XYPlot
      width={width}
      height={height}
      margin={margin}
      onMouseLeave={e => setHoveredValue(false)}
    >
      <XAxis
        title={axes.xAxis.title}
        position="middle"
        tickFormat={axes.xAxis.tickFormat}
        style={{
          line: { stroke: axisColors.color, strokeWidth: '2px' },
          ticks: { stroke: axisColors.color },
          text: { stroke: 'none', fill: axisColors.color },
          title: { stroke: 'none', fill: axisColors.color }
        }}
      />

      <YAxis
        title={axes.yAxis.title}
        position="middle"
        tickFormat={axes.yAxis.tickFormat}
        style={{
          line: { stroke: axisColors.color, strokeWidth: '2px' },
          ticks: { stroke: axisColors.color },
          text: { stroke: 'none', fill: axisColors.color },
          title: { stroke: 'none', fill: axisColors.color }
        }}
      />

      <LineSeries
        data={getChartData()}
        onNearestXY={value => setHoveredValue(value)}
      />

      {hoveredValue && (
        <Hint value={hoveredValue}>
          <div style={{ background: 'rgb(201, 242, 242)', color: 'black' }}>
            <p>
              {hint.formatter
                ? hint.formatter(hoveredValue.x, hoveredValue.y)
                : hoveredValue.y}
            </p>
          </div>
        </Hint>
      )}
    </XYPlot>
  )
}

LineChart.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  margin: PropTypes.shape({
    left: PropTypes.number,
    right: PropTypes.number,
    top: PropTypes.number,
    bottom: PropTypes.number
  }),

  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired
    })
  ).isRequired,

  axes: PropTypes.shape({
    xAxis: PropTypes.shape({
      title: PropTypes.string,
      tickFormat: PropTypes.func
    }),

    yAxis: PropTypes.shape({
      title: PropTypes.string,
      tickFormat: PropTypes.func
    })
  }),

  hint: PropTypes.shape({
    formatter: PropTypes.func
  })
}

LineChart.defaultProps = {
  width: 450,
  height: 300,
  margin: {
    left: 40,
    right: 10,
    top: 10,
    bottom: 40
  },
  axes: {
    xAxis: {
      title: '',
      tickFormat: null
    },

    yAxis: {
      title: '',
      tickFormat: null
    }
  },
  hint: {
    formatter: null
  }
}

export default withTheme(LineChart)
