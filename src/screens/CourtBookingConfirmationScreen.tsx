import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckIcon } from 'react-native-heroicons/outline';
import { canchaById, horarioById, horarios } from '../data/canchas';
import { colors, fontFamily, fontSize, fontWeight, radius } from '../theme';
import { formatFullDate } from '../utils/date';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CourtBookingConfirmation'>;

export function CourtBookingConfirmationScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const activeHorario = horarioById(route.params.horarioId) ?? horarios[0];
  const cancha = canchaById(activeHorario.canchaId);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={[styles.body, { paddingBottom: 16 + insets.bottom }]}>
        <View style={styles.checkCircle}>
          <CheckIcon color={colors.background} size={28} />
        </View>
        <Text style={styles.title}>Cancha reservada</Text>

        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cancha</Text>
            <Text style={styles.infoValue}>{cancha?.nombre}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha</Text>
            <Text style={styles.infoValue}>
              {formatFullDate(activeHorario.fecha)} · {activeHorario.hora}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duración</Text>
            <Text style={styles.infoValue}>{route.params.duracionMin} min</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>Modalidad</Text>
            <Text style={styles.infoValue}>{route.params.modalidad}</Text>
          </View>
        </View>

        <Pressable
          style={styles.link}
          onPress={() => navigation.navigate('Main', { screen: 'Account' })}>
          <Text style={styles.linkLabel}>Ver mis reservas</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 60,
    gap: 20,
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
  infoList: {
    width: '100%',
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  infoValue: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  link: {
    marginTop: 'auto',
  },
  linkLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.accent,
  },
});
