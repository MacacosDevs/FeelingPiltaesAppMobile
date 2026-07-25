import { addDays, combineDateAndHora, startOfDay } from '../utils/date';

export type Cancha = {
  id: string;
  nombre: string;
  ubicacion: string;
  precioHora: number;
};

export type DuracionOpcion = {
  minutos: number;
  label: string;
};

export type Horario = {
  id: string;
  canchaId: string;
  fecha: Date;
  hora: string;
  disponibilidadLabel: string;
  ultimaHoraLibre?: boolean;
};

export const DURACIONES: DuracionOpcion[] = [
  { minutos: 60, label: '60 min' },
  { minutos: 90, label: '90 min' },
  { minutos: 120, label: '120 min' },
];

export const canchas: Cancha[] = [
  { id: 'cancha-3-panoramica', nombre: 'Cancha 3 - Panorámica', ubicacion: 'Studio 14', precioHora: 450 },
  { id: 'cancha-1-cristal', nombre: 'Cancha 1 - Cristal', ubicacion: 'Studio 14', precioHora: 450 },
  { id: 'cancha-2-techada', nombre: 'Cancha 2 - Techada', ubicacion: 'Studio Roma', precioHora: 500 },
];

const today = startOfDay(new Date());

// No existe todavía un backend de canchas/reservas de padel (solo existe un
// catálogo genérico de ubicaciones pensado para reutilizarse más adelante);
// este contenido de referencia sigue el mismo patrón que `clases.ts` hasta
// que esa API exista.
export const horarios: Horario[] = [
  {
    id: 'hoy-cancha3-1900',
    canchaId: 'cancha-3-panoramica',
    fecha: addDays(today, 0),
    hora: '7:00 pm',
    disponibilidadLabel: '90 min disponibles',
  },
  {
    id: 'hoy-cancha1-2030',
    canchaId: 'cancha-1-cristal',
    fecha: addDays(today, 0),
    hora: '8:30 pm',
    disponibilidadLabel: '60 min disponibles',
    ultimaHoraLibre: true,
  },
  {
    id: 'hoy-cancha2-1800',
    canchaId: 'cancha-2-techada',
    fecha: addDays(today, 0),
    hora: '6:00 pm',
    disponibilidadLabel: '120 min disponibles',
  },
  {
    id: 'manana-cancha3-800',
    canchaId: 'cancha-3-panoramica',
    fecha: addDays(today, 1),
    hora: '8:00 am',
    disponibilidadLabel: '90 min disponibles',
  },
  {
    id: 'manana-cancha2-1700',
    canchaId: 'cancha-2-techada',
    fecha: addDays(today, 1),
    hora: '5:00 pm',
    disponibilidadLabel: '120 min disponibles',
  },
  {
    id: 'pasado-manana-cancha1-900',
    canchaId: 'cancha-1-cristal',
    fecha: addDays(today, 2),
    hora: '9:00 am',
    disponibilidadLabel: '60 min disponibles',
  },
  {
    id: 'pasado-manana-cancha3-1900',
    canchaId: 'cancha-3-panoramica',
    fecha: addDays(today, 2),
    hora: '7:00 pm',
    disponibilidadLabel: '90 min disponibles',
    ultimaHoraLibre: true,
  },
  {
    id: 'ayer-cancha2-1000',
    canchaId: 'cancha-2-techada',
    fecha: addDays(today, -1),
    hora: '10:00 am',
    disponibilidadLabel: '120 min disponibles',
  },
  {
    id: 'en4dias-cancha1-1800',
    canchaId: 'cancha-1-cristal',
    fecha: addDays(today, 4),
    hora: '6:00 pm',
    disponibilidadLabel: '60 min disponibles',
  },
  {
    id: 'en4dias-cancha3-2000',
    canchaId: 'cancha-3-panoramica',
    fecha: addDays(today, 4),
    hora: '8:00 pm',
    disponibilidadLabel: '90 min disponibles',
  },
];

export function canchaById(canchaId: string): Cancha | undefined {
  return canchas.find(cancha => cancha.id === canchaId);
}

export function horarioById(horarioId: string): Horario | undefined {
  return horarios.find(horario => horario.id === horarioId);
}

export function isHorarioPast(horario: Horario, now: Date = new Date()): boolean {
  return combineDateAndHora(horario.fecha, horario.hora) < now;
}

// Las direcciones de las demás sedes todavía no están confirmadas; solo se
// muestra la de Studio 14 hasta tener el dato real (mismo criterio que
// `SALON_ADDRESSES` en `clases.ts`).
export const CANCHA_ADDRESSES: Record<string, string> = {
  'Studio 14': 'Plaza Cristal',
};

const CIUDAD_GEOCODIFICACION = 'Querétaro, México';

export function canchaGeocodeQuery(ubicacion: string): string | undefined {
  const address = CANCHA_ADDRESSES[ubicacion];
  return address ? `${address}, ${CIUDAD_GEOCODIFICACION}` : undefined;
}
