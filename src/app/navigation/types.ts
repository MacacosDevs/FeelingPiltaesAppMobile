import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Clases: undefined;
  Paquetes: undefined;
  Eventos: undefined;
  Account: undefined;
};

export type InstructorTabParamList = {
  Calendario: undefined;
  Cuenta: undefined;
};

export type RootStackParamList = {
  Auth: { mode?: 'login' | 'register' } | undefined;
  Main: NavigatorScreenParams<MainTabParamList> | NavigatorScreenParams<InstructorTabParamList> | undefined;
  EditProfile: undefined;
  InstructorEditProfile: undefined;
  ClassDetail: { claseId: string };
  // `nombre` solo sirve para pintar el encabezado mientras carga el perfil.
  InstructorProfile: { instructorId: string; nombre: string };
  InstructorClassDetail: { claseId: string };
  InstructorClassCheckIn: { claseId: string };
  CourtBooking: { horarioId: string };
  CourtBookingConfirmation: {
    horarioId: string;
    duracionMin: number;
    modalidad: 'Individual' | 'Dobles';
  };
  Carrito: undefined;
};
