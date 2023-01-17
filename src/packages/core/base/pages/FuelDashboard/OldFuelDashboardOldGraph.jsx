import React, { Component, Fragment } from 'react'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
// import FuelModule from '@zeliot/core/base/modules/FuelModule'
import ComboBox from '@zeliot/common/ui/ComboBox'
import { GET_ALL_VEHICLES } from '@zeliot/common/graphql/queries'
import getLoginId from '@zeliot/common/utils/getLoginId'
import getUnixString from '@zeliot/common/utils/time/getUnixString'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import DateRangeIcon from '@material-ui/icons/DateRange'
import TimeRangeIcon from '@material-ui/icons/AccessTime'
import { DateTimePicker } from '@material-ui/pickers'
import MUIDataTable from 'mui-datatables'

import { withStyles, Grid, Typography, Divider, Button } from '@material-ui/core'
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FuelIcon from '@material-ui/icons/LocalGasStation'
import LineChart from 'recharts/es6/chart/LineChart'
import Line from 'recharts/es6/cartesian/Line'
import XAxis from 'recharts/es6/cartesian/XAxis'
import YAxis from 'recharts/es6/cartesian/YAxis'
import CartesianGrid from 'recharts/es6/cartesian/CartesianGrid'
import Tooltip from 'recharts/es6/component/Tooltip'
import ResponsiveContainer from 'recharts/es6/component/ResponsiveContainer'
import { THEME_MAIN_COLORS as COLOR_RANGE } from '@zeliot/common/constants/styles'
import WidgetCard from '@zeliot/common/ui/WidgetCard'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'

import { CircularProgress, Paper } from '@material-ui/core'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

const style = theme => ({
	root: {
		padding: theme.spacing(3),
		height: '100%'
	},
	textCenter: {
		textAlign: 'center'
	},
	descriptionBox: {
		textAlign: 'center',
		padding: theme.spacing(6)
	},
	paper: {
		padding: '6px',
		height: '113px',
		elevation: 2
	}
})

//Query for fuel level
const GET_FUEL_DATA_FOR_GRAPH = gql`
query($vehicleNo:String,$from:Int,$to:Int){
	getVehicleFuelLevel(vehicleNo: $vehicleNo, from: $from, to: $to) {
    values{
      timeStamp
      smoothFuelLevel
      rawFuelLevel
    }
	}
}
`


//Query to get fuel statics of vehicle

const FUEL_STAT = gql`
query getVehicleFuelStatistics($veh:[String!]!, $from: Int, $to: Int)

{
  getVehicleFuelStatistics(vehicleNo:$veh,from:$from,to:$to)
  {
    draining
    refuelling
    fuelConsumption
  }
}
`


// Query to get vehicel fuel data
const GET_FUEL_DATA_FOR_VEHICLE = gql`
query ($vehicleNo: String,	$from: Int, $to: Int,	$event: fuelEventType)
{
	getVehicleFuelData(vehicleNo: $vehicleNo, from: $from,	to: $to,	event: $event)
	{
	status{
	code
	message
	}
	events{
	eventType
	eventStartTimestamp
	eventStartLoc{
	latitude
	longitude
	eventAddress
	}
	startParameters
	eventEndTimestamp
	eventEndLoc{
	latitude
	longitude
	eventAddress
	}
	endParameters
	}
	}
	}
`


class FuelDashboard extends Component {
  state = {
    vehicles: null,
    selectedVehicle: null,
    reload: false,
    fromDate: null,
    toDate: null,
    submitSuccess: false,
    fuelVtime: null,
    fuelVTimeLoading: false,
    currentFuel: {
      level: '',
      ts: '',
    },
    refueling: [],
    loading: false,
    refueldata: null,
    fuelStatData: null,
    loadingRefuelData: false,
    noRefuelData: false,
    noPilferageData: false,
    pilferagedata: null,
    loadingPilferageData: false,
  }

  columns = [
    'Fuel Quantity (L)',
    'Start Time',
    'Start Location',
    'End Time',
    'End Location',
  ]

  options = {
    selectableRows: 'none',
    responsive: 'stacked',
    rowsPerPage: 5,
    // onRowClick: rowData => {
    // 	window.open('https://www.google.co.in/maps/place/' + rowData[3], '_blank')
    // }
  }

  // for mapping refuel data
  mapToArr(devices) {
    this.setState({ loadingRefuelData: false })
    var rowData = []
    var fullData = []
    let startLocationLink = ''
    let endLocationLink = ''
    devices.forEach((element) => {
      console.log(element.eventType)
      // if (element.eventType) {
      rowData = []
      startLocationLink =
        'https://www.google.co.in/maps/place/' +
        element.eventStartLoc.latitude +
        ', ' +
        element.eventStartLoc.longitude
      endLocationLink =
        'https://www.google.co.in/maps/place/' +
        element.eventEndLoc.latitude +
        ', ' +
        element.eventEndLoc.longitude
      // rowData.push(element.eventType)
      rowData.push(element.endParameters)
      rowData.push(
        getFormattedTime(element.eventStartTimestamp, 'MMM-D-YYYY hh:mm:ss A')
      )
      rowData.push(element.eventStartLoc.eventAddress)
      rowData.push(
        getFormattedTime(element.eventEndTimestamp, 'MMM-D-YYYY hh:mm:ss A')
      )
      rowData.push(element.eventEndLoc.eventAddress)

      fullData.push(rowData)
      // }
    })
    this.setState({ refueldata: fullData })
  }

  // for mapping pilferage data
  mapToArrPileferage(devices) {
    console.log('map called', devices)
    var rowData = []
    var fullData = []
    let startLocationLink = ''
    let endLocationLink = ''
    devices.forEach((element) => {
      console.log(element.eventType)
      if (element.eventType) {
        rowData = []
        startLocationLink =
          'https://www.google.co.in/maps/place/' +
          element.eventStartLoc.latitude +
          ', ' +
          element.eventStartLoc.longitude
        endLocationLink =
          'https://www.google.co.in/maps/place/' +
          element.eventEndLoc.latitude +
          ', ' +
          element.eventEndLoc.longitude
        // rowData.push(element.eventType)
        rowData.push(element.endParameters)
        rowData.push(
          getFormattedTime(element.eventStartTimestamp, 'MMM-D-YYYY hh:mm:ss A')
        )
        rowData.push(element.eventStartLoc.eventAddress)

        rowData.push(
          getFormattedTime(element.eventEndTimestamp, 'MMM-D-YYYY hh:mm:ss A')
        )
        rowData.push(element.eventEndLoc.eventAddress)


        fullData.push(rowData)
      }
    })
    this.setState({ pilferagedata: fullData, loadingPilferageData: false })
  }

  getGraphData = async () => {
    this.setState({
      noPilferageData: false,
      noRefuelData: false,
      fuelStatData: null,
    })
    const fetchedData = await this.props.client.query({
      query: GET_FUEL_DATA_FOR_GRAPH,
      variables: {
        vehicleNo: this.state.selectedVehicle.vehicleNumber,
        from: parseInt(this.getUnix(this.state.fromDate), 10),
        to: parseInt(this.getUnix(this.state.toDate), 10),
      },
    })

    if (fetchedData && fetchedData.data.getVehicleFuelLevel.values) {
      // console.log(fetchedData.data.getVehicleFuelLevel.values)
      this.getFuelVsTime(fetchedData.data.getVehicleFuelLevel.values)
    }
  }

  getFuelStat = async () => {
    this.setState({fuelVTimeLoading: true})
    console.log(this.props)
    const response = await this.props.client.query({
      query: FUEL_STAT,
      variables: {
        veh: [this.state.selectedVehicle.vehicleNumber],
        from: parseInt(this.getUnix(this.state.fromDate), 10),
        to: parseInt(this.getUnix(this.state.toDate), 10),
      },
    })

    if (response && response.data.getVehicleFuelStatistics) {
      // console.log(response.data.getVehicleFuelStatistics.data.vehicleDataList[0].fuel)
      this.setState({
        fuelStatData:
          response.data.getVehicleFuelStatistics,
          fuelVTimeLoading: false
      })
    }
  }

  getFuelVsTime = (fetchedData) => {
    // this.setState({fuelVTimeLoading: true})
    const newData = []
    fetchedData.forEach((data, index) => {
      if (index % 50 === 0) {
        if (data.smoothFuelLevel > 0) {
          newData.push({
            name: getFormattedTime(data.timeStamp, 'MMM-D-YYYY hh:mm:ss'),
            FUEL: data.smoothFuelLevel,
          })
        }
      }
    })
    this.setState({
      fuelVtime: newData,
    })
  }

  getFuelDataRefuel = async () => {
    this.setState({ loadingRefuelData: true, refueldata: null })
    const response = await this.props.client.query({
      query: GET_FUEL_DATA_FOR_VEHICLE,
      variables: {
        vehicleNo: this.state.selectedVehicle.vehicleNumber,
        from: parseInt(this.getUnix(this.state.fromDate), 10),
        to: parseInt(this.getUnix(this.state.toDate), 10),
        event: 'REFUEL',
      },
    })

    if (response.data && response.data.getVehicleFuelData) {
      this.setState({ loadingRefuelData: false })

      console.log('fuel data response', response.data.getVehicleFuelData.events)
  
        if(response.data.getVehicleFuelData.events)
          {this.mapToArr(response.data.getVehicleFuelData.events)}else {
            this.setState({ noRefuelData: true })
          }

   
   
    } 
  }

  getFuelDataPilferage = async () => {
    this.setState({ loadingPilferageData: true, pilferagedata: null })
    // this.setState({ loadingRefuelData: true })
    const response = await this.props.client.query({
      query: GET_FUEL_DATA_FOR_VEHICLE,
      variables: {
        vehicleNo: this.state.selectedVehicle.vehicleNumber,
        from: parseInt(this.getUnix(this.state.fromDate), 10),
        to: parseInt(this.getUnix(this.state.toDate), 10),
        event: 'PILFERAGE',
      },
    })

    if (response.data && response.data.getVehicleFuelData) {
      this.setState({ loadingPilferageData: false })

      // console.log('fuel data response', response.data.getVehicleFuelData.events[0])
      if (response.data.getVehicleFuelData.events) {
        this.mapToArrPileferage(response.data.getVehicleFuelData.events)
      } else {
        this.setState({ noPilferageData: true })
      }
    }
  }

  requestAllVehicles = async () => {
    const fetchedVehicles = await this.props.client.query({
      query: GET_ALL_VEHICLES,
      variables: {
        loginId: getLoginId(),
      },
    })
    this.setState({ vehicles: fetchedVehicles.data.vehicles })
  }

  componentDidMount = () => {
    this.requestAllVehicles()
  }

  handleVehicleChange = (selectedVehicle) => {
    this.setState({ selectedVehicle, reload: true })
  }

  handleResetReload = () => {
    this.setState({ reload: false })
  }

  handleDateChange = (key) => (date) => {
    this.setState({ [key]: date })
  }

  getUnix = (date) => getUnixString(date)

  onSubmit = () => {
    if (!this.state.selectedVehicle) {
      this.props.openSnackbar('Please select the vehicle')
    } else if (!this.state.fromDate || !this.state.toDate) {
      this.props.openSnackbar('Please select both the dates')
    } else {
      if (
        parseInt(this.getUnix(this.state.fromDate), 10) >
        parseInt(this.getUnix(this.state.toDate), 10)
      ) {
        this.props.openSnackbar('To date cannot be smaller than from date')
      } else {
        this.getGraphData()
        this.getFuelStat()
        this.getFuelDataRefuel()
        this.getFuelDataPilferage()
      }
    }
  }

  render() {
    const { classes } = this.props
    // const { fromDate, toDate } = this.state

    return (
      <div className={classes.root}>
        <Grid container spacing={2} alignContent="flex-start">
          <Grid item xs={12}>
            <Grid container justify="space-between" alignItems="center">
              <Grid item>
                <Typography
                  variant="h5"
                  className={classes.textLeft}
                  gutterBottom
                >
                  Fuel Dashboard
                </Typography>
              </Grid>
            </Grid>
            <Divider />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid
            item
            xs={4}
            style={{
              marginTop: '16px',
            }}
          >
            <FormControl fullWidth>
              {/* <InputLabel id="comboboxLabel">Choose the vehicle to check Fuel Data</InputLabel> */}

              <ComboBox
                items={this.state.vehicles || []}
                selectedItem={this.state.selectedVehicle}
                onSelectedItemChange={this.handleVehicleChange}
                placeholder="Choose the vehicle to check Fuel Data"
                isLoading={false}
                itemKey="entityId"
                itemToStringKey="vehicleNumber"
                filterSize={100}
              />
            </FormControl>
          </Grid>
          <Grid item xs={2}>
            <DateTimePicker
              leftArrowIcon={<ChevronLeftIcon />}
              rightArrowIcon={<ChevronRightIcon />}
              dateRangeIcon={<DateRangeIcon />}
              timeIcon={<TimeRangeIcon />}
              value={this.state.fromDate}
              onChange={this.handleDateChange('fromDate')}
              disableFuture
              label="From"
            />
          </Grid>
          <Grid item xs={3}>
            <DateTimePicker
              leftArrowIcon={<ChevronLeftIcon />}
              rightArrowIcon={<ChevronRightIcon />}
              dateRangeIcon={<DateRangeIcon />}
              timeIcon={<TimeRangeIcon />}
              value={this.state.toDate}
              onChange={this.handleDateChange('toDate')}
              disableFuture
              label="To"
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              style={{
                marginTop: '15px',
              }}
              onClick={this.onSubmit}
              variant="contained"
              color="primary"
              disabled={
                this.state.loadingPilferageData || this.state.loadingRefuelData
              }
            >
              Submit
            </Button>
          </Grid>
        </Grid>

        {/* {
					this.state.fromDate &&
					this.state.toDate &&
					this.state.selectedVehicle && ( */}
        <Grid item xs={12}>
          {/* <FuelModule
								selectedVehicle={
									this.state.selectedVehicle.vehicleNumber
								}
								reload={this.state.reload}
								resetReload={this.handleResetReload}
								from={this.getUnix(this.state.fromDate)}
								to={this.getUnix(this.state.toDate)}
							/> */}

          {this.state.fuelVTimeLoading  && (
            <Grid container justify="center" alignItems="center">
              <Grid item>
                <br />
                <br />

                <CircularProgress />
              </Grid>
            </Grid>
          )}

          <Fragment>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {this.state.fuelStatData && (
                  <Grid
                    container
                    spacing={2}
                    justify="center"
                    alignItems="center"
                  >
                    <Grid item xs={2}>
                      <Grid item align="center">
                        <Paper className={classes.paper}>
                          <Typography variant="h5">
                            {this.state.fuelStatData.fuelConsumption
                              ? (parseFloat(
                                  this.state.fuelStatData.fuelConsumption,
                                  10
                                ) / 10).toFixed(2)
                              : '0'}
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            Total Fuel Consumption (L)
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid
                        item
                        align="center"
                        style={{
                          margin: '10px 0 10px 0',
                        }}
                      >
                        <Paper className={classes.paper}>
                          <Typography variant="h5">

                          {this.state.fuelStatData.draining
                              ? (parseFloat(
                                  this.state.fuelStatData.draining,
                                  10
                                ) / 10).toFixed(2)
                              : '0'}


                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            Total Fuel Draining (L)
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item align="center">
                        <Paper className={classes.paper}>
                          <Typography variant="h5">


                          {this.state.fuelStatData.refuelling
                              ? (parseFloat(
                                  this.state.fuelStatData.refuelling,
                                  10
                                ) / 10).toFixed(2)
                              : '0'}

                            
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            Total Fuel Refueling (L)
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    <Grid item xs={10}>
                      <Card>
                        <CardContent>
                          <Grid item>
                            <Typography varaint="h6">
                              Fuel level vs Time Graph
                            </Typography>
                          </Grid>

                          <ResponsiveContainer
                            width="100%"
                            height="100%"
                            minHeight={300}
                          >
                            <LineChart
                              // width={900}
                              // height={400}
                              data={this.state.fuelVtime}
                              margin={{
                                top: 20,
                                right: 20,
                                bottom: 20,
                                left: 20,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="name"
                                name="Time"
                                label={{
                                  value: 'Time',
                                  position: 'insideBottomRight',
                                  offset: -20,
                                }}
                              />
                              <YAxis
                                dataKey="FUEL"
                                name="Fuel Level (L)"
                                type="number"
                                label={{
                                  value: 'Fuel Level (L)',
                                  angle: -90,
                                  position: 'insideLeft',
                                }}
                              />
                              <Tooltip
                                formatter={function (value, name) {
                                  console.log(value, name)
                                  return `${value} L`
                                }}
                                labelFormatter={function (value,name) {
                                  return `${value}`
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="FUEL"
                                stroke="#8884d8"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12}>
                      {this.state.loadingRefuelData && <CircularProgress />}
                      {this.state.noRefuelData ? (
                        <h3>No Refuel data available</h3>
                      ) : (
                        this.state.refueldata && (
                          <MUIDataTable
                            title="Refueling Events"
                            data={this.state.refueldata}
                            columns={this.columns}
                            options={this.options}
                          />
                        )
                      )}
                      <br />

                      {this.state.loadingPilferageData && <CircularProgress />}
                      {this.state.noPilferageData ? (
                        <h3>No pilferage data available</h3>
                      ) : (
                        this.state.pilferagedata && (
                          <MUIDataTable
                            title="Pilferage Events"
                            data={this.state.pilferagedata}
                            columns={this.columns}
                            options={this.options}
                          />
                        )
                      )}
                    </Grid>
                    {/* <Grid item xs={5} className={classes.descriptionBox} /> */}
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Fragment>
        </Grid>
        {/* )
				} */}
      </div>
    )
  }
}

export default withApollo(withStyles(style)(withSharedSnackbar(FuelDashboard)))
