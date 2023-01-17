import React, { Component } from 'react'
import FilterIcon from '@material-ui/icons/FilterNone'
import CategoryIcon from '@material-ui/icons/Category'

import {
  Button,
  Radio,
  FormGroup,
  Divider,
  FormControlLabel,
  Typography,
  Grid,
  Switch,
  TextField,
  List,
  ListItem,
  ListItemIcon,
} from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

class PointConfiguration extends Component {
  render() {
    return (
      <div>
        {!this.props.isSamePickupDrop && !this.props.aoisPredictedFlag ? (
          <div>
            <Typography color="textSecondary">Route type</Typography>
            <FormGroup row>
              <FormControlLabel
                value="pickup"
                control={
                  <Radio
                    color="primary"
                    checked={this.props.radioSelection === 'pickup'}
                    onChange={this.props.handleRadioChange}
                    value="pickup"
                    aria-label="pickup"
                  />
                }
                label="Pickup"
              />
              <FormControlLabel
                value="drop"
                control={
                  <Radio
                    color="primary"
                    checked={this.props.radioSelection === 'drop'}
                    onChange={this.props.handleRadioChange}
                    value="drop"
                    aria-label="drop"
                  />
                }
                label="Drop"
              />
            </FormGroup>
          </div>
        ) : (
          <div />
        )}
        <Typography color="textSecondary">Visualization</Typography>
        <FormGroup row>
          <FormControlLabel
            value="places"
            control={
              <Switch
                color="primary"
                checked={this.props.showStudentPosition}
                onChange={this.props.onStudentVisualization}
                value="showStudentPosition"
              />
            }
            label="Show Student's position"
          />
        </FormGroup>
        <Typography color="textSecondary">Performance Parameters</Typography>
        {!this.props.aoisPredictedFlag ? (
          <TextField
            type="number"
            onChange={this.props.handleTextChange}
            placeholder="Maximum number of waypoints"
            label="Maximum number of waypoints"
            color="primary"
            value={this.props.waypointsCount}
            className={this.props.classes.textField}
          />
        ) : (
          <List component="nav" className={this.props.classes.listClass}>
            <ListItem>
              <ListItemIcon>
                <CategoryIcon />
              </ListItemIcon>
              <Grid container className={this.props.classes.gridItem}>
                <Grid item sm={7}>
                  <Typography color="textSecondary">
                    You are configuring
                  </Typography>
                </Grid>
                <Grid item sm={5} style={{ textAlign: 'right' }}>
                  <Typography>
                    {this.props.isSamePickupDrop
                      ? 'Same points for pickup and drop'
                      : this.props.radioSelection === 'pickup'
                      ? 'Pickup points'
                      : 'Drop points'}
                  </Typography>
                </Grid>
              </Grid>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <FilterIcon />
              </ListItemIcon>
              <Grid container className={this.props.classes.gridItem}>
                <Grid item sm={7}>
                  <Typography color="textSecondary">
                    Maximum waypoints
                  </Typography>
                </Grid>
                <Grid item sm={5} style={{ textAlign: 'right' }}>
                  <Typography>{this.props.waypointsCount}</Typography>
                </Grid>
              </Grid>
            </ListItem>
            <Divider />
          </List>
        )}
        <div className={this.props.classes.actionsContainer}>
          <div>
            <Button
              disabled={this.props.activeStep === 0}
              onClick={this.props.handleBack}
              className={this.props.classes.button}
            >
              Back
            </Button>
            {this.props.aoisPredictedFlag && (
              <ColorButton
                variant="contained"
                color="default"
                onClick={this.props.handleNext}
                className={this.props.classes.button}
              >
                {this.props.activeStep === this.props.steps.length - 1
                  ? 'Finish'
                  : 'Next'}
              </ColorButton>
            )}
            {!this.props.aoisPredictedFlag && (
              <ColorButton
                variant="contained"
                color="primary"
                className={this.props.classes.button}
                onClick={this.props.getPickupPoints}
              >
                Predict points
              </ColorButton>
            )}

            {this.props.aoisPredictedFlag && (
              <ColorButton
                variant="contained"
                color="default"
                className={this.props.classes.button}
                onClick={this.props.clearRoute}
              >
                Reset
              </ColorButton>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default PointConfiguration
