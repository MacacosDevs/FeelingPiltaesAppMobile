import { apiFetch } from './client';
import type { TokenResponse } from './types';

export function login(correo: string, contrasena: string): Promise<TokenResponse> {
  return apiFetch<TokenResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ correo, contrasena }),
  });
}

export function registrar(correo: string, contrasena: string, nombre: string): Promise<TokenResponse> {
  return apiFetch<TokenResponse>('/api/auth/registro', {
    method: 'POST',
    body: JSON.stringify({ correo, contrasena, nombre }),
  });
}

export function loginConGoogle(idToken: string): Promise<TokenResponse> {
  return apiFetch<TokenResponse>('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
}
