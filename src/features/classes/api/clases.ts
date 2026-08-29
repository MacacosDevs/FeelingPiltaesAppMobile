import { apiFetch } from '@/api/client';
import type { ClaseReservaResponse, ClaseResponse } from '@/api/types';

export function listarClasesPublico(
  desde: string,
  hasta: string,
  opts?: { salonId?: string },
): Promise<ClaseResponse[]> {
  const params = new URLSearchParams({ desde, hasta });
  if (opts?.salonId) {
    params.set('salonId', opts.salonId);
  }
  return apiFetch<ClaseResponse[]>(`/api/publico/clases?${params.toString()}`);
}

export function obtenerClase(claseId: string): Promise<ClaseResponse> {
  return apiFetch<ClaseResponse>(`/api/publico/clases/${claseId}`);
}

export function listarMisClasesInstructor(
  token: string,
  desde: string,
  hasta: string,
): Promise<ClaseResponse[]> {
  const params = new URLSearchParams({ desde, hasta });
  return apiFetch<ClaseResponse[]>(`/api/clases/mias-instructor?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function reservarClase(token: string, claseId: string): Promise<ClaseReservaResponse> {
  return apiFetch<ClaseReservaResponse>(`/api/clases/${claseId}/reservas`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function cancelarReserva(token: string, reservaId: string): Promise<void> {
  return apiFetch<void>(`/api/clases/reservas/${reservaId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function listarMisReservas(token: string): Promise<ClaseReservaResponse[]> {
  return apiFetch<ClaseReservaResponse[]>('/api/clases/mis-reservas', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function listarAsistentes(token: string, claseId: string): Promise<ClaseReservaResponse[]> {
  return apiFetch<ClaseReservaResponse[]>(`/api/clases/${claseId}/reservas`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function registrarCheckin(
  token: string,
  reservaId: string,
  claseId: string,
): Promise<ClaseReservaResponse> {
  return apiFetch<ClaseReservaResponse>(`/api/clases/reservas/${reservaId}/checkin`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ claseId }),
  });
}
