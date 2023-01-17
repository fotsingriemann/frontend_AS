/**
 * @module utils/time/getFormattedDuration
 * @summary This module exports `getFormattedDuration` fucntion
 */

import moment from 'moment'

/**
 * This function formats the seconds as a duration string.
 * Eg.: 86730 seconds becomes `1d5m30s`
 * @param {number} duration The number of seconds of the duration
 * @summary Converts seconds to a time duration string
 * @returns {string} Formatted duration
 */
function getFormattedDuration(duration) {
  const momentDuration = moment.duration(duration, 's')
  const years = momentDuration.years()
  const months = momentDuration.months()
  const days = momentDuration.days()
  const hours = momentDuration.hours()
  const minutes = momentDuration.minutes()
  const seconds = momentDuration.seconds()

  const durationArray = []

  if (years) {
    durationArray.push(`${years}y`)
  }

  if (months) {
    durationArray.push(`${months}m`)
  }

  if (days) {
    durationArray.push(`${days}d`)
  }

  if (hours) {
    durationArray.push(`${hours}h`)
  }

  if (minutes) {
    durationArray.push(`${minutes}m`)
  }

  if (seconds) {
    durationArray.push(`${seconds}s`)
  }

  if (!durationArray.length) {
    durationArray.push('0s')
  }

  return durationArray.join(' ')
}

export default getFormattedDuration
