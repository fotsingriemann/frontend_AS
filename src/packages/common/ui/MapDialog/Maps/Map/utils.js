export function getIconSizeFromZoom(zoom) {
  if (zoom >= 20) {
    return { width: 70, height: 35 }
  } else if (zoom >= 19) {
    return { width: 65, height: 32.5 }
  } else if (zoom >= 18) {
    return { width: 60, height: 30 }
  } else if (zoom >= 17) {
    return { width: 55, height: 27.5 }
  } else if (zoom >= 16) {
    return { width: 50, height: 25 }
  } else if (zoom >= 15) {
    return { width: 45, height: 22.5 }
  } else if (zoom >= 14) {
    return { width: 40, height: 20 }
  } else if (zoom >= 13) {
    return { width: 35, height: 17.5 }
  } else if (zoom >= 12) {
    return { width: 30, height: 15 }
  } else if (zoom >= 10) {
    return { width: 25, height: 12.5 }
  } else if (zoom >= 8) {
    return { width: 20, height: 10 }
  } else if (zoom >= 6) {
    return { width: 15, height: 7.5 }
  } else {
    return { width: 10, height: 5 }
  }
}

export function getFrameRateFromZoom(zoom) {
  let frameRate
  if (zoom >= 20) {
    frameRate = 50
  } else if (zoom >= 19) {
    frameRate = 45
  } else if (zoom >= 18) {
    frameRate = 40
  } else if (zoom >= 17) {
    frameRate = 35
  } else if (zoom >= 16) {
    frameRate = 30
  } else if (zoom >= 15) {
    frameRate = 25
  } else if (zoom >= 14) {
    frameRate = 20
  } else if (zoom >= 13) {
    frameRate = 15
  } else if (zoom >= 12) {
    frameRate = 10
  } else if (zoom >= 11) {
    frameRate = 8
  } else if (zoom >= 10) {
    frameRate = 7
  } else if (zoom >= 9) {
    frameRate = 6
  } else if (zoom >= 8) {
    frameRate = 5
  } else if (zoom >= 7) {
    frameRate = 4
  } else if (zoom >= 6) {
    frameRate = 3
  } else if (zoom >= 5) {
    frameRate = 2
  } else {
    frameRate = 1
  }
  return frameRate
}
