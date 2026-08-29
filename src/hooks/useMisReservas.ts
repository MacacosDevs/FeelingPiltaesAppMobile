import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth';
import { listarMisReservas } from '../api/clases';
import type { ClaseReservaResponse } from '../api/types';

// Igual que useMisPaquetesActivos, pero además expone `recargar`: a
// diferencia de los paquetes, aquí sí hace falta refrescar tras una acción
// del usuario (reservar/cancelar una clase) sin esperar a que cambie el token.
export function useMisReservas(): { reservas: ClaseReservaResponse[]; recargar: () => void } {
  const { token } = useAuth();
  const [reservas, setReservas] = useState<ClaseReservaResponse[]>([]);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!token) {
      setReservas([]);
      return;
    }
    let cancelado = false;
    listarMisReservas(token)
      .then(data => {
        if (!cancelado) setReservas(data);
      })
      .catch(() => {
        if (!cancelado) setReservas([]);
      });
    return () => {
      cancelado = true;
    };
  }, [token, version]);

  const recargar = useCallback(() => setVersion(v => v + 1), []);

  return { reservas, recargar };
}
