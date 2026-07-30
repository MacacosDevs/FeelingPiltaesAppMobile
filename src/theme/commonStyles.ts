import { StyleSheet } from 'react-native';
import { colors } from './colors';

// Estilos compartidos entre pantallas. Evita repetir el mismo bloque de
// StyleSheet.create (screen container) en cada archivo de src/screens.
export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
