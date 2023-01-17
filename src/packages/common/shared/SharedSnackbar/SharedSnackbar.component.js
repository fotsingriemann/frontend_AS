/**
 * @module  SharedSnackbar.component
 * @summary This module implements the SharedSnackbar component
 */

import React from 'react'
import Close from '@material-ui/icons/Close'
import { SharedSnackbarConsumer } from './SharedSnackbar.context'

import { IconButton, Snackbar, withStyles } from '@material-ui/core'

const styles = theme => ({
  default: {},
  error: {
    background: '#F44336'
  },
  warning: {
    background: '#FFEB3B',
    color: 'black'
  },
  success: {
    background: '#4CAF50'
  },
  primary: {
    background: theme.palette.primary.main
  },
  secondary: {
    background: theme.palette.secondary.main
  }
})

/**
 * This component passes the props from the `SharedSnackbarConsumer` as relavant props
 * to the Snackbar component
 * @summary SharedSnackbar component's implementation
 * @param {object} props React component props
 */
const SharedSnackbar = ({ classes }) => (
  <SharedSnackbarConsumer>
    {({
      snackbarIsOpen,
      message,
      closeSnackbar,
      duration,
      verticalPosition,
      horizontalPosition,
      autoHide,
      type
    }) => (
      <Snackbar
        anchorOrigin={{
          vertical: verticalPosition,
          horizontal: horizontalPosition
        }}
        open={snackbarIsOpen}
        autoHideDuration={autoHide ? duration : undefined}
        onClose={closeSnackbar}
        message={message}
        action={[
          <IconButton key="close" color="inherit" onClick={closeSnackbar}>
            <Close />
          </IconButton>
        ]}
        ContentProps={{
          className: classes[type]
        }}
      />
    )}
  </SharedSnackbarConsumer>
)

export default withStyles(styles)(SharedSnackbar)
