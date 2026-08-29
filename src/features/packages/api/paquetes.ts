import { apiFetch } from '@/api/client';
import type { PaqueteResponse } from '@/api/types';

export function listarPaquetes(): Promise<PaqueteResponse[]> {
  return apiFetch<PaqueteResponse[]>('/api/publico/paquetes');
}
