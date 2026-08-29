import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { InstructorCalendarScreen, InstructorAccountScreen } from '@/features/instructor';
import { InstructorNavBar } from './components/InstructorNavBar';
import { TopBar } from './components/TopBar';
import { colors } from '@/theme';
import type { InstructorTabParamList } from './types';

const Tab = createBottomTabNavigator<InstructorTabParamList>();

function renderTabBar(props: React.ComponentProps<typeof InstructorNavBar>) {
  return <InstructorNavBar {...props} />;
}

export function InstructorTabs() {
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.topBarSafeArea} edges={['top']}>
        <TopBar />
      </SafeAreaView>

      <View style={styles.navigator}>
        <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={renderTabBar}>
          <Tab.Screen name="Calendario" component={InstructorCalendarScreen} />
          <Tab.Screen name="Cuenta" component={InstructorAccountScreen} />
        </Tab.Navigator>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBarSafeArea: {
    backgroundColor: colors.surface,
  },
  navigator: {
    flex: 1,
  },
});
