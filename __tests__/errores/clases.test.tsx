import React from 'react';
import { Alert, Linking } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ClaseResponse } from '@/api/types';
import { ApiError } from '@/api/client';
import { cancelarReserva } from '@/features/classes/api/clases';
import { ClassDetailScreen } from '@/features/classes/screens/ClassDetailScreen';
import { InstructorClassCheckInScreen } from '@/features/instructor/screens/InstructorClassCheckInScreen';
import { llamadasA, mockFetch, respuesta, usuarioDePrueba } from '../helpers/fetchMock';

// Matriz #30–#38: reservar, cancelar, check-in por QR y sesión vencida.

jest.mock('@/features/auth', () => {
  const R = require('react');
  const SesionCtx = R.createContext({ token: null, user: null });
  return { __SesionCtx: SesionCtx, useAuth: () => R.useContext(SesionCtx) };
});

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useIsFocused: () => true,
}));

const { __SesionCtx: SesionCtx } = jest.requireMock('@/features/auth');
const { __camera: camara } = jest.requireMock('react-native-vision-camera');

const CLASE: ClaseResponse = {
  id: 'clase-1',
  salonId: 's-1',
  salonNombre: 'Salón Centro',
  tipoActividadId: 't-1',
  tipoActividadNombre: 'Pilates Mat',
  instructorId: 'i-1',
  instructorNombre: 'Instructora Prueba',
  fecha: '2099-01-15',
  horaInicio: '09:00:00',
  horaFin: '10:00:00',
  capacidad: 10,
  lugaresOcupados: 3,
  estado: 'PROGRAMADA',
};

type Ruta = { metodo?: string; sufijo: string; respuesta: () => Response | Promise<Response> };

// fetch por ruta: lo que no esté declarado responde 200 [] (listas vacías).
function enrutar(fetchMock: ReturnType<typeof mockFetch>, rutas: Ruta[]) {
  fetchMock.mockImplementation(async (url, init) => {
    const metodo = init?.method ?? 'GET';
    const ruta = rutas.find(r => String(url).endsWith(r.sufijo) && (r.metodo ?? 'GET') === metodo);
    return ruta ? ruta.respuesta() : respuesta({ status: 200, body: [] });
  });
}

const navigation = { goBack: jest.fn(), navigate: jest.fn(), canGoBack: () => true };

function sesion(token: string | null, children: React.ReactNode) {
  const user = token ? usuarioDePrueba : null;
  return <SesionCtx.Provider value={{ token, user }}>{children}</SesionCtx.Provider>;
}

describe('ClassDetailScreen: reservar', () => {
  let fetchMock: ReturnType<typeof mockFetch>;
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock = mockFetch();
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    fetchMock.mockRestore();
    alertSpy.mockRestore();
  });

  async function montarDetalle(token: string | null) {
    const props = { navigation, route: { key: 'ClassDetail', name: 'ClassDetail', params: { claseId: 'clase-1' } } };
    await render(sesion(token, <ClassDetailScreen {...(props as unknown as React.ComponentProps<typeof ClassDetailScreen>)} />));
    expect(await screen.findByText('Reservar ahora')).toBeOnTheScreen();
  }

  test('#30 invitado → pide iniciar sesión y navega a Auth, sin llamar a reservar', async () => {
    enrutar(fetchMock, [{ sufijo: '/api/publico/clases/clase-1', respuesta: () => respuesta({ status: 200, body: CLASE }) }]);
    await montarDetalle(null);

    await fireEvent.press(screen.getByText('Reservar ahora'));
    expect(
      await screen.findByText('Necesitas iniciar sesión o crear una cuenta para reservar esta clase.'),
    ).toBeOnTheScreen();
    expect(screen.queryByText('¿Confirmar tu reserva?')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByText('Iniciar sesión'));
    expect(navigation.navigate).toHaveBeenCalledWith('Auth', { mode: 'login' });

    expect(llamadasA(fetchMock, '/api/clases/clase-1/reservas', 'POST')).toHaveLength(0);
    // Ninguna llamada salió con "Bearer undefined"/"Bearer null".
    for (const [, init] of fetchMock.mock.calls) {
      const auth = (init?.headers as Record<string, string> | undefined)?.Authorization;
      expect(auth).toBeUndefined();
    }
  });

  test.each([
    // Mensajes reales de ClaseReservaService.java (feellingPilates) y su status
    // según GlobalExceptionHandler.java.
    ['clase llena', 409, 'La clase ya no tiene cupo disponible'],
    ['reserva duplicada', 409, 'Ya tienes una reserva en esta clase'],
    ['clase ya comenzó', 400, 'Esta clase ya comenzó o ya pasó'],
    ['clase cancelada', 400, 'Esta clase ya no está disponible'],
  ])('#31 %s (%i) → Alert con el mensaje real del backend', async (_caso, status, message) => {
    enrutar(fetchMock, [
      { sufijo: '/api/publico/clases/clase-1', respuesta: () => respuesta({ status: 200, body: CLASE }) },
      { metodo: 'POST', sufijo: '/api/clases/clase-1/reservas', respuesta: () => respuesta({ status, body: { message } }) },
    ]);
    await montarDetalle('jwt-de-prueba');

    await fireEvent.press(screen.getByText('Reservar ahora'));
    await fireEvent.press(await screen.findByText('Confirmar reserva'));

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('No se pudo reservar', message));
  });

  test('#38 HALLAZGO: token vencido a mitad de sesión → 401 sin body → Alert genérico y la sesión sigue "abierta"', async () => {
    enrutar(fetchMock, [
      { sufijo: '/api/publico/clases/clase-1', respuesta: () => respuesta({ status: 200, body: CLASE }) },
      // SecurityConfig.java:55 → HttpStatusEntryPoint(401): cuerpo vacío.
      { metodo: 'POST', sufijo: '/api/clases/clase-1/reservas', respuesta: () => respuesta({ status: 401, raw: '' }) },
    ]);
    await montarDetalle('jwt-vencido-de-prueba');

    for (let intento = 1; intento <= 2; intento++) {
      await fireEvent.press(screen.getByText('Reservar ahora'));
      await fireEvent.press(await screen.findByText('Confirmar reserva'));
      await waitFor(() => expect(alertSpy).toHaveBeenCalledTimes(intento));
      await fireEvent.press(screen.getByText('Cancelar'));
    }

    // Mismo Alert genérico en cada intento; nada fuerza logout ni navega a Auth.
    expect(alertSpy).toHaveBeenNthCalledWith(1, 'No se pudo reservar', 'Ocurrió un error inesperado');
    expect(alertSpy).toHaveBeenNthCalledWith(2, 'No se pudo reservar', 'Ocurrió un error inesperado');
    expect(navigation.navigate).not.toHaveBeenCalledWith('Auth', expect.anything());
  });
});

describe('cancelarReserva (API)', () => {
  let fetchMock: ReturnType<typeof mockFetch>;

  beforeEach(() => {
    fetchMock = mockFetch();
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  test('#32 reserva ajena o inexistente → el backend responde 404 "Reserva no encontrada" (no 403) y llega como ApiError', async () => {
    // ClaseReservaService.cancelar filtra por clienteId y lanza ResourceNotFoundException
    // en ambos casos: no revela si la reserva existe pero es de otro usuario.
    fetchMock.mockResolvedValueOnce(respuesta({ status: 404, body: { message: 'Reserva no encontrada' } }));

    const error = await cancelarReserva('jwt-de-prueba', 'r-ajena').catch(e => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(404);
    expect(error.message).toBe('Reserva no encontrada');
    expect(fetchMock.mock.calls[0][1]?.method).toBe('DELETE');
  });
});

describe('InstructorClassCheckInScreen: check-in por QR', () => {
  let fetchMock: ReturnType<typeof mockFetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock = mockFetch();
    camara.device = { id: 'back', position: 'back' };
    camara.hasPermission = true;
    camara.requestPermission = jest.fn(async () => true);
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  async function montarCheckin() {
    const props = {
      navigation,
      route: { key: 'CheckIn', name: 'InstructorClassCheckIn', params: { claseId: 'clase-1' } },
    };
    return render(sesion('jwt-instructor-de-prueba', <InstructorClassCheckInScreen {...(props as unknown as React.ComponentProps<typeof InstructorClassCheckInScreen>)} />));
  }

  async function escanear(valor: string) {
    await act(async () => {
      camara.onCodeScanned([{ value: valor }]);
    });
  }

  const rutasBase = (checkin?: () => Response): Ruta[] => [
    { sufijo: '/api/publico/clases/clase-1', respuesta: () => respuesta({ status: 200, body: CLASE }) },
    {
      metodo: 'POST',
      sufijo: '/api/clases/reservas/r-1/checkin',
      respuesta: checkin ?? (() => respuesta({ status: 200, body: { clienteNombre: 'Ana' } })),
    },
  ];

  test('#33 QR con formato inválido → "Código no reconocido" sin llamar a la red', async () => {
    enrutar(fetchMock, rutasBase());
    await montarCheckin();

    await escanear('https://otra-app.test/qr/123');

    expect(await screen.findByText('Código no reconocido')).toBeOnTheScreen();
    expect(fetchMock.mock.calls.filter(([url]) => String(url).includes('/checkin'))).toHaveLength(0);
  });

  test('#34 QR válido de otra clase → rechazado en cliente sin llamar a la red', async () => {
    enrutar(fetchMock, rutasBase());
    await montarCheckin();

    await escanear('FEELINGPILATES-RESERVA|r-1|otra-clase');

    expect(await screen.findByText('Ese código no es de esta clase')).toBeOnTheScreen();
    expect(fetchMock.mock.calls.filter(([url]) => String(url).includes('/checkin'))).toHaveLength(0);
  });

  test('#34b el cliente manda el claseId del QR en el body (el backend lo revalida contra la reserva)', async () => {
    // Server-side: ClaseReservaService.checkin (feellingPilates) compara
    // reserva.getClase().getId() con el claseId del body → 400 si no coinciden.
    enrutar(fetchMock, rutasBase(() => respuesta({ status: 400, body: { message: 'El código no corresponde a esta clase' } })));
    await montarCheckin();

    await escanear('FEELINGPILATES-RESERVA|r-1|clase-1');

    expect(await screen.findByText('El código no corresponde a esta clase')).toBeOnTheScreen();
    const [, init] = llamadasA(fetchMock, '/api/clases/reservas/r-1/checkin', 'POST')[0];
    expect(JSON.parse(String(init?.body))).toEqual({ claseId: 'clase-1' });
  });

  test('#35 mismo QR dos veces seguidas → una sola llamada de red', async () => {
    enrutar(fetchMock, rutasBase());
    await montarCheckin();

    await escanear('FEELINGPILATES-RESERVA|r-1|clase-1');
    expect(await screen.findByText('Ana · presente')).toBeOnTheScreen();
    await escanear('FEELINGPILATES-RESERVA|r-1|clase-1');

    expect(llamadasA(fetchMock, '/api/clases/reservas/r-1/checkin', 'POST')).toHaveLength(1);
  });

  test('#35b HALLAZGO: si el check-in falla por red, re-escanear el MISMO QR se ignora en silencio', async () => {
    let intentos = 0;
    enrutar(
      fetchMock,
      rutasBase(() => {
        intentos++;
        return intentos === 1
          ? (Promise.reject(new TypeError('Network request failed')) as never)
          : respuesta({ status: 200, body: { clienteNombre: 'Ana' } });
      }),
    );
    await montarCheckin();

    await escanear('FEELINGPILATES-RESERVA|r-1|clase-1');
    expect(await screen.findByText('No se pudo conectar con el servidor')).toBeOnTheScreen();

    // La red ya volvió; el instructor vuelve a apuntar al mismo QR.
    await escanear('FEELINGPILATES-RESERVA|r-1|clase-1');

    expect(intentos).toBe(1);
    expect(screen.queryByText('Ana · presente')).not.toBeOnTheScreen();
  });

  test('#36 obtenerClase falla al montar → sin subtítulo y sin ningún aviso', async () => {
    enrutar(fetchMock, [
      { sufijo: '/api/publico/clases/clase-1', respuesta: () => respuesta({ status: 404, body: { message: 'Clase no encontrada' } }) },
    ]);
    await montarCheckin();

    await waitFor(() => expect(llamadasA(fetchMock, '/api/publico/clases/clase-1')).toHaveLength(1));
    expect(screen.getByText('Pasar lista por QR')).toBeOnTheScreen();
    expect(screen.queryByText(/Pilates Mat/)).not.toBeOnTheScreen();
    expect(screen.queryByText('Clase no encontrada')).not.toBeOnTheScreen();
    // El escáner sigue activo como si todo estuviera bien.
    expect(screen.getByText('Apunta la cámara al código QR de la reserva')).toBeOnTheScreen();
  });

  test('#37a sin cámara en el dispositivo → mensaje explícito', async () => {
    enrutar(fetchMock, rutasBase());
    camara.device = undefined;
    await montarCheckin();

    expect(await screen.findByText('No se encontró una cámara en este dispositivo.')).toBeOnTheScreen();
  });

  test('#37b HALLAZGO: permiso denegado permanentemente → el botón no hace nada visible y no hay salida a Ajustes', async () => {
    enrutar(fetchMock, rutasBase());
    camara.hasPermission = false;
    // Con "no volver a preguntar" el SO responde false sin mostrar diálogo.
    camara.requestPermission = jest.fn(async () => false);
    const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined as never);
    await montarCheckin();

    await fireEvent.press(await screen.findByText('Dar acceso a la cámara'));

    expect(camara.requestPermission).toHaveBeenCalledTimes(2); // useEffect + botón
    expect(screen.getByText('Necesitamos acceso a tu cámara')).toBeOnTheScreen();
    expect(openSettings).not.toHaveBeenCalled();
    openSettings.mockRestore();
  });
});
