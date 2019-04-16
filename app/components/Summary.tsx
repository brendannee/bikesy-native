import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
 } from 'react-native';

 import turfMidpoint from '@turf/midpoint';

import Elevation from './Elevation';

import {
  formatDistance,
  formatElevation,
  formatTime,
  getElevationGain,
} from '../services/formatters';
import { getDistanceMi } from '../services/map-utils';
import { getWeather } from '../services/weather';
import { getAirQuality } from '../services/airquality';

interface Props {
  path: Array<[number, number]>;
  elevationProfile: Array<[number, number]>;
  startCoords: CoordinateType;
  endCoords: CoordinateType;
}

interface State {
  temperature: string;
  description: string;
  humidity: string;
  aqi: string;
  categoryNumber: number;
  categoryName: string;
  fetching: boolean;
}

export default class Summary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      fetching: false,
    };
  }

  getAQIStyle() {
    const { categoryNumber } = this.state;

    if (categoryNumber === 1) {
      return {
        backgroundColor: '#00e400',
        color: '#000000',
      };
    } else if (categoryNumber === 2) {
      return {
        backgroundColor: '#ffff00',
        color: '#000000',
      };
    } else if (categoryNumber === 3) {
      return {
        backgroundColor: '#ff7e00',
        color: '#ffffff',
      };
    } else if (categoryNumber === 4) {
      return {
        backgroundColor: '#ffff00',
        color: '#ffffff',
      };
    } else if (categoryNumber === 5) {
      return {
        backgroundColor: '#99004c',
        color: '#ffffff',
      };
    } else if (categoryNumber === 6) {
      return {
        backgroundColor: '#7e0023',
        color: '#ffffff',
      };
    }
  }

  async fetchWeather() {
    const { fetching } = this.state;

    if (!fetching) {
      const { startCoords, endCoords } = this.props;

      if (!startCoords || !endCoords) {
        return;
      }

      this.setState({ fetching: true });

      const center = turfMidpoint(
        [startCoords.longitude, startCoords.latitude],
        [endCoords.longitude, endCoords.latitude]
      );

      const coordinate = {
        latitude: center.geometry.coordinates[1],
        longitude: center.geometry.coordinates[0],
      };

      const weather = await getWeather(coordinate).catch(error => {
        // Ignore errors in fetching weather
      });

      const airquality = await getAirQuality(coordinate).catch(error => {
        // Ignore errors in fetching air quality
      });

      if (weather) {
        this.setState({
          description: weather.weather && weather.weather.length ? weather.weather[0].main : '',
          humidity: weather.main.humidity,
          temperature: Math.round(weather.main.temp * 10) / 10,
        });
      }

      if (airquality && airquality.length) {
        this.setState({
          aqi: airquality[0].AQI,
          categoryNumber: airquality[0].Category.Number,
          categoryName: airquality[0].Category.Name,
        });
      }

      this.setState({
        fetching: false,
      });
    }
  }

  componentDidMount() {
    this.fetchWeather();
  }

  componentDidUpdate(prevProps) {
    const { startCoords, endCoords } = this.props;

    if (!startCoords || !endCoords) {
      return;
    }

    if (!prevProps.startCoords ||
      !prevProps.endCoords ||
      prevProps.startCoords.latitude !== this.props.startCoords.latitude ||
      prevProps.startCoords.longitude !== this.props.startCoords.longitude ||
      prevProps.endCoords.latitude !== this.props.endCoords.latitude ||
      prevProps.endCoords.longitude !== this.props.endCoords.longitude
    ) {
      this.fetchWeather();
    }
  }

  render() {
    const { path, elevationProfile } = this.props;
    const { temperature, humidity, description, aqi, categoryName } = this.state;
    if (!path) {
      return null;
    }

    const totalDistance = formatDistance(getDistanceMi(path));
    const totalTime = formatTime(totalDistance);
    const totalElevGain = formatElevation(getElevationGain(elevationProfile));
    const aqiStyle = this.getAQIStyle();
    const weatherText = temperature
      ? `${temperature}°F, ${description}, Humidity: ${humidity}%`
      : '';
    const aqiText = aqi ? `AQI: ${aqi} ${categoryName}` : '';

    return (
      <View style={styles.resultSummary}>
        <View style={styles.overview}>
          <Text>{weatherText}</Text>
          <Text style={aqiStyle}>{aqiText}</Text>
        </View>
        <View style={styles.overview}>
          <Text style={styles.resultText}>
            {totalDistance} miles, {totalTime}
          </Text>
          <Text style={styles.elevationText}>{totalElevGain} of climbing</Text>
        </View>
        <Elevation elevationProfile={this.props.elevationProfile} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  resultSummary: {
    backgroundColor: '#FFFFFF',
    height: 170,
    maxHeight: 170,
    paddingBottom: 4,
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 2,
  },

  overview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 5,
  },

  resultText: {
    color: '#273443',
    fontSize: 15,
    fontWeight: 'bold',
    paddingBottom: 3,
    paddingTop: 4,
  },

  elevationText: {
    color: '#273443',
    fontSize: 15,
    fontWeight: 'bold',
    paddingBottom: 10,
    paddingTop: 4,
  },
});
