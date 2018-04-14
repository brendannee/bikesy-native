const turfBBox = require('@turf/bbox')
const turfLength = require('@turf/length')

const polylineToGeoJSON = polyline => ({
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'LineString',
    coordinates: polyline
  }
})

exports.getRegion = polyline => {
  const bbox = turfBBox.default(polylineToGeoJSON(polyline))
  const paddingPercent = 0.15

  const region = {
    latitude: (bbox[2] - bbox[0]) / 2 + bbox[0],
    longitude: (bbox[3] - bbox[1]) / 2 + bbox[1],
    latitudeDelta: (bbox[2] - bbox[0]) * (1 + paddingPercent),
    longitudeDelta: (bbox[3] - bbox[1]) * (1 + paddingPercent)
  }

  return region
}

exports.getDistanceMi = polyline => {
  return turfLength.default(polylineToGeoJSON(polyline), {units: 'miles'})
}
