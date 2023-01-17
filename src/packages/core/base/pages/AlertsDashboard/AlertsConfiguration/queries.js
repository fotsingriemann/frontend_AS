import gql from 'graphql-tag'

export const GET_ALERTS_LIST = gql`
  query($loginId: Int!) {
    alerts: getAllAssignedAlertsToClient(clientLoginId: $loginId) {
      alert {
        name: alertName
        type: alertType
        description: alertDescription
        valueType
        hasValue: valueStatus
      }
      valueOption {
        option
      }
    }
  }
`

const getValueField = (alertType) => {
  switch (alertType) {
    case 'overspeed':
      return 'value: osLimit'
    case 'ExtBatLow':
      return 'value: voltage'
    case 'geofence':
      return 'value: areaIdList'
    case 'routefence':
      return 'value: routeIdList'
    case 'halt':
      return 'value: haltTime'
    case 'idle':
      return 'value: idleTime'
    default:
      return ''
  }
}

export const GET_ALERT_CONFIGURATIONS = (alertType) => gql`
  query($loginId: Int!, $alertType: String!, $enabled: Boolean!) {
    devices: getAllDeviceConfigurationByAlertType(
      clientLoginId: $loginId
      alertType: $alertType
      getEnabled: $enabled
    ) {
      email
      phone: sms
      vehicle {
        vehicleNumber
        uniqueDeviceId
      }
      isAlertEnabled: isAlertEnable
      ${getValueField(alertType)}
      ${
        alertType === 'halt' || alertType === 'idle'
          ? `
        fromTime
        toTime
      `
          : ''
      }
      ${
        alertType === 'scheduleMaintenance'
          ? `
      runningHrs
      noOfDays
      recurring
      `
          : ''
      }
      ${
        alertType === 'conditionalMaintenance'
          ? `
          parametersData{
            pid
            parameter
            minValue
            maxValue
            isEnable
          }
      `
          : ''
      }
    }
  }
`

export const UPDATE_ALERT_CONFIGURATIONS = gql`
  mutation(
    $alertConfigs: [AlertConfigInput!]
    $alertType: String!
    $loginId: Int!
  ) {
    setMultiDeviceAlertConfigs(
      alertConfigs: $alertConfigs
      clientLoginId: $loginId
      alertType: $alertType
    )
  }
`

export const GET_ALL_PARAMETERS = gql`
  query($clientLoginId: Int!) {
    getClientPids(clientLoginId: $clientLoginId) {
      pid
      parameter
    }
  }
`
export const alertConfigs = {
  parametersData: [
    {
      pId: 1,
      parameter: 'Engine_oil',
      minValue: null,
      maxValue: null,
      isEnable: false,
    },
    {
      pId: 2,
      parameter: 'Falana',
      minValue: null,
      maxValue: null,
      isEnable: false,
    },
    {
      pId: 3,
      parameter: 'Demaka',
      minValue: null,
      maxValue: null,
      isEnable: false,
    },
    {
      pId: 4,
      parameter: 'Break',
      minValue: null,
      maxValue: null,
      isEnable: false,
    },
  ],
}
