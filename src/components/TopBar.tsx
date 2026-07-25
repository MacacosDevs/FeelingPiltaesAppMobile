import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand } from './Brand';
import { useSportMode } from '../context/SportModeContext';
import { colors, fontFamily, fontSize, fontWeight, radius } from '../theme';

export function TopBar() {
  const { sport, setSport } = useSportMode();

  return (
    <View style={styles.topBar}>
      <Brand label="Feeling Pilates" />

      <View style={styles.switcher}>
        <Pressable
          style={[styles.switchOption, sport === 'pilates' && styles.switchOptionActive]}
          onPress={() => setSport('pilates')}>
          <Text style={[styles.switchLabel, sport === 'pilates' && styles.switchLabelActive]}>
            Pilates
          </Text>
        </Pressable>
        <Pressable
          style={[styles.switchOption, sport === 'padel' && styles.switchOptionActive]}
          onPress={() => setSport('padel')}>
          <Text style={[styles.switchLabel, sport === 'padel' && styles.switchLabelActive]}>
            Padel
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  switcher: {
    flexDirection: 'row',
    gap: 2,
    padding: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.chipBackground,
  },
  switchOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  switchOptionActive: {
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
  switchLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.smMedium,
    color: colors.textMuted,
  },
  switchLabelActive: {
    fontWeight: fontWeight.medium,
    color: colors.surface,
  },
});
