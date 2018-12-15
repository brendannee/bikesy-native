/* @flow */

import {
  Alert
} from 'react-native'

exports.handleFetchError = (err) => {
  console.error(err)
  Alert.alert(
    'Error Fetching Route',
    'It looks like Bikesy\'s route server isn\'t working right now. Try again later.',
    [
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ],
    { cancelable: false }
  )
}

exports.handleError = (err) => {
  console.error(err)
  Alert.alert(
    'Unknown Error',
    'Something unexpected happened. Try again later.',
    [
      {text: 'OK'},
    ],
    { cancelable: false }
  )
}

exports.handleGeoLocationError = (err) => {
  console.error(err)
  Alert.alert(
    'Unable to geolocate you',
    'Choose a start location by clicking on the map',
    [
      {text: 'OK'},
    ],
    { cancelable: false }
  )
}