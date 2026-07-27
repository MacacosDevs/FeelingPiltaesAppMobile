import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme';

const logoMark = require('../assets/images/logo-mark.png');

const RING_SIZE = 108;
const RING_BORDER_WIDTH = 4;
const LOGO_SIZE = 56;

export function FullScreenLoader() {
  const rotation = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [rotation, fade]);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, { opacity: fade }]}>
      <View style={styles.ringWrap}>
        <Animated.View style={[styles.ring, { transform: [{ rotate: spin }] }]} />
        <Animated.Image source={logoMark} style={styles.logo} resizeMode="contain" />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(43, 36, 32, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: radius.pill,
    borderWidth: RING_BORDER_WIDTH,
    borderColor: colors.border,
    borderTopColor: colors.accent,
    borderRightColor: colors.gold,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
});
