import { API_BASE_URL } from '../config/env';

export function resolveMediaUrl(
  path: string | null | undefined,
  cacheBuster?: number,
): string | null {
  if (!path) {
    return null;
  }
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  return cacheBuster ? `${url}?v=${cacheBuster}` : url;
}
