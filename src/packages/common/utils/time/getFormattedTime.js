/**
 * @module utils/time/getFormattedTime
 * @summary This module exports the `getFormattedTime` function
 */

import getMomentFromUnix from './getMomentFromUnix'
import moment from 'moment'

/**
 * This function formats a timestamp into a formatted string, as specified by the format
 * @param {string} timestamp The timestamp to be formatted
 * @param {string} format A moment format string
 * @param {boolean} milis Specifies if the timestamp is in milliseconds
 * @returns {string} Formatted time
 */
function getFormattedTime(timestamp, format, milis) {
  if (milis) return moment(Number(timestamp)).format(format)
  else return getMomentFromUnix(timestamp).format(format)
}

export default getFormattedTime
