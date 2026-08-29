import { ApiError } from '@/api/client';

export type AuthErrorMap = {
  correoError: string | null;
  contrasenaError: string | null;
  general: string | null;
};

const SIN_ERRORES: AuthErrorMap = { correoError: null, contrasenaError: null, general: null };

// Centraliza cómo se traduce un error de la API a mensajes de formulario, para
// que Login y Registro muestren el mismo texto ante los mismos casos (sin
// revelar si el correo o la contraseña es la que está mal, por seguridad).
export function mapAuthError(e: unknown, modo: 'login' | 'registro'): AuthErrorMap {
  if (!(e instanceof ApiError)) {
    return { ...SIN_ERRORES, general: 'Ocurrió un error inesperado. Intenta de nuevo.' };
  }

  if (e.status === 0) {
    return { ...SIN_ERRORES, general: 'No se pudo conectar. Revisa tu conexión a internet e intenta de nuevo.' };
  }

  if (e.status === 401) {
    return {
      ...SIN_ERRORES,
      general: 'El correo o la contraseña son incorrectos. Verifica tus datos e intenta de nuevo.',
    };
  }

  if (modo === 'registro' && e.status === 409) {
    return { ...SIN_ERRORES, correoError: 'Ya existe una cuenta con este correo. Intenta iniciar sesión.' };
  }

  if (e.fieldErrors) {
    const correoError = e.fieldErrors.correo ?? null;
    const contrasenaError = e.fieldErrors.contrasena ?? null;
    return {
      correoError,
      contrasenaError,
      general: correoError || contrasenaError ? null : e.message,
    };
  }

  return { ...SIN_ERRORES, general: e.message };
}

// Separado de mapAuthError porque el inicio de sesión con Google no tiene
// contraseña: un 401 aquí es un idToken rechazado por el backend, no una
// credencial incorrecta, así que no debe mostrar ese mensaje.
export function mapGoogleAuthError(e: unknown): string {
  if (!(e instanceof ApiError)) {
    return 'Ocurrió un error inesperado. Intenta de nuevo.';
  }

  if (e.status === 0) {
    return 'No se pudo conectar. Revisa tu conexión a internet e intenta de nuevo.';
  }

  return e.message || 'No se pudo iniciar sesión con Google. Intenta de nuevo.';
}
