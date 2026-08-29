import React, { useCallback, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeftIcon, ShoppingCartIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { useStripe } from '@stripe/stripe-react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { CompraExitosaSheet } from '../components/CompraExitosaSheet';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { crearIntentoPago } from '../api/pagos';
import { ApiError } from '../api/client';
import type { PaqueteResponse } from '../api/types';
import { formatPrecio, formatVigencia } from '../utils/money';
import { generarClaveIdempotencia } from '../utils/idempotency';
import { colors, commonStyles, fontFamily, fontSize, fontWeight, radius } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Carrito'>;

export function CarritoScreen({ navigation }: Props) {
  const { token } = useAuth();
  const { items, totalCentavos, quitarItem, vaciar } = useCarrito();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [procesando, setProcesando] = useState(false);
  const [compraExitosa, setCompraExitosa] = useState<PaqueteResponse[] | null>(null);
  // Una clave por intento de pago (no por cada tap): si hay que reintentar
  // tras un timeout de red, se reusa para que el backend no duplique el pago.
  const claveIdempotenciaRef = useRef<string | null>(null);

  const handlePagar = useCallback(async () => {
    if (!token || items.length === 0 || procesando) {
      return;
    }
    const comprados = items;
    if (!claveIdempotenciaRef.current) {
      claveIdempotenciaRef.current = generarClaveIdempotencia();
    }
    setProcesando(true);
    try {
      const { clientSecret } = await crearIntentoPago(
        token,
        comprados.map(p => p.id),
        claveIdempotenciaRef.current,
      );
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Feeling Pilates',
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: { address: { country: 'MX' } },
      });
      if (initError) {
        Alert.alert('No se pudo iniciar el pago', initError.message);
        return;
      }
      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code !== 'Canceled') {
          Alert.alert('No se completó el pago', presentError.message);
        }
        return;
      }
      claveIdempotenciaRef.current = null;
      vaciar();
      setCompraExitosa(comprados);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Ocurrió un error inesperado';
      Alert.alert('No se pudo iniciar el pago', message);
    } finally {
      setProcesando(false);
    }
  }, [token, items, procesando, initPaymentSheet, presentPaymentSheet, vaciar]);

  return (
    <SafeAreaView style={commonStyles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} hitSlop={8} onPress={() => navigation.goBack()}>
          <ChevronLeftIcon color={colors.textPrimary} size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>Tu carrito</Text>
        <View style={styles.backBtn} />
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <ShoppingCartIcon color={colors.textMuted} size={40} />
          <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={styles.emptySubtitle}>
            Ve a Paquetes y elige los que quieras pagar juntos.
          </Text>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.list}>
              {items.map((paquete, index) => (
                <View
                  key={paquete.id}
                  style={[styles.row, index === items.length - 1 && styles.rowLast]}>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowNombre}>{paquete.nombre}</Text>
                    <Text style={styles.rowVigencia}>{formatVigencia(paquete.vigenciaDias)}</Text>
                  </View>
                  <Text style={styles.rowPrecio}>{formatPrecio(paquete.precioCentavos)}</Text>
                  <Pressable
                    hitSlop={8}
                    disabled={procesando}
                    onPress={() => quitarItem(paquete.id)}
                    style={styles.rowQuitar}>
                    <XMarkIcon color={colors.textMuted} size={18} />
                  </Pressable>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrecio(totalCentavos)}</Text>
            </View>
            <PrimaryButton label="Pagar" onPress={handlePagar} loading={procesando} />
          </View>
        </>
      )}

      <CompraExitosaSheet
        paquetes={compraExitosa}
        onClose={() => {
          setCompraExitosa(null);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    marginTop: 8,
  },
  emptySubtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    textAlign: 'center',
  },
  body: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  list: {
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowInfo: {
    flex: 1,
  },
  rowNombre: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  rowVigencia: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.smMedium,
    color: colors.textMuted,
  },
  rowPrecio: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  rowQuitar: {
    padding: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  totalLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  totalValue: {
    fontFamily: fontFamily.display,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.heading,
    color: colors.textPrimary,
  },
});
