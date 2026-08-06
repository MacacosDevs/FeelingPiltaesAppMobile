const NOMBRES = [
  'Sofía', 'Valentina', 'Camila', 'Regina', 'Ximena', 'Mariana', 'Fernanda',
  'Paulina', 'Renata', 'Andrea', 'Daniela', 'Gabriela', 'Alejandra', 'Isabella', 'Natalia',
];

const APELLIDOS = [
  'Hernández', 'García', 'Martínez', 'López', 'González', 'Pérez', 'Sánchez',
  'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Reyes', 'Morales',
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// Nombres de ejemplo para simular la lista de inscritos a una clase: todavía
// no existe un sistema real de reservas que diga quién se apuntó (ver nota en
// InstructorClassDetailScreen.tsx). Determinístico por id de clase, para que
// la lista de una misma clase no cambie entre pantallas o recargas.
export function mockAttendeesFor(claseId: string, count: number): string[] {
  const seed = hashString(claseId);
  const attendees: string[] = [];
  for (let i = 0; i < count; i++) {
    const nombre = NOMBRES[(seed + i * 7) % NOMBRES.length];
    const apellido = APELLIDOS[(seed + i * 13) % APELLIDOS.length];
    attendees.push(`${nombre} ${apellido}`);
  }
  return attendees;
}
