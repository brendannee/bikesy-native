import React, { Component } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

interface Props {
  loading: boolean;
}

export default class Loading extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { loading } = this.props;

    if (!loading) {
      return null;
    }

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          animating={loading}
          color="#226fbe"
          size={'large'}
          style={styles.loading}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loading: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 40,
    borderRadius: 10,
    borderColor: '#bbbbbb',
    borderWidth: 1,
    width: 100,
    height: 100,
  },
});
