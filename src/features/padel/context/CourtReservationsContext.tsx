import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type CourtReservation = {
  horarioId: string;
  duracionMin: number;
  modalidad: 'Individual' | 'Dobles';
};

type CourtReservationsContextValue = {
  reservations: CourtReservation[];
  addReservation: (reservation: CourtReservation) => void;
};

const CourtReservationsContext = createContext<CourtReservationsContextValue | undefined>(undefined);

export function CourtReservationsProvider({ children }: { children: React.ReactNode }) {
  const [reservations, setReservations] = useState<CourtReservation[]>([]);

  const addReservation = useCallback((reservation: CourtReservation) => {
    setReservations(prev => [reservation, ...prev]);
  }, []);

  const value = useMemo(() => ({ reservations, addReservation }), [reservations, addReservation]);

  return (
    <CourtReservationsContext.Provider value={value}>{children}</CourtReservationsContext.Provider>
  );
}

export function useCourtReservations(): CourtReservationsContextValue {
  const context = useContext(CourtReservationsContext);
  if (!context) {
    throw new Error('useCourtReservations must be used within a CourtReservationsProvider');
  }
  return context;
}
