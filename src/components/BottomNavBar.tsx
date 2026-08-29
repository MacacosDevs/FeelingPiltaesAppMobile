import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  NavCalendarIcon,
  NavHomeIcon,
  NavPackageIcon,
  NavTicketIcon,
  NavUserIcon,
} from './BottomNavIcons';
import { colors, fontFamily, fontSize, fontWeight, radius, shadows } from '../theme';
import type { MainTabParamList } from '../navigation/types';

type NavItem = {
  key: string;
  route: keyof MainTabParamList;
  IconComponent: React.ComponentType<{ active: boolean; size?: number; color?: string }>;
};

const navItems: readonly NavItem[] = [
  { key: 'Inicio', route: 'Home', IconComponent: NavHomeIcon },
  { key: 'Horario', route: 'Clases', IconComponent: NavCalendarIcon },
  { key: 'Paquetes', route: 'Paquetes', IconComponent: NavPackageIcon },
  { key: 'Eventos', route: 'Eventos', IconComponent: NavTicketIcon },
  { key: 'Perfil', route: 'Account', IconComponent: NavUserIcon },
];

export function BottomNavBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index].name;

  return (
    <View style={[styles.navBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {navItems.map(item => {
        const isActive = item.route === activeRoute;
        const Icon = item.IconComponent;
        return (
          <Pressable
            key={item.route}
            style={styles.navItem}
            hitSlop={8}
            onPress={!isActive ? () => navigation.navigate(item.route) : undefined}>
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Icon active={isActive} size={22} />
            </View>
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {item.key}
            </Text>
            {isActive && <View style={styles.activeDot} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.tabBar,
  },
  navItem: {
    alignItems: 'center',
    gap: 3,
    minWidth: 54,
    position: 'relative',
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
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    marginTop: -1,
  },
});
