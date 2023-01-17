/**
 * @module utils/time/getUnixString
 * @summary This module exports the `getUnixString` function
 */

import getUnixTime from './getUnixTime'

/**
 * This function converts any moment valid time object/string to an epoch string
 * @param {*} time Any moment valid time parameter
 * @param {boolean} isUnix Flag to monitor if flag is already in unix
 * @returns {string} Time as an epoch timestamp string
 */
function getUnixString(time, isUnix) {
  return getUnixTime(time, isUnix).toString()
}

export default getUnixString
