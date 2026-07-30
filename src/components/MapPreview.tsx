import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, fontFamily, fontSize, radius, shadows } from '../theme';

type MapPreviewProps = {
  query: string;
  height?: number;
};

type Coordinates = { lat: number; lon: number };

type Status = 'loading' | 'ready' | 'error';

// Geocodifica con Nominatim (OpenStreetMap) — servicio público gratuito sin
// API key. Respeta su política de uso: máximo ~1 solicitud por segundo (aquí
// se hace una sola vez por pantalla) e identifica la app en el User-Agent.
// El mapa en sí usa Google Maps (Maps SDK for Android, ver
// src/config/googleMaps.ts) — mapa real e interactivo, no una imagen. Si
// falla la geocodificación, se cae a un enlace directo a Google Maps en vez
// de romper la pantalla.
export function MapPreview({ query, height = 220 }: MapPreviewProps) {
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

  return (
    <View style={[styles.mapWrap, { height }]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: coords.lat,
          longitude: coords.lon,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}>
        <Marker coordinate={{ latitude: coords.lat, longitude: coords.lon }}>
          <View style={styles.pin}>
            {/* Marca de Feeling Pilates en SVG en vez de Image: los markers
                de Google Maps en Android a veces "fotografían" el contenido
                del marker antes de que una imagen raster termine de
                decodificar y queda en blanco; un SVG se dibuja de forma
                síncrona y no tiene ese problema. */}
            <Svg width={22} height={16} viewBox="0 0 100 64">
              <Circle cx={50} cy={18} r={17} fill={colors.gold} />
              <Path
                d="M14 36 Q50 64 86 36"
                stroke={colors.textPrimary}
                strokeWidth={13}
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
          </View>
        </Marker>
      </MapView>
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
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.gold,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.pill,
  },
});
