/**
 * @module utils/time/getFromNow
 * @summary This module exports the `getFromNow` fucntion
 */

import getMomentFromUnix from './getMomentFromUnix'

/**
 * This function calculates the relative duration of the timestamp relative to the current time.
 * Eg.: 'a few seconds ago', 'a year ago'
 * @param {string} timestamp The timestamp for which the relative duration must be calculated
 * @returns {string} The relative duration of the timestamp fron now
 */
function getFromNow(timestamp) {
  return getMomentFromUnix(timestamp).fromNow()
}

export default getFromNow
