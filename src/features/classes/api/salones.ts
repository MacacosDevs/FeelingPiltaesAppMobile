import { apiFetch } from '@/api/client';
import type { SalonResponse } from '@/api/types';

// No está bajo /api/publico: el backend exige sesión para listar salones.
export function listarSalones(token: string): Promise<SalonResponse[]> {
  return apiFetch<SalonResponse[]>('/api/salones', {
    headers: { Authorization: `Bearer ${token}` },
  });
}
