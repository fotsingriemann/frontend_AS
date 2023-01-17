/**
 * @module root/index
 * @summary This module exports a Root component that implement client side routing
 */
import React from 'react'
import { Switch, BrowserRouter, Redirect } from 'react-router-dom'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import { CssBaseline } from '@material-ui/core'
import MomentUtils from '@date-io/moment'
import { PrivateRoute, PublicRoute } from '@zeliot/common/router'
import DomainConfigError from '@zeliot/common/root/DomainConfigError'
import landingPagesConfig from 'config/whiteLabelLandingPages'
import QueryPages from './AppShell/QueryPages'

/**
 * Root component sets up `MuiPickersUtilsProvider` && `CssBaseline` and
 * also sets up React router with public & private routes
 * @param {object} props The react props passed to this component
 * @summary Root component that initialises client side routing
 */
function Root(props) {
  const { customPage, customPageId, page } = props

  let LandingPage

  if (customPage) {
    try {
      LandingPage = landingPagesConfig[customPageId].component
    } catch (e) {
      LandingPage = DomainConfigError
    }
  } else {
    LandingPage = landingPagesConfig.AQUILATRACK.component
  }

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <CssBaseline />

      <BrowserRouter>
        <Switch>
          <PublicRoute
            exact
            path="/"
            render={() => <LandingPage {...page} />}
          />

          <PrivateRoute path="/home" render={() => <QueryPages />} />

          <Redirect
            to={{
              pathname: '/'
            }}
          />
        </Switch>
      </BrowserRouter>
    </MuiPickersUtilsProvider>
  )
}

export default Root
