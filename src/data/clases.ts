import { addDays, combineDateAndHora, startOfDay } from '../utils/date';

export type Clase = {
  id: string;
  fecha: Date;
  hora: string;
  duracion: string;
  nombre: string;
  instructora: string;
  sala: string;
  precio: string;
  capacidad: number;
  lugaresOcupados: number;
};

const today = startOfDay(new Date());

// Coincide con "Máximo 8 personas por clase" del texto de la pantalla de
// inicio (grupos reducidos).
const CAPACIDAD_ESTANDAR = 8;

// No existe todavía un backend de horario/reservas; este contenido de
// referencia se genera en relación a la fecha actual (para poder probar el
// filtrado, el calendario y la pantalla de detalle) hasta que esa API exista.
export const clases: Clase[] = [
  {
    id: 'hoy-reformer-8',
    fecha: addDays(today, 0),
    hora: '8:00 am',
    duracion: '50 min',
    nombre: 'Reformer',
    instructora: 'Con Vane Torres',
    sala: 'Studio 14',
    precio: '$250',
    capacidad: CAPACIDAD_ESTANDAR,
    lugaresOcupados: 6,
  },
  {
    id: 'hoy-reformer-9',
    fecha: addDays(today, 0),
    hora: '9:00 am',
    duracion: '50 min',
    nombre: 'Reformer',
    instructora: 'Con Vane Torres',
    sala: 'Studio 14',
    precio: '$250',
    capacidad: CAPACIDAD_ESTANDAR,
    lugaresOcupados: 1,
  },
  {
    id: 'hoy-reformer-1130',
    fecha: addDays(today, 0),
    hora: '11:30 am',
    duracion: '50 min',
    nombre: 'Reformer',
    instructora: 'Con Vane Torres',
    sala: 'Studio 14',
    precio: '$250',
    capacidad: CAPACIDAD_ESTANDAR,
    lugaresOcupados: 4,
  },
  {
    id: 'hoy-barre-1015',
    fecha: addDays(today, 0),
    hora: '10:15 am',
    duracion: '50 min',
    nombre: 'Barre Sculpt',
    instructora: 'Con Ale',
    sala: 'Studio 14',
    precio: '$250',
    capacidad: CAPACIDAD_ESTANDAR,
    lugaresOcupados: 5,
  },
  {
    id: 'hoy-mat-1800',
    fecha: addDays(today, 0),
    hora: '6:00 pm',
    duracion: '45 min',
    nombre: 'Mat Pilates',
    instructora: 'Con Dany Casillas',
    sala: 'Studio Roma',
    precio: '$220',
    capacidad: CAPACIDAD_ESTANDAR,
    lugaresOcupados: 2,
  },
  {
    id: 'manana-reformer-8',
    fecha: addDays(today, 1),
    hora: '8:00 am',
    duracion: '50 min',
    nombre: 'Reformer',
    instructora: 'Con Vane Torres',
    sala: 'Studio 14',
    precio: '$250',
    capacidad: CAPACIDAD_ESTANDAR,
    lugaresOcupados: 6,
  },
  {
    id: 'manana-barre-1730',
    fecha: addDays(today, 1),
    hora: '5:30 pm',
    duracion: '50 min',
    nombre: 'Barre Sculpt',
    instructora: 'Con Ale',
    sala: 'Studio Roma',
    precio: '$250',
    capacidad: CAPACIDAD_ESTANDAR,
    lugaresOcupados: 1,
  },
  {
    id: 'pasado-manana-mat-9',
    fecha: addDays(today, 2),
    hora: '9:00 am',
    duracion: '45 min',
    nombre: 'Mat Pilates',
    instructora: 'Con Dany Casillas',
    sala: 'Studio 14',
    precio: '$220',
    capacidad: CAPACIDAD_ESTANDAR,
    lugaresOcupados: 1,
  },
  {
    id: 'pasado-manana-reformer-19',
    fecha: addDays(today, 2),
    hora: '7:00 pm',
    duracion: '50 min',
    nombre: 'Reformer',
    instructora: 'Con Vane Torres',
    sala: 'Studio Roma',
    precio: '$250',
    capacidad: CAPACIDAD_ESTANDAR,
    lugaresOcupados: 4,
  },
  {
    id: 'ayer-reformer-10',
    fecha: addDays(today, -1),
    hora: '10:00 am',
    duracion: '50 min',
    nombre: 'Reformer',
    instructora: 'Con Vane Torres',
    sala: 'Studio 14',
    precio: '$250',
    capacidad: CAPACIDAD_ESTANDAR,
    lugaresOcupados: 3,
  },
  {
    id: 'en4dias-barre-9',
    fecha: addDays(today, 4),
    hora: '9:00 am',
    duracion: '50 min',
    nombre: 'Barre Sculpt',
    instructora: 'Con Ale',
    sala: 'Studio 14',
    precio: '$250',
    capacidad: CAPACIDAD_ESTANDAR,
    lugaresOcupados: 2,
  },
  {
    id: 'en4dias-reformer-18',
    fecha: addDays(today, 4),
    hora: '6:00 pm',
    duracion: '50 min',
    nombre: 'Reformer',
    instructora: 'Con Vane Torres',
    sala: 'Studio Roma',
    precio: '$250',
    capacidad: CAPACIDAD_ESTANDAR,
    lugaresOcupados: 7,
  },
];

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

export type InstructorMeta = {
  rating: number;
  clasesImpartidas: number;
  especialidades: string[];
  bio: string;
};

export const INSTRUCTOR_META: Record<string, InstructorMeta> = {
  'Con Vane Torres': {
    rating: 4.9,
    clasesImpartidas: 312,
    especialidades: ['Reformer'],
    bio: 'Especialista en Reformer. Cree en el movimiento consciente como forma de fuerza y calma.',
  },
  'Con Ale': {
    rating: 4.8,
    clasesImpartidas: 246,
    especialidades: ['Barre Sculpt'],
    bio: 'Especialista en Barre Sculpt. Le apasiona ayudarte a tonificar con técnica y buena energía.',
  },
  'Con Dany Casillas': {
    rating: 4.9,
    clasesImpartidas: 198,
    especialidades: ['Mat Pilates'],
    bio: 'Especialista en Mat Pilates. Enfocada en un método consciente, de bajo impacto y gran efectividad.',
  },
};

export function stripCon(instructora: string): string {
  return instructora.replace(/^Con\s+/, '');
}

export function isClasePast(clase: Clase, now: Date = new Date()): boolean {
  return combineDateAndHora(clase.fecha, clase.hora) < now;
}
