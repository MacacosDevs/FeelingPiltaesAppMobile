import { apiFetch } from '@/api/client';
import type { ActualizarPerfilRequest, UsuarioResponse } from '@/api/types';

export type ImageAsset = {
  uri: string;
  type?: string;
  fileName?: string;
};

export function obtenerPerfil(token: string): Promise<UsuarioResponse> {
  return apiFetch<UsuarioResponse>('/api/usuarios/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function actualizarPerfil(
  token: string,
  request: ActualizarPerfilRequest,
): Promise<UsuarioResponse> {
  return apiFetch<UsuarioResponse>('/api/usuarios/me', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(request),
  });
}

export function eliminarCuenta(token: string): Promise<void> {
  return apiFetch<void>('/api/usuarios/me', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function subirFoto(token: string, asset: ImageAsset): Promise<UsuarioResponse> {
  const formData = new FormData();
  // React Native's FormData acepta este shape especial {uri, type, name} para archivos.
  formData.append('archivo', {
    uri: asset.uri,
    type: asset.type ?? 'image/jpeg',
    name: asset.fileName ?? 'foto.jpg',
  } as unknown as Blob);

  return apiFetch<UsuarioResponse>('/api/usuarios/me/foto', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
}
