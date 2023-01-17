/**
 * @module Report
 * @summary This module renders the Report page
 */

import React, { Component } from 'react'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import { Switch, Redirect } from 'react-router'
import { Grid, Typography, withStyles } from '@material-ui/core'
import { GET_DEFAULT_REPORTS, GET_CUSTOM_REPORTS } from './queries'
import CustomReportsList from './CustomReportsList'
import DefaultReportsList from './DefaultReportsList'
import ReportViewer from './ReportViewer'
import CustomReportDialog from './CustomReportDialog'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import getLoginId from '@zeliot/common/utils/getLoginId'
import { PrivateRoute } from '@zeliot/common/router'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

const GET_REPORT_FIELDS_BY_CATEGORY = gql`
  query($category: Int!) {
    categoryFields: getAvailableReportField(category: $category) {
      fields: availFields
    }
  }
`

const GET_ALL_REPORT_FIELDS = gql`
  {
    fields: getAllReportField {
      fieldId
      fieldName
      fieldType
    }
  }
`

const GET_ALL_ALERT_REPORTS = gql`
  {
    alerts: getAllReportType(status: 1) {
      reportType
      reportTypeId
    }
  }
`

const ADD_CUSTOM_REPORT = gql`
  mutation(
    $loginId: Int!
    $category: Int!
    $reportName: String!
    $fields: String!
    $reportType: String
  ) {
    addReportBuilder(
      clientLoginId: $loginId
      category: $category
      reportName: $reportName
      fields: $fields
      reportType: $reportType
    )
  }
`

const EDIT_CUSTOM_REPORT = gql`
  mutation(
    $loginId: Int!
    $category: Int!
    $reportName: String!
    $oldReportName: String!
    $fields: String!
    $reportType: String
  ) {
    updateReportBuilder(
      clientLoginId: $loginId
      category: $category
      reportName: $reportName
      oldReportName: $oldReportName
      fields: $fields
      reportType: $reportType
      status: 1
    )
  }
`

const DELETE_CUSTOM_REPORT = gql`
  mutation($loginId: Int!, $reportName: String!) {
    deleteReportBuilder(clientLoginId: $loginId, reportName: $reportName)
  }
`

const style = (theme) => ({
  root: {
    padding: theme.spacing(1),
    flexGrow: 1,
  },

  defaultReportsContainer: {
    padding: 0,
    margin: theme.spacing(1),
  },
})

/**
 * @summary Report component renders the report page
 */
class Report extends Component {
  /**
   * @property {object[]} defaultReports The list of default reports
   * @property {string} defaultReportsStatus The status of default reports
   * @property {object[]} customReports The list of custom reports
   * @property {string} customReportsStatus The status of custom reports
   * @property {object?} selectedReport The selected report
   * @property {string} reportDialogMode The mode for the report dialog
   * @property {boolean} isCustomReportDialogOpen Boolean flag to check if custom report dialog is open
   * @property {string} baseReport Base report for editing/creating custom reports
   * @property {string} baseAlert The base alert for editing/creating custom reports
   * @property {object[]} alerts Array of alert objects
   * @property {string[]|string} fields The fields available for a report
   * @property {object[]} allCustomFields The array of all custom fields available
   * @property {object[]} selectedCustomFields The array of custom fields that are selected
   * @property {string} customReportName The name of the custom report
   * @property {string} oldReportName The old name of the report
   */
  state = {
    defaultReports: [],
    defaultReportsStatus: 'EMPTY',
    customReports: [],
    customReportsStatus: 'EMPTY',
    selectedReport: null,
    reportDialogMode: '',
    isCustomReportDialogOpen: false,
    baseReport: 'ALERT_REPORT',
    baseAlert: '',
    alerts: [],
    fields: [],
    allCustomFields: [],
    selectedCustomFields: [],
    customReportName: '',
    oldReportName: '',
  }

  /**
   * @function
   * @summary Handles change in report selection
   */
  handleReportChange = (report) => this.setState({ selectedReport: report })

  /**
   * @function
   * @summary Create a custom report by calling the mutation with report parameters
   */
  createCustomReport = async () => {
    const variables = {
      loginId: getLoginId(),
      category: this.state.baseReport === 'ALERT_REPORT' ? 2 : 3,
      fields: JSON.stringify(this.state.selectedCustomFields),
      reportName: this.state.customReportName,
    }

    if (this.state.baseReport === 'ALERT_REPORT') {
      variables.reportType = JSON.stringify([this.state.baseAlert])
    }

    const response = await this.props.client
      .mutate({
        mutation: ADD_CUSTOM_REPORT,
        variables,
      })
      .catch((error) => {
        this.props.openSnackbar(error.graphQLErrors[0].message, 'error')
      })

    if (response) {
      if (response.data && response.data.addReportBuilder) {
        this.getCustomReports('network-only')
        this.props.openSnackbar(`Added ${this.state.customReportName}`)
        this.handleCustomReportDialogClose()
      } else {
        this.props.openSnackbar(
          `Could not add ${this.state.customReportName}, Try again`
        )
      }
    }
  }

  /**
   * @function
   * @summary Edit custom report by calling the mutation with edited report parameters
   */
  editCustomReport = async () => {
    const variables = {
      loginId: getLoginId(),
      category: this.state.baseReport === 'ALERT_REPORT' ? 2 : 3,
      fields: JSON.stringify(this.state.selectedCustomFields),
      reportName: this.state.customReportName,
      oldReportName: this.state.oldReportName,
    }

    if (this.state.baseReport === 'ALERT_REPORT') {
      variables.reportType = JSON.stringify([this.state.baseAlert])
    }

    const response = await this.props.client
      .mutate({
        mutation: EDIT_CUSTOM_REPORT,
        variables,
      })
      .catch((error) => {
        this.props.openSnackbar(error.graphQLErrors[0].message, 'error')
      })

    if (response) {
      if (response.data && response.data.updateReportBuilder) {
        this.getCustomReports('network-only')
        this.props.openSnackbar(`Updated ${this.state.customReportName}`)
        this.handleCustomReportDialogClose()
      } else {
        this.props.openSnackbar(
          `Could not update ${this.state.customReportName}, Try again`
        )
      }
    }
  }

  /**
   * @function
   * @summary Delete the custom report by report name
   */
  deleteCustomReport = async () => {
    const variables = {
      loginId: getLoginId(),
      reportName: this.state.oldReportName,
    }

    const response = await this.props.client.mutate({
      mutation: DELETE_CUSTOM_REPORT,
      variables,
    })

    if (response.data && response.data.deleteReportBuilder) {
      this.getCustomReports('network-only')
      this.props.openSnackbar(`Deleted ${this.state.customReportName}`)
      this.handleCustomReportDialogClose()
    } else {
      this.props.openSnackbar(
        `Could not delete ${this.state.customReportName}, Try again`
      )
    }
  }

  /**
   * @function
   * @summary Creates/Edits a custom report based on the report dialog mode
   */
  handleCustomReportDialogSubmit = () => {
    if (this.state.reportDialogMode === 'CREATE') {
      this.createCustomReport()
    } else if (this.state.reportDialogMode === 'EDIT') {
      this.editCustomReport()
    }
  }

  /**
   * @function
   * @summary Prefills the data for editing a custom report
   */
  handleCustomReportEdit = (report) => () => {
    this.setState({ oldReportName: report.reportName })

    this.fetchFieldsForReport()

    const selectedReport = {
      baseReport:
        report.category === 2 ? 'ALERT_REPORT' : 'CONSOLIDATED_REPORT',
      selectedCustomFields: report.fields.map(({ fieldId }) => fieldId),
      customReportName: report.reportName,
      baseAlert: report.category === 2 ? JSON.parse(report.reportType)[0] : '',
    }

    this.setState({
      ...selectedReport,
      reportDialogMode: 'EDIT',
      isCustomReportDialogOpen: true,
    })
  }

  /**
   * @callback
   * @summary Generic callback to handle input change
   */
  handleChange = (e) => {
    const eventTargetName = e.target.name
    console.log('target name', eventTargetName, e.target.value)
    this.setState({ [eventTargetName]: e.target.value }, () => {
      if (eventTargetName === 'baseReport') {
        this.fetchFieldsForReport()
        this.setState({ selectedCustomFields: [] })
      }
    })
  }

  /**
   * @callback
   * @summary Closes the custom report dialog
   */
  handleCustomReportDialogClose = () => {
    this.setState({
      isCustomReportDialogOpen: false,
      baseReport: 'ALERT_REPORT',
      selectedCustomFields: [],
      customReportName: '',
      oldReportName: '',
    })
  }

  /**
   * @function
   * @summary Decides to call the create or edit mutation for custom report
   */
  handleCustomReportDialogSubmit = () => {
    if (this.state.reportDialogMode === 'CREATE') {
      this.createCustomReport()
    } else if (this.state.reportDialogMode === 'EDIT') {
      this.editCustomReport()
    }
  }

  /**
   * @function
   * @summary Handles selection of subset of fields for custom report
   */
  handleSelectedCustomFieldsChange = (field) => () => {
    console.log('field', field)
    this.setState(({ selectedCustomFields }) => {
      const newSelectedCustomFields = [...selectedCustomFields]
      const index = selectedCustomFields.indexOf(field)
      if (index > -1) {
        newSelectedCustomFields.splice(index, 1)
      } else {
        newSelectedCustomFields.push(field)
      }
      return { selectedCustomFields: newSelectedCustomFields }
    })
  }

  /**
   * @function
   * @summary Fetches all the available report fields
   */
  getReportFields = async () => {
    const response = await this.props.client.query({
      query: GET_ALL_REPORT_FIELDS,
    })

    if (response.data && response.data.fields) {
      this.setState({ fields: response.data.fields })
    }
  }

  /**
   * @function
   * @summary Fetches all available alert reports
   */
  getAlerts = async () => {
    const response = await this.props.client.query({
      query: GET_ALL_ALERT_REPORTS,
    })

    if (response.data && response.data.alerts) {
      this.setState({ alerts: response.data.alerts })
    }
  }

  /**
   * @function
   * @summary Fetches all fields available for a report category
   */
  fetchFieldsForReport = async () => {
    console.log('call fetch fields', this.state.baseReport)
    const { baseReport } = this.state
    let category
    if (baseReport === 'ALERT_REPORT') {
      category = 2
    } else if (baseReport === 'CONSOLIDATED_REPORT') {
      category = 3
    }

    console.log('cater', category)
    const response = await this.props.client.query({
      query: GET_REPORT_FIELDS_BY_CATEGORY,
      variables: {
        category,
      },
    })

    if (response.data.categoryFields) {
      const availableFields = JSON.parse(response.data.categoryFields.fields)
      console.log('fieds', availableFields)
      this.setState({
        allCustomFields: availableFields,
      })
    }
  }

  /**
   * @function
   * @summary Fetches the list of all default reports
   */
  getDefaultReports = async () => {
    this.setState({ defaultReportsStatus: 'LOADING' })
    const response = await this.props.client.query({
      query: GET_DEFAULT_REPORTS,
    })

    if (response.data && response.data.defaultReports) {
      this.setState({
        defaultReports: response.data.defaultReports,
        defaultReportsStatus: 'LOADED',
      })
    } else {
      this.setState({ defaultReportsStatus: 'ERROR' })
    }
  }

  /**
   * @function
   * @summary Fetches all custom reports of a client
   */
  getCustomReports = async (fetchPolicy = 'cache-first') => {
    this.setState({ customReportsStatus: 'LOADING' })
    const response = await this.props.client.query({
      query: GET_CUSTOM_REPORTS,
      variables: {
        loginId: getLoginId(),
      },
      fetchPolicy,
    })

    if (response.data && response.data.customReports) {
      this.setState({
        customReports: response.data.customReports,
        customReportsStatus: 'LOADED',
      })
    } else {
      this.setState({ customReportsStatus: 'ERROR' })
    }
  }

  /**
   * Fetches all report fields, default reports, custom reports & alerts
   * @function
   * @summary This component lifecyle method is called after the component is mounted
   */
  componentDidMount() {
    this.getReportFields()
    this.getDefaultReports()
    this.getCustomReports()
    this.getAlerts()
  }

  /**
   * @function
   * @summary Function to render list of default & custom reports
   */
  renderReport = () => {
    const { classes, selectedLanguage } = this.props

    return (
      <div className={classes.root}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="h5">
              {languageJson[selectedLanguage].reportsPage.pageTitle}
            </Typography>
          </Grid>

          <Grid
            item
            xs={12}
            container
            spacing={2}
            className={classes.defaultReportsContainer}
          >
            <DefaultReportsList
              headerTitle={
                languageJson[selectedLanguage].reportsPage.defaultReportsTitle
              }
              defaultReports={this.state.defaultReports}
              status={this.state.defaultReportsStatus}
              retry={() => {
                this.getDefaultReports()
              }}
              onReportClick={this.handleReportChange}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomReportsList
              headerTitle={
                languageJson[selectedLanguage].reportsPage.customReportsTitle
              }
              newCustomReportButtonTitle={
                languageJson[selectedLanguage].reportsPage
                  .newCustomReportButtonTitle
              }
              customReports={this.state.customReports}
              status={this.state.customReportsStatus}
              retry={() => {
                this.getCustomReports()
              }}
              onReportClick={this.handleReportChange}
              onAdd={() => {
                this.fetchFieldsForReport()
                this.setState({
                  isCustomReportDialogOpen: true,
                  reportDialogMode: 'CREATE',
                })
              }}
              onEdit={this.handleCustomReportEdit}
              onDelete={(customReport) => {
                this.setState(
                  { oldReportName: customReport.reportName },
                  () => {
                    this.deleteCustomReport()
                  }
                )
              }}
            />
          </Grid>

          <CustomReportDialog
            reportDialogMode={this.state.reportDialogMode}
            isCustomReportDialogOpen={this.state.isCustomReportDialogOpen}
            handleCustomReportDialogClose={this.handleCustomReportDialogClose}
            baseReport={this.state.baseReport}
            handleChange={this.handleChange}
            baseAlert={this.state.baseAlert}
            alerts={this.state.alerts}
            fields={this.state.fields}
            allCustomFields={this.state.allCustomFields}
            selectedCustomFields={this.state.selectedCustomFields}
            handleSelectedCustomFieldsChange={
              this.handleSelectedCustomFieldsChange
            }
            customReportName={this.state.customReportName}
            handleCustomReportDialogSubmit={this.handleCustomReportDialogSubmit}
          />
        </Grid>
      </div>
    )
  }

  render() {
    return (
      <Switch>
        <PrivateRoute exact path="/home/report" render={this.renderReport} />
        {this.state.selectedReport ? (
          <PrivateRoute
            exact
            path="/home/report/viewer"
            render={() => (
              <ReportViewer
                report={this.state.selectedReport}
                fields={this.state.fields}
              />
            )}
          />
        ) : (
          <Redirect to="/home/report" />
        )}
      </Switch>
    )
  }
}

export default withApollo(
  withStyles(style)(withLanguage(withSharedSnackbar(Report)))
)
