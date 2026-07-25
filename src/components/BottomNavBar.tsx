import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  HomeIcon as HomeIconOutline,
  CalendarDaysIcon as CalendarDaysIconOutline,
  Squares2X2Icon as Squares2X2IconOutline,
  CubeIcon as CubeIconOutline,
  TicketIcon as TicketIconOutline,
  UserCircleIcon as UserCircleIconOutline,
} from 'react-native-heroicons/outline';
import {
  HomeIcon as HomeIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  Squares2X2Icon as Squares2X2IconSolid,
  CubeIcon as CubeIconSolid,
  TicketIcon as TicketIconSolid,
  UserCircleIcon as UserCircleIconSolid,
} from 'react-native-heroicons/solid';
import { useSportMode } from '../context/SportModeContext';
import { colors, fontFamily, fontSize, fontWeight, radius } from '../theme';
import type { MainTabParamList } from '../navigation/types';

type NavItem = {
  key: string;
  route: keyof MainTabParamList;
  outline: React.ComponentType<{ color: string; size?: number }>;
  solid: React.ComponentType<{ color: string; size?: number }>;
};

const pilatesNavItems: readonly NavItem[] = [
  { key: 'Inicio', route: 'Home', outline: HomeIconOutline, solid: HomeIconSolid },
  { key: 'Clases', route: 'Clases', outline: CalendarDaysIconOutline, solid: CalendarDaysIconSolid },
  { key: 'Paquetes', route: 'Paquetes', outline: CubeIconOutline, solid: CubeIconSolid },
  { key: 'Eventos', route: 'Eventos', outline: TicketIconOutline, solid: TicketIconSolid },
  { key: 'Mi cuenta', route: 'Account', outline: UserCircleIconOutline, solid: UserCircleIconSolid },
];

const padelNavItems: readonly NavItem[] = [
  { key: 'Inicio', route: 'Home', outline: HomeIconOutline, solid: HomeIconSolid },
  { key: 'Canchas', route: 'Clases', outline: Squares2X2IconOutline, solid: Squares2X2IconSolid },
  { key: 'Paquetes', route: 'Paquetes', outline: CubeIconOutline, solid: CubeIconSolid },
  { key: 'Eventos', route: 'Eventos', outline: TicketIconOutline, solid: TicketIconSolid },
  { key: 'Menú', route: 'Account', outline: UserCircleIconOutline, solid: UserCircleIconSolid },
];

export function BottomNavBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { sport } = useSportMode();
  const activeRoute = state.routes[state.index].name;
  const navItems = sport === 'padel' ? padelNavItems : pilatesNavItems;

  return (
    <View style={[styles.navBar, { paddingBottom: 10 + insets.bottom }]}>
      {navItems.map(item => {
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
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {item.key}
            </Text>
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
    ...Platform.select({
      ios: {
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 12,
      },
    }),
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
