import React from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import {
  TableHead,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  withStyles
} from '@material-ui/core'
import getLoginId from '@zeliot/common/utils/getLoginId'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import Badge from '../../common/Badge'

const GET_TROUBLE_CODES = gql`
  query($loginId: Int!) {
    DTCCodes: getDtcCodes(clientLoginId: $loginId) {
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

function TroubleCodes({ classes }) {
  return (
    <Query
      query={GET_TROUBLE_CODES}
      variables={{
        loginId: getLoginId()
      }}
    >
      {({ loading, error, data }) => {
        if (loading) return <Paper className={classes.TextPaper}>Loading</Paper>

        if (error) return <Paper className={classes.TextPaper}>Error</Paper>

        if (data.DTCCodes && data.DTCCodes.length === 0) {
          return <Paper className={classes.TextPaper}>No Trouble Codes</Paper>
        }

        return (
          <Paper className={classes.TableContainer}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className={classes.StickyHeader}>
                    Vehicle Number
                  </TableCell>
                  <TableCell className={classes.StickyHeader}>Time</TableCell>
                  <TableCell className={classes.StickyHeader}>Code</TableCell>
                  <TableCell className={classes.StickyHeader}>
                    Description
                  </TableCell>
                  <TableCell className={classes.StickyHeader}>
                    Priority
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.DTCCodes.map(row => (
                  <TableRow key={row.vehicleNumber}>
                    <TableCell>{row.vehicleNumber}</TableCell>
                    <TableCell>
                      {getFormattedTime(row.dtcData[0].ts, 'llll')}
                    </TableCell>
                    <TableCell>{row.dtcData[0].code}</TableCell>
                    <TableCell>{row.dtcData[0].description}</TableCell>
                    <TableCell>
                      <Badge
                        color={
                          // HEALTH[
                          //   SEQUENCE[
                          //     parseInt(
                          //       row.dtcData[0].code[
                          //         row.dtcData[0].code.length - 1
                          //       ],
                          //       16
                          //     ) % SEQUENCE.length
                          //   ] - 1
                          // ]['color']
                          'white'
                        }
                        background={
                          // HEALTH[
                          //   SEQUENCE[
                          //     parseInt(
                          //       row.dtcData[0].code[
                          //         row.dtcData[0].code.length - 1
                          //       ],
                          //       16
                          //     ) % SEQUENCE.length
                          //   ] - 1
                          // ]['background']
                          'red'
                        }
                      >
                        HIGH
                        {/* HEALTH[
                            SEQUENCE[
                              parseInt(
                                row.dtcData[0].code[
                                  row.dtcData[0].code.length - 1
                                ],
                                16
                              ) % SEQUENCE.length
                            ] - 1
                          ]['text'] */}
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
  )
}

const styles = theme => ({
  TableContainer: {
    maxHeight: 400,
    overflow: 'auto'
  },
  StickyHeader: {
    position: 'sticky',
    top: 0,
    backgroundColor: '#fff'
  },
  TextPaper: {
    padding: theme.spacing(2),
    textAlign: 'center'
  }
})

export default withStyles(styles)(TroubleCodes)
