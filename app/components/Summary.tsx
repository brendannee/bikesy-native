import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
 } from 'react-native';

import Elevation from './Elevation';

import {
  formatDistance,
  formatElevation,
  formatTime,
  getElevationGain,
} from '../services/formatters';
import { getDistanceMi } from '../services/map-utils';

interface Props {
  path: Array<[number, number]>;
  elevationProfile: Array<[number, number]>;
}

export default class Summary extends Component<Props> {
  render() {
    if (!this.props.path) {
      return null;
    }

    const totalDistance = formatDistance(getDistanceMi(this.props.path));
    const totalTime = formatTime(totalDistance);
    const totalElevGain = formatElevation(getElevationGain(this.props.elevationProfile));

    return (
      <View style={styles.resultSummary}>
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
    height: 130,
    maxHeight: 130,
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
