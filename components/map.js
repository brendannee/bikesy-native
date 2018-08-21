import React from 'react'
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity
} from 'react-native'
import { MapView, Marker } from 'expo'
import {MaterialIcons, Entypo} from '@expo/vector-icons'
import Summary from './summary'

import _ from 'lodash'
const formatters = require('../services/formatters')
const mapUtils = require('../services/map-utils')
const config = require('../config.json')

import globalStyles from '../styles/styles'

class Map extends React.Component {
  state = {
    region: {
      latitude: config.initialCenterLat,
      longitude: config.initialCenterLng,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
    zoom: config.initialZoom,
  }

  onPress = e => {
    if (!this.props.startCoords) {
      this.props.setStartLocation(e.nativeEvent.coordinate)
    } else if (!this.props.endCoords) {
      this.props.setEndLocation(e.nativeEvent.coordinate)
    }
  }

  startMarkerDragEnd = e => {
    this.props.setStartLocation(e.nativeEvent.coordinate)
  }

  endMarkerDragEnd = e => {
    this.props.setEndLocation(e.nativeEvent.coordinate)
  }

  getStartMarker() {
    if (this.props.startCoords) {
      return (<MapView.Marker
        coordinate={this.props.startCoords}
        title="Start"
        description={formatters.formatAddressLines(this.props.startAddress)}
        pinColor="#126c3f"
        draggable
        onDragEnd={this.startMarkerDragEnd}
      />)
    }
  }

  getEndMarker() {
    if (this.props.endCoords) {
      return (<MapView.Marker
        coordinate={this.props.endCoords}
        title="End"
        description={formatters.formatAddressLines(this.props.endAddress)}
        pinColor="#cf3043"
        draggable
        onDragEnd={this.endMarkerDragEnd}
      />)
    }
  }

  getRouteLine() {
    if (this.props.path) {
      const coordinates = this.props.path.map(coord => ({
        latitude: coord[0],
        longitude: coord[1]
      }))
      return (<MapView.Polyline
    		coordinates={coordinates}
    		strokeColor="#ff6712"
    		strokeWidth={3}
    	/>)
    }
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

  _renderClearButton() {
    if (this.props.startCoords) {
      return (
        <TouchableOpacity
         onPress={this.props.clearRoute}
         style={styles.clearButton}
        >
          <View style={styles.button}>
            <Entypo name="trash" size={20} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Clear</Text>
          </View>
        </TouchableOpacity>
      )
    }
  }

  _renderDirectionsButton() {
    if (this.props.path) {
      return (
        <TouchableOpacity
         onPress={this.props.showDirections}
         style={styles.directionsButton}
        >
          <View style={styles.button}>
            <MaterialIcons name="directions" size={20} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>View Directions</Text>
          </View>
        </TouchableOpacity>
      )
    }
  }

  render() {
    return (
      <View style={styles.map}>
        <Image source={require('../assets/images/bikesy-logo.png')} style={styles.logo} />
        <MapView
          style={styles.map}
          region={this.state.region}
          onPress={this.onPress}
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
}))

module.exports = Map
