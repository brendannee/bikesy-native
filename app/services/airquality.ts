import config from '../../config.json';

import CoordinateType from '../types/coordinate';

// Only fetch air quality info every 5 minutes
const cacheWindow = 5 * 60 * 60 * 1000;
let dataFetchTime;
let dataResults;

export const getAirQuality = async (coord: CoordinateType) => {
  if (dataFetchTime && (dataFetchTime + cacheWindow > Date.now())) {
    return dataResults;
  }

  const url = `https://bikesy.com/airquality.php?format=application/json&latitude=${coord.latitude}&longitude=${coord.longitude}&distance=5&API_KEY=${config.airNowApiKey}`;

  dataFetchTime = Date.now();

  const response = await fetch(url);

  dataResults = response.json();

  return dataResults;
};
