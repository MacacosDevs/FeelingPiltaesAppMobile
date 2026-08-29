import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthScreen, useAuth } from '@/features/auth';
import { ClassDetailScreen } from '@/features/classes';
import { SportModeProvider } from '@/context/SportModeContext';
import { CourtReservationsProvider } from '@/context/CourtReservationsContext';
import { SplashScreen } from './components/SplashScreen';
import { MainTabs } from './MainTabs';
import { InstructorTabs } from './InstructorTabs';
import { EditProfileScreen } from '@/screens/EditProfileScreen';
import { InstructorEditProfileScreen } from '@/screens/InstructorEditProfileScreen';
import { InstructorProfileScreen } from '@/screens/InstructorProfileScreen';
import { InstructorClassDetailScreen } from '@/screens/InstructorClassDetailScreen';
import { InstructorClassCheckInScreen } from '@/screens/InstructorClassCheckInScreen';
import { CourtBookingScreen } from '@/screens/CourtBookingScreen';
import { CourtBookingConfirmationScreen } from '@/screens/CourtBookingConfirmationScreen';
import { CarritoProvider, CarritoScreen } from '@/features/packages';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function Navigator() {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  // Un usuario con rol INSTRUCTOR ve un shell distinto (calendario propio +
  // pasar lista) en vez de las tabs de cliente (Inicio/Clases/Paquetes/...).
  const isInstructor = user?.roles.includes('INSTRUCTOR') ?? false;

  // Sin sesión se puede explorar toda la app (Home, Clases, Paquetes, Eventos)
  // como invitado; Auth (login/registro, alternables sin navegar) se alcanza
  // bajo demanda solo al intentar reservar o comprar un paquete, no como
  // puerta de entrada obligatoria.
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Main" component={isInstructor ? InstructorTabs : MainTabs} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="InstructorEditProfile" component={InstructorEditProfileScreen} />
      <Stack.Screen name="ClassDetail" component={ClassDetailScreen} />
      <Stack.Screen name="InstructorProfile" component={InstructorProfileScreen} />
      <Stack.Screen name="InstructorClassDetail" component={InstructorClassDetailScreen} />
      <Stack.Screen name="InstructorClassCheckIn" component={InstructorClassCheckInScreen} />
      <Stack.Screen name="CourtBooking" component={CourtBookingScreen} />
      <Stack.Screen name="CourtBookingConfirmation" component={CourtBookingConfirmationScreen} />
      <Stack.Screen name="Carrito" component={CarritoScreen} />
    </Stack.Navigator>
  );
}

export function RootNavigator() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <SportModeProvider>
          <CourtReservationsProvider>
            <NavigationContainer>
              <Navigator />
            </NavigationContainer>
          </CourtReservationsProvider>
        </SportModeProvider>
      </CarritoProvider>
    </AuthProvider>
  );
}
