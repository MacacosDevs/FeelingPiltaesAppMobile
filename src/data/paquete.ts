import type { Categoria } from './clases';

export type Paquete = {
  nombre: string;
  restantes: number;
  expiraEl: string;
  progreso: number;
};

// No existe todavía un backend de paquetes/membresías; estos son los
// paquetes activos de referencia (mismo criterio que clases.ts/canchas.ts),
// uno por categoría (clases de Pilates vs renta de máquinas Bacu Fit), compartidos
// entre AccountScreen, ClassesScreen y ClassDetailScreen. Cambiar una entrada
// a `null` simula que el alumno no tiene paquete activo de esa categoría
// (vuelve a mostrarse el precio por clase/sesión).
export const paquetesActivos: Record<Categoria, Paquete | null> = {
  pilates: {
    nombre: '8 clases · Roma',
    restantes: 6,
    expiraEl: '19 de marzo',
    progreso: 0.75,
  },
  bacufit: {
    nombre: '8 rentas · Bacu Fit',
    restantes: 5,
    expiraEl: '2 de abril',
    progreso: 0.6,
  },
};
