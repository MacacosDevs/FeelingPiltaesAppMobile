import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PencilSquareIcon } from 'react-native-heroicons/outline';
import { Avatar } from '@/components/Avatar';
import { GuestPrompt } from '../components/GuestPrompt';
import { OutlineButton } from '@/components/OutlineButton';
import { useAuth } from '@/features/auth';
import { resolveMediaUrl } from '@/utils/media';
import { ACTIVITY_META } from '@/utils/activityMeta';
import { useSportMode } from '@/context/SportModeContext';
import { useMisReservas } from '@/features/classes';
import { PadelAccountScreen } from '@/features/padel';
import { paqueteActivoDe, useMisCompras, useMisPaquetesActivos, formatPrecio } from '@/features/packages';
import { formatDayMonth, formatShortDate } from '@/utils/date';
import type { CompraResponse } from '@/api/types';
import { colors, commonStyles, fontFamily, fontSize, fontWeight, radius, shadows } from '@/theme';
import type { MainTabParamList, RootStackParamList } from '@/app/navigation/types';

type AccountNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Account'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const ESTADO_COMPRA_META: Record<CompraResponse['estado'], { label: string; color: string }> = {
  pagada: { label: 'Pagado', color: colors.spotsAvailable },
  pendiente: { label: 'Pendiente', color: colors.gold },
  fallida: { label: 'Fallido', color: colors.error },
  cancelada: { label: 'Cancelado', color: colors.error },
};

export function AccountScreen() {
  const { user, logout, photoVersion } = useAuth();
  const navigation = useNavigation<AccountNavigationProp>();
  const { sport } = useSportMode();
  const { reservas: historial, recargar: recargarReservas } = useMisReservas();
  const avatarUri = resolveMediaUrl(user?.fotoUrl, photoVersion);
  const { paquetes: paquetesActivos, recargar: recargarPaquetes } = useMisPaquetesActivos();
  const { compras, recargar: recargarCompras } = useMisCompras();
  const [refrescando, setRefrescando] = useState(false);

  function handleRefresh() {
    setRefrescando(true);
    recargarReservas();
    recargarPaquetes();
    recargarCompras();
    // Los hooks no exponen su propio estado de carga; se da tiempo a que la
    // petición vuelva antes de ocultar el indicador de refresco.
    setTimeout(() => setRefrescando(false), 600);
  }

  if (!user) {
    return (
      <SafeAreaView style={commonStyles.screen} edges={[]}>
        <GuestPrompt
          title="Inicia sesión para ver tu cuenta"
          subtitle="Consulta tus paquetes, tu historial de reservas y edita tu perfil."
          onLogin={() => navigation.navigate('Auth', { mode: 'login' })}
          onRegister={() => navigation.navigate('Auth', { mode: 'register' })}
        />
      </SafeAreaView>
    );
  }

  if (sport === 'padel') {
    return <PadelAccountScreen />;
  }

  return (
    <SafeAreaView style={commonStyles.screen} edges={[]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={handleRefresh} tintColor={colors.accent} />
        }>
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

        {(['pilates', 'bacufit'] as const).map(categoria => {
          const paquete = paqueteActivoDe(paquetesActivos, categoria);
          if (!paquete) return null;

          const inicio = new Date(paquete.fechaInicio).getTime();
          const expiracion = new Date(paquete.fechaExpiracion).getTime();
          const progreso =
            expiracion > inicio
              ? Math.min(1, Math.max(0, (Date.now() - inicio) / (expiracion - inicio)))
              : 0;

          return (
            <View key={categoria} style={styles.packageCard}>
              <Text style={styles.packageName}>{paquete.nombre}</Text>
              <Text style={styles.packageMeta}>
                <Text style={styles.packageRestantes}>
                  Vence el {formatDayMonth(new Date(paquete.fechaExpiracion))}
                </Text>
              </Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progreso * 100}%` }]} />
              </View>
            </View>
          );
        })}

        <View>
          <Text style={styles.sectionLabel}>Historial</Text>
          {historial.length === 0 ? (
            <View style={styles.historyEmpty}>
              <Text style={styles.historyEmptyText}>Aún no has reservado ninguna clase.</Text>
            </View>
          ) : (
            <View style={styles.historyCard}>
              {historial.map((reserva, index) => {
                const meta = ACTIVITY_META[reserva.clase.tipoActividadNombre];
                const Icon = meta?.Icon;
                return (
                  <Pressable
                    key={reserva.id}
                    style={[
                      styles.historyRow,
                      index === historial.length - 1 && styles.historyRowLast,
                    ]}
                    onPress={() => navigation.navigate('ClassDetail', { claseId: reserva.clase.id })}>
                    <View style={styles.historyClaseRow}>
                      {Icon && (
                        <View style={[styles.historyIconWrap, { backgroundColor: `${meta.color}1f` }]}>
                          <Icon color={meta.color} size={16} />
                        </View>
                      )}
                      <Text style={styles.historyClase}>{reserva.clase.tipoActividadNombre}</Text>
                    </View>
                    <Text style={styles.historyFecha}>
                      {formatShortDate(new Date(`${reserva.clase.fecha}T00:00:00`))}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View>
          <Text style={styles.sectionLabel}>Historial de pagos</Text>
          {compras.length === 0 ? (
            <View style={styles.historyEmpty}>
              <Text style={styles.historyEmptyText}>Aún no has comprado ningún paquete.</Text>
            </View>
          ) : (
            <View style={styles.historyCard}>
              {compras.map((compra, index) => {
                const estadoMeta = ESTADO_COMPRA_META[compra.estado];
                return (
                  <View
                    key={compra.id}
                    style={[
                      styles.historyRow,
                      index === compras.length - 1 && styles.historyRowLast,
                    ]}>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.historyClase}>{compra.paqueteNombre}</Text>
                      <Text style={styles.paymentFecha}>
                        {formatDayMonth(new Date(compra.creadoEn))} ·{' '}
                        {formatPrecio(compra.montoCentavos)}
                      </Text>
                    </View>
                    <Text style={[styles.paymentEstado, { color: estadoMeta.color }]}>
                      {estadoMeta.label}
                    </Text>
                  </View>
                );
              })}
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
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.lg + 2,
    color: colors.textPrimary,
  },
  email: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    marginTop: 2,
  },
  editChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.pillBorder,
    backgroundColor: colors.surface,
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
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 6,
    ...shadows.card,
  },
  packageName: {
    fontFamily: fontFamily.display,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.md + 2,
    color: colors.textPrimary,
  },
  packageMeta: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
  },
  packageRestantes: {
    color: colors.accent,
    fontWeight: fontWeight.medium,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.chipBackground,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  sectionLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.xs + 2,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  historyEmpty: {
    borderRadius: radius.card,
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
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    ...shadows.card,
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
  paymentInfo: {
    gap: 2,
  },
  paymentFecha: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.smMedium,
    color: colors.textMuted,
  },
  paymentEstado: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
  },
  logoutSection: {
    marginTop: 8,
  },
});
