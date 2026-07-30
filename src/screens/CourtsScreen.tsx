import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRightIcon, FunnelIcon, Squares2X2Icon } from 'react-native-heroicons/outline';
import { ClassFilterModal, type FilterOption } from '../components/ClassFilterModal';
import { CalendarModal } from '../components/CalendarModal';
import { canchaById, canchas, horarios, isHorarioPast } from '../data/canchas';
import { colors, commonStyles, fontFamily, fontSize, fontWeight, radius, shadows } from '../theme';
import {
  WEEKDAY_LABELS,
  addDays,
  formatFullDate,
  formatMonthYearLong,
  isSameDay,
  mondayOf,
  startOfDay,
} from '../utils/date';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';

const DAYS_IN_STRIP = 7;

const CANCHA_OPTIONS: FilterOption[] = canchas.map(cancha => ({
  value: cancha.id,
  label: cancha.nombre,
}));

const UBICACION_OPTIONS: FilterOption[] = [
  { value: 'Studio 14', label: 'Studio 14' },
  { value: 'Studio Roma', label: 'Studio Roma' },
];

const today = startOfDay(new Date());

type CourtsNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Clases'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function CourtsScreen() {
  const navigation = useNavigation<CourtsNavigationProp>();
  const [weekStart, setWeekStart] = useState(() => mondayOf(today));
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedCanchas, setSelectedCanchas] = useState<string[]>([]);
  const [selectedUbicaciones, setSelectedUbicaciones] = useState<string[]>([]);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const activeFilterCount = selectedCanchas.length + selectedUbicaciones.length;

  const weekDays = useMemo(
    () => Array.from({ length: DAYS_IN_STRIP }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );

  const horariosDelDia = useMemo(
    () =>
      horarios.filter(horario => {
        const cancha = canchaById(horario.canchaId);
        return (
          isSameDay(horario.fecha, selectedDate) &&
          (selectedCanchas.length === 0 || selectedCanchas.includes(horario.canchaId)) &&
          (selectedUbicaciones.length === 0 ||
            (cancha && selectedUbicaciones.includes(cancha.ubicacion)))
        );
      }),
    [selectedDate, selectedCanchas, selectedUbicaciones],
  );

  const emptyStateMessage = useMemo(() => {
    const filtros: string[] = [];
    if (selectedCanchas.length) {
      const nombres = selectedCanchas
        .map(id => canchaById(id)?.nombre)
        .filter(Boolean)
        .join(' o ');
      filtros.push(`en ${nombres}`);
    }
    if (selectedUbicaciones.length) filtros.push(`en ${selectedUbicaciones.join(' o ')}`);
    const sufijo = filtros.length ? `${filtros.join(' ')} ` : '';
    return `No hay horarios ${sufijo}disponibles este día.`;
  }, [selectedCanchas, selectedUbicaciones]);

  function goToPreviousWeek() {
    setWeekStart(prev => addDays(prev, -7));
  }

  function goToNextWeek() {
    setWeekStart(prev => addDays(prev, 7));
  }

  function goToToday() {
    setWeekStart(mondayOf(today));
    setSelectedDate(today);
  }

  function selectDate(date: Date) {
    setWeekStart(mondayOf(date));
    setSelectedDate(date);
  }

  return (
    <SafeAreaView style={commonStyles.screen} edges={[]}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>Canchas</Text>

        <Pressable style={styles.filterPill} onPress={() => setFilterModalOpen(true)}>
          <FunnelIcon color={colors.textPrimary} size={16} />
          <Text style={styles.filterPillLabel}>Filtrar</Text>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeLabel}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.monthRow}>
          <Pressable style={styles.monthPill} onPress={() => setCalendarOpen(true)}>
            <Text style={styles.pillLabel}>{formatMonthYearLong(selectedDate)}</Text>
            <Text style={styles.chevron}>⌄</Text>
          </Pressable>
          <View style={styles.navRow}>
            <Pressable style={styles.circleBtn} onPress={goToPreviousWeek}>
              <Text style={styles.circleBtnLabel}>‹</Text>
            </Pressable>
            <Pressable style={styles.circleBtn} onPress={goToToday}>
              <Text style={styles.circleBtnLabel}>Hoy</Text>
            </Pressable>
            <Pressable style={styles.circleBtn} onPress={goToNextWeek}>
              <Text style={styles.circleBtnLabel}>›</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.dayStrip}>
          {weekDays.map((day, index) => {
            const active = isSameDay(day, selectedDate);
            return (
              <Pressable
                key={day.toISOString()}
                style={[styles.dayCell, active && styles.dayCellActive]}
                onPress={() => selectDate(day)}>
                <Text style={[styles.dayLabel, active && styles.dayLabelActive]}>
                  {WEEKDAY_LABELS[index]}
                </Text>
                <Text style={[styles.dayDate, active && styles.dayDateActive]}>{day.getDate()}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>{formatFullDate(selectedDate)}</Text>

        {horariosDelDia.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{emptyStateMessage}</Text>
          </View>
        ) : (
          <View style={styles.courtList}>
            {horariosDelDia.map(horario => {
              const cancha = canchaById(horario.canchaId);
              if (!cancha) return null;
              const past = isHorarioPast(horario);
              return (
                <Pressable
                  key={horario.id}
                  style={[styles.courtCard, past && styles.courtCardPast]}
                  onPress={() => navigation.navigate('CourtBooking', { horarioId: horario.id })}>
                  <View style={styles.courtAccent} />

                  <View style={styles.courtCardBody}>
                    <View style={styles.courtIconWrap}>
                      <Squares2X2Icon color={colors.background} size={18} />
                    </View>

                    <View style={styles.midCol}>
                      <Text style={styles.courtName}>{cancha.nombre}</Text>
                      <Text style={styles.courtUbicacion}>{cancha.ubicacion}</Text>
                      <Text style={styles.courtMeta}>
                        {horario.hora} ·{' '}
                        {horario.ultimaHoraLibre ? 'Última hora libre' : horario.disponibilidadLabel}
                      </Text>
                    </View>

                    <View style={styles.rightCol}>
                      <Text style={styles.courtPrecio}>${cancha.precioHora}/hr</Text>
                      {past ? (
                        <View style={styles.pastBadge}>
                          <Text style={styles.pastBadgeLabel}>Finalizada</Text>
                        </View>
                      ) : (
                        <View style={styles.reservarBtn}>
                          <Text style={styles.reservarLabel}>Reservar</Text>
                          <ChevronRightIcon color={colors.background} size={14} />
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <ClassFilterModal
        visible={filterModalOpen}
        tipoOptions={CANCHA_OPTIONS}
        salonOptions={UBICACION_OPTIONS}
        selectedTipos={selectedCanchas}
        selectedSalones={selectedUbicaciones}
        tipoSectionTitle="Canchas"
        tipoAllLabel="Todas las canchas"
        salonSectionTitle="Ubicaciones"
        salonAllLabel="Todas las ubicaciones"
        onApply={(canchasSel, ubicacionesSel) => {
          setSelectedCanchas(canchasSel);
          setSelectedUbicaciones(ubicacionesSel);
        }}
        onClose={() => setFilterModalOpen(false)}
      />

      <CalendarModal
        visible={calendarOpen}
        selectedDate={selectedDate}
        onSelectDate={selectDate}
        onClose={() => setCalendarOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: 20,
    gap: 14,
  },
  title: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.heading,
    color: colors.textPrimary,
  },
  filterPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 35,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.pillBorder,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },
  filterPillLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  filterBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: radius.pill,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  filterBadgeLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.xs,
    color: colors.background,
  },
  pillLabel: {
    flexShrink: 1,
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  chevron: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.smMedium,
    color: colors.textMuted,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthPill: {
    height: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.pillBorder,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleBtn: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.pillBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.smMedium,
    color: colors.textMuted,
  },
  dayStrip: {
    flexDirection: 'row',
    gap: 6,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 2,
  },
  dayCellActive: {
    borderWidth: 0,
    backgroundColor: colors.textPrimary,
  },
  dayLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  dayLabelActive: {
    color: colors.borderStrong,
  },
  dayDate: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  dayDateActive: {
    color: colors.background,
  },
  sectionLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    color: colors.gold,
    textTransform: 'uppercase',
  },
  courtList: {
    gap: 12,
  },
  courtCard: {
    flexDirection: 'row',
    borderRadius: radius.input,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.listCard,
  },
  courtCardPast: {
    opacity: 0.55,
  },
  courtAccent: {
    width: 5,
    backgroundColor: colors.accent,
  },
  courtCardBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  courtIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.textPrimary,
  },
  midCol: {
    flex: 1,
    gap: 3,
  },
  courtName: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.classTitle,
    color: colors.textPrimary,
  },
  courtUbicacion: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.gold,
  },
  courtMeta: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.smMedium,
    color: colors.textMuted,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 8,
  },
  courtPrecio: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  reservarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 30,
    paddingHorizontal: 12,
    borderRadius: radius.input,
    backgroundColor: colors.textPrimary,
  },
  reservarLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.smMedium,
    color: colors.background,
  },
  pastBadge: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pastBadgeLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.smMedium,
    color: colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
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
});
