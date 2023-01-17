/**
 * Confirmation modal component
 * @module ConfirmationModal
 */

import React, { Component } from 'react'
import { withStyles, Modal, Button, Typography, Grid } from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

const styles = (theme) => ({
  paper: {
    position: 'absolute',
    width: theme.spacing(50),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
  },
  buttonContainer: {
    marginTop: 15,
  },
  button: {
    margin: theme.spacing(1),
  },
})

/**
 * Modal style
 * @function getModalStyle
 * @return {Object} Style object to place modal on center of screen
 * @summary Function to return modal style
 */
function getModalStyle() {
  const top = 50
  const left = 50

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  }
}

class ConfirmationModal extends Component {
  /**
   * @function handleClose
   * @summary Call ok handler if edit is confirmed by user
   */
  handleClose = () => {
    this.props.handleOkClose()
  }

  render() {
    const { classes, openModal, modalMessage, reason } = this.props
    return (
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={openModal}
        onClose={this.handleClose}
      >
        <div style={getModalStyle()} className={classes.paper}>
          <Typography variant="h6" id="modal-title">
            {modalMessage}
          </Typography>
          <Typography variant="subtitle1" id="simple-modal-description">
            {reason}
          </Typography>
          <Grid
            container
            justify="space-between"
            className={classes.buttonContainer}
          >
            <Grid item>
              <ColorButton
                style={styles.button}
                color="default"
                variant="contained"
                onClick={this.props.handleOkClose}
              >
                Ok
              </ColorButton>
            </Grid>
          </Grid>
        </div>
      </Modal>
    )
  }
}

export default withStyles(styles)(ConfirmationModal)
