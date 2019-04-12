import config from '../../config.json';

export const metersToFeet = (meters: number) => meters * 3.28084;
export const metersToMiles = (meters: number) => meters * 0.000621371;

const hoursToMinutes = (hours: number) => hours * 60;

export const formatTime = (miles: number) => {
  const lowEstimate = miles / config.highBikeSpeedMph;
  const highEstimate = miles / config.lowBikeSpeedMph;

  let formattedTime;
  if (highEstimate < 1) {
    formattedTime = `${hoursToMinutes(lowEstimate).toFixed()} to ${hoursToMinutes(highEstimate).toFixed()} min`;
  } else {
    formattedTime = `${lowEstimate.toFixed(1)} to ${highEstimate.toFixed(1)} hours`;
  }

  return formattedTime;
};

export const formatDistance = (distance: number) => distance.toFixed(1);

export const getElevationGain = (profile: number[]) => {
  let totalElevGain = 0;
  profile.forEach((p, idx) => {
    if (idx < profile.length - 1 && profile[idx][1] < profile[idx + 1][1]) {
      totalElevGain += profile[idx + 1][1] - profile[idx][1];
    }
  });

  return totalElevGain;
};

export const formatElevation = (elevation: number) => {
  return `${metersToFeet(elevation).toFixed()} ft`;
};

export const formatAddressLines = (address: string) => {
  if (!address) {
    return '';
  }

  const addressComponents = address.split(',');
  return addressComponents[0];
};
