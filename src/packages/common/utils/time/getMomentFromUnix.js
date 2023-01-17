/**
 * @module utils/time/getMomentFromUnix
 * @summary This module exports the `getMomentFromUnix` function
 */

import moment from 'moment'

/**
 * This function converts a timestamp string to a moment object
 * @param {string} timestamp The timestamp to be converted
 * @returns {object} The moment object
 */
function getMomentFromUnix(timestamp) {
  return moment.unix(timestamp)
}

export default getMomentFromUnix
