import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PackageCard } from '../components/PackageCard';
import { colors, fontFamily, fontSize, fontWeight } from '../theme';

// No existe todavía un backend de paquetes/membresías de padel; esta
// pantalla usa contenido de referencia igual al diseño hasta que esa API
// exista (mismo criterio que PackagesScreen.tsx del lado Pilates).
const paquetes = [
  { nombre: '5 horas', precio: '$2,000', vigencia: 'Vigencia 30 días', unitario: '$400 c/u', destacado: false },
  { nombre: '10 horas', precio: '$3,600', vigencia: 'Vigencia 60 días', unitario: '$360 c/u', destacado: true },
  { nombre: '20 horas', precio: '$6,400', vigencia: 'Vigencia 90 días', unitario: '$320 c/u', destacado: false },
];

export function PadelPackagesScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={[]}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.header}>
          <Text style={styles.title}>Paquetes de horas</Text>
          <Text style={styles.subtitle}>Ahorra reservando por adelantado</Text>
        </View>

        {paquetes.map(paquete => (
          <PackageCard key={paquete.nombre} {...paquete} />
        ))}

        <Text style={styles.footerNote}>
          Las horas se pueden usar en cualquier cancha y horario disponible.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
