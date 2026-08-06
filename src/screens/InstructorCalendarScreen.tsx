import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRightIcon } from 'react-native-heroicons/outline';
import { useAuth } from '../context/AuthContext';
import { clases, stripCon, type Clase } from '../data/clases';
import { ACTIVITY_META } from '../utils/activityMeta';
import { CapacityIndicator } from '../components/CapacityIndicator';
import { colors, commonStyles, fontFamily, fontSize, fontWeight, radius } from '../theme';
import { WEEKDAY_LABELS, addDays, isSameDay, mondayOf, startOfDay, weekdayIndexMondayFirst } from '../utils/date';
import type { InstructorTabParamList, RootStackParamList } from '../navigation/types';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<InstructorTabParamList, 'Calendario'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type DayGroup = {
  date: Date;
  items: Clase[];
};

// El horario todavía vive en el mock local (src/data/clases.ts) — no existe
// todavía un módulo de clases en el backend. Se filtra por nombre: el
// `instructora` del mock es "Con <nombre>" y debe coincidir con el nombre del
// usuario logueado (así están sembrados los 4 instructores de prueba, ver
// V18__instructores_semilla.sql en el backend).
export function InstructorCalendarScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const today = startOfDay(new Date());

  const dayGroups = useMemo<DayGroup[]>(() => {
    if (!user) return [];
    const weekStart = mondayOf(today);
    const weekEnd = addDays(weekStart, 7);
    const misClases = clases
      .filter(clase => stripCon(clase.instructora) === user.nombre && clase.fecha >= weekStart && clase.fecha < weekEnd)
      .sort((a, b) => a.fecha.getTime() - b.fecha.getTime() || a.hora.localeCompare(b.hora));

    const groups: DayGroup[] = [];
    for (const clase of misClases) {
      const last = groups[groups.length - 1];
      if (last && isSameDay(last.date, clase.fecha)) {
        last.items.push(clase);
      } else {
        groups.push({ date: clase.fecha, items: [clase] });
      }
    }
    return groups;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const totalClasesSemana = dayGroups.reduce((total, group) => total + group.items.length, 0);

  return (
    <SafeAreaView style={commonStyles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Mi calendario</Text>
        <Text style={styles.subtitle}>
          {totalClasesSemana === 0
            ? 'No tienes clases asignadas esta semana.'
            : `${totalClasesSemana} clase${totalClasesSemana === 1 ? '' : 's'} asignada${totalClasesSemana === 1 ? '' : 's'} esta semana`}
        </Text>

        {dayGroups.length === 0 ? (
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
                    const activity = ACTIVITY_META[clase.nombre];
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
                            <Text style={styles.className}>{clase.nombre}</Text>
                            <Text style={styles.classMeta}>
                              {clase.hora} · {clase.duracion} · {clase.sala}
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
