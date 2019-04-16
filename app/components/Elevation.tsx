import _ from 'lodash';
import React, { Component } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { VictoryLine } from "victory-native";

import { metersToFeet, metersToMiles } from '../services/formatters';

interface Props {
  elevationProfile: Array<[number, number]>;
}

interface State {
  width: number;
  key: number;
}

export default class Elevation extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      key: 1,
      width: 0,
    };
  }

  getYDomain(elevationProfile) {
    return elevationProfile.reduce((memo, item) => {
      return [Math.min(memo[0], item.elevation), Math.max(memo[1], item.elevation)]
    }, [Infinity, -Infinity]);
  }

  formatElevationProfile() {
    return this.props.elevationProfile.map(item => {
      return {
        distance: metersToMiles(item[0]),
        elevation: metersToFeet(item[1]),
      };
    });
  }

  componentDidMount() {
    const { width } = Dimensions.get('window');
    this.setState({
      width,
    });

    Dimensions.addEventListener('change', () => {
      // Key parameter forces SVG to redraw on size change
      const { width } = Dimensions.get('window');
      this.setState({
        key: this.state.key + 1,
        width,
      });
    });
  }

  render() {
    const data = this.formatElevationProfile();
    const yDomain = this.getYDomain(data);
    const {width, key} = this.state;

    return (
      <View style={styles.elevation}>
        <VictoryLine
          style={{
            data: { stroke: 'rgb(222, 73, 69)', strokeWidth: 2 },
          }}
          interpolation="natural"
          data={data}
          x="distance"
          y="elevation"
          animate={{
            duration: 1000,
            onLoad: { duration: 500 },
          }}
          domainPadding={{ x: 10, y: 2 }}
          padding={{ top: 0, bottom: 0, left: 40, right: 0 }}
          width={width}
          height={70}
        />
        <Text style={styles.elevationLabelTop}>{Math.round(yDomain[1])} ft</Text>
        <Text style={styles.elevationLabelBottom}>{Math.round(yDomain[0])} ft</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  elevation: {
    left: 0,
    position: 'absolute',
    right: 0,
    bottom: 33,
  },

  elevationLabelTop: {
    fontSize: 10,
    left: 3,
    position: 'absolute',
    textAlign: 'right',
    top: 0,
    width: 30,
  },

  elevationLabelBottom: {
    fontSize: 10,
    left: 3,
    position: 'absolute',
    textAlign: 'right',
    top: 60,
    width: 30,
  },
});
