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

function CustomTimeTick({ x, y, stroke, payload, isMs }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill="#666"
        style={{ fontSize: 10, textAlign: 'center' }}
      >
        <tspan x="0" dy={16}>
          {getFormattedTime(payload.value, 'D MMM', isMs)},
        </tspan>
        <tspan x="0" dy={16}>
          {getFormattedTime(payload.value, 'hh:mm A', isMs)}
        </tspan>
      </text>
    </g>
  )
}

function FuelLineChart({ isMultiSecond, data, xLabel, yAxes, xKey }) {
   //{console.log("function data is",data)} 
  //  {console.log("function xLabel is",xLabel)} 
  //  {console.log("function yAxes is",yAxes)} 
  //  {console.log("function xKey is",xKey)} 

   
  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
      {/* {console.log(data)} */}
      <LineChart
        data={data}
        margin={{ top: 10, right: 110, bottom: 10, left: 60 }}
      >
        <CartesianGrid strokeDasharray="1 1" />
        <Brush
          data={data}
          dataKey={xKey}
          tickFormatter={unixTime =>
            getFormattedTime(unixTime, 'D MMM, hh:mm:ss', isMultiSecond) 
            
          }
        />
        <XAxis
          dataKey={xKey}
          name={xLabel}
          tickCount={10}
          interval={0}
          domain={['dataMin', 'dataMax']}
          label={{
            value: xLabel,
            position: 'bottom'
          }}
          type="number"
          tick={<CustomTimeTick isMs={isMultiSecond} />}
          height={50}
        />

        {yAxes.map((yAxis, index) => (
          <YAxis
            key={yAxis.key}
            allowDataOverflow={true}
            tickCount={6}
            interval={0}
            dataKey={yAxis.key}
            name={yAxis.label}
            domain={[yAxis.min, yAxis.max]}
            label={{
              value: yAxis.label,
              angle: -90,
              position: index % 2 === 0 ? 'left' : 'right',
              offset: -15
            }}
            tick={{ fontSize: 10 }}
            type="number"
            yAxisId={`y-${index}`}
            axisLine={false}
            tickLine={false}
            orientation={index % 2 === 0 ? 'left' : 'right'}
          />
        ))}
        {yAxes.map((yAxis, index) => (
          <Line
            key={yAxis.key}
            yAxisId={`y-${index}`}
            type="monotone"
            dataKey={yAxis.key}
            name={yAxis.label}
            stroke={yAxis.color}
            strokeWidth={2}
            dot={false}
            unit={yAxis.unit}
          />
        ))}
        <Tooltip
          labelFormatter={value =>
            getFormattedTime(value, 'Do MMM YYYY hh:mm:ss', isMultiSecond)
          }
        />
        <Legend verticalAlign="top" height={36} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default FuelLineChart
