import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const formatters = require('./formatters')
const mapUtils = require('./map-utils')

class Summary extends React.Component {
  render() {
    const totalDistance = formatters.formatDistance(mapUtils.getDistanceMi(this.props.path))
    const totalTime = formatters.formatTime(totalDistance)
    const totalElevGain = formatters.formatElevation(formatters.getElevationGain(this.props.elevationProfile))

    return (
      <View style={styles.overview}>
        <Text style={styles.resultText}>{totalDistance} miles, {totalTime}</Text>
        <Text style={styles.elevationText}>{totalElevGain} of climbing</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  overview: {
    flex: 1,
    flexDirection:'row',
    paddingBottom: 5,
    justifyContent: 'space-between',
  },
  resultText: {
    fontSize: 18,
    color: '#111111',
    fontWeight: 'bold',
    paddingBottom: 3,
    paddingTop: 2
  },
  elevationText: {
    fontSize: 16,
    color: '#111111',
    paddingBottom: 3,
    paddingTop: 3
  }
});

module.exports = Summary
