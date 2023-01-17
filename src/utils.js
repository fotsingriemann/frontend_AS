/**
 * Generic helper functions
 * @module utils
 * @summary Helper utility methods
 */

import jwtDecode from 'jwt-decode'
import { setItem } from './storage.js'

/**
 * @summary Parses the url for query parameters
 * @returns {object} The object containing all query param key-value pairs
 */
function getQueryParams() {
  const url = window.location.href
  const queryParams = url.split('?')[1]
  const params = queryParams ? queryParams.split('&') : []

  const paramsObject = {}

  for (const param of params) {
    const [key, val] = param.split('=')
    paramsObject[key] = val
  }

  return paramsObject
}

/**
 * Checks if the url contains a token in query params & returns the token or error
 * @summary Check if token is present in query params
 * @returns {string|error} Token or error
 */
function checkTokeninQueryParams(params) {
  return params.token ? params.token : false
}

/**
 * Checks if token is present in URL query parameter, ans stores the credentials
 * in sessionStorage
 * @summary Checks if the link is a demo link
 */
export async function checkTokenAuth() {
  const params = getQueryParams()

  const token = checkTokeninQueryParams(params)

  const isDemo = Boolean(params.demo)

  if (token) {
    try {
      const payload = jwtDecode(token)
      const loginId = payload.loginId
      const username = payload.username
      setItem('loginId', loginId, 'TEMPORARY')
      setItem('username', username, 'TEMPORARY')
      setItem('token', token, 'TEMPORARY')
      setItem('loginType', 'TOKEN', 'TEMPORARY')

      if (isDemo) {
        setItem('isDemo', 'true', 'TEMPORARY')
      }

      window.location.replace(window.location.href.split('?')[0])
    } catch (e) {}
  }
}
