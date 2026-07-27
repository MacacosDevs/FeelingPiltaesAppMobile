import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PencilSquareIcon, Squares2X2Icon } from 'react-native-heroicons/outline';
import { Avatar } from '../components/Avatar';
import { OutlineButton } from '../components/OutlineButton';
import { useAuth } from '../context/AuthContext';
import { useCourtReservations } from '../context/CourtReservationsContext';
import { resolveMediaUrl } from '../utils/media';
import { canchaById, horarioById } from '../data/canchas';
import { formatShortDate } from '../utils/date';
import { colors, fontFamily, fontSize, fontWeight, radius } from '../theme';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';

type PadelAccountNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Account'>,
  NativeStackNavigationProp<RootStackParamList>
>;

// No existe todavía un backend de paquetes de padel; se muestra como
// contenido de referencia hasta que esa API exista (mismo criterio que
// AccountScreen.tsx del lado Pilates).
const paquete = {
  nombre: '10 horas · Canchas',
  restantes: 6,
  expiraEl: '2 de abril',
  progreso: 0.6,
};

export function PadelAccountScreen() {
  const { user, logout, photoVersion } = useAuth();
  const navigation = useNavigation<PadelAccountNavigationProp>();
  const { reservations } = useCourtReservations();
  const avatarUri = resolveMediaUrl(user?.fotoUrl, photoVersion);

  // El historial se arma a partir de las canchas reservadas en esta sesión
  // (no existe todavía un backend de reservas que las persista).
  const historial = reservations
    .map(reservation => {
      const horario = horarioById(reservation.horarioId);
      const cancha = horario ? canchaById(horario.canchaId) : undefined;
      return horario && cancha ? { reservation, horario, cancha } : null;
    })
    .filter((item): item is NonNullable<typeof item> => !!item);

  return (
    <SafeAreaView style={styles.screen} edges={[]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.profileRow}>
            <View style={styles.avatarRing}>
              <Avatar uri={avatarUri} name={user?.nombre} size={60} />
            </View>
            <View style={styles.profileText}>
              <Text style={styles.name}>{user?.nombre ?? ''}</Text>
              <Text style={styles.email}>{user?.correo ?? ''}</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.editChip, pressed && styles.editChipPressed]}
            onPress={() => navigation.navigate('EditProfile')}>
            <PencilSquareIcon color={colors.accent} size={15} />
            <Text style={styles.editLink}>Editar perfil</Text>
          </Pressable>
        </View>

        <View style={styles.packageCard}>
          <Text style={styles.packageName}>{paquete.nombre}</Text>
          <Text style={styles.packageMeta}>
            <Text style={styles.packageRestantes}>{paquete.restantes} restantes</Text>
            <Text style={styles.packageExpira}> · expira el {paquete.expiraEl}</Text>
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${paquete.progreso * 100}%` }]} />
          </View>
        </View>

        <View>
          <Text style={styles.sectionLabel}>Historial</Text>
          {historial.length === 0 ? (
            <View style={styles.historyEmpty}>
              <Text style={styles.historyEmptyText}>Aún no has reservado ninguna cancha.</Text>
            </View>
          ) : (
            <View style={styles.historyCard}>
              {historial.map(({ reservation, horario, cancha }, index) => (
                <Pressable
                  key={`${reservation.horarioId}-${reservation.duracionMin}-${reservation.modalidad}`}
                  style={[
                    styles.historyRow,
                    index === historial.length - 1 && styles.historyRowLast,
                  ]}
                  onPress={() =>
                    navigation.navigate('CourtBookingConfirmation', {
                      horarioId: reservation.horarioId,
                      duracionMin: reservation.duracionMin,
                      modalidad: reservation.modalidad,
                    })
                  }>
                  <View style={styles.historyClaseRow}>
                    <View style={styles.historyIconWrap}>
                      <Squares2X2Icon color={colors.accent} size={16} />
                    </View>
                    <Text style={styles.historyClase}>{cancha.nombre}</Text>
                  </View>
                  <Text style={styles.historyFecha}>{formatShortDate(horario.fecha)}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.logoutSection}>
          <OutlineButton label="Cerrar sesión" onPress={logout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 24,
  },
  profileSection: {
    gap: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarRing: {
    padding: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  profileText: {
    flex: 1,
  },
  name: {
    fontFamily: fontFamily.display,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    textTransform: 'uppercase',
  },
  email: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    marginTop: 4,
  },
  editChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.pillBorder,
  },
  editChipPressed: {
    backgroundColor: colors.chipBackground,
  },
  editLink: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.accent,
  },
  packageCard: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.input,
    padding: 18,
    gap: 6,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },
  packageName: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.md,
    color: colors.background,
  },
  packageMeta: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
  },
  packageRestantes: {
    color: colors.accent,
    fontWeight: fontWeight.medium,
  },
  packageExpira: {
    color: colors.navInactive,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  sectionLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.smMedium,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  historyEmpty: {
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  historyEmptyText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    shadowColor: '#2b2420',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyRowLast: {
    borderBottomWidth: 0,
  },
  historyClaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historyIconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
  historyClase: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  historyFecha: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  logoutSection: {
    marginTop: 8,
  },
});
