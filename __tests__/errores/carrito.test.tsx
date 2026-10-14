import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, screen, userEvent, waitFor } from '@testing-library/react-native';
import type { PaqueteResponse } from '@/api/types';
import { CarritoProvider, useCarrito } from '@/features/packages/context/CarritoContext';
import { CarritoScreen } from '@/features/packages/screens/CarritoScreen';
import { llamadasA, mockFetch, respuesta } from '../helpers/fetchMock';

// Matriz #20–#29: CarritoContext.tsx, pagos.ts, CarritoScreen.tsx + Stripe.

// Sesión controlable por test (token presente / logout a mitad del pago).
jest.mock('@/features/auth', () => {
  const R = require('react');
  const SesionCtx = R.createContext({ token: null });
  return { __SesionCtx: SesionCtx, useAuth: () => R.useContext(SesionCtx) };
});

// El botón real, pero guardando su último onPress para poder simular dos taps
// nativos que llegan antes del re-render (#25).
const mockBoton: { onPress?: () => void } = {};
jest.mock('@/components/PrimaryButton', () => {
  const real = jest.requireActual('@/components/PrimaryButton');
  const R = require('react');
  return {
    PrimaryButton: (props: { onPress?: () => void }) => {
      if (props.onPress) {
        mockBoton.onPress = props.onPress;
      }
      return R.createElement(real.PrimaryButton, props);
    },
  };
});

const { __SesionCtx: SesionCtx } = jest.requireMock('@/features/auth');
const { __stripe: stripe } = jest.requireMock('@stripe/stripe-react-native');

const PAQUETES: PaqueteResponse[] = [
  {
    id: 'p-1',
    categoria: 'pilates',
    nombre: 'Pilates 8 clases',
    descripcion: null,
    precioCentavos: 160000,
    vigenciaDias: 30,
    unitarioTexto: null,
    destacado: false,
  },
  {
    id: 'p-2',
    categoria: 'bacu_fit',
    nombre: 'Bacu Fit 4 clases',
    descripcion: null,
    precioCentavos: 90000,
    vigenciaDias: 30,
    unitarioTexto: null,
    destacado: false,
  },
];

const INTENTO_OK = { compraIds: ['c-1'], clientSecret: 'pi_prueba_secret_prueba', publishableKey: 'pk_test_prueba' };

function Sembrar() {
  const { toggleItem } = useCarrito();
  useEffect(() => {
    PAQUETES.forEach(toggleItem);
  }, [toggleItem]);
  return null;
}

function arbol(token: string | null, navigation: object) {
  return (
    <SesionCtx.Provider value={{ token }}>
      <CarritoProvider>
        <Sembrar />
        <CarritoScreen {...({ navigation, route: { key: 'Carrito', name: 'Carrito' } } as unknown as React.ComponentProps<typeof CarritoScreen>)} />
      </CarritoProvider>
    </SesionCtx.Provider>
  );
}

function clavesEnviadas(fetchMock: jest.Mock): string[] {
  return llamadasA(fetchMock, '/api/pagos/paquetes/intento', 'POST').map(
    ([, init]) => JSON.parse(String(init?.body)).idempotencyKey,
  );
}

describe('Carrito y pago', () => {
  let fetchMock: ReturnType<typeof mockFetch>;
  let alertSpy: jest.SpyInstance;
  const navigation = { goBack: jest.fn(), navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock = mockFetch();
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    stripe.initPaymentSheet.mockResolvedValue({ error: undefined });
    stripe.presentPaymentSheet.mockResolvedValue({ error: undefined });
  });

  afterEach(() => {
    fetchMock.mockRestore();
    alertSpy.mockRestore();
  });

  async function montar(token: string | null = 'jwt-de-prueba') {
    const utils = await render(arbol(token, navigation));
    expect(await screen.findByText('Pilates 8 clases')).toBeOnTheScreen();
    return utils;
  }

  async function pagar() {
    await fireEvent.press(screen.getByText('Pagar'));
    await waitFor(() => expect(screen.getByText('Pagar')).toBeOnTheScreen());
  }

  test('#20 logout con pago en curso → no queda colgado: carrito vacío y procesando liberado', async () => {
    // fireEvent.press espera al handler async completo, así que el logout se
    // dispara desde dentro del fetch en vuelo (mismo instante que en la app).
    let cerrarSesion!: () => void;
    function ConSesionMutable() {
      const [token, setToken] = React.useState<string | null>('jwt-de-prueba');
      cerrarSesion = () => setToken(null);
      return arbol(token, navigation);
    }
    fetchMock.mockImplementationOnce(async () => {
      cerrarSesion();
      await new Promise<void>(resolve => setTimeout(resolve, 10));
      return respuesta({ status: 200, body: INTENTO_OK });
    });
    stripe.presentPaymentSheet.mockResolvedValueOnce({ error: { code: 'Canceled', message: 'cancelado' } });
    await render(<ConSesionMutable />);
    expect(await screen.findByText('Pilates 8 clases')).toBeOnTheScreen();

    await fireEvent.press(screen.getByText('Pagar'));

    expect(screen.getByText('Tu carrito está vacío')).toBeOnTheScreen();
    expect(alertSpy).not.toHaveBeenCalled();
    // El flujo en vuelo terminó (finally → procesando false) en vez de colgarse,
    // pero sí llegó a abrir el PaymentSheet con la sesión ya cerrada.
    expect(stripe.presentPaymentSheet).toHaveBeenCalledTimes(1);
  });

  test('#21 HALLAZGO: intento 401 (sesión vencida) → Alert genérico, carrito se conserva', async () => {
    // feellingPilates-pagos: src/middleware/auth.ts:42 → 401 {error: 'Token invalido o expirado'}
    fetchMock.mockResolvedValueOnce(respuesta({ status: 401, body: { error: 'Token invalido o expirado' } }));
    await montar();

    await pagar();

    expect(alertSpy).toHaveBeenCalledWith('No se pudo iniciar el pago', 'Ocurrió un error inesperado');
    expect(screen.getByText('Pilates 8 clases')).toBeOnTheScreen();
    expect(stripe.initPaymentSheet).not.toHaveBeenCalled();
  });

  test.each([
    ['#22 400 paqueteIds inválido', 400, { error: 'paqueteIds invalido' }],
    ['#23 404 paquete inactivo', 404, { error: 'Paquete no encontrado' }],
    ['#24 502 error de Stripe', 502, { error: 'Tu tarjeta fue rechazada', origen: 'stripe_decline' }],
  ])('%s → Alert, carrito intacto y el reintento reusa la misma clave', async (_caso, status, body) => {
    fetchMock
      .mockResolvedValueOnce(respuesta({ status, body }))
      .mockResolvedValueOnce(respuesta({ status, body }));
    await montar();

    await pagar();
    await pagar();

    // HALLAZGO (ver matriz): el mensaje del backend ({error}) nunca llega al usuario.
    expect(alertSpy).toHaveBeenNthCalledWith(1, 'No se pudo iniciar el pago', 'Ocurrió un error inesperado');
    expect(screen.getByText('Bacu Fit 4 clases')).toBeOnTheScreen();
    const claves = clavesEnviadas(fetchMock);
    expect(claves).toHaveLength(2);
    expect(claves[0]).toBe(claves[1]);
  });

  test('#25 dos taps antes del re-render → misma clave de idempotencia en ambas llamadas', async () => {
    fetchMock.mockResolvedValue(respuesta({ status: 200, body: INTENTO_OK }));
    stripe.presentPaymentSheet.mockResolvedValue({ error: { code: 'Canceled', message: 'cancelado' } });
    await montar();
    const onPressDelPrimerRender = mockBoton.onPress!;

    await act(async () => {
      // Ambos taps usan el handler del mismo render (procesando aún false en su closure).
      onPressDelPrimerRender();
      onPressDelPrimerRender();
    });
    await waitFor(() => expect(screen.getByText('Pagar')).toBeOnTheScreen());

    const claves = clavesEnviadas(fetchMock);
    // La guarda `procesando` no alcanza a bloquear el 2º tap (ventana real),
    // pero la clave vive en un ref y se reutiliza: el backend deduplica.
    expect(claves).toHaveLength(2);
    expect(new Set(claves).size).toBe(1);
  });

  test('#25b ya re-renderizado con loading → PrimaryButton ignora el tap', async () => {
    const { PrimaryButton } = jest.requireActual('@/components/PrimaryButton');
    const onPress = jest.fn();
    await render(<PrimaryButton label="Pagar" onPress={onPress} loading />);

    // userEvent recorre el camino nativo (pressIn/pressOut del Pressable real);
    // fireEvent subiría hasta las props de PrimaryButton y daría un falso positivo.
    const user = userEvent.setup();
    await user.press(screen.root!);
    expect(onPress).not.toHaveBeenCalled();

    // Control: el mismo botón sin loading sí dispara.
    await screen.rerender(<PrimaryButton label="Pagar" onPress={onPress} />);
    await user.press(screen.getByText('Pagar'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('#26 initPaymentSheet con initError → Alert, procesando false, clave conservada', async () => {
    fetchMock.mockResolvedValue(respuesta({ status: 200, body: INTENTO_OK }));
    stripe.initPaymentSheet.mockResolvedValueOnce({ error: { code: 'Failed', message: 'Configuración inválida' } });
    await montar();

    await pagar();
    expect(alertSpy).toHaveBeenCalledWith('No se pudo iniciar el pago', 'Configuración inválida');
    expect(stripe.presentPaymentSheet).not.toHaveBeenCalled();

    stripe.presentPaymentSheet.mockResolvedValueOnce({ error: { code: 'Canceled', message: 'x' } });
    await pagar();
    const claves = clavesEnviadas(fetchMock);
    expect(claves[0]).toBe(claves[1]);
  });

  test('#27 presentPaymentSheet Canceled → sin Alert, carrito intacto', async () => {
    fetchMock.mockResolvedValueOnce(respuesta({ status: 200, body: INTENTO_OK }));
    stripe.presentPaymentSheet.mockResolvedValueOnce({ error: { code: 'Canceled', message: 'cancelado' } });
    await montar();

    await pagar();

    expect(alertSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Pilates 8 clases')).toBeOnTheScreen();
    expect(screen.getByText('Bacu Fit 4 clases')).toBeOnTheScreen();
  });

  test('#28 presentPaymentSheet con error real → Alert, carrito y clave conservados', async () => {
    fetchMock.mockResolvedValue(respuesta({ status: 200, body: INTENTO_OK }));
    stripe.presentPaymentSheet.mockResolvedValueOnce({
      error: { code: 'Failed', message: 'Tu tarjeta fue rechazada.' },
    });
    await montar();

    await pagar();
    expect(alertSpy).toHaveBeenCalledWith('No se completó el pago', 'Tu tarjeta fue rechazada.');
    expect(screen.getByText('Pilates 8 clases')).toBeOnTheScreen();

    stripe.presentPaymentSheet.mockResolvedValueOnce({ error: { code: 'Canceled', message: 'x' } });
    await pagar();
    const claves = clavesEnviadas(fetchMock);
    expect(claves[0]).toBe(claves[1]);
  });

  test('#29 pago exitoso → vacía carrito sin reconsultar al backend', async () => {
    fetchMock.mockResolvedValue(respuesta({ status: 200, body: INTENTO_OK }));
    await montar();

    await fireEvent.press(screen.getByText('Pagar'));

    expect(await screen.findByText('¡Compra exitosa!')).toBeOnTheScreen();
    expect(screen.getByText('Tu carrito está vacío')).toBeOnTheScreen();
    // Solo se llamó al intento; nunca a mis-compras ni a estado-en-vivo.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(llamadasA(fetchMock, '/api/pagos/mis-compras')).toHaveLength(0);
  });
});
