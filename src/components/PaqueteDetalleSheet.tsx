import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { OutlineButton } from './OutlineButton';
import { PrimaryButton } from './PrimaryButton';
import { colors, fontFamily, fontSize, fontWeight, radius } from '../theme';
import type { PaqueteResponse } from '../api/types';
import { formatPrecio, formatVigencia } from '../utils/money';

type PaqueteDetalleSheetProps = {
  paquete: PaqueteResponse | null;
  procesando: boolean;
  onClose: () => void;
  onPagar: () => void;
};

// Detalle del paquete antes de pagar: separa "elegir paquete" (ver info) de
// "pagar" (dispara el PaymentIntent y abre la hoja de Stripe), para que el
// alumno confirme qué está comprando antes de que aparezca el cobro.
export function PaqueteDetalleSheet({ paquete, procesando, onClose, onPagar }: PaqueteDetalleSheetProps) {
  return (
    <Modal visible={paquete !== null} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={procesando ? undefined : onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.handle} />
          {paquete && (
            <>
              <Text style={styles.nombre}>{paquete.nombre}</Text>
              <Text style={styles.vigencia}>{formatVigencia(paquete.vigenciaDias)}</Text>
              {paquete.descripcion && <Text style={styles.descripcion}>{paquete.descripcion}</Text>}

              <View style={styles.priceRow}>
                <Text style={styles.precio}>{formatPrecio(paquete.precioCentavos)}</Text>
                {paquete.unitarioTexto && <Text style={styles.unitario}>{paquete.unitarioTexto}</Text>}
              </View>

              <View style={styles.actions}>
                <View style={styles.actionItem}>
                  <OutlineButton label="Cancelar" onPress={onClose} disabled={procesando} />
                </View>
                <View style={styles.actionItem}>
                  <PrimaryButton label="Pagar" onPress={onPagar} loading={procesando} />
                </View>
              </View>
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
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
  },
  nombre: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  vigencia: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    marginTop: -8,
  },
  descripcion: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
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
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionItem: {
    flex: 1,
  },
});
