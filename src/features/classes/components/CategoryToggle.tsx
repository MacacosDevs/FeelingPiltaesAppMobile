import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Categoria } from '@/data/clases';
import { colors, fontFamily, fontSize, fontWeight, radius, shadows } from '@/theme';

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
    borderWidth: 1,
    borderColor: colors.border,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  optionActive: {
    backgroundColor: colors.accent,
    ...shadows.card,
  },
  label: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  labelActive: {
    fontWeight: fontWeight.semibold,
    color: colors.surface,
  },
});
