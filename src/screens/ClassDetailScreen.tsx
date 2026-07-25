import React, { useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeftIcon, MapPinIcon, StarIcon } from 'react-native-heroicons/outline';
import { PrimaryButton } from '../components/PrimaryButton';
import { CapacityIndicator } from '../components/CapacityIndicator';
import { MapPreview } from '../components/MapPreview';
import { clases, INSTRUCTOR_META, SALON_ADDRESSES, isClasePast, salonGeocodeQuery, stripCon } from '../data/clases';
import { ACTIVITY_META } from '../utils/activityMeta';
import { colors, fontFamily, fontSize, fontWeight, radius } from '../theme';
import { formatFullDate } from '../utils/date';
import type { RootStackParamList } from '../navigation/types';

const avatarPlaceholder = require('../assets/images/avatar-placeholder.jpg');

type Props = NativeStackScreenProps<RootStackParamList, 'ClassDetail'>;

export function ClassDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const [reserved, setReserved] = useState(false);

  const activeClase = clases.find(clase => clase.id === route.params.claseId) ?? clases[0];
  const past = isClasePast(activeClase);

  const activity = ACTIVITY_META[activeClase.nombre];
  const instructorName = stripCon(activeClase.instructora);
  const instructorMeta = INSTRUCTOR_META[activeClase.instructora];
  const address = SALON_ADDRESSES[activeClase.sala];
  const locationLabel = address ? `${activeClase.sala} · ${address}` : activeClase.sala;
  const geocodeQuery = salonGeocodeQuery(activeClase.sala);

  function openDirections() {
    const query = encodeURIComponent(geocodeQuery ?? locationLabel);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} hitSlop={8} onPress={() => navigation.goBack()}>
          <ChevronLeftIcon color={colors.textPrimary} size={22} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>{locationLabel}</Text>
        <View style={styles.titleRow}>
          {activity && (
            <View style={[styles.titleIconWrap, { backgroundColor: activity.color }]}>
              <activity.Icon color={colors.background} size={20} />
            </View>
          )}
          <Text style={styles.title}>{activeClase.nombre.toUpperCase()}</Text>
        </View>
        <CapacityIndicator
          ocupados={activeClase.lugaresOcupados}
          capacidad={activeClase.capacidad}
          size="md"
        />

        <Pressable
          style={styles.instructorCard}
          onPress={() => navigation.navigate('InstructorProfile', { instructora: activeClase.instructora })}>
          <Image source={avatarPlaceholder} style={styles.instructorAvatar} />
          <View style={styles.instructorInfo}>
            <Text style={styles.instructorName}>{instructorName}</Text>
            {instructorMeta && (
              <View style={styles.ratingRow}>
                <StarIcon color={colors.gold} size={14} />
                <Text style={styles.ratingText}>
                  {instructorMeta.rating} · {instructorMeta.clasesImpartidas} clases impartidas
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.instructorLink}>Ver perfil →</Text>
        </Pressable>

        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha</Text>
            <Text style={styles.infoValue}>{formatFullDate(activeClase.fecha)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hora</Text>
            <Text style={styles.infoValue}>{activeClase.hora}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duración</Text>
            <Text style={styles.infoValue}>{activeClase.duracion}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Precio</Text>
            <Text style={styles.infoValue}>{activeClase.precio}</Text>
          </View>
        </View>

        {geocodeQuery ? (
          <MapPreview query={geocodeQuery} />
        ) : (
          <View style={styles.mapFallback}>
            <Text style={styles.mapFallbackText}>Ubicación exacta próximamente</Text>
          </View>
        )}

        <View style={styles.locationRow}>
          <View style={styles.locationTextWrap}>
            <MapPinIcon color={colors.textMuted} size={16} />
            <Text style={styles.locationText}>{locationLabel}</Text>
          </View>
          <Pressable onPress={openDirections}>
            <Text style={styles.directionsLink}>Cómo llegar →</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
        <PrimaryButton
          label={
            past ? 'Esta clase ya finalizó' : reserved ? 'Reservado ✓' : `Reservar clase · ${activeClase.precio}`
          }
          onPress={() => setReserved(true)}
          disabled={past || reserved}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
  },
  kicker: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  instructorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  instructorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  instructorInfo: {
    flex: 1,
    gap: 3,
  },
  instructorName: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.smMedium,
    color: colors.textMuted,
  },
  instructorLink: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    color: colors.accent,
  },
  infoList: {
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  infoValue: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  mapFallback: {
    height: 100,
    borderRadius: radius.input,
    backgroundColor: colors.chipBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapFallbackText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  locationText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  directionsLink: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.accent,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
