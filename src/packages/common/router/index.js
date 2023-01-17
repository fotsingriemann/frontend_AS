/**
 * @module router
 * @summary This module contains the PrivateRoute & PublicRoute component
 */
import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { AuthConsumer } from '@zeliot/common/auth'

/**
 * @summary A route component that alllows only authenticated user
 * @param {object} props React component props
 */
export const PrivateRoute = ({ children, ...props }) => {
  return (
    <AuthConsumer>
      {({ authStatus }) => {
        if (!authStatus) {
          return (
            <Redirect
              to={{
                pathname: '/'
              }}
            />
          )
        }

        return <Route {...props}>{children}</Route>
      }}
    </AuthConsumer>
  )
}

/**
 * @summary A route component that alllows only unauthenticated user
 * @param {object} props React component props
 */
export const PublicRoute = ({ children, ...props }) => {
  return (
    <AuthConsumer>
      {({ authStatus }) => {
        if (authStatus) {
          return (
            <Redirect
              to={{
                pathname: '/home/dashboard'
              }}
            />
          )
        }

        return <Route {...props}>{children}</Route>
      }}
    </AuthConsumer>
  )
}
