import React, { Component } from 'react'
import gql from 'graphql-tag'
import { ApolloConsumer } from 'react-apollo'
import { Link } from 'react-router-dom'
import { GENDERS as genders } from '@zeliot/common/constants/others'
import getLoginId from '@zeliot/common/utils/getLoginId'
import ComboBox from '@zeliot/common/ui/ComboBox'
import MultiSelectComboBox from '@zeliot/common/ui/MultiSelectComboBox'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'

import {
  Button,
  Typography,
  TextField,
  Grid,
  withStyles,
  Divider,
  MenuItem,
  AppBar,
  Tabs,
  Tab,
  Switch,
} from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

const GET_STUDENT = gql`
  query getStudent($id: Int) {
    getStudent(studentId: $id) {
      rfid
      studentName
      email
      gender
      contactNumber
      secondaryContactNumber
      pickupLocation {
        areaId
        areaName
      }
      dropLocation {
        areaId
        areaName
      }
      pickupTrips {
        tripId
        tripName
        route {
          routeId
          areaName
        }
      }
      dropTrips {
        tripId
        tripName
        route {
          routeId
          areaName
        }
      }
      address
      schoolId
      schoolName
      smsEnabled
      courseName
      schoolStudentId
      pickupRoute {
        routeId
        areaName
      }
      dropRoute {
        routeId
        areaName
      }
    }
  }
`

const ADD_UPDATE_STUDENT = gql`
  mutation(
    $studentName: String!
    $gender: String!
    $email: String
    $contactNumber: String!
    $secondaryContactNumber: String
    $clientLoginId: Int!
    $rfid: String
    $address: String
    $aoiPickup: Int
    $aoiDrop: Int
    $studentId: Int
    $schoolId: Int
    $smsEnabled: Boolean
    $pickupTripId: [Int]
    $dropTripId: [Int]
    $schoolStudentId: String
  ) {
    addOrUpdateStudent(
      studentName: $studentName
      gender: $gender
      email: $email
      contactNumber: $contactNumber
      secondaryContactNumber: $secondaryContactNumber
      clientLoginId: $clientLoginId
      rfid: $rfid
      address: $address
      aoiPickup: $aoiPickup
      aoiDrop: $aoiDrop
      studentId: $studentId
      schoolId: $schoolId
      smsEnabled: $smsEnabled
      pickupTripId: $pickupTripId
      dropTripId: $dropTripId
      schoolStudentId: $schoolStudentId
    )
  }
`

// const ROUTE_ASSOCIATED_AOIS = gql`
//   query getRouteAssociatedAreas($routeId: Int!) {
//     getRouteAssociatedAreas(routeId: $routeId) {
//       id
//       areaName
//     }
//   }
// `

const GET_ALL_SCHOOLS = gql`
  query getAllSchools($id: Int!) {
    getAllSchools(clientLoginId: $id) {
      schoolId
      schoolName
    }
  }
`
const GET_ALL_TRIPS = gql`
  query getAllTrips($clientLoginId: Int!) {
    getAllTrips(clientLoginId: $clientLoginId) {
      edges {
        node {
          tripId
          tripName
          route {
            id
            areaName
          }
        }
      }
    }
  }
`

const GET_ALL_AREAS = gql`
  query($clientLoginId: Int!) {
    getAllAreaDetails(clientLoginId: $clientLoginId) {
      id
      areaName
    }
  }
`

const styles = (theme) => ({
  root: {
    padding: theme.spacing(2),
    flexGrow: 1,
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '100%',
  },
})

class AddEditStudent extends Component {
  constructor(props) {
    super(props)
    this.classes = props
    this.studentId = this.props.location.state.id
    if (this.studentId === 'new') {
      this.addStudent = true
    } else {
      this.addStudent = false
    }
  }

  state = {
    studentName: '',
    studentGender: '',
    email: '',
    contactNumber: '',
    secondaryContactNumber: '',
    address: '',
    rfid: '',
    clientLoginId: getLoginId(),
    tabvalue: 0,
    schools: null,
    selectedSchool: null,
    selectedPickupRoute: null,
    selectedDropRoute: null,
    alertBySms: false,
    allTrips: null,
    selectedPickupTrips: [],
    selectedDropTrips: [],
    allAreas: null,
    selectedPickupArea: null,
    selectedDropArea: null,
    schoolStudentId: null,
  }

  // fetchAllRoutes = async () => {
  //   // console.log('fetch routes')
  //   let fetchedRoutes = await this.props.client.query({
  //     query: GET_ALL_ROUTES,
  //     variables: {
  //       clientLoginId: getLoginId()
  //     }
  //   })
  //   this.setState({ routes: fetchedRoutes.data.getAllRoutes })
  // }

  fetchAllSchools = async () => {
    const fetchedSchools = await this.props.client.query({
      query: GET_ALL_SCHOOLS,
      variables: {
        id: getLoginId(),
      },
    })
    this.setState({ schools: fetchedSchools.data.getAllSchools })
  }

  mapData = (edges) => {
    const reducedData = edges.reduce((acc, edge) => {
      acc.push(edge['node'])
      return acc
    }, [])
    return reducedData
  }

  fetchAllTrips = async () => {
    const fetchedTrips = await this.props.client.query({
      query: GET_ALL_TRIPS,
      variables: {
        clientLoginId: getLoginId(),
      },
    })
    if (fetchedTrips.data && fetchedTrips.data.getAllTrips) {
      const { edges } = fetchedTrips.data.getAllTrips
      const allTripsData = this.mapData(edges)
      this.setState({ allTrips: allTripsData })
    }
  }

  // getRespectiveAois = async route => {
  //   let fetchedAois = await this.props.client.query({
  //     query: ROUTE_ASSOCIATED_AOIS,
  //     variables: {
  //       routeId: route.id
  //     }
  //   })
  //   if (fetchedAois.data) {
  //     this.setState(
  //       { aois: fetchedAois.data.getRouteAssociatedAreas }
  //       // , () =>
  //       // console.log('Fetched aois', this.state.aois)
  //     )
  //   }
  // }

  getStudent = async () => {
    const { data } = await this.props.client.query({
      query: GET_STUDENT,
      variables: {
        id: this.studentId,
      },
      fetchPolicy: 'network-only',
    })
    // console.log('Student details', data)
    this.setDetails(data.getStudent)
  }

  componentDidMount() {
    if (this.studentId !== 'new') this.getStudent()
    // this.fetchAllRoutes()
    this.fetchAllSchools()
    this.getAllAreas()
    this.fetchAllTrips()
  }

  getAllAreas = async () => {
    const fetchedAreas = await this.props.client.query({
      query: GET_ALL_AREAS,
      variables: {
        clientLoginId: getLoginId(),
      },
    })
    if (fetchedAreas.data && fetchedAreas.data.getAllAreaDetails) {
      this.setState({ allAreas: fetchedAreas.data.getAllAreaDetails })
    }
  }

  setDetails = (studentDetail) => {
    const selectedPickupRoute = []
    const selectedPickupTrips = []
    const selectedDropRoute = []
    const selectedDropTrips = []
    if (studentDetail.pickupRoute) {
      selectedPickupRoute.push({
        id: studentDetail.pickupRoute.routeId,
        areaName: studentDetail.pickupRoute.areaName,
      })
    }
    if (studentDetail.pickupTrips.length > 0) {
      studentDetail.pickupTrips.forEach((trip) => {
        selectedPickupRoute.push({
          id: trip.route.routeId,
          areaName: trip.route.areaName,
        })
        selectedPickupTrips.push({
          tripId: trip.tripId,
          tripName: trip.tripName,
          route: {
            routeId: trip.route.id,
            areaName: trip.route.areaName,
          },
        })
      })
    }

    if (studentDetail.dropRoute) {
      selectedDropRoute.push({
        id: studentDetail.dropRoute.routeId,
        areaName: studentDetail.dropRoute.areaName,
      })
    }
    if (studentDetail.dropTrips.length > 0) {
      studentDetail.dropTrips.forEach((trip) => {
        selectedDropRoute.push({
          id: trip.route.routeId,
          areaName: trip.route.areaName,
        })
        selectedDropTrips.push({
          tripId: trip.tripId,
          tripName: trip.tripName,
          route: {
            routeId: trip.route.id,
            areaName: trip.route.areaName,
          },
        })
      })
    }

    /* eslint-disable indent */
    this.setState({
      studentName: studentDetail.studentName || '',
      studentGender: studentDetail.gender || '',
      email: studentDetail.email || '',
      contactNumber: studentDetail.contactNumber || '',
      secondaryContactNumber: studentDetail.secondaryContactNumber || '',
      address: studentDetail.address || '',
      rfid: studentDetail.rfid || '',
      schoolStudentId: studentDetail.schoolStudentId,
      selectedPickupRoute:
        selectedPickupRoute.length > 0 ? selectedPickupRoute : null,
      selectedDropRoute:
        selectedDropRoute.length > 0 ? selectedDropRoute : null,
      selectedPickupTrips,
      selectedDropTrips,
      selectedPickupArea: studentDetail.pickupLocation.areaId
        ? {
            id: studentDetail.pickupLocation.areaId,
            areaName: studentDetail.pickupLocation.areaName,
          }
        : null,
      selectedDropArea: studentDetail.dropLocation.areaId
        ? {
            id: studentDetail.dropLocation.areaId,
            areaName: studentDetail.dropLocation.areaName,
          }
        : null,
      selectedSchool: studentDetail.schoolId
        ? {
            schoolId: studentDetail.schoolId,
            schoolName: studentDetail.schoolName,
          }
        : null,
      alertBySms: studentDetail.smsEnabled,
      class: studentDetail.courseName,
    })
    /* eslint-enable indent */
  }

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    })
  }

  handleTabChange = (event, value) => {
    this.setState({ tabvalue: value })
  }

  handlePickupRouteChange = (value) => {
    this.setState({ selectedPickupRoute: value }, () => {
      if (value) this.getRespectiveAois(this.state.selectedPickupRoute)
    })
  }

  handleDropRouteChange = (value) => {
    this.setState({ selectedDropRoute: value }, () => {
      if (value) this.getRespectiveAois(this.state.selectedDropRoute)
    })
  }

  handleSchoolChange = (value) => {
    this.setState({ selectedSchool: value })
  }

  validate = () => {
    if (
      !this.state.studentName ||
      !this.state.studentGender ||
      !this.state.contactNumber
      // || !this.state.rfid
    ) {
      this.props.openSnackbar(
        'Some compulsory fields are empty, please fill them before submitting'
      )
      return false
    }

    if (
      this.state.studentName.length < 3 ||
      this.state.studentName.length > 30
    ) {
      this.props.openSnackbar(
        'Student name should be between 3 and 30 characters long'
      )
      return false
    }

    return true
  }

  // submitForm = addUpdateStudent => e => {
  submitForm = async () => {
    const valid = this.validate()
    // e.preventDefault()
    if (valid) {
      const variables = {
        studentName: this.state.studentName,
        studentId: this.studentId === 'new' ? null : this.studentId,
        gender: this.state.studentGender,
        email: this.state.email === '' ? null : this.state.email,
        contactNumber: this.state.contactNumber,
        secondaryContactNumber:
          this.state.secondaryContactNumber === ''
            ? null
            : this.state.secondaryContactNumber,
        address: this.state.address,
        rfid: this.state.rfid === '' ? null : this.state.rfid,
        clientLoginId: this.state.clientLoginId,
        aoiPickup: this.state.selectedPickupArea
          ? this.state.selectedPickupArea.id
          : null,
        aoiDrop: this.state.selectedDropArea
          ? this.state.selectedDropArea.id
          : null,
        schoolId: this.state.selectedSchool
          ? this.state.selectedSchool.schoolId
          : null,
        smsEnabled: this.state.alertBySms,
        pickupTripId: this.state.selectedPickupTrips
          ? this.state.selectedPickupTrips.map((trip) => trip.tripId)
          : null,
        dropTripId: this.state.selectedDropTrips
          ? this.state.selectedDropTrips.map((trip) => trip.tripId)
          : null,
        schoolStudentId: this.state.schoolStudentId,
      }

      var response = await this.props.client.mutate({
        mutation: ADD_UPDATE_STUDENT,
        variables: variables,
        errorPolicy: 'all',
      })
      // addUpdateStudent({
      //   variables
      // })

      if (response.data && response.data.addOrUpdateStudent) {
        this.props.openSnackbar('Student details saved')
      } else {
        this.props.openSnackbar(
          'Failed to save student: ',
          response.errors[0].message
        )
      }

      this.setState({
        studentName: '',
        studentGender: '',
        email: '',
        contactNumber: '',
        secondaryContactNumber: '',
        rfid: '',
        address: '',
        selectedSchool: null,
        alertBySms: true,
        schoolStudentId: null,
        selectedPickupArea: null,
        selectedDropArea: null,
        selectedDropTrips: [],
        selectedPickupTrips: [],
        selectedPickupRoute: null,
        selectedDropRoute: null,
        tabvalue: 0,
      })
    }
  }

  handlePickupTripsChange = (selectedTrips) => {
    const length = selectedTrips.length
    if (length > 0) {
      const selectedPickupRoute = []
      selectedTrips.forEach((trip) => {
        selectedPickupRoute.push({
          id: trip.route.id,
          areaName: trip.route.areaName,
        })
      })
      this.setState({
        selectedPickupTrips: selectedTrips,
        selectedPickupRoute,
      })
    } else {
      this.setState({ selectedPickupTrips: [], selectedPickupRoute: null })
    }
  }

  handleDropTripsChange = (selectedTrips) => {
    const length = selectedTrips.length
    if (length > 0) {
      const selectedDropRoute = []
      selectedTrips.forEach((trip) => {
        selectedDropRoute.push({
          id: trip.route.id,
          areaName: trip.route.areaName,
        })
      })
      this.setState({
        selectedDropTrips: selectedTrips,
        selectedDropRoute,
      })
    } else {
      this.setState({ selectedDropTrips: [], selectedDropRoute: null })
    }
  }

  handlePickupAreaChange = (area) => {
    this.setState({ selectedPickupArea: area })
  }

  handleDropAreaChange = (area) => {
    this.setState({ selectedDropArea: area })
  }

  render() {
    const {
      studentName,
      email,
      contactNumber,
      secondaryContactNumber,
      address,
      studentGender,
      rfid,
      tabvalue,
      schoolStudentId,
      selectedPickupTrips,
      selectedDropTrips,
      allTrips,
      allAreas,
      selectedPickupArea,
      selectedDropArea,
    } = this.state

    const { classes } = this.props

    return (
      // <Mutation mutation={ADD_UPDATE_STUDENT}>
      //   {(addUpdateStudent, { data, errors }) => (
      <div className={classes.root}>
        <Grid container justify="flex-start">
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              {this.addStudent ? (
                <div> New Student Registration</div>
              ) : (
                <div> Student Information</div>
              )}
            </Typography>
            <Divider />
          </Grid>
          <Grid item xs={6}>
            <Grid container justify="flex-start">
              <form className={classes.container} noValidate autoComplete="off">
                <TextField
                  id="name"
                  label="Full Name"
                  required
                  className={classes.textField}
                  value={studentName}
                  onChange={this.handleChange('studentName')}
                  margin="normal"
                />
                <Grid item container xs={4}>
                  <TextField
                    id="gender"
                    label="Gender"
                    select
                    required
                    className={classes.textField}
                    value={studentGender}
                    onChange={this.handleChange('studentGender')}
                    margin="normal"
                  >
                    {genders.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item container xs={8}>
                  <TextField
                    // required
                    id="rfid"
                    label="RFID"
                    value={rfid}
                    className={classes.textField}
                    onChange={this.handleChange('rfid')}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <br />
                </Grid>
                <Grid item xs={12}>
                  <AppBar position="static" color="default">
                    <Tabs value={tabvalue} onChange={this.handleTabChange}>
                      <Tab label="Contact" />
                      <Tab label="Class" />
                      <Tab label="Boarding Info" />
                    </Tabs>
                  </AppBar>
                  {tabvalue === 0 && (
                    <div>
                      <TextField
                        id="primaryNumber"
                        label="Primary Mobile No"
                        type="number"
                        required
                        className={classes.textField}
                        value={contactNumber}
                        onChange={this.handleChange('contactNumber')}
                        margin="normal"
                      />
                      <TextField
                        id="secondaryNumber"
                        label="Secondary Mobile No"
                        type="number"
                        className={classes.textField}
                        value={secondaryContactNumber}
                        onChange={this.handleChange('secondaryContactNumber')}
                        margin="normal"
                      />
                      <TextField
                        id="email"
                        label="Email ID"
                        value={email}
                        className={classes.textField}
                        onChange={this.handleChange('email')}
                        margin="normal"
                        // required
                      />
                      <TextField
                        id="address"
                        label="Address"
                        multiline
                        rows="3"
                        value={address}
                        className={classes.textField}
                        onChange={this.handleChange('address')}
                        margin="normal"
                      />
                      <Grid
                        container
                        spacing={1}
                        alignItems="center"
                        style={{ paddingLeft: 10 }}
                      >
                        <Grid item>
                          <Typography color="textSecondary">
                            Want to receive SMS alerts?
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Switch
                            checked={this.state.alertBySms}
                            color="primary"
                            onChange={(e, checked) => {
                              // console.log(this.state.alertBySms, checked)
                              this.setState({ alertBySms: checked })
                            }}
                          />
                        </Grid>
                      </Grid>
                    </div>
                  )}
                  {tabvalue === 1 && (
                    <Grid
                      container
                      spacing={3}
                      alignItem="center"
                      style={{ paddingTop: 25 }}
                    >
                      <Grid item xs={12}>
                        <Grid container>
                          <Grid item xs={12} sm={12} lg={3}>
                            <Typography color="textSecondary">
                              School Name
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={12} lg={9}>
                            <ComboBox
                              items={this.state.schools || []}
                              selectedItem={this.state.selectedSchool}
                              onSelectedItemChange={this.handleSchoolChange}
                              placeholder="Select School"
                              isLoading={false}
                              itemKey="schoolId"
                              itemToStringKey="schoolName"
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container>
                          <Grid item xs={12} sm={12} lg={3}>
                            <Typography color="textSecondary">Class</Typography>
                          </Grid>
                          <Grid item xs={12} sm={12} lg={9}>
                            <Typography>
                              {this.state.class
                                ? this.state.class
                                : 'Not assigned'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container alignItems="center">
                          <Grid item xs={12} sm={12} lg={3}>
                            <Typography color="textSecondary">
                              Student ID
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={12} lg={9}>
                            {schoolStudentId ? (
                              <TextField
                                id="schoolStudentId"
                                value={schoolStudentId}
                                className={classes.textField}
                                onChange={this.handleChange('schoolStudentId')}
                                margin="normal"
                              />
                            ) : (
                              <Typography>Not assigned</Typography>
                            )}
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  )}
                  {tabvalue === 2 && (
                    // <Grid container spacing={3} style={{ paddingTop: 25 }}>
                    //   <Grid item xs={12}>
                    //     <Grid container>
                    //       <Grid item xs={12} sm={12} lg={3}>
                    //         <Typography color="textSecondary">
                    //           Pickup trip(s)
                    //         </Typography>
                    //       </Grid>

                    //       <Grid item xs={12} sm={12} lg={9}>
                    //         <MultiSelectComboBox
                    //           items={allTrips || []}
                    //           itemKey="tripId"
                    //           itemToStringKey="tripName"
                    //           placeholder={
                    //             selectedPickupTrips.length > 0
                    //               ? selectedPickupTrips
                    //                   .map(entry => entry.tripName)
                    //                   .join(', ')
                    //               : 'Choose trip(s)'
                    //           }
                    //           filterSize={100}
                    //           selectedItems={selectedPickupTrips}
                    //           onSelectedItemsChange={
                    //             this.handlePickupTripsChange
                    //           }
                    //           searchByFields={['tripName']}
                    //         />
                    //       </Grid>
                    //     </Grid>
                    //   </Grid>
                    //   <Grid item xs={12}>
                    //     <Grid container>
                    //       <Grid item xs={12} sm={12} lg={3}>
                    //         <Typography color="textSecondary">
                    //           Drop trip(s)
                    //         </Typography>
                    //       </Grid>
                    //       <Grid item xs={12} sm={12} lg={9}>
                    //         <MultiSelectComboBox
                    //           items={allTrips || []}
                    //           itemKey="tripId"
                    //           itemToStringKey="tripName"
                    //           placeholder={
                    //             selectedDropTrips.length > 0
                    //               ? selectedDropTrips
                    //                   .map(entry => entry.tripName)
                    //                   .join(', ')
                    //               : 'Choose trip(s)'
                    //           }
                    //           filterSize={100}
                    //           selectedItems={selectedDropTrips}
                    //           onSelectedItemsChange={
                    //             this.handleDropTripsChange
                    //           }
                    //           searchByFields={['tripName']}
                    //         />
                    //       </Grid>
                    //     </Grid>
                    //   </Grid>
                    //   <Grid item xs={12}>
                    //     <Grid container>
                    //       <Grid item xs={12} sm={12} lg={3}>
                    //         <Typography color="textSecondary">
                    //           Pickup route(s)
                    //         </Typography>
                    //       </Grid>
                    //       <Grid item xs={12} sm={12} lg={9}>
                    //         <Typography>
                    //           {this.state.selectedPickupRoute
                    //             ? this.state.selectedPickupRoute
                    //                 .map(route => route.areaName)
                    //                 .join(', ')
                    //             : 'No routes associated'}
                    //         </Typography>
                    //       </Grid>
                    //     </Grid>
                    //   </Grid>
                    //   <Grid item xs={12}>
                    //     <Grid container>
                    //       <Grid item xs={12} sm={12} lg={3}>
                    //         <Typography color="textSecondary">
                    //           Drop route(s)
                    //         </Typography>
                    //       </Grid>
                    //       <Grid item xs={12} sm={12} lg={9}>
                    //         <Typography>
                    //           {this.state.selectedDropRoute
                    //             ? this.state.selectedDropRoute
                    //                 .map(route => route.areaName)
                    //                 .join(', ')
                    //             : 'No routes associated'}
                    //         </Typography>
                    //       </Grid>
                    //     </Grid>
                    //   </Grid>

                    //   {this.state.selectedPickupRoute &&
                    //     this.state.selectedPickupRoute.id && (
                    //       <Grid item xs={12}>
                    //         <Grid container>
                    //           <Grid item xs={12} sm={12} lg={3}>
                    //             <Typography color="textSecondary">
                    //               Pickup stop
                    //             </Typography>
                    //           </Grid>

                    //           <Grid item xs={12} sm={12} lg={9}>
                    //             <ComboBox
                    //               items={this.state.aois || []}
                    //               selectedItem={this.state.selectedPickup}
                    //               onSelectedItemChange={
                    //                 this.handlePickupChange
                    //               }
                    //               placeholder="Select pickup"
                    //               isLoading={false}
                    //               itemKey="id"
                    //               itemToStringKey="areaName"
                    //             />
                    //           </Grid>
                    //         </Grid>
                    //       </Grid>
                    //     )}
                    //   {this.state.selectedDropRoute &&
                    //     this.state.selectedDropRoute.id && (
                    //       <Grid item xs={12}>
                    //         <Grid container>
                    //           <Grid item xs={12} sm={12} lg={3}>
                    //             <Typography color="textSecondary">
                    //               Drop stop
                    //             </Typography>
                    //           </Grid>
                    //           <Grid item xs={12} sm={12} lg={9}>
                    //             <ComboBox
                    //               items={this.state.aois || []}
                    //               selectedItem={this.state.selectedDrop}
                    //               onSelectedItemChange={
                    //                 this.handleDropChange
                    //               }
                    //               placeholder="Select drop"
                    //               isLoading={false}
                    //               itemKey="id"
                    //               itemToStringKey="areaName"
                    //             />
                    //           </Grid>
                    //         </Grid>
                    //       </Grid>
                    //     )}
                    // </Grid>
                    <Grid container spacing={2} style={{ paddingTop: 25 }}>
                      <Grid item xs={12}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Grid container>
                              <Grid item xs={12}>
                                <Typography
                                  color="textSecondary"
                                  variant="button"
                                >
                                  Pickup stop
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <ComboBox
                                  items={allAreas || []}
                                  selectedItem={selectedPickupArea}
                                  onSelectedItemChange={
                                    this.handlePickupAreaChange
                                  }
                                  placeholder="Select Stop"
                                  isLoading={false}
                                  itemKey="id"
                                  itemToStringKey="areaName"
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Grid container>
                              <Grid item xs={12}>
                                <Typography
                                  color="textSecondary"
                                  variant="button"
                                >
                                  Drop stop
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <ComboBox
                                  items={allAreas || []}
                                  selectedItem={selectedDropArea}
                                  onSelectedItemChange={
                                    this.handleDropAreaChange
                                  }
                                  placeholder="Select Stop"
                                  isLoading={false}
                                  itemKey="id"
                                  itemToStringKey="areaName"
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>

                        <Grid container spacing={3} style={{ paddingTop: 25 }}>
                          <Grid item xs={12}>
                            {selectedPickupArea && (
                              <Grid container>
                                <Grid item xs={12} sm={12} lg={3}>
                                  <Typography color="textSecondary">
                                    Pickup trip(s)
                                  </Typography>
                                </Grid>

                                <Grid item xs={12} sm={12} lg={9}>
                                  <MultiSelectComboBox
                                    items={allTrips || []}
                                    itemKey="tripId"
                                    itemToStringKey="tripName"
                                    placeholder={
                                      selectedPickupTrips.length > 0
                                        ? selectedPickupTrips
                                            .map((entry) => entry.tripName)
                                            .join(', ')
                                        : 'Choose trip(s)'
                                    }
                                    filterSize={100}
                                    selectedItems={selectedPickupTrips}
                                    onSelectedItemsChange={
                                      this.handlePickupTripsChange
                                    }
                                    searchByFields={['tripName']}
                                  />
                                </Grid>
                              </Grid>
                            )}
                          </Grid>
                        </Grid>

                        <Grid container spacing={2} style={{ paddingTop: 25 }}>
                          <Grid item xs={12}>
                            {selectedDropArea && (
                              <Grid container>
                                <Grid item xs={12} sm={12} lg={3}>
                                  <Typography color="textSecondary">
                                    Drop trip(s)
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} lg={9}>
                                  <MultiSelectComboBox
                                    items={allTrips || []}
                                    itemKey="tripId"
                                    itemToStringKey="tripName"
                                    placeholder={
                                      selectedDropTrips.length > 0
                                        ? selectedDropTrips
                                            .map((entry) => entry.tripName)
                                            .join(', ')
                                        : 'Choose trip(s)'
                                    }
                                    filterSize={100}
                                    selectedItems={selectedDropTrips}
                                    onSelectedItemsChange={
                                      this.handleDropTripsChange
                                    }
                                    searchByFields={['tripName']}
                                  />
                                </Grid>
                              </Grid>
                            )}
                          </Grid>
                        </Grid>

                        <Grid container spacing={3} style={{ paddingTop: 25 }}>
                          <Grid item xs={12}>
                            {selectedPickupArea && (
                              <Grid container>
                                <Grid item xs={12} sm={12} lg={3}>
                                  <Typography color="textSecondary">
                                    Pickup trip(s)
                                  </Typography>
                                </Grid>

                                <Grid item xs={12} sm={12} lg={9}>
                                  <MultiSelectComboBox
                                    items={allTrips || []}
                                    itemKey="tripId"
                                    itemToStringKey="tripName"
                                    placeholder={
                                      /* eslint-disable indent */

                                      selectedPickupTrips.length > 0
                                        ? selectedPickupTrips
                                            .map((entry) => entry.tripName)
                                            .join(', ')
                                        : 'Choose trip(s)'
                                      /* eslint-enable indent */
                                    }
                                    filterSize={100}
                                    selectedItems={selectedPickupTrips}
                                    onSelectedItemsChange={
                                      this.handlePickupTripsChange
                                    }
                                    searchByFields={['tripName']}
                                  />
                                </Grid>
                              </Grid>
                            )}
                          </Grid>
                          <Grid item xs={12}>
                            {selectedDropArea && (
                              <Grid container>
                                <Grid item xs={12} sm={12} lg={3}>
                                  <Typography color="textSecondary">
                                    Drop trip(s)
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} lg={9}>
                                  <MultiSelectComboBox
                                    items={allTrips || []}
                                    itemKey="tripId"
                                    itemToStringKey="tripName"
                                    placeholder={
                                      /* eslint-disable indent */

                                      selectedDropTrips.length > 0
                                        ? selectedDropTrips
                                            .map((entry) => entry.tripName)
                                            .join(', ')
                                        : 'Choose trip(s)'

                                      /* eslint-enable indent */
                                    }
                                    filterSize={100}
                                    selectedItems={selectedDropTrips}
                                    onSelectedItemsChange={
                                      this.handleDropTripsChange
                                    }
                                    searchByFields={['tripName']}
                                  />
                                </Grid>
                              </Grid>
                            )}
                          </Grid>
                          <Grid item xs={12}>
                            {selectedPickupArea && (
                              <Grid container>
                                <Grid item xs={12} sm={12} lg={3}>
                                  <Typography color="textSecondary">
                                    Pickup route(s)
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} lg={9}>
                                  <Typography>
                                    {
                                      /* eslint-disable indent */

                                      this.state.selectedPickupRoute
                                        ? this.state.selectedPickupRoute
                                            .map((route) => route.areaName)
                                            .join(', ')
                                        : 'No routes associated'
                                      /* eslint-enable indent */
                                    }
                                  </Typography>
                                </Grid>
                              </Grid>
                            )}
                          </Grid>
                          <Grid item xs={12}>
                            {selectedDropArea && (
                              <Grid container>
                                <Grid item xs={12} sm={12} lg={3}>
                                  <Typography color="textSecondary">
                                    Drop route(s)
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} lg={9}>
                                  <Typography>
                                    {
                                      /* eslint-disable indent */

                                      this.state.selectedDropRoute
                                        ? this.state.selectedDropRoute
                                            .map((route) => route.areaName)
                                            .join(', ')
                                        : 'No routes associated'
                                    }
                                  </Typography>
                                </Grid>
                              </Grid>
                            )}
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  )}
                  <br />
                </Grid>
                <Grid item xs={12}>
                  <br />
                </Grid>
                <Grid item xs={6}>
                  <ColorButton
                    color="primary"
                    variant="contained"
                    size="large"
                    onClick={this.submitForm}
                  >
                    {this.addStudent === false ? (
                      <div> Save</div>
                    ) : (
                      <div> Add</div>
                    )}
                  </ColorButton>
                </Grid>
                <Grid item xs={6}>
                  <ColorButton
                    component={Link}
                    color="default"
                    variant="contained"
                    size="large"
                    to="/home/manage-students"
                  >
                    Cancel
                  </ColorButton>
                </Grid>
              </form>
            </Grid>
          </Grid>
        </Grid>
      </div>
      //   )}
      // </Mutation>
    )
  }
}

const withApolloClient = (Component) => (props) => (
  <ApolloConsumer>
    {(client) => <Component client={client} {...props} />}
  </ApolloConsumer>
)

export default withStyles(styles)(
  withApolloClient(withSharedSnackbar(AddEditStudent))
)
