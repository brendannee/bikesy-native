import config from '../../config.json';

import turfBBox from '@turf/bbox';
import turfLength from '@turf/length';
import turfDistance from '@turf/distance';

interface Point {
  latitude: number;
  longitude: number;
}

interface Region {
  latitude: number;
  latitudeDelta: number;
  longitude: number;
  longitudeDelta: number;
}

const polylineToGeoJSON = (polyline: Array<[number, number]>) => ({
  geometry: {
    coordinates: polyline,
    type: 'LineString',
  },
  properties: {},
  type: 'Feature',
});

export const getRegion = (polyline: Array<[number, number]>) => {
  const bbox = turfBBox(polylineToGeoJSON(polyline));
  const paddingPercent = 0.15;

  const region = {
    latitude: (bbox[2] - bbox[0]) / 2 + bbox[0],
    latitudeDelta: (bbox[2] - bbox[0]) * (1 + paddingPercent * 3),
    longitude: (bbox[3] - bbox[1]) / 2 + bbox[1],
    longitudeDelta: (bbox[3] - bbox[1]) * (1 + paddingPercent),
  };

  return region;
};

export const getDistanceMi = (polyline: Array<[number, number]>) => {
  return turfLength(polylineToGeoJSON(polyline), { units: 'miles' });
};

export const regionContainsPoint = (region: Region, point: Point) => {
  return (
    point.latitude > region.latitude - region.latitudeDelta &&
    point.latitude < region.latitude + region.latitudeDelta &&
    point.longitude > region.longitude - region.longitudeDelta &&
    point.longitude < region.longitude + region.longitudeDelta
  );
};

export const isWithinMapBoundaries = (point: Point) => {
  return (
    point.latitude < config.boundsTop &&
    point.latitude > config.boundsBottom &&
    point.longitude > config.boundsLeft &&
    point.longitude < config.boundsRight
  );
};

export const getMapBoundariesCenter = () => {
  return {
    latitude: config.boundsBottom + (config.boundsTop - config.boundsBottom) / 2,
    longitude: config.boundsLeft + (config.boundsRight - config.boundsLeft) / 2,
  };
};

export const getMapBoundariesRadius = () => {
  const diagonalDistance = turfDistance(
    [config.boundsLeft, config.boundsTop],
    [config.boundsRight, config.boundsBottom],
    {
      units: 'meters',
    }
  );

  return diagonalDistance / 2;
};
