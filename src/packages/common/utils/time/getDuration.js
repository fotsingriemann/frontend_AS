/**
 * @module utils/time/getDuration
 * @summary This module exports the `getDuration` function
 */

import moment from 'moment'
import getMomentFromUnix from './getMomentFromUnix'
/* eslint-disable new-cap, indent */

/**
 * Converts the timetstamp to a humanized duration string, relative to
 * the current time. Eg.: 'a few seconds', '5 minutes', etc.
 * @param {string} timestamp The timestamp to be formatted
 * @returns {string} The relative time as a string
 * @summary Converts a timestamp to a relative duration string
 */
function getDuration(timestamp) {
  return moment
    .duration(new moment().diff(getMomentFromUnix(timestamp)))
    .humanize()
}

export default getDuration
/* eslint-disable new-cap, indent */
