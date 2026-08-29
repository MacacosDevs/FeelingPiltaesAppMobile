import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckIcon } from 'react-native-heroicons/outline';
import { PrimaryButton } from './PrimaryButton';
import { colors, fontFamily, fontSize, fontWeight, radius } from '../theme';
import type { PaqueteResponse } from '../api/types';
import { formatPrecio, formatVigencia } from '../utils/money';

type CompraExitosaSheetProps = {
  paquetes: PaqueteResponse[] | null;
  onClose: () => void;
};

// Confirmación tras un pago exitoso, mismo lenguaje visual (círculo con check)
// que CourtBookingConfirmationScreen, en vez del Alert.alert nativo genérico.
// Acepta varios paquetes porque un checkout de carrito paga N paquetes en un
// solo PaymentIntent.
export function CompraExitosaSheet({ paquetes, onClose }: CompraExitosaSheetProps) {
  const esMultiple = (paquetes?.length ?? 0) > 1;
  const total = paquetes?.reduce((suma, p) => suma + p.precioCentavos, 0) ?? 0;

  return (
    <Modal visible={paquetes !== null} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.checkCircle}>
            <CheckIcon color={colors.background} size={28} />
          </View>
          {paquetes && (
            <>
              <Text style={styles.title}>¡Compra exitosa!</Text>
              <Text style={styles.subtitle}>
                {esMultiple
                  ? 'Ya puedes usar tus paquetes.'
                  : `Ya puedes usar tu paquete "${paquetes[0].nombre}".`}
              </Text>

              <View style={styles.infoList}>
                {paquetes.map((paquete, index) => (
                  <View
                    key={paquete.id}
                    style={[
                      styles.infoRow,
                      !esMultiple && index === paquetes.length - 1 && styles.infoRowLast,
                    ]}>
                    <View>
                      <Text style={styles.infoLabel}>{paquete.nombre}</Text>
                      <Text style={styles.infoSub}>{formatVigencia(paquete.vigenciaDias)}</Text>
                    </View>
                    <Text style={styles.infoValue}>{formatPrecio(paquete.precioCentavos)}</Text>
                  </View>
                ))}
                {esMultiple && (
                  <View style={[styles.infoRow, styles.infoRowLast]}>
                    <Text style={styles.infoLabel}>Total</Text>
                    <Text style={styles.infoValue}>{formatPrecio(total)}</Text>
                  </View>
                )}
              </View>

              <PrimaryButton label="Aceptar" onPress={onClose} />
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(43, 36, 32, 0.4)',
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 12,
  },
  checkCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    textAlign: 'center',
  },
  infoList: {
    width: '100%',
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  infoSub: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.smMedium,
    color: colors.textMuted,
  },
  infoValue: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
});
