import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView
 } from 'react-native'

import Elevation from './Elevation'

const formatters = require('../services/formatters')
const mapUtils = require('../services/map-utils')

class Summary extends React.Component {
  render() {
    if (!this.props.path) {
      return null
    }

    const totalDistance = formatters.formatDistance(mapUtils.getDistanceMi(this.props.path))
    const totalTime = formatters.formatTime(totalDistance)
    const totalElevGain = formatters.formatElevation(formatters.getElevationGain(this.props.elevationProfile))

    return (
      <View style={styles.resultSummary}>
        <View style={styles.overview}>
          <Text style={styles.resultText}>{totalDistance} miles, {totalTime}</Text>
          <Text style={styles.elevationText}>{totalElevGain} of climbing</Text>
        </View>
        <Elevation
          elevationProfile={this.props.elevationProfile}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  resultSummary: {
    height: 130,
    maxHeight: 130,
    backgroundColor: '#FFFFFF',
    paddingTop: 2,
    paddingBottom: 4,
    paddingLeft: 8,
    paddingRight: 8
  },

  overview: {
    flexDirection:'row',
    paddingBottom: 5,
    justifyContent: 'space-between',
  },

  resultText: {
    fontSize: 16,
    color: '#273443',
    paddingBottom: 3,
    paddingTop: 2
  },

  elevationText: {
    fontSize: 16,
    color: '#273443',
    paddingBottom: 10,
    paddingTop: 3
  }
})

module.exports = Summary
