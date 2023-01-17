/**
 * Entry point file for react components
 * @module index
 */

import React from 'react'
import ReactDOM from 'react-dom'
import gql from 'graphql-tag'
import { Helmet } from 'react-helmet/es/Helmet'
import { ApolloProvider, useQuery } from 'react-apollo'
import { BrowserRouter } from 'react-router-dom'
import Root from '@zeliot/common/root'
import { AuthProvider, AuthConsumer } from '@zeliot/common/auth'
import getApolloClient from '@zeliot/common/apollo'
import Loader from '@zeliot/common/ui/Loader'
import LanguageProvider from 'packages/common/language'
import DomainConfigError from '@zeliot/common/root/DomainConfigError'

import { checkTokenAuth } from './utils'
import './index.css'

// checkTokenAuth()

/**
 * @summary Query for fetching domain configuration
 */
const GET_DOMAIN_CONFIG = gql`
  query($domain: String!) {
    domainConfiguration(domain: $domain) {
      header {
        title
        shortcutIcon
      }
      page {
        background
        title
        subtitle
        logo
        navbarConfig {
          logo
          title
        }
      }
      customPage
      customPageId
    }
  }
`

function AppWithDomainConfig() {
  const { loading, error, data } = useQuery(GET_DOMAIN_CONFIG, {
    variables: {
      domain: window.location.host,
    },
  })

  if (loading) return <Loader fullscreen={true} />

  if (error) return <DomainConfigError />

  const { domainConfiguration } = data

  return (
    <React.Fragment>
      <Helmet>
        <title>{domainConfiguration.header.title}</title>
        <link
          rel="shortcut icon"
          href={domainConfiguration.header.shortcutIcon}
        />
      </Helmet>

      <Root
        page={domainConfiguration.page}
        customPage={domainConfiguration.customPage}
        customPageId
      />
    </React.Fragment>
  )
}

function IndexComponent() {
  return (
    <AuthProvider>
      <AuthConsumer>
        {({ logout }) => (
          <BrowserRouter>
            <ApolloProvider client={getApolloClient({ logout })}>
              <LanguageProvider>
                <AppWithDomainConfig />
              </LanguageProvider>
            </ApolloProvider>
          </BrowserRouter>
        )}
      </AuthConsumer>
    </AuthProvider>
  )
}

ReactDOM.render(<IndexComponent />, document.getElementById('root'))
