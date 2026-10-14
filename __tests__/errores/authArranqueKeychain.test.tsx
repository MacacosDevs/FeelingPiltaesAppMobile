import React from 'react';
import { act, render, renderHook, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { AuthProvider, useAuth } from '@/features/auth';
import { mockFetch } from '../helpers/fetchMock';

// Matriz #11 — aislado en su propio archivo: el rechazo que se quiere probar
// ocurre dentro del IIFE async del useEffect de AuthContext y nadie lo maneja.
// Jest lo reportaría como fallo del test; para poder afirmar sobre él se
// envuelve el helper de babel que compila las funciones async y se registra
// cada rechazo que produzcan (sin alterar la promesa que recibe el código).
const rechazosDeFuncionesAsync: unknown[] = [];
jest.mock('@babel/runtime/helpers/asyncToGenerator', () => {
  const original = jest.requireActual('@babel/runtime/helpers/asyncToGenerator');
  return (fn: (...args: unknown[]) => unknown) => {
    const envuelta = original(fn);
    return function (this: unknown, ...args: unknown[]) {
      const promesa: Promise<unknown> = envuelta.apply(this, args);
      promesa.catch((razon: unknown) => rechazosDeFuncionesAsync.push(razon));
      return promesa;
    };
  };
});

const keychain = Keychain as jest.Mocked<typeof Keychain>;

function EstadoDeArranque() {
  const { isLoading } = useAuth();
  // Réplica del criterio de RootNavigator.tsx:30 (isLoading → <SplashScreen />).
  return <Text>{isLoading ? 'splash' : 'app'}</Text>;
}

test('#11 HALLAZGO: si Keychain.getGenericPassword tira al arrancar, la app se queda en Splash para siempre', async () => {
  const fetchMock = mockFetch();
  keychain.getGenericPassword.mockRejectedValueOnce(new Error('Keystore corrupto'));

  const hook = await renderHook(() => useAuth(), {
    wrapper: ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>,
  });
  await act(async () => {
    await new Promise<void>(resolve => setTimeout(resolve, 100));
  });

  expect(hook.result.current.isLoading).toBe(true);
  expect(hook.result.current.token).toBeNull();
  expect(fetchMock).not.toHaveBeenCalled();
  expect(rechazosDeFuncionesAsync.map(e => (e as Error).message)).toContain('Keystore corrupto');

  fetchMock.mockRestore();
});

test('#11b control: el mismo árbol con Keychain sano sale del Splash', async () => {
  await render(
    <AuthProvider>
      <EstadoDeArranque />
    </AuthProvider>,
  );

  expect(await screen.findByText('app')).toBeOnTheScreen();
});
