import { apiFetch } from './client';
import type { CompraResponse, CrearPagoResponse, PaqueteActivoResponse } from './types';

export function crearIntentoPago(
  token: string,
  paqueteIds: string[],
  idempotencyKey: string,
): Promise<CrearPagoResponse> {
  return apiFetch<CrearPagoResponse>('/api/pagos/paquetes/intento', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ paqueteIds, idempotencyKey }),
  });
}

export function obtenerMisPaquetesActivos(token: string): Promise<PaqueteActivoResponse[]> {
  return apiFetch<PaqueteActivoResponse[]>('/api/pagos/mis-paquetes', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function obtenerMisCompras(token: string): Promise<CompraResponse[]> {
  return apiFetch<CompraResponse[]>('/api/pagos/mis-compras', {
    headers: { Authorization: `Bearer ${token}` },
  });
}
