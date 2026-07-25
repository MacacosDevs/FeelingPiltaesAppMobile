import { API_BASE_URL } from '../config/env';
import type { ErrorResponse } from './types';

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string> | null;

  constructor(status: number, message: string, fieldErrors: Record<string, string> | null = null) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Con FormData no hay que fijar Content-Type: fetch/RN arma el boundary
  // multipart correcto solo si lo dejamos sin especificar.
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor');
  }

  if (!response.ok) {
    let body: ErrorResponse | null = null;
    try {
      body = await response.json();
    } catch {
      // response had no JSON body
    }
    throw new ApiError(
      response.status,
      body?.message ?? 'Ocurrió un error inesperado',
      body?.fieldErrors ?? null,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}
