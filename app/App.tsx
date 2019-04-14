import React, { Component } from 'react';
import {
  Alert,
  AlertIOS,
  NetInfo,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import About from './components/About';
import Directions from './components/Directions';
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
import { geocode, getRoute, reverseGeocode } from './services/api';

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
    };
  }

  async loadAssets() {
    const imageAssets = cacheImages([require('./assets/images/bikesy-logo.png')]);

    await Promise.all(imageAssets);
  }

  showWelcomeAlert() {
    Alert.alert(
      'Welcome to Bikesy',
      "We'll find you the best bike route. Where do you want to start?",
      [
        {
          text: 'Use My Current Location',
          onPress: () => this.setLocationFromUserLocation('start'),
        },
        { text: 'Choose From Map' },
        { text: 'Enter an Address', onPress: () => this.setLocationFromTextInput('start') },
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
        { text: 'Enter an Address', onPress: () => this.setLocationFromTextInput('end') },
      ],
      { cancelable: true }
    );
  }

  updateRoute() {
    const { startCoords, endCoords, scenario } = this.state;

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

  setLocationFromTextInput(locationType: string) {
    const locationTypeText = locationType === 'start' ? 'start' : 'destination';
    AlertIOS.prompt(`Enter a ${locationTypeText} address`, null, address => {
      NetInfo.isConnected.fetch().done(isConnected => {
        if (!isConnected) {
          return Alert.alert(
            'No connecteion',
            'Your phone has no access to the internet. Please connect and try again.',
            [{ text: 'OK' }],
            { cancelable: true }
          );
        }

        geocode(address)
          .then(coordinate => {
            if (!isWithinMapBoundaries(coordinate)) {
              return handleOutOfBoundsError()
            }

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
          })
          .catch(error => {
            if (error.message === 'No matching features found') {
              return Alert.alert(
                'Unable to find address',
                'Try another address, or place a pin directly on the map.',
                [{ text: 'OK', onPress: () => this.setLocationFromTextInput(locationType) }],
                { cancelable: true }
              );
            }

            handleError(error);
          });
      });
    });
  }

  setStartLocation(coordinate) {
    if (!isWithinMapBoundaries(coordinate)) {
      return handleOutOfBoundsError();
    }

    NetInfo.isConnected.fetch().done(isConnected => {
      if (!isConnected) {
        return Alert.alert(
          'No connecteion',
          'Your phone has no access to the internet. Please connect and try again.',
          [{ text: 'OK' }],
          { cancelable: true }
        );
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
        return Alert.alert(
          'No connecteion',
          'Your phone has no access to the internet. Please connect and try again.',
          [{ text: 'OK' }],
          { cancelable: true }
        );
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
    } = this.state;

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
          path={path}
          modalVisible={aboutVisible}
          hideModal={() => this.setState({aboutVisible: false})}
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