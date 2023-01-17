/**
 * @module ImmobilizeModule/CommandStatus
 * @summary CommandStatus module shows status of recent commands
 */

import React from 'react'
import moment from 'moment'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import { Grid, Typography, Divider, Button } from '@material-ui/core'
import ActivityTable from './ActivityTable'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
import { getItem } from 'storage'

const COMMAND_HISTORY = gql`
  query($uniqueIds: [String!]!, $from: Int!, $to: Int!) {
    getCommandStatus(uniqueIds: $uniqueIds, from_ts: $from, to_ts: $to) {
      status
      command_display
      id
      modified_ts
      response
      uniqueid
      username
    }
  }
`

/**
 * @param {object} props React component props
 * @summary CommandStatus component shows recent commands' status
 */
function CommandStatus(props) {
  /**
   * @param {object[]} commandHistory The array of command status objects
   * @summary Filters list of command statuses, with immobilization related commands
   */
  const filterCommandHistory = (commandHistory) => {
    const filter = [
      'CHECK_SPEED_IMMOBILIZE',
      'CHECK_SPEED_MOBILIZE',
      'MOBILIZE',
      'IMMOBILIZE',
    ]
    const filteredData = commandHistory.filter((row) =>
      filter.includes(row.command_display)
    )
    // console.log(
    //   ' languageJson[selectedLanguage].mobilizePage',
    //   languageJson[selectedLanguage].mobilizePage
    // )
    /* eslint-disable indent */
    return props.vehicles.length
      ? filteredData.map((row) => ({
          ...row,
          vehicleNumber: props.vehicles.find(
            (vehicle) => vehicle.uniqueId === row.uniqueid
          ).vehicleNumber,
        }))
      : []
    /* eslint-enable indent */
  }

  const { currentTime, uniqueIds, selectedLanguage, languageJson } = props

  return (
    <Grid item xs={12}>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="textSecondary">
            {
              languageJson[selectedLanguage].mobilizePage.commandHistory
                .commandHistoryTitle
            }
          </Typography>
          <Divider />
        </Grid>

        <Grid item xs={12}>
          <Query
            query={COMMAND_HISTORY}
            variables={{
              uniqueIds: uniqueIds,
              from: moment.unix(currentTime).subtract(1, 'week').unix(),
              to: currentTime,
            }}
          >
            {({ loading, error, data, refetch }) => {
              if (loading) {
                return (
                  <Grid container justify="center">
                    <Grid item>Loading...</Grid>
                  </Grid>
                )
              }
              if (error) {
                return (
                  <Grid
                    container
                    spacing={2}
                    justify="center"
                    style={{ padding: 20 }}
                  >
                    <Grid item xs={12}>
                      <Grid container justify="center">
                        <Grid item>
                          <Typography>
                            Could not fetch command history
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container justify="center">
                        <Grid item>
                          <ColorButton
                            onClick={() => refetch()}
                            variant="contained"
                          >
                            Retry
                          </ColorButton>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                )
              }

              const rows = filterCommandHistory(data.getCommandStatus)
              return (
                <ActivityTable
                  rows={rows}
                  columns={
                    languageJson[selectedLanguage].mobilizePage.commandHistory
                      .commandHistoryTableColumn
                  }
                />
              )
            }}
          </Query>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default CommandStatus
