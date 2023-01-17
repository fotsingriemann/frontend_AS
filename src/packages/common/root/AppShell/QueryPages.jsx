/**
 * @module root/AppShell/QueryPages
 * @summary This module exports the QueryPages component
 */
import React from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import pagesConfig from 'config/pagesConfig'
import Loadable from 'react-loadable'
import { CssBaseline, MuiThemeProvider } from '@material-ui/core'
import Loader from '@zeliot/common/ui/Loader'
import getLoginId from '@zeliot/common/utils/getLoginId'
import {
  defaultTheme,
  darkTheme,
  nonWlDefaultTheme,
  nonWlDarkTheme,
} from '@zeliot/common/constants/theme'
import { createMuiTheme } from '@material-ui/core'
import { SharedSnackbarProvider } from '@zeliot/common/shared/SharedSnackbar/SharedSnackbar.context'
import { DownloadProgressDialogProvider } from '@zeliot/common/shared/DownloadProgressDialog/DownloadProgressDialog.context'
import { setItem, getItem } from '../../../../storage.js'

/**
 * @summary Lazy loaded Appshell component
 */
const AsyncAppShell = Loadable({
  loader: () => import('./AppShell.jsx'),
  loading: () => <Loader fullscreen={true} />,
})

const GET_USER_CONFIGURATION = gql`
  query($loginId: Int!) {
    userConfiguration {
      plan
      config {
        configuration
        theme
      }
    }

    clientDetail(loginId: $loginId) {
      lat
      long
      isERP
    }

    getAllClientAds(clientLoginId: $loginId) {
      imageURL
      redirectURL
      placeOfImage
    }
  }
`

function QueryPages(props) {
  let darkThemeState = localStorage.getItem('isDarkTheme')
  let themeState = darkThemeState === 'true' ? true : false

  const [isDarkTheme, setIsDarkTheme] = React.useState(
    themeState ? themeState : false
  )

  function handleThemeChange(val) {
    localStorage.setItem('isDarkTheme', val)
    setIsDarkTheme(val)
  }

  return (
    <Query query={GET_USER_CONFIGURATION} variables={{ loginId: getLoginId() }}>
      {({ loading, error, data }) => {
        if (loading) return <Loader fullscreen={true} />
        if (error) return <div>Oops</div>

        const pages = data.userConfiguration.plan.features
          .concat([{ key: 'OBD_DASHBOARD' }])
          .map((feat) => pagesConfig[feat.key])

        const plan = data.userConfiguration.plan.name
        if (data.clientDetail.isERP) {
          setItem('isERP', isERP, 'PERSISTENT')
          const { isERP } = data.clientDetail
        }
        // setItem('plan', plan, 'PERSISTENT')
        if (
          data.userConfiguration.config.theme &&
          data.userConfiguration.config.theme.palette
        ) {
          defaultTheme.palette.primary.main =
            data.userConfiguration.config.theme.palette.primary.main
          defaultTheme.palette.primary.light =
            data.userConfiguration.config.theme.palette.secondary.main
          darkTheme.palette.primary.main =
            data.userConfiguration.config.theme.palette.primary.main
          darkTheme.palette.primary.light =
            data.userConfiguration.config.theme.palette.secondary.main

          defaultTheme.palette.secondary.main =
            data.userConfiguration.config.theme.palette.secondary.main
          defaultTheme.palette.secondary.light =
            data.userConfiguration.config.theme.palette.primary.main
          darkTheme.palette.secondary.main =
            data.userConfiguration.config.theme.palette.secondary.main
          darkTheme.palette.secondary.light =
            data.userConfiguration.config.theme.palette.primary.main

          defaultTheme.palette.link.main =
            data.userConfiguration.config.theme.palette.primary.main
          darkTheme.palette.link.main =
            data.userConfiguration.config.theme.palette.primary.main
        } else {
          console.log('no user configuration fetched')
          darkTheme.mode = nonWlDarkTheme.mode
          darkTheme.palette = nonWlDarkTheme.palette
          darkTheme.shadows = nonWlDarkTheme.shadows
          defaultTheme.mode = nonWlDefaultTheme.mode
          defaultTheme.palette = nonWlDefaultTheme.palette
        }
        setItem('plan', plan, 'PERSISTENT')

        return (
          <MuiThemeProvider
            theme={isDarkTheme ? darkTheme : createMuiTheme(defaultTheme)}
          >
            <SharedSnackbarProvider>
              <DownloadProgressDialogProvider>
                <CssBaseline />
                <AsyncAppShell
                  {...props}
                  pages={pages}
                  isDarkTheme={isDarkTheme}
                  onThemeChange={handleThemeChange}
                />
              </DownloadProgressDialogProvider>
            </SharedSnackbarProvider>
          </MuiThemeProvider>
        )
      }}
    </Query>
  )
}

export default QueryPages
