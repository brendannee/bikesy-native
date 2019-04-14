import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Vibration
} from 'react-native';
import { MapView } from 'expo';
import { MaterialIcons, Entypo } from '@expo/vector-icons';
import Summary from './Summary';

import _ from 'lodash';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { formatAddressLines } from '../services/formatters';
import { getRegion, regionContainsPoint } from '../services/map-utils';
import config from '../../config.json';

import globalStyles from '../styles/styles';

type Props = {
  startCoords: any,
  endCoords: any,
  setStartLocation: (mixed) => any,
  setEndLocation: (mixed) => mianyxed,
  startAddress: string,
  endAddress: string,
  path: Array<[number, number]>,
  elevationProfile: Array<[number, number]>,
  showAbout: () => any,
  showDirections: () => any,
  clearRoute: () => any,
};

type State = {
  region: {
    latitude: number,
    longitude: number,
    latitudeDelta: number,
    longitudeDelta: number,
  },
  zoom: number,
}

export default class Map extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      region: {
        latitude: config.initialCenterLat,
        latitudeDelta: 0.0722,
        longitude: config.initialCenterLng,
        longitudeDelta: 0.0321,
      },
      zoom: config.initialZoom,
    };
  }

  setMarker(coordinate) {
    const { setStartLocation, setEndLocation, startCoords, endCoords } = this.props;
    if (!startCoords) {
      Vibration.vibrate();
      setStartLocation(coordinate);
    } else if (!endCoords) {
      Vibration.vibrate();
      setEndLocation(coordinate);
    }
  }

  getStartMarker() {
    const { setStartLocation, startCoords, startAddress } = this.props;
    if (!startCoords) {
      return null;
    }

    return (
      <MapView.Marker
        coordinate={startCoords}
        pinColor="#126c3f"
        draggable={true}
        onDragEnd={e => setStartLocation(e.nativeEvent.coordinate)}
      >
        <MapView.Callout style={styles.callout}>
          <Text style={styles.markerTitle}>Start</Text>
          <Text>{formatAddressLines(startAddress)}</Text>
        </MapView.Callout>
      </MapView.Marker>
    );
  }

  getEndMarker() {
    const { setEndLocation, endCoords, endAddress } = this.props;
    if (!endCoords) {
      return null;
    }

    return (
      <MapView.Marker
        coordinate={endCoords}
        pinColor="#cf3043"
        draggable={true}
        onDragEnd={e => setEndLocation(e.nativeEvent.coordinate)}
      >
        <MapView.Callout style={styles.callout}>
          <Text style={styles.markerTitle}>End</Text>
          <Text>{formatAddressLines(endAddress)}</Text>
        </MapView.Callout>
      </MapView.Marker>
    );
  }

  getRouteLine() {
    const { endCoords, startCoords, path } = this.props;
    if (!path) {
      return null;
    }

    const coordinates = path.map(coord => ({
      latitude: coord[0],
      longitude: coord[1],
    }));
    coordinates.unshift(startCoords);
    coordinates.push(endCoords);

    return <MapView.Polyline coordinates={coordinates} strokeColor="#ff6712" strokeWidth={3} />;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.path && !_.isEqual(nextProps.path, prevState.path)) {
      return {
        path: nextProps.path,
        region: getRegion(nextProps.path)
      };
    } else {
      return null;
    }
  }

  async componentDidUpdate(prevProps) {
    const { region } = this.state;
    const { startCoords } = this.props;
    if (startCoords && !_.isEqual(prevProps.startCoords, startCoords)) {
      if (!regionContainsPoint(region, startCoords)) {
        this.setState({
          region: {
            latitude: startCoords.latitude,
            latitudeDelta: region.latitudeDelta,
            longitude: startCoords.longitude,
            longitudeDelta: region.longitudeDelta,
          },
        });
      }
    }
  }

  _renderClearButton() {
    const { startCoords, clearRoute } = this.props;
    if (!startCoords) {
      return null;
    }

    return (
      <TouchableOpacity onPress={() => clearRoute()} style={styles.clearButton}>
        <View style={styles.button}>
          <Entypo name="trash" size={20} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Clear</Text>
        </View>
      </TouchableOpacity>
    );
  }

  _renderDirectionsButton() {
    const { path, showDirections } = this.props;
    if (!path) {
      return null;
    }

    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={showDirections}>
          <View style={styles.button}>
            <MaterialIcons name="directions" size={20} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>View Directions</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.map}>
        <MapView
          style={styles.map}
          region={this.state.region}
          onPress={e => this.setMarker(e.nativeEvent.coordinate)}
          mapType="mutedStandard"
          showsUserLocation={true}
          provider="google"
          zoomControlEnabled={true}
          mapPadding={{
            top: 100,
            right: 15,
            bottom: 10,
            left: 15,
          }}
        >
          {this.getStartMarker()}
          {this.getEndMarker()}
          {this.getRouteLine()}
        </MapView>
        <TouchableOpacity onPress={this.props.showAbout} style={styles.logo}>
          <Image source={require('../assets/images/bikesy-logo.png')} />
        </TouchableOpacity>
        {this._renderClearButton()}
        {this._renderDirectionsButton()}
        <Summary path={this.props.path} elevationProfile={this.props.elevationProfile} />
      </View>
    );
  }
}

const styles = StyleSheet.create(Object.assign({}, globalStyles, {
  map: {
    flex: 1
  },

  logo: {
    position: 'absolute',
    ...ifIphoneX({
      top: 40
    }, {
      top: 10
    }),
    left: 15,
    zIndex: 1
  },

  callout: {
    width: 120,
    padding: 5
  },

  clearButton: {
    position: 'absolute',
    ...ifIphoneX({
      top: 40
    }, {
      top: 10
    }),
    right: 15,
    zIndex: 1,
  },

  buttonContainer: {
    paddingRight: 15,
    paddingLeft: 15,
    paddingTop: 10,
    paddingBottom: 5,
  }
}));
