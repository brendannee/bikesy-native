/* @flow */

import React, { Component } from 'react'
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Linking,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native'
import {FontAwesome} from '@expo/vector-icons'

import globalStyles from '../styles/styles'

type Props = {
  modalVisible: boolean,
  hideModal: () => mixed
}

class About extends Component<Props> {
  constructor(props: Props) {
    super(props)
  }

  render() {
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={this.props.modalVisible}
        onRequestClose={this.props.hideModal}
      >
        <SafeAreaView style={{flex: 1}}>
          <View style={styles.modalContent}>
            <Image source={require('../assets/images/bikesy-logo.png')} style={styles.aboutLogo} />
            <TouchableOpacity
             onPress={this.props.hideModal}
             style={styles.closeButton}
            >
              <View style={styles.button}>
                <FontAwesome name="close" size={24} style={styles.buttonIconSingle} />
              </View>
            </TouchableOpacity>
            <ScrollView>
              <Text style={styles.aboutTitle}>About Bikesy</Text>
              <Text style={styles.paragraph}>Welcome to Bikesy – an innovative and open bike mapping system specially designed to find flat, safe, and fast routes anywhere in the SF Bay Area.</Text>

              <Text style={styles.paragraph}>We’ve never seen so many features, and we bet you haven’t either.</Text>
              <Text style={styles.sectionTitle}>Avoid those uphill climbs.</Text>
              <Text style={styles.paragraph}>San Francisco isn’t New York – they might have taller buildings, but we’ve got bigger hills. Since we couldn’t find another service that lets you choose slightly longer but less steep routes, we made our own. Even better, Bikesy automatically gives you an elevation profile for your ride to help you prepare for the tough parts.</Text>
              <Text style={styles.sectionTitle}>Safety is our number one priority.</Text>
              <Text style={styles.paragraph}>It’s not just hills that matter. In a region with as much traffic as the Bay Area, you’ll want to stay on bike lanes or paths whenever possible. Bikesy gives the flattest AND safest ways to get around.</Text>
              <Text style={styles.sectionTitle}>3 x 3 = 9.</Text>
              <Text style={styles.paragraph}>We know that one size doesn’t fit all, and our simple interface automatically chooses nine routes for you to pick from, ranging from the safest and most flat to the shortest and steepest. It’s easy to choose among three hill tolerances and three levels of safety (safe, safer, and safest) to find a path that’s right for you.</Text>
              <Text style={styles.sectionTitle}>We’re serious about open source.</Text>
              <Text style={styles.paragraph}>This part is a little geeky, but our back-end and front-end code is completely open. Plus, all our data is from OpenStreetMap, so you can edit the underlying map if you think we’ve got it wrong. Don’t like what we’ve done? Take our code and do it yourself! Or use our API to power your own app.</Text>
              <Text style={styles.sectionTitle}>Wait, who are you?</Text>
              <Text style={styles.paragraph}>Bikesy was started by <Text onPress={() => Linking.openURL('https://blinktag.com')}>BlinkTag Inc</Text> with very large contributions from Jerry Jariyasunant and Brandon Martin-Anderson.</Text>
            </ScrollView>

          </View>
        </SafeAreaView>
      </Modal>
    )
  }
}

const styles = StyleSheet.create(Object.assign({}, globalStyles, {
  aboutLogo: {
    marginBottom: 10
  },

  aboutTitle: {
    fontSize: 24,
    paddingBottom: 10
  },

  closeButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 1,
  },
}))

module.exports = About
