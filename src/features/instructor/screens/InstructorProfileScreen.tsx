import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeftIcon, StarIcon } from 'react-native-heroicons/outline';
import { obtenerPerfilInstructor } from '../api/instructores';
import { listarClasesPublico } from '@/features/classes';
import type { ClaseResponse, PerfilInstructorResponse } from '@/api/types';
import { INSTRUCTOR_META, stripCon } from '@/data/clases';
import { ACTIVITY_META } from '@/utils/activityMeta';
import { SocialLinksRow } from '../components/SocialLinksRow';
import { colors, commonStyles, fontFamily, fontSize, fontWeight, radius } from '@/theme';
import {
  WEEKDAY_LABELS,
  addDays,
  formatHora,
  formatIsoDate,
  mondayOf,
  startOfDay,
  weekdayIndexMondayFirst,
} from '@/utils/date';
import type { RootStackParamList } from '@/app/navigation/types';

const avatarPlaceholder = require('@/assets/images/avatar-placeholder.jpg');

type Props = NativeStackScreenProps<RootStackParamList, 'InstructorProfile'>;

export function InstructorProfileScreen({ navigation, route }: Props) {
  const { instructora } = route.params;
  const meta = INSTRUCTOR_META[instructora];
  const name = stripCon(instructora);

  // El horario/especialidades siguen viniendo del mock local (todavía no hay
  // módulo de clases en el backend); bio, calificación, foto y redes sociales
  // sí son datos reales de la instructora y se traen del backend. Si falla o
  // la instructora no tiene usuarioId, se mantiene lo que ya había en el mock.
  const [perfil, setPerfil] = useState<PerfilInstructorResponse | null>(null);
  const [refrescando, setRefrescando] = useState(false);

  useEffect(() => {
    if (!meta?.usuarioId) return;
    let cancelled = false;
    obtenerPerfilInstructor(meta.usuarioId)
      .then(data => {
        if (!cancelled) setPerfil(data);
      })
      .catch(() => {
        // Sin conexión o instructora sin perfil todavía: nos quedamos con el mock.
      });
    return () => {
      cancelled = true;
    };
  }, [meta?.usuarioId]);

  const bio = perfil?.sobreSuClase ?? meta?.bio;
  const rating = perfil?.calificacionPromedio ?? meta?.rating;
  const redesSociales = perfil
    ? {
        instagramUrl: perfil.instagramUrl ?? undefined,
        facebookUrl: perfil.facebookUrl ?? undefined,
        tiktokUrl: perfil.tiktokUrl ?? undefined,
        whatsappUrl: perfil.whatsappUrl ?? undefined,
      }
    : meta?.redesSociales;

  const [clasesSemana, setClasesSemana] = useState<ClaseResponse[]>([]);

  useEffect(() => {
    if (!meta?.usuarioId) return;
    let cancelled = false;
    const weekStart = mondayOf(startOfDay(new Date()));
    const weekEnd = addDays(weekStart, 6);
    listarClasesPublico(formatIsoDate(weekStart), formatIsoDate(weekEnd))
      .then(data => {
        if (!cancelled) setClasesSemana(data);
      })
      .catch(() => {
        if (!cancelled) setClasesSemana([]);
      });
    return () => {
      cancelled = true;
    };
  }, [meta?.usuarioId]);

  const handleRefresh = useCallback(async () => {
    if (!meta?.usuarioId) return;
    setRefrescando(true);
    const weekStart = mondayOf(startOfDay(new Date()));
    const weekEnd = addDays(weekStart, 6);
    try {
      const [perfilData, clases] = await Promise.all([
        obtenerPerfilInstructor(meta.usuarioId),
        listarClasesPublico(formatIsoDate(weekStart), formatIsoDate(weekEnd)),
      ]);
      setPerfil(perfilData);
      setClasesSemana(clases);
    } catch {
      // Se conserva lo ya cargado si falla el refresco.
    }
    setRefrescando(false);
  }, [meta?.usuarioId]);

  const classesThisWeek = useMemo(
    () =>
      clasesSemana
        .filter(clase => clase.instructorId === meta?.usuarioId)
        .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.horaInicio.localeCompare(b.horaInicio)),
    [clasesSemana, meta?.usuarioId],
  );

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
        <View style={styles.profileHeader}>
          <Image source={perfil?.fotoUrl ? { uri: perfil.fotoUrl } : avatarPlaceholder} style={styles.avatar} />
          <Text style={styles.name}>{name}</Text>
          {meta && rating != null && (
            <View style={styles.ratingRow}>
              <StarIcon color={colors.gold} size={16} />
              <Text style={styles.ratingText}>
                {rating} · {meta.clasesImpartidas} clases impartidas
              </Text>
            </View>
          )}
          {meta && meta.especialidades.length > 0 && (
            <View style={styles.chipsRow}>
              {meta.especialidades.map(especialidad => (
                <View key={especialidad} style={styles.chip}>
                  <Text style={styles.chipLabel}>{especialidad}</Text>
                </View>
              ))}
            </View>
          )}
          <SocialLinksRow redesSociales={redesSociales} />
        </View>

        {bio && <Text style={styles.bio}>{bio}</Text>}

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>Horarios esta semana</Text>

        {classesThisWeek.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No tiene clases programadas esta semana.</Text>
          </View>
        ) : (
          <View style={styles.scheduleList}>
            {classesThisWeek.map(clase => {
              const activity = ACTIVITY_META[clase.tipoActividadNombre];
              const fecha = new Date(`${clase.fecha}T00:00:00`);
              return (
                <Pressable
                  key={clase.id}
                  style={styles.scheduleRow}
                  onPress={() => navigation.navigate('ClassDetail', { claseId: clase.id })}>
                  <View style={styles.scheduleLeft}>
                    {activity && (
                      <View style={[styles.scheduleIconWrap, { backgroundColor: activity.color }]}>
                        <activity.Icon color={colors.background} size={14} />
                      </View>
                    )}
                    <Text style={styles.scheduleName}>{clase.tipoActividadNombre}</Text>
                  </View>
                  <Text style={styles.scheduleTime}>
                    {WEEKDAY_LABELS[weekdayIndexMondayFirst(fecha)]} · {formatHora(clase.horaInicio)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
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
  body: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 16,
  },
  profileHeader: {
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 4,
  },
  name: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  chipLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    color: colors.accent,
  },
  bio: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    lineHeight: 21,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  sectionLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    color: colors.gold,
    textTransform: 'uppercase',
  },
  scheduleList: {
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scheduleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scheduleIconWrap: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleName: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  scheduleTime: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
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
});
