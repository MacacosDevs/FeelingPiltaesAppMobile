import { Linking, Platform } from 'react-native';

// En Android, el esquema `geo:` hace que el sistema operativo muestre su
// propio selector nativo con las apps de mapas instaladas (Google Maps,
// Waze, etc.) — no hace falta un modal propio. iOS no tiene un selector
// equivalente para `geo:`, así que ahí se abre directo el enlace universal
// de Google Maps (abre la app si está instalada, si no el navegador).
export function openDirections(query: string) {
  const encoded = encodeURIComponent(query);
  const url =
    Platform.OS === 'android'
      ? `geo:0,0?q=${encoded}`
      : `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  Linking.openURL(url);
}
