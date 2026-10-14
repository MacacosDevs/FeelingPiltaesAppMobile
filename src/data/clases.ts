import type { ClaseResponse } from '../api/types';

export type Categoria = 'pilates' | 'bacufit';

export type InstructorRedesSociales = {
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  whatsappUrl?: string;
};

export function isClasePast(clase: ClaseResponse, now: Date = new Date()): boolean {
  return new Date(`${clase.fecha}T${clase.horaInicio}`) < now;
}
