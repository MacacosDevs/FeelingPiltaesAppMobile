import type { ApiError } from '@/api/client';

// Respuestas falsas para global.fetch. Cubren los caminos que distingue
// src/api/client.ts: ok con JSON, no-ok con JSON, no-ok sin JSON, 204 y
// rechazo de la promesa (sin conexión).

type Respuesta = {
  status: number;
  body?: unknown;
  // Texto crudo que no es JSON (HTML de un proxy caído, cuerpo vacío...).
  raw?: string;
};

export function respuesta({ status, body, raw }: Respuesta): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      if (raw !== undefined) {
        return JSON.parse(raw);
      }
      if (body === undefined) {
        throw new SyntaxError('Unexpected end of JSON input');
      }
      return body;
    },
  } as unknown as Response;
}

export function mockFetch() {
  return jest.spyOn(globalThis, 'fetch' as never) as unknown as jest.Mock<
    Promise<Response>,
    [string, RequestInit?]
  >;
}

// Busca la llamada a fetch cuyo path termina en `sufijo` (y método, si se da).
export function llamadasA(fetchMock: jest.Mock, sufijo: string, metodo?: string) {
  return fetchMock.mock.calls.filter(([url, init]) => {
    const coincideMetodo = !metodo || (init?.method ?? 'GET') === metodo;
    return String(url).endsWith(sufijo) && coincideMetodo;
  });
}

// Devuelve el error con el que se rechazó la promesa; falla si se resolvió.
export function rechazoDe(promesa: Promise<unknown>): Promise<ApiError> {
  return promesa.then(
    () => {
      throw new Error('Se esperaba que la promesa se rechazara');
    },
    (error: unknown) => error as ApiError,
  );
}

export const usuarioDePrueba = {
  id: 'u-1',
  correo: 'cliente@prueba.test',
  nombre: 'Cliente Prueba',
  telefono: null,
  fotoUrl: null,
  descripcion: null,
  proveedorAuth: 'LOCAL',
  estatus: 'ACTIVO',
  roles: ['CLIENTE'],
  rolesAsignados: [],
  creadoEn: '2026-01-01T00:00:00Z',
};
