/**
 * @module SimpleModal
 * @summary This module exports the SimpleModal component
 */

import React from 'react'
import PropTypes from 'prop-types'
import { withStyles, Modal, Grid, TextField, Button } from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

/**
 * @summary Returns the style for the modal
 * @function
 * @returns {object} The style for the modal
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

const styles = (theme) => ({
  paper: {
    position: 'absolute',
    width: theme.spacing(50),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    flexGrow: 1,
  },
})

/**
 * @summary SimpleModal component is used to render a modal with an input and a
 * submit button
 */
class SimpleModal extends React.Component {
  /**
   * @function
   * @summary Calls the callback prop for closing the modal
   */
  handleClose = () => {
    this.props.handleModalClose(false)
  }

  /**
   * @function
   * @summary Calls the callback prop for handling input change
   */
  handleNameChange = (event) => {
    this.props.handleModalFieldNameChange(event.target.value)
  }

  /**
   * @function
   * @summary Calls the callback prop for handling save
   */
  handleSave = () => {
    this.props.saveAs()
  }

  render() {
    const { classes, modalOpen, label, placeholder } = this.props

    return (
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={modalOpen}
      >
        <div style={getModalStyle()} className={classes.paper}>
          <TextField
            id="input"
            label={label}
            placeholder={placeholder}
            className={classes.textField}
            onChange={this.handleNameChange}
            margin="normal"
          />
          <Grid container justify="space-between">
            <Grid item>
              <ColorButton
                color="primary"
                variant="contained"
                onClick={this.handleClose}
              >
                CANCEL
              </ColorButton>
            </Grid>
            <Grid item>
              <ColorButton
                color="primary"
                variant="contained"
                onClick={this.handleSave}
              >
                SAVE
              </ColorButton>
            </Grid>
          </Grid>
        </div>
      </Modal>
    )
  }
}

SimpleModal.propTypes = {
  classes: PropTypes.object.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  modalOpen: PropTypes.bool.isRequired,
}

SimpleModal.defaultProps = {
  placeholder: 'Enter name',
  label: 'Name',
}

export default withStyles(styles)(SimpleModal)
