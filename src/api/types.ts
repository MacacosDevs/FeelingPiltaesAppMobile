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
