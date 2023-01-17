function calcAngleDegrees(x, y) {
  return (Math.atan2(y, x) * 180) / Math.PI
}

export default function(fromLat, fromLng, toLat, toLng) {
  return calcAngleDegrees(toLat - fromLat, toLng - fromLng)
}
