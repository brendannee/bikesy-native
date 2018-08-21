import React from 'react'
import {
  Alert,
  AlertIOS,
  AppRegistry,
  Image,
  ScrollView ,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native'

import Directions from './components/directions'
import Map from './components/map'

import polyline from '@mapbox/polyline'

const api = require('./services/api')
const errors = require('./components/errors')
const config = require('./config.json')

import globalStyles from './styles/styles'

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
        <Map
          setStartLocation={this.setStartLocation}
          setEndLocation={this.setEndLocation}
          startCoords={this.state.startCoords}
          endCoords={this.state.endCoords}
          startAddress={this.state.startAddress}
          endAddress={this.state.endAddress}
          path={this.state.path}
          clearRoute={this.clearRoute}
          showDirections={() => {this.setState({directionsVisible: true})}}
          elevationProfile={this.state.elevationProfile}
        />
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
