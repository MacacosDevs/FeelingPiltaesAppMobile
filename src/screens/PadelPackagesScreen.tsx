import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PackageCard } from '../components/PackageCard';
import { AuthRequiredSheet } from '../components/AuthRequiredSheet';
import { useAuth } from '@/features/auth';
import { colors, commonStyles, fontFamily, fontSize, fontWeight } from '../theme';
import type { MainTabParamList, RootStackParamList } from '@/app/navigation/types';

type PadelPackagesNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Paquetes'>,
  NativeStackNavigationProp<RootStackParamList>
>;

// No existe todavía un backend de paquetes/membresías de padel; esta
// pantalla usa contenido de referencia igual al diseño hasta que esa API
// exista (mismo criterio que PackagesScreen.tsx del lado Pilates).
const paquetes = [
  { nombre: '5 horas', precio: '$2,000', vigencia: 'Vigencia 30 días', unitario: '$400 c/u', destacado: false },
  { nombre: '10 horas', precio: '$3,600', vigencia: 'Vigencia 60 días', unitario: '$360 c/u', destacado: true },
  { nombre: '20 horas', precio: '$6,400', vigencia: 'Vigencia 90 días', unitario: '$320 c/u', destacado: false },
];

export function PadelPackagesScreen() {
  const navigation = useNavigation<PadelPackagesNavigationProp>();
  const { user } = useAuth();
  const [authGateOpen, setAuthGateOpen] = useState(false);

  function handleElegirPaquete() {
    if (!user) {
      setAuthGateOpen(true);
    }
  }

  return (
    <SafeAreaView style={commonStyles.screen} edges={[]}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.header}>
          <Text style={styles.title}>Paquetes de horas</Text>
          <Text style={styles.subtitle}>Ahorra reservando por adelantado</Text>
        </View>

        {paquetes.map(paquete => (
          <PackageCard
            key={paquete.nombre}
            {...paquete}
            ctaLabel="Elegir paquete"
            onPress={handleElegirPaquete}
          />
        ))}

        <Text style={styles.footerNote}>
          Las horas se pueden usar en cualquier cancha y horario disponible.
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: 28,
    paddingVertical: 36,
    gap: 24,
  },
  header: {
    gap: 2,
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
  footerNote: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.smMedium,
    color: colors.textMuted,
  },
});
