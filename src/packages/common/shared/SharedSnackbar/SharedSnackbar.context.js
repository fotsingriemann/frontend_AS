/**
 * @module shared/SharedSnackbar/SharedSnackbar.context
 * @summary This module exports a SharedSnackbar Provider
 */

import React, { Component } from 'react'
import SharedSnackbar from './SharedSnackbar.component'

/**
 * @summary A React context object to be used for sharing access to Shared snackbar
 */
const SharedSnackbarContext = React.createContext()

/**
 * Implements state, and methods to control SharedSnackbar, and gives access to these to other components
 * through context
 * @summary SharedSnackbarProvider component wraps the `SharedSnackbar` component with context,
 * to be shared by other components
 */
export class SharedSnackbarProvider extends Component {
  /**
   * @property {boolean} isOpen State variable that controls whether the snackbar is open or not
   * @property {string} message State variable for the message to be shown in snackbar
   * @property {number} duration Stores the duration for which the snackbar must be open
   * @property {string} verticalPosition Stores the vertical position of the snackbar
   * @property {string} horizontalPosition Stores the horizontal position of the snackbar
   * @property {boolean} autoHide Variable to control auto-hide feature for snackbar
   * @property {string} type The type of the snackbar
   */
  state = {
    isOpen: false,
    message: '',
    duration: 3000,
    verticalPosition: 'bottom',
    horizontalPosition: 'left',
    autoHide: true,
    type: 'default',
  }

  /**
   * @summary The default options for snackbar
   * @property {number} duration The auto-hide duration of the snackbar
   * @property {string} verticalPosition The vertical position of the snackbar
   * @property {string} horizontalPosition The horizontal position of the snackbar
   * @property {boolean} autoHide Variable to control auto-hide feature for snackbar
   * @property {string} type The type of the snackbar
   */
  defaultSnackbarOptions = {
    duration: 3000,
    verticalPosition: 'bottom',
    horizontalPosition: 'left',
    autoHide: true,
    type: 'default',
  }

  /**
   * @function
   * @param {string} message The message to be displayed in the snackbar
   * @param {object} options The options to be passed to the snackbar to control it's appearance
   * and behaviour
   * @summary Method to open the snackbar
   */
  openSnackbar = (message, options) => {
    let snackbarOptions = this.defaultSnackbarOptions

    if (options) {
      snackbarOptions = options
    }
    this.setState({
      message,
      isOpen: true,
      ...snackbarOptions,
    })
  }

  /**
   * @summary Method to close the snackbar
   */
  closeSnackbar = () =>
    this.setState({ isOpen: false, ...this.defaultSnackbarOptions })

  render() {
    const { children } = this.props

    return (
      <SharedSnackbarContext.Provider
        value={{
          openSnackbar: this.openSnackbar,
          closeSnackbar: this.closeSnackbar,
          snackbarIsOpen: this.state.isOpen,
          message: this.state.message,
          duration: this.state.duration,
          verticalPosition: this.state.verticalPosition,
          horizontalPosition: this.state.horizontalPosition,
          autoHide: this.state.autoHide,
          type: this.state.type,
        }}
      >
        <SharedSnackbar />
        {children}
      </SharedSnackbarContext.Provider>
    )
  }
}

export const SharedSnackbarConsumer = SharedSnackbarContext.Consumer
