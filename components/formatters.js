const config = require('../config.json')
const mapUtils = require('./map-utils')

exports.metersToFeet = meters => meters * 3.28084
exports.metersToMiles = meters => meters * 0.000621371

function hoursToMinutes(hours) {
  return hours * 60
}

exports.formatTime = miles => {
  const lowEstimate = miles / config.highBikeSpeedMph
  const highEstimate = miles / config.lowBikeSpeedMph

  let formattedTime
  if (highEstimate < 1) {
    formattedTime = `${hoursToMinutes(lowEstimate).toFixed()} to ${hoursToMinutes(highEstimate).toFixed()} min`
  } else {
    formattedTime = `${lowEstimate.toFixed(1)} to ${highEstimate.toFixed(1)} hours`
  }

  return formattedTime
}

exports.formatDistance = distance => distance.toFixed(1)

exports.getElevationGain = profile => {
  let totalElevGain = 0;
  profile.forEach((p, idx) => {
    if (idx < profile.length - 1 && profile[idx][1] < profile[idx + 1][1]) {
      totalElevGain += profile[idx + 1][1] - profile[idx][1]
    }
  })

  return totalElevGain
}

exports.formatElevation = elevation => {
  return `${exports.metersToFeet(elevation).toFixed()} ft`
}

exports.formatAddressLines = address => {
  if (!address) {
    return ''
  }
  const addressComponents = address.split(',')
  return addressComponents[0]
}
