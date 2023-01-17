import React, { Component } from 'react'
import PointTableRow from '../PointTable'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

class SavePoints extends Component {
  render() {
    return (
      <div>
        {!this.props.pointsSaved ? (
          <div>
            <Typography variant="button">
              Possible{' '}
              {this.props.isSamePickupDrop
                ? 'Pickup/Drop'
                : this.props.radioSelection === 'pickup'
                ? 'Pickup'
                : 'Drop'}{' '}
              points
            </Typography>
            <Typography color="textSecondary">
              Rename points and drag markers to readjust position
            </Typography>
          </div>
        ) : (
          <Typography variant="button">
            {this.props.isSamePickupDrop
              ? 'Pickup/Drop'
              : this.props.radioSelection === 'pickup'
              ? 'Pickup'
              : 'Drop'}{' '}
            points details
          </Typography>
        )}
        {this.props.predictedAois && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell classes={{ root: this.props.classes.customCell }}>
                  Marker Index
                </TableCell>
                <TableCell classes={{ root: this.props.classes.customCell }}>
                  Name
                </TableCell>
                <TableCell classes={{ root: this.props.classes.customCell }}>
                  # Students
                </TableCell>
                <TableCell padding="none" />
              </TableRow>
            </TableHead>
            <TableBody>
              {this.props.predictedAois.map((value, index) => {
                if (this.props.aoiNameValidation.length < 1) {
                  this.props.initAoiNameValidation()
                }
                return (
                  <PointTableRow
                    key={index}
                    value={value}
                    index={index}
                    handleEdit={this.props.handleEdit}
                    handleDelete={this.props.handleDelete}
                    pointsSaved={this.props.pointsSaved}
                    aoiNameValidationChange={this.props.aoiNameValidationChange}
                  />
                )
              })}
            </TableBody>
          </Table>
        )}
        <div>
          <Button
            disabled={this.props.activeStep === 0}
            onClick={this.props.handleBack}
            className={this.props.classes.button}
          >
            Back
          </Button>
          {!this.props.pointsSaved && (
            <ColorButton
              variant="contained"
              color="default"
              className={this.props.classes.button}
              onClick={this.props.addAnotherPoint}
            >
              Add
            </ColorButton>
          )}

          {!this.props.pointsSaved ? (
            <ColorButton
              variant="contained"
              color="primary"
              className={this.props.classes.button}
              onClick={this.props.saveConfiguredPoints}
            >
              Save
            </ColorButton>
          ) : (
            <ColorButton
              variant="contained"
              color="default"
              className={this.props.classes.button}
              onClick={this.props.handleNext}
            >
              Next
            </ColorButton>
          )}
        </div>

        <Dialog
          open={this.props.open}
          onClose={this.props.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {'Save these points?'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description" />
            These points will be used to calculate most optimal route.
          </DialogContent>
          <DialogActions>
            <Button onClick={this.props.handleClose} color="default">
              Reconfigure points
            </Button>
            <Button
              onClick={this.props.handleSavePoints}
              color="primary"
              autoFocus
            >
              View route
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

export default SavePoints
