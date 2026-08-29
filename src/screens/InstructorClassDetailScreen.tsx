import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { CheckCircleIcon } from 'react-native-heroicons/solid';
import { PrimaryButton } from '../components/PrimaryButton';
import { CapacityIndicator } from '../components/CapacityIndicator';
import { Avatar } from '../components/Avatar';
import { useAuth } from '@/features/auth';
import { listarAsistentes, obtenerClase } from '../api/clases';
import type { ClaseReservaResponse, ClaseResponse } from '../api/types';
import { ACTIVITY_META } from '../utils/activityMeta';
import { colors, commonStyles, fontFamily, fontSize, fontWeight, radius } from '../theme';
import { formatFullDate, formatHora } from '../utils/date';
import type { RootStackParamList } from '@/app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'InstructorClassDetail'>;

export function InstructorClassDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [activeClase, setActiveClase] = useState<ClaseResponse | null>(null);
  const [asistentes, setAsistentes] = useState<ClaseReservaResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  // Se recarga cada vez que la pantalla gana foco (no solo al montar), para
  // reflejar los check-ins hechos en InstructorClassCheckInScreen al volver.
  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      let cancelado = false;
      setCargando(true);
      Promise.all([obtenerClase(route.params.claseId), listarAsistentes(token, route.params.claseId)])
        .then(([clase, lista]) => {
          if (!cancelado) {
            setActiveClase(clase);
            setAsistentes(lista);
          }
        })
        .catch(() => {
          if (!cancelado) {
            setActiveClase(null);
            setAsistentes([]);
          }
        })
        .finally(() => {
          if (!cancelado) setCargando(false);
        });
      return () => {
        cancelado = true;
      };
    }, [token, route.params.claseId]),
  );

  async function handleRefresh() {
    if (!token) return;
    setRefrescando(true);
    try {
      const [clase, lista] = await Promise.all([
        obtenerClase(route.params.claseId),
        listarAsistentes(token, route.params.claseId),
      ]);
      setActiveClase(clase);
      setAsistentes(lista);
    } catch {
      // Se conserva lo ya cargado si falla el refresco.
    }
    setRefrescando(false);
  }

  if (cargando || !activeClase) {
    return (
      <SafeAreaView style={[commonStyles.screen, styles.center]} edges={['top']}>
        {cargando ? (
          <ActivityIndicator color={colors.accent} />
        ) : (
          <Text style={styles.infoValue}>No se encontró esta clase.</Text>
        )}
      </SafeAreaView>
    );
  }

  const activity = ACTIVITY_META[activeClase.tipoActividadNombre];
  const presentCount = asistentes.filter(a => a.estado === 'ASISTIO').length;

  return (
    <SafeAreaView style={commonStyles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} hitSlop={8} onPress={() => navigation.goBack()}>
          <ChevronLeftIcon color={colors.textPrimary} size={22} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={handleRefresh} tintColor={colors.accent} />
        }>
        <Text style={styles.kicker}>{activeClase.salonNombre}</Text>
        <View style={styles.titleRow}>
          {activity && (
            <View style={[styles.titleIconWrap, { backgroundColor: activity.color }]}>
              <activity.Icon color={colors.background} size={20} />
            </View>
          )}
          <Text style={styles.title}>{activeClase.tipoActividadNombre.toUpperCase()}</Text>
        </View>
        <CapacityIndicator ocupados={activeClase.lugaresOcupados} capacidad={activeClase.capacidad} size="md" />

        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha</Text>
            <Text style={styles.infoValue}>{formatFullDate(new Date(`${activeClase.fecha}T00:00:00`))}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>Hora</Text>
            <Text style={styles.infoValue}>
              {formatHora(activeClase.horaInicio)} - {formatHora(activeClase.horaFin)}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>Lista de inscritos</Text>
          <Text style={styles.sectionCount}>
            {presentCount}/{asistentes.length} presentes
          </Text>
        </View>

        {asistentes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nadie se ha inscrito a esta clase todavía.</Text>
          </View>
        ) : (
          <View style={styles.attendeeList}>
            {asistentes.map((asistente, index) => {
              const presente = asistente.estado === 'ASISTIO';
              return (
                <View
                  key={asistente.id}
                  style={[
                    styles.attendeeRow,
                    presente && styles.attendeeRowPresent,
                    index === asistentes.length - 1 && styles.attendeeRowLast,
                  ]}>
                  <Avatar name={asistente.clienteNombre} size={36} />
                  <Text style={[styles.attendeeName, presente && styles.attendeeNamePresent]}>
                    {asistente.clienteNombre}
                  </Text>
                  {presente && <CheckCircleIcon color={colors.spotsAvailable} size={20} />}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
        <PrimaryButton
          label="Pasar lista por código QR"
          onPress={() => navigation.navigate('InstructorClassCheckIn', { claseId: activeClase.id })}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  center: {
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    color: colors.gold,
    textTransform: 'uppercase',
  },
  sectionCount: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  attendeeList: {
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  attendeeRowLast: {
    borderBottomWidth: 0,
  },
  attendeeRowPresent: {
    backgroundColor: 'rgba(122, 143, 111, 0.12)',
  },
  attendeeName: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    flex: 1,
  },
  attendeeNamePresent: {
    fontWeight: fontWeight.medium,
    color: colors.spotsAvailable,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  emptyStateText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
