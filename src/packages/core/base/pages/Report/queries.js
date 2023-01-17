import gql from 'graphql-tag'

export const GET_DEFAULT_REPORTS = gql`
  query {
    defaultReports: getAllDefaultReportBuilder {
      category
      reportName
      reportType
      fields {
        fieldId
        fieldName
      }
    }
  }
`

export const GET_CUSTOM_REPORTS = gql`
  query($loginId: Int!) {
    customReports: getAllReportBuilder(clientLoginId: $loginId) {
      category
      reportName
      reportType
      fields {
        fieldId
        fieldName
      }
    }
  }
`
