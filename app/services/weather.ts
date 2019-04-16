import config from '../../config.json';

import CoordinateType from '../types/coordinate';

// Only fetch weather info every 5 minutes
const cacheWindow = 5 * 60 * 60 * 1000;
let weatherFetchTime;
let weatherResults;

export const getWeather = async (coord: CoordinateType) => {
  if (weatherFetchTime && weatherFetchTime + cacheWindow > Date.now()) {
    return weatherResults;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coord.latitude}&lon=${coord.longitude}&units=imperial&appid=${config.openWeatherMapApiKey}`;
  weatherFetchTime = Date.now();

  const response = await fetch(url);

  weatherResults = response.json();

  return weatherResults;
};
