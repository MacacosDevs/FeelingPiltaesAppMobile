import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Categoria } from '../data/clases';
import { colors, fontFamily, fontSize, fontWeight, radius } from '../theme';

type CategoryToggleProps = {
  value: Categoria;
  onChange: (value: Categoria) => void;
};

export function CategoryToggle({ value, onChange }: CategoryToggleProps) {
  return (
    <View style={styles.switcher}>
      <Pressable
        style={[styles.option, value === 'pilates' && styles.optionActive]}
        onPress={() => onChange('pilates')}>
        <Text style={[styles.label, value === 'pilates' && styles.labelActive]}>Pilates</Text>
      </Pressable>
      <Pressable
        style={[styles.option, value === 'bacufit' && styles.optionActive]}
        onPress={() => onChange('bacufit')}>
        <Text style={[styles.label, value === 'bacufit' && styles.labelActive]}>Bacu Fit</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  switcher: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    gap: 2,
    padding: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.chipBackground,
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  optionActive: {
    backgroundColor: colors.textPrimary,
    ...Platform.select({
      ios: {
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  label: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  labelActive: {
    fontWeight: fontWeight.medium,
    color: colors.surface,
  },
});
