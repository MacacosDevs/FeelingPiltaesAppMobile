import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type AttendanceContextValue = {
  // Cuántos escaneos válidos (código de esta clase) se registraron por clase,
  // en esta sesión. Todavía no existe un sistema real de reservas que diga
  // *quién* asistió (ver InstructorClassDetailScreen.tsx y mockAttendees.ts),
  // así que por ahora cada escaneo válido marca como presente a la siguiente
  // persona de la lista de ejemplo, en orden.
  presentCountByClase: Record<string, number>;
  getPresentCount: (claseId: string) => number;
  registrarAsistencia: (claseId: string) => void;
};

const AttendanceContext = createContext<AttendanceContextValue | undefined>(undefined);

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const [presentCountByClase, setPresentCountByClase] = useState<Record<string, number>>({});

  const getPresentCount = useCallback(
    (claseId: string) => presentCountByClase[claseId] ?? 0,
    [presentCountByClase],
  );

  const registrarAsistencia = useCallback((claseId: string) => {
    setPresentCountByClase(prev => ({ ...prev, [claseId]: (prev[claseId] ?? 0) + 1 }));
  }, []);

  const value = useMemo(
    () => ({ presentCountByClase, getPresentCount, registrarAsistencia }),
    [presentCountByClase, getPresentCount, registrarAsistencia],
  );

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>;
}

export function useAttendance(): AttendanceContextValue {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}
