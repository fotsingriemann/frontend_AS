/**
 * @module utils/getLoginId
 * @summary Exports the `getLoginId` function
 */

import { getItem } from '../../../storage.js'

/**
 * This function fetches the value for `loginId` key from browser's
 * `localStorage` or `sessionStorage`
 * @returns The loginId of the current user
 * @summary getLoginId fetches the loginId from the browser storage
 */
function getLoginId() {
  return parseInt(
    getItem('loginId', 'PERSISTENT') || getItem('loginId', 'TEMPORARY'),
    10
  )
}

export default getLoginId
