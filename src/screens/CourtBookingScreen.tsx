import React, { useMemo, useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeftIcon, MapPinIcon, UserPlusIcon } from 'react-native-heroicons/outline';
import { PrimaryButton } from '../components/PrimaryButton';
import { OutlineButton } from '../components/OutlineButton';
import { MapPreview } from '../components/MapPreview';
import {
  DURACIONES,
  CANCHA_ADDRESSES,
  canchaById,
  canchaGeocodeQuery,
  horarioById,
  horarios,
} from '../data/canchas';
import { useCourtReservations } from '../context/CourtReservationsContext';
import { colors, fontFamily, fontSize, fontWeight, radius } from '../theme';
import { formatFullDate } from '../utils/date';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CourtBooking'>;

const MODALIDADES = ['Individual', 'Dobles'] as const;

export function CourtBookingScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { addReservation } = useCourtReservations();
  const [duracionMin, setDuracionMin] = useState(90);
  const [modalidad, setModalidad] = useState<'Individual' | 'Dobles'>('Dobles');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const activeHorario = horarioById(route.params.horarioId) ?? horarios[0];
  const cancha = canchaById(activeHorario.canchaId);
  const address = cancha ? CANCHA_ADDRESSES[cancha.ubicacion] : undefined;
  const locationLabel = cancha ? (address ? `${cancha.ubicacion} · ${address}` : cancha.ubicacion) : '';
  const geocodeQuery = cancha ? canchaGeocodeQuery(cancha.ubicacion) : undefined;

  const total = useMemo(
    () => (cancha ? Math.round((cancha.precioHora * duracionMin) / 60) : 0),
    [cancha, duracionMin],
  );

  function compartirEnlace() {
    Share.share({
      message: `Únete a mi partido de padel en ${cancha?.nombre ?? ''} · ${formatFullDate(
        activeHorario.fecha,
      )} · ${activeHorario.hora}`,
    });
  }

  function openDirections() {
    const query = encodeURIComponent(geocodeQuery ?? locationLabel);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  }

  function reservar() {
    setConfirmModalOpen(false);
    addReservation({ horarioId: activeHorario.id, duracionMin, modalidad });
    navigation.navigate('CourtBookingConfirmation', {
      horarioId: activeHorario.id,
      duracionMin,
      modalidad,
    });
  }

  if (!cancha) {
    return null;
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} hitSlop={8} onPress={() => navigation.goBack()}>
          <ChevronLeftIcon color={colors.textPrimary} size={22} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{cancha.nombre}</Text>
        <Text style={styles.subtitle}>
          {formatFullDate(activeHorario.fecha)} · {activeHorario.hora}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Duración</Text>
          <View style={styles.segmentRow}>
            {DURACIONES.map(opcion => {
              const active = opcion.minutos === duracionMin;
              return (
                <Pressable
                  key={opcion.minutos}
                  style={[styles.segment, active && styles.segmentActive]}
                  onPress={() => setDuracionMin(opcion.minutos)}>
                  <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
                    {opcion.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Modalidad</Text>
          <View style={styles.segmentRow}>
            {MODALIDADES.map(opcion => {
              const active = opcion === modalidad;
              return (
                <Pressable
                  key={opcion}
                  style={[styles.segment, active && styles.segmentActive]}
                  onPress={() => setModalidad(opcion)}>
                  <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
                    {opcion}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable style={styles.inviteRow} onPress={compartirEnlace}>
          <View style={styles.inviteTextWrap}>
            <UserPlusIcon color={colors.textMuted} size={16} />
            <Text style={styles.inviteLabel}>Invitar jugador</Text>
          </View>
          <Text style={styles.inviteLink}>Compartir enlace →</Text>
        </Pressable>

        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cancha ({duracionMin} min)</Text>
            <Text style={styles.infoValue}>${total}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabelStrong}>Total</Text>
            <Text style={styles.infoValueStrong}>${total}</Text>
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
        <PrimaryButton label="Reservar cancha" onPress={() => setConfirmModalOpen(true)} />
      </View>

      <Modal
        visible={confirmModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModalOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setConfirmModalOpen(false)}>
          <Pressable style={styles.confirmCard} onPress={() => {}}>
            <View style={styles.handle} />
            <Text style={styles.confirmTitle}>¿Reservar esta cancha?</Text>

            <View style={styles.confirmInfoList}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Cancha</Text>
                <Text style={styles.infoValue}>{cancha.nombre}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Fecha</Text>
                <Text style={styles.infoValue}>
                  {formatFullDate(activeHorario.fecha)} · {activeHorario.hora}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Duración</Text>
                <Text style={styles.infoValue}>{duracionMin} min</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Modalidad</Text>
                <Text style={styles.infoValue}>{modalidad}</Text>
              </View>
              <View style={[styles.infoRow, styles.infoRowLast]}>
                <Text style={styles.infoLabelStrong}>Total</Text>
                <Text style={styles.infoValueStrong}>${total}</Text>
              </View>
            </View>

            <View style={styles.confirmActions}>
              <View style={styles.confirmActionItem}>
                <OutlineButton label="Cancelar" onPress={() => setConfirmModalOpen(false)} />
              </View>
              <View style={styles.confirmActionItem}>
                <PrimaryButton label="Confirmar reserva" onPress={reservar} />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  title: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    marginTop: -8,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    color: colors.gold,
    textTransform: 'uppercase',
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segment: {
    flex: 1,
    height: 40,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    borderWidth: 0,
    backgroundColor: colors.textPrimary,
  },
  segmentLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  segmentLabelActive: {
    color: colors.background,
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  inviteTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inviteLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  inviteLink: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
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
  infoRowLast: {
    borderBottomWidth: 0,
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
  infoLabelStrong: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  infoValueStrong: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.md,
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
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(43, 36, 32, 0.4)',
  },
  confirmCard: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
  },
  confirmTitle: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  confirmInfoList: {
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmActionItem: {
    flex: 1,
  },
});
