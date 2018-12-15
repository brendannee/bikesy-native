/* @flow */

import React, { Component } from 'react'
import _ from 'lodash'
import { Dimensions, StyleSheet, View, Text } from 'react-native'
import { VictoryLine } from "victory-native"

const formatters = require('../services/formatters')

type Props = {
  elevationProfile: Array<[number, number]>
}

type State = {
  width: number,
  key: number
}

class Elevation extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      width: 0,
      key: 1
    }
  }

  getYDomain(elevationProfile) {
    return elevationProfile.reduce((memo, item) => {
      return [Math.min(memo[0], item.elevation), Math.max(memo[1], item.elevation)]
    }, [Infinity, -Infinity])
  }

  formatElevationProfile() {
    return this.props.elevationProfile.map((item) => {
      return {
        elevation: formatters.metersToFeet(item[1]),
        distance: formatters.metersToMiles(item[0]),
      }
    })
  }

  componentDidMount() {
    const {width} = Dimensions.get('window')
    this.setState({
      width
    })

    Dimensions.addEventListener('change', () => {
      // Key parameter forces SVG to redraw on size change
      const {width} = Dimensions.get('window')
      this.setState({
        width,
        key: this.state.key + 1
      })
    })
  }

  render() {
    const data = this.formatElevationProfile()
    const yDomain = this.getYDomain(data)
    const {width, key} = this.state

    return (
      <View style={styles.elevation}>
        <VictoryLine
          style={{
            data: { stroke: "rgb(222, 73, 69)", strokeWidth: 2 }
          }}
          interpolation={"natural"}
          data={data}
          x={"distance"}
          y={"elevation"}
          animate={{
            duration: 1000,
            onLoad: { duration: 500 }
          }}
          domainPadding={{x: 10, y: 2}}
          padding={{top: 0, bottom: 0, left: 40, right: 0}}
          width={width}
          height={70}
        />
        <Text style={styles.elevationLabelTop}>{Math.round(yDomain[1])} ft</Text>
        <Text style={styles.elevationLabelBottom}>{Math.round(yDomain[0])} ft</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  elevation: {
    position: 'absolute',
    top: 33,
    left: 0,
    right: 0
  },

  elevationLabelTop: {
    position: 'absolute',
    top: 0,
    left: 3,
    fontSize: 10,
    textAlign: 'right',
    width: 30
  },

  elevationLabelBottom: {
    position: 'absolute',
    top: 60,
    left: 3,
    fontSize: 10,
    textAlign: 'right',
    width: 30
  }
})

module.exports = Elevation
