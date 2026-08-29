// Superficie pública de la feature "auth": lo único que otras features
// deben importar de aquí (nunca directo a context/api/utils internos).
export { AuthProvider, useAuth } from './context/AuthContext';
export { AuthScreen } from './screens/AuthScreen';
