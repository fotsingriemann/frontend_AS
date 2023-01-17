import React from 'react'
import gql from 'graphql-tag'
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
  Divider,
} from '@material-ui/core'

const GET_SUPPORTED_PIDS = gql`
  query($uniqueId: String!) {
    pids: getSupportedPids(uniqueId: $uniqueId) {
      name
      pid
      description
      formula
    }
  }
`

const OBDParametersStyles = (theme) => ({
  TableContainer: {
    maxHeight: 400,
    overflow: 'auto',
  },
  StickyHeader: {
    position: 'sticky',
    top: 0,
    backgroundColor: '#fff',
  },
  gutterBottom: {
    marginBottom: theme.spacing(2),
  },
  PaperText: {
    padding: theme.spacing(2),
  },
})

const OBDParameters = withStyles(OBDParametersStyles)(function ({
  vehicle,
  classes,
}) {
  return (
    <React.Fragment>
      <Typography variant="h6">
        OBD Parameters for {vehicle.vehicleNumber}
      </Typography>
      <Divider className={classes.gutterBottom} />
      <Query
        query={GET_SUPPORTED_PIDS}
        variables={{ uniqueId: vehicle.uniqueId }}
      >
        {({ loading, error, data }) => {
          if (loading) {
            return (
              <Paper className={classes.PaperText}>
                <Typography align="center" variant="subtitle2">
                  Loading ...
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

          if (data.pids && data.pids.length === 0) {
            return (
              <Paper className={classes.PaperText}>
                <Typography align="center" variant="subtitle2">
                  No OBD Parameters found
                </Typography>
              </Paper>
            )
          }

          return (
            <Paper className={classes.TableContainer}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.StickyHeader}>Name</TableCell>
                    <TableCell className={classes.StickyHeader}>PID</TableCell>
                    <TableCell className={classes.StickyHeader}>
                      Description
                    </TableCell>
                    <TableCell className={classes.StickyHeader}>
                      Formula
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.pids.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.pid.join(', ')}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>{row.formula.join(', ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )
        }}
      </Query>
    </React.Fragment>
  )
})

export default OBDParameters
