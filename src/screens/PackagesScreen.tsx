import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStripe } from '@stripe/stripe-react-native';
import { PackageCard } from '../components/PackageCard';
import { AuthRequiredSheet } from '../components/AuthRequiredSheet';
import { PaqueteDetalleSheet } from '../components/PaqueteDetalleSheet';
import { CompraExitosaSheet } from '../components/CompraExitosaSheet';
import { useAuth } from '../context/AuthContext';
import { useSportMode } from '../context/SportModeContext';
import { PadelPackagesScreen } from './PadelPackagesScreen';
import { listarPaquetes } from '../api/paquetes';
import { crearIntentoPago } from '../api/pagos';
import { ApiError } from '../api/client';
import type { PaqueteResponse } from '../api/types';
import { formatPrecio, formatVigencia } from '../utils/money';
import { colors, commonStyles, fontFamily, fontSize, fontWeight } from '../theme';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';

type PackagesNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Paquetes'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const SECCION_LABELS: Record<PaqueteResponse['categoria'], string> = {
  pilates: 'Pilates',
  bacu_fit: 'Bacu Fit',
  combo: 'Combo Pilates + Bacu Fit',
};

const ORDEN_SECCIONES: PaqueteResponse['categoria'][] = ['pilates', 'bacu_fit', 'combo'];

export function PackagesScreen() {
  const navigation = useNavigation<PackagesNavigationProp>();
  const { user, token } = useAuth();
  const { sport } = useSportMode();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [paquetes, setPaquetes] = useState<PaqueteResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [paqueteSeleccionado, setPaqueteSeleccionado] = useState<PaqueteResponse | null>(null);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [compraExitosa, setCompraExitosa] = useState<PaqueteResponse | null>(null);

  useEffect(() => {
    listarPaquetes()
      .then(setPaquetes)
      .catch(() => setPaquetes([]))
      .finally(() => setCargando(false));
  }, []);

  const handleElegirPaquete = useCallback(
    (paquete: PaqueteResponse) => {
      if (!user || !token) {
        setAuthGateOpen(true);
        return;
      }
      setPaqueteSeleccionado(paquete);
    },
    [user, token],
  );

  const handleCerrarDetalle = useCallback(() => {
    if (procesandoPago) {
      return;
    }
    setPaqueteSeleccionado(null);
  }, [procesandoPago]);

  const handlePagar = useCallback(async () => {
    if (!token || !paqueteSeleccionado || procesandoPago) {
      return;
    }
    const paquete = paqueteSeleccionado;
    setProcesandoPago(true);
    try {
      const { clientSecret } = await crearIntentoPago(token, paquete.id);
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
      setPaqueteSeleccionado(null);
      setCompraExitosa(paquete);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Ocurrió un error inesperado';
      Alert.alert('No se pudo iniciar el pago', message);
    } finally {
      setProcesandoPago(false);
    }
  }, [token, paqueteSeleccionado, procesandoPago, initPaymentSheet, presentPaymentSheet]);

  if (sport === 'padel') {
    return <PadelPackagesScreen />;
  }

  const secciones = ORDEN_SECCIONES.map(categoria => ({
    key: categoria,
    titulo: SECCION_LABELS[categoria],
    paquetes: paquetes.filter(p => p.categoria === categoria),
  })).filter(seccion => seccion.paquetes.length > 0);

  return (
    <SafeAreaView style={commonStyles.screen} edges={[]}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.header}>
          <Text style={styles.title}>Paquetes</Text>
          <Text style={styles.subtitle}>Elige el que se ajuste a tu ritmo</Text>
        </View>

        {cargando && <ActivityIndicator color={colors.accent} />}

        {!cargando &&
          secciones.map(seccion => (
            <View key={seccion.key} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>{seccion.titulo}</Text>
              </View>
              <View style={styles.sectionPackages}>
                {seccion.paquetes.map(paquete => (
                  <PackageCard
                    key={paquete.id}
                    nombre={paquete.nombre}
                    precio={formatPrecio(paquete.precioCentavos)}
                    vigencia={formatVigencia(paquete.vigenciaDias)}
                    unitario={paquete.unitarioTexto ?? ''}
                    descripcion={paquete.descripcion ?? undefined}
                    destacado={paquete.destacado}
                    onPress={() => handleElegirPaquete(paquete)}
                  />
                ))}
              </View>
            </View>
          ))}

        <Text style={styles.footerNote}>
          Al comprar un nuevo paquete antes de que expire el actual, el tiempo
          restante se suma automáticamente.
        </Text>
      </ScrollView>

      <AuthRequiredSheet
        visible={authGateOpen}
        message="Necesitas iniciar sesión o crear una cuenta para comprar un paquete."
        onClose={() => setAuthGateOpen(false)}
        onLogin={() => {
          setAuthGateOpen(false);
          navigation.navigate('Auth', { mode: 'login' });
        }}
      />

      <PaqueteDetalleSheet
        paquete={paqueteSeleccionado}
        procesando={procesandoPago}
        onClose={handleCerrarDetalle}
        onPagar={handlePagar}
      />

      <CompraExitosaSheet paquete={compraExitosa} onClose={() => setCompraExitosa(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: 28,
    paddingVertical: 36,
    gap: 40,
  },
  header: {
    gap: 6,
  },
  title: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  sectionLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.lg,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionPackages: {
    gap: 16,
  },
  footerNote: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.smMedium,
    color: colors.textMuted,
  },
});
