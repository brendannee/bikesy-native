/* @flow */

import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity
} from 'react-native'
import { MapView } from 'expo'
import {MaterialIcons, Entypo} from '@expo/vector-icons'
import Summary from './Summary'

import _ from 'lodash'
const formatters = require('../services/formatters')
const mapUtils = require('../services/map-utils')
const config = require('../config.json')

import globalStyles from '../styles/styles'

type Props = {
  startCoords: mixed,
  endCoords: mixed,
  setStartLocation: (mixed) => mixed,
  setEndLocation: (mixed) => mixed,
  startAddress: string,
  endAddress: string,
  path: Array<[number, number]>,
  elevationProfile: Array<[number, number]>,
  showDirections: () => mixed,
  clearRoute: () => mixed
}

type State = {
  region: {
    latitude: number,
    longitude: number,
    latitudeDelta: number,
    longitudeDelta: number
  },
  zoom: number
}

class Map extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      region: {
        latitude: config.initialCenterLat,
        longitude: config.initialCenterLng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      zoom: config.initialZoom,
    }
  }

  setMarker(coordinate) {
    if (!this.props.startCoords) {
      this.props.setStartLocation(coordinate)
    } else if (!this.props.endCoords) {
      this.props.setEndLocation(coordinate)
    }
  }

  getStartMarker() {
    const { setStartLocation, startCoords, startAddress } = this.props
    if (!startCoords) {
      return null
    }

    return (
      <MapView.Marker
        coordinate={startCoords}
        title="Start"
        description={formatters.formatAddressLines(startAddress)}
        pinColor="#126c3f"
        draggable
        onDragEnd={e => setStartLocation(e.nativeEvent.coordinate)}
      />
    )
  }

  getEndMarker() {
    const { setEndLocation, endCoords, endAddress } = this.props
    if (!endCoords) {
      return null
    }

    return (
      <MapView.Marker
        coordinate={endCoords}
        title="End"
        description={formatters.formatAddressLines(endAddress)}
        pinColor="#cf3043"
        draggable
        onDragEnd={e => setEndLocation(e.nativeEvent.coordinate)}
      />
    )
  }

  getRouteLine() {
    const { path } = this.props
    if (!path) {
      return null
    }

    const coordinates = path.map(coord => ({
      latitude: coord[0],
      longitude: coord[1]
    }))

    return (
      <MapView.Polyline
    		coordinates={coordinates}
    		strokeColor="#ff6712"
    		strokeWidth={3}
    	/>
    )
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.path && !_.isEqual(nextProps.path, prevState.path)) {
      return {
        path: nextProps.path,
        region: mapUtils.getRegion(nextProps.path)
      }
    } else {
      return null
    }
  }

  async componentDidUpdate(prevProps) {
    const { region } = this.state
    const { startCoords } = this.props
    if (startCoords  && !_.isEqual(prevProps.startCoords, startCoords)) {
      if (!mapUtils.regionContainsPoint(region, startCoords)) {

        this.setState({
          region: {
            latitude: startCoords.latitude,
            longitude: startCoords.longitude,
            latitudeDelta: region.latitudeDelta,
            longitudeDelta: region.longitudeDelta
          }
        })
      }
    }
  }

  _renderClearButton() {
    const { startCoords, clearRoute } = this.props
    if (!startCoords) {
      return null
    }

    return (
      <TouchableOpacity
       onPress={() => clearRoute()}
       style={styles.clearButton}
      >
        <View style={styles.button}>
          <Entypo name="trash" size={20} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Clear</Text>
        </View>
      </TouchableOpacity>
    )
  }

  _renderDirectionsButton() {
    const { path, showDirections } = this.props
    if (!path) {
      return null
    }

    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity
         onPress={showDirections}
         style={styles.directionsButton}
        >
          <View style={styles.button}>
            <MaterialIcons name="directions" size={20} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>View Directions</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.map}>
        <Image source={require('../assets/images/bikesy-logo.png')} style={styles.logo} />
        <MapView
          style={styles.map}
          region={this.state.region}
          onPress={e => this.setMarker(e.nativeEvent.coordinate)}
          mapType="mutedStandard"
          showsUserLocation={true}
          mapPadding = {{
            top: 105,
            right: 15,
            bottom: 10,
            left: 15
          }}
        >
          {this.getStartMarker()}
          {this.getEndMarker()}
          {this.getRouteLine()}
        </MapView>
        {this._renderClearButton()}
        {this._renderDirectionsButton()}
        <Summary
          path={this.props.path}
          elevationProfile={this.props.elevationProfile}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create(Object.assign({}, globalStyles, {
  map: {
    flex: 1
  },

  clearButton: {
    position: 'absolute',
    top: 35,
    right: 15,
    zIndex: 1,
  },

  buttonContainer: {
    paddingRight: 15,
    paddingLeft: 15,
    paddingTop: 5
  }
}))

module.exports = Map
