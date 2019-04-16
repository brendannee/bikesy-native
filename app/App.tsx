import React, { Component } from 'react';
import {
  ActivityIndicator,
  Alert,
  NetInfo,
  StatusBar,
  StyleSheet,
  View,
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

import CoordinateType from './types/coordinate';

interface Props {}

interface State {
  appIsReady: boolean;
  scenario: string;
  directionsVisible: boolean;
  loading: boolean;
  aboutVisible: boolean;
  startCoords?: CoordinateType;
  startAddress?: string;
  endAddress?: string;
  endCoords?: CoordinateType;
  directions?: mixed;
  elevationProfile?: Array<[number, number]>;
  path?: Array<[number, number]>;
  locationType?: string;
  locationInputVisible: boolean;
  enableMapInput: boolean;
  bikeLanes: string;
  hills: string;
}

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
      aboutVisible: false,
      appIsReady: false,
      directionsVisible: false,
      enableMapInput: false,
      loading: false,
      locationInputVisible: false,
      scenario: '1',
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

  showBikeLaneSelect() {
    Alert.alert(
      'Welcome to Bikesy',
      "We'll find you the best bike route. First, how much would you like to stick to bike routes, low traffic roads and bike lanes?",
      [
        {
          onPress: () => {
            this.setState({
              bikeLanes: 'high',
            });
            this.showHillSelect();
          },
          text: '🚴‍ Mostly bike paths and bike lanes',
        },
        {
          onPress: () => {
            this.setState({
              bikeLanes: 'high',
            });
            this.showHillSelect();
          },
          text: '☺️ A reasonable route',
        },
        {
          onPress: () => {
            this.setState({
              bikeLanes: 'high',
            });
            this.showHillSelect();
          },
          text: '🔜 A very direct route',
        },
      ],
      { cancelable: true }
    );
  }

  showHillSelect() {
    Alert.alert(
      'How much do you want to reroute to avoid hills?',
      "We'll try to find a route that avoids going uphill as much as possible, and uses less steep roads where needed.",
      [
        {
          onPress: () => {
            this.setState({
              hills: 'high',
            });
            this.showStartLocationAlert();
          },
          text: '↪️ Avoid at all costs',
        },
        {
          onPress: () => {
            this.setState({
              hills: 'high',
            });
            this.showStartLocationAlert();
          },
          text: '☺️ A reasonable route',
        },
        {
          onPress: () => {
            this.setState({
              hills: 'high',
            });
            this.showStartLocationAlert();
          },
          text: '⛰️📈 Bring on the hills!',
        },
      ],
      { cancelable: true }
    );
  }

  showStartLocationAlert() {
    Alert.alert(
      'Where do you want to start?',
      'Select your start location.',
      [
        {
          onPress: () => {
            this.setState({ enableMapInput: false });
            this.setLocationFromUserLocation('start');
          },
          text: '📍 Use My Current Location',
        },
        {
          onPress: () => {
            this.setState({ enableMapInput: true });
          },
          text: '🗺️ Choose From Map',
        },
        {
          onPress: () => {
            this.setState({
              enableMapInput: false,
              locationInputVisible: true,
              locationType: 'start',
            });
          },
          text: '⌨️ Enter an Address',
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
        {
          onPress: () => {
            this.setState({ enableMapInput: false });
            this.setLocationFromUserLocation('end');
          },
          text: '📍 Use My Current Location',
        },
        {
          onPress: () => {
            this.setState({ enableMapInput: true });
          },
          text: '🗺️ Choose From Map',
        },
        {
          onPress: () => {
            this.setState({
              enableMapInput: false,
              locationInputVisible: true,
              locationType: 'end',
            });
          },
          text: '⌨️ Enter an Address',
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
          onPress: () => this.showStartLocationAlert(),
          text: 'OK',
        }],
        { cancelable: true }
      );
    }

    NetInfo.isConnected.fetch().done(isConnected => {
      if (!isConnected) {
        return this.showNoConnectionAlert();
      }

      this.setState({
        path: undefined,
        loading: true,
      });

      getRoute(startCoords, endCoords, scenario)
        .then(results => {
          if (!this.state.startCoords) {
            return;
          }

          const path = polyline.decode(results.path[0]);
          this.setState({
            directions: results.directions,
            elevationProfile: results.elevation_profile,
            loading: false,
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

  setLocationFromTextInput(address: string, coordinate: CoordinateType) {
    const { locationType } = this.state;
    this.setState({ locationInputVisible: false });

    if (address && coordinate) {
      if (locationType === 'start') {
        this.setState({
          startAddress: address,
          startCoords: coordinate,
        });
      } else if (locationType === 'end') {
        this.setState({
          endAddress: address,
          endCoords: coordinate,
        });
        this.updateRoute();
      }
    }

    setTimeout(() => {
      if (!address || !coordinate) {
        if (locationType === 'start') {
          this.showStartLocationAlert();
        } else {
          this.showEndLocationAlert();
        }
      } else if (locationType === 'start') {
        this.showEndLocationAlert();
      }
    }, 500);
  }

  setStartLocation(coordinate: CoordinateType) {
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

  setEndLocation(coordinate: CoordinateType) {
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
    this.showStartLocationAlert();
  }

  render() {
    StatusBar.setHidden(true);

    if (!this.state.appIsReady) {
      return (
        <AppLoading
          startAsync={this.loadAssets}
          onFinish={() => {
            this.setState({ appIsReady: true });
            this.showBikeLaneSelect();
          }}
        />
      );
    }

    const {
      loading,
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
      enableMapInput,
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
          enableMapInput={enableMapInput}
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
          locationTypeText={locationTypeText}
          onSubmit={(address, coordinate) => this.setLocationFromTextInput(address, coordinate)}
        />
        {loading && <View style={styles.loadingContainer}>
          <ActivityIndicator
            animating={loading}
            color="#226fbe"
            size={'large'}
            style={styles.loading}
          />
        </View>}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  ...globalStyles,

  container: {
    alignItems: 'stretch',
    flex: 1,
  },

  addressSection: {
    flex: 1,
    flexDirection: 'row',
  },

  addressContainer: {
    flex: 1,
    padding: 5,
  },

  addressLabel: {
    color: '#8b8b8b',
    fontSize: 10,
  },

  address: {
    color: '#414141',
    fontSize: 11,
  },

  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loading: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 40,
    borderRadius: 10,
    borderColor: '#bbbbbb',
    borderWidth: 1,
    width: 100,
    height: 100,
  },
});
