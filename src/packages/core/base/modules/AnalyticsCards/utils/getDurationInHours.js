import moment from 'moment'

function getDurationInHours(duration) {
  const momentDuration = moment.duration(duration, 's')
  const hours = Math.floor(momentDuration.asHours())
  const minutes = momentDuration.minutes()

  let durationArray = []

  if (hours) {
    durationArray.push(`${hours}h`)
  }

  if (minutes) {
    durationArray.push(`${minutes}m`)
  }

  if (!durationArray.length) {
    durationArray.push('0m')
  }

  return durationArray.join(' ')
}

export default getDurationInHours
