import React, { Component } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-maps';
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import Summary from './Summary';

import _ from 'lodash';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { formatAddressLines } from '../services/formatters';
import { getRegion, regionContainsPoint } from '../services/map-utils';
import config from '../../config.json';

import globalStyles from '../styles/styles';

import CoordinateType from './types/coordinate';

interface Props {
  startCoords: CoordinateType;
  endCoords: CoordinateType;
  setStartLocation: (coord: CoordinateType) => void;
  setEndLocation: (coord: CoordinateType) => void;
  startAddress: string;
  endAddress: string;
  path: Array<[number, number]>;
  elevationProfile: Array<[number, number]>;
  showAbout: () => any;
  showDirections: () => any;
  clearRoute: () => any;
  changeSettings: () => any;
  enableMapInput: boolean;
}

interface State {
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  zoom: number;
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

  setMarker(coordinate: CoordinateType) {
    const { setStartLocation, setEndLocation, startCoords, endCoords, enableMapInput } = this.props;
    if (!enableMapInput) {
      return;
    }

    if (!startCoords) {
      setStartLocation(coordinate);
    } else if (!endCoords) {
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

  renderClearButton() {
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

  renderSettingsButton() {
    const { changeSettings } = this.props;
    return (
      <TouchableOpacity onPress={() => changeSettings()} style={styles.settingsButton}>
        <View style={styles.button}>
          <Ionicons name="ios-settings" size={20} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Settings</Text>
        </View>
      </TouchableOpacity>
    );
  }

  renderDirectionsButton() {
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
    const { showAbout, path, elevationProfile, startCoords, endCoords } = this.props;
    return (
      <View style={styles.map}>
        <MapView
          style={styles.map}
          region={this.state.region}
          onPress={e => this.setMarker(e.nativeEvent.coordinate)}
          onPoiClick={e => this.setMarker(e.nativeEvent.coordinate)}
          onLongPress={e => this.setMarker(e.nativeEvent.coordinate)}
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
        <TouchableOpacity onPress={showAbout} style={styles.logo}>
          <Image source={require('../assets/images/bikesy-logo.png')} />
        </TouchableOpacity>
        {this.renderSettingsButton()}
        {this.renderClearButton()}
        {this.renderDirectionsButton()}
        <Summary
          path={path}
          elevationProfile={elevationProfile}
          endCoords={endCoords}
          startCoords={startCoords}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  ...globalStyles,

  map: {
    flex: 1,
  },

  logo: {
    position: 'absolute',
    ...ifIphoneX(
      {
        top: 40,
      },
      {
        top: 10,
      }
    ),
    left: 15,
    zIndex: 1,
  },

  callout: {
    padding: 5,
    width: 120,
  },

  settingsButton: {
    position: 'absolute',
    ...ifIphoneX(
      {
        top: 40,
      },
      {
        top: 10,
      }
    ),
    right: 15,
    zIndex: 1,
  },

  clearButton: {
    position: 'absolute',
    ...ifIphoneX(
      {
        top: 80,
      },
      {
        top: 50,
      }
    ),
    right: 15,
    zIndex: 1,
  },

  buttonContainer: {
    paddingBottom: 5,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
  },
});
