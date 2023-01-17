import React, { Component } from 'react'
import RouteTableRow from '../RouteTable'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
import { Typography, Button } from '@material-ui/core'

class SaveRoutes extends Component {
  render() {
    return (
      <div>
        {this.props.pointsSaved && this.props.optimalRoutes ? (
          <div className={this.props.classes.divItem}>
            <Typography variant="button">Routing Details</Typography>
            <Typography color="textSecondary">
              Rename individual routes. Drag on map to reroute
            </Typography>
            {this.props.optimalRoutes.map((value, index) => {
              if (this.props.routeNameValidation.length < 1) {
                this.props.initRouteNameValidation()
              }
              return (
                <RouteTableRow
                  key={index}
                  value={value}
                  index={index}
                  handleRouteEdit={this.props.handleRouteEdit}
                  pointsSaved={this.props.pointsSaved}
                  routeTableHovered={this.props.routeTableHovered}
                  routeNameValidationChange={
                    this.props.routeNameValidationChange
                  }
                />
              )
            })}
          </div>
        ) : (
          <div />
        )}
        {this.props.aoisPredictedFlag && (
          <div>
            <Button
              disabled={this.props.activeStep === 0}
              onClick={this.props.handleBack}
              className={this.props.classes.button}
            >
              Back
            </Button>
            <ColorButton
              variant="contained"
              color="primary"
              className={this.props.classes.button}
              onClick={this.props.saveConfiguredRoutes}
            >
              Save routes
            </ColorButton>
          </div>
        )}
      </div>
    )
  }
}

export default SaveRoutes
