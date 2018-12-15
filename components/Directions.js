/* @flow */

import React, { Component } from 'react'
import {
  Modal,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native'
import {Entypo} from '@expo/vector-icons'

const formatters = require('../services/formatters')
const mapUtils = require('../services/map-utils')

import globalStyles from '../styles/styles'

type Props = {
  directions?: Array<mixed>,
  path: string,
  endAddress: string,
  elevationProfile: mixed,
  modalVisible: boolean,
  hideModal: () => mixed
}

class Directions extends Component<Props> {
  constructor(props: Props) {
    super(props)
  }

  formatDirections() {
    if (!this.props.directions || this.props.directions.length === 0) {
      return ''
    }

    const directionsList = this.props.directions.reduce((memo, direction, idx) => {
      if (direction[1] !== 'nameless') {
        memo.push(<View style={styles.directionStep} key={idx}>
          <Text style={styles.directionStepText}>
            <Text style={styles.directionStepComponent}>{direction[0]}</Text> on <Text style={styles.directionStepComponent}>{direction[1]}</Text>
          </Text>
        </View>)
      }
      return memo
    }, [])

    directionsList.push((
      <View style={styles.directionStep} key="final">
        <Text style={styles.directionStepText}>
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
        onRequestClose={() => alert('Modal has been closed.')}
      >
        <View style={styles.directions}>
          <Image source={require('../assets/images/bikesy-logo.png')} style={styles.logo} />
          <ScrollView style={styles.directionsContent}>
            <Text style={styles.directionTitle}>Directions to {this.props.endAddress}</Text>
            <View style={styles.summary}>
              <Text style={styles.summaryText}>{totalDistance} miles, {totalTime}</Text>
              <Text style={styles.summaryText}>{totalElevGain} of total climbing</Text>
            </View>
            {this.formatDirections()}
            <Text style={styles.disclaimer}>We offer no guarantee regarding roadway conditions or safety of the proposed routes. Use your best judgment when choosing a route. Obey all vehicle code provisions.</Text>
          </ScrollView>
          <TouchableOpacity
           onPress={this.props.hideModal}
           style={styles.directionsButton}
          >
            <View style={styles.button}>
              <Entypo name="map" size={20} style={styles.buttonIcon} />
              <Text style={styles.buttonText}>View Map</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    )
  }
}

const styles = StyleSheet.create(Object.assign({}, globalStyles, {
  directions: {
    paddingTop: 40,
    paddingRight: 15,
    paddingLeft: 15,
    paddingBottom: 25,
    flex: 1,
  },

  directionsContent: {
    marginTop: 60
  },

  directionTitle: {
    fontSize: 18,
    paddingBottom: 10
  },

  summary: {
    paddingBottom: 10
  },

  summaryText: {
    color: '#6D6D6D'
  },

  directionStep: {
    paddingTop: 12,
  },

  directionStepText: {
    color: '#6D6D6D'
  },

  directionStepComponent: {
    fontWeight: 'bold',
    color: '#273443'
  },

  disclaimer: {
    fontSize: 10,
    marginTop: 30,
    marginBottom: 20,
    color: '#898989'
  }
}))

module.exports = Directions