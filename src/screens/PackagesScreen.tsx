import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PackageCard } from '../components/PackageCard';
import { CategoryToggle } from '../components/CategoryToggle';
import { useSportMode } from '../context/SportModeContext';
import { PadelPackagesScreen } from './PadelPackagesScreen';
import type { Categoria } from '../data/clases';
import { colors, fontFamily, fontSize, fontWeight } from '../theme';

// No existe todavía un backend de paquetes/membresías; esta pantalla usa
// contenido de referencia igual al diseño hasta que esa API exista.
const paquetesClases = [
  { nombre: '4 clases', precio: '$900', vigencia: 'Vigencia 30 días', unitario: '$225 c/u', destacado: false },
  { nombre: '8 clases', precio: '$1,600', vigencia: 'Vigencia 45 días', unitario: '$200 c/u', destacado: true },
  { nombre: '12 clases', precio: '$2,160', vigencia: 'Vigencia 60 días', unitario: '$180 c/u', destacado: false },
];

const paquetesBacuFit = [
  { nombre: '4 rentas Bacu Fit', precio: '$1,000', vigencia: 'Vigencia 30 días', unitario: '$250 c/u', destacado: false },
  { nombre: '8 rentas Bacu Fit', precio: '$1,840', vigencia: 'Vigencia 45 días', unitario: '$230 c/u', destacado: true },
  { nombre: '12 rentas Bacu Fit', precio: '$2,520', vigencia: 'Vigencia 60 días', unitario: '$210 c/u', destacado: false },
];

const SUBTITULOS: Record<Categoria, string> = {
  pilates: 'Elige el que se ajuste a tu ritmo',
  bacufit: 'Renta de máquina Bacu Fit por paquete',
};

export function PackagesScreen() {
  const { sport } = useSportMode();
  const [categoria, setCategoria] = useState<Categoria>('pilates');

  if (sport === 'padel') {
    return <PadelPackagesScreen />;
  }

  const paquetes = categoria === 'pilates' ? paquetesClases : paquetesBacuFit;

  return (
    <SafeAreaView style={styles.screen} edges={[]}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Paquetes</Text>
            <CategoryToggle value={categoria} onChange={setCategoria} />
          </View>
          <Text style={styles.subtitle}>{SUBTITULOS[categoria]}</Text>
        </View>

        {paquetes.map(paquete => (
          <PackageCard key={paquete.nombre} {...paquete} />
        ))}

        <Text style={styles.footerNote}>
          Al comprar un nuevo paquete antes de que expire el actual, el tiempo
          restante se suma automáticamente.
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
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
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
