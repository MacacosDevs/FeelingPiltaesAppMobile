const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarCorreo(correo: string): string | null {
  if (!correo.trim()) {
    return 'Ingresa tu correo electrónico';
  }
  if (!CORREO_REGEX.test(correo.trim())) {
    return 'Ingresa un correo electrónico válido';
  }
  return null;
}

// El backend exige mínimo 8 caracteres para registro (RegistroRequest);
// el login solo exige que no esté vacía, ya que la valida el servidor.
export function validarContrasena(contrasena: string, minLength = 1): string | null {
  if (!contrasena) {
    return 'Ingresa tu contraseña';
  }
  if (contrasena.length < minLength) {
    return `La contraseña debe tener al menos ${minLength} caracteres`;
  }
  return null;
}
