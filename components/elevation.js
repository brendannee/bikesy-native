import _ from 'lodash'
import React from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { Svg } from 'expo'
import { VictoryAxis, VictoryChart, VictoryLine, VictoryLabel } from "victory-native"

const formatters = require('./formatters')

class Elevation extends React.Component {
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

  render() {
    const {width} = Dimensions.get('window')
    const data = this.formatElevationProfile()
    const yDomain = this.getYDomain(data)

    return (
      <View style={styles.elevation}>
        <Svg height="70" width={width - 5}>
          <VictoryLabel
            x={0}
            y={5}
            text={`${Math.round(yDomain[1])} ft`}
          />
          <VictoryLabel
            x={0}
            y={62}
            text={`${Math.round(yDomain[0])} ft`}
          />
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
            padding={{top: 0, bottom: 0, left: 35, right: 0}}
            width={width}
            height={70}
          />
        </Svg>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  elevation: {
    position: 'absolute',
    top: 33,
    left: 5,
    right: 0
  }
})

module.exports = Elevation
