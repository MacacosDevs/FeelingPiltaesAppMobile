import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontFamily, fontSize, fontWeight } from '../theme';

export function EventsScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={[]}>
      <View style={styles.content}>
        <Text style={styles.icon}>◷</Text>
        <Text style={styles.title}>Próximamente</Text>
        <Text style={styles.subtitle}>
          Estamos preparando los eventos de Feeling Pilates. Vuelve pronto.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  icon: {
    fontSize: 32,
    color: colors.gold,
  },
  title: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.heading,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
