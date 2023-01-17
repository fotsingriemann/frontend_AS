/**
 * @module Charts/PieChart
 * @summary Exports PieChart component
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import 'react-vis/dist/style.css'
import Hint from 'react-vis/es/plot/hint'
import RadialChart from 'react-vis/es/radial-chart'
import { THEME_MAIN_COLORS as COLOR_RANGE } from '@zeliot/common/constants/styles'
import { RADIAL_CHART_STYLE } from '@zeliot/common/constants/classes'
import { withStyles } from '@material-ui/core'

/**
 * @summary PieChart component used for rendering a PieChart
 */
class PieChart extends Component {
  /**
   * @property {boolean|object} selectedValue The part of the data that is selected used for hinting
   */
  state = {
    selectedValue: false
  }

  /**
   * @summary Appends the `className` property to each data object
   * @returns {object[]} The data for the PieChart
   */
  _mapData() {
    const arcClass = this.props.classes.arc

    return this.props.data.map(item => {
      return { ...item, className: arcClass }
    })
  }

  render() {
    const { classes } = this.props

    return (
      <RadialChart
        animation
        innerRadius={0}
        radius={Math.min(this.props.width / 2 - 4, this.props.height / 2 - 4)}
        colorRange={Object.values(COLOR_RANGE)}
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
              <span>{this.state.selectedValue.value}%</span>
            </div>
          </Hint>
        )}
      </RadialChart>
    )
  }
}

PieChart.propTypes = {
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

PieChart.defaultProps = {
  width: 200,
  height: 200,
  margin: {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10
  }
}

export default withStyles(RADIAL_CHART_STYLE)(PieChart)
