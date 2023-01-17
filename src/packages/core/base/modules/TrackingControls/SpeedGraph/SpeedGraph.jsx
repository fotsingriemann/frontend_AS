import React, { Component } from 'react'
import moment from 'moment'
import Area from 'recharts/es6/cartesian/Area'
import XAxis from 'recharts/es6/cartesian/XAxis'
import YAxis from 'recharts/es6/cartesian/YAxis'
import CartesianGrid from 'recharts/es6/cartesian/CartesianGrid'
import ResponsiveContainer from 'recharts/es6/component/ResponsiveContainer'
import { THEME_MAIN_COLORS as COLOR_RANGE } from '@zeliot/common/constants/styles'
import Tooltip from 'recharts/es6/component/Tooltip'
import ComposedChart from 'recharts/es6/chart/ComposedChart'
import { withStyles } from '@material-ui/core'

const styles = theme => ({
  trackingStatsCard: {
    paddingTop: 16,
    textAlign: 'left'
  }
})

class SpeedGraph extends Component {
  state = {
    stats: null,
    speedVtime: [],
    loading: false,
    isLive: false,
    animationDuration: 1500,
    liveAnimation: false
  }

  componentDidMount = () => {
    this.setState({ stats: this.props.stats })
    this.setState({ animationDuration: this.props.replayDuration })
    if (this.props.stats) {
      this.getSpeedVsTime()
    }
  }

  componentDidUpdate = prevProps => {
    if (prevProps.graphIndex !== this.props.graphIndex) {
      // new speed data received
      this.setState(({ speedVtime: cdata }) => {
        cdata[this.props.graphIndex].liveSpeed = this.props.liveSpeed
        return { speedVtime: cdata, liveAnimation: true }
      })
    }
  }

  getSpeedVsTime = () => {
    const newData = []
    this.props.stats.forEach(data => {
      if (data.ts !== null && data.speed !== null) {
        newData.push({
          date: moment.unix(data.ts).format('D/M/YYYY, h:mm:ss A'),
          speed: data.speed,
          liveSpeed: 0
        })
      }
    })
    this.setState({
      speedVtime: newData
    })
  }

  render() {
    return (
      <div>
        {this.state.speedVtime.length > 0 && (
          <ResponsiveContainer width="100%" height="100%" minHeight={120}>
            <ComposedChart data={this.state.speedVtime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                name="Time"
                hide={true}
                label={{
                  value: 'Time',
                  position: 'insideBottom'
                }}
              />
              <YAxis
                dataKey="speed"
                name="Speed"
                type="number"
                label={{
                  value: 'Speed',
                  angle: -90,
                  position: 'insideLeft'
                }}
              />
              <Area
                type="monotone"
                dataKey="speed"
                stroke={COLOR_RANGE.veryLightGray}
                fill={COLOR_RANGE.veryLightGray}
              />
              <Area
                type="monotone"
                dataKey="liveSpeed"
                stroke={COLOR_RANGE.red}
                fill={COLOR_RANGE.red}
                activeDot={{
                  stroke: COLOR_RANGE.mainBlue,
                  strokeWidth: 1,
                  r: 1
                }}
                isAnimationActive={this.state.liveAnimation}
                animationBegin={0}
                animationDuration={this.props.replayDuration}
                animationEasing="ease-in"
              />

              <Tooltip />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    )
  }
}

export default withStyles(styles)(SpeedGraph)
