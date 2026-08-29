export type LoginRequest = {
  correo: string;
  contrasena: string;
};

export type RegistroRequest = {
  correo: string;
  contrasena: string;
  nombre: string;
};

export type TokenResponse = {
  token: string;
  tipo: string;
};

export type ErrorResponse = {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors: Record<string, string> | null;
};

export type UsuarioResponse = {
  id: string;
  correo: string;
  nombre: string;
  telefono: string | null;
  fotoUrl: string | null;
  descripcion: string | null;
  proveedorAuth: string;
  estatus: string;
  roles: string[];
  rolesAsignados: unknown[];
  creadoEn: string;
};

export type ActualizarPerfilRequest = {
  nombre: string;
  telefono: string | null;
  fotoUrl: string | null;
  descripcion: string | null;
};

export type PaqueteResponse = {
  id: string;
  categoria: 'pilates' | 'bacu_fit' | 'combo';
  nombre: string;
  descripcion: string | null;
  precioCentavos: number;
  vigenciaDias: number;
  unitarioTexto: string | null;
  destacado: boolean;
};

export type PaqueteActivoResponse = {
  categoria: 'pilates' | 'bacu_fit';
  nombre: string;
  fechaInicio: string;
  fechaExpiracion: string;
};

export type CompraResponse = {
  id: string;
  paqueteNombre: string;
  categoria: 'pilates' | 'bacu_fit' | 'combo';
  montoCentavos: number;
  estado: 'pendiente' | 'pagada' | 'fallida' | 'cancelada';
  creadoEn: string;
  fechaExpiracion: string | null;
};

export type CrearPagoResponse = {
  compraIds: string[];
  clientSecret: string;
  publishableKey: string;
};

export type PerfilInstructorResponse = {
  usuarioId: string;
  nombre: string;
  fotoUrl: string | null;
  sobreSuClase: string | null;
  calificacionPromedio: number | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  whatsappUrl: string | null;
};

export type ActualizarPerfilInstructorRequest = {
  sobreSuClase: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  whatsappUrl: string | null;
};

export type ClaseResponse = {
  id: string;
  salonId: string;
  salonNombre: string;
  tipoActividadId: string;
  tipoActividadNombre: string;
  instructorId: string;
  instructorNombre: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  capacidad: number;
  lugaresOcupados: number;
  estado: 'PROGRAMADA' | 'CANCELADA';
};

export type ClaseReservaResponse = {
  id: string;
  clienteId: string;
  clienteNombre: string;
  clienteCorreo: string;
  estado: 'CONFIRMADA' | 'CANCELADA' | 'ASISTIO';
  asistioEn: string | null;
  creadoEn: string;
  clase: ClaseResponse;
};
