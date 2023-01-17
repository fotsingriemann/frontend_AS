/**
 * @module Charts/ScatterPlot
 * @summary This module exports the ScatterPlot component
 */

import React, { Component } from 'react'
import ScatterChart from 'recharts/es6/chart/ScatterChart'
import Scatter from 'recharts/es6/cartesian/Scatter'
import XAxis from 'recharts/es6/cartesian/XAxis'
import YAxis from 'recharts/es6/cartesian/YAxis'
import CartesianGrid from 'recharts/es6/cartesian/CartesianGrid'
import Tooltip from 'recharts/es6/component/Tooltip'
import Legend from 'recharts/es6/component/Legend'
import ResponsiveContainer from 'recharts/es6/component/ResponsiveContainer'
import PropTypes from 'prop-types'

/**
 * ScatterPlot is implemented using [react-vis](https://uber.github.io/react-vis/).
 * Used for displaying data in the form of Scatter Plot.
 * @summary ScatterPlot is used for plotiing data in a scatterform
 */
class ScatterPlot extends Component {
  /**
   * @summary Segregate data and get ideal range data
   */
  idealData = () => {
    const idealValues = []
    this.props.data.forEach(value => {
      if (value.y > 75 && value.y < 90) {
        idealValues.push({ x: value.x, y: value.y })
      }
    })
    return idealValues
  }

  /**
   * @summary Segregate data and get non-ideal range data
   */
  nonIdealData = () => {
    const nonIdealValues = []
    this.props.data.forEach(value => {
      if (value.y < 75 || value.y > 90) {
        nonIdealValues.push({ x: value.x, y: value.y })
      }
    })
    return nonIdealValues
  }

  render() {
    const {
      xLabel,
      yLabel,
      xUnit,
      yUnit,
      data,
      scatterSplit,
      color1,
      color2
    } = this.props

    return (
      <ResponsiveContainer width="100%" height="100%" minHeight={350}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={'x'}
            type="number"
            name={xLabel}
            unit={xUnit}
            label={{
              value: xLabel,
              position: 'insideBottomRight',
              offset: -10
            }}
          />
          <YAxis
            dataKey={'y'}
            type="number"
            name={yLabel}
            unit={yUnit}
            label={{
              value: yLabel,
              angle: -90,
              position: 'insideLeft',
              offset: -10
            }}
          />
          {scatterSplit && (
            <Scatter name="Ideal" data={this.idealData()} fill={color1} />
          )}
          {scatterSplit && (
            <Scatter
              name="Non-Ideal"
              data={this.nonIdealData()}
              fill={color2}
            />
          )}
          ) : ({!scatterSplit && <Scatter data={data} fill={color1} />}
          {scatterSplit && <Legend />}
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        </ScatterChart>
      </ResponsiveContainer>
    )
  }
}

ScatterPlot.propTypes = {
  data: PropTypes.array.isRequired,
  xLabel: PropTypes.string.isRequired,
  yLabel: PropTypes.string.isRequired,
  color1: PropTypes.string,
  color2: PropTypes.string
}

ScatterPlot.defaultProps = {
  color1: '#82ca9d',
  color2: '#8884d8'
}

export default ScatterPlot
