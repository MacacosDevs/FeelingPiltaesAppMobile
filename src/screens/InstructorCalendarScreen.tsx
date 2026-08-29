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
import { ChevronRightIcon } from 'react-native-heroicons/outline';
import { useAuth } from '@/features/auth';
import { listarMisClasesInstructor } from '../api/clases';
import type { ClaseResponse } from '../api/types';
import { ACTIVITY_META } from '../utils/activityMeta';
import { CapacityIndicator } from '../components/CapacityIndicator';
import { colors, commonStyles, fontFamily, fontSize, fontWeight, radius } from '../theme';
import {
  WEEKDAY_LABELS,
  addDays,
  formatHora,
  formatIsoDate,
  isSameDay,
  mondayOf,
  startOfDay,
  weekdayIndexMondayFirst,
} from '../utils/date';
import type { InstructorTabParamList, RootStackParamList } from '@/app/navigation/types';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<InstructorTabParamList, 'Calendario'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type DayGroup = {
  date: Date;
  items: ClaseResponse[];
};

export function InstructorCalendarScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { token } = useAuth();
  const today = startOfDay(new Date());
  const [misClases, setMisClases] = useState<ClaseResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargarMisClases = useCallback(() => {
    const weekStart = mondayOf(today);
    const weekEnd = addDays(weekStart, 6);
    return listarMisClasesInstructor(token!, formatIsoDate(weekStart), formatIsoDate(weekEnd));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!token) {
      setMisClases([]);
      setCargando(false);
      return;
    }
    let cancelado = false;
    setCargando(true);
    cargarMisClases()
      .then(data => {
        if (!cancelado) setMisClases(data);
      })
      .catch(() => {
        if (!cancelado) setMisClases([]);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [token, cargarMisClases]);

  async function handleRefresh() {
    if (!token) return;
    setRefrescando(true);
    try {
      setMisClases(await cargarMisClases());
    } catch {
      // Se conservan las clases ya cargadas si falla el refresco.
    }
    setRefrescando(false);
  }

  const dayGroups = useMemo<DayGroup[]>(() => {
    const ordenadas = [...misClases].sort(
      (a, b) => a.fecha.localeCompare(b.fecha) || a.horaInicio.localeCompare(b.horaInicio),
    );
    const groups: DayGroup[] = [];
    for (const clase of ordenadas) {
      const fecha = new Date(`${clase.fecha}T00:00:00`);
      const last = groups[groups.length - 1];
      if (last && isSameDay(last.date, fecha)) {
        last.items.push(clase);
      } else {
        groups.push({ date: fecha, items: [clase] });
      }
    }
    return groups;
  }, [misClases]);

  const totalClasesSemana = dayGroups.reduce((total, group) => total + group.items.length, 0);

  return (
    <SafeAreaView style={commonStyles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={handleRefresh} tintColor={colors.accent} />
        }>
        <Text style={styles.title}>Mi calendario</Text>
        <Text style={styles.subtitle}>
          {totalClasesSemana === 0
            ? 'No tienes clases asignadas esta semana.'
            : `${totalClasesSemana} clase${totalClasesSemana === 1 ? '' : 's'} asignada${totalClasesSemana === 1 ? '' : 's'} esta semana`}
        </Text>

        {cargando ? (
          <ActivityIndicator color={colors.accent} />
        ) : dayGroups.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No tienes clases asignadas esta semana.</Text>
          </View>
        ) : (
          dayGroups.map(group => {
            const isToday = isSameDay(group.date, today);
            return (
              <View key={group.date.toDateString()} style={styles.dayGroup}>
                <View style={styles.dayHeaderRow}>
                  <Text style={styles.dayHeaderWeekday}>{WEEKDAY_LABELS[weekdayIndexMondayFirst(group.date)]}</Text>
                  <Text style={styles.dayHeaderNumber}>{group.date.getDate()}</Text>
                  {isToday && (
                    <View style={styles.todayBadge}>
                      <Text style={styles.todayBadgeLabel}>Hoy</Text>
                    </View>
                  )}
                </View>

                <View style={styles.classList}>
                  {group.items.map((clase, index) => {
                    const activity = ACTIVITY_META[clase.tipoActividadNombre];
                    return (
                      <Pressable
                        key={clase.id}
                        style={[styles.classCard, index === group.items.length - 1 && styles.classCardLast]}
                        onPress={() => navigation.navigate('InstructorClassDetail', { claseId: clase.id })}>
                        <View style={styles.classCardTop}>
                          {activity && (
                            <View style={[styles.classIconWrap, { backgroundColor: activity.color }]}>
                              <activity.Icon color={colors.background} size={16} />
                            </View>
                          )}
                          <View style={styles.classCardInfo}>
                            <Text style={styles.className}>{clase.tipoActividadNombre}</Text>
                            <Text style={styles.classMeta}>
                              {formatHora(clase.horaInicio)} - {formatHora(clase.horaFin)} · {clase.salonNombre}
                            </Text>
                          </View>
                          <ChevronRightIcon color={colors.navInactive} size={18} />
                        </View>
                        <CapacityIndicator ocupados={clase.lugaresOcupados} capacidad={clase.capacidad} size="sm" />
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 20,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    marginTop: -12,
  },
  dayGroup: {
    gap: 10,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  dayHeaderWeekday: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
    color: colors.gold,
    textTransform: 'uppercase',
  },
  dayHeaderNumber: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  todayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  todayBadgeLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.xs,
    color: colors.accent,
  },
  classList: {
    gap: 10,
  },
  classCard: {
    padding: 14,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 10,
  },
  classCardLast: {},
  classCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  classIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  classCardInfo: {
    flex: 1,
    gap: 2,
  },
  className: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  classMeta: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
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
