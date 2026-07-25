import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, fontSize, fontWeight, radius } from '../theme';
import { capacityColor } from '../utils/capacity';

type CapacityIndicatorProps = {
  ocupados: number;
  capacidad: number;
  size?: 'sm' | 'md';
};

export function CapacityIndicator({ ocupados, capacidad, size = 'sm' }: CapacityIndicatorProps) {
  const color = capacityColor(ocupados, capacidad);
  const pct = Math.min(100, Math.round((ocupados / capacidad) * 100));
  const isSmall = size === 'sm';

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color }, isSmall && styles.labelSm]}>
        {ocupados}/{capacidad} lugares
      </Text>
      <View style={[styles.track, isSmall ? styles.trackSm : styles.trackMd]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 4,
  },
  label: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
  },
  labelSm: {
    fontSize: fontSize.xs,
  },
  track: {
    width: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  trackSm: {
    height: 4,
  },
  trackMd: {
    height: 6,
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
