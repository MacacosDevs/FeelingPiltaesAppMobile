import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Clases: undefined;
  Paquetes: undefined;
  Eventos: undefined;
  Account: undefined;
};

export type RootStackParamList = {
  Auth: { mode?: 'login' | 'register' } | undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  EditProfile: undefined;
  ClassDetail: { claseId: string };
  InstructorProfile: { instructora: string };
  CourtBooking: { horarioId: string };
  CourtBookingConfirmation: {
    horarioId: string;
    duracionMin: number;
    modalidad: 'Individual' | 'Dobles';
  };
};
