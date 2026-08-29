// Superficie pública de la feature "classes" (horario y detalle de clase).
export { ClassesScreen } from './screens/ClassesScreen';
export { ClassDetailScreen } from './screens/ClassDetailScreen';
export { useMisReservas } from './hooks/useMisReservas';
// api/clases.ts es el recurso /api/clases completo del backend: además de lo
// que usa esta feature, expone los endpoints que consume la feature
// "instructor" (asistentes, checkin, clases propias del instructor).
export {
  listarAsistentes,
  listarClasesPublico,
  listarMisClasesInstructor,
  obtenerClase,
  registrarCheckin,
} from './api/clases';
