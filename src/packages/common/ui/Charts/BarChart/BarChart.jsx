/**
 * @module Charts/BarChart
 * @summary This module exports the BarChart component
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import XYPlot from 'react-vis/es/plot/xy-plot'
import XAxis from 'react-vis/es/plot/axis/x-axis'
import YAxis from 'react-vis/es/plot/axis/y-axis'
import HorizontalGridLines from 'react-vis/es/plot/horizontal-grid-lines'
import VerticalGridLines from 'react-vis/es/plot/vertical-grid-lines'
import VerticalBarSeries from 'react-vis/es/plot/series/vertical-bar-series'
import 'react-vis/dist/style.css'

/**
 * BarChart is a customisable React component for rendering bar charts with different data.
 * It is implemented using [react-vis](https://uber.github.io/react-vis/)
 * @summary BarChart component implementation
 */
class BarChart extends Component {

  /**
   * @summary Returns the array of data prop in x-y format
   */
  _mapData() {
    return this.props.data.map(item => ({
      x: item.label,
      y: item.value
    }))
  }

  render() {
    return (
      <XYPlot
        width={this.props.width}
        height={this.props.height}
        margin={this.props.margin}
        xType="ordinal"
      >
        <HorizontalGridLines />
        <VerticalGridLines />
        <XAxis position="start" tickLabelAngle={-45} />
        <YAxis />
        <VerticalBarSeries data={this._mapData()} />
      </XYPlot>
    )
  }
}

BarChart.propTypes = {
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
      value: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired
}

BarChart.defaultProps = {
  width: 450,
  height: 300,
  margin: {
    left: 40,
    right: 10,
    top: 10,
    bottom: 70
  }
}

export default BarChart
