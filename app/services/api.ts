import _ from 'lodash';
import config from '../../config.json';
import CoordinateType from '../types/coordinate';

const scenarios = {
  '1': {
    hills: '1',
    bikeLanes: '3',
  },
  '2': {
    hills: '2',
    bikeLanes: '3',
  },
  '3': {
    hills: '3',
    bikeLanes: '3',
  },
  '4': {
    hills: '1',
    bikeLanes: '2',
  },
  '5': {
    hills: '2',
    bikeLanes: '2',
  },
  '6': {
    hills: '3',
    bikeLanes: '2',
  },
  '7': {
    hills: '1',
    bikeLanes: '1',
  },
  '8': {
    hills: '2',
    bikeLanes: '1',
  },
  '9': {
    hills: '3',
    bikeLanes: '1',
  },
};

const componentsToScenario = (components: object) => {
  return _.findKey(scenarios, scenario => _.isMatch(scenario, components));
};

export const getRoute = async (startLocation: CoordinateType, endLocation: CoordinateType, bikeLanes: string, hills: string) => {
  const scenario = componentsToScenario({ hills, bikeLanes });
  const parameters = `/?lat1=${startLocation.latitude}&lng1=${startLocation.longitude}&lat2=${endLocation.latitude}&lng2=${endLocation.longitude}&scenario=${scenario}`;
  const response = await fetch(`${config.bikeMapperApiUrl}${parameters}`);
  const route = await response.json();

  if (route.error) {
    throw new Error(route.error);
  }
  return route;
};

export const reverseGeocode = async (coordinate: CoordinateType) => {
  const parameters = `${coordinate.longitude},${coordinate.latitude}.json?types=address&access_token=${config.mapboxAccessToken}`;
  const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${parameters}`);
  const result = await response.json();

  if (!result || !result.features || !result.features.length) {
    throw new Error('No matching features found');
  }

  const address = result.features[0].place_name.replace(', United States', '');
  return address;
};

export const geocode = async (address: string) => {
  const parameters = `${address}.json?bbox=${config.boundsLeft},${config.boundsBottom},${config.boundsRight},${config.boundsTop}&access_token=${config.mapboxAccessToken}`;

  const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${parameters}`);
  const result = await response.json();

  if (!result || !result.features || !result.features.length) {
    throw new Error('No matching features found');
  }
  const coordinate = {
    latitude: result.features[0].center[1],
    longitude: result.features[0].center[0],
  };
  return coordinate;
};
