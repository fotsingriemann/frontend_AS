import React from 'react'
import LineChart from 'recharts/es6/chart/LineChart'
import Line from 'recharts/es6/cartesian/Line'
import XAxis from 'recharts/es6/cartesian/XAxis'
import YAxis from 'recharts/es6/cartesian/YAxis'
import ResponsiveContainer from 'recharts/es6/component/ResponsiveContainer'
import CartesianGrid from 'recharts/es6/cartesian/CartesianGrid'
import Tooltip from 'recharts/es6/component/Tooltip'
import Legend from 'recharts/es6/component/Legend'
import Brush from 'recharts/es6/cartesian/Brush'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'

function DualLineChart({
  data,
  y2Label,
  y1Label,
  xLabel,
  y1Unit,
  y2Unit,
  y1Color,
  y2Color,
  y1Key,
  y2Key,
  xKey
}) {
  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <Brush
          data={data}
          dataKey={xKey}
          tickFormatter={unixTime => getFormattedTime(unixTime, 'llll')}
        />
        <XAxis
          dataKey={xKey}
          name={xLabel}
          domain={['dataMin', 'dataMax']}
          label={{
            value: xLabel,
            position: 'bottom'
          }}
          type="number"
          tickFormatter={unixTime => getFormattedTime(unixTime, 'llll')}
        />
        <YAxis
          dataKey={y2Key}
          name={y2Label}
          domain={['dataMin', 'dataMax']}
          label={{
            value: y2Label,
            angle: -90,
            position: 'right'
          }}
          type="number"
          yAxisId="y2"
          orientation="right"
        />
        <YAxis
          dataKey={y1Key}
          name={y1Label}
          domain={['dataMin', 'dataMax']}
          label={{
            value: y1Label,
            angle: -90,
            position: 'left'
          }}
          type="number"
          yAxisId="y1"
        />
        <Tooltip labelFormatter={value => getFormattedTime(value, 'llll')} />
        <Legend verticalAlign="top" height={36} />
        <Line
          yAxisId="y2"
          type="monotone"
          dataKey={y2Key}
          stroke={y2Color}
          strokeWidth={2}
          dot={false}
          unit={y2Unit}
        />
        <Line
          yAxisId="y1"
          type="monotone"
          dataKey={y1Key}
          stroke={y1Color}
          strokeWidth={2}
          dot={false}
          unit={y1Unit}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default DualLineChart
