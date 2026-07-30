import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckIcon } from 'react-native-heroicons/outline';
import QRCode from 'react-native-qrcode-svg';
import { canchaById, horarioById, horarios } from '../data/canchas';
import { useAuth } from '../context/AuthContext';
import { colors, commonStyles, fontFamily, fontSize, fontWeight, radius } from '../theme';
import { formatFullDate } from '../utils/date';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CourtBookingConfirmation'>;

export function CourtBookingConfirmationScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const activeHorario = horarioById(route.params.horarioId) ?? horarios[0];
  const cancha = canchaById(activeHorario.canchaId);
  const qrValue = `FEELINGPADEL|${activeHorario.id}|${user?.correo ?? ''}`;

  return (
    <SafeAreaView style={commonStyles.screen} edges={['top']}>
      <View style={[styles.body, { paddingBottom: 16 + insets.bottom }]}>
        <View style={styles.checkCircle}>
          <CheckIcon color={colors.background} size={28} />
        </View>
        <Text style={styles.title}>Cancha reservada</Text>

        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cancha</Text>
            <Text style={styles.infoValue}>{cancha?.nombre}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha</Text>
            <Text style={styles.infoValue}>
              {formatFullDate(activeHorario.fecha)} · {activeHorario.hora}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duración</Text>
            <Text style={styles.infoValue}>{route.params.duracionMin} min</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>Modalidad</Text>
            <Text style={styles.infoValue}>{route.params.modalidad}</Text>
          </View>
        </View>

        <View style={styles.qrCard}>
          <Text style={styles.qrText}>
            Muestra este código en la recepción para registrar tu asistencia.
          </Text>
          <Pressable style={styles.qrWrap} onPress={() => setQrModalOpen(true)}>
            <QRCode value={qrValue} size={140} />
          </Pressable>
          <Text style={styles.qrHint}>Toca para ampliar</Text>
        </View>

        <Pressable
          style={styles.link}
          onPress={() => navigation.navigate('Main', { screen: 'Account' })}>
          <Text style={styles.linkLabel}>Ver mis reservas</Text>
        </Pressable>
      </View>

      <Modal
        visible={qrModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setQrModalOpen(false)}>
        <Pressable style={styles.qrBackdrop} onPress={() => setQrModalOpen(false)}>
          <View style={styles.qrModalCard}>
            <QRCode value={qrValue} size={260} />
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 60,
    gap: 20,
  },
  checkCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  infoList: {
    width: '100%',
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
  qrCard: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
    padding: 20,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  qrText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    textAlign: 'center',
  },
  qrWrap: {
    padding: 12,
    borderRadius: radius.input,
    backgroundColor: colors.background,
  },
  qrHint: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  qrBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(43, 36, 32, 0.7)',
  },
  qrModalCard: {
    padding: 24,
    borderRadius: radius.input,
    backgroundColor: colors.background,
  },
  link: {
    marginTop: 'auto',
  },
  linkLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.accent,
  },
});
