import React, { Component, Fragment } from 'react'
import gql from 'graphql-tag'
import axios from 'axios'
import { withApollo } from 'react-apollo'
import MUIDataTable from 'mui-datatables'
import { withRouter } from 'react-router-dom'
import getLoginId from '@zeliot/common/utils/getLoginId'
import { DownloadProgressDialogConsumer } from '@zeliot/common/shared/DownloadProgressDialog/DownloadProgressDialog.context'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'

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
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

// calling server for updation
const ADD_STUDENTS = gql`
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

// Bucket name and file name are static for student registration template
const bucketName = 'excel-templates'
const fileName = 'studentRegistrationTemplate.xlsx'

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

class StudentBulkUpload extends Component {
  state = {
    uploadSucess: true,
    selectedFile: null,
    response: '',
    failList: '',
    result: false,
    duplicate: 'SKIP',
    failedRecords: 0,
    excelUploadError: '',
  }

  columns = ['Student Name', 'Primary Phone Number', 'Email', 'Error reason']

  options = {
    selectableRows: 'none',
    responsive: 'stacked',
    rowsPerPage: 10,
    print: false,
    download: true,
  }

  handleInputChange = (key) => (e) => {
    this.setState({ [key]: e.target.value })
  }

  handleDuplicateChange = (event) => {
    this.setState({ duplicate: event.target.value })
  }

  handleSubmit = (client) => async (event) => {
    if (this.state.bucketName) {
      event.preventDefault()
      const { data, errors } = await client.mutate({
        mutation: ADD_STUDENTS,
        variables: {
          fileInfo: {
            uploadFor: 'StudentUpload',
            bucketName: this.state.bucketName,
            fileName: this.state.fileName,
            operationType: this.state.duplicate,
          },
          commonInput: {
            clientLoginId: getLoginId(),
          },
        },
        errorPolicy: 'all',
      })

      if (data) {
        const fullData = []

        const arrList = data.excelFileUpload.failedUploadList

        JSON.parse(arrList).forEach((element) => {
          const rowData = [
            element.studentName,
            element.Contact_Number_1,
            element.Email,
            element.errorMsg,
          ]
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
          failedRecords: data.excelFileUpload.failedToUpload,
        })
      } else {
        console.log('errors', errors)
        this.setState({ excelUploadError: errors[0].message })
      }
    } else {
      this.props.openSnackbar('Choose a excel before uploading.')
    }
  }

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

  handleDownloadTemplate = () => {
    this.props.downloadSampleFile(
      GET_TEMPLATE,
      {
        bucketName: bucketName,
        name: fileName,
        fileType: 'EXCEL',
      },
      ['getPublicDownloadURL'],
      'Student Registration'
    )
  }

  render() {
    const { classes } = this.props
    return (
      <div className={classes.root}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Students - Upload File
            </Typography>
            <Divider />
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={1}>
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

              <Grid item>
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

                  <Typography
                    variant="caption"
                    color="textSecondary"
                    gutterBottom
                  >
                    File Format - XLS, XLSX, CSV
                  </Typography>
                </Fragment>
              </Grid>
            </Grid>
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
            >
              Submit
            </ColorButton>
          </Grid>

          <Grid item xs={12}>
            {this.state.uploadSucess && (
              <Typography variant="subtitle1" color="primary">
                {this.state.response}
              </Typography>
            )}
          </Grid>

          {this.state.failedRecords > 0 ? (
            <Grid item xs={9}>
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

          {this.state.excelUploadError && (
            <Grid item xs={12}>
              <Grid container>
                <Typography variant="subtitle1" color="error">
                  Invalid excel. Please download template and fill in given
                  format.
                </Typography>
              </Grid>
              <Grid container>
                <Typography color="textSecondary">
                  {this.state.excelUploadError}
                </Typography>
              </Grid>
            </Grid>
          )}
        </Grid>
      </div>
    )
  }
}
export default withStyles(styles)(
  withRouter(
    withSharedSnackbar(
      withApollo((props) => (
        <DownloadProgressDialogConsumer>
          {({ downloadReport }) => (
            <StudentBulkUpload downloadSampleFile={downloadReport} {...props} />
          )}
        </DownloadProgressDialogConsumer>
      ))
    )
  )
)
