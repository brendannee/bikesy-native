import React from 'react'
import {
  Button,
  Modal,
  StyleSheet,
  Text,
  View
} from 'react-native'

const formatters = require('./formatters')
const mapUtils = require('./map-utils')

class Directions extends React.Component {

  formatDirections() {
    if (!this.props.directions) {
      return ''
    }

    const directionsList = this.props.directions.reduce((memo, direction, idx) => {
      if (direction[1] !== 'nameless') {
        memo.push(<View style={styles.directionStep} key={idx}>
          <Text>
            <Text style={styles.directionStepComponent}>{direction[0]}</Text> on <Text style={styles.directionStepComponent}>{direction[1]}</Text>
          </Text>
        </View>)
      }
      return memo
    }, [])

    directionsList.push((
      <View style={styles.directionStep} key="final">
        <Text>
          <Text style={styles.directionStepComponent}>arrive</Text> at <Text style={styles.directionStepComponent}>{this.props.endAddress}</Text>
        </Text>
      </View>
    ))

    return directionsList
  }

  render() {
    if (!this.props.path || !this.props.elevationProfile) {
      return null
    }
    const totalDistance = formatters.formatDistance(mapUtils.getDistanceMi(this.props.path))
    const totalTime = formatters.formatTime(totalDistance)
    const totalElevGain = formatters.formatElevation(formatters.getElevationGain(this.props.elevationProfile))

    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={this.props.modalVisible}
        onRequestClose={() => {
          alert('Modal has been closed.')
        }}>
        <View style={styles.directions}>
          <Button
            onPress={() => {
              this.props.hideModal()
            }}
            title="Map"
            accessibilityLabel="View Route Map"
            style={styles.mapButton}
          />

          <Text style={styles.directionTitle}>Directions to {this.props.endAddress}</Text>
          <View style={styles.summary}>
            <Text style={styles.resultText}>{totalDistance} miles, {totalTime}</Text>
            <Text style={styles.elevationText}>{totalElevGain} of total climbing</Text>
          </View>
          <Text>{this.formatDirections()}</Text>

          <Text style={styles.disclaimer}>We offer no guarantee regarding roadway conditions or safety of the proposed routes. Use your best judgment when choosing a route. Obey all vehicle code provisions.</Text>
        </View>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  directions: {
    paddingTop: 40,
    paddingRight: 15,
    paddingLeft: 15,
    paddingBottom: 15,
    flex: 1,
  },
  mapButton: {

  },
  directionTitle: {
    fontSize: 22,
    paddingBottom: 10
  },
  summary: {
    fontSize: 18,
    paddingBottom: 10
  },
  directionStep: {
    paddingTop: 20,
    fontSize: 18
  },
  directionStepComponent: {
    fontWeight: 'bold'
  },
  disclaimer: {
    position: 'absolute',
    bottom: 15,
    zIndex: 1,
    fontSize: 10,
    padding: 15
  }
})

module.exports = Directions
