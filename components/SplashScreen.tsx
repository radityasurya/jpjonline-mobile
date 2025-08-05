import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
    );

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    rotateAnimation.start();

    return () => {
      rotateAnimation.stop();
    };
  }, [fadeAnim, scaleAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.logoImageContainer,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>
        <Text style={styles.logoText}>JPJOnline</Text>
        <Text style={styles.tagline}>Digital Learning System</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#facc15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoImageContainer: {
    marginBottom: 20,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontFamily: 'Arvo-BoldItalic',
    color: '#333333',
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#888888',
    marginTop: 16,
    textAlign: 'center',
  },
});
