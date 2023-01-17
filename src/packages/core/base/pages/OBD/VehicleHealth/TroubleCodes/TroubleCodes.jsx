import React, { Component } from 'react'
import gql from 'graphql-tag'
import moment from 'moment'
import { Query } from 'react-apollo'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  withStyles,
  Typography,
  Divider
} from '@material-ui/core'
import getLoginId from '@zeliot/common/utils/getLoginId'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import getUnixString from '@zeliot/common/utils/time/getUnixString'
import TimePeriodSelector from '../Graphs/TimePeriodSelector'
import Badge from '../../common/Badge'

const GET_DTC_ALERTS = gql`
  query($loginId: Int!, $uniqueId: String!, $from: String!, $to: String!) {
    DTCCodes: getDtcCodes(
      clientLoginId: $loginId
      uniqueId: $uniqueId
      from: $from
      to: $to
    ) {
      vehicleNumber
      dtcData {
        ts
        code: dtcCode
        description: dtcDescription
      }
    }
  }
`

// const SEQUENCE = [1, 1, 3, 2, 3, 1, 2, 2, 2, 3, 1, 3, 1, 3, 2, 1, 2, 3]
// const HEALTH = [
//   {
//     color: 'black',
//     background: '#5eff23',
//     text: 'LOW'
//   },
//   {
//     color: 'black',
//     background: '#f9d02a',
//     text: 'MEDIUM'
//   },
//   {
//     color: 'white',
//     background: '#fc2a2a',
//     text: 'HIGH'
//   }
// ]

const OBDParametersStyles = theme => ({
  TableContainer: {
    maxHeight: 400,
    overflow: 'auto'
  },
  StickyHeader: {
    position: 'sticky',
    top: 0,
    backgroundColor: '#fff'
  },
  gutterBottom: {
    marginBottom: theme.spacing(2)
  },
  PaperText: {
    padding: theme.spacing(2)
  }
})

class TroubleCodes extends Component {
  state = {
    from: null,
    to: null,
    option: 'HOUR',
    fromTs: null,
    toTs: null
  }

  handleOptionChange = e => {
    this.setState({ option: e.target.value })
  }

  handleDateTimeChange = dateType => dateTime =>
    this.setState({
      [dateType]: dateTime
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
    const { option, fromTs, toTs, from, to } = this.state
    const { vehicle, classes } = this.props

    return (
      <React.Fragment>
        <Typography variant="h6">Trouble Codes</Typography>
        <Divider className={classes.gutterBottom} />
        <TimePeriodSelector
          option={option}
          from={from}
          to={to}
          onOptionChange={this.handleOptionChange}
          onDateTimeChange={this.handleDateTimeChange}
          onSubmit={this.handleSubmit}
        />

        {fromTs && toTs && (
          <Query
            query={GET_DTC_ALERTS}
            variables={{
              uniqueId: vehicle.uniqueId,
              loginId: getLoginId(),
              from: fromTs,
              to: toTs
            }}
          >
            {({ loading, error, data }) => {
              if (loading) {
                return (
                  <Paper className={classes.PaperText}>
                    <Typography align="center" variant="subtitle2">
                      Loading
                    </Typography>
                  </Paper>
                )
              }

              if (error) {
                return (
                  <Paper className={classes.PaperText}>
                    <Typography align="center" variant="subtitle2">
                      Error
                    </Typography>
                  </Paper>
                )
              }

              if (data.DTCCodes && data.DTCCodes.length === 0) {
                return (
                  <Paper className={classes.PaperText}>
                    <Typography align="center" variant="subtitle2">
                      No Trouble Codes
                    </Typography>
                  </Paper>
                )
              }

              let items = []
              data.DTCCodes.forEach(item => {
                item.dtcData.forEach(itemData => {
                  items.push({
                    vehicleNumber: item.vehicleNumber,
                    ...itemData
                  })
                })
              })

              return (
                <Paper className={classes.TableContainer}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell className={classes.StickyHeader}>
                          Vehicle Number
                        </TableCell>
                        <TableCell className={classes.StickyHeader}>
                          Time
                        </TableCell>
                        <TableCell className={classes.StickyHeader}>
                          Code
                        </TableCell>
                        <TableCell className={classes.StickyHeader}>
                          Description
                        </TableCell>
                        <TableCell className={classes.StickyHeader}>
                          Priority
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map(row => (
                        <TableRow key={row.vehicleNumber}>
                          <TableCell>{row.vehicleNumber}</TableCell>
                          <TableCell>
                            {getFormattedTime(row.ts, 'llll')}
                          </TableCell>
                          <TableCell>{row.code}</TableCell>
                          <TableCell>{row.description}</TableCell>
                          <TableCell>
                            <Badge
                              // color={
                              //   HEALTH[
                              //     SEQUENCE[
                              //       row.code[row.code.length - 1] %
                              //         SEQUENCE.length
                              //     ] - 1
                              //   ]['color']
                              // }
                              // background={
                              //   HEALTH[
                              //     SEQUENCE[
                              //       row.code[row.code.length - 1] %
                              //         SEQUENCE.length
                              //     ] - 1
                              //   ]['background']
                              // }
                              color="white"
                              background="red"
                            >
                              {/* {
                                HEALTH[
                                  SEQUENCE[
                                    row.code[row.code.length - 1] %
                                      SEQUENCE.length
                                  ] - 1
                                ]['text']
                              } */}
                              HIGH
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              )
            }}
          </Query>
        )}
      </React.Fragment>
    )
  }
}

export default withStyles(OBDParametersStyles)(TroubleCodes)
