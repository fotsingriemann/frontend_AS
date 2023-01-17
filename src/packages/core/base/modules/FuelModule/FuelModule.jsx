import React, { Component, Fragment } from 'react'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import MUIDataTable from 'mui-datatables'
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

import { withStyles, Grid, CircularProgress, Typography, Paper } from '@material-ui/core'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

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
query getVehicleFuelStatistics($veh:[String!]!, $timeBegin: Int, $timeEnd: Int)

{
  getVehicleFuelStatistics(vehicleNo:$veh,timeBegin:$timeBegin,timeEnd:$timeEnd)
  {
    data{
      vehicleDataList{
        vehicleID
        name
        fuel{
          fuelConsumption
           delivery
           draining
           deviation
           endVolume
           maxVolume
           minVolume
          refuelling
          co2Emission
          fuelConsumptionOnMove
          startVolume
          fuelConsumptionWOMovement
          fuelConsumptionOnWorked
          fuelConsumptionOnWorkedNoMovement
           fuelConsMH
           fuelConsMHWOMovement
           fuelConsMHMovement
           fuelConsumptionOnMoveIdle
           fuelConsumptionNotMoveIdle
          dutyConsumptionMH
          normConsumptionMH
          fuelConsEx
        fuelConsDev
         deviationWorkNormIdleLoad
        }
      }
    }
  }
}
`


// Query to get vehicel fuel data
const GET_FUEL_DATA_FOR_VEHICLE = gql`
query ($vehicleNo: String,	$timeBegin: Int, $timeEnd: Int,	$event: fuelEventType)
{
	getVehicleFuelData(vehicleNo: $vehicleNo, timeBegin: $timeBegin,	timeEnd: $timeEnd,	event: $event)
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



// // Query for historic fuel data
// const GET_FUEL_DATA_HISTORIC = gql`
//   query($uniqueId: String!, $from: String!, $to: String!) {
//     getFuelDataPoints(uniqueId: $uniqueId, from: $from, to: $to) {
//       ts
//       lat
//       lng
//       fl_level
//       refuel
//     }
//   }
// `
// const GET_FUEL_DATA_CURRENT = gql`
//   query($uniqueId: String!) {
//     getFuelDataPoints(uniqueId: $uniqueId) {
//       ts
//       lat
//       lng
//       fl_level
//     }
//   }
// `

const styles = theme => ({
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

class FuelModule extends Component {
	state = {
		fuelVtime: [],
		currentFuel: {
			level: '',
			ts: ''
		},
		refueling: [],
		loading: false,
		refueldata: null,
		fuelStatData: null,
		loadingRefuelData: false,
		noRefuelData: false,
		noPilferageData: false,
		pilferagedata: null,
		loadingPilferageData: false

	}

	columns = [
		// {
		// 	name: 'Date'
		// },
		// {
		// 	name: 'Location'
		// }
		'Event Type',
		'Fuel Consumed (L)',
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

	mapToArr(devices) {
		// console.log('map called', devices)
		this.setState({ loadingRefuelData: false })
		var rowData = []
		var fullData = []
		let startLocationLink = ''
		let endLocationLink = ''
		devices.forEach(element => {
			console.log(element.eventType)
			// if (element.eventType) {
			rowData = []
			startLocationLink = 'https://www.google.co.in/maps/place/' + element.eventStartLoc.latitude + ', ' + element.eventStartLoc.longitude
			endLocationLink = 'https://www.google.co.in/maps/place/' + element.eventEndLoc.latitude + ', ' + element.eventEndLoc.longitude
			rowData.push(element.eventType)
			rowData.push(element.endParameters)
			rowData.push(getFormattedTime(element.eventStartTimestamp, 'MMM-D-YYYY hh:mm:ss A'))
			rowData.push(<a href={startLocationLink} target="_blank"> {element.eventStartLoc.eventAddress} </a>)
			rowData.push(getFormattedTime(element.eventEndTimestamp, 'MMM-D-YYYY hh:mm:ss A'))
			rowData.push(<a href={endLocationLink} target="_blank"> {element.eventEndLoc.eventAddress} </a>)

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
		devices.forEach(element => {
			console.log(element.eventType)
			if (element.eventType) {
				rowData = []
				startLocationLink = 'https://www.google.co.in/maps/place/' + element.eventStartLoc.latitude + ', ' + element.eventStartLoc.longitude
				endLocationLink = 'https://www.google.co.in/maps/place/' + element.eventEndLoc.latitude + ', ' + element.eventEndLoc.longitude
				rowData.push(element.eventType)
				rowData.push(element.endParameters)
				rowData.push(getFormattedTime(element.eventStartTimestamp, 'MMM-D-YYYY hh:mm:ss A'))
				rowData.push(<a href={startLocationLink} target="_blank"> {element.eventStartLoc.eventAddress} </a>)
				rowData.push(getFormattedTime(element.eventEndTimestamp, 'MMM-D-YYYY hh:mm:ss A'))
				rowData.push(<a href={endLocationLink} target="_blank"> {element.eventEndLoc.eventAddress} </a>)

				fullData.push(rowData)
			}
		})
		this.setState({ pilferagedata: fullData, loadingPilferageData: false })
	}

	componentDidMount = () => {
		// this.getAllFuelDataHistoric()
		this.getGraphData()
		this.getFuelStat()
		this.getFuelDataRefuel()
		this.getFuelDataPilferage()

	}

	componentDidUpdate = () => {
		if (this.props.reload) {
			this.props.resetReload()
			// this.getAllFuelDataHistoric()
			// this.getLatestFuelData()
			this.getGraphData()
			this.getFuelStat()
			this.getFuelDataRefuel()
			this.getFuelDataPilferage()

		}
	}

	getGraphData = async () => {
		this.setState({ loading: true })
		const fetchedData = await this.props.client.query({
			query: GET_FUEL_DATA_FOR_GRAPH,
			variables: {
				vehicleNo: this.props.selectedVehicle,
				from: parseInt(this.props.from, 10),
				to: parseInt(this.props.to, 10)
			}
		})

		if (fetchedData && fetchedData.data.getVehicleFuelLevel.values) {
			// console.log(fetchedData.data.getVehicleFuelLevel.values)
			this.getFuelVsTime(fetchedData.data.getVehicleFuelLevel.values)

		}

	}

	getFuelStat = async () => {
		console.log(this.props)
		const response = await this.props.client.query({
			query: FUEL_STAT,
			variables: {
				veh: [this.props.selectedVehicle],
				timeBegin: parseInt(this.props.from, 10),
				timeEnd: parseInt(this.props.to, 10)
			}
		})

		if (response && response.data.getVehicleFuelStatistics.data) {
			// console.log(response.data.getVehicleFuelStatistics.data.vehicleDataList[0].fuel)
			this.setState({ fuelStatData: response.data.getVehicleFuelStatistics.data.vehicleDataList[0].fuel })
		}
	}

	// getAllFuelDataHistoric = async () => {
	// 	this.setState({ loading: true })
	// 	const fetchedData = await this.props.client.query({
	// 		query: GET_FUEL_DATA_HISTORIC,
	// 		variables: {
	// 			uniqueId: this.props.selectedVehicle,
	// 			from: this.props.from,
	// 			to: this.props.to
	// 		}
	// 	})
	// 	this.getFuelVsTime(fetchedData)
	// 	// this.mapToArr(fetchedData.data.getFuelDataPoints)
	// 	this.setState({ loading: false })
	// }



	// getLatestFuelData = async () => {
	// 	this.setState({ loading: true })
	// 	const fetchedData = await this.props.client.query({
	// 		query: GET_FUEL_DATA_CURRENT,
	// 		variables: {
	// 			uniqueId: this.props.selectedVehicle
	// 		}
	// 	})
	// 	const newData = {
	// 		level: fetchedData.data.getFuelDataPoints[0].fl_level.toFixed(2) + 'L',
	// 		ts: getFormattedTime(
	// 			fetchedData.data.getFuelDataPoints[0].ts,
	// 			'MMM-D-YYYY'
	// 		)
	// 	}
	// 	this.setState({
	// 		currentFuel: newData
	// 	})
	// 	// this.setState({ loading: false })
	// }

	getFuelVsTime = fetchedData => {
		const newData = []
		fetchedData.forEach((data, index) => {
			if (index % 50 === 0) {
				if (data.smoothFuelLevel > 0) {
					newData.push({
						name: getFormattedTime(data.timeStamp, 'MMM-D-YYYY hh:mm:ss'),
						FUEL: data.smoothFuelLevel
					})
				}
			}
		})
		this.setState({
			fuelVtime: newData,
			loading: false

		})
	}


	getFuelDataRefuel = async () => {
		this.setState({ loadingRefuelData: true })
		const response = await this.props.client.query({
			query: GET_FUEL_DATA_FOR_VEHICLE,
			variables: {
				vehicleNo: this.props.selectedVehicle,
				timeBegin: parseInt(this.props.from, 10),
				timeEnd: parseInt(this.props.to, 10),
				event: 'REFUEL'
			}
		})

		if (response) {
			this.setState({ loadingRefuelData: false })

			// console.log('fuel data response', response.data.getVehicleFuelData.events[0])
			if (response.data.getVehicleFuelData.events.length > 0) {
				this.mapToArr(response.data.getVehicleFuelData.events)
			} else {
				this.setState({ noRefuelData: true })
			}
		}

	}

	getFuelDataPilferage = async () => {
		this.setState({ loadingPilferageData: true })
		// this.setState({ loadingRefuelData: true })
		const response = await this.props.client.query({
			query: GET_FUEL_DATA_FOR_VEHICLE,
			variables: {
				vehicleNo: this.props.selectedVehicle,
				timeBegin: parseInt(this.props.from, 10),
				timeEnd: parseInt(this.props.to, 10),
				event: 'PILFERAGE'
			}
		})

		if (response) {
			this.setState({ loadingPilferageData: false })

			// console.log('fuel data response', response.data.getVehicleFuelData.events[0])
			if (response.data.getVehicleFuelData.events.length > 0) {
				this.mapToArrPileferage(response.data.getVehicleFuelData.events)
			} else {
				this.setState({ noPilferageData: true })
			}
		}

	}

	render() {
		const { classes } = this.props
		if (this.state.loading) {
			return (
				<Grid container justify="center" alignItems="center">
					<Grid item>
						<br />
						<br />

						<CircularProgress />
					</Grid>
				</Grid>
			)
		}
		return (
			<Fragment>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						{this.state.fuelStatData != null ? (
							<Grid container spacing={2} justify="center" alignItems="center">
								<Grid item xs={2}>
									{/* <Grid container justify="space-around" alignItems="center">
										<Grid item xs={12}> */}

									<Grid item align="center">
										<Paper className={classes.paper}>
											<Typography variant="h5">
												{this.state.fuelStatData.fuelConsumption ? this.state.fuelStatData.fuelConsumption : "-"}
											</Typography>
											<Typography variant="body1"
												gutterBottom>
												Total Fuel Consumption (L)

															</Typography>

										</Paper>

									</Grid>
									<Grid item align="center" style={{
										margin: '10px 0 10px 0'
									}}>
										<Paper className={classes.paper}>
											<Typography variant="h5">
												{parseFloat(this.state.fuelStatData.draining, 10) / 10}
											</Typography>
											<Typography variant="body1"
												gutterBottom>
												Total Fuel Draining (L)
														</Typography>
										</Paper>

									</Grid>
									<Grid item align="center">
										<Paper className={classes.paper}>
											<Typography variant="h5">
												{parseFloat(this.state.fuelStatData.refuelling, 10) / 10}
											</Typography>
											<Typography variant="body1"
												gutterBottom>
												Total Fuel Refueling (L)
														</Typography>
										</Paper>

									</Grid>

									{/* </Grid>
									</Grid> */}
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
													margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
												>
													<CartesianGrid strokeDasharray="3 3" />
													<XAxis
														dataKey="name"
														name="Time"
														label={{
															value: 'Time',
															position: 'insideBottomRight',
															offset: -10
														}}
													/>
													<YAxis
														dataKey="FUEL"
														name="Fuel Level (L)"
														type="number"
														label={{
															value: 'Fuel Level (L)',
															angle: -90,
															position: 'insideLeft'
														}}
													/>
													<Tooltip
														formatter={function (value, name) {
															console.log(value, name)
															return `${value} L`;
														}}
														labelFormatter={function (value) {
															return `${value}`;
														}}
													/>
													<Line type="monotone" dataKey="FUEL" stroke="#8884d8" />
												</LineChart>
											</ResponsiveContainer>
										</CardContent>
									</Card>
								</Grid>
								{/* <Grid item xs={5} className={classes.descriptionBox}>
									<WidgetCard
										widgetTitle="Fuel Level"
										widgetValue={this.state.currentFuel.level}
										WidgetIcon={FuelIcon}
										widgetIconColor={COLOR_RANGE.red}
										isDescriptionAvailable={true}
										widgetDescription={
											'This fuel level was recorded on ' +
											this.state.currentFuel.ts
										}
									/>
								</Grid> */}
								{/* <Grid item xs={2}>
								</Grid> */}
								<Grid item xs={12}>
									{this.state.loadingRefuelData && <CircularProgress />}
									{this.state.noRefuelData ? <h3>No fuel data available</h3> :

										this.state.refueldata && (
											<MUIDataTable
												title="Refueling Events"
												data={this.state.refueldata}
												columns={this.columns}
												options={this.options}
											/>
										)

									}
									<br />

									{this.state.loadingPilferageData && <CircularProgress />}
									{this.state.noPilferageData ? <h3>No pilferage data available</h3> :
										this.state.pilferagedata && (
											<MUIDataTable
												title="Pilferage Events"
												data={this.state.pilferagedata}
												columns={this.columns}
												options={this.options}
											/>
										)}
								</Grid>
								{/* <Grid item xs={5} className={classes.descriptionBox} /> */}
							</Grid>
						) : (
								<div>
									<h2>No data found</h2>
								</div>
							)}
					</Grid>
				</Grid>
			</Fragment>
		)
	}
}

export default withApollo(withStyles(styles)(FuelModule))
