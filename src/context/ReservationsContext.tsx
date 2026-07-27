import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ReservationsContextValue = {
  reservedClaseIds: string[];
  isReserved: (claseId: string) => boolean;
  addReservation: (claseId: string) => void;
};

const ReservationsContext = createContext<ReservationsContextValue | undefined>(undefined);

export function ReservationsProvider({ children }: { children: React.ReactNode }) {
  const [reservedClaseIds, setReservedClaseIds] = useState<string[]>([]);

  const isReserved = useCallback(
    (claseId: string) => reservedClaseIds.includes(claseId),
    [reservedClaseIds],
  );

  const addReservation = useCallback((claseId: string) => {
    setReservedClaseIds(prev => (prev.includes(claseId) ? prev : [claseId, ...prev]));
  }, []);

  const value = useMemo(
    () => ({ reservedClaseIds, isReserved, addReservation }),
    [reservedClaseIds, isReserved, addReservation],
  );

  return <ReservationsContext.Provider value={value}>{children}</ReservationsContext.Provider>;
}

export function useReservations(): ReservationsContextValue {
  const context = useContext(ReservationsContext);
  if (!context) {
    throw new Error('useReservations must be used within a ReservationsProvider');
  }
  return context;
}
