import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { SportModeProvider } from '../context/SportModeContext';
import { ReservationsProvider } from '../context/ReservationsContext';
import { CourtReservationsProvider } from '../context/CourtReservationsContext';
import { SplashScreen } from '../components/SplashScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { MainTabs } from './MainTabs';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { ClassDetailScreen } from '../screens/ClassDetailScreen';
import { InstructorProfileScreen } from '../screens/InstructorProfileScreen';
import { CourtBookingScreen } from '../screens/CourtBookingScreen';
import { CourtBookingConfirmationScreen } from '../screens/CourtBookingConfirmationScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function Navigator() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  // Sin sesión se puede explorar toda la app (Home, Clases, Paquetes, Eventos)
  // como invitado; Auth (login/registro, alternables sin navegar) se alcanza
  // bajo demanda solo al intentar reservar o comprar un paquete, no como
  // puerta de entrada obligatoria.
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ClassDetail" component={ClassDetailScreen} />
      <Stack.Screen name="InstructorProfile" component={InstructorProfileScreen} />
      <Stack.Screen name="CourtBooking" component={CourtBookingScreen} />
      <Stack.Screen name="CourtBookingConfirmation" component={CourtBookingConfirmationScreen} />
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
