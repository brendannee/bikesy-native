import React, { Component } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { FontAwesome } from '@expo/vector-icons';

import globalStyles from '../styles/styles';

import { getMapBoundariesCenter, getMapBoundariesRadius } from '../services/map-utils';
const uuidv4 = require('uuid/v4');
import config from '../../config.json';

const sessiontoken = uuidv4();

type Props = {
  modalVisible: boolean,
  hideModal: () => void,
  onSubmit: (address: string, [number, number]) => void,
}

export default class About extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const boundsCenter = getMapBoundariesCenter();
    const radius = getMapBoundariesRadius();
    const { onSubmit, hideModal, modalVisible } = this.props;

    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={hideModal}
        transparent={true}
      >
        <SafeAreaView style={styles.modal}>
          <TouchableOpacity onPress={hideModal} style={styles.closeButton}>
            <View style={styles.button}>
              <FontAwesome name="close" size={24} style={styles.buttonIconSingle} />
            </View>
          </TouchableOpacity>
          <View style={styles.autocomplete}>
            <GooglePlacesAutocomplete
              placeholder='Search'
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
            />
          </View>
        </SafeAreaView>
      </Modal>
    );
  }
}

const styles = StyleSheet.create(Object.assign({}, globalStyles, {
  closeButton: {
    position: 'absolute',
    top: 7,
    right: 7,
    zIndex: 1,
  },

  autocomplete: {
    marginRight: 60,
    flex: 1,
  },
}))
