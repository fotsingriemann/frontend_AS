/**
 * @module Vehicles/AssignVehicle/BulkVehicleAssign
 * @summary This module exports the BulkVehicleAssign component
 */

import React, { Fragment } from 'react'
import gql from 'graphql-tag'
import axios from 'axios'
import MUIDataTable from 'mui-datatables'
import { withApollo } from 'react-apollo'
import {
  Typography,
  withStyles,
  Button,
  Grid,
  CircularProgress,
  Divider,
} from '@material-ui/core'
import withGoogleMaps from '@zeliot/common/hoc/withGoogleMaps'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import { DownloadProgressDialogConsumer } from '@zeliot/common/shared/DownloadProgressDialog/DownloadProgressDialog.context'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
// new api for download sample template for group vehicle assign

const GET_TEMPLATE = gql`
  query($bucketName: String!, $name: String!) {
    getPublicDownloadURL(bucketName: $bucketName, filename: $name)
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

const ASSIGN_VEHICLE = gql`
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

/**
 * @summary Bucket name of all excel templates
 */
const bucketName = 'excel-templates'

/**
 * @summary Name of template file in bucket
 */
const fileName = 'assignVehilceToGroup.xlsx'

const styles = (theme) => ({
  root: {
    padding: theme.spacing(2),
    flexGrow: 1,
    width: '100%',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  button: {
    margin: theme.spacing(2),
  },
})

/**
 * @summary BulkVehicleAssign component assigns vehicles to a group by uploading an excel file
 * containing the vehicles to be uploaded
 */
class BulkVehicleAssign extends React.Component {
  /**
   * @property {string} publicUploadURL The URL for uploading document
   * @property {string} fileName The file name for uploading file
   * @property {string} bucketName The bucket name for uploading
   * @property {boolean} isUploading Boolean to indicate whether the file is uploading
   * @property {boolean} uploadSucess Boolean to indicate whether the file upload is successfull
   * @property {response} string The response of the bulk assignment mutation
   * @property {string} failList The list of vehicle that failed to assign
   * @property {boolean} result The result of the bulk assignment of vehicles
   */
  state = {
    publicUploadURL: '',
    fileName: '',
    bucketName: '',
    isUploading: false,
    uploadSucess: true,
    response: '',
    failList: '',
    result: false,
  }

  /**
   * @summary The columns of the table
   */
  columns = ['Vehicle Number', 'Reason']

  /**
   * @summary The options for the table
   */
  options = {
    selectableRows: 'none',
    responsive: 'stacked',
    rowsPerPage: 25,
    filter: false,
    print: false,
  }

  /**
   * @function handleDownloadTemplate
   * @summary Download group vehicle assign template
   */
  handleDownloadTemplate = () => {
    this.props.downloadSampleFile(
      GET_TEMPLATE,
      {
        bucketName: bucketName,
        name: fileName,
        fileType: 'EXCEL',
      },

      ['getPublicDownloadURL'],
      'Vehicle Template'
    )
  }

  /**
   * @function
   * @summary The bulk vehicle assignment mutation is called
   */
  handleSave = async (event) => {
    event.preventDefault()

    const { data } = await this.props.client.mutate({
      mutation: ASSIGN_VEHICLE,
      variables: {
        fileInfo: {
          uploadFor: 'AssignVehiclesToGroup',
          bucketName: this.state.bucketName,
          fileName: this.state.fileName,
          operationType: 'SKIP',
        },
        commonInput: {
          groupId: parseInt(this.props.groupId, 10),
        },
      },
    })

    const fullData = []

    const arrList = data.excelFileUpload.failedUploadList

    JSON.parse(arrList).forEach((element) => {
      var rowData = []
      rowData.push(element.vehicleNmber)
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
      result: true,
    })
  }

  /**
   * @callback
   * @summary Fetches an upload URL, and uploads the file
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
    this.setState({ isUploading: false })
  }

  render() {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="h6">Bulk Upload for vehicle Assign</Typography>
          </Grid>
          <Divider light style={{ width: '100%' }} />{' '}
          <Grid item xs={6}>
            <Grid container spacing={2}>
              <Grid item>
                <Grid item xs={12}>
                  {' '}
                  <Fragment>
                    <input
                      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                      id="contained-button-file"
                      multiple
                      type="file"
                      style={{
                        display: 'none',
                      }}
                      onChange={this.onUpload}
                    />

                    <label htmlFor="contained-button-file">
                      Upload excel file here &nbsp;
                      <ColorButton
                        variant="contained"
                        component="span"
                        color="primary"
                      >
                        {this.state.isUploading ? (
                          <CircularProgress size={15} />
                        ) : (
                          'Upload'
                        )}
                      </ColorButton>
                    </label>
                  </Fragment>
                </Grid>

                <Grid item>
                  <ColorButton
                    color="primary"
                    variant="contained"
                    onClick={this.handleSave}
                    className={classes.button}
                    disabled={
                      this.state.fileInfo === '' || this.props.groupId === ''
                    }
                    size="medium"
                  >
                    Submit
                  </ColorButton>

                  <ColorButton
                    color="default"
                    variant="contained"
                    onClick={this.props.handleClose}
                    className={classes.button}
                    size="medium"
                  >
                    Close
                  </ColorButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          {/* new button here */}
          <Grid item xs={6}>
            Download sample excel file here&nbsp;
            <Button
              style={styles.button}
              color="primary"
              variant="outlined"
              onClick={this.handleDownloadTemplate}
            >
              Download Template
            </Button>
          </Grid>
          <Divider light style={{ width: '100%' }} />{' '}
          {this.state.result && (
            <Grid item xs={12}>
              <Typography color="textPrimary" variant="subheading">
                {this.state.uploadSucess && (
                  <Typography variant="subheading" color="primary">
                    {this.state.response}
                  </Typography>
                )}
              </Typography>

              <h5>Failed records list</h5>

              <MUIDataTable
                data={this.state.failList}
                columns={this.columns}
                options={this.options}
              />
            </Grid>
          )}
        </Grid>
      </div>
    )
  }
}

// export default withStyles(styles)(withApollo(BulkVehicleAssign))

export default withGoogleMaps(
  withApollo(
    withSharedSnackbar(
      withStyles(styles)((props) => (
        <DownloadProgressDialogConsumer>
          {({ downloadReport }) => (
            <BulkVehicleAssign downloadSampleFile={downloadReport} {...props} />
          )}
        </DownloadProgressDialogConsumer>
      ))
    )
  )
)
