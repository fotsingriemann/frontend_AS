/**
 * Exports functions used to store/fetch/remove items from broswer storage
 * @module storage
 * @summary Broswer storage helper methods
 */

/**
 * Sets the given key-value pair in localStorage or sessionStorage, based on storageType parameter
 * @param {string} key The key to stored in storage
 * @param {*} value The value to stored for the given key
 * @param {'TEMPORARY'|'PERMANENT'} storageType A string describing the storage to use
 * @summary Sets key-value in storage
 */
export function setItem(key, value, storageType = 'TEMPORARY') {
  if (storageType === 'PERSISTENT') {
    localStorage.setItem(key, value)
  } else {
    sessionStorage.setItem(key, value)
  }
}

/**
 * Returns the value corresponding to the given key, stored in browser storage
 * @param {string} key The key used to lookup in storage
 * @param {'TEMPORARY'|'PERMANENT'} storageType A string describing the storage to use for lookup
 * @returns {*} The value stored for the corresponding key
 * @summary Fetches value storedin storage
 */
export function getItem(key, storageType = 'TEMPORARY') {
  if (storageType === 'PERSISTENT') {
    return localStorage.getItem(key)
  } else {
    return sessionStorage.getItem(key)
  }
}

/**
 * Removes a key-value pair from storage
 * @param {string} key The key to lookup in storage & remove
 * @param {'TEMPORARY'|'PERMANENT'} storageType A string describing the storage to use for lookup
 */
export function removeItem(key, storageType = 'TEMPORARY') {
  if (storageType === 'PERSISTENT') {
    localStorage.removeItem(key)
  } else {
    sessionStorage.removeItem(key)
  }
}

/**
 * Removes all key-value pairs stored in the storage
 * @param {'TEMPORARY'|'PERMANENT'} storageType A string describing the storage to use for lookup
 * @summary Clears the storage
 */
export function clear(storageType = 'TEMPORARY') {
  if (storageType === 'PERSISTENT') {
    localStorage.clear()
  } else {
    sessionStorage.clear()
  }
}
