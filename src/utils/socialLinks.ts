export type RedSocial = 'instagram' | 'facebook' | 'tiktok' | 'whatsapp';

// Base fija de cada red: la instructora solo escribe su usuario (o número, en
// WhatsApp) y acá se arma la URL completa que ya consume SocialLinksRow.tsx.
export const SOCIAL_BASE_URL: Record<RedSocial, string> = {
  instagram: 'https://www.instagram.com/',
  facebook: 'https://www.facebook.com/',
  tiktok: 'https://www.tiktok.com/@',
  whatsapp: 'https://wa.me/',
};

// Lo que se muestra como prefijo fijo, no editable, junto al campo.
export const SOCIAL_PREFIX_LABEL: Record<RedSocial, string> = {
  instagram: 'instagram.com/',
  facebook: 'facebook.com/',
  tiktok: 'tiktok.com/@',
  whatsapp: 'wa.me/',
};

// De una URL guardada (o legado de cuando se pedía la URL completa) extrae
// solo el usuario para precargar el campo.
export function extraerUsuario(red: RedSocial, url: string | null | undefined): string {
  if (!url) return '';
  const base = SOCIAL_BASE_URL[red];
  const valor = url.startsWith(base) ? url.slice(base.length) : url;
  return valor.replace(/\/+$/, '');
}

// Del usuario que escribió la instructora arma la URL completa a guardar.
export function armarUrl(red: RedSocial, usuario: string): string | null {
  const limpio = usuario.trim().replace(/^[@/]+/, '').replace(/\/+$/, '');
  return limpio ? SOCIAL_BASE_URL[red] + limpio : null;
}
