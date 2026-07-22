import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, fontSize, fontWeight } from '../theme';

const logoMark = require('../assets/images/logo-mark.png');

type BrandProps = {
  label?: string;
};

export function Brand({ label = 'Feeling Pilates' }: BrandProps) {
  return (
    <View style={styles.container}>
      <Image source={logoMark} style={styles.logoMark} resizeMode="contain" />
      <Text style={styles.wordmark}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoMark: {
    width: 73,
    height: 34,
  },
  wordmark: {
    color: colors.textPrimary,
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.md,
  },
});
