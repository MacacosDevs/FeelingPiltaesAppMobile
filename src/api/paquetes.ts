import { apiFetch } from './client';
import type { PaqueteResponse } from './types';

export function listarPaquetes(): Promise<PaqueteResponse[]> {
  return apiFetch<PaqueteResponse[]>('/api/publico/paquetes');
}
