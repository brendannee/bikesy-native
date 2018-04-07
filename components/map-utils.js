const turfLength = require('@turf/length')

exports.getBounds = polyline => {
  const bounds = polyline.reduce((memo, point) => {
    if (memo.latitudeSW === null) {
      return {
        latitudeSW: point.latitude,
        longitudeSW: point.longitude,
        latitudeNE: point.latitude,
        longitudeNE: point.longitude,
      }
    }
    memo.latitudeSW = Math.min(memo.latitudeSW, point.latitude)
    memo.longitudeSW = Math.min(memo.longitudeSW, point.longitude)
    memo.latitudeNE = Math.max(memo.latitudeNE, point.latitude)
    memo.longitudeNE = Math.max(memo.longitudeNE, point.longitude)

    return memo
  }, {latitudeSW: null, longitudeSW: null, latitudeNE: null, longitudeNE: null})

  return [
    {
      latitude: bounds.latitudeSW,
      longitude: bounds.longitudeSW
    },
    {
      latitude: bounds.latitudeNE,
      longitude: bounds.longitudeNE
    }
  ]
}

exports.getDistanceMi = polyline => {
  const linestring = {
    "type": "Feature",
    "properties": {},
    "geometry": {
      "type": "LineString",
      "coordinates": polyline
    }
  }
  return turfLength.default(linestring, {units: 'miles'})
}
