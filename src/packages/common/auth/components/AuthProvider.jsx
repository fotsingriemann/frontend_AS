/**
 * Implements an AuthProvider component with core authentication logic and provides authentication
 * status to other components in the react tree through consumers.
 * @module AuthProvider
 * @summary Exports an AuthProvider component
 */

import React, { Component } from 'react'
import { Provider } from '../context'
import decode from 'jwt-decode'
import { setItem, getItem, removeItem, clear } from '../../../../storage.js'
import {
  defaultTheme,
  darkTheme,
  nonWlDefaultTheme,
  nonWlDarkTheme,
} from '@zeliot/common/constants/theme'

/**
 * Checks the token stored in the browser storage, decodes it and determines if user is authenticated
 * or not based on expiry time stored in the token
 * @function
 * @returns {boolean} Whether user is authenticated or not
 * @summary Checks the broswer storage for authentication status
 */
export const isAuthenticated = () => {
  const token = getItem('token', 'PERSISTENT') || getItem('token', 'TEMPORARY')

  try {
    const { exp } = decode(token)
    const cur = Math.round(new Date().getTime() / 1000)
    if (cur - exp >= 0 || exp - cur <= 30) {
      clear('PERSISTENT')
      clear('TEMPORARY')
      return false
    }
  } catch (err) {
    return false
  }

  return true
}

/**
 * A React context provider component that handles & provides all auth logic to the entire app.
 * Provides authenticationStatus, methods to login & logout through the consumer.
 * @summary AuthProvider component provides all auth logic to other components through consumers
 */
class AuthProvider extends Component {
  /**
   * @property {boolean} authStatus State variable to store the authentication status of the app
   */
  state = {
    authStatus: isAuthenticated(),
  }

  /**
   * Sets the provided parameters in browser's storage and changes the `authStatus` state
   * @function
   * @param {object} loginParams Parameters used to login
   * @param {string} loginParams.token The token to be stored in the storage
   * @param {string} loginParams.username The username of the logged in user
   * @param {number} loginParams.loginId The loginId of the logged in user
   * @param {string} loginParams.accountType The accountType of the logged in user
   * @summary Logs the user in
   */
  login = ({ token, username, loginId, accountType }) => {
    setItem('token', token, 'PERSISTENT')
    setItem('username', username, 'PERSISTENT')
    setItem('loginId', loginId, 'PERSISTENT')
    setItem('accountType', accountType, 'PERSISTENT')
    setItem('loginType', 'PASSWORD', 'PERSISTENT')
    setItem('count', 'false', 'PERSISTENT')
    setItem('agreementDisplayed', 'false', 'PERSISTENT')
    this.setState({ authStatus: true })
  }

  /**
   * Logs out the user by removing auth related items from storage and changing the `authStatus` state
   * @function
   * @summary Logs out the user
   */
  logout = () => {
    const loginType =
      getItem('loginType', 'PERSISTENT') || getItem('loginType', 'TEMPORARY')

    if (loginType === 'PASSWORD') {
      removeItem('token', 'PERSISTENT')
      removeItem('username', 'PERSISTENT')
      removeItem('loginId', 'PERSISTENT')
      removeItem('loginType', 'PERSISTENT')
      removeItem('count')
      removeItem('agreementDisplayed')
    } else {
      removeItem('token', 'TEMPORARY')
      removeItem('username', 'TEMPORARY')
      removeItem('loginId', 'TEMPORARY')
      removeItem('loginType', 'TEMPORARY')
      removeItem('count')
      removeItem('agreementDisplayed')
    }

    // darkTheme.mode = nonWlDarkTheme.mode
    // darkTheme.palette = nonWlDarkTheme.palette
    // darkTheme.shadows = nonWlDarkTheme.shadows
    // defaultTheme.mode = nonWlDefaultTheme.mode
    // defaultTheme.palette = nonWlDefaultTheme.palette

    this.setState({ authStatus: false })
  }

  /**
   * Provides the `authStatus` state, `login` & `logout` methods to consumers through the provider value
   * @summary Renders the `React.Context` Provider
   */
  render() {
    const value = {
      ...this.state,
      login: this.login,
      logout: this.logout,
    }

    return <Provider value={value}>{this.props.children}</Provider>
  }
}

export default AuthProvider
