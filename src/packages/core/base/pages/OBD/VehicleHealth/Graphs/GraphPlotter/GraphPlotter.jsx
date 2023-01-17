import React from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import { Grid } from '@material-ui/core'
import SpeedvRpm from './Graphs/SpeedvRpm'
import ImapvRpm from './Graphs/ImapvRpm'
import EngineLoadvTemp from './Graphs/EngineLoadvTemp'
import MafvTime from './Graphs/MafvTime'
// import SocvDistance from './Graphs/SocvDistance'
// import SocvSpeed from './Graphs/SocvSpeed'
import ElectricGraph from './Graphs/ElectricGraph'
import TempPressureGraph from './Graphs/TempPressureGraph'

const GraphPlotter = function({ data, pidList }) {
  return (
    <Grid container spacing={3}>
      {['vehiclespeed', 'rpm'].every(val => pidList.includes(val)) && (
        <SpeedvRpm data={data} />
      )}
      {['maf'].every(val => pidList.includes(val)) && <MafvTime data={data} />}
      {['coolant', 'engineload'].every(val => pidList.includes(val)) && (
        <EngineLoadvTemp data={data} />
      )}
      {['imap', 'rpm'].every(val => pidList.includes(val)) && (
        <ImapvRpm data={data} />
      )}
      {/* {['obddistance', 'state_of_charge'].every(val =>
        pidList.includes(val)
      ) && <SocvDistance data={data} />}
      {['state_of_charge', 'vehiclespeed'].every(val =>
        pidList.includes(val)
      ) && <SocvSpeed data={data} />} */}
      {['state_of_charge', 'vehiclespeed', 'obddistance'].some(val =>
        pidList.includes(val)
      ) && <ElectricGraph data={data} pidList={pidList} />}
      {['tire_temperature', 'tire_pressure'].some(val =>
        pidList.includes(val)
      ) && <TempPressureGraph data={data} pidList={pidList} />}
    </Grid>
  )
}

function getQueryForGraphData(pids) {
  return gql`
    query($uniqueId: String!, $from: String!, $to: String!) {
      OBDData: getObdDataPoints(uniqueId: $uniqueId, from: $from, to: $to) {
        ts
        ${pids.join('\n')}
      }
    }
  `
}

const GET_SUPPORTED_PIDS = gql`
  query($uniqueId: String!) {
    pids: getSupportedPids(uniqueId: $uniqueId) {
      name
    }
  }
`

export default ({ vehicle, from, to }) => (
  <Query query={GET_SUPPORTED_PIDS} variables={{ uniqueId: vehicle.uniqueId }}>
    {({ loading, error, data }) => {
      if (loading) {
        return <div>Loading Graphs</div>
      }

      if (error) {
        return <div>Error loading graphs</div>
      }

      const pidList = data.pids.map(pid => pid.name)
      const query = getQueryForGraphData(data.pids.map(pid => pid.name))

      return (
        <Query
          query={query}
          variables={{
            uniqueId: vehicle.uniqueId,
            from,
            to
          }}
        >
          {({ loading, error, data }) => {
            if (loading) {
              return <div>Loading Graphs</div>
            }

            if (error) {
              return <div>Error loading graphs</div>
            }

            return <GraphPlotter data={data.OBDData} pidList={pidList} />
          }}
        </Query>
      )
    }}
  </Query>
)
