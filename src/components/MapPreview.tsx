import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Camera, Map, Marker } from '@maplibre/maplibre-react-native';
import { colors, fontFamily, fontSize, radius } from '../theme';

const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

type MapPreviewProps = {
  query: string;
  height?: number;
};

type Coordinates = { lat: number; lon: number };

type Status = 'loading' | 'ready' | 'error';

// Geocodifica con Nominatim (OpenStreetMap) — servicio público gratuito sin
// API key. Respeta su política de uso: máximo ~1 solicitud por segundo (aquí
// se hace una sola vez por pantalla) e identifica la app en el User-Agent.
// El mapa en sí usa teselas vectoriales de OpenFreeMap (gratuitas, sin
// límites de uso ni API key) renderizadas con MapLibre — mapa real e
// interactivo, no una imagen. Si falla la geocodificación, se cae a un
// enlace directo a Google Maps en vez de romper la pantalla.
export function MapPreview({ query, height = 160 }: MapPreviewProps) {
  const [status, setStatus] = useState<Status>('loading');
  const [coords, setCoords] = useState<Coordinates | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setCoords(null);

    async function geocode() {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
        const response = await fetch(url, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'FeelingPilatesApp/1.0',
          },
        });
        const results = await response.json();
        if (cancelled) return;
        const first = results?.[0];
        if (!first) {
          setStatus('error');
          return;
        }
        setCoords({ lat: parseFloat(first.lat), lon: parseFloat(first.lon) });
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    geocode();
    return () => {
      cancelled = true;
    };
  }, [query]);

  function openInMaps() {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);
  }

  if (status === 'loading') {
    return (
      <View style={[styles.fallback, { height }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (status === 'error' || !coords) {
    return (
      <Pressable style={[styles.fallback, { height }]} onPress={openInMaps}>
        <Text style={styles.fallbackText}>Ver ubicación en el mapa →</Text>
      </Pressable>
    );
  }

  const center: [number, number] = [coords.lon, coords.lat];

  return (
    <View style={[styles.mapWrap, { height }]}>
      <Map style={styles.map} mapStyle={OPENFREEMAP_STYLE}>
        <Camera zoom={15} center={center} />
        <Marker lngLat={center}>
          <View style={styles.pin} />
        </Marker>
      </Map>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    borderRadius: radius.input,
    backgroundColor: colors.chipBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.accent,
  },
  mapWrap: {
    borderRadius: radius.input,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  pin: {
    width: 18,
    height: 18,
    borderRadius: radius.pill,
    borderWidth: 3,
    borderColor: colors.background,
    backgroundColor: colors.gold,
  },
});
