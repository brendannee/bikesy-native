import _ from 'lodash'
import React from 'react'
import { StyleSheet, Text } from 'react-native'
import { MapView, Marker } from 'expo'

const formatters = require('./formatters')
const config = require('../config.json')

class Map extends React.Component {
  state = {
    center: {
      latitude: config.initialCenterLat,
      longitude: config.initialCenterLng
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

  // getDerivedStateFromProps(nextProps, prevState) {
  //   if (nextProps.bounds && _.isEqual(nextProps.bounds, prevState.bounds)) {
  //     this._map.setVisibleCoordinateBounds(nextProps.bounds.latitudeSW, nextProps.bounds.longitudeSW, nextProps.bounds.latitudeNE, nextProps.bounds.longitudeNE, 100, 40, 100, 40)
  //   }
  // }

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

  render() {

    return (
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: this.state.center.latitude,
          longitude: this.state.center.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={this.onPress}
      >
        {this.getStartMarker()}
        {this.getEndMarker()}
        {this.getRouteLine()}
      </MapView>
    )
  }
}

const styles = StyleSheet.create({
  map: {
    flex: 1
  }
})

module.exports = Map
