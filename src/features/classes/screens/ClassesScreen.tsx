import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRightIcon, FunnelIcon } from 'react-native-heroicons/outline';
import { ClassFilterModal, type FilterOption } from '@/components/ClassFilterModal';
import { CalendarModal } from '@/components/CalendarModal';
import { CategoryToggle } from '../components/CategoryToggle';
import { CapacityIndicator } from '@/components/CapacityIndicator';
import { isClasePast, type Categoria } from '@/data/clases';
import { listarClasesPublico } from '../api/clases';
import type { ClaseResponse } from '@/api/types';
import { ACTIVITY_META } from '@/utils/activityMeta';
import { useSportMode } from '@/context/SportModeContext';
import { CourtsScreen } from '@/features/padel';
import { colors, commonStyles, fontFamily, fontSize, fontWeight, radius, shadows } from '@/theme';
import {
  WEEKDAY_LABELS,
  addDays,
  formatFullDate,
  formatHora,
  formatIsoDate,
  formatMonthYearLong,
  isSameDay,
  mondayOf,
  startOfDay,
} from '@/utils/date';
import type { MainTabParamList, RootStackParamList } from '@/app/navigation/types';

const DAYS_IN_STRIP = 7;

// Bacu Fit no existe todavía en el catálogo real de actividades del backend
// (sigue fuera de alcance); mientras tanto, cualquier actividad que no sea
// "Bacu Fit" cuenta como Pilates para el toggle de categoría.
const NOMBRE_ACTIVIDAD_BACU_FIT = 'Bacu Fit';

const TIPO_OPTIONS: FilterOption[] = [
  { value: 'Reformer', label: 'Reformer', description: 'Fuerza y control con máquina' },
  { value: 'Mat', label: 'Mat', description: 'En colchoneta, bajo impacto' },
  { value: 'Cadillac', label: 'Cadillac' },
  { value: 'Silla', label: 'Silla' },
  { value: 'Barril', label: 'Barril' },
  { value: 'Circuito', label: 'Circuito' },
];

const SALON_OPTIONS: FilterOption[] = [
  { value: 'Feeling Pilates Centro', label: 'Feeling Pilates Centro' },
  { value: 'Feeling Pilates Corregidora', label: 'Feeling Pilates Corregidora' },
];

const today = startOfDay(new Date());

type ClassesNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Clases'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function ClassesScreen() {
  const navigation = useNavigation<ClassesNavigationProp>();
  const { sport } = useSportMode();
  const [categoria, setCategoria] = useState<Categoria>('pilates');
  const [weekStart, setWeekStart] = useState(() => mondayOf(today));
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTipos, setSelectedTipos] = useState<string[]>([]);
  const [selectedSalones, setSelectedSalones] = useState<string[]>([]);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [clasesSemana, setClasesSemana] = useState<ClaseResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const activeFilterCount = selectedTipos.length + selectedSalones.length;
  const tipoOptions = categoria === 'pilates' ? TIPO_OPTIONS : [];

  const weekDays = useMemo(
    () => Array.from({ length: DAYS_IN_STRIP }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );

  const cargarClasesSemana = useCallback(() => {
    const desde = formatIsoDate(weekStart);
    const hasta = formatIsoDate(addDays(weekStart, DAYS_IN_STRIP - 1));
    return listarClasesPublico(desde, hasta);
  }, [weekStart]);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    cargarClasesSemana()
      .then(data => {
        if (!cancelado) setClasesSemana(data);
      })
      .catch(() => {
        if (!cancelado) setClasesSemana([]);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [cargarClasesSemana]);

  async function handleRefresh() {
    setRefrescando(true);
    try {
      const data = await cargarClasesSemana();
      setClasesSemana(data);
    } catch {
      // Se conservan las clases ya cargadas si falla el refresco.
    }
    setRefrescando(false);
  }

  const classesForSelectedDay = useMemo(() => {
    const selectedIso = formatIsoDate(selectedDate);
    return clasesSemana.filter(clase => {
      const esBacuFit = clase.tipoActividadNombre === NOMBRE_ACTIVIDAD_BACU_FIT;
      return (
        (categoria === 'bacufit') === esBacuFit &&
        clase.fecha === selectedIso &&
        (selectedSalones.length === 0 || selectedSalones.includes(clase.salonNombre)) &&
        (selectedTipos.length === 0 || selectedTipos.includes(clase.tipoActividadNombre))
      );
    });
  }, [categoria, clasesSemana, selectedDate, selectedSalones, selectedTipos]);

  const emptyStateMessage = useMemo(() => {
    const filtros: string[] = [];
    if (selectedTipos.length) filtros.push(`de ${selectedTipos.join(' o ')}`);
    if (selectedSalones.length) filtros.push(`en ${selectedSalones.join(' o ')}`);
    const sufijo = filtros.length ? `${filtros.join(' ')} ` : '';
    return `No hay clases ${sufijo}programadas este día.`;
  }, [selectedSalones, selectedTipos]);

  function goToPreviousWeek() {
    setWeekStart(prev => addDays(prev, -7));
    setSelectedDate(prev => addDays(prev, -7));
  }

  function goToNextWeek() {
    setWeekStart(prev => addDays(prev, 7));
    setSelectedDate(prev => addDays(prev, 7));
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
    <SafeAreaView style={commonStyles.screen} edges={[]}>
      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={handleRefresh} tintColor={colors.accent} />
        }>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Horario</Text>
          <CategoryToggle
            value={categoria}
            onChange={nueva => {
              setCategoria(nueva);
              setSelectedTipos([]);
            }}
          />
        </View>

        <View style={styles.monthRow}>
          <View style={styles.leftGroup}>
            <Pressable style={styles.filterBtn} onPress={() => setFilterModalOpen(true)}>
              <FunnelIcon color={colors.textPrimary} size={16} />
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeLabel}>{activeFilterCount}</Text>
                </View>
              )}
            </Pressable>
            <Pressable style={styles.monthPill} onPress={() => setCalendarOpen(true)}>
              <Text style={styles.pillLabel}>{formatMonthYearLong(selectedDate)}</Text>
              <Text style={styles.chevron}>⌄</Text>
            </Pressable>
          </View>
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

        {cargando ? (
          <ActivityIndicator color={colors.accent} />
        ) : classesForSelectedDay.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{emptyStateMessage}</Text>
          </View>
        ) : (
          <View style={styles.classList}>
            {classesForSelectedDay.map(clase => {
              const activity = ACTIVITY_META[clase.tipoActividadNombre];
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
                      <Text style={styles.className}>{clase.tipoActividadNombre}</Text>
                      <Text style={styles.classInstructora}>Con {clase.instructorNombre}</Text>
                      <Text style={styles.classMeta}>
                        {clase.salonNombre} · {formatHora(clase.horaInicio)} - {formatHora(clase.horaFin)}
                      </Text>
                      {!past && (
                        <View style={styles.capacityRow}>
                          <CapacityIndicator ocupados={clase.lugaresOcupados} capacidad={clase.capacidad} />
                        </View>
                      )}
                    </View>

                    <View style={styles.rightCol}>
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
        tipoOptions={tipoOptions}
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
  body: {
    padding: 20,
    gap: 14,
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
    fontSize: fontSize.heading,
    color: colors.textPrimary,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  filterBtn: {
    width: 35,
    height: 35,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.pillBorder,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: radius.pill,
    paddingHorizontal: 3,
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
    paddingVertical: 10,
    borderRadius: radius.category,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 3,
  },
  dayCellActive: {
    borderWidth: 0,
    backgroundColor: colors.accent,
    ...shadows.card,
  },
  dayLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  dayLabelActive: {
    color: colors.surface,
    fontWeight: fontWeight.medium,
  },
  dayDate: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  dayDateActive: {
    color: colors.surface,
    fontWeight: fontWeight.bold,
  },
  sectionLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.xs + 2,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  classList: {
    gap: 12,
  },
  classCard: {
    flexDirection: 'row',
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
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
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  midCol: {
    flex: 1,
    gap: 3,
  },
  className: {
    fontFamily: fontFamily.display,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.classTitle + 1,
    color: colors.textPrimary,
  },
  classInstructora: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.goldDark,
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
    height: 32,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  reservarLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.xs + 2,
    color: colors.surface,
  },
  pastBadge: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
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
    borderRadius: radius.card,
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
