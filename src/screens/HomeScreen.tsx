import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand } from '../components/Brand';
import { colors, fontFamily, fontSize, fontWeight, radius } from '../theme';

const heroImage = require('../assets/images/pilates-hero.jpg');
const avatarImage = require('../assets/images/avatar-placeholder.jpg');

const navItems = [
  { key: 'Inicio', icon: '●', active: true },
  { key: 'Clases', icon: '▤', active: false },
  { key: 'Paquetes', icon: '◆', active: false },
  { key: 'Eventos', icon: '◷', active: false },
  { key: 'Menú', icon: '○', active: false },
] as const;

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Brand label="Feeling Pilates" />

        <View style={styles.switcher}>
          <View style={styles.switchPilates}>
            <Text style={styles.switchPilatesLabel}>Pilates</Text>
          </View>
          <View style={styles.switchPadel}>
            <Text style={styles.switchPadelLabel}>Padel</Text>
          </View>
        </View>

        <View style={styles.accountEntry}>
          <Image source={avatarImage} style={styles.avatar} />
          <Text style={styles.chevron}>⌄</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Image source={heroImage} style={styles.hero} />
        <Text style={styles.kicker}>FEELING  ·  PILATES</Text>
        <Text style={styles.headline}>Tu espacio de movimiento y calma</Text>
        <Text style={styles.subtitle}>
          Reserva tus clases, paquetes y horarios favoritos en un solo lugar.
        </Text>
      </View>

      <View style={styles.navBar}>
        {navItems.map(item => (
          <View key={item.key} style={styles.navItem}>
            <Text
              style={[
                styles.navIcon,
                { color: item.active ? colors.accent : colors.navInactive },
              ]}>
              {item.icon}
            </Text>
            <Text
              style={[
                styles.navLabel,
                { color: item.active ? colors.accent : colors.textMuted },
              ]}>
              {item.key}
            </Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  switcher: {
    flexDirection: 'row',
    gap: 2,
    padding: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.chipBackground,
  },
  switchPilates: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.textPrimary,
  },
  switchPilatesLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.smMedium,
    color: colors.surface,
  },
  switchPadel: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  switchPadelLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.smMedium,
    color: colors.textMuted,
  },
  accountEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
  },
  chevron: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 90,
    gap: 24,
  },
  hero: {
    width: '100%',
    height: 380,
    borderRadius: 4,
  },
  kicker: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    color: colors.accent,
    textAlign: 'center',
  },
  headline: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
  navBar: {
    height: 55,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navItem: {
    alignItems: 'center',
    gap: 3,
  },
  navIcon: {
    fontSize: 14,
  },
  navLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.xs,
  },
});
