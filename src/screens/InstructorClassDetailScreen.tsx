import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { CheckCircleIcon } from 'react-native-heroicons/solid';
import { PrimaryButton } from '../components/PrimaryButton';
import { CapacityIndicator } from '../components/CapacityIndicator';
import { Avatar } from '../components/Avatar';
import { useAttendance } from '../context/AttendanceContext';
import { clases } from '../data/clases';
import { mockAttendeesFor } from '../data/mockAttendees';
import { ACTIVITY_META } from '../utils/activityMeta';
import { colors, commonStyles, fontFamily, fontSize, fontWeight, radius } from '../theme';
import { formatFullDate } from '../utils/date';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'InstructorClassDetail'>;

export function InstructorClassDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const activeClase = clases.find(clase => clase.id === route.params.claseId) ?? clases[0];
  const activity = ACTIVITY_META[activeClase.nombre];

  // Lista de ejemplo: no existe todavía un sistema real de reservas que
  // registre quién se inscribió a cada clase (ver InstructorCalendarScreen.tsx
  // y mockAttendees.ts). Cuando exista, esto se reemplaza por un fetch real.
  const attendees = useMemo(
    () => mockAttendeesFor(activeClase.id, activeClase.lugaresOcupados),
    [activeClase.id, activeClase.lugaresOcupados],
  );

  // Cuántos de la lista de ejemplo ya se marcaron presentes al escanear su QR
  // (ver AttendanceContext.tsx). Como todavía no hay reservas reales, cada
  // escaneo válido marca a la siguiente persona de la lista, en orden.
  const { getPresentCount } = useAttendance();
  const presentCount = Math.min(getPresentCount(activeClase.id), attendees.length);

  return (
    <SafeAreaView style={commonStyles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} hitSlop={8} onPress={() => navigation.goBack()}>
          <ChevronLeftIcon color={colors.textPrimary} size={22} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>{activeClase.sala}</Text>
        <View style={styles.titleRow}>
          {activity && (
            <View style={[styles.titleIconWrap, { backgroundColor: activity.color }]}>
              <activity.Icon color={colors.background} size={20} />
            </View>
          )}
          <Text style={styles.title}>{activeClase.nombre.toUpperCase()}</Text>
        </View>
        <CapacityIndicator ocupados={activeClase.lugaresOcupados} capacidad={activeClase.capacidad} size="md" />

        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha</Text>
            <Text style={styles.infoValue}>{formatFullDate(activeClase.fecha)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hora</Text>
            <Text style={styles.infoValue}>{activeClase.hora}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>Duración</Text>
            <Text style={styles.infoValue}>{activeClase.duracion}</Text>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>Lista de inscritos</Text>
          <Text style={styles.sectionCount}>
            {presentCount}/{attendees.length} presentes
          </Text>
        </View>
        <Text style={styles.exampleNote}>
          Nombres de ejemplo — todavía no existe el sistema de reservas que diga quién se inscribió de verdad.
        </Text>

        {attendees.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nadie se ha inscrito a esta clase todavía.</Text>
          </View>
        ) : (
          <View style={styles.attendeeList}>
            {attendees.map((nombre, index) => {
              const presente = index < presentCount;
              return (
                <View
                  key={nombre + index}
                  style={[
                    styles.attendeeRow,
                    presente && styles.attendeeRowPresent,
                    index === attendees.length - 1 && styles.attendeeRowLast,
                  ]}>
                  <Avatar name={nombre} size={36} />
                  <Text style={[styles.attendeeName, presente && styles.attendeeNamePresent]}>{nombre}</Text>
                  {presente && <CheckCircleIcon color={colors.spotsAvailable} size={20} />}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
        <PrimaryButton
          label="Pasar lista por código QR"
          onPress={() => navigation.navigate('InstructorClassCheckIn', { claseId: activeClase.id })}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
  },
  kicker: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  infoList: {
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    color: colors.gold,
    textTransform: 'uppercase',
  },
  sectionCount: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  exampleNote: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: -12,
  },
  attendeeList: {
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  attendeeRowLast: {
    borderBottomWidth: 0,
  },
  attendeeRowPresent: {
    backgroundColor: 'rgba(122, 143, 111, 0.12)',
  },
  attendeeName: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    flex: 1,
  },
  attendeeNamePresent: {
    fontWeight: fontWeight.medium,
    color: colors.spotsAvailable,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  emptyStateText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
