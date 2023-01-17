/**
 * @module Drivers/AddEditDriver
 * @summary This module exports the component for Adding/Editing a Driver
 */

import React, { Component } from 'react'
import gql from 'graphql-tag'
import { Mutation, withApollo } from 'react-apollo'
import { Link } from 'react-router-dom'
import {
  Button,
  Typography,
  TextField,
  Grid,
  withStyles,
  Divider,
  Chip,
} from '@material-ui/core'
import { KeyboardBackspace as BackIcon } from '@material-ui/icons'
import { GET_ALL_VEHICLES } from '@zeliot/common/graphql/queries'
import ComboBox from '@zeliot/common/ui/ComboBox'
import getLoginId from '@zeliot/common/utils/getLoginId'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
import SearchIcon from '@material-ui/icons/SearchOutlined'
import classnames from 'classnames'
import MultiSelectComboBox from '@zeliot/common/ui/MultiSelectComboBox'
import CircularProgress from '@material-ui/core/CircularProgress'

import AsyncSelect from 'react-select/async'

import { components } from 'react-select'

const GET_DRIVER = gql`
  query driverDetail($driverId: Int!) {
    driverDetail(id: $driverId) {
      id
      driverName
      license
      rfid
      contactNumber
      vehicleNumber
      userLoginId
      clientLoginId
      vehicleId
      vehicleNumber
      uniqueDeviceId
      status
      score
      driverImage
      vehicleObject {
        vehicleNumber
        vehicleId
        uniqueDeviceId
      }
    }
  }
`

const FILTER_DRIVER = gql`
  query getDriverDetailsByDriverName($driverName: String) {
    getDriverDetailsByDriverName(driverName: $driverName) {
      success
      data {
        id
        name
        work_phone
        vehicle_id
        image
      }
    }
  }
`

const GET_VEHICLE_DETAIL = gql`
  query getVehicleDetail($vehicleNumber: String) {
    getVehicleDetail(vehicleNumber: $vehicleNumber) {
      entityId
      vehicleNumber
    }
  }
`

const UPDATE_DRIVER = gql`
  mutation(
    $id: Int!
    $driverName: String!
    $license: String!
    $rfid: String
    $contactNumber: String!
    $clientLoginId: Int
    $userLoginId: Int
    $vehicleId: Int
    $driverImage: String
    $otherDocument: String
    $status: Int!
    $vehicleIds: [Int]!
  ) {
    updateDriverDetail(
      id: $id
      driverName: $driverName
      license: $license
      rfid: $rfid
      contactNumber: $contactNumber
      clientLoginId: $clientLoginId
      userLoginId: $userLoginId
      vehicleId: $vehicleId
      driverImage: $driverImage
      otherDocument: $otherDocument
      status: $status
      vehicleIds: $vehicleIds
    )
  }
`

const ADD_DRIVER = gql`
  mutation(
    $driverName: String!
    $license: String!
    $rfid: String
    $contactNumber: String!
    $userLoginId: Int
    $clientLoginId: Int
    $vehicleId: Int
    $vehicleIds: [Int]!
    $driverImage: String
  ) {
    addDriver(
      driverName: $driverName
      license: $license
      rfid: $rfid
      contactNumber: $contactNumber
      userLoginId: $userLoginId
      clientLoginId: $clientLoginId
      vehicleId: $vehicleId
      vehicleIds: $vehicleIds
      driverImage: $driverImage
    )
  }
`

const GET_ACC_TYPE = gql`
  query loginDetail($loginId: Int) {
    loginDetail(loginId: $loginId) {
      accountType
    }
  }
`

const GET_GROUPS = gql`
  query($loginId: Int!) {
    groups: allGroupsDetails(clientLoginId: $loginId) {
      id
      name: groupName
      vehicles: assignedVehicles {
        uniqueId: uniqueDeviceId
        vehicleNumber
      }
    }
  }
`

const DropdownIndicator = (props) => {
  return (
    components.DropdownIndicator && (
      <components.DropdownIndicator {...props}>
        <div></div>
      </components.DropdownIndicator>
    )
  )
}

const ValueContainer = ({ children, ...props }) => {
  return (
    components.ValueContainer && (
      <components.ValueContainer {...props}>
        {!!children && <SearchIcon style={{ position: 'absolute', left: 7 }} />}
        {children}
      </components.ValueContainer>
    )
  )
}

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
  reportSelectorItem: {
    padding: `0 ${theme.spacing(2)} 0 0px`,
  },
  comboBoxTopMargin: {
    marginTop: theme.spacing(2),
  },
})

const customStyles = {
  control: (base, state) => ({
    ...base,
    background: '#fafafa',
    border: 0,
    borderBottom: '1px solid #A9A9A9',
    boxShadow: 'none',
    '&:hover': {
      borderColor: 'black',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    paddingLeft: 32,
  }),
  indicatorSeparator: () => {}, // removes the "stick"
}

/**
 * @summary AddEditDriver component Adds or edits a driver
 */
class AddEditDriver extends Component {
  constructor(props) {
    super(props)
    if (this.props.match.params.driverId === 'add') {
      this.addDriver = true
    } else {
      this.addDriver = false
    }
  }

  /**
   * @property {string} driverName The driver's name
   * * @property {object[]?} allDrivers The list of all drivers
   * @property {object?} selectedDriver The selected driver
   * @property {string} license The license number of the driver
   *  @property {string} rfid The rfid number of the driver
   * @property {string} contactNumber The contact number of the driver
   * @property {number?} clientLoginId The login ID of the client
   * @property {number?} userLoginId The login ID of the user
   * @property {string?} vehicleId The vehicle ID
   * @property {string?} driverImage The link to the driver's image
   * @property {string?} otherDocument The link to other document uploaded
   * @property {string} status The status of the driver
   * @property {string} vehicleNumber The vehicle number
   * @property {object[]?} allVehicles The list of all vehicles
   * @property {object?} selectedVehicle The selected vehicle
   * @property {string} driverScore The score of the driver
   * @property {string} accType The account type of the driver
   */
  state = {
    driverName: '',
    allDrivers: null,
    selectedDriver: null,
    license: '',
    rfid: '',
    contactNumber: '',
    clientLoginId: null,
    userLoginId: null,
    vehicleId: null,
    driverImage: '',
    otherDocument: '',
    status: '',
    vehicleNumber: '',
    // allVehicles: null,
    // selectedVehicle: null,
    driverScore: '',
    accType: '',
    selectedOption: '',
    disabled: false,
    vehiclesList: [],
    groupsList: [],
    vehiclesQueryStatus: 'EMPTY',
    selectedVehicles: [],
    selectedItems: [],
    isInProgress: false,
  }

  onSearchChange = (selectedOption) => {
    // if (selectedOption) {
    //   this.setState(
    //     {
    //       selectedOption
    //     },
    //     () => {
    const phoneNo = selectedOption.work_phone
    const vehicles = selectedOption.vehicle_id
    let driverName = selectedOption.value
    // driverName=driverName.replace(/[.]/g , '');
    driverName = driverName.trim()
    console.log('new driver  name is', driverName)

    // let allVehicles = null
    // this.setState({
    //   contactNumber: phoneNo,
    //   driverName: driverName
    // })
    let contactNo = null
    let disabled = false

    let image = selectedOption.driverImage
    // let driverImage=selectedOption.driverImage
    let driverImage = null

    if (phoneNo === 'false') {
      contactNo = null
    } else {
      console.log('selectedOption.work_phone', selectedOption.work_phone)
      contactNo = selectedOption.work_phone
      contactNo = contactNo.replace(/-/g, '')
      contactNo = contactNo.replace(/\s+/g, '')
      console.log('new contact numeber is', contactNo)
      disabled = true
    }

    // if (vehicles === 'undefined') {
    //   allVehicles = null
    //   // this.setState({ allVehicles: null })
    // } else {
    //   const vehicleArray = vehicles.split(';')
    //   const vehicleArrayObj = []
    //   for (let i = 0; i < vehicleArray.length; i++) {
    //     if (vehicleArray[i] !== '') {
    //       const obj = {
    //         vehicleNumber: vehicleArray[i],
    //       }
    //       vehicleArrayObj.push(obj)
    //     }
    //   }
    //   allVehicles = vehicleArrayObj
    //   // this.setState({ allVehicles: vehicleArrayObj }, () => {
    //   //   console.log('all vehicle set is', this.state.allVehicles)
    //   // })
    // }

    if (
      image === 'undefined' ||
      image === 'false' ||
      image === '' ||
      image === null ||
      image === undefined
    ) {
      driverImage = null
    } else {
      driverImage = selectedOption.driverImage
    }

    console.log('driverImage is finally is', driverImage)

    this.setState({
      contactNumber: contactNo,
      driverName: driverName,
      // allVehicles: allVehicles,
      disabled: disabled,
      selectedOption,
      driverImage: driverImage,
    })

    // }
    //   )
    // }
  }

  fetchDriverData = async (inputValue, callback) => {
    this.setState({
      driverName: '',
      license: '',
      rfid: '',
      contactNumber: '',
      vehicleId: null,
      selectedVehicle: null,
    })
    // console.log("inputValue",inputValue)

    let result = await this.props.client.query({
      query: FILTER_DRIVER,
      variables: {
        driverName: inputValue,
      },
    })
    // console.log(result)
    try {
      if (result && result.data && result.data.getDriverDetailsByDriverName) {
        const driverData = result.data.getDriverDetailsByDriverName.data
        console.log('driver data', driverData)
        const tempArray = []

        if (driverData.length) {
          driverData.forEach((element) => {
            tempArray.push({
              label: element.name.replace(/[.,]/g, ''),
              value: element.name.replace(/[.,]/g, ''),
              work_phone: element.work_phone,
              vehicle_id: element.vehicle_id,
              driverImage: element.image,
            })
          })
        }

        callback(tempArray)
      } else {
        this.props.openSnackbar('Failed to Fetch Data', { type: 'error' })
      }
    } catch (error) {
      console.log(error)
    }
    // .then((data) => {
    //   const driverData = data.data.getDriverDetailsByDriverName.data

    //   const tempArray = []
    //   if (driverData) {
    //     if (driverData.length > 0) {
    //       driverData.forEach((element) => {
    //         tempArray.push({
    //           label: `${element.name}`,
    //           value: element.name,
    //           work_phone: element.work_phone,
    //           vehicle_id: element.vehicle_id
    //         })
    //       })
    //     } else {
    //       // tempArray.push({
    //       //   label: `${driverData.name}`,
    //       //   value: driverData.name,
    //       //   work_phone:driverData.work_phone,
    //       //   vehicle_id:driverData.vehicle_id
    //       // });
    //       // tempArray = []
    //     }
    //   }
    //   callback(tempArray)
    // })
    // .catch((error) => {
    //   console.log(error, 'catch the hoop')
    // })
  }

  /**
   * @function
   * @summary Fetches the driver details for the given driver ID
   */
  getDriver = async () => {
    const { data } = await this.props.client.query({
      query: GET_DRIVER,
      variables: {
        driverId: parseInt(this.props.match.params.driverId, 10),
      },
    })
    if (data.driverDetail) {
      this.setDetails(data.driverDetail)
    } else {
      this.props.openSnackbar('Failed to Fetch Data', { type: 'error' })
    }
  }

  /**
   * @function
   * @summary Fetches all vehicles of the client
   */
  // requestAllVehicles = async () => {
  //   const fetchedVehicles = await this.props.client.query({
  //     query: GET_ALL_VEHICLES,
  //     variables: {
  //       loginId: getLoginId()
  //     }
  //   })

  //   this.setState({ allVehicles: fetchedVehicles.data.vehicles })
  // }

  /**
   * @function
   * @summary Fetches the account type of the user
   */
  getAccountType = async () => {
    const accTypeResult = await this.props.client.query({
      query: GET_ACC_TYPE,
      variables: {
        loginId: getLoginId(),
      },
    })
    // console.log("getAccountType",JSON.stringify(accTypeResult))
    if (accTypeResult.data) {
      this.setState(
        { accType: accTypeResult.data.loginDetail.accountType },
        () => {
          if (this.state.accType === 'UL') {
            this.setState({ userLoginId: getLoginId() })
          } else {
            this.setState({ clientLoginId: getLoginId() })
          }
        }
      )
    } else {
      this.props.openSnackbar('Failed to Fetch Data', { type: 'error' })
    }
  }

  /**
   * @function
   * @summary React component lifecycle called after the component mounts
   */
  componentDidMount() {
    if (this.props.match.params.driverId !== 'add') this.getDriver()

    this.getAccountType()
    this.getVehicles()
  }

  /**
   * @function
   * @summary Fetches the list of vehicles for dropdown
   */
  getVehicles = async () => {
    this.setState({ vehiclesQueryStatus: 'LOADING' })
    // const response_groups = await this.props.client.query({
    //   query: GET_GROUPS,
    //   variables: {
    //     loginId: getLoginId(),
    //   },
    // })

    // console.log('response_groups', JSON.stringify(response_groups))

    // if (response_groups.data && response_groups.data.groups) {
    // const groupsData = response_groups.data.groups
    // const groupsList = groupsData.map(({ id, name }) => ({
    //   id,
    //   name,
    //   type: 'GROUP',
    // }))

    const response = await this.props.client.query({
      query: GET_ALL_VEHICLES,
      variables: {
        loginId: getLoginId(),
      },
    })

    if (response.data && response.data.vehicles) {
      // console.log('all vehicles is', response.data.vehicles)
      const vehiclesList = response.data.vehicles.map(
        ({
          entityId,
          vehicleNumber,
          deviceDetail: { uniqueDeviceId: uniqueId },
        }) => ({
          id: entityId,
          name: vehicleNumber,
          vehcleNumber: vehicleNumber,
          uniqueId: uniqueId,
          type: 'VEHICLE',
        })
      )
      this.setState({
        vehiclesList,
        // groupsList,
        vehiclesQueryStatus: 'LOADED',
      })
    } else {
      this.setState({ vehiclesQueryStatus: 'ERROR' })
    }
    // } else {
    //   this.setState({ vehiclesQueryStatus: 'ERROR' })
    // }
  }

  /**
   * @callback
   * @param {object[]} selectedItems The new list of items selected
   * @summary Update the list of selected items and vehicles
   */
  handleSelectedItemsChange = (selectedItems) => {
    let selectedVehicles = []

    selectedItems.forEach((item) => {
      if (item.type === 'VEHICLE') {
        selectedVehicles.push(item.id)
      } else {
        const vehicleIds = this.props.groups
          .find((group) => group.id === item.id)
          .vehicles.map(({ uniqueId }) => uniqueId)

        selectedVehicles = selectedVehicles.concat(vehicleIds)
      }
    })

    this.setState(
      {
        selectedItems,
        // selectedVehicles: this.state.vehiclesList.filter((vehicle) =>
        //   selectedVehicles.includes(vehicle.id)
        // ),
        selectedVehicles,
      },
      () => {
        console.log('selectedItems', this.state.selectedItems)
        console.log('selectedVehicles', this.state.selectedVehicles)
      }
    )

    // this._checkAndResetData()
  }

  /**
   * @summary Renders the chips for selected items
   */
  renderChips = () => (
    <Grid container spacing={2}>
      {this.state.selectedItems.map((item) => (
        <Grid item key={item.id}>
          <Chip
            key={item.id}
            label={`${item.name} (${item.type})`}
            onDelete={() => this.handleChipDelete(item)}
          />
        </Grid>
      ))}
    </Grid>
  )

  /**
   * @callback
   * @summary Handles chip deletion(selected items)
   */
  handleChipDelete = (selectedItem) => {
    const selectedItems = [...this.state.selectedItems]
    let itemIndex = -1

    for (const i in selectedItems) {
      if (selectedItem.id === selectedItems[i].id) {
        itemIndex = i
        break
      }
    }
    selectedItems.splice(itemIndex, 1)
    this.handleSelectedItemsChange(selectedItems)
    this.setState({ selectedItems })
  }

  /**
   * @function
   * @param {object} driverDetail The details of the driver
   * @summary Sets the driver's details in state
   */

  setDetails = async (driverDetail) => {
    console.log('set data is', driverDetail.vehicleObject)
    // const { data } = await this.props.client.query({
    //   query: FILTER_DRIVER,
    //   variables: {
    //     driverName: driverDetail.driverName,
    //   },
    // })
    // //  console.log("get driver data",JSON.stringify(data))
    // if (data.getDriverDetailsByDriverName) {
    //   const driverData = data.getDriverDetailsByDriverName.data[0]

    // const vehicles = data.getDriverDetailsByDriverName.data[0].vehicle_id
    // let allVehicles
    // if (vehicles === 'undefined') {
    //   // this.setState({ allVehicles: null })
    //   allVehicles = null
    // } else {
    //   const vehicleArray = vehicles.split(';')

    //   const vehicleArrayObj = []
    //   for (let i = 0; i < vehicleArray.length; i++) {
    //     if (vehicleArray[i] !== '') {
    //       const obj = {
    //         vehicleNumber: vehicleArray[i],
    //       }
    //       vehicleArrayObj.push(obj)
    //     }
    //   }
    //   allVehicles = vehicleArrayObj
    //   // this.setState({ allVehicles: vehicleArrayObj }, () => {
    //   //   console.log('all vehicle set is', this.state.allVehicles)
    //   // })
    // }

    let vehicleArray = driverDetail.vehicleObject
    let selectedVehicleArray = []
    let selectedItemArray = []
    if (vehicleArray && vehicleArray.length && vehicleArray.length > 0) {
      selectedVehicleArray = vehicleArray.flatMap((obj) => obj.vehicleId)
      // {vehicleNumber: "LT 355 HT", vehicleId: 22431, uniqueDeviceId: "it_45244299877", __typename: "vehicleObject"}
      selectedItemArray = vehicleArray.map(
        ({ vehicleId, vehicleNumber, uniqueDeviceId }) => ({
          id: vehicleId,
          name: vehicleNumber,
          vehcleNumber: vehicleNumber,
          uniqueId: uniqueDeviceId,
          type: 'VEHICLE',
        })
      )
    }

    console.log('selectedVehicleArray', selectedVehicleArray)
    console.log('selectedItemArray', selectedItemArray)
    this.setState(
      {
        driverName: driverDetail.driverName,
        // selectedOption: {
        //   label: driverData.name.replace(/[.,]/g, ''),
        //   value: driverData.name.replace(/[.,]/g, ''),
        //   work_phone: driverData.work_phone,
        //   vehicle_id: driverData.vehicleNumber,
        //   driverImage: driverData.image,
        // },
        selectedOption: {
          label: driverDetail.driverName,
          value: driverDetail.driverName,
          work_phone: driverDetail.contactNumber,
          vehicle_id: driverDetail.vehicleNumber,
          driverImage: driverDetail.driverImage,
        },

        license: driverDetail.license,
        rfid: driverDetail.rfid,
        contactNumber: driverDetail.contactNumber,
        clientLoginId: driverDetail.clientLoginId,
        userLoginId: driverDetail.userLoginId,
        vehicleId: driverDetail.vehicleId,
        driverImage: driverDetail.driverImage,
        otherDocument: driverDetail.otherDocument,
        status: driverDetail.status,
        vehicleNumber: driverDetail.vehicleNumber,
        // selectedVehicle: {
        //   //  entityId: driverDetail.vehicleId,
        //   vehicleNumber: driverDetail.vehicleNumber,
        // },
        driverScore: driverDetail.score,
        selectedVehicles: selectedVehicleArray,
        selectedItems: selectedItemArray,
        // allVehicles: this.state.allVehicles,
      },
      () => {
        console.log(this.state.selectedOption)
      }
    )
    // } else {
    //   this.props.openSnackbar('Failed to Fetch Data', { type: 'error' })
    // }
  }

  /**
   * @callback
   * @summary Generic change event handler
   */
  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    })
  }

  /**
   * @callback
   * @summary Changes the selected vehicle
   */
  // handleVehicleChange = async (selectedVehicle) => {
  //   const vehicleNumber = selectedVehicle.vehicleNumber

  //   const fetchedVehicleDetail = await this.props.client.query({
  //     query: GET_VEHICLE_DETAIL,
  //     variables: {
  //       vehicleNumber: vehicleNumber,
  //     },
  //   })
  //   if (fetchedVehicleDetail.data) {
  //     if (fetchedVehicleDetail.data.getVehicleDetail === null) {
  //       this.props.openSnackbar(
  //         'Vehicle Not Present in DB ,Please select other vehicle',
  //         { type: 'warning' }
  //       )

  //       this.setState(
  //         {
  //           selectedVehicle: null,
  //         },
  //         () => {
  //           console.log('selected vehicle is ', this.state.selectedVehicle)
  //         }
  //       )

  //       this.setState({
  //         vehicleId: null,
  //       })
  //     } else {
  //       this.setState({ selectedVehicle }, () => {
  //         console.log('selected vehicle is ', this.state.selectedVehicle)
  //       })

  //       const entityId = fetchedVehicleDetail.data.getVehicleDetail.entityId

  //       this.setState({
  //         vehicleId: entityId,
  //       })
  //     }
  //   } else {
  //     this.props.openSnackbar('Failed to Fetch Data', { type: 'error' })
  //   }
  // }

  // handleDriverChange = (selectedDriver) => {
  //   this.setState({ selectedDriver })
  //   this.setState({
  //     license: selectedDriver ? selectedDriver.license : '',
  //     contactNumber: selectedDriver ? selectedDriver.contactNumber : '',
  //     allVehicles: selectedDriver ? selectedDriver.vehicles : []
  //   })
  // }

  /**
   * @function
   * @summary Validates the form
   */
  validateForm = (updateDriver) => (e) => {
    e.preventDefault()
    this.setState({
      isInProgress: true,
    })

    const nameLength = this.state.driverName.length
    const licenseLength = this.state.license.length
    const rfidLength = this.state.rfid.length
    if (nameLength < 5 || nameLength > 100) {
      // invalid name
      this.props.openSnackbar(
        'Invalid Name! Length should be between 5 and 100 characters',
        { type: 'warning' }
      )
    } else {
      // valid name
      const regex = new RegExp(/\+?\d{9,12}$/)
      if (!regex.test(this.state.contactNumber)) {
        // invalid phone
        this.props.openSnackbar(
          'Invalid Mobile Number! Length should be between 9 and 12 ',
          { type: 'warning' }
        )
      } else {
        // valid phone
        if (licenseLength < 8 || licenseLength > 32) {
          this.props.openSnackbar(
            'Invalid License Number! Should be alphanumeric between 8 and 32 characters',
            { type: 'warning' }
          )
          this.setState({ isInProgress: false })
        } else {
          // valid license
          if (rfidLength < 8 || rfidLength > 32) {
            this.props.openSnackbar(
              'Invalid RFID Number! Should be alphanumeric between 8 and 32 characters',
              { type: 'warning' }
            )
            this.setState({ isInProgress: false })
          } else {
            // valid rfid
            this.submitForm(updateDriver)
          }
        }
      }
    }
  }

  /**
   * @function
   * @summary Submits the form and adds/edits driver
   */
  submitForm = (updateDriver) => {
    //i will be having vehicle list we need to call the api to check whether that vehicle is associated with driver or no
    //if no proceed else throw error

    let variables

    if (this.addDriver) {
      variables = {
        driverName: this.state.driverName,
        license: this.state.license,
        rfid: this.state.rfid,
        contactNumber: this.state.contactNumber,
        userLoginId: this.state.userLoginId,
        clientLoginId: this.state.clientLoginId,
        vehicleId: this.state.vehicleId,
        vehicleIds: this.state.selectedVehicles,
        driverImage: this.state.driverImage,
      }
    } else {
      variables = {
        id: parseInt(this.props.match.params.driverId, 10),
        driverName: this.state.driverName,
        license: this.state.license,
        rfid: this.state.rfid,
        contactNumber: this.state.contactNumber,
        clientLoginId: this.state.clientLoginId,
        userLoginId: this.state.userLoginId,
        vehicleId: this.state.vehicleId,
        driverImage: this.state.driverImage,
        otherDocument: this.state.otherDocument,
        status: this.state.status,
        vehicleIds: this.state.selectedVehicles,
      }
    }

    updateDriver({ variables })
  }

  /**
   * @function
   * @summary Clears the form fields
   */
  clearAllFields = () => {
    this.setState({
      driverName: '',
      license: '',
      rfid: '',
      contactNumber: '',
      userLoginId: null,
      vehicleId: null,
      driverImage: null,
      otherDocument: null,
      status: null,
      selectedVehicle: null,
      driverScore: null,
      selectedVehicles: [],
      selectedItems: [],
      isInProgress: false,
    })
  }

  /**
   * @callback
   * @summary Callback called after driver is added/edited
   */
  handleSuccess = () => {
    if (this.addDriver) {
      this.props.openSnackbar('Driver added successfully', { type: 'success' })
      this.props.history.goBack()
    } else {
      this.props.openSnackbar('Driver details edited successfully', {
        type: 'success',
      })
      this.props.history.goBack()
    }
  }

  /**
   * @callback
   * @summary Callback called on error of adding/editing driver
   */
  handleError = (e) => {
    let ErrorMessage = e.message
    ErrorMessage = ErrorMessage.replace('GraphQL error:', '').trim()
    if (this.addDriver) {
      this.setState({
        isInProgress: false,
      })
      this.props.openSnackbar(ErrorMessage, { type: 'error' })
    } else {
      this.setState({
        isInProgress: false,
      })
      this.props.openSnackbar(ErrorMessage, { type: 'error' })
    }
  }

  render() {
    const { driverName, license, contactNumber, driverScore, rfid } = this.state

    const { classes } = this.props

    var image = new Image()

    return (
      <Mutation
        mutation={this.addDriver ? ADD_DRIVER : UPDATE_DRIVER}
        onCompleted={this.handleSuccess}
        onError={this.handleError}
      >
        {(updateDriver) => {
          return (
            <div className={classes.root}>
              <Grid container justify="flex-start">
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
                    {this.addDriver ? (
                      <div> Add Driver</div>
                    ) : (
                      <div> Driver Information</div>
                    )}
                  </Typography>
                  <Divider />
                </Grid>

                <Grid
                  item
                  xs={5}
                  style={{
                    marginTop: '20px',
                  }}
                >
                  {this.addDriver === true ? (
                    <AsyncSelect
                      styles={customStyles}
                      value={this.state.selectedOption}
                      loadOptions={this.fetchDriverData}
                      placeholder="Search Driver(Type Something..)"
                      onChange={(e) => {
                        this.onSearchChange(e)
                      }}
                      components={{ DropdownIndicator, ValueContainer }}
                    />
                  ) : (
                    <AsyncSelect
                      styles={customStyles}
                      value={this.state.selectedOption}
                      loadOptions={this.fetchDriverData}
                      placeholder="Search Driver(Type Something..)"
                      onChange={(e) => {
                        this.onSearchChange(e)
                      }}
                      components={{ DropdownIndicator, ValueContainer }}
                      isDisabled={true}
                    />
                  )}

                  <Grid container justify="flex-start">
                    <form
                      className={classes.container}
                      noValidate
                      autoComplete="off"
                    >
                      {this.addDriver === false ? (
                        <TextField
                          id="contactNumber"
                          label="Mobile No"
                          required
                          className={classes.textField}
                          value={contactNumber}
                          onChange={this.handleChange('contactNumber')}
                          margin="normal"
                          helperText="Mobile no between 9 to 12 digits only"
                          disabled={true}
                        />
                      ) : (
                        <TextField
                          id="contactNumber"
                          label="Mobile No"
                          required
                          className={classes.textField}
                          value={contactNumber}
                          onChange={this.handleChange('contactNumber')}
                          margin="normal"
                          helperText="Mobile no between 9 to 12 digits only"
                          // InputProps={{
                          //   readOnly: true
                          // }}
                          disabled={this.state.disabled}
                        />
                      )}
                      {/* <img src={`data:image/png;base64,${src}`}/> */}

                      <TextField
                        required
                        id="license"
                        label="License Number"
                        value={license}
                        className={classes.textField}
                        onChange={this.handleChange('license')}
                        margin="normal"
                        helperText="Alphanumeric text between 8 and 32 characters"
                      />

                      <TextField
                        required
                        id="rfid"
                        label="RFID Number"
                        value={rfid}
                        className={classes.textField}
                        onChange={this.handleChange('rfid')}
                        margin="normal"
                        helperText="Alphanumeric text between 8 and 32 characters"
                      />

                      <Grid item xs={12}>
                        <br />
                      </Grid>

                      {/* <ComboBox
                        items={this.state.allVehicles || []}
                        selectedItem={this.state.selectedVehicle}
                        onSelectedItemChange={this.handleVehicleChange}
                        placeholder="Assign Vehicle (Type Something)"
                        isLoading={false}
                        itemKey="vehicleNumber"
                        itemToStringKey="vehicleNumber"
                        filterSize={100}
                      /> */}

                      <Grid
                        item
                        xs={12}
                        className={classnames(
                          classes.reportSelectorItem,
                          classes.comboBoxTopMargin
                        )}
                      >
                        <MultiSelectComboBox
                          items={this.state.vehiclesList.concat(
                            this.state.groupsList
                          )}
                          itemKey="id"
                          itemToStringKey="name"
                          itemToLabelKey="type"
                          placeholder="Search Vehicles"
                          isLoading={
                            this.state.vehiclesQueryStatus === 'LOADING'
                          }
                          selectedItems={this.state.selectedItems}
                          onSelectedItemsChange={this.handleSelectedItemsChange}
                          searchByFields={['name']}
                          errorComponent={
                            <Grid container>
                              <Grid item xs={12}>
                                Error fetching vehicles list
                              </Grid>
                              <Grid item xs={12}>
                                <Button onClick={() => this.getVehicles()}>
                                  Retry
                                </Button>
                              </Grid>
                            </Grid>
                          }
                        />
                      </Grid>
                      <br />
                      <Grid item xs={12} style={{ marginTop: '10px' }}>
                        {this.renderChips()}
                      </Grid>

                      {!this.addDriver ? (
                        <TextField
                          required
                          id="driverScore"
                          disabled={true}
                          label="Driving Score"
                          value={
                            driverScore
                              ? driverScore.toFixed(2) + '/100'
                              : 'Not Available'
                          }
                          className={classes.textField}
                          margin="normal"
                        />
                      ) : null}

                      <Grid item xs={12}>
                        <br />
                      </Grid>

                      <Grid item xs={6}>
                        {this.state.isInProgress ? (
                          <CircularProgress />
                        ) : (
                          <ColorButton
                            color="primary"
                            variant="contained"
                            size="large"
                            onClick={this.validateForm(updateDriver)}
                          >
                            {this.addDriver === false ? (
                              <div> Save</div>
                            ) : (
                              <div> Add</div>
                            )}
                          </ColorButton>
                        )}
                      </Grid>

                      <Grid item xs={6}>
                        <Button
                          component={Link}
                          color="default"
                          size="large"
                          to="/home/manage-drivers/"
                        >
                          Cancel
                        </Button>
                      </Grid>
                    </form>
                  </Grid>
                </Grid>
              </Grid>
            </div>
          )
        }}
      </Mutation>
    )
  }
}

export default withStyles(styles)(withApollo(withSharedSnackbar(AddEditDriver)))
