import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { obtenerMisCompras, obtenerMisPaquetesActivos } from '../api/pagos';
import type { CompraResponse, PaqueteActivoResponse } from '../api/types';
import type { Categoria } from '../data/clases';

// El backend usa 'bacu_fit' (coincide con el enum de Paquete); las pantallas
// usan 'bacufit' (Categoria en data/clases.ts). Este helper evita repetir el
// mapeo en cada pantalla que necesita saber si hay un paquete activo.
export function paqueteActivoDe(
  paquetes: PaqueteActivoResponse[],
  categoria: Categoria,
): PaqueteActivoResponse | undefined {
  const categoriaBackend = categoria === 'bacufit' ? 'bacu_fit' : 'pilates';
  return paquetes.find(p => p.categoria === categoriaBackend);
}

export function useMisPaquetesActivos(): PaqueteActivoResponse[] {
  const { token } = useAuth();
  const [paquetes, setPaquetes] = useState<PaqueteActivoResponse[]>([]);

  useEffect(() => {
    if (!token) {
      setPaquetes([]);
      return;
    }
    let cancelado = false;
    obtenerMisPaquetesActivos(token)
      .then(data => {
        if (!cancelado) setPaquetes(data);
      })
      .catch(() => {
        if (!cancelado) setPaquetes([]);
      });
    return () => {
      cancelado = true;
    };
  }, [token]);

  return paquetes;
}

export function useMisCompras(): CompraResponse[] {
  const { token } = useAuth();
  const [compras, setCompras] = useState<CompraResponse[]>([]);

  useEffect(() => {
    if (!token) {
      setCompras([]);
      return;
    }
    let cancelado = false;
    obtenerMisCompras(token)
      .then(data => {
        if (!cancelado) setCompras(data);
      })
      .catch(() => {
        if (!cancelado) setCompras([]);
      });
    return () => {
      cancelado = true;
    };
  }, [token]);

  return compras;
}
