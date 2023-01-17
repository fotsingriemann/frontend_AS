/**
 * @module Charts/DoughnutChart
 * @summary This module exports the DoughnutChart component
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Hint from 'react-vis/es/plot/hint'
import RadialChart from 'react-vis/es/radial-chart'
import 'react-vis/dist/style.css'
import { CHART_COLORS_ARRAY as COLOR_RANGE_ARRAY } from '@zeliot/common/constants/styles'
import { RADIAL_CHART_STYLE } from '@zeliot/common/constants/classes'
import { withStyles } from '@material-ui/core'

/**
 * DoughnutChart is implemented using [react-vis](https://uber.github.io/react-vis/).
 * Used for displaying data in the form of Doughnut chart
 * @summary DoughnutChart component is an alternate for PieChart
 */
class DoughnutChart extends Component {
  /**
   * @property {boolean|object} selectedValue The hovered section of Doughnut Chart
   * @summary The component state
   */
  state = {
    selectedValue: false
  }

  /**
   * @summary The radius of the Doughnut Chart
   */
  _radius = Math.min(this.props.width / 2 - 4, this.props.height / 2 - 4)

  /**
   * @summary The inner radius of the Doughnut Chart
   */
  _innerRadius = Math.round(this._radius * (1 - this.props.doughnutWidthRatio))

  /**
   * @summary Appends the `className` property to each data object
   * @returns {object[]} The data for the Doughnut Chart
   */
  _mapData() {
    const arcClass = this.props.classes.arc
    return this.props.data.map(item => {
      return { ...item, className: arcClass }
    })
  }

  /**
   * @summary Renders the Doughnut Chart component
   */
  render() {
    const { classes, unit } = this.props

    return (
      <RadialChart
        animation
        innerRadius={this._innerRadius}
        radius={this._radius}
        colorRange={COLOR_RANGE_ARRAY}
        getAngle={d => d.value}
        data={this._mapData()}
        onValueMouseOver={v => this.setState({ selectedValue: v })}
        onSeriesMouseOut={v => this.setState({ selectedValue: false })}
        width={this.props.width}
        height={this.props.height}
      >
        {this.state.selectedValue && (
          <Hint value={this.state.selectedValue}>
            <div className={classes['chart-hint']}>
              <span>{this.state.selectedValue.label}: </span>
              <span>{this.state.selectedValue.value}</span>
              <span>{unit}</span>
            </div>
          </Hint>
        )}
      </RadialChart>
    )
  }
}

DoughnutChart.propTypes = {
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
  ).isRequired,
  doughnutWidthPRatio: PropTypes.number,
  unit: PropTypes.string
}

DoughnutChart.defaultProps = {
  width: 200,
  height: 200,
  doughnutWidthRatio: 0.4,
  unit: ''
}

export default withStyles(RADIAL_CHART_STYLE)(DoughnutChart)
