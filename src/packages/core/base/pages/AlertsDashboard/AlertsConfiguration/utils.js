/**
 * @module AlertsDashboard/AlertsConfiguration/utils
 */

/**
 * Compares if 2 objects have same values
 * @param {object} objectA The first object for comparison
 * @param {object} objectB The second object for comparison
 * @returns {boolean} True if 2 objects have same values, else false
 * @summary Validates if 2 objects have same values (shallow comparison)
 */
function compareObject(objectA, objectB) {
  if (Object.keys(objectA).length !== Object.keys(objectB).length) {
    throw new Error('Objects being compared dont have the same keys')
  } else {
    for (const key of Object.keys(objectA)) {
      if (objectA[key] !== objectB[key]) {
        return false
      }
    }
    return true
  }
}

/**
 * Compares original & modified array of objects and returns an array of only those
 * objects with atleast one value changed
 * @param {object[]} originalArray The original array of objects
 * @param {object[]} modifiedArray The array of modified objects
 * @returns {object[]} Returns subset of modifiedArray objects with actual modification
 * @summary Returns array of objects that are different by shallow comparison
 */
export function getModifiedItemsInArray(originalArray, modifiedArray) {
  if (originalArray.length !== modifiedArray.length) {
    throw new Error(
      'Length of modified array is not the same as original array'
    )
  }

  const modifiedItems = []
  const originalObject = {}

  originalArray.forEach(item => {
    originalObject[item.uniqueId] = item
  })

  const modifiedObject = {}

  modifiedArray.forEach(item => {
    modifiedObject[item.uniqueId] = item
  })

  for (const key of Object.keys(modifiedObject)) {
    if (!compareObject(modifiedObject[key], originalObject[key])) {
      modifiedItems.push(modifiedObject[key])
    }
  }
  return modifiedItems
}
