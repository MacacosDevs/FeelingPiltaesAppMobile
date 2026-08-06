import { apiFetch } from './client';
import type { ActualizarPerfilInstructorRequest, PerfilInstructorResponse } from './types';

export function obtenerPerfilInstructor(usuarioId: string): Promise<PerfilInstructorResponse> {
  return apiFetch<PerfilInstructorResponse>(`/api/publico/instructores/${usuarioId}`);
}

export function actualizarMiPerfilInstructor(
  token: string,
  request: ActualizarPerfilInstructorRequest,
): Promise<PerfilInstructorResponse> {
  return apiFetch<PerfilInstructorResponse>('/api/instructores/me/perfil', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(request),
  });
}
