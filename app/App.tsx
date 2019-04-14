import React, { Component } from 'react';
import {
  Alert,
  NetInfo,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import About from './components/About';
import Directions from './components/Directions';
import LocationInput from './components/LocationInput';
import {
  handleError,
  handleFetchError,
  handleGeoLocationError,
  handleOutOfBoundsError,
} from './components/Errors';
import Map from './components/Map';
import { AppLoading, Asset } from 'expo';

import polyline from '@mapbox/polyline';

import { isWithinMapBoundaries } from './services/map-utils';
import { getRoute, reverseGeocode } from './services/api';

import globalStyles from './styles/styles';

type Props = {};

type State = {
  scenario: string,
  directionsVisible: boolean,
  aboutVisible: boolean,
  startCoords?: mixed,
  startAddress?: string,
  endAddress?: string,
  endCoords?: mixed,
  directions?: mixed,
  elevationProfile?: Array<[number, number]>,
  path?: Array<[number, number]>,
  locationType: string,
  locationInputVisible: boolean,
};

function cacheImages(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

export default class App extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      appIsReady: false,
      scenario: '1',
      directionsVisible: false,
      aboutVisible: false,
      locationInputVisible: false,
    };
  }

  async loadAssets() {
    const imageAssets = cacheImages([require('./assets/images/bikesy-logo.png')]);

    await Promise.all(imageAssets);
  }

  showNoConnectionAlert() {
    Alert.alert(
      'No connection',
      'Your phone has no access to the internet. Please connect and try again.',
      [{ text: 'OK' }],
      { cancelable: true }
    );
  }

  showWelcomeAlert() {
    Alert.alert(
      'Welcome to Bikesy',
      "We'll find you the best bike route. Where do you want to start?",
      [
        {
          onPress: () => this.setLocationFromUserLocation('start'),
          text: 'Use My Current Location',
        },
        { text: 'Choose From Map' },
        {
          onPress: () => this.setState({
            locationInputVisible: true,
            locationType: 'start',
          }),
          text: 'Enter an Address',
        },
      ],
      { cancelable: true }
    );
  }

  showEndLocationAlert() {
    Alert.alert(
      'Where would you like to go?',
      'Select your destination.',
      [
        { text: 'Use My Current Location', onPress: () => this.setLocationFromUserLocation('end') },
        { text: 'Choose From Map' },
        {
          text: 'Enter an Address',
          onPress: () => this.setState({
            locationInputVisible: true,
            locationType: 'end',
          })
        },
      ],
      { cancelable: true }
    );
  }

  updateRoute() {
    const { startCoords, endCoords, scenario } = this.state;

    if (startCoords.latitude === endCoords.latitude && startCoords.longitude == endCoords.longitude) {
      this.setState({
        startCoords: undefined,
        endCoords: undefined,
      });

      return Alert.alert(
        'Same start and destination location',
        'You chose the exact same start and destination locations. Try choosing two distinct places to route between.',
        [{ 
          onPress: () => this.showWelcomeAlert(),
          text: 'OK',
        }],
        { cancelable: true }
      );
    }

    NetInfo.isConnected.fetch().done(isConnected => {
      if (!isConnected) {
        return this.showNoConnectionAlert();
      }

      this.setState({ path: undefined });

      getRoute(startCoords, endCoords, scenario)
        .then(results => {
          if (!this.state.startCoords) {
            return;
          }

          const path = polyline.decode(results.path[0]);
          this.setState({
            directions: results.directions,
            elevationProfile: results.elevation_profile,
            path,
          });
        })
        .catch(handleFetchError);
    });
  }

  setLocationFromUserLocation(locationType: string) {
    navigator.geolocation.getCurrentPosition(result => {
      if (locationType === 'start') {
        this.setStartLocation(result.coords);
      } else if (locationType === 'end') {
        this.setEndLocation(result.coords);
      }
    }, handleGeoLocationError);
  }

  setLocationFromTextInput(address: string, coordinate: {}) {
    const { locationType } = this.state;
    this.setState({ locationInputVisible: false });

    if (locationType === 'start') {
      this.setState({
        startAddress: address,
        startCoords: coordinate,
      });
      this.showEndLocationAlert();
    } else if (locationType === 'end') {
      this.setState({
        endAddress: address,
        endCoords: coordinate,
      });
      this.updateRoute();
    }
  }

  setStartLocation(coordinate) {
    if (!isWithinMapBoundaries(coordinate)) {
      return handleOutOfBoundsError();
    }

    NetInfo.isConnected.fetch().done(isConnected => {
      if (!isConnected) {
        return this.showNoConnectionAlert();
      }

      this.setState(
        {
          startAddress: undefined,
          startCoords: coordinate,
        },
        () => {
          if (this.state.endCoords) {
            this.updateRoute();
          } else {
            this.showEndLocationAlert();
          }
        }
      );

      reverseGeocode(coordinate)
        .then(startAddress => {
          this.setState({ startAddress });
        })
        .catch(error => {
          if (error.message === 'No matching features found') {
            return;
          }

          handleError(error);
        });
    });
  }

  setEndLocation(coordinate) {
    if (!isWithinMapBoundaries(coordinate)) {
      return handleOutOfBoundsError();
    }

    NetInfo.isConnected.fetch().done(isConnected => {
      if (!isConnected) {
        return this.showNoConnectionAlert();
      }

      this.setState(
        {
          endAddress: undefined,
          endCoords: coordinate,
        },
        this.updateRoute
      );

      reverseGeocode(coordinate)
        .then(endAddress => {
          this.setState({ endAddress });
        })
        .catch(error => {
          if (error.message === 'No matching features found') {
            return;
          }

          handleError(error);
        });
    });
  }

  clearRoute() {
    this.setState({
      startCoords: undefined,
      endCoords: undefined,
      startAddress: undefined,
      endAddress: undefined,
      directions: undefined,
      elevationProfile: undefined,
      path: undefined,
    });
    this.showWelcomeAlert();
  }

  componentDidMount() {
    this.showWelcomeAlert();
  }

  render() {
    StatusBar.setHidden(true);

    if (!this.state.appIsReady) {
      return (
        <AppLoading
          startAsync={this.loadAssets}
          onFinish={() => this.setState({ appIsReady: true })}
        />
      );
    }

    const {
      startCoords,
      endCoords,
      startAddress,
      endAddress,
      path,
      elevationProfile,
      directions,
      directionsVisible,
      aboutVisible,
      locationType,
      locationInputVisible,
    } = this.state;

    const locationTypeText = locationType === 'start' ? 'start' : 'destination';

    return (
      <View style={styles.container}>
        <Map
          setStartLocation={coordinate => this.setStartLocation(coordinate)}
          setEndLocation={coordinate => this.setEndLocation(coordinate)}
          startCoords={startCoords}
          endCoords={endCoords}
          startAddress={startAddress}
          endAddress={endAddress}
          path={path}
          clearRoute={() => this.clearRoute()}
          showDirections={() => {this.setState({directionsVisible: true})}}
          showAbout={() => {this.setState({aboutVisible: true})}}
          elevationProfile={elevationProfile}
        />
        <Directions
          path={path}
          elevationProfile={elevationProfile}
          directions={directions}
          endAddress={endAddress}
          showAbout={() => {this.setState({aboutVisible: true, directionsVisible: false})}}
          modalVisible={directionsVisible}
          hideModal={() => this.setState({directionsVisible: false})}
        />
        <About
          modalVisible={aboutVisible}
          hideModal={() => this.setState({aboutVisible: false})}
        />
        <LocationInput
          title={`Enter a ${locationTypeText} address`}
          modalVisible={locationInputVisible}
          hideModal={() => this.setState({ locationInputVisible: false })}
          onSubmit={(address, coordinate) => this.setLocationFromTextInput(address, coordinate)}
        />
      </View>
    );
  }

  _renderAddresses() {
    return (
      <View style={styles.addressSection}>
        {this._renderStartAddress()}
        {this._renderEndAddress()}
      </View>
    );
  }

  _renderStartAddress() {
    if (!this.state.startAddress) {
      return <View style={styles.addressContainer} />;
    }

    return (
      <View style={styles.addressContainer}>
        <Text style={styles.addressLabel}>Start Address:</Text>
        <Text style={styles.address}>{this.state.startAddress}</Text>
      </View>
    );
  }

  _renderEndAddress() {
    if (!this.state.endAddress) {
      return <View style={styles.addressContainer} />;
    }

    return (
      <View style={styles.addressContainer}>
        <Text style={styles.addressLabel}>End Address:</Text>
        <Text style={styles.address}>{this.state.endAddress}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create(Object.assign({}, globalStyles, {
  container: {
    flex: 1,
    alignItems: 'stretch'
  },

  addressSection: {
    flex: 1,
    flexDirection: 'row'
  },

  addressContainer: {
    flex: 1,
    padding: 5
  },

  addressLabel: {
    fontSize: 10,
    color: '#8b8b8b'
  },

  address: {
    fontSize: 11,
    color: '#414141'
  },
}))
