import React, { Component } from 'react';
import {
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
import Loading from './components/Loading';
import Map from './components/Map';
import { AppLoading } from 'expo';
import { Asset } from 'expo-asset';

import polyline from '@mapbox/polyline';

import { isWithinMapBoundaries } from './services/map-utils';
import { getRoute, reverseGeocode } from './services/api';

import globalStyles from './styles/styles';

import CoordinateType from './types/coordinate';

interface Props {}

interface State {
  appIsReady: boolean;
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
  startedFromCurrentLocation: boolean;
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
      startedFromCurrentLocation: false,
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

  setBikeLanes(bikeLanes: string) {
    this.setState({ bikeLanes });
    this.showHillSelect();
  }

  showBikeLaneSelect(isFirstLoad: boolean) {
    const title = isFirstLoad ? 'Welcome to Bikesy' : 'What type of route would you like?';
    const description = isFirstLoad
      ? "We'll find you the best bike route. First, how much would you like to stick to bike routes, low traffic roads and bike lanes?"
      : 'Would you like to stick to bike routes, low traffic roads and bike lanes, or have a more direct route?';

    Alert.alert(
      title,
      description,
      [
        {
          onPress: () => this.setBikeLanes('1'),
          text: '🚴‍ Mostly bike paths and bike lanes',
        },
        {
          onPress: () => this.setBikeLanes('2'),
          text: '☺️ A reasonable route',
        },
        {
          onPress: () => this.setBikeLanes('3'),
          text: '🔜 A very direct route',
        },
      ],
      { cancelable: true }
    );
  }

  setHills(hills: string) {
    const { endCoords, startCoords } = this.state;

    this.setState({ hills });

    if (!startCoords) {
      this.showStartLocationAlert();
    } else if (!endCoords) {
      this.showEndLocationAlert();
    } else {
      this.updateRoute();
    }
  }

  showHillSelect() {
    Alert.alert(
      'How much do you want to reroute to avoid hills?',
      "We'll try to find a route that avoids going uphill as much as possible, and uses less steep roads where needed.",
      [
        {
          onPress: () => this.setHills('1'),
          text: '↪️ Avoid at all costs',
        },
        {
          onPress: () => this.setHills('2'),
          text: '☺️ A reasonable route',
        },
        {
          onPress: () => this.setHills('3'),
          text: '⛰️📈 Bring on the hills!',
        },
      ],
      { cancelable: true }
    );
  }

  showStartLocationAlert() {
    this.setState({
      startedFromCurrentLocation: false,
    });

    const alertOptions = [
      {
        onPress: () => {
          this.setState({
            enableMapInput: false,
            startedFromCurrentLocation: true,
          });
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
    ];

    Alert.alert(
      'Where do you want to start?',
      'Select your start location.',
      alertOptions,
      { cancelable: true }
    );
  }

  showEndLocationAlert() {
    const { startedFromCurrentLocation } = this.state;

    const alertOptions = [
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
    ];

    if (!startedFromCurrentLocation) {
      alertOptions.unshift({
        onPress: () => {
          this.setState({ enableMapInput: false });
          this.setLocationFromUserLocation('end');
        },
        text: '📍 Use My Current Location',
      });
    }

    Alert.alert(
      'Where would you like to go?',
      'Select your destination.',
      alertOptions,
      { cancelable: true }
    );
  }

  updateRoute() {
    const { startCoords, endCoords, bikeLanes, hills } = this.state;

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
        loading: true,
        path: undefined,
      });

      getRoute(startCoords, endCoords, bikeLanes, hills)
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
        .catch(error => {
          this.setState({
            endCoords: undefined,
            loading: false,
            path: undefined,
            startCoords: undefined,
          });

          handleFetchError(error);
        });
    });
  }

  setLocationFromUserLocation(locationType: string) {
    navigator.geolocation.getCurrentPosition(result => {
      if (locationType === 'start') {
        this.setStartLocation(result.coords);
      } else if (locationType === 'end') {
        this.setEndLocation(result.coords);
      }
    }, () => {
      handleGeoLocationError(() => {
        this.showStartLocationAlert();
      });
    });
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
            this.showBikeLaneSelect(true);
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
          changeSettings={() => this.showBikeLaneSelect()}
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
        <Loading loading={loading} />
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
});
