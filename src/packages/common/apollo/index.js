/**
 * @module apolloClient
 * @summary Exports a function that sets up apollo-client
 */

import ApolloClient from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { ApolloLink, split } from 'apollo-link'
import { setContext } from 'apollo-link-context'
import { getMainDefinition } from 'apollo-utilities'
import { onError } from 'apollo-link-error'
import { getItem } from '../../../storage.js'
import { isAuthenticated } from '@zeliot/common/auth/components/AuthProvider'

/**
 * Generates ApolloClient object
 * @param {Object} methods Methods integrated with ApolloCLient object
 * @param {function} methods.logout Function to logout
 */
export default function getApolloClient({ logout }) {
  const cache = new InMemoryCache()

  const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const token =
      getItem('token', 'PERSISTENT') || getItem('token', 'TEMPORARY')
    // return the headers to the context so httpLink can read them

    /* eslint-disable indent */
    return token
      ? {
          headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : ''
          }
        }
      : {
          headers: { ...headers }
        }
    /* eslint-enable indent */
  })

  const wsLink = new WebSocketLink({
    uri: process.env.REACT_APP_SERVER_WS_URI,
    options: {
      reconnect: true,
      lazy: true,
      connectionParams: () => ({
        Authorization: `Bearer ${getItem('token', 'PERSISTENT') ||
          getItem('token', 'TEMPORARY')}`
      })
    }
  })

  wsLink.subscriptionClient.onReconnecting(() => {
    const authStatus = isAuthenticated()

    if (!authStatus) {
      wsLink.subscriptionClient.unsubscribeAll()
      wsLink.subscriptionClient.close()
      logout()
    }
  })

  const httpLink = new HttpLink({
    uri: process.env.REACT_APP_SERVER_HTTP_URI
  })

  const link = split(
    // split based on operation type
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query)
      return kind === 'OperationDefinition' && operation === 'subscription'
    },
    wsLink,
    authLink.concat(httpLink)
  )

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      )
    }
    if (networkError) {
      console.log(`[Network error]: ${JSON.stringify(networkError)}`)
    }
  })

  const logoutLink = onError(({ graphQLErrors }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(error => {
        if (error.message.toLowerCase().includes('auth')) {
          logout()
        }
      })
    }
  })

  const client = new ApolloClient({
    link: ApolloLink.from([
      ...(process.env.NODE_ENV !== 'production' ? [errorLink] : []),
      logoutLink,
      link
    ]),
    cache
  })

  return client
}
