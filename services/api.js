/* @flow */

const config = require('../config.json')

exports.getRoute = async (startLocation, endLocation, scenario) => {
  const parameters = `/?lat1=${startLocation.latitude}&lng1=${startLocation.longitude}&lat2=${endLocation.latitude}&lng2=${endLocation.longitude}&scenario=${scenario}`
  const response = await fetch(`${config.bikeMapperApiUrl}${parameters}`)
  const route = await response.json()

  if (route.error) {
    throw new Error(route.error)
  }
  return route
}

exports.reverseGeocode = async coordinate => {
  const parameters = `${coordinate.longitude},${coordinate.latitude}.json?types=address&access_token=${config.mapboxAccessToken}`
  const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${parameters}`)
  const result = await response.json()

  if (!result || !result.features || !result.features.length) {
    throw new Error('No matching features found')
  }

  const address = result.features[0].place_name.replace(', United States', '')
  return address
}

exports.geocode = async address => {
  const parameters = `${address}.json?bbox=${config.boundsLeft},${config.boundsBottom},${config.boundsRight},${config.boundsTop}&access_token=${config.mapboxAccessToken}`
  const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${parameters}`)
  const result = await response.json()

  if (!result || !result.features || !result.features.length) {
    throw new Error('No matching features found')
  }
  const coordinate = {
    latitude: result.features[0].center[1],
    longitude: result.features[0].center[0]
  }
  return coordinate
}
