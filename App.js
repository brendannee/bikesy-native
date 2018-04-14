import React from 'react'
import {
  Alert,
  AlertIOS,
  AppRegistry,
  Button,
  Image,
  ScrollView ,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native'
import polyline from '@mapbox/polyline'

import Directions from './components/directions'
import Elevation from './components/elevation'
import Map from './components/map'
import Summary from './components/summary'

const api = require('./components/api')
const errors = require('./components/errors')
const config = require('./config.json')

export default class App extends React.Component {
  state = {
    scenario: '1',
    directionsVisible: false
  }

  showWelcomeAlert = () => {
    Alert.alert(
      'Welcome to Bikesy',
      'We\'ll find you the best bike route. Where do you want to start?',
      [
        {text: 'Use My Current Location', onPress: this.setStartLocationFromUserLocation},
        {text: 'Choose From Map'},
        {text: 'Enter an Address', onPress: this.setStartLocationFromTextInput},
      ],
      { cancelable: true }
    )
  }

  updateRoute = () => {
    api.getRoute(this.state.startCoords, this.state.endCoords, this.state.scenario)
    .then(results => {
      if (!this.state.startCoords) {
        return
      }

      const path = polyline.decode(results.path[0])
      this.setState({
        directions: results.directions,
        elevationProfile: results.elevation_profile,
        path
      })
    })
    .catch(errors.handleFetchError)
  }

  setStartLocationFromUserLocation = () => {
    navigator.geolocation.getCurrentPosition(result => {
      this.setStartLocation(result.coords)
    }, errors.handleGeoLocationError)
  }

  setStartLocationFromTextInput = () => {
    AlertIOS.prompt(
      'Enter a start address',
      null,
      startAddress => {
        api.geocode(startAddress)
        .then(coordinate => {
          this.setState({
            startAddress,
            startCoords: coordinate
          })
        })
        .catch(errors.handleError)
      }
    )
  }

  setStartLocation = coordinate => {
    this.setState({
      startCoords: coordinate
    }, () => {
      if (this.state.endCoords) {
        this.updateRoute()
      }
    })
    api.reverseGeocode(coordinate)
    .then(startAddress => {
      this.setState({startAddress})
    })
    .catch(errors.handleError)
  }

  setEndLocation = coordinate => {
    this.setState({
      endCoords: coordinate
    },
    this.updateRoute)

    api.reverseGeocode(coordinate)
    .then(endAddress => {
      this.setState({endAddress})
    })
    .catch(errors.handleError)
  }

  clearRoute = () => {
    this.setState({
      startCoords: null,
      endCoords: null,
      startAddress: null,
      endAddress: null,
      directions: null,
      elevationProfile: null,
      path: null
    })
    this.showWelcomeAlert()
  }

  componentDidMount() {
    this.showWelcomeAlert()
  }

  render() {
    StatusBar.setHidden(true)
    return (
      <View style={styles.container}>
        <View style={styles.mapContainer}>
          <Image source={require('./images/bikesy-logo.png')} style={styles.logo} />
          <Map
            setStartLocation={this.setStartLocation}
            setEndLocation={this.setEndLocation}
            startCoords={this.state.startCoords}
            endCoords={this.state.endCoords}
            startAddress={this.state.startAddress}
            endAddress={this.state.endAddress}
            path={this.state.path}
          />
          {this._renderClearButton()}
          {this._renderDirectionsButton()}
        </View>
        {this._renderResultSummary()}
        <Directions
          path={this.state.path}
          elevationProfile={this.state.elevationProfile}
          directions={this.state.directions}
          endAddress={this.state.endAddress}
          modalVisible={this.state.directionsVisible}
          hideModal={() => this.setState({directionsVisible: false})}
        />
      </View>
    )
  }

  _renderResultSummary() {
    if (this.state.path) {
      return (
        <View style={styles.resultSummary}>
          <Summary
            path={this.state.path}
            elevationProfile={this.state.elevationProfile}
          />
          <Elevation
            elevationProfile={this.state.elevationProfile}
          />
        </View>
      )
    }
  }

  _renderClearButton() {
    if (this.state.startCoords) {
      return (
        <View style={styles.clearButton}>
          <Button
            onPress={this.clearRoute}
            title="Clear"
            color="#1089f5"
            accessibilityLabel="Clear all route information"
          />
        </View>
      )
    }
  }

  _renderDirectionsButton() {
    if (this.state.path) {
      return (
        <View style={styles.directionsButton}>
          <Button
            onPress={() => this.setState({directionsVisible: true})}
            title="Directions"
            accessibilityLabel="Show directions"
          />
        </View>
      )
    }
  }

  _renderAddresses() {
    return (
      <View style={styles.addressSection}>
        {this._renderStartAddress()}
        {this._renderEndAddress()}
      </View>
    )
  }

  _renderStartAddress() {
    if (!this.state.startAddress) {
      return <View style={styles.addressContainer} />
    }

    return (
      <View style={styles.addressContainer}>
        <Text style={styles.addressLabel}>Start Address:</Text>
        <Text style={styles.address}>{this.state.startAddress}</Text>
      </View>
    )
  }

  _renderEndAddress() {
    if (!this.state.endAddress) {
      return <View style={styles.addressContainer} />
    }

    return (
      <View style={styles.addressContainer}>
        <Text style={styles.addressLabel}>End Address:</Text>
        <Text style={styles.address}>{this.state.endAddress}</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch'
  },
  mapContainer: {
    flex: 1
  },
  logo: {
    position: 'absolute',
    top: 35,
    left: 15,
    zIndex: 1
  },
  clearButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    zIndex: 1
  },
  directionsButton: {
    position: 'absolute',
    top: 35,
    right: 15,
    zIndex: 1,
    backgroundColor: '#ffffff'
  },
  resultSummary: {
    height: 120,
    maxHeight: 120,
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 4,
    paddingLeft: 8,
    paddingRight: 8
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
  }
})
