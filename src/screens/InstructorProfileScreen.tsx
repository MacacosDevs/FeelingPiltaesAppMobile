import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeftIcon, StarIcon } from 'react-native-heroicons/outline';
import { clases, INSTRUCTOR_META, stripCon } from '../data/clases';
import { ACTIVITY_META } from '../utils/activityMeta';
import { colors, commonStyles, fontFamily, fontSize, fontWeight, radius } from '../theme';
import { WEEKDAY_LABELS, addDays, mondayOf, startOfDay, weekdayIndexMondayFirst } from '../utils/date';
import type { RootStackParamList } from '../navigation/types';

const avatarPlaceholder = require('../assets/images/avatar-placeholder.jpg');

type Props = NativeStackScreenProps<RootStackParamList, 'InstructorProfile'>;

export function InstructorProfileScreen({ navigation, route }: Props) {
  const { instructora } = route.params;
  const meta = INSTRUCTOR_META[instructora];
  const name = stripCon(instructora);

  const classesThisWeek = useMemo(() => {
    const today = startOfDay(new Date());
    const weekStart = mondayOf(today);
    const weekEnd = addDays(weekStart, 7);
    return clases
      .filter(clase => clase.instructora === instructora && clase.fecha >= weekStart && clase.fecha < weekEnd)
      .sort((a, b) => a.fecha.getTime() - b.fecha.getTime() || a.hora.localeCompare(b.hora));
  }, [instructora]);

  return (
    <SafeAreaView style={commonStyles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} hitSlop={8} onPress={() => navigation.goBack()}>
          <ChevronLeftIcon color={colors.textPrimary} size={22} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Image source={avatarPlaceholder} style={styles.avatar} />
          <Text style={styles.name}>{name}</Text>
          {meta && (
            <View style={styles.ratingRow}>
              <StarIcon color={colors.gold} size={16} />
              <Text style={styles.ratingText}>
                {meta.rating} · {meta.clasesImpartidas} clases impartidas
              </Text>
            </View>
          )}
          {meta && meta.especialidades.length > 0 && (
            <View style={styles.chipsRow}>
              {meta.especialidades.map(especialidad => (
                <View key={especialidad} style={styles.chip}>
                  <Text style={styles.chipLabel}>{especialidad}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {meta?.bio && <Text style={styles.bio}>{meta.bio}</Text>}

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>Horarios esta semana</Text>

        {classesThisWeek.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No tiene clases programadas esta semana.</Text>
          </View>
        ) : (
          <View style={styles.scheduleList}>
            {classesThisWeek.map(clase => {
              const activity = ACTIVITY_META[clase.nombre];
              return (
                <Pressable
                  key={clase.id}
                  style={styles.scheduleRow}
                  onPress={() => navigation.navigate('ClassDetail', { claseId: clase.id })}>
                  <View style={styles.scheduleLeft}>
                    {activity && (
                      <View style={[styles.scheduleIconWrap, { backgroundColor: activity.color }]}>
                        <activity.Icon color={colors.background} size={14} />
                      </View>
                    )}
                    <Text style={styles.scheduleName}>{clase.nombre}</Text>
                  </View>
                  <Text style={styles.scheduleTime}>
                    {WEEKDAY_LABELS[weekdayIndexMondayFirst(clase.fecha)]} · {clase.hora}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 32,
    gap: 16,
  },
  profileHeader: {
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 4,
  },
  name: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  chipLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    color: colors.accent,
  },
  bio: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    lineHeight: 21,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  sectionLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    color: colors.gold,
    textTransform: 'uppercase',
  },
  scheduleList: {
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scheduleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scheduleIconWrap: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleName: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  scheduleTime: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.textPrimary,
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
