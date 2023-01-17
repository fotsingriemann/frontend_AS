/**
 * @module Drivers/DriverBulkUpload
 * @summary This module exports the DriverBulkUpload component
 */

import React, { Component, Fragment } from 'react'
import gql from 'graphql-tag'
import axios from 'axios'
import { withApollo } from 'react-apollo'
import { withRouter, Link } from 'react-router-dom'
import MUIDataTable from 'mui-datatables'
import { KeyboardBackspace as BackIcon } from '@material-ui/icons'
import {
  Button,
  CircularProgress,
  FormControl,
  withStyles,
  Typography,
  Grid,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from '@material-ui/core'
import getLoginId from '@zeliot/common/utils/getLoginId'
import Loader from '@zeliot/common/ui/Loader/Loader'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
import { DownloadProgressDialogConsumer } from '@zeliot/common/shared/DownloadProgressDialog/DownloadProgressDialog.context'

// calling server for updation
const ADD_DRIVERS = gql`
  mutation excelFileUpload(
    $fileInfo: FileUploadInput!
    $commonInput: CommonInput!
  ) {
    excelFileUpload(fileInfo: $fileInfo, commonInput: $commonInput) {
      failedToUpload
      totalExcelDataRecords
      totalDuplicateRecords
      successfullyUploaded
      failedUploadList
    }
  }
`

const GET_UPLOAD_URL = gql`
  mutation($fileExtension: String!) {
    getPublicUploadURL(fileExtension: $fileExtension) {
      bucketName
      filename
      publicUploadURL
    }
  }
`

const GET_TEMPLATE = gql`
  query($bucketName: String!, $name: String!) {
    getPublicDownloadURL(bucketName: $bucketName, filename: $name)
  }
`

/**
 * @summary Bucket name of all excel templates
 */
const bucketName = 'excel-templates'

/**
 * @summary Name of template file in bucket
 */
const fileName = 'uploadDriverDetails.xlsx'

const styles = (theme) => ({
  button: {
    display: 'block',
    marginTop: theme.spacing(2),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  root: {
    padding: theme.spacing(2),
    flexGrow: 1,
  },
})

/**
 * @summary DriverBulkUpload facilitates bulk uploading drivers
 */
class DriverBulkUpload extends Component {
  /**
   * @property {boolean} uploadSucess Boolean flag indicating success of upload
   * @property {object?} selectedFile The file object for uploading
   * @property {string} response The response of bulk upload
   * @property {string[]} failList The list of drivers that failed to upload
   * @property {string} duplicate Action to take on finding duplicate drivers
   * @property {number} failedRecords The count of records that failed to upload
   */
  state = {
    uploadSucess: true,
    selectedFile: null,
    response: '',
    failList: '',
    duplicate: 'SKIP',
    failedRecords: 0,
    loading: null,
  }

  /**
   * @summary The columns of the drivers table
   */
  columns = ['Driver Name', 'Reason']

  /**
   * @summary The options for the drivers table
   */
  options = {
    selectableRows: 'none',
    responsive: 'stacked',
    rowsPerPage: 25,
    print: false,
    download: false,
  }

  /**
   * @summary Generic input change handler
   */
  handleInputChange = (key) => (e) => {
    this.setState({ [key]: e.target.value })
  }

  /**
   * @summary Change action to take on duplicate entries
   */
  handleDuplicateChange = (event) => {
    this.setState({ duplicate: event.target.value })
  }

  handleDownloadTemplate = () => {
    this.props.downloadSampleFile(
      GET_TEMPLATE,
      {
        bucketName: bucketName,
        name: fileName,
        fileType: 'EXCEL',
      },

      ['getPublicDownloadURL'],
      'uploadDriverDetails'
    )
  }

  /**
   * @summary Calls the mutation to bulk upload drivers
   */
  handleSubmit = (client) => async (event) => {
    this.setState({ loading: true })
    event.preventDefault()
    const { data } = await client.mutate({
      mutation: ADD_DRIVERS,
      variables: {
        fileInfo: {
          uploadFor: 'uploadDriverData',
          bucketName: this.state.bucketName,
          fileName: this.state.fileName,
          operationType: this.state.duplicate,
        },
        commonInput: {
          clientLoginId: getLoginId(),
        },
      },
    })

    const fullData = []

    const arrList = data.excelFileUpload.failedUploadList
    console.log('FALIED LIST', data.excelFileUpload.failedUploadList)

    JSON.parse(arrList).forEach((element) => {
      var rowData = []
      rowData.push(element.driverName)
      rowData.push(element.error)
      fullData.push(rowData)
    })

    this.setState({
      response:
        'Total Excel Records= ' +
        data.excelFileUpload.totalExcelDataRecords +
        ',' +
        'Total Records Uploaded=' +
        data.excelFileUpload.successfullyUploaded +
        ', Total Records Failed To Upload=' +
        data.excelFileUpload.failedToUpload +
        ', Total Duplicate Records in Excel=' +
        data.excelFileUpload.totalDuplicateRecords,
      uploadSucess: true,
      failList: fullData,
      failedRecords: data.excelFileUpload.failedToUpload,
      loading: false,
    })
  }

  /**
   * @summary Fetches a url for uploading a file and uploads the file
   */
  onUpload = async ({
    target: {
      validity,
      files: [file],
    },
  }) => {
    // TODO: Handle upload errors
    this.setState({ isUploading: true })
    if (validity.valid) {
      const fileExtension = file.name.substring(file.name.lastIndexOf('.') + 1)

      const response = await this.props.client.mutate({
        mutation: GET_UPLOAD_URL,
        variables: {
          fileExtension,
        },
      })

      if (response.data && response.data.getPublicUploadURL) {
        const url = response.data.getPublicUploadURL.publicUploadURL
        await axios.put(url, file)

        this.setState({
          fileName: response.data.getPublicUploadURL.filename,
          bucketName: response.data.getPublicUploadURL.bucketName,
          publicUploadURL: response.data.getPublicUploadURL.publicUploadURL,
        })
      }
    }
    this.setState({ isUploading: false, selectedFile: file.name })
  }

  render() {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Button
              component={Link}
              variant="outlined"
              size="small"
              to="/home/manage-drivers/"
            >
              <BackIcon />
            </Button>{' '}
            {'    '}
            <Typography variant="h5" gutterBottom>
              Drivers - Upload File
            </Typography>
            <Divider />
          </Grid>

          <Grid item>
            <Button
              style={styles.button}
              color="primary"
              variant="outlined"
              onClick={this.handleDownloadTemplate}
            >
              Download Template
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Fragment>
              <input
                accept="*/*"
                id="contained-button-file"
                multiple
                type="file"
                style={{
                  display: 'none',
                }}
                onChange={this.onUpload}
              />

              <label htmlFor="contained-button-file">
                <Button variant="outlined" component="span">
                  {this.state.isUploading ? (
                    <CircularProgress size={15} />
                  ) : (
                    'Choose File'
                  )}
                </Button>
              </label>

              <span style={{ color: '#cccccc' }}>
                {this.state.selectedFile === null
                  ? '   No File Selected'
                  : '     ' + this.state.selectedFile}
              </span>

              <Typography variant="caption" color="textSecondary" gutterBottom>
                File Format - XLS, XLSX, CSV
              </Typography>
            </Fragment>
          </Grid>

          <Grid item xs={12}>
            <FormControl component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">Duplicates</FormLabel>

              <RadioGroup
                aria-label="Gender"
                name="gender1"
                className={classes.group}
                value={this.state.duplicate}
                onChange={this.handleDuplicateChange}
              >
                <FormControlLabel
                  value="SKIP"
                  control={<Radio color="primary" />}
                  label="Skip"
                />

                <FormControlLabel
                  value="OVERWRITE"
                  control={<Radio color="primary" />}
                  label="Overwrite"
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <ColorButton
              onClick={this.handleSubmit(this.props.client)}
              color="primary"
              type="submit"
              variant="contained"
              disabled={this.state.isUploading || this.state.loading}
            >
              Submit
            </ColorButton>
          </Grid>

          {this.state.loading ? (
            <Grid container xs={6}>
              <Grid item xs={4}>
                <Loader spinnerSize={40} />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" color="primary">
                  Please Wait... Uploaded data is being executed. After
                  execution, result will be displayed.
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <Grid item xs={12}>
              {this.state.uploadSucess && (
                <Typography variant="subtitle1" color="primary">
                  {this.state.response}
                </Typography>
              )}
            </Grid>
          )}

          {this.state.failedRecords > 0 && !this.state.loading ? (
            <Grid item xs={6}>
              {/* TODO: Replace this with a custom table going forward */}
              <h5>Failed records list</h5>
              <MUIDataTable
                data={this.state.failList}
                columns={this.columns}
                options={this.options}
              />
            </Grid>
          ) : (
            <div />
          )}
        </Grid>
      </div>
    )
  }
}
// export default withStyles(styles)(withRouter(withApollo(DriverBulkUpload)))

export default withStyles(styles)(
  withRouter(
    withApollo((props) => (
      <DownloadProgressDialogConsumer>
        {({ downloadReport }) => (
          <DriverBulkUpload downloadSampleFile={downloadReport} {...props} />
        )}
      </DownloadProgressDialogConsumer>
    ))
  )
)
