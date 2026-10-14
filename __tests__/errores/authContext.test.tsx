import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Keychain from 'react-native-keychain';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { ApiError } from '@/api/client';
import { AuthProvider, useAuth } from '@/features/auth';
import { mapAuthError, mapGoogleAuthError } from '@/features/auth/utils/authErrors';
import { llamadasA, mockFetch, respuesta, usuarioDePrueba } from '../helpers/fetchMock';

// Matriz #8–#19: AuthContext.tsx + secureToken.ts
const keychain = Keychain as jest.Mocked<typeof Keychain>;
const google = GoogleSignin as jest.Mocked<typeof GoogleSignin>;

const TOKEN_GUARDADO = { username: 'feelingpilates', password: 'jwt-guardado-de-prueba' };

function montarAuth() {
  return renderHook(() => useAuth(), {
    wrapper: ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>,
  });
}

// Tras el arranque, deja una sesión iniciada con un token en memoria.
async function montarConSesion(fetchMock: ReturnType<typeof mockFetch>) {
  keychain.getGenericPassword.mockResolvedValueOnce(TOKEN_GUARDADO as never);
  fetchMock.mockResolvedValueOnce(respuesta({ status: 200, body: usuarioDePrueba }));
  const hook = await montarAuth();
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  expect(hook.result.current.token).toBe(TOKEN_GUARDADO.password);
  return hook;
}

describe('Sesión y arranque (AuthContext)', () => {
  let fetchMock: ReturnType<typeof mockFetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock = mockFetch();
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  test('#8 sin token guardado → isLoading false, user/token null, no llama obtenerPerfil', async () => {
    const { result } = await montarAuth();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('#9 token guardado válido → user/token seteados, photoVersion cambia', async () => {
    keychain.getGenericPassword.mockResolvedValueOnce(TOKEN_GUARDADO as never);
    fetchMock.mockResolvedValueOnce(respuesta({ status: 200, body: usuarioDePrueba }));

    const { result } = await montarAuth();
    const photoVersionInicial = result.current.photoVersion;

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.token).toBe(TOKEN_GUARDADO.password);
    expect(result.current.user?.id).toBe('u-1');
    expect(result.current.photoVersion).toBeGreaterThanOrEqual(photoVersionInicial);
    const [, init] = llamadasA(fetchMock, '/api/usuarios/me')[0];
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer jwt-guardado-de-prueba');
  });

  test('#10 token guardado vencido (401) → borrarToken, sesión en null, isLoading false', async () => {
    keychain.getGenericPassword.mockResolvedValueOnce(TOKEN_GUARDADO as never);
    fetchMock.mockResolvedValueOnce(respuesta({ status: 401, raw: '' }));

    const { result } = await montarAuth();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(keychain.resetGenericPassword).toHaveBeenCalledTimes(1);
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  test('#10b HALLAZGO: arrancar SIN CONEXIÓN también borra el token guardado (cierra la sesión)', async () => {
    keychain.getGenericPassword.mockResolvedValueOnce(TOKEN_GUARDADO as never);
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));

    const { result } = await montarAuth();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // El catch de AuthContext.tsx:63 no distingue 401 de status 0 / 5xx.
    expect(keychain.resetGenericPassword).toHaveBeenCalledTimes(1);
    expect(result.current.token).toBeNull();
  });

  // #11 vive en authArranqueKeychain.test.tsx: necesita aislar el rechazo sin
  // manejar del useEffect para poder afirmar sobre él.

  test('#12 login con credenciales inválidas (401) → el error llega a la pantalla ya traducido', async () => {
    const { result } = await montarAuth();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    fetchMock.mockResolvedValueOnce(respuesta({ status: 401, body: { message: 'Credenciales inválidas' } }));

    const error = await result.current.login('cliente@prueba.test', 'mala').catch(e => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(mapAuthError(error, 'login').general).toBe(
      'El correo o la contraseña son incorrectos. Verifica tus datos e intenta de nuevo.',
    );
    expect(result.current.token).toBeNull();
    expect(keychain.setGenericPassword).not.toHaveBeenCalled();
  });

  test('#12b registro con correo existente (409) → error en el campo correo', async () => {
    const { result } = await montarAuth();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    fetchMock.mockResolvedValueOnce(respuesta({ status: 409, body: { message: 'Ya existe' } }));

    const error = await result.current.registrar('a@prueba.test', '12345678', 'A').catch(e => e);

    expect(mapAuthError(error, 'registro').correoError).toBe(
      'Ya existe una cuenta con este correo. Intenta iniciar sesión.',
    );
  });

  test('#13 login ok en backend pero guardarToken (Keychain) tira → sesión no se refleja, mensaje genérico', async () => {
    const { result } = await montarAuth();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    fetchMock.mockResolvedValueOnce(respuesta({ status: 200, body: { token: 'jwt-nuevo', tipo: 'Bearer' } }));
    keychain.setGenericPassword.mockRejectedValueOnce(new Error('Keystore no disponible'));

    const error = await result.current.login('cliente@prueba.test', 'buena').catch(e => e);

    expect(error).not.toBeInstanceOf(ApiError);
    expect(mapAuthError(error, 'login').general).toBe('Ocurrió un error inesperado. Intenta de nuevo.');
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    // Nunca se pidió el perfil: el flujo se cortó antes.
    expect(llamadasA(fetchMock, '/api/usuarios/me')).toHaveLength(0);
  });

  test('#14 hasPlayServices() tira → error nativo sin normalizar → mensaje genérico', async () => {
    const { result } = await montarAuth();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    google.hasPlayServices.mockRejectedValueOnce(
      Object.assign(new Error('Play services not available'), { code: 'PLAY_SERVICES_NOT_AVAILABLE' }),
    );

    const error = await result.current.loginConGoogle().catch(e => e);

    expect(error).not.toBeInstanceOf(ApiError);
    expect(mapGoogleAuthError(error)).toBe('Ocurrió un error inesperado. Intenta de nuevo.');
    expect(google.signIn).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('#15 HALLAZGO: cancelar el picker de Google se muestra como error', async () => {
    const { result } = await montarAuth();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    google.signIn.mockResolvedValueOnce({ type: 'cancelled', data: null } as never);

    const error = await result.current.loginConGoogle().catch(e => e);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('No se pudo iniciar sesión con Google');
    // AuthScreen.tsx:96 hace setError(mapGoogleAuthError(e)) sin distinguir cancelación.
    expect(mapGoogleAuthError(error)).toBe('Ocurrió un error inesperado. Intenta de nuevo.');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('#16 backend rechaza el idToken (401) → ApiError con mensaje del backend, distinto al de cancelación', async () => {
    const { result } = await montarAuth();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    fetchMock.mockResolvedValueOnce(respuesta({ status: 401, body: { message: 'Token de Google inválido' } }));

    const error = await result.current.loginConGoogle().catch(e => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(mapGoogleAuthError(error)).toBe('Token de Google inválido');
    const [, init] = llamadasA(fetchMock, '/api/auth/google', 'POST')[0];
    expect(JSON.parse(String(init?.body))).toEqual({ idToken: 'google-id-token-de-prueba' });
  });

  test.each(['deleteAccount', 'updateProfile', 'updatePhoto'] as const)(
    '#17 %s sin token → Error("No hay sesión activa"), no ApiError → el caller muestra el genérico',
    async metodo => {
      const { result } = await montarAuth();
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const llamada =
        metodo === 'deleteAccount'
          ? result.current.deleteAccount()
          : metodo === 'updateProfile'
            ? result.current.updateProfile('N', '', '')
            : result.current.updatePhoto({ uri: 'file:///foto.jpg' });
      const err = await llamada.catch(e => e);

      expect(err.message).toBe('No hay sesión activa');
      expect(err).not.toBeInstanceOf(ApiError);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  test('#18 HALLAZGO: logout con resetGenericPassword tirando → aborta, la sesión sigue en memoria', async () => {
    const { result } = await montarConSesion(fetchMock);
    keychain.resetGenericPassword.mockRejectedValueOnce(new Error('Keystore no disponible'));

    let error: unknown;
    await act(async () => {
      error = await result.current.logout().catch(e => e);
    });

    expect((error as Error).message).toBe('Keystore no disponible');
    // setToken(null)/setUser(null) están después del await borrarToken().
    expect(result.current.token).toBe(TOKEN_GUARDADO.password);
    expect(result.current.user?.id).toBe('u-1');
  });

  test('#19 subirFoto con uri inaccesible → RN rechaza el fetch → el usuario ve "No se pudo conectar"', async () => {
    const { result } = await montarConSesion(fetchMock);
    // Comportamiento de RN cuando no puede leer el archivo de un FormData:
    // la promesa de fetch se rechaza (igual que sin red).
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));

    let error: unknown;
    await act(async () => {
      error = await result.current.updatePhoto({ uri: 'file:///borrada.jpg' }).catch(e => e);
    });

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(0);
    expect((error as ApiError).message).toBe('No se pudo conectar con el servidor');
    const [, init] = llamadasA(fetchMock, '/api/usuarios/me/foto', 'POST')[0];
    expect(init?.body).toBeInstanceOf(FormData);
  });
});
