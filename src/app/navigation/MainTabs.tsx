import React from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '@/features/home';
import { ClassesScreen } from '@/features/classes';
import { PackagesScreen } from '@/features/packages';
import { EventsScreen } from '@/features/events';
import { AccountScreen } from '@/features/account';
import { BottomNavBar } from './components/BottomNavBar';
import { TopBar } from './components/TopBar';
import { colors } from '@/theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

function renderTabBar(props: React.ComponentProps<typeof BottomNavBar>) {
  return <BottomNavBar {...props} />;
}

const slideTransitionSpec = {
  animation: 'timing',
  config: {
    duration: 240,
    easing: Easing.inOut(Easing.ease),
  },
} as const;

export function MainTabs() {
  const { width } = useWindowDimensions();

  const sceneStyleInterpolator = ({ current }: { current: { progress: Animated.Value } }) => ({
    sceneStyle: {
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [-width, 0, width],
          }),
        },
      ],
    },
  });

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.topBarSafeArea} edges={['top']}>
        <TopBar />
      </SafeAreaView>

      <View style={styles.navigator}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            transitionSpec: slideTransitionSpec,
            sceneStyleInterpolator,
          }}
          tabBar={renderTabBar}>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Clases" component={ClassesScreen} />
          <Tab.Screen name="Paquetes" component={PackagesScreen} />
          <Tab.Screen name="Eventos" component={EventsScreen} />
          <Tab.Screen name="Account" component={AccountScreen} />
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
