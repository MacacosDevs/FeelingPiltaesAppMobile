import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRightIcon, FunnelIcon } from 'react-native-heroicons/outline';
import { ClassFilterModal, type FilterOption } from '../components/ClassFilterModal';
import { CalendarModal } from '../components/CalendarModal';
import { CapacityIndicator } from '../components/CapacityIndicator';
import { clases, isClasePast } from '../data/clases';
import { ACTIVITY_META } from '../utils/activityMeta';
import { useSportMode } from '../context/SportModeContext';
import { CourtsScreen } from './CourtsScreen';
import { colors, fontFamily, fontSize, fontWeight, radius } from '../theme';
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

const TIPO_OPTIONS: FilterOption[] = [
  { value: 'Reformer', label: 'Reformer', description: 'Fuerza y control con máquina' },
  { value: 'Barre Sculpt', label: 'Barre Sculpt', description: 'Tonificación con barra' },
  { value: 'Mat Pilates', label: 'Mat Pilates', description: 'En colchoneta, bajo impacto' },
];

const SALON_OPTIONS: FilterOption[] = [
  { value: 'Studio 14', label: 'Studio 14' },
  { value: 'Studio Roma', label: 'Studio Roma' },
];

const today = startOfDay(new Date());

type ClassesNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Clases'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function ClassesScreen() {
  const navigation = useNavigation<ClassesNavigationProp>();
  const { sport } = useSportMode();
  const [weekStart, setWeekStart] = useState(() => mondayOf(today));
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTipos, setSelectedTipos] = useState<string[]>([]);
  const [selectedSalones, setSelectedSalones] = useState<string[]>([]);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const activeFilterCount = selectedTipos.length + selectedSalones.length;

  const weekDays = useMemo(
    () => Array.from({ length: DAYS_IN_STRIP }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );

  const classesForSelectedDay = useMemo(
    () =>
      clases.filter(
        clase =>
          isSameDay(clase.fecha, selectedDate) &&
          (selectedSalones.length === 0 || selectedSalones.includes(clase.sala)) &&
          (selectedTipos.length === 0 || selectedTipos.includes(clase.nombre)),
      ),
    [selectedDate, selectedSalones, selectedTipos],
  );

  const emptyStateMessage = useMemo(() => {
    const filtros: string[] = [];
    if (selectedTipos.length) filtros.push(`de ${selectedTipos.join(' o ')}`);
    if (selectedSalones.length) filtros.push(`en ${selectedSalones.join(' o ')}`);
    const sufijo = filtros.length ? `${filtros.join(' ')} ` : '';
    return `No hay clases ${sufijo}programadas este día.`;
  }, [selectedSalones, selectedTipos]);

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

  if (sport === 'padel') {
    return <CourtsScreen />;
  }

  return (
    <SafeAreaView style={styles.screen} edges={[]}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>Horario</Text>

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

        {classesForSelectedDay.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{emptyStateMessage}</Text>
          </View>
        ) : (
          <View style={styles.classList}>
            {classesForSelectedDay.map(clase => {
              const activity = ACTIVITY_META[clase.nombre];
              const past = isClasePast(clase);
              return (
                <Pressable
                  key={clase.id}
                  style={[styles.classCard, past && styles.classCardPast]}
                  onPress={() => navigation.navigate('ClassDetail', { claseId: clase.id })}>
                  <View style={[styles.classAccent, activity && { backgroundColor: activity.color }]} />

                  <View style={styles.classCardBody}>
                    {activity && (
                      <View style={[styles.classIconWrap, { backgroundColor: activity.color }]}>
                        <activity.Icon color={colors.background} size={18} />
                      </View>
                    )}

                    <View style={styles.midCol}>
                      <Text style={styles.className}>{clase.nombre}</Text>
                      <Text style={styles.classInstructora}>{clase.instructora}</Text>
                      <Text style={styles.classMeta}>
                        {clase.sala} · {clase.hora} · {clase.duracion}
                      </Text>
                      {!past && (
                        <View style={styles.capacityRow}>
                          <CapacityIndicator ocupados={clase.lugaresOcupados} capacidad={clase.capacidad} />
                        </View>
                      )}
                    </View>

                    <View style={styles.rightCol}>
                      <Text style={styles.classPrecio}>{clase.precio}</Text>
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
        tipoOptions={TIPO_OPTIONS}
        salonOptions={SALON_OPTIONS}
        selectedTipos={selectedTipos}
        selectedSalones={selectedSalones}
        onApply={(tipos, salones) => {
          setSelectedTipos(tipos);
          setSelectedSalones(salones);
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
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  classList: {
    gap: 12,
  },
  classCard: {
    flexDirection: 'row',
    borderRadius: radius.input,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  classCardPast: {
    opacity: 0.55,
  },
  classAccent: {
    width: 5,
    backgroundColor: colors.border,
  },
  classCardBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  classIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  midCol: {
    flex: 1,
    gap: 3,
  },
  className: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.classTitle,
    color: colors.textPrimary,
  },
  classInstructora: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.gold,
  },
  classMeta: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.smMedium,
    color: colors.textMuted,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 8,
  },
  classPrecio: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  capacityRow: {
    marginTop: 4,
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
