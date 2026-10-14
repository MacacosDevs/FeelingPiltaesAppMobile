import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { AuthProvider, AuthScreen } from '@/features/auth';
import { mockFetch, respuesta } from '../helpers/fetchMock';

// Matriz #12, #15 y #16 vistos desde la pantalla real (AuthScreen.tsx).
const google = GoogleSignin as jest.Mocked<typeof GoogleSignin>;

function montarPantalla() {
  const navigation = { goBack: jest.fn(), canGoBack: jest.fn(() => true), navigate: jest.fn() };
  const props = {
    navigation,
    route: { key: 'Auth', name: 'Auth', params: { mode: 'login' } },
  } as unknown as React.ComponentProps<typeof AuthScreen>;
  return {
    navigation,
    render: () =>
      render(
        <AuthProvider>
          <AuthScreen {...props} />
        </AuthProvider>,
      ),
  };
}

describe('AuthScreen: errores visibles', () => {
  let fetchMock: ReturnType<typeof mockFetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock = mockFetch();
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  test('#12 login 401 → se muestra el mensaje en la pantalla y no navega', async () => {
    const pantalla = montarPantalla();
    await pantalla.render();
    fetchMock.mockResolvedValueOnce(respuesta({ status: 401, body: { message: 'Credenciales inválidas' } }));

    await fireEvent.changeText(screen.getByPlaceholderText('Correo electrónico'), 'cliente@prueba.test');
    await fireEvent.changeText(screen.getByPlaceholderText('Contraseña'), 'contrasena-mala');
    await fireEvent.press(screen.getByText('Comenzar sesión'));

    expect(
      await screen.findByText('El correo o la contraseña son incorrectos. Verifica tus datos e intenta de nuevo.'),
    ).toBeOnTheScreen();
    expect(pantalla.navigation.goBack).not.toHaveBeenCalled();
  });

  test('#12c login sin conexión → mensaje de conexión, no el genérico', async () => {
    const pantalla = montarPantalla();
    await pantalla.render();
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));

    await fireEvent.changeText(screen.getByPlaceholderText('Correo electrónico'), 'cliente@prueba.test');
    await fireEvent.changeText(screen.getByPlaceholderText('Contraseña'), 'contrasena');
    await fireEvent.press(screen.getByText('Comenzar sesión'));

    expect(
      await screen.findByText('No se pudo conectar. Revisa tu conexión a internet e intenta de nuevo.'),
    ).toBeOnTheScreen();
  });

  test('#15 HALLAZGO: cerrar el picker de Google pinta "Ocurrió un error inesperado"', async () => {
    const pantalla = montarPantalla();
    await pantalla.render();
    google.signIn.mockResolvedValueOnce({ type: 'cancelled', data: null } as never);

    await fireEvent.press(screen.getByText('Continuar con Google'));

    expect(await screen.findByText('Ocurrió un error inesperado. Intenta de nuevo.')).toBeOnTheScreen();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('#16 backend rechaza el idToken → se muestra el mensaje del backend', async () => {
    const pantalla = montarPantalla();
    await pantalla.render();
    fetchMock.mockResolvedValueOnce(respuesta({ status: 401, body: { message: 'Token de Google inválido' } }));

    await fireEvent.press(screen.getByText('Continuar con Google'));

    expect(await screen.findByText('Token de Google inválido')).toBeOnTheScreen();
    expect(pantalla.navigation.goBack).not.toHaveBeenCalled();
  });
});
