/**
 * @module utils/time/getUnixTime
 * @summary This module exports the `getUnixTime` function
 */

import moment from 'moment'

/**
 * This function converts a time paramter to an epoch timestamp
 * @param {*} time A moment valid parameter
 * @param {boolean} isUnix Flag to monitor if timestamp passed is already unix
 * @returns {number} The unix timestamp
 *
 */
function getUnixTime(time, isUnix) {
  // if (isUnix) return moment(time).utc()
  // else return moment(time).unix()
  return moment(time).unix()
}

export default getUnixTime
