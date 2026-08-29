import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  CalendarDaysIcon as CalendarDaysIconOutline,
  UserCircleIcon as UserCircleIconOutline,
} from 'react-native-heroicons/outline';
import {
  CalendarDaysIcon as CalendarDaysIconSolid,
  UserCircleIcon as UserCircleIconSolid,
} from 'react-native-heroicons/solid';
import { colors, fontFamily, fontSize, fontWeight, radius, shadows } from '@/theme';
import type { InstructorTabParamList } from '../types';

type NavItem = {
  key: string;
  route: keyof InstructorTabParamList;
  outline: React.ComponentType<{ color: string; size?: number }>;
  solid: React.ComponentType<{ color: string; size?: number }>;
};

const instructorNavItems: readonly NavItem[] = [
  { key: 'Calendario', route: 'Calendario', outline: CalendarDaysIconOutline, solid: CalendarDaysIconSolid },
  { key: 'Mi cuenta', route: 'Cuenta', outline: UserCircleIconOutline, solid: UserCircleIconSolid },
];

export function InstructorNavBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index].name;

  return (
    <View style={[styles.navBar, { paddingBottom: 10 + insets.bottom }]}>
      {instructorNavItems.map(item => {
        const isActive = item.route === activeRoute;
        const Icon = isActive ? item.solid : item.outline;
        return (
          <Pressable
            key={item.route}
            style={styles.navItem}
            onPress={!isActive ? () => navigation.navigate(item.route) : undefined}>
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Icon color={isActive ? colors.accent : colors.navInactive} size={22} />
            </View>
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.key}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: colors.surface,
    ...shadows.tabBar,
  },
  navItem: {
    alignItems: 'center',
    gap: 2,
    minWidth: 56,
  },
  iconWrap: {
    width: 44,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.accentSoft,
  },
  navLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.xs,
    color: colors.navInactive,
  },
  navLabelActive: {
    color: colors.accent,
    fontWeight: fontWeight.semibold,
  },
});
