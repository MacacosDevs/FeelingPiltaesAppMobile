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
  seleccionado?: boolean;
  ctaLabel?: string;
  onPress?: (event: GestureResponderEvent) => void;
};

export function PackageCard({
  nombre,
  precio,
  vigencia,
  unitario,
  descripcion,
  destacado = false,
  seleccionado = false,
  ctaLabel,
  onPress,
}: PackageCardProps) {
  const label = ctaLabel ?? (seleccionado ? 'Quitar del carrito' : 'Agregar al carrito');
  return (
    <View style={[styles.card, destacado && styles.cardDestacado, seleccionado && styles.cardSeleccionado]}>
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
          seleccionado && styles.ctaSeleccionado,
          pressed && styles.ctaPressed,
        ]}
        onPress={onPress}>
        <Text
          style={[
            styles.ctaLabel,
            destacado ? styles.ctaLabelDestacado : styles.ctaLabelDefault,
            seleccionado && styles.ctaLabelSeleccionado,
          ]}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
    gap: 6,
    ...shadows.card,
  },
  cardDestacado: {
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  cardSeleccionado: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  badge: {
    position: 'absolute',
    top: -12,
    right: 18,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.xs + 1,
    color: colors.surface,
  },
  nombre: {
    fontFamily: fontFamily.display,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.lg - 2,
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
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 6,
    marginBottom: 8,
  },
  precio: {
    fontFamily: fontFamily.display,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.heading + 2,
    color: colors.accent,
  },
  unitario: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  textOnDark: {
    color: colors.textPrimary,
  },
  textMetaOnDark: {
    color: colors.textMuted,
  },
  cta: {
    height: 46,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  ctaDefault: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  ctaDestacado: {
    backgroundColor: colors.accent,
  },
  ctaSeleccionado: {
    backgroundColor: colors.textPrimary,
    borderWidth: 0,
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.md,
  },
  ctaLabelDefault: {
    color: colors.textPrimary,
  },
  ctaLabelDestacado: {
    color: colors.surface,
  },
  ctaLabelSeleccionado: {
    color: colors.surface,
  },
});
