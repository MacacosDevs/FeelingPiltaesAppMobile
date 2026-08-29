import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PaqueteResponse } from '../api/types';
import { useAuth } from '@/features/auth';

type CarritoContextValue = {
  items: PaqueteResponse[];
  totalCentavos: number;
  tieneItem: (paqueteId: string) => boolean;
  toggleItem: (paquete: PaqueteResponse) => void;
  quitarItem: (paqueteId: string) => void;
  vaciar: () => void;
};

const CarritoContext = createContext<CarritoContextValue | undefined>(undefined);

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [items, setItems] = useState<PaqueteResponse[]>([]);

  // El carrito es personal: si se cierra sesión no debe quedar ahí para el
  // siguiente usuario que use el dispositivo.
  useEffect(() => {
    if (!token) {
      setItems([]);
    }
  }, [token]);

  const toggleItem = useCallback((paquete: PaqueteResponse) => {
    setItems(actual =>
      actual.some(p => p.id === paquete.id)
        ? actual.filter(p => p.id !== paquete.id)
        : [...actual, paquete],
    );
  }, []);

  const quitarItem = useCallback((paqueteId: string) => {
    setItems(actual => actual.filter(p => p.id !== paqueteId));
  }, []);

  const vaciar = useCallback(() => setItems([]), []);

  const tieneItem = useCallback((paqueteId: string) => items.some(p => p.id === paqueteId), [items]);

  const totalCentavos = useMemo(() => items.reduce((suma, p) => suma + p.precioCentavos, 0), [items]);

  const value = useMemo(
    () => ({ items, totalCentavos, tieneItem, toggleItem, quitarItem, vaciar }),
    [items, totalCentavos, tieneItem, toggleItem, quitarItem, vaciar],
  );

  return <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>;
}

export function useCarrito(): CarritoContextValue {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito must be used within a CarritoProvider');
  }
  return context;
}
