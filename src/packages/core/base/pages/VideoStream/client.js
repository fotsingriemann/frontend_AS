import ApolloClient from 'apollo-client/ApolloClient'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'

const cache = new InMemoryCache()

const httpLink = new HttpLink({
  uri: process.env.REACT_APP_VIDEO_URI
})

const client = new ApolloClient({
  link: httpLink,
  cache
})

export default client
