import { addDays, combineDateAndHora, startOfDay } from '../utils/date';

export type Categoria = 'pilates' | 'bacufit';

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
  categoria: Categoria;
};

const today = startOfDay(new Date());

// Coincide con "Máximo 8 personas por clase" del texto de la pantalla de
// inicio (grupos reducidos).
const CAPACIDAD_ESTANDAR = 8;

// Las máquinas Bacu Fit son un cupo limitado, distinto de las clases de
// Pilates en grupo.
const CAPACIDAD_BACU_FIT = 4;

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
    categoria: 'pilates',
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
    categoria: 'pilates',
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
    categoria: 'pilates',
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
    categoria: 'pilates',
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
    categoria: 'pilates',
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
    categoria: 'pilates',
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
    categoria: 'pilates',
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
    categoria: 'pilates',
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
    categoria: 'pilates',
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
    categoria: 'pilates',
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
    categoria: 'pilates',
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
    categoria: 'pilates',
  },
  {
    id: 'hoy-bacufit-830',
    fecha: addDays(today, 0),
    hora: '8:30 am',
    duracion: '30 min',
    nombre: 'Bacu Fit',
    instructora: 'Con Rocío Fernández',
    sala: 'Studio 14',
    precio: '$300',
    capacidad: CAPACIDAD_BACU_FIT,
    lugaresOcupados: 2,
    categoria: 'bacufit',
  },
  {
    id: 'hoy-bacufit-1700',
    fecha: addDays(today, 0),
    hora: '5:00 pm',
    duracion: '30 min',
    nombre: 'Bacu Fit',
    instructora: 'Con Rocío Fernández',
    sala: 'Studio 14',
    precio: '$300',
    capacidad: CAPACIDAD_BACU_FIT,
    lugaresOcupados: 4,
    categoria: 'bacufit',
  },
  {
    id: 'manana-bacufit-900',
    fecha: addDays(today, 1),
    hora: '9:00 am',
    duracion: '30 min',
    nombre: 'Bacu Fit',
    instructora: 'Con Rocío Fernández',
    sala: 'Studio 14',
    precio: '$300',
    capacidad: CAPACIDAD_BACU_FIT,
    lugaresOcupados: 1,
    categoria: 'bacufit',
  },
  {
    id: 'pasado-manana-bacufit-1830',
    fecha: addDays(today, 2),
    hora: '6:30 pm',
    duracion: '30 min',
    nombre: 'Bacu Fit',
    instructora: 'Con Rocío Fernández',
    sala: 'Studio 14',
    precio: '$300',
    capacidad: CAPACIDAD_BACU_FIT,
    lugaresOcupados: 3,
    categoria: 'bacufit',
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
  'Con Rocío Fernández': {
    rating: 4.7,
    clasesImpartidas: 134,
    especialidades: ['Bacu Fit'],
    bio: 'Especialista en Bacu Fit. Rentas de máquina cortas y de alta intensidad, enfocadas en tonificación.',
  },
};

export function stripCon(instructora: string): string {
  return instructora.replace(/^Con\s+/, '');
}

export function isClasePast(clase: Clase, now: Date = new Date()): boolean {
  return combineDateAndHora(clase.fecha, clase.hora) < now;
}
