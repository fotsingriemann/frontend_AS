export function getIconSizeFromZoom(zoom, options) {
  const { square = false, sizeFactor = 1 } = options

  const dimensionRatio = square ? 1 : 0.5

  let width

  if (zoom >= 20) {
    width = 70
  } else if (zoom >= 19) {
    width = 65
  } else if (zoom >= 18) {
    width = 60
  } else if (zoom >= 17) {
    width = 55
  } else if (zoom >= 16) {
    width = 50
  } else if (zoom >= 15) {
    width = 45
  } else if (zoom >= 14) {
    width = 40
  } else if (zoom >= 13) {
    width = 35
  } else if (zoom >= 12) {
    width = 30
  } else if (zoom >= 10) {
    width = 25
  } else if (zoom >= 8) {
    width = 20
  } else if (zoom >= 6) {
    width = 15
  } else {
    width = 10
  }

  return {
    width: width * sizeFactor,
    height: width * dimensionRatio * sizeFactor
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
