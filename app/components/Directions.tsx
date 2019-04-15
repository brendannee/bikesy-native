import React, { Component } from 'react';
import {
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Entypo } from '@expo/vector-icons';

import _ from 'lodash';

import {
  formatDistance,
  formatElevation,
  formatTime,
  getElevationGain,
} from '../services/formatters';
import { getDistanceMi } from '../services/map-utils';

import globalStyles from '../styles/styles'

interface Props {
  directions?: object[];
  path: string;
  endAddress: string;
  elevationProfile: void;
  modalVisible: boolean;
  showAbout: () => void;
  hideModal: () => void;
}

export default class Directions extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  formatDirections() {
    if (!this.props.directions || this.props.directions.length === 0) {
      return '';
    }

    const directionsList = this.props.directions.reduce((memo, direction, idx) => {
      if (direction[1] !== 'nameless') {
        memo.push(<View style={styles.directionStep} key={idx}>
          <Text style={styles.directionStepText}>
              <Text style={styles.directionStepComponent}>{_.upperFirst(direction[0])}</Text> on{' '}
              <Text style={styles.directionStepComponent}>{direction[1]}</Text>
          </Text>
        </View>)
      }
      return memo;
    }, []);

    directionsList.push(
      <View style={styles.directionStep} key="final">
        <Text style={styles.directionStepText}>
          <Text style={styles.directionStepComponent}>arrive</Text> at <Text style={styles.directionStepComponent}>{this.props.endAddress}</Text>
        </Text>
      </View>
    );

    return directionsList;
  }

  render() {
    if (!this.props.path || !this.props.elevationProfile) {
      return null;
    }
    const totalDistance = formatDistance(getDistanceMi(this.props.path));
    const totalTime = formatTime(totalDistance);
    const totalElevGain = formatElevation(getElevationGain(this.props.elevationProfile));

    return (
      <Modal
        animationType="slide"
        visible={this.props.modalVisible}
        onRequestClose={this.props.hideModal}
        transparent={true}
      >
        <View style={[styles.modal, styles.modalSolid]}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.modalContent}>
              <View style={styles.directionsLogo}>
                <Image source={require('../assets/images/bikesy-logo.png')} />
              </View>
              <ScrollView>
                <Text style={styles.directionTitle}>Directions to {this.props.endAddress}</Text>
                <View style={styles.summary}>
                  <Text style={styles.summaryText}>
                    {totalDistance} miles, {totalTime}
                  </Text>
                  <Text style={styles.summaryText}>{totalElevGain} of total climbing</Text>
                </View>
                {this.formatDirections()}
                <Text style={styles.disclaimer}>
                  We offer no guarantee regarding roadway conditions or safety of the proposed routes.
                  Use your best judgment when choosing a route. Obey all vehicle code provisions.
                </Text>
              </ScrollView>
              <TouchableOpacity onPress={this.props.hideModal} style={styles.closeButton}>
                <View style={styles.button}>
                  <Entypo name="map" size={20} style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>View Map</Text>
                </View>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  ...globalStyles,

  directionsLogo: {
    marginBottom: 10,
  },

  directionTitle: {
    fontSize: 18,
    paddingBottom: 10,
  },

  summary: {
    paddingBottom: 10,
  },

  summaryText: {
    color: '#6D6D6D',
  },

  directionStep: {
    paddingTop: 12,
  },

  directionStepText: {
    color: '#6D6D6D',
  },

  directionStepComponent: {
    color: '#273443',
    fontWeight: 'bold',
  },

  closeButton: {
    marginTop: 5,
  },

  disclaimer: {
    color: '#898989',
    fontSize: 10,
    marginBottom: 20,
    marginTop: 30,
  },
});
