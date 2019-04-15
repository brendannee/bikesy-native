import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Modal from 'react-native-modal';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

import globalStyles from '../styles/styles';

import { getMapBoundariesCenter, getMapBoundariesRadius } from '../services/map-utils';
const uuidv4 = require('uuid/v4');
import config from '../../config.json';

const sessiontoken = uuidv4();

type Props = {
  modalVisible: boolean,
  onSubmit: (address: string, [number, number]) => void,
  locationTypeText: string,
}

export default class About extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const boundsCenter = getMapBoundariesCenter();
    const radius = getMapBoundariesRadius();
    const { onSubmit, modalVisible, locationTypeText } = this.props;

    return (
      <Modal
        isVisible={modalVisible}
        onBackButtonPress={onSubmit}
      >
        <SafeAreaView style={styles.modal}>
          <TouchableOpacity onPress={onSubmit} style={styles.backControl}>
            <Ionicons name="ios-arrow-back" size={26} style={styles.backButton} />
            <Text style={styles.textLink}>Set location via map</Text>
          </TouchableOpacity>
          <View style={styles.autocomplete}>
            {modalVisible && <GooglePlacesAutocomplete
              placeholder={`Enter ${locationTypeText} address`}
              minLength={2}
              autoFocus={true}
              returnKeyType={'search'}
              keyboardAppearance={'light'}
              listViewDisplayed='auto'
              fetchDetails={true}
              onPress={(data, details) => {
                const coordinate = {
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                };

                onSubmit(details.formatted_address, coordinate);
              }}
              query={{
                key: config.googleMapsApiKey,
                language: 'en',
                location: `${boundsCenter.latitude},${boundsCenter.longitude}`,
                radius,
                sessiontoken,
              }}
              currentLocation={true}
              currentLocationLabel="Current location"
              nearbyPlacesAPI='GooglePlacesSearch'
              debounce={200}
            />}
          </View>
          <TouchableOpacity onPress={onSubmit} style={styles.closeButton}>
            <View style={styles.button}>
              <FontAwesome name="close" size={24} style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Cancel</Text>
            </View>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    );
  }
}

const styles = StyleSheet.create(Object.assign({}, globalStyles, {
  backControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    marginBottom: 10,
  },

  backButton: {
    color: '#226fbe',
    marginRight: 6,
  },

  closeButton: {
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
  },

  modal: {
    flex: 1,
    backgroundColor: 'white',
  },

  autocomplete: {
    flex: 1,
  },
}))
