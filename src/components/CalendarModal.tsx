import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, fontSize, fontWeight, radius } from '../theme';
import {
  WEEKDAY_LABELS_SUNDAY_FIRST,
  addDays,
  addMonths,
  formatMonthYearLong,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeekSunday,
} from '../utils/date';

const WEEKS_IN_GRID = 6;
const today = startOfDay(new Date());

type CalendarModalProps = {
  visible: boolean;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
};

export function CalendarModal({ visible, selectedDate, onSelectDate, onClose }: CalendarModalProps) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(selectedDate));

  useEffect(() => {
    if (visible) {
      setViewMonth(startOfMonth(selectedDate));
    }
  }, [visible, selectedDate]);

  const gridStart = startOfWeekSunday(viewMonth);
  const days = Array.from({ length: WEEKS_IN_GRID * 7 }, (_, index) => addDays(gridStart, index));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.header}>
            <Pressable
              style={styles.navBtn}
              hitSlop={8}
              onPress={() => setViewMonth(prev => addMonths(prev, -1))}>
              <Text style={styles.navBtnLabel}>‹</Text>
            </Pressable>
            <Text style={styles.headerTitle}>{formatMonthYearLong(viewMonth)}</Text>
            <Pressable
              style={styles.navBtn}
              hitSlop={8}
              onPress={() => setViewMonth(prev => addMonths(prev, 1))}>
              <Text style={styles.navBtnLabel}>›</Text>
            </Pressable>
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAY_LABELS_SUNDAY_FIRST.map(label => (
              <Text key={label} style={styles.weekdayLabel}>
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {days.map(day => {
              const inMonth = day.getMonth() === viewMonth.getMonth();
              const isToday = isSameDay(day, today);
              const isSelected = isSameDay(day, selectedDate);
              return (
                <Pressable
                  key={day.toISOString()}
                  style={styles.dayCell}
                  onPress={() => {
                    onSelectDate(day);
                    onClose();
                  }}>
                  <View
                    style={[
                      styles.dayCircle,
                      !isSelected && isToday && styles.dayCircleToday,
                      isSelected && styles.dayCircleSelected,
                    ]}>
                    <Text
                      style={[
                        styles.dayLabel,
                        !inMonth && styles.dayLabelOutside,
                        !isSelected && isToday && styles.dayLabelToday,
                        isSelected && styles.dayLabelSelected,
                      ]}>
                      {day.getDate()}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(43, 36, 32, 0.4)',
  },
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.pillBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  weekdayLabel: {
    flexBasis: '14.2857%',
    textAlign: 'center',
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
    color: colors.gold,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    flexBasis: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleToday: {
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  dayCircleSelected: {
    backgroundColor: colors.accent,
  },
  dayLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  dayLabelOutside: {
    color: colors.navInactive,
  },
  dayLabelToday: {
    fontWeight: fontWeight.semibold,
    color: colors.accent,
  },
  dayLabelSelected: {
    fontWeight: fontWeight.semibold,
    color: colors.background,
  },
});
