import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import UploadIcon from '@material-ui/icons/CloudUpload'
import { Switch, Link } from 'react-router-dom'
import AddEditStudent from './AddEditStudent'
import StudentBulkUpload from './StudentBulkUpload'
import getLoginId from '@zeliot/common/utils/getLoginId'
import { PrivateRoute } from '@zeliot/common/router'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import SearchIcon from '@material-ui/icons/Search'
import DownloadIcon from '@material-ui/icons/CloudDownload'
import { MENU_DRAWER_WIDTH } from '@zeliot/common/constants/styles'
import FileSaver from 'file-saver'
import * as xlsx from 'xlsx'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import { DownloadProgressDialogConsumer } from '@zeliot/common/shared/DownloadProgressDialog/DownloadProgressDialog.context'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
import {
  withStyles,
  Button,
  Grid,
  Typography,
  CircularProgress,
  Divider,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  TableSortLabel,
  IconButton,
  Input,
  InputAdornment,
  Tooltip,
} from '@material-ui/core'

const GET_ALL_STUDENTS = gql`
  query getAllStudents($clientLoginId: Int!) {
    getAllStudents(clientLoginId: $clientLoginId) {
      studentId
      studentName
      contactNumber
      address
      schoolName
      pickupLocation {
        areaName
      }
      dropLocation {
        areaName
      }
      rfid
      courseName
      schoolStudentId
    }
  }
`

const SYNC_STUDENT_DATA = gql`
  mutation($scriptType: ScriptType!, $clientLoginId: Int!) {
    syncThirdPartyAPIData(
      scriptType: $scriptType
      clientLoginId: $clientLoginId
    ) {
      message
    }
  }
`

const styles = (theme) => ({
  root: {
    padding: theme.spacing(2),
    // flexGrow: 1
  },
  textleft: {
    textAlign: 'left',
  },
  customFooter: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clickableTableRow: {
    cursor: 'pointer',
  },

  cellRoot: {
    maxWidth: '100px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
})

const ROWS_PER_PAGE = 10

const fileType =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
const fileExtension = '.xlsx'

class Students extends Component {
  constructor(props) {
    super(props)
    this.classes = props
  }

  state = {
    allStudentDetails: null,
    currentPage: 0,
    searchValue: '',
    order: 'asc',
    scriptType: 'SYNC_STUDENT_DATA',
    clientLoginId: null,
    isSyncSupported: false,
  }

  // componentDidUpdate = prevProps => {
  //   if (prevProps.isOpen !== this.props.isOpen && this.props.isOpen === false) {
  //     this.fetchAllAreas()
  //   }
  // }

  componentDidMount = () => {
    this.getLocalData()
  }

  getLocalData = () => {
    const plan = localStorage.getItem('plan')
    const accountType = localStorage.getItem('accountType')
    const isERP = localStorage.getItem('isERP')
    const clientLoginId = parseInt(localStorage.getItem('loginId'), 10)
    if (accountType === 'CLT' && plan === 'School Plan' && isERP === 'true') {
      this.setState({ isSyncSupported: true, clientLoginId })
    }
  }

  handleRequestSort = (event) => {
    let order = 'asc'
    if (this.state.order === 'asc') {
      order = 'desc'
    }
    this.setState({ order })
  }

  sortStudents = (allStudents) => {
    const students = allStudents
    students.sort(function (a, b) {
      var nameA = a.studentName.toLowerCase()
      var nameB = b.studentName.toLowerCase()
      if (nameA < nameB) {
        // sort string ascending
        return -1
      }
      if (nameA > nameB) return 1
      return 0 // default return value (no sorting)
    })
    if (this.state.order === 'asc') {
      return students
    } else {
      return students.reverse()
    }
  }

  handlePageChange = (pageNumber) => this.setState({ currentPage: pageNumber })

  handleSearchValueChange = (e) =>
    this.setState({ searchValue: e.target.value })

  downloadCSV = (rawData, fileName) => {
    const students = []
    rawData.forEach((item) => {
      students.push({
        'Student Name': item.studentName,
        'Student Id': item.schoolStudentId
          ? item.schoolStudentId
          : item.studentId,
        RFID: item.rfid ? item.rfid : 'NA',
        'Contact Number': item.contactNumber,
        Location: item.address,
        'School Name': item.schoolName,
        // pickupTrips: item.pickupTrips.map(trip => trip.tripName).join(', '),
        'Pickup Location': item.pickupLocation.areaName,
        // dropTrips: item.dropTrips.map(trip => trip.tripName).join(', '),
        'Drop Location': item.dropLocation.areaName,
      })
    })
    const ws = xlsx.utils.json_to_sheet(students)
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
    const excelBuffer = xlsx.write(wb, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: fileType })
    FileSaver.saveAs(data, fileName + fileExtension)
  }

  syncStudentData = async () => {
    this.props.setDialogTitle('Students data sync inprogress')
    this.props.openDialog()
    const response = await this.props.client.mutate({
      mutation: SYNC_STUDENT_DATA,
      variables: {
        scriptType: this.state.scriptType,
        clientLoginId: this.state.clientLoginId,
      },
    })

    if (response.data) {
      const {
        syncThirdPartyAPIData: { message },
      } = response.data
      this.setState({ alertMessage: message })
      this.props.openSnackbar(`Students data ${message}`)
      this.props.closeDialog()
      console.log('response data', message)
    } else {
      console.log('no response')
    }
  }

  handleClick = () => {
    this.setState({ isSyncActive: true })
    this.syncStudentData()
  }

  render() {
    const { classes } = this.props
    const { currentPage, searchValue, isSyncSupported } = this.state
    const screenWidth = window.innerWidth

    return (
      <div className={classes.root}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid
              container
              justify="flex-start"
              alignItems="center"
              style={{ marginBottom: 10 }}
            >
              <Grid
                item
                container
                direction="row"
                spacing={2}
                justify="space-between"
                alignItems="flex-end"
              >
                <Grid item>
                  <Typography variant="h5">Students</Typography>
                </Grid>
                <Grid item>
                  <Grid
                    container
                    spacing={1}
                    justify="center"
                    alignItems="center"
                  >
                    {isSyncSupported ? (
                      <Grid item>
                        <ColorButton
                          variant="contained"
                          color="primary"
                          onClick={this.handleClick}
                          disabled={this.props.isOpen}
                        >
                          Sync Students Data
                        </ColorButton>
                      </Grid>
                    ) : null}
                    <Grid item>
                      <ColorButton
                        component={Link}
                        variant="contained"
                        color="primary"
                        to={{
                          pathname: '/home/manage-students/new',
                          state: { id: 'new' },
                        }}
                      >
                        New Student
                      </ColorButton>
                    </Grid>
                    <Grid item>
                      <ColorButton
                        component={Link}
                        // to={{
                        //   pathname: '/home/manage-students/upload',
                        //   state: { id: 'upload' }
                        // }}
                        to="/home/manage-students/upload"
                        variant="contained"
                        size="small"
                      >
                        <UploadIcon />
                      </ColorButton>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Divider />
          </Grid>
          <Grid item sm={12} lg={12}>
            <Query
              query={GET_ALL_STUDENTS}
              variables={{ clientLoginId: getLoginId() }}
              fetchPolicy="network-only"
            >
              {({ loading, error, data: getAllStudents }) => {
                if (loading) {
                  return (
                    <div className={classes.root}>
                      <CircularProgress />
                    </div>
                  )
                }
                if (error) return `Error!: ${error}`

                const students = this.sortStudents(
                  getAllStudents.getAllStudents
                )
                const count = students.length
                const from = count === 0 ? 0 : currentPage * ROWS_PER_PAGE + 1
                const to = Math.min(count, (currentPage + 1) * ROWS_PER_PAGE)

                const filteredStudents = students
                  .filter((student) =>
                    student.studentName
                      .toLowerCase()
                      .includes(searchValue.toLowerCase())
                  )
                  .slice(
                    currentPage * ROWS_PER_PAGE,
                    currentPage * ROWS_PER_PAGE + ROWS_PER_PAGE
                  )

                return (
                  <Grid
                    container
                    alignItems="center"
                    style={{
                      width: screenWidth - MENU_DRAWER_WIDTH - 30, // some buffer
                      overflow: 'auto',
                    }}
                  >
                    <Grid item xs={12} lg={12}>
                      <Grid
                        container
                        justify="space-between"
                        style={{ padding: '0px 15px' }}
                      >
                        <Grid item>
                          <Input
                            value={this.state.searchValue}
                            placeholder="Search Student Name"
                            onChange={this.handleSearchValueChange}
                            startAdornment={
                              <InputAdornment>
                                <SearchIcon />
                              </InputAdornment>
                            }
                          />
                        </Grid>
                        <Grid item>
                          <Tooltip title="Download Excel">
                            <IconButton
                              onClick={() =>
                                this.downloadCSV(students, 'StudentDetails')
                              }
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item>
                      <Fragment>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell size="small">Student ID</TableCell>
                              <TableCell size="small">RFID</TableCell>
                              <TableCell
                                size="small"
                                sortDirection={this.state.order}
                              >
                                <TableSortLabel
                                  active={true}
                                  direction={this.state.order}
                                  onClick={this.handleRequestSort}
                                >
                                  Student Name
                                </TableSortLabel>
                              </TableCell>

                              <TableCell size="small">Contact Number</TableCell>
                              {/* <TableCell size="small">Location</TableCell> */}
                              <TableCell size="small">Class</TableCell>
                              <TableCell size="small">School Name</TableCell>
                              {/* <TableCell size="small">Pickup Trip(s)</TableCell> */}
                              <TableCell size="small">Pickup Stop</TableCell>
                              {/* <TableCell size="small">Drop Trip(s)</TableCell> */}
                              <TableCell size="small">Drop Stop</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filteredStudents.map((student, index) => (
                              <TableRow
                                hover
                                className={classes.clickableTableRow}
                                key={index}
                                onClick={() =>
                                  this.props.history.push({
                                    pathname:
                                      '/home/manage-students/' +
                                      student.studentId,
                                    state: { id: student.studentId },
                                  })
                                }
                              >
                                <TableCell size="small">
                                  {student.schoolStudentId
                                    ? student.schoolStudentId
                                    : student.studentId}
                                </TableCell>
                                <TableCell size="small">
                                  {student.rfid ? student.rfid : 'NA'}
                                </TableCell>
                                <TableCell size="small">
                                  {student.studentName}
                                </TableCell>
                                <TableCell size="small">
                                  {student.contactNumber}
                                </TableCell>
                                {/* <TableCell size="small">
                                  {student.address}
                                </TableCell> */}
                                <TableCell size="small">
                                  {student.courseName}
                                </TableCell>
                                <TableCell size="small">
                                  {student.schoolName}
                                </TableCell>

                                <TableCell size="small">
                                  {student.pickupLocation.areaName}
                                </TableCell>

                                <TableCell size="small">
                                  {student.dropLocation.areaName}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <div className={classes.customFooter}>
                          <IconButton
                            onClick={() => {
                              this.handlePageChange(currentPage - 1)
                            }}
                            disabled={currentPage === 0}
                          >
                            <ChevronLeftIcon />
                          </IconButton>
                          <Typography variant="caption">{`${from} - ${to} of ${count}`}</Typography>
                          <IconButton
                            onClick={() => {
                              this.handlePageChange(currentPage + 1)
                            }}
                            disabled={
                              currentPage >=
                              Math.ceil(count / ROWS_PER_PAGE) - 1
                            }
                          >
                            <ChevronRightIcon />
                          </IconButton>
                        </div>
                      </Fragment>
                    </Grid>
                  </Grid>
                )
              }}
            </Query>
          </Grid>
        </Grid>
      </div>
    )
  }
}

Students.propTypes = {
  classes: PropTypes.object.isRequired,
}

const WrappedStudents = withStyles(styles)(Students)

export default () => (
  <Switch>
    <PrivateRoute
      exact
      path="/home/manage-students/upload"
      render={(props) => <StudentBulkUpload {...props} />}
    />
    <PrivateRoute
      exact
      path="/home/manage-students"
      //render={props => <WrappedStudents {...props} />}
      component={withSharedSnackbar(
        withApollo(
          withStyles(styles)((props) => (
            <DownloadProgressDialogConsumer>
              {({ openDialog, closeDialog, isOpen, setDialogTitle }) => (
                <Students
                  openDialog={openDialog}
                  closeDialog={closeDialog}
                  isOpen={isOpen}
                  setDialogTitle={setDialogTitle}
                  {...props}
                />
              )}
            </DownloadProgressDialogConsumer>
          ))
        )
      )}
    />
    <PrivateRoute
      exact
      path="/home/manage-students/:studentId"
      render={(props) => <AddEditStudent {...props} />}
    />
  </Switch>
)
