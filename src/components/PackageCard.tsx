import React from 'react';
import { GestureResponderEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, fontSize, fontWeight, radius, shadows } from '../theme';

type PackageCardProps = {
  nombre: string;
  precio: string;
  vigencia: string;
  unitario: string;
  descripcion?: string;
  destacado?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
};

export function PackageCard({
  nombre,
  precio,
  vigencia,
  unitario,
  descripcion,
  destacado = false,
  onPress,
}: PackageCardProps) {
  return (
    <View style={[styles.card, destacado && styles.cardDestacado]}>
      {destacado && (
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>Más popular</Text>
        </View>
      )}

      <Text style={[styles.nombre, destacado && styles.textOnDark]}>{nombre}</Text>
      <Text style={[styles.vigencia, destacado && styles.textMetaOnDark]}>{vigencia}</Text>
      {descripcion && (
        <Text style={[styles.descripcion, destacado && styles.textMetaOnDark]}>{descripcion}</Text>
      )}

      <View style={styles.priceRow}>
        <Text style={[styles.precio, destacado && styles.textOnDark]}>{precio}</Text>
        <Text style={[styles.unitario, destacado && styles.textMetaOnDark]}>{unitario}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.cta,
          destacado ? styles.ctaDestacado : styles.ctaDefault,
          pressed && styles.ctaPressed,
        ]}
        onPress={onPress}>
        <Text style={[styles.ctaLabel, destacado ? styles.ctaLabelDestacado : styles.ctaLabelDefault]}>
          Elegir paquete
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 4,
    ...shadows.card,
  },
  cardDestacado: {
    borderWidth: 0,
    backgroundColor: colors.textPrimary,
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 4,
  },
  badge: {
    position: 'absolute',
    top: -12,
    right: 18,
    backgroundColor: colors.gold,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  nombre: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  vigencia: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  descripcion: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 8,
    marginBottom: 12,
  },
  precio: {
    fontFamily: fontFamily.display,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.heading,
    color: colors.textPrimary,
  },
  unitario: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  textOnDark: {
    color: colors.background,
  },
  textMetaOnDark: {
    color: colors.borderStrong,
  },
  cta: {
    height: 42,
    borderRadius: radius.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDefault: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  ctaDestacado: {
    backgroundColor: colors.gold,
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.md,
  },
  ctaLabelDefault: {
    color: colors.textPrimary,
  },
  ctaLabelDestacado: {
    color: colors.textPrimary,
  },
});
