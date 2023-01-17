export function getTimeSuffix(value) {
  return value >= 12 ? 'PM' : 'AM'
}

export function get12HourTime(value) {
  return value > 12
    ? `${value - 12}${getTimeSuffix(value)}`
    : `${value === 0 ? 12 : value}${getTimeSuffix(value)}`
}

export function displayTime(value) {
  const initialHour = get12HourTime(Number(value))
  const finalHour = get12HourTime(Number(value) + 1)

  return `${initialHour} - ${finalHour}`
}
