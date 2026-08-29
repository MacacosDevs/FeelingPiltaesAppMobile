import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BellIcon, ShoppingBagIcon } from 'react-native-heroicons/outline';
import { SparkleIcon } from './LumaArt';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { colors, fontFamily, fontSize, fontWeight, radius, shadows } from '../theme';
import type { RootStackParamList } from '../navigation/types';

export function TopBar() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { items } = useCarrito();
  const esInstructor = user?.roles.includes('INSTRUCTOR') ?? false;

  const primerNombre = user?.nombre ? user.nombre.split(' ')[0] : null;

  return (
    <View style={styles.topBar}>
      <View style={styles.leftContainer}>
        <SparkleIcon size={20} color={colors.sage} />
        {primerNombre ? (
          <Text style={styles.greetingText}>
            Hola, <Text style={styles.userName}>{primerNombre}</Text>
          </Text>
        ) : (
          <Text style={styles.brandTitle}>Feeling Pilates</Text>
        )}
      </View>

      <View style={styles.rightActions}>
        {!esInstructor && (
          <Pressable
            style={styles.actionBtn}
            hitSlop={8}
            onPress={() => navigation.navigate('Carrito')}>
            <ShoppingBagIcon color={colors.textPrimary} size={20} />
            {items.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeLabel}>{items.length}</Text>
              </View>
            )}
          </Pressable>
        )}

        <Pressable
          style={styles.actionBtn}
          hitSlop={8}
          onPress={() => navigation.navigate('Main', { screen: 'Eventos' })}>
          <BellIcon color={colors.textPrimary} size={20} />
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
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greetingText: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.lg - 2,
    color: colors.textPrimary,
  },
  userName: {
    fontFamily: fontFamily.display,
    color: colors.textPrimary,
  },
  brandTitle: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.lg - 2,
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.xs,
    color: colors.surface,
  },
});
