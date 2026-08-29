import type { ClaseResponse } from '../api/types';

export type Categoria = 'pilates' | 'bacufit';

// La dirección de Studio Roma todavía no está confirmada; solo se muestra la
// de Studio 14 hasta tener el dato real de las demás sedes.
export const SALON_ADDRESSES: Record<string, string> = {
  'Studio 14': 'Plaza Cristal',
};

// Contexto de ciudad usado solo para geocodificar (no se muestra en
// pantalla); inferido de la ubicación del dispositivo de prueba. Confirmar
// si la sede real está en otra ciudad.
const CIUDAD_GEOCODIFICACION = 'Querétaro, México';

export function salonGeocodeQuery(sala: string): string | undefined {
  const address = SALON_ADDRESSES[sala];
  return address ? `${address}, ${CIUDAD_GEOCODIFICACION}` : undefined;
}

export type InstructorRedesSociales = {
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  whatsappUrl?: string;
};

export type InstructorMeta = {
  // Id del usuario real en el backend (ver migración V18__instructores_semilla.sql).
  // Con esto InstructorProfileScreen trae bio/calificación/redes sociales reales;
  // lo demás (especialidades, horario) sigue viniendo de este mock hasta que
  // exista un módulo de clases en el backend.
  usuarioId: string;
  rating: number;
  clasesImpartidas: number;
  especialidades: string[];
  bio: string;
  redesSociales?: InstructorRedesSociales;
};

export const INSTRUCTOR_META: Record<string, InstructorMeta> = {
  'Con Vane Torres': {
    usuarioId: '00000000-0000-4000-8000-000000000001',
    rating: 4.9,
    clasesImpartidas: 312,
    especialidades: ['Reformer'],
    bio: 'Especialista en Reformer. Cree en el movimiento consciente como forma de fuerza y calma.',
    redesSociales: {
      instagramUrl: 'https://www.instagram.com/',
    },
  },
  'Con Ale': {
    usuarioId: '00000000-0000-4000-8000-000000000002',
    rating: 4.8,
    clasesImpartidas: 246,
    especialidades: ['Barre Sculpt'],
    bio: 'Especialista en Barre Sculpt. Le apasiona ayudarte a tonificar con técnica y buena energía.',
  },
  'Con Dany Casillas': {
    usuarioId: '00000000-0000-4000-8000-000000000003',
    rating: 4.9,
    clasesImpartidas: 198,
    especialidades: ['Mat Pilates'],
    bio: 'Especialista en Mat Pilates. Enfocada en un método consciente, de bajo impacto y gran efectividad.',
  },
  'Con Rocío Fernández': {
    usuarioId: '00000000-0000-4000-8000-000000000004',
    rating: 4.7,
    clasesImpartidas: 134,
    especialidades: ['Bacu Fit'],
    bio: 'Especialista en Bacu Fit. Rentas de máquina cortas y de alta intensidad, enfocadas en tonificación.',
  },
};

export function stripCon(instructora: string): string {
  return instructora.replace(/^Con\s+/, '');
}

export function isClasePast(clase: ClaseResponse, now: Date = new Date()): boolean {
  return new Date(`${clase.fecha}T${clase.horaInicio}`) < now;
}
