import React, { Component } from 'react'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import PointConfiguration from '../PointConfiguration'
import SavePoints from '../SavePoints'
import SaveRoutes from '../SaveRoutes'

import {
  withStyles,
  Card,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@material-ui/core'

const styles = theme => ({
  chip: {
    margin: theme.spacing(1)
  },
  waypointsCard: {
    overflow: 'auto',
    height: 450
  },
  textField: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    display: 'flex',
    flexGrow: 1
  },
  gridItem: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    alignItems: 'center'
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  actionsContainer: {
    marginBottom: theme.spacing(2)
  },
  resetContainer: {
    padding: theme.spacing(3)
  },
  cardRow: {
    alignItems: 'center',
    minHeight: '48px'
  },
  customCell: {
    padding: '4px 15px 4px 10px',
    textAlign: 'center'
  }
})

let aoiNameValidation = []
let routeNameValidation = []

class Waypoints extends Component {
  state = {
    open: false
  }

  getSteps() {
    return [
      'Configure place settings',
      'Edit and save points',
      'Edit and save routes'
    ]
  }

  getStepContent(step, steps) {
    switch (step) {
      case 0:
        return (
          <PointConfiguration
            steps={steps}
            classes={this.props.classes}
            isSamePickupDrop={this.props.isSamePickupDrop}
            radioSelection={this.props.radioSelection}
            showStudentPosition={this.props.showStudentPosition}
            waypointsCount={this.props.waypointsCount}
            aoisPredictedFlag={this.props.aoisPredictedFlag}
            handleRadioChange={this.handleRadioChange}
            onStudentVisualization={this.onStudentVisualization}
            handleTextChange={this.handleTextChange}
            handleBack={this.handleBack}
            handleNext={this.handleNext}
            getPickupPoints={this.getPickupPoints}
            clearRoute={this.clearRoute}
            activeStep={this.props.activeStep}
          />
        )
      case 1:
        return (
          <SavePoints
            steps={steps}
            classes={this.props.classes}
            pointsSaved={this.props.pointsSaved}
            open={this.state.open}
            handleSavePoints={this.handleSavePoints}
            handleClose={this.handleClose}
            addAnotherPoint={this.addAnotherPoint}
            saveConfiguredPoints={this.saveConfiguredPoints}
            isSamePickupDrop={this.props.isSamePickupDrop}
            radioSelection={this.props.radioSelection}
            predictedAois={this.props.predictedAois}
            aoiNameValidation={aoiNameValidation}
            initAoiNameValidation={this.initAoiNameValidation}
            handleEdit={this.handleEdit}
            handleNext={this.handleNext}
            handleBack={this.handleSecondStepperBack}
            aoiNameValidationChange={this.aoiNameValidationChange}
            handleDelete={this.handleDelete}
          />
        )
      case 2:
        return (
          <SaveRoutes
            pointsSaved={this.props.pointsSaved}
            optimalRoutes={this.props.optimalRoutes}
            radioSelection={this.props.radioSelection}
            routeNameValidation={routeNameValidation}
            initRouteNameValidation={this.initRouteNameValidation}
            aoisPredictedFlag={this.props.aoisPredictedFlag}
            steps={steps}
            classes={this.props.classes}
            saveConfiguredRoutes={this.saveConfiguredRoutes}
            handleBack={this.handleBack}
            routeNameValidationChange={this.routeNameValidationChange}
            handleRouteEdit={this.handleRouteEdit}
            routeTableHovered={this.routeTableHovered}
          />
        )
      default:
        return 'Unknown step'
    }
  }

  routeNameValidationChange = (index, flag) => {
    routeNameValidation[index] = flag
  }

  handleRouteEdit = (value, name) => {
    if (name === '') {
      this.props.openSnackbar("Name can't be empty")
    } else {
      this.props.handleRouteNameEdit(value, name)
    }
  }

  routeTableHovered = (index, flag) => {
    this.props.onRouteTableRowHovered(index, flag)
  }

  saveConfiguredRoutes = () => {
    if (routeNameValidation.length < 1) {
      this.props.openSnackbar('Provide names to all routes before saving')
    } else {
      let i
      for (i = 0; i < routeNameValidation.length; i++) {
        if (routeNameValidation[i] === false) {
          this.props.openSnackbar('Provide names to all routes before saving')
          break
        }
      }
      if (i === routeNameValidation.length) {
        this.props.saveConfiguredRoutes()
      }
    }
  }

  handleDelete = (value, index) => {
    aoiNameValidation.splice(index, 1)
    this.props.handleDeleteAoi(value, index)
  }

  handleEdit = (value, name) => {
    if (name === '') {
      this.props.openSnackbar("Name can't be empty")
    } else {
      this.props.handleAoiNameEdit(value, name)
    }
  }

  initAoiNameValidation = () => {
    let i = 0
    for (i = 0; i < this.props.predictedAois.length; i++) {
      aoiNameValidation[i] = true
    }
  }

  initRouteNameValidation = () => {
    let i = 0
    for (i = 0; i < this.props.optimalRoutes.length; i++) {
      routeNameValidation[i] = true
    }
  }

  aoiNameValidationChange = (index, flag) => {
    aoiNameValidation[index] = flag
  }

  routeNameValidationChange = (index, flag) => {
    routeNameValidation[index] = flag
  }

  handleSavePoints = () => {
    this.setState({ open: false })
    this.handleNext()
    this.props.onSaveConfiguredPoints()
  }

  handleClose = () => {
    this.setState({ open: false })
  }

  addAnotherPoint = () => {
    if (this.props.waypointsCount === aoiNameValidation.length.toString()) {
      this.props.openSnackbar('You have configured maximum number of waypoints')
    } else {
      aoiNameValidation.push(true)
      this.props.onAddAnotherPoint()
    }
  }

  saveConfiguredPoints = () => {
    if (aoiNameValidation.length < 1) {
      this.props.openSnackbar('Provide names to all points before saving')
    } else {
      let i
      for (i = 0; i < aoiNameValidation.length; i++) {
        if (aoiNameValidation[i] === false) {
          this.props.openSnackbar('Provide names to all points before saving')
          break
        }
      }
      if (i === aoiNameValidation.length) {
        this.setState({ open: true })
      }
    }
  }

  handleRadioChange = event => {
    this.props.onSelectionChanged(event.target.value)
  }

  handleTextChange = event => {
    this.props.onWaypointsCountChange(event.target.value)
  }

  getPickupPoints = event => {
    aoiNameValidation = []
    routeNameValidation = []
    this.props.onGetPickupPoints()
  }

  onStudentVisualization = event => {
    this.props.onStudentVisualization(event.target.checked)
  }

  clearRoute = event => {
    aoiNameValidation = []
    routeNameValidation = []
    this.props.onClearRoute()
  }

  onSamePickupDropChange = event => {
    this.props.onSamePickupDrop(event.target.checked)
  }

  saveRoute = event => {
    this.props.onSaveRoute()
  }

  handleNext = () => {
    this.props.handleNext()
  }

  handleBack = () => {
    this.props.handleBack()
  }

  handleSecondStepperBack = () => {
    this.props.handleBack()
    this.initAoiNameValidation()
  }

  handleReset = () => {
    this.props.handleReset()
  }

  render() {
    const steps = this.getSteps()
    const { classes, activeStep } = this.props
    return (
      <Card square elevation={8} className={classes.waypointsCard}>
        <div>
          <Stepper
            activeStep={activeStep}
            orientation="vertical"
            nonLinear={true}
          >
            {steps.map((label, index) => {
              return (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                  <StepContent>{this.getStepContent(index, steps)}</StepContent>
                </Step>
              )
            })}
          </Stepper>
        </div>
      </Card>
    )
  }
}

export default withSharedSnackbar(withStyles(styles)(Waypoints))
