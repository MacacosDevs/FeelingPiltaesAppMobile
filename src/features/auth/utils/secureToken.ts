import * as Keychain from 'react-native-keychain';

// El JWT de sesión vivía en AsyncStorage sin cifrar (legible en texto plano
// para quien tuviera acceso al almacenamiento de la app, ej. un dispositivo
// rooteado). Keychain lo guarda cifrado por el sistema operativo (Keychain en
// iOS, Keystore en Android).
const SERVICE = 'feelingpilates.token';

export async function guardarToken(token: string): Promise<void> {
  await Keychain.setGenericPassword('feelingpilates', token, { service: SERVICE });
}

export async function obtenerToken(): Promise<string | null> {
  const credenciales = await Keychain.getGenericPassword({ service: SERVICE });
  return credenciales ? credenciales.password : null;
}

export async function borrarToken(): Promise<void> {
  await Keychain.resetGenericPassword({ service: SERVICE });
}
