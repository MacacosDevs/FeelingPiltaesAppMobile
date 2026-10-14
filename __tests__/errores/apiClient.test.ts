import { ApiError, apiFetch } from '@/api/client';
import { mockFetch, rechazoDe, respuesta } from '../helpers/fetchMock';

// Matriz #1–#7: src/api/client.ts
describe('apiFetch / ApiError', () => {
  let fetchMock: ReturnType<typeof mockFetch>;

  beforeEach(() => {
    fetchMock = mockFetch();
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  test('#1 fetch rechaza (sin conexión) → ApiError(0) sin filtrar el error original', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));

    const error = await rechazoDe(apiFetch('/api/x'));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(0);
    expect(error.message).toBe('No se pudo conectar con el servidor');
  });

  test('#2 no-ok con body JSON → usa message y fieldErrors del body', async () => {
    fetchMock.mockResolvedValueOnce(
      respuesta({
        status: 400,
        body: { message: 'Error de validación', fieldErrors: { correo: 'Correo inválido' } },
      }),
    );

    const error = await rechazoDe(apiFetch('/api/x'));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.message).toBe('Error de validación');
    expect(error.fieldErrors).toEqual({ correo: 'Correo inválido' });
  });

  test.each([
    ['HTML de un gateway caído', '<html><body>502 Bad Gateway</body></html>'],
    ['cuerpo vacío', ''],
  ])('#3 no-ok sin JSON parseable (%s) → mensaje genérico', async (_caso, raw) => {
    fetchMock.mockResolvedValueOnce(respuesta({ status: 502, raw }));

    const error = await rechazoDe(apiFetch('/api/x'));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(502);
    expect(error.message).toBe('Ocurrió un error inesperado');
    expect(error.fieldErrors).toBeNull();
  });

  test('#4 ok (200) con body no-JSON → rechaza con SyntaxError crudo, no ApiError', async () => {
    fetchMock.mockResolvedValueOnce(respuesta({ status: 200, raw: '<html>portal cautivo</html>' }));

    const error = await rechazoDe(apiFetch('/api/x'));

    expect(error).toBeInstanceOf(SyntaxError);
    expect(error).not.toBeInstanceOf(ApiError);
  });

  test('#5 204 → resuelve undefined sin tocar el body', async () => {
    const json = jest.fn();
    fetchMock.mockResolvedValueOnce({ ok: true, status: 204, json } as unknown as Response);

    await expect(apiFetch('/api/x', { method: 'DELETE' })).resolves.toBeUndefined();
    expect(json).not.toHaveBeenCalled();
  });

  test('#6 FormData → no fija Content-Type y conserva Authorization', async () => {
    fetchMock.mockResolvedValueOnce(respuesta({ status: 200, body: {} }));
    const formData = new FormData();
    formData.append('archivo', 'x');

    await apiFetch('/api/usuarios/me/foto', {
      method: 'POST',
      headers: { Authorization: 'Bearer token-de-prueba' },
      body: formData,
    });

    const headers = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers).toEqual({ Authorization: 'Bearer token-de-prueba' });
    expect(headers['Content-Type']).toBeUndefined();
  });

  test('#6b JSON normal → Content-Type application/json, y los headers del caller se preservan', async () => {
    fetchMock.mockResolvedValueOnce(respuesta({ status: 200, body: {} }));

    await apiFetch('/api/x', { headers: { Authorization: 'Bearer token-de-prueba' } });

    expect(fetchMock.mock.calls[0][1]?.headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer token-de-prueba',
    });
  });

  test('#7 el patrón `err instanceof ApiError ? err.message : genérico` pierde el detalle de errores no-ApiError', async () => {
    fetchMock.mockResolvedValueOnce(respuesta({ status: 200, raw: 'no-json' }));
    const err = await rechazoDe(apiFetch('/api/x'));

    // Réplica exacta del patrón de CarritoScreen.tsx:66 / ClassDetailScreen.tsx:150.
    const mensajeVisible = err instanceof ApiError ? err.message : 'Ocurrió un error inesperado';

    expect(mensajeVisible).toBe('Ocurrió un error inesperado');
  });

  test('#7b feellingPilates-pagos responde {error} (no {message}) → el usuario ve el genérico', async () => {
    // Forma real del cuerpo de error de feellingPilates-pagos
    // (src/middleware/errores.ts:28 y src/middleware/auth.ts:42).
    fetchMock.mockResolvedValueOnce(
      respuesta({ status: 502, body: { error: 'Tu tarjeta fue rechazada', origen: 'stripe_decline' } }),
    );

    const error = await rechazoDe(apiFetch('/api/pagos/paquetes/intento', { method: 'POST' }));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(502);
    expect(error.message).toBe('Ocurrió un error inesperado');
  });

  test('#7c feellingPilates con JWT vencido responde 401 SIN body → mensaje genérico', async () => {
    // SecurityConfig.java:55 usa HttpStatusEntryPoint(UNAUTHORIZED): 401 con cuerpo vacío.
    fetchMock.mockResolvedValueOnce(respuesta({ status: 401, raw: '' }));

    const error = await rechazoDe(apiFetch('/api/clases/c-1/reservas', { method: 'POST' }));

    expect(error.status).toBe(401);
    expect(error.message).toBe('Ocurrió un error inesperado');
  });
});
