import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { SportModeProvider } from '../context/SportModeContext';
import { ReservationsProvider } from '../context/ReservationsContext';
import { CourtReservationsProvider } from '../context/CourtReservationsContext';
import { SplashScreen } from '../components/SplashScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { MainTabs } from './MainTabs';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { ClassDetailScreen } from '../screens/ClassDetailScreen';
import { InstructorProfileScreen } from '../screens/InstructorProfileScreen';
import { CourtBookingScreen } from '../screens/CourtBookingScreen';
import { CourtBookingConfirmationScreen } from '../screens/CourtBookingConfirmationScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function Navigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {token ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="ClassDetail" component={ClassDetailScreen} />
          <Stack.Screen name="InstructorProfile" component={InstructorProfileScreen} />
          <Stack.Screen name="CourtBooking" component={CourtBookingScreen} />
          <Stack.Screen name="CourtBookingConfirmation" component={CourtBookingConfirmationScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export function RootNavigator() {
  return (
    <AuthProvider>
      <SportModeProvider>
        <ReservationsProvider>
          <CourtReservationsProvider>
            <NavigationContainer>
              <Navigator />
            </NavigationContainer>
          </CourtReservationsProvider>
        </ReservationsProvider>
      </SportModeProvider>
    </AuthProvider>
  );
}
