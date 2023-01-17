/**
 * @module Charts/LineSeriesChart
 * @summary This module exports the LineSeriesChart component
 */

import React from 'react'
import LineChart from 'recharts/es6/chart/LineChart'
import Line from 'recharts/es6/cartesian/Line'
import XAxis from 'recharts/es6/cartesian/XAxis'
import YAxis from 'recharts/es6/cartesian/YAxis'
import ResponsiveContainer from 'recharts/es6/component/ResponsiveContainer'
import CartesianGrid from 'recharts/es6/cartesian/CartesianGrid'
import Tooltip from 'recharts/es6/component/Tooltip'

/**
 * LineSeriesChart is used to show multiple line series data in a chart
 * @param {object} props The props passed to this component
 * @summary
 */
function LineSeriesChart(props) {
  const { xLabel, yLabel, data } = props

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="x"
          name={xLabel}
          label={{
            value: xLabel,
            position: 'insideBottomRight',
            offset: -10
          }}
        />
        <YAxis
          dataKey="y"
          name={yLabel}
          type="number"
          label={{
            value: yLabel,
            angle: -90,
            position: 'insideLeft'
          }}
        />
        <Tooltip />
        <Line type="monotone" dataKey="y" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default LineSeriesChart
