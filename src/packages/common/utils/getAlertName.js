/**
 * @param {string} alertType The type of alert
 * @returns {string} The alert name as a string
 * @summary Returns an alert name from the alert type
 */
function getAlertName(alertType) {
  switch (alertType) {
    case 'panic':
      return 'Panic'
    case 'overspeed':
      return 'Overspeed'
    case 'tow':
      return 'Towing'
    case 'fall':
      return 'Fall'
    case 'noResponse':
      return 'No Response'
    case 'ExtBatLow':
      return 'External Battery Low'
    case 'IntBatLow':
      return 'Internal Battery Low'
    case 'pullout':
      return 'Device Pullout'
    case 'geofence':
      return 'Geofence Breach'
    case 'poi':
      return 'POI'
    case 'routefence':
      return 'Routefence Breach'
    case 'scheduleMaintenance':
      return ' Schedule Maintenance'
    case 'conditionalMaintenance':
      return ' Conditional Maintenance'
    default:
      return alertType
  }
}

export default getAlertName
