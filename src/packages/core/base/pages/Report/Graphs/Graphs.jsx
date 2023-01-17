import React, { Component } from 'react'
import moment from 'moment'
import { Typography, Divider, withStyles } from '@material-ui/core'
import getUnixString from '@zeliot/common/utils/time/getUnixString'
import TimePeriodSelector from './TimePeriodSelector'
import GraphPlotter from './GraphPlotter'
import Button from '@material-ui/core/Button'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

const styles = (theme) => ({
  gutterBottom: {
    marginBottom: theme.spacing(2),
  },
})

class Graphs extends Component {
  state = {
    from: null,
    to: null,
    option: 'HOUR',
    fromTs: null,
    toTs: null,
  }

  componentDidMount() {
    this.handleSubmit()
  }

  handleOptionChange = (e) => {
    this.setState({ option: e.target.value })
  }

  handleDateTimeChange = (dateType) => (dateTime) =>
    this.setState({
      [dateType]: dateTime,
    })

  handleSubmit = () => {
    let fromTs
    let toTs = moment.now()
    switch (this.state.option) {
      case 'HOUR': {
        fromTs = moment().subtract(1, 'hour')
        break
      }

      case 'DAY': {
        fromTs = moment().subtract(1, 'day')
        break
      }

      case 'WEEK': {
        fromTs = moment().subtract(1, 'week')
        break
      }

      case 'MONTH': {
        fromTs = moment().subtract(1, 'month')
        break
      }

      default:
        fromTs = this.state.from
        toTs = this.state.to
    }

    fromTs = fromTs ? getUnixString(fromTs) : null
    toTs = toTs ? getUnixString(toTs) : null

    this.setState({ fromTs, toTs })
  }

  render() {
    const { option, from, to, fromTs, toTs } = this.state
    const { classes, vehicle, data } = this.props

    return (
      <React.Fragment>
        {/* <Typography variant="h6">Graphs</Typography> */}
        <Divider className={classes.gutterBottom} />
        {/* <TimePeriodSelector
          option={option}
          from={from}
          to={to}
          onOptionChange={this.handleOptionChange}
          onDateTimeChange={this.handleDateTimeChange}
          onSubmit={this.handleSubmit}
        /> */}
        {/* <Button variant="contained" color="primary" onClick={this.handleSubmit}>
          Generate Graph
        </Button>{' '} */}
        {/* {data.forEach(element => {
          console.log(element[1])
        })} */}
        {fromTs && toTs && (
          <GraphPlotter vehicle={vehicle} from={fromTs} to={toTs} data={data} />
        )}
      </React.Fragment>
    )
  }
}

export default withStyles(styles)(Graphs)
